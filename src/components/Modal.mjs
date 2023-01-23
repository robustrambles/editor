import { css } from "../deps/goober.mjs"

const styles = css`
    display: block;
    &:not([class*="v-"]) {
        opacity: 1;
    }
`;

export default {
    props: ['show', 'title'],
    emits: ['update:show'],
    template: /* html */`
    <Teleport to="#teleport-root">
        <Transition>
            <div class="modal modal-blur fade ${styles}" v-if="show" tabindex="-1" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <slot name="header" :close="closeModal">
                            <div class="modal-header">
                                <h5 class="modal-title">{{title}}</h5>
                                <button type="button" class="btn-close" @click="$emit('update:show', false)" aria-label="Close"></button>
                            </div>
                        </slot>
                        <slot name="body" :close="closeModal">
                            <div class="modal-body">
                                <slot :close="closeModal"></slot>
                            </div>
                        </slot>
                        <slot name="footer" :close="closeModal"></slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>`,
    methods: {
        closeModal() {
            this.$emit('update:show', false);
        }
    }
}