import path from 'path';
import fs from 'fs';
const fsPromises = fs.promises;

function toCamelCase(str, first = true) {
    const ret = str.split('_').map((w, i) => {
        if (i === 0) {
            return w.toLowerCase();
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join('');

    if (first) {
        return ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
}

function readMarkdowns(dir) {
    async function _read(dir, files) {
        const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
        const dirs = [];
        for (const dirent of dirents) {
            const fp = path.join(dir, dirent.name);
            if(dirent.isDirectory()) dirs.push(fp);

            if(fp.match(/\.md$/)) {
                if(dirent.isFile()) files.push(fp);
            }
        }
        for (const d of dirs) {
            files = await _read(d, files);
        }
        return Promise.resolve(files);
    }
    return _read(dir, []);
}

export { toCamelCase, readMarkdowns }