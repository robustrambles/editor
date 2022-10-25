import {css} from "../deps/goober.mjs";
import mammoth from "../deps/mammoth.mjs";
import { reactive } from "../deps/vue.mjs";

const styles = css`
    .card-body > * {
        transition: 0.125s opacity ease-in-out !important;
    }

    .card-body.dragover > * {
        opacity: 0 !important;
    }

    .card-body.dragover::after {
        content: '+';
        font-size: 100px;
        position: absolute;
        top: 0;
        left: calc(50% - 50px);
    }
`;

const toTitleCase = (str) => str.replace(/\s+/g, ' ').split(' ').map(word => {
    const matches = word.match(/(.*?)([A-Za-z])(.+?)$/);
    if (matches === null) return word;
    const [_, pre, capital, rest] = matches;
    return pre + capital.toUpperCase() + rest.toLowerCase();
}).join(' ');

const grabWalkData = async (arrayBuffer) => {
    const { value: walkHtml } = await mammoth.convertToHtml({ arrayBuffer });
    const dummyDomRoot = document.createElement('div');
    dummyDomRoot.innerHTML = walkHtml;
    console.log(walkHtml);
    const [title, ...subtitleArr] = Array.from(dummyDomRoot.querySelectorAll('h2')).map(title => title.textContent);
    const details = Array.from(dummyDomRoot.querySelectorAll('h3')).map((detail, id) => {
        const [name, ...valueArr] = detail.textContent.trim().split(':');
        return { id: Date.now() + '' + id, name: toTitleCase(name), value: valueArr.join(':').trim() }
    });
    const content = dummyDomRoot.querySelectorAll('h3:last-of-type ~ *');
    console.log(title, subtitleArr, details, content);
}

const walk = reactive({ title: '', slug: '', subtitle: '', details: [{ id: Date.now(), name: '', value: '' }], portraitMap: false, content: '' });

export default {
    data: () => ({ walk, dragover: false }),
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            Hello, World!
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body ${styles}">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card" @dragover.prevent="dragover = true" @dragenter.prevent="dragover = true" @dragleave.prevent="dragover = false" @drop.prevent="handleDroppedFile">
                            <div class="card-header">
                                <h3 class="card-title">Hello, World!</h3>
                            </div>
                            <div class="card-body" :class="{ dragover }">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Details</label>
                                            <div class="row g-2 mb-3" v-for="detail in walk.details" :key="detail.id">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Name" v-model="detail.name" />
                                                </div>
                                                <div class="col-7">
                                                    <textarea class="form-control" rows="1" placeholder="Information" v-model="detail.value"></textarea>
                                                </div>
                                                <div class="col-1">
                                                    <button class="btn btn-icon" aria-label="Remove row" @click="removeDetail(detail.id)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="d-flex justify-content-center">
                                                <button class="btn btn-icon" @click="walk.details.push({ id: Date.now(), name: '', value: '' })">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                                    </svg>
                                                </button>
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
    methods: {
        removeDetail(id) {
            this.walk.details.splice(this.walk.details.findIndex(({ id: needleId }) => needleId === id), 1);
        },
        async handleDroppedFile(event) {
            this.dragover = false;
            if ('dataTransfer' in event) {
                const { dataTransfer: { files } } = event;
                if (files[0].type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return;
                grabWalkData(await files[0].arrayBuffer());
            }
        }
    },
}