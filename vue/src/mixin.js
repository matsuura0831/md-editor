import fs from 'fs';
const fsPromises = fs.promises;

import path from 'path';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import frontmatter from '@github-docs/frontmatter';

import { db_update } from '@/js/util-db';

export default {
    computed: {
        dayjs() {
            return dayjs
        }
    },
    methods: {
        update_markdown: (files) => {
            return Promise.all(files.map(fp => {
                return new Promise((resolve, reject) => {
                    fsPromises.readFile(fp, 'utf-8').then((content) => {
                        const { data:fm, errors } = frontmatter(content);
                        if (errors.length > 0) reject(errors);

                        const query = { path: fp };
                        const opt = { upsert: true }

                        const create_at = (fm && fm.create_at) ? dayjs(fm.create_at) : dayjs();
                        const update_at = (fm && fm.update_at) ? dayjs(fm.update_at) : dayjs();

                        const data = {
                            path: fp,
                            file: path.basename(fp),
                            notebook: path.basename(path.dirname(fp)),
                            title: fm.title || fp.file.split('.')[0],
                            create_at: create_at.format(),
                            update_at: update_at.format(),
                            tags: fm.tags || [],
                        };

                        db_update('markdown', query, data, opt).then(() => {
                            resolve(data);
                        }).catch(reject);
                    });
                });
            }));
        }
    }
}