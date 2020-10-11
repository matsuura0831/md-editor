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
            return fmt.match(re).map(e => e.slice(2, -1));
        },
        update_markdown: function(files) {
            return Promise.all(files.map(fp => {
                return new Promise((resolve, reject) => {
                    fsPromises.readFile(fp, 'utf-8').then((content) => {
                        const { data:fm, errors } = frontmatter(content);
                        if (errors.length > 0) reject(errors);

                        const query = { path: fp };
                        const opt = { upsert: true }

                        const create_at = (fm && fm.create_at) ? dayjs(fm.create_at) : dayjs();
                        const file = path.basename(fp);
                        const name = file.split('.')[0];
                        const notebook = path.basename(path.dirname(fp));
                        const title = notebook == "snippet" ? name : fm.title || name;

                        const data = {
                            path: fp,
                            file: file,
                            notebook: notebook,
                            title: title,
                            create_at: create_at.format(),
                            tags: fm.tags || [],
                        };

                        db_update('markdown', query, data, opt).then(() => {
                            resolve(data);
                        }).catch(reject);
                    }).catch(() => {
                        db_remove('markdown', {path: fp}).then(resolve).catch(reject);
                    });
                });
            }));
        }
    }
}