<template>
    <Editor/>
</template>

<script>
import path from 'path';

import fs from 'fs';
const fsPromises = fs.promises;

import variables from '@/js/variables';
import { readMarkdowns } from '@/js/util';
import { db_init, db_find, db_remove } from '@/js/util-db';
import { getS3Client, syncFiles } from '@/js/util-aws';

import Editor from '../components/Editor.vue';

import tutorial from "raw-loader!@/assets/md/tutorial.md";
import snippet from "raw-loader!@/assets/md/snippet.md";

export default {
    name: 'App',
        components: {
        Editor
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

        (async () => {
            const client = getS3Client(
                this.$store.state.aws_region,
                this.$store.state.aws_access_key_id,
                this.$store.state.aws_secret_access_key,
            );

            await syncFiles(client, variables.DIR_NOTEBOOK, this.$store.state.aws_bucket)

            // search markdown on loacal
            const files = await readMarkdowns(variables.DIR_NOTEBOOK);
            await this.update_markdown(files);

            const notebooks = ['general', 'snippet'], tags = [];

            (await db_find('markdown', {})).forEach(d => {
                if(!fs.existsSync(d.path)) {
                    // remove unlinked files
                    db_remove('markdown', d)
                    return;
                }
                notebooks.push(d.notebook);
                tags.push(...d.tags);
            });
            // apply UI
            this.$store.commit('setNotebooks', [...new Set(notebooks)]);
            this.$store.commit('setTags', [...new Set(tags)]);
        })();
    }
}
</script>