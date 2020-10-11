<template>
    <div class="flex-none w-64 pb-6 overflow-y-auto" id="nav-page" :class="{'hidden': !isShowPage}">
        <div class="mb-4">
            <div class="page-header px-2 mb-2 flex justify-between items-center">
                <form @submit.prevent class="relative text-gray-600 focus-within:text-gray-400 mt-2">
                    <span class="absolute left-0 flex items-center pl-2">
                        <button type="submit" class="p-1 focus:outline-none focus:shadow-outline" @click="search">
                            <i class="fas fa-search"></i>
                        </button>
                    </span>

                    <input type="search" name="q"
                        class="py-2 text-sm text-white bg-gray-900 rounded-md pl-10 focus:outline-none focus:bg-white focus:text-gray-900"
                        placeholder="Search..." autocomplete="off">
                </form>
            </div>

            <ul id="list-page" class="page-list py-2 px-3 text-sm">
                <li class="p-2 truncate rounded-lg"
                        :class="{'active': isOwnFile(file.path)}"
                        v-for="file in files" :key="file.id" :data-file="file.path" @click="changeFile">
                    <span class="mr-1"><i class="far fa-file"></i></span> {{ file.title }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import fs from 'fs';
const fsPromises = fs.promises;

import { db_find } from '@/js/util-db';

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
            const query = { notebook: this.notebook };
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
        tag: function() {
            const query = { tags: { $elemMatch: this.tag }};
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
        },
    },
    methods: {
        isOwnFile: function(f) {
            return f === this.file;
        },
        changeFile: function(ev) {
            const f = ev.target.getAttribute('data-file');
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