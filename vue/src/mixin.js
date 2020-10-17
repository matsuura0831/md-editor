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

import { db_update, db_remove } from '@/js/util-db';

export default {
    computed: {
        dayjs() {
            return dayjs
        },
        vex() {
            return vex
        },
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
        update_markdown: function(files) {
            if(!Array.isArray(files)) files = [files];

            return Promise.all(files.map(fp => {
                return new Promise((resolve, reject) => {
                    const d = (typeof fp === 'object') ? fp: { 'old': fp, 'new': fp };

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

                        db_update('markdown', query, data, opt).then(() => {
                            resolve({data: data, frontmatter: fm});
                        });
                    })().catch(() => {
                        db_remove('markdown', {path: d.old}).then(resolve).catch(reject);
                    });
                });
            }));
        }
    }
}