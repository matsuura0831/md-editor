<template>
    <Editor/>
</template>

<script>
import path from 'path';

import fs from 'fs';
const fsPromises = fs.promises;

import variables from '@/js/variables';
import { db_init, db_find, db_remove } from '@/js/util-db';

import Editor from './components/Editor.vue';

import tutorial from "raw-loader!@/assets/md/tutorial.md";
import snippet from "raw-loader!@/assets/md/snippet.md";

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
        const created = [variables.DIR_HOME, variables.DIR_NOTEBOOK].map(d => {
            if(!fs.existsSync(d)) {
                fs.mkdirSync(d);
                return true;
            }
            return false;
        });
        if(created[1]) {
            const [fp_gen, fp_sni] = ['general', 'snippet'].map(e => {
                const d = path.join(variables.DIR_NOTEBOOK, e);
                if(!fs.existsSync(d)) fs.mkdirSync(d);
                return path.join(d, 'default.md');
            });

            (async ()=> {
                await Promise.all([[fp_gen, tutorial], [fp_sni, snippet]].map(e => {
                    const [f, c] = e;
                    return fsPromises.writeFile(f, c);
                }))
            })();
        }

        db_init('markdown', 'user.neodb');

        this.readMarkdowns(variables.DIR_NOTEBOOK).then((files) => {
            this.update_markdown(files);
        }).then(() => {
            db_find('markdown', {}, {path:1}).then((docs) => {
                docs.filter(d => !fs.existsSync(d.path)).forEach(d => {
                    console.log(`Not find: ${d.path}`);
                    db_remove('markdown', d);
                });
            });
        }).then(() => {
            db_find('markdown', {}, {notebook:1, tags:1}).then((docs) => {
                const notebooks = [...new Set(['general', 'snippet', ...docs.map((d) => d.notebook)])];

                const tags = [...new Set(                   // drop duplicate
                    [].concat(...docs.map((d) => d.tags))   // flatten
                )];

                this.$store.commit('setNotebooks', notebooks);
                this.$store.commit('setTags', tags);
            });
        });
    }
}
</script>