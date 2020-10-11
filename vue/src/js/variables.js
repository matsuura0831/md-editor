import path from 'path';

import { remote } from 'electron';
const { process, app } = remote;

const DIR_HOME = process.env['MD_HOME'] || app.getPath('userData'),
    DIR_NOTEBOOK = path.join(DIR_HOME, 'notebook');

export default {
    DIR_HOME: DIR_HOME,
    DIR_NOTEBOOK: DIR_NOTEBOOK,
    PLANTUML_SERVER: 'http://www.plantuml.com/plantuml',
    DIAGRAMS_SERVER: 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&configure=1',
}