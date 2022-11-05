import { css } from "../deps/goober.mjs";
import { Editor, EMPTY_MOBILEDOC } from "../deps/mobiledoc.mjs";
import { debounce, pace } from "../services/helpers.mjs";

const styles = css`
    position: relative;

    .mobiledoc-toolbar {
        position: absolute;
        top: 0;
    }

    .editor {
        overflow: auto;
        resize: vertical;
        padding-top: 52px;
    }

    .editor:focus {
        
    }
`;

export default {
    props: ['options', 'placeholder', 'modelValue'],
    emits: ['update:modelValue'],
    data: () => ({ editor: null, toolbar: { bold: false, italic: false, underline: false } }),
    template: `<div class="wrapper ${styles}">
        <div class="editor form-control" ref="editor"></div>
        <div class="mobiledoc-toolbar">
            <div class="btn-group w-100">
                <button class="btn btn-icon" :class="{ 'btn-primary': toolbar.bold }" aria-label="Toggle bold formatting" @click="toggleBold">
                    <!-- Download SVG icon from http://tabler-icons.io/i/bold -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z"></path><path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7"></path></svg>
                </button>
                <button class="btn btn-icon" :class="{ 'btn-primary': toolbar.italic }" aria-label="Toggle italic formatting" @click="toggleItalic">
                    <!-- Download SVG icon from http://tabler-icons.io/i/italic -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="11" y1="5" x2="17" y2="5"></line><line x1="7" y1="19" x2="13" y2="19"></line><line x1="14" y1="5" x2="10" y2="19"></line></svg>
                </button>
                <button class="btn btn-icon" :class="{ 'btn-primary': toolbar.underline }" aria-label="Toggle underline formatting" @click="toggleUnderline">
                    <!-- Download SVG icon from http://tabler-icons.io/i/underline -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 5v5a5 5 0 0 0 10 0v-5"></path><path d="M5 19h14"></path></svg>
                </button>
        </div>
        </div>
    </div>`,
    mounted() {
        const options = this.options || {};
        const { placeholder, autofocus, modelValue } = this;
        const mergedOptions = Object.assign({}, {
            // Defaults
            placeholder: '',
            autofocus: false,
            mobiledoc: EMPTY_MOBILEDOC,
        },
        // Options object overrides defaults
        options,
        // Props override options object
        {
            placeholder,
            autofocus,
            mobiledoc: modelValue,
        });
        this.editor = new Editor(mergedOptions);
        this.editor.postDidChange(() => this.$emit('update:modelValue', this.editor.serialize()));
        console.log(this.editor);
        const pacedToolbarStateHandler = pace(this.updateToolbarState.bind(this));
        this.editor.cursorDidChange(() => pacedToolbarStateHandler());
        this.editor.render(this.$refs.editor);
    },
    unmounted() {
        this.editor.destroy();
    },
    methods: {
        toggleBold() {
            this.editor.run(postEditor => postEditor.toggleMarkup('strong'));
            this.updateToolbarState();
        },
        toggleItalic() {
            this.editor.run(postEditor => postEditor.toggleMarkup('em'))
            this.updateToolbarState();
        },
        toggleUnderline() {
            this.editor.run(postEditor => postEditor.toggleMarkup('u'))
            this.updateToolbarState();
        },
        updateToolbarState() {
            for (const buttonName in this.toolbar) {
                this.toolbar[buttonName] = false;
            }
            this.editor.activeMarkups.forEach(({ tagName }) => {

                switch (tagName) {
                    case 'strong':
                        this.toolbar.bold = true;
                        break;
                    case 'em':
                        this.toolbar.italic = true;
                        break;
                    case 'u':
                        this.toolbar.underline = true;
                        break;
                }
            });
        }
    }
}
