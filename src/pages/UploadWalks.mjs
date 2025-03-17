import mammoth from "../deps/mammoth.mjs";
import TurndownService from "../deps/turndown.mjs";

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

async function extractWalkData(file) {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // POST the ArrayBuffer to the API
    const response = await fetch('/api/llm-parse-walk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        body: arrayBuffer
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return the response
    return response.json();
}

export default {
    name: 'UploadWalks',
    components: { Alert },
    data: () => ({ dragover: false, uploading: null, importedWalks, errors: new Set() }),
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
                            this.importedWalks.set(id, { id, ...walk });
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
                                    <div class="col-md-6 col-lg-3" v-for="[key, walk] in importedWalks" :key="walk.id">
                                        <div class="card">
                                           <div class="card-body">
                                                <h3 class="card-title">{{walk.title}}</h3>
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