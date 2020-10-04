import path, { resolve } from 'path'
import Datastore from 'nedb';

let db = {};

function db_init(base, fp) {
    if(fp instanceof Array) {
        fp = path.join(...fp);
    }
    db[base] = new Datastore({filename: fp, autoload: true});
}

function db_insert(base, doc) {
    return new Promise((resolve, reject) => {
        db[base].insert(doc, (err, docs) => {
            if(err) reject(err)
            else    resolve(docs);
        })
    });
}

function db_update(base, query, update, opt) {
    opt = opt || {};

    return new Promise((resolve, reject) => {
        db[base].update(query, update, opt, (err, numReplaced) => {
            if(err) reject(err)
            else    resolve(numReplaced);
        })
    });
}

function db_find(base, query, opt) {
    opt = opt || {};

    return new Promise((resolve, reject)=> {
        db[base].find(query, opt, (err, docs) => {
            if(err) reject(err)
            else    resolve(docs);
        })
    })
}

export { db_init, db_insert, db_update, db_find }
