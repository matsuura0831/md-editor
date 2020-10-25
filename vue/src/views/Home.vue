<template>
    <Editor/>
</template>

<script>
import path from 'path';

import fs from 'fs';
const fsPromises = fs.promises;

import { readMarkdowns } from '@/js/util';
import { db_init } from '@/js/util-db';
import { syncObjects } from '@/js/util-aws';

import Editor from '../components/Editor.vue';

import tutorial from "raw-loader!@/assets/md/tutorial.md";
import snippet from "raw-loader!@/assets/md/snippet.md";

export default {
    name: 'App',
    components: {
        Editor,
    },
    created() {
        const created = [this.DIR_HOME, this.DIR_NOTEBOOK].map(d => {
            if(!fs.existsSync(d)) {
                fs.mkdirSync(d);
                return true;
            }
            return false;
        });
        if(created[1]) {
            const [fp_gen, fp_sni] = ['general', 'snippet'].map(e => {
                const d = path.join(this.DIR_NOTEBOOK, e);
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

        const init = async() => {
            if(this.enable_s3_sync) {
                const client = this.s3_client;
                const ret = await syncObjects(client, this.DIR_NOTEBOOK, this.s3_bucket);
                console.log(ret);
            }

            // search markdown on loacal
            const files = await readMarkdowns(this.DIR_NOTEBOOK);
            await Promise.all(files.map(f => this.update_markdown(f, false)));
        }

        init();
        setInterval(init, 5 * 60 * 1000);
    }
}
</script>