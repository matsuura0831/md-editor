<template>
    <div class="flex-none w-64 pb-6 overflow-y-auto" id="nav-page" :class="{'hidden': !isShowPage}">
        <div class="mb-4">
            <div class="page-header h-8 px-4 flex flex-row items-center justify-between">
                <div class="text-xs leading-tight mb-1 truncate">
                    <span>{{ notebook || tag }}</span>
                </div>

                <div class="flex flex-row">
                    <div class="page-add mr-4" @click="pageAdd">
                        <i class="fas fa-plus-circle"></i>
                    </div>

                    <div class="page-remove" @click="pageRemove">
                        <i class="fas fa-minus-circle"></i>
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
        notebook() {
            return this.$store.state.notebook;
        },
        tag() {
            return this.$store.state.tag;
        },
        file() {
            return this.$store.state.file;
        },
    },
    watch: {
        notebook: function() {
            this.refleshPagesByNotebook();
        },
        tag: function() {
            this.refleshPagesByTag();
        },
    },
    methods: {
        refleshPagesByNotebook: function() {
            const query = { notebook: this.notebook };
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
        refleshPagesByTag: function() {
            const query = { tags: { $elemMatch: this.tag }};
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
        pageAdd: async function() {
            const options = (await db_find('markdown', { notebook: 'snippet' })).map(d => {
                return `<option>${d.file}</option>`;
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
                            <option selected></option>
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

                        const snippet_fp = path.join(variables.DIR_NOTEBOOK, 'snippet', value.snippet);
                        const snippet = await fsPromises.readFile(snippet_fp, 'utf-8');
                        const {permalink} = frontmatter(snippet).data;
                        const now = this.dayjs();

                        const parameters = {}
                        this.format(permalink).forEach(e => {
                            parameters[e] = now.format(e)
                        });
                        parameters['title'] = value.title;

                        name = this.format(permalink, parameters);
                        content = this.format(snippet, parameters);
                    } else {
                        name = `${value.title}.md`
                    }

                    // TODO disable create button if TAG mode
                    const fp = path.join(variables.DIR_NOTEBOOK, this.notebook, name);
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
        pageRemove: function() {
            this.vex.dialog.confirm({
                message: `以下のファイルを削除しますか?\n${this.file}`,
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
        isOwnFile: function(f) {
            return f === this.file;
        },
        changeFile: function(f) {
            this.$store.commit('changeFile', f);
        },
        search: function() {
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