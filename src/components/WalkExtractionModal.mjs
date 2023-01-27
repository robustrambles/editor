import { css } from "../deps/goober.mjs";
import Modal from "./Modal.mjs"
import { debounce } from "../services/helpers.mjs";

const styles = {
    highlights: css`
        .highlight-blue {
            background-color: blue;
        }
    `,
    footer: css`
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1055;
        .wrapper {
            max-width: var(--tblr-modal-width);
            width: auto;
            margin-right: auto;
            margin-left: auto;
        }
        .modal-footer {
            margin: 0 auto;
            background: white;
            padding: 16px;
        }
    `
};

export default {
    props: ['show', 'html'],
    emits: ['update:show', 'submit'],
    components: { Modal },
    data: () => ({ selectionChangeHandler: null, showOptions: false }),
    created() {
        this.selectionChangeHandler = debounce(this.handleSelection.bind(this));
        document.addEventListener('selectionchange', this.selectionChangeHandler, false);
    },
    unmounted() {
        document.removeEventListener('selectionchange', this.selectionChangeHandler);
    },
    template: /* html */`
        <Modal
            title="Extract walk"
            :show="show"
            @update:show="(value) => $emit('update:show', value)">
            <div class="${styles.highlights}" v-html="html" ref="walkContent"></div>
            <template #footer="{ close }">
                <Teleport to="#teleport-root">
                    <div class="${styles.footer}">
                        <div class="wrapper modal-lg">
                            <div class="modal-footer" v-if="showOptions">
                                <button type="button" class="btn btn-blue" @click="() => handleHighlight('series')">Walk series</button>
                                <button type="button" class="btn btn-purple" @click="close">Walk title</button>
                                <button type="button" class="btn btn-red" @click="close">Walk subtitle</button>
                                <button type="button" class="btn btn-yellow" @click="close">Walk details</button>
                                <button type="button" class="btn btn-green" @click="close">Walk descriptions</button>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn me-auto" @click="close">Close</button>
                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                            </div>
                        </div>
                    </div>
                </Teleport>
            </template>
        </Modal>
    `,
    methods: {
        async handleSelection() {
            if (this.showOptions) {
                await this.$nextTick();
                await this.$nextTick();
                await this.$nextTick();
            }
            const selection = window.getSelection();
            if (!this.$refs.walkContent) return;
            this.showOptions = !selection.isCollapsed && this.$refs.walkContent.contains(selection.anchorNode);
        },
        handleHighlight(type) {
            const selection = window.getSelection();
            if (!this.$refs.walkContent) return;
            let startElement = selection.anchorNode;
            while(startElement.parentElement && startElement.parentElement !== this.$refs.walkContent) {
                startElement = startElement.parentElement;
            }
            let endElement = selection.focusNode;
            while(endElement.parentElement && endElement.parentElement !== this.$refs.walkContent) {
                endElement = endElement.parentElement;
            }
            const contentChildren = Array.from(this.$refs.walkContent.children);
            const startIndex = contentChildren.indexOf(startElement);
            const endIndex = contentChildren.indexOf(endElement);
            const children = contentChildren.slice(startIndex, endIndex + 1);
            children.forEach(node => node.classList.add('highlight-blue'));
        }
    }
}