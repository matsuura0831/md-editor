<template>
    <Editor/>
</template>

<script>
import path from 'path';

import fs from 'fs';
const fsPromises = fs.promises;

import variables from '@/js/variables';
import { db_init, db_find } from '@/js/util-db';

import Editor from './components/Editor.vue';

export default {
    name: 'App',
        components: {
        Editor
    },
    methods: {
        readMarkdowns(dir) {
            async function _read(dir, files) {
                const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
                const dirs = [];
                for (const dirent of dirents) {
                    const fp = path.join(dir, dirent.name);
                    if(dirent.isDirectory()) dirs.push(fp);

                    if(fp.match(/\.md$/)) {
                        if(dirent.isFile()) files.push(fp);
                    }
                }
                for (const d of dirs) {
                    files = await _read(d, files);
                }
                return Promise.resolve(files);
            }
            return _read(dir, []);
        }
    },
    created() {
        [variables.DIR_HOME, variables.DIR_WORKDIR, variables.DIR_NOTEBOOK].forEach(d => {
            if(!fs.existsSync(d)) fs.mkdirSync(d);
        })

        db_init('markdown', [variables.DIR_WORKDIR, 'user.neodb']);

        this.readMarkdowns(variables.DIR_NOTEBOOK).then((files) => {
            this.update_markdown(files);
        }).then(() => {
            // emit notebooks and tags
            db_find('markdown', {}, {notebook:1, tags:1}).then((docs) => {
                const notebooks = [...new Set(['general', 'snippet', ...docs.map((d) => d.notebook)])];

                const tags = [...new Set(                   // drop duplicate
                    [].concat(...docs.map((d) => d.tags))   // flatten
                )];

                this.$store.commit('setNotebooks', notebooks);
                this.$store.commit('setTags', tags);
            });
        }).then(() => {
            // TODO: save and use previous notebook
            this.$store.commit('changeNotebook', 'general');
        });
    }
}
</script>