<template>
    <div class="flex-none w-64 pb-6 overflow-y-auto" id="nav-notebook" :class="{'hidden': !isShowNotebook}">
        <div class="header mb-2 mt-3 px-4 flex justify-between">
            <div class="flex-auto">
                <h1 class="font-semibold text-xl leading-tight mb-1 truncate">MD</h1>
            </div>

            <div class="setting" @click="setting">
                <router-link to="about">
                    <i class="fas fa-tools"></i>
                </router-link>
            </div>
        </div>

        <div class="mb-4">
            <div class="px-4 mb-2 notebook-header flex justify-between items-center">
                <div>
                    <span class="mr-1"><i class="fas fa-book"></i></span>
                    Notebook
                </div>
                <div class="notebook-add" @click="notebookAdd">
                    <i class="fas fa-plus-circle"></i>
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
export default {
    computed: {
        notebooks() {
            return this.$store.state.notebooks;
        },
        tags() {
            return this.$store.state.tags;
        },
        notebook_or_tag() {
            return this.$store.state.notebook_or_tag;
        },
        isShowNotebook() {
            return this.$store.state.isShowNotebook;
        },
    },
    /*
    watch: {
        notebook_or_tag: function() {
            this.resetHighlight();
        },
    },
    */
    methods: {
        resetHighlight: function() {
            ['#list-tag li', '#list-notebook li'].forEach(q => {
                [...document.querySelectorAll(q)].forEach(e => {
                    e.classList.remove('active');
                });
            })
        },
        isOwnNotebook: function(v) {
            return this.notebook_or_tag.notebook && v == this.notebook_or_tag.notebook;
        },
        isOwnTag: function(v) {
            return this.notebook_or_tag.tag && v == this.notebook_or_tag.tag;
        },
        changeNotebook: function(v) {
            this.$store.commit('changeNotebook', v);
        },
        changeTag: function(v) {
            this.$store.commit('changeTag', v);
        },
        notebookAdd: function() {
            this.vex.dialog.prompt({
                message: '作成するノートブック名を入力してください?',
                placeholder: 'Notebook',
                callback: (value) => {
                    if(value) {
                        this.$store.commit('addNotebook', value);
                    }
                }
            });
        }
    },
}
</script>