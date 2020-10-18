<template>
    <div class="relative flex-1 flex pt-8" id="main" style="width: 0px">
        <div class="header absolute top-0 left-0 w-full h-8 flex items-center justify-center">
            <div>
                Toggle:
                <button id="toggle-notebook" class="ml-1 w-6 h-6"
                    @click="toggle('notebook')" :class="{ 'nav-toggle-off': !isShowNotebook}"><i class="fas fa-book"></i></button>
                <button id="toggle-page" class="ml-1 w-6 h-6"
                    @click="toggle('page')" :class="{ 'nav-toggle-off': !isShowPage}"><i class="fas fa-file-alt"></i></button>
                <button id="toggle-editor" class="ml-1 w-6 h-6"
                    @click="toggle('editor');" :class="{ 'nav-toggle-off': !isShowEditor}"><i class="fas fa-edit"></i></button>
                <button id="toggle-viewer" class="ml-1 w-6 h-6"
                    @click="toggle('viewer')" :class="{ 'nav-toggle-off': !isShowViewer}"><i class="fas fa-book-open"></i></button>
            </div>
            <div class="ml-4">
                Tools:
                <button :disabled="!isShowEditor" id="invoke-drawio" class="ml-1 w-6 h-6"><i class="fas fa-draw-polygon"></i></button>
                <button :disabled="!isShowEditor" id="invoke-now" class="ml-1 w-6 h-6" @click="invokeNow"><i class="far fa-clock"></i></button>
            </div>
        </div>

        <div class="flex-1" id="editor"></div>

        <div class="flex-1 flex flex-col bg-gray-300 break-words overflow-auto" :class="{'hidden': !isShowViewer}">
            <div class="flex-none p-4">
                <div class="text-3xl leading-9 font-extrabold text-gray-900 tracking-tight">{{ fm_title }}</div>
                <div class="text-base leading-6 font-medium text-gray-500 pl-1">{{ fm_create_at }}</div>
                <div>
                    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                        v-for="t in fm_tags" :key="t.id">#{{ t }}</span>
                </div>
            </div>
            <div class="flex-grow p-4" id="viewer"></div>
        </div>
    </div>
</template>

<script>
import path from 'path';
import fs from 'fs';
const fsPromises = fs.promises;

import frontmatter from '@github-docs/frontmatter';

import ace from 'ace-builds/src-min-noconflict/ace'
import 'ace-builds/src-min-noconflict/mode-markdown'
import 'ace-builds/src-min-noconflict/keybinding-vim'
import 'ace-builds/src-min-noconflict/theme-monokai'

import 'highlight.js/styles/atom-one-dark.css'

import { enableViewer, enableDrawio} from '@/js/util-ace';

export default {
    data() {
        return {
            frontmatter_title: '',
            frontmatter_tags: [],
            frontmatter_create_at: '',

            editor: undefined,
            md: require('markdown-it')({
                    linkify: true,
                    breaks: true,
                    html: true,
                    xhtmlOut: true,
                    typographer: false,
                }) 
                .use(require('markdown-it-plantuml'), {
                    server: this.plantuml_server
                })
                .use(require('markdown-it-abbr'))
                .use(require('markdown-it-ins'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-sub'))
                .use(require('markdown-it-sup'))
                .use(require('markdown-it-footnote'))
                .use(require('markdown-it-emoji'))
                // load custom plugins
                .use(require('@/js/plugins/markdown-it-target-blank'))
                .use(require('@/js/plugins/markdown-it-drawio'))
                .use(require('@/js/plugins/markdown-it-highlight'))
                .use(require('@/js/plugins/markdown-it-message'))
                .use(require('@/js/plugins/markdown-it-inject-line-no')),
        }
    },
    mounted() {
        const self = this;

        this.editor = ace.edit('editor', {
            theme: 'ace/theme/monokai',
            mode: 'ace/mode/markdown',
            wrap: true,
            scrollPastEnd: 0.5,
            showPrintMargin: false,
        });
        this.editor.setKeyboardHandler("ace/keyboard/vim");

        // キーバインディングは以下のように取得できる
        ace.config.loadModule("ace/keyboard/vim", function(m) {
            var VimApi = m.CodeMirror.Vim
            VimApi.defineEx("write", "w", function(/*cm, input*/) {
                self.saveFile();
            })
        })

        // Aceエディタのユーティリティ機能を有効化する
        enableViewer(this.editor, document.querySelector('#viewer'), (v) => {
            const { data, content } = frontmatter(v);

            if(data) {
                ['title', 'create_at', 'tags'].forEach(t => {
                    self[`fm_${t}`] = data[t]
                });
            }
            if(content) {
                return this.md.render(content);
            }
            return "";
        });
        enableDrawio(this.editor, document.querySelector('#invoke-drawio'), () => this.diagrams_server);

        if(!this.isShowEditor) {
            document.querySelector('#editor').classList.add('hidden');
        }
    },
    computed: {
        file() {
            return this.$store.state.file;
        },
        isShowNotebook() {
            return this.$store.state.show_notebook;
        },
        isShowPage() {
            return this.$store.state.show_page;
        },
        isShowEditor() {
            return this.$store.state.show_editor;
        },
        isShowViewer() {
            return this.$store.state.show_viewer;
        },
        diagrams_server() {
            return this.$store.state.diagrams_server;
        },
        plantuml_server() {
            return this.$store.state.plantuml_server;
        },
        enable_frontmatter() {
            return this.frontmatter_init;
        },
        fm_title: {
            get() { return this.frontmatter_title; },
            set(v) { this.frontmatter_title = v; },
        },
        fm_tags: {
            get() { return this.frontmatter_tags; },
            set(v) { this.frontmatter_tags = v; },
        },
        fm_create_at: {
            get() { return this.frontmatter_create_at; },
            set(v) { this.frontmatter_create_at = this.dayjs(v).format(); },
        },
    },
    watch: {
        file: {
            immediate: true,
            handler(val) {
                if(val) {
                    fsPromises.readFile(val, 'utf-8').then((content) => {
                        this.editor.session.setValue(content, 1);
                    }).catch(async () => {
                        await this.update_markdown(val);
                        this.$store.commit('removeFileByPath', val);
                        this.$store.commit('setFile', undefined);
                    });
                } else {
                    if(this.editor) this.editor.session.setValue("", 1);
                }
            },
        },
        isShowEditor(val) {
            if(val) {
                document.querySelector('#editor').classList.remove('hidden');
            } else {
                document.querySelector('#editor').classList.add('hidden');
            }
            this.editor.resize();
        },
        isShowNotebook() {
            this.editor.resize();
        },
        isShowPage() {
            this.editor.resize();
        },
        isShowViewer() {
            this.editor.resize();
        },
    },
    methods: {
        async saveFile() {
            if(this.file) {
                const crnt = this.file;

                const v = this.editor.getValue();
                const { permalink } = frontmatter(v).data;

                let next = crnt;
                if(permalink) {
                    next = path.join(path.dirname(crnt), permalink);
                }
                
                const promises = [fsPromises.writeFile(next, v)];
                if(next != crnt) promises.push(fsPromises.unlink(crnt));
                await Promise.all(promises);

                const docs = await this.update_markdown({old: crnt, new: next});
                const { data } = docs[0];

                this.$store.commit('addTags', data.tags);

                if(next != crnt) {
                    this.$store.commit('addFiles', data);
                    this.$store.commit('removeFileByPath', crnt);
                    this.$store.commit('setFile', next);
                }

            }
        },
        toggle(v) {
            const mode = v.charAt(0).toUpperCase() + v.slice(1);
            this.$store.commit(`toggleShow${mode}`);
        },

        invokeNow() {
            const t = `${this.dayjs().format()}\n`;
            this.editor.session.insert(this.editor.getCursorPosition(), t);
        },
    },
}
</script>