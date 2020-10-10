import path from 'path';

import { remote } from 'electron';
const { process } = remote;

const DIR_HOME = process.env['MD_HOME'] || process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"],
    DIR_WORKDIR = path.join(DIR_HOME, '.mde'),
    DIR_NOTEBOOK = path.join(DIR_WORKDIR, 'notebook');

export default {
    DIR_HOME: DIR_HOME,
    DIR_WORKDIR: DIR_WORKDIR,
    DIR_NOTEBOOK: DIR_NOTEBOOK,
    PLANTUML_SERVER: 'http://www.plantuml.com/plantuml',
    DIAGRAMS_SERVER: 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&configure=1',
}
