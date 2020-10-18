import path from 'path';
import fs from 'fs';
const fsPromises = fs.promises;

import S3 from 'aws-sdk/clients/s3';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import { readMarkdowns } from '@/js/util';

function getS3Client(region, access_key, secret_key) {
    return new S3({
        region: region,
        credentials: {
            accessKeyId: access_key,
            secretAccessKey: secret_key,
        }
    });
}

function listS3Objects(client, params) {
    function _list(client, params, out) {
        return new Promise((resolve, reject) => {
            client.listObjectsV2(params).promise().then(({ Contents, IsTruncated, NextContinuationToken }) => {
                out.push(...Contents);
                !IsTruncated ? resolve(out) : resolve(_list({...params, ConfigurationToken: NextContinuationToken}, out));
            }).catch(reject);
        });
    }
    return _list(client, params, []);
}

function syncFiles(client, local_dir, s3_bucket, s3_prefix) {
    const params = { Bucket: s3_bucket, Prefix: s3_prefix };

    const process = [
        listS3Objects(client, params),
        new Promise((resolve, reject) => {
            readMarkdowns(local_dir).then(files => {
                resolve(Promise.all(files.map(async (fp) => {
                    const stats = await fsPromises.stat(fp);
                    return {path: fp, stats: stats};
                })));
            }).catch(reject);
        }),
    ];

    return Promise.all(process).then(([s3_docs, docs]) => {
        const merged = {};

        s3_docs.forEach(({Key, LastModified}) => {
            const [notebook, file] = Key.split('/').slice(-2);
            const k = `${notebook}/${file}`

            if(!(k in merged)) {
                merged[k] = {};
            }
            merged[k] = {...merged[k], s3_path: Key, s3_update_at: dayjs(LastModified) }
        });
        docs.forEach(({path, stats}) => {
            const [notebook, file] = path.split('/').slice(-2);

            const k = `${notebook}/${file}`
            if(!(k in merged)) {
                merged[k] = {};
            }
            merged[k] = {...merged[k], local_path: path, local_update_at: dayjs(stats.mtime) }
        });
        return merged;

    }).then(merged => {
        const upload_docs = [], download_docs = [];
        Object.keys(merged).forEach(k => {
            const d = merged[k];

            const def = { 
                local_path: path.join(local_dir, k),
                s3_path: `notebook/${k}`,
            };

            if((!d.s3_path && d.local_path)
                    || (d.s3_update_at && d.local_update_at && d.s3_update_at.add('5', 'm').isBefore(d.local_update_at))) {

                upload_docs.push({...def, ...d});
            } else if((!d.local_path && d.s3_path)
                    || (d.s3_update_at && d.local_update_at && d.local_update_at.add('5', 'm').isBefore(d.s3_update_at))) {

                download_docs.push({...def, ...d});
            }
        });
        return [upload_docs, download_docs];

    }).then(([upload_docs, download_docs]) => {
        const syncs = [
            ...download_docs.map(d => {
                return new Promise((resolve, reject) => {
                    client.getObject({
                        Bucket: s3_bucket,
                        Key: d.s3_path
                    }).promise().then(data => {
                        console.log('DL', d.s3_path, d.local_path, data);

                        return fsPromises.writeFile(d.local_path, data.Body);
                    }).then(resolve).catch(reject);
                });
            }),
            ...upload_docs.map(d => {
                return new Promise((resolve, reject) => {
                    fsPromises.readFile(d.local_path, 'utf-8').then(data => {
                        console.log('UP', d.local_path, d.s3_path, data);

                        return client.putObject({
                            Body: data,
                            Bucket: s3_bucket,
                            Key: d.s3_path
                        }).promise();
                    }).then(resolve).catch(reject);
                });
            })
        ];
        return Promise.all(syncs)
    });
}

export { getS3Client, listS3Objects, syncFiles }