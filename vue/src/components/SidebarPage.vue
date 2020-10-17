<template>
    <div class="flex-none w-64 pb-6 overflow-y-auto" id="nav-page" :class="{'hidden': !isShowPage}">
        <div class="mb-4">
            <div class="page-header h-8 px-4 flex flex-row items-center justify-between">
                <div class="text-xs leading-tight mb-1 truncate">
                    <span>{{ notebook_or_tag.notebook || notebook_or_tag.tag }}</span>
                </div>

                <div class="flex flex-row">
                    <div class="page-add mr-4" @click="pageAdd" v-if="notebook_or_tag.notebook">
                        <i class="fas fa-plus-circle"></i>
                    </div>

                    <div class="page-remove mr-4" @click="pageRemove" v-if="notebook_or_tag.notebook">
                        <i class="fas fa-minus-circle"></i>
                    </div>

                    <div class="page-rename" @click="pageRename">
                        <i class="fas fa-spell-check"></i>
                    </div>
                </div>
            </div>

            <div class="page-search px-2 mb-2 flex items-center">
                <form @submit.prevent class="relative text-gray-600 focus-within:text-gray-400 mt-2">
                    <span class="absolute left-0 flex items-center pl-2">
                        <button type="submit" class="p-1 focus:outline-none focus:shadow-outline" @click="search">
                            <i class="fas fa-search"></i>
                        </button>
                    </span>

                    <input type="search" name="q"
                        class="appearance-none py-2 text-sm text-white bg-gray-900 rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
                        placeholder="Search..." autocomplete="off">
                </form>
            </div>


            <ul id="list-page" class="page-list py-2 px-3 text-sm">
                <li class="p-2 truncate rounded-lg"
                        :class="{'active': isOwnFile(file.path)}"
                        v-for="file in files" :key="file.id" :data-file="file.path" :data-title="file.title" :data-create="file.create_at"
                        @click="changeFile(file.path)">
                    <span class="mr-1"><i class="far fa-file"></i></span> {{ file.title }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import path from 'path';
import fs from 'fs';
const fsPromises = fs.promises;

import frontmatter from '@github-docs/frontmatter';

import { db_find } from '@/js/util-db';
import variables from '@/js/variables';

export default {
    computed: {
        files() {
            return this.$store.state.files;
        },
        isShowPage() {
            return this.$store.state.isShowPage;
        },
        notebook_or_tag() {
            return this.$store.state.notebook_or_tag;
        },
        file() {
            return this.$store.state.file;
        },
        snippet() {
            return this.$store.state.selected_snippet;
        }
    },
    watch: {
        notebook_or_tag() {
            if(this.notebook_or_tag.notebook) {
                this.refleshPagesByNotebook();
            }
            if(this.notebook_or_tag.tag) {
                this.refleshPagesByTag();
            }
        },
    },
    methods: {
        refleshPagesByNotebook() {
            const query = { notebook: this.notebook_or_tag.notebook };
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
        refleshPagesByTag() {
            const query = { tags: { $elemMatch: this.notebook_or_tag.tag }};
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
        async pageAdd() {
            const options = (await db_find('markdown', { notebook: 'snippet' })).map(d => {
                console.log(d.file, this.snippet);
                const opt = (d.file == this.snippet) ? " selected" : ""
                return `<option${opt}>${d.file}</option>`;
            }).join("\n");

            this.vex.dialog.confirm({
                message: "ファイルを作成します",
                input: `
                <div class="vex-custom-field-wrapper">
                    <label for="title">Title</label>
                    <div class="vex-custom-input-wrapper">
                        <input name="title" type="text" />
                    </div>
                </div>
                <div class="vex-custom-field-wrapper">
                    <label for="snippet">Snippet</label>
                    <div class="vex-custom-input-wrapper">
                        <select name="snippet">
                            <option></option>
                            ${options}
                        </select>
                    </div>
                </div>
                `,
                callback: async (value) => {
                    if(!value) return; // cancelled

                    let name = undefined, content = "";
                    if('snippet' in value && value.snippet != "") {
                        console.log('ReadSnippet', value.snippet);
                        this.$store.commit('selectSnippet', value.snippet);

                        const snippet_fp = path.join(variables.DIR_NOTEBOOK, 'snippet', value.snippet);
                        const snippet = await fsPromises.readFile(snippet_fp, 'utf-8');

                        const parameters = {};
                        if(snippet) {
                            const now = this.dayjs();
                            this.format(snippet).forEach(e => {
                                parameters[e] = now.format(e)
                            });
                        }
                        parameters['title'] = value.title;

                        const {permalink} = frontmatter(snippet).data;
                        if(permalink) name = this.format(permalink, parameters);

                        content = this.format(snippet, parameters);
                    }

                    if(name === undefined) name = `${value.title}.md`

                    const fp = path.join(variables.DIR_NOTEBOOK, this.notebook_or_tag.notebook, name);
                    const dir = path.dirname(fp);

                    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
                    fsPromises.writeFile(fp, content).then(() => {
                        this.update_markdown([fp]).then(d => {
                            this.$store.commit('addFile', d[0]);
                            this.changeFile(fp);
                        });
                    });
                }
            });
        },
        pageRemove() {
            const name = path.basename(this.file);

            this.vex.dialog.confirm({
                message: `ファイルを削除しますか? ${name}`,
                callback: (value) => {
                    if(value) {
                        fsPromises.unlink(this.file).then(() => {
                            return this.update_markdown([this.file]);
                        }).then(() => {
                            this.$store.commit('removeFileByPath', this.file);
                        });
                    }
                }
            });
        },
        pageRename() {
            const name = path.basename(this.file);
            const dir = path.dirname(this.file);

            this.vex.dialog.prompt({
                message: `ファイル名を変更しますか? ${name}`,
                placeholder: `${name}`,
                callback: (value) => {
                    if(value) {
                        const dst = path.join(dir, value);

                        fsPromises.rename(this.file, dst).then(() => {
                            return this.update_markdown([[this.file, dst]]);
                        }).then((docs) => {
                            this.$store.commit('addFile', docs[0]);
                            this.$store.commit('removeFileByPath', this.file);
                        });
                    }
                }
            });
        },
        isOwnFile(f) {
            return f === this.file;
        },
        changeFile(f) {
            this.$store.commit('changeFile', f);
        },
        search() {
            const text = document.querySelector('#nav-page input').value;
            const re = new RegExp(text);

            [...document.querySelectorAll('#list-page li')].forEach(e => {
                e.classList.remove('highlight');

                if(text) {
                    const fp = e.getAttribute('data-file');
                    fsPromises.readFile(fp, 'utf-8').then(content => {
                        if(content.match(re)) {
                            e.classList.add('highlight');
                        }
                    });
                }
            });
        }
    },
}
</script>