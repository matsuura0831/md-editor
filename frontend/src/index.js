import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import 'ace-builds/src-min-noconflict/ace'
import 'ace-builds/src-min-noconflict/mode-markdown'
import 'ace-builds/src-min-noconflict/keybinding-vim'
import 'ace-builds/src-min-noconflict/theme-monokai'
import 'highlight.js/styles/atom-one-dark.css'

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
dayjs.locale('ja');

import { enable_viewer, enable_drawio} from './js/ace-util';
import './base.css'

const PLANTUML_SERVER = 'http://www.plantuml.com/plantuml'
const DIAGRAMS_SERVER = 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&configure=1';

const md = require('markdown-it')({
        linkify: true,
        breaks: true,
        html: true,
        xhtmlOut: true,
    }) 
    .use(require('markdown-it-plantuml'), {
        server: PLANTUML_SERVER,
    })
    .use(require('markdown-it-abbr'))
    .use(require('markdown-it-ins'))
    .use(require('markdown-it-mark'))
    .use(require('markdown-it-sub'))
    .use(require('markdown-it-sup'))
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-emoji'))
    .use(require('./js/markdown-it-drawio'))
    .use(require('./js/markdown-it-highlight'))
    .use(require('./js/markdown-it-message'))
    .use(require('./js/markdown-it-inject-line-no'));

const sidebar = document.querySelector('#sidebar');
const viewer = document.querySelector('#viewer');
const _editor = document.querySelector('#editor');

const editor = ace.edit('editor',  {
    theme: 'ace/theme/monokai',
    mode: 'ace/mode/markdown',
    wrap: true,
    scrollPastEnd: 0.5,
    showPrintMargin: false,
});
editor.setKeyboardHandler("ace/keyboard/vim");

const tg_sidebar = document.querySelector('#toggle-sidebar');
const tg_editor = document.querySelector('#toggle-editor');
const tg_viewer = document.querySelector('#toggle-viewer');

const mapping = [
    [tg_sidebar, sidebar],
    [tg_editor, _editor],
    [tg_viewer, viewer],
];

mapping.forEach(i => {
    const [tg, el] = i;
    tg.addEventListener('click', () => {
        el.classList.toggle('hidden');
        tg.classList.toggle('nav-toggle-off');
        editor.resize();
    })
});

const bt_drawio = document.querySelector('#invoke-drawio');
const bt_time = document.querySelector('#invoke-now')

enable_viewer(editor, viewer, (v) => {
    return md.render(v);
});
enable_drawio(editor, bt_drawio, DIAGRAMS_SERVER);

bt_time.addEventListener('click', () => {
    const t = `${dayjs().format()}\n`;
    editor.session.insert(editor.getCursorPosition(), t);
});
