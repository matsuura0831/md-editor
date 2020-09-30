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

import { enable_viewer, enable_drawio} from './js/util-ace';
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

const nav_notebook = document.querySelector('#nav-notebook');
const nav_page = document.querySelector('#nav-page');
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

// sample
ace.config.loadModule("ace/keyboard/vim", function(m) {
    var VimApi = m.CodeMirror.Vim
    VimApi.defineEx("write", "w", function(cm, input) {
        console.log(cm, input);
    })
})

const tg_notebook = document.querySelector('#toggle-notebook');
const tg_page = document.querySelector('#toggle-page');
const tg_editor = document.querySelector('#toggle-editor');
const tg_viewer = document.querySelector('#toggle-viewer');

const mapping = [
    [tg_notebook, nav_notebook],
    [tg_page, nav_page],
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


/*
// sample
import fs from 'fs';
import { remote } from 'electron';
const { BrowserWindow, dialog, app } = remote;

const BASE_PATH = app.getAppPath();

function readFile(path) {
    fs.readFile(path, (error, data) => {
        if (error != null) {
            alert("file open error.");
            return;
        }
        editor.setValue(data.toString());
        editor.clearSelection();
    })
}

const win = BrowserWindow.getFocusedWindow();
dialog.showOpenDialog(
    win,
    {
        defaultPath: BASE_PATH,
        properties: ['openFile'],
        filters: [
            {
                name: 'Markdown',
                extensions: ['md', 'txt']
            }
        ]
    },
).then(result => {
    if (result.filePaths.length > 0) {
        readFile(result.filePaths[0]);
    }
});

document.addEventListener('drop', (event) => { 
    event.preventDefault(); 
    event.stopPropagation(); 
  
    for (const f of event.dataTransfer.files) { 
        // Using the path attribute to get absolute file path 
        console.log('File Path of dragged files: ', f.path) 
      } 
}); 
  
document.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
  }); 
  
document.addEventListener('dragenter', (event) => { 
    console.log('File is in the Drop Space'); 
}); 
  
document.addEventListener('dragleave', (event) => { 
    console.log('File has left the Drop Space'); 
}); 
*/