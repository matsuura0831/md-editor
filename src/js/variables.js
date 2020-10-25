import path from 'path';

import { remote } from 'electron';
const { process, app } = remote;

const DIR_HOME = process.env['MD_HOME'] || app.getPath('userData'),
    DIR_NOTEBOOK = path.join(DIR_HOME, 'notebook');

export default {
    DIR_HOME: DIR_HOME,
    DIR_NOTEBOOK: DIR_NOTEBOOK
}