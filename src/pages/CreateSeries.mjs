import Preview from "../components/Preview.mjs";
import RichTextEditor from "../components/RichTextEditor.mjs";
import { EMPTY_MOBILEDOC } from "../deps/mobiledoc.mjs";
import { reactive } from "../deps/vue.mjs";

const VIEW_STATES = {
    READY: 'READY',
    SUBMITTING: 'SUBMITTING',
    SUBMITTED: 'SUBMITTED',
};

const series = reactive({ seriesTitle: '', content: EMPTY_MOBILEDOC, });

export default {
    components: { Preview, RichTextEditor },
    data: () => ({ series, state: VIEW_STATES.READY }),
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            Add series
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body" v-if="state === '${VIEW_STATES.SUBMITTED}'">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <p>The walk series has been created!</p>
                                        <p>Wait a little while and it will be available to add walks to.</p>
                                        <button class="btn btn-primary ms-auto" @click="resetAddSeries">Add another series</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body" v-else>
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Series title</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Title" v-model="series.seriesTitle" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-label">Series introduction</div>
                                            <RichTextEditor placeholder="Write..." v-model="series.content" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <div class="d-flex">
                                    <button class="btn btn-primary ms-auto" :disabled="state === '${VIEW_STATES.SUBMITTING}'" @click="submitSeries">{{state === '${VIEW_STATES.READY}' ? 'Upload series' : 'Uploading...'}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    methods: {
        async submitSeries() {
            const { series } = this;
            this.state = VIEW_STATES.SUBMITTING;
            await fetch('/api/upload-series', {
                method: 'POST',
                body: JSON.stringify(series),
                credentials: 'same-origin'
            });
            this.state = VIEW_STATES.SUBMITTED;
        },
        resetAddSeries() {
            window.location.reload();
        }
    },
}