import { css } from "../deps/goober.mjs";
import Modal from "./Modal.mjs"
import { debounce } from "../services/helpers.mjs";

const styles = {
    footer: css`
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1055;
        .modal-footer {
            width: 50%;
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
            <div v-html="html" ref="walkContent"></div>
            <template #footer="{ close }">
                <Teleport to="#teleport-root">
                    <div class="${styles.footer}">
                        <div class="modal-footer">
                            {{showOptions}}
                            <button type="button" class="btn me-auto" @click="close">Close</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                        </div>
                    </div>
                </Teleport>
            </template>
        </Modal>
    `,
    methods: {
        handleSelection() {
            const selection = window.getSelection();
            if (!this.$refs.walkContent) return;
            this.showOptions = !selection.isCollapsed && this.$refs.walkContent.contains(selection.anchorNode);
        }
    }
}