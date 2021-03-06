import path from 'path'
import Datastore from 'nedb';

let db = {};

function db_init(base, fp) {
    if(fp instanceof Array) {
        fp = path.join(...fp);
    }
    console.log(`DB: ${fp}`)
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
        db[base].update(query, update, opt, (err/*, numReplaced*/) => {
            if(err) reject(err)
            else    resolve(update);
        })
    });
}

function db_find(base, query, opt, sorted) {
    opt = opt || {};
    sorted = sorted || undefined;

    return new Promise((resolve, reject)=> {
        let ret = db[base].find(query, opt);

        if(sorted) {
            ret = ret.sort(sorted);
        }
        ret.exec((err, docs) => {
            if(err) reject(err)
            else    resolve(docs);
        })
    })
}

function db_remove(base, query, opt) {
    opt = opt || {};
    
    return new Promise((resolve, reject) => {
        db[base].remove(query, opt, (err, numRemoved) => {
            if(err) reject(err);
            else    resolve(numRemoved);
        });
    });
}

export { db_init, db_insert, db_update, db_find, db_remove}
