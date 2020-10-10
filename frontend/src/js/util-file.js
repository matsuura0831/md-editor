import path from 'path';

import fs from 'fs';
const fsPromises = fs.promises;

import { remote } from 'electron';
const { process } = remote;

const DIR_HOME = process.env['MD_HOME'] || process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
const DIR_WORKDIR = path.join(DIR_HOME, '.mde');
const DIR_NOTEBOOK = path.join(DIR_WORKDIR, 'notebook');

[DIR_WORKDIR, DIR_NOTEBOOK].forEach(d => {
    if(!fs.existsSync(d)) fs.mkdirSync(d)
});

const FILTER_MD = (fp) => { return fp.match(/\.md$/); }

const readFileRecursively = async(dir, filter, files=[]) => {
    filter = filter || FILTER_MD;

    const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
    const dirs = [];
    for (const dirent of dirents) {
        const fp = path.join(dir, dirent.name);
        if(dirent.isDirectory()) dirs.push(fp);

        if(!filter || filter(fp)) {
            if(dirent.isFile()) files.push({
                path: fp,
                notebook: path.basename(dir),
                file: path.basename(fp),
            });
        }
    }
    for (const d of dirs) {
        files = await readFileRecursively(d, filter, files);
    }
    return Promise.resolve(files);
};

const readFile = fsPromises.readFile;
const writeFile = fsPromises.writeFile;

export {
    DIR_HOME, DIR_WORKDIR, DIR_NOTEBOOK,
    readFileRecursively,
    readFile,
    writeFile,
};
