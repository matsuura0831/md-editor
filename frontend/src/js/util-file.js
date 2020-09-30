import fs from 'fs';
import path from 'path';

import { remote } from 'electron';
const { process } = remote;

var dir_home = process.env['MD_HOME'] || process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
var dir_workdir = path.join(dir_home, '.mde');
var dir_notebook = path.join(dir_workdir, 'notebook');

[dir_workdir, dir_notebook].forEach(d => {
    if(!fs.existsSync(d)) fs.mkdirSync(d)
});


function dummy() {
    console.log('DUMMY');
}

export { dummy };