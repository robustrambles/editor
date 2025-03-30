import mammoth from "../deps/mammoth.mjs";
import TurndownService from "../deps/turndown.mjs";
import { diff_match_patch, DIFF_EQUAL } from "../deps/diff-match-patch.mjs";
import { fuzzySearch } from "../deps/fuzzyhighlight.mjs";

const dmp = new diff_match_patch();

import Alert from "../components/Alert.mjs";
import {css} from "../deps/goober.mjs";
import { getUid } from "../services/helpers.mjs";
import { getWalkData } from "../services/openai.mjs";
import { importedWalks } from "../services/walks.mjs";

const styles = {
    uploadCard: css`
        & {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #838383;
            border: 3px dashed white;
            margin: 1em;
            border-radius: 1em;
            min-height: 138px;
            transition: 0.5s border-color ease-in-out;

            &.dragover {
                border-color: #838383;
            }

            &.uploading .card-body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
        }
    
        svg {
            width: 4em;
            height: 4em;
        }
    `
};

const neutralise_non_alphanumeric_diff = (diff) => diff[1].replace(/[^a-zA-Z0-9]/g, "").length === 0 ? { 0: DIFF_EQUAL, 1: diff[1] } : diff;

const determine_changes = (walk, originalContent) => {
    const originalDescriptionStartSearch = fuzzySearch(walk.content.slice(0, 100), originalContent);
    const originalDescriptionEndSearch = fuzzySearch(walk.content.slice(-100), originalContent);
    // const originalDescription = originalContent.slice(originalDescriptionStartSearch.indexes[0].start, originalDescriptionEndSearch.indexes[0].end);
    const preContent = walk.title + walk.subtitle + walk.details.map(detail => `${detail.key}: ${detail.value}`).join("");
    const preContentPrefix = preContent.length;
    const roughContent = originalContent.slice(Math.max(originalDescriptionStartSearch.indexes[0].start - (preContentPrefix * 1.3), 0), originalDescriptionEndSearch.indexes.at(-1).end);
    const actualContentStart = fuzzySearch(walk.title, roughContent);
    const originalWalk = roughContent.slice(actualContentStart.indexes[0].start);

    // Now we have the walk content, we can find and diff each part
    const originalTitleSearch = fuzzySearch(walk.title, originalWalk);
    const originalTitle = originalWalk.slice(originalTitleSearch.indexes[0].start, originalTitleSearch.indexes.at(-1).end);
    const originalSubtitleSearch = fuzzySearch(walk.subtitle, originalWalk);
    const originalSubtitle = originalWalk.slice(originalSubtitleSearch.indexes[0].start, originalSubtitleSearch.indexes.at(-1).end);
    const originalDetails = walk.details.map(detail => {
        const search = fuzzySearch(detail.value, originalWalk);
        return originalWalk.slice(search.indexes[0].start, search.indexes.at(-1).end);
    });
    const originalDescriptionSearch = fuzzySearch(walk.content.slice(0, 200), originalWalk);
    // const originalDescription = originalWalk.slice(originalDescriptionSearch.indexes[0].start).replaceAll("the", "teh");
    const originalDescription = originalWalk.slice(originalDescriptionSearch.indexes[0].start);

    // And then diff each part
    const titleDiffs = dmp.diff_main(walk.title, originalTitle).map(neutralise_non_alphanumeric_diff);
    const subtitleDiffs = dmp.diff_main(walk.subtitle, originalSubtitle).map(neutralise_non_alphanumeric_diff);
    const detailDiffs = walk.details.map((detail, index) => dmp.diff_main(detail.value, originalDetails[index]).map(neutralise_non_alphanumeric_diff));
    const contentDiffs = dmp.diff_main(walk.content, originalDescription).map(neutralise_non_alphanumeric_diff);
    [titleDiffs, subtitleDiffs, ...detailDiffs, contentDiffs].forEach(diff => dmp.diff_cleanupSemantic(diff));

    // And then produce patches for each part
    const titlePatch = dmp.patch_make(titleDiffs);
    const subtitlePatch = dmp.patch_make(subtitleDiffs);
    const detailPatches = walk.details.map((detail, index) => dmp.patch_make(detailDiffs[index]));
    const contentPatch = dmp.patch_make(contentDiffs);

    const changes = {};

    if (titlePatch.length > 0) {
        changes.title = titlePatch;
    }

    if (subtitlePatch.length > 0) {
        changes.subtitle = subtitlePatch;
    }

    if (detailPatches.some(patch => patch.length > 0)) {
        changes.details = detailPatches;
    }

    if (contentPatch.length > 0) {
        changes.content = contentPatch;
        console.log({ before: walk.content, patched: dmp.patch_apply(contentPatch, walk.content) });
    }
    
    return changes;
}

export default {
    name: 'UploadWalks',
    inject: ['router'],
    components: { Alert },
    data: () => ({ dragover: false, uploading: null, importedWalks, errors: new Set() }),
    mounted() {
        this.importedWalks.forEach(({ walk, originalContent }) => console.log(determine_changes(walk, originalContent)));
    },
    methods: {
        async handleDroppedFile(event) {
            this.dragover = false;
            if ('dataTransfer' in event) {
                const { dataTransfer: { files } } = event;
                for (let fileId = 0; fileId < files.length; fileId++) {
                    const file = files[fileId];
                    this.uploading = { current: fileId, total: files.length };
                    let content = null;
                    const arrayBuffer = await file.arrayBuffer();
                    if (file.type === "application/msword") {
                        const response = await fetch('/api/parse-legacy-doc', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/octet-stream',
                            },
                            body: arrayBuffer
                        });
                    
                        if (!response.ok) {
                            this.errors.add({
                                heading: "Legacy data extraction error",
                                message: `Error extracting data from legacy Word document "${file.name}".`
                            });
                            continue;
                        }
                    
                        const data = await response.json();
                        content = data.content;
                    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                        const { value: walkHtml } = await mammoth.convertToHtml({ arrayBuffer });
                        const turndownService = new TurndownService()
                        content = turndownService.turndown(walkHtml)
                        console.log(content);
                    } else {
                        this.errors.add({
                            heading: "Unsupported file type",
                            message: `"${file.name}" is not a supported file type. Please upload a .docx or .doc file.`
                        });
                        continue;
                    }

                    if (content === null) {
                        this.errors.add({
                            heading: "Data extraction error",
                            message: `"${file.name}" was not correctly parsed.`
                        });
                        continue;
                    }

                    try {
                        const extractedWalkData = await getWalkData(content);
                        if (extractedWalkData.length === 0) {
                            this.errors.add({
                                heading: "No walk data found",
                                message: `There were no walks found in "${file.name}".`
                            });
                            continue;
                        }
                        extractedWalkData.forEach(walk => {
                            const id = getUid();
                            this.importedWalks.set(id, { id, walk, originalContent: content, changes: determine_changes(walk, content) });
                        });
                        console.log(this.importedWalks);
                    } catch (error) {
                        console.debug(error);
                        this.errors.add({
                            heading: "Data extraction error",
                            message: `Error extracting data from "${file.name}".`
                        });
                        continue;
                    }
                }
            }
            this.uploading = null;
        },
    },
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            Upload walks
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body">
            <div class="container-xl">
                <Alert v-for="error in errors" :key="error" :heading="error.heading" level="danger" :dismissable="true" @dismiss="errors.delete(error)">
                    {{error.message}}
                </Alert>
                <div class="row row-cards">
                    <div class="col-12">
                        <div v-if="uploading === null" class="card" @dragover.prevent="dragover = true" @dragenter.prevent="dragover = true" @dragleave.prevent="dragover = false" @drop.prevent="handleDroppedFile">
                            <div class="card-body ${styles.uploadCard}" :class="{ dragover }">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-upload"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
                                <p v-if="!dragover">Drag and drop a file here or click to import</p>
                                <p v-else>Drop the file to import</p>
                            </div>
                        </div>
                        <div v-else class="card uploading ${styles.uploadCard}">
                            <div class="card-body">
                                <progress class="progress" :max="1" :value="(uploading.current + 1) / (uploading.total + 1)"></progress>
                                <p>Uploading {{uploading.current + 1}} of {{uploading.total}}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12" v-if="importedWalks.size > 0">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Ready to upload</h3>
                            </div>
                            <div class="card-body">
                                <div class="row row-cards">
                                    <div class="col-md-6 col-lg-3" v-for="[key, { id, walk }] in importedWalks" :key="walk.id">
                                        <div class="card">
                                           <div class="card-body">
                                                <h3 class="card-title"><a :href="router.getPath('CreateWalk', { importId: id })">{{walk.title}}</a></h3>
                                                <h3 class="card-title card-subtitle">{{walk.subtitle}}</h3>
                                                <div>{{walk.details.length}} details | {{walk.content.length}} words</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
}