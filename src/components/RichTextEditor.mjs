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
    data: () => ({ editor: null, toolbar: { bold: false, italic: false } }),
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
                <button class="btn btn-icon" aria-label="Button">
                    <!-- Download SVG icon from http://tabler-icons.io/i/underline -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 5v5a5 5 0 0 0 10 0v-5"></path><path d="M5 19h14"></path></svg>
                </button>
                <button class="btn btn-icon" aria-label="Button">
                    <!-- Download SVG icon from http://tabler-icons.io/i/copy -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path></svg>
                </button>
                <button class="btn btn-icon" aria-label="Button">
                    <!-- Download SVG icon from http://tabler-icons.io/i/scissors -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="6" cy="7" r="3"></circle><circle cx="6" cy="17" r="3"></circle><line x1="8.6" y1="8.6" x2="19" y2="19"></line><line x1="8.6" y1="15.4" x2="19" y2="5"></line></svg>
                </button>
                <button class="btn btn-icon" aria-label="Button">
                    <!-- Download SVG icon from http://tabler-icons.io/i/file-plus -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                </button>
                <button class="btn btn-icon" aria-label="Button">
                    <!-- Download SVG icon from http://tabler-icons.io/i/file-minus -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>
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
                }
            });
        }
    }
}
