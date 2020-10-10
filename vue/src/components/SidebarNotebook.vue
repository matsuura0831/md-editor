<template>
    <div class="flex-none w-64 pb-6 overflow-y-auto" id="nav-notebook" :class="{'hidden': !isShowNotebook}">
        <div class="header mb-2 mt-3 px-4 flex justify-between">
            <div class="flex-auto">
                <h1 class="font-semibold text-xl leading-tight mb-1 truncate">MD</h1>
            </div>
            <!--
            <div>
                <svg class="h-6 w-6 fill-current text-white opacity-25" viewBox="0 0 20 20">
                    <path d="M14 8a4 4 0 1 0-8 0v7h8V8zM8.027 2.332A6.003 6.003 0 0 0 4 8v6l-3 2v1h18v-1l-3-2V8a6.003 6.003 0 0 0-4.027-5.668 2 2 0 1 0-3.945 0zM12 18a2 2 0 1 1-4 0h4z" fill-rule="evenodd" />
                </svg>
            </div>
            -->
        </div>

        <div class="mb-4">
            <div class="px-4 mb-2 notebook-header flex justify-between items-center">
                <div>
                    <span class="mr-1"><i class="fas fa-book"></i></span>
                    Notebook
                </div>
                <div class="notebook-add">
                    <svg class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                    </svg>
                </div>
            </div>

            <ul id="list-notebook" class="notebook-list py-1 px-6">
                <li class="py-2 px-4 rounded-lg"
                    :class="{'active': isOwnNotebook(n)}"
                    v-for="n in notebooks" :key="n.id" @click="changeNotebook(n)">{{ n }}</li>
            </ul>
        </div>

        <div class="mb-4">
            <div class="px-4 mb-2 tag-header flex justify-between items-center">
                <div>
                    <span class="mr-1"><i class="fas fa-tag"></i></span>
                    Tag
                </div>
                <div class="tag-add">
                    <svg class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                    </svg>
                </div>
            </div>
            <ul id="list-tag" class="tag-list py-1 px-6 text-white">
                <li class="p-1 py-2 px-4 rounded-lg"
                    :class="{'active': isOwnTag(t)}"
                    v-for="t in tags" :key="t.id" @click="changeTag(t)"># {{ t }}</li>
            </ul>
        </div>
    </div>
</template>


<script>
//import { db_find } from '@/js/util-db';

export default {
    computed: {
        notebooks() {
            return this.$store.state.notebooks;
        },
        tags() {
            return this.$store.state.tags;
        },
        notebook() {
            return this.$store.state.notebook;
        },
        tag() {
            return this.$store.state.tag;
        },
        isShowNotebook() {
            return this.$store.state.isShowNotebook;
        },
    },
    watch: {
        notebook: function() {
            this.resetHighlight();

            /*
            const query = { notebook: this.notebook };
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
            */
        },
        tag: function() {
            this.resetHighlight();

            /*
            const query = { tags: { $elemMatch: this.tag }};
            db_find('markdown', query, {}, {create_at: -1}).then(docs => {
                this.$store.commit('setFiles', docs);
            });
            */
        },
    },
    methods: {
        resetHighlight: function() {
            ['#list-tag li', '#list-notebook li'].forEach(q => {
                [...document.querySelectorAll(q)].forEach(e => {
                    e.classList.remove('active');
                });
            })
        },
        isOwnNotebook: function(v) {
            return v == this.notebook;
        },
        isOwnTag: function(v) {
            return v == this.tag;
        },
        changeNotebook: function(v) {
            this.$store.commit('changeNotebook', v);
        },
        changeTag: function(v) {
            this.$store.commit('changeTag', v);
        },
    },
}
</script>