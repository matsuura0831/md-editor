import fs from 'fs';
const fsPromises = fs.promises;

import path from 'path';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import frontmatter from '@github-docs/frontmatter';

import vex from 'vex-js'
import vexDialog from 'vex-dialog'
import 'vex-js/dist/css/vex.css';
import 'vex-js/dist/css/vex-theme-os.css';

vex.registerPlugin(vexDialog)
vex.defaultOptions.className = 'vex-theme-os'

import variables from '@/js/variables';
import { db_update, db_remove } from '@/js/util-db';
import { getS3Client, removeObject } from '@/js/util-aws';

export default {
    computed: {
        DIR_HOME() {
            return variables.DIR_HOME;
        },
        DIR_NOTEBOOK() {
            return variables.DIR_NOTEBOOK
        },
        dayjs() {
            return dayjs
        },
        vex() {
            return vex
        },
        enable_s3_sync() {
            return this.$store.state.enable_aws;
        },
        s3_client() {
            return getS3Client(
                this.$store.state.aws_region,
                this.$store.state.aws_access_key_id,
                this.$store.state.aws_secret_access_key,
            );
        },
        s3_bucket() {
            return this.$store.state.aws_bucket;
        }
    },
    methods: {
        format: function() {
            const re = new RegExp(/\${(\w+)}/g);

            const [fmt, dict=undefined] = arguments;
            if(dict) {
                return fmt.replace(re, (m, key) => dict[key]);
            }
            const g = fmt.match(re);
            return g ? g.map(e => e.slice(2, -1)) : [];
        },
        update_markdown: function(fp, notify_file=true) {
            const d = (typeof fp === 'object') ? fp: { 'old': fp, 'new': fp };

            return new Promise((resolve, reject) => {
                (async() => {
                    const stats = await fsPromises.stat(d.new);

                    const content = await fsPromises.readFile(d.new, 'utf-8')                        
                    const { data:fm } = frontmatter(content);

                    const query = { path: d.old };
                    const opt = { upsert: true }

                    const create_at = fm.create_at ? dayjs(fm.create_at) : dayjs();
                    const update_at = dayjs(stats.mtime);
                    const file = path.basename(d.new);
                    const name = file.split('.')[0];
                    const notebook = path.basename(path.dirname(d.new));
                    const title = notebook == "snippet" ? name : fm.title || name;

                    const data = {
                        path: d.new,
                        file: file,
                        notebook: notebook,
                        title: title,
                        create_at: create_at.format(),
                        update_at: update_at.format(),
                        tags: fm.tags || [],
                    };

                    await db_update('markdown', query, data, opt)
                    this.$store.commit('addNotebooks', data.notebook);
                    this.$store.commit('addTags', data.tags);

                    if(d.old != d.new) this.$store.commit('removeFiles', d.old);
                    if(notify_file) {
                        this.$store.commit('addFiles', d.new);
                        this.$store.commit('setFile', d.new);
                    }

                    resolve({data: data, frontmatter: fm});
                })().catch(() => {
                    this.$store.commit('removeFiles', d.old);
                    this.$store.commit('setFile', undefined);

                    const [notebook, file] = d.old.split('/').slice(-2);
                    const s3_key = `notebook/${notebook}/${file}`;
                    console.log("delete", s3_key);

                    removeObject(this.s3_client, this.s3_bucket, s3_key);
                    db_remove('markdown', {path: d.old}).then(resolve).catch(reject);
                });
            });
        }
    }
}