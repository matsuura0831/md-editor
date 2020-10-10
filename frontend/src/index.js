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

import frontmatter from '@github-docs/frontmatter';

import { DIR_NOTEBOOK, DIR_WORKDIR, readFileRecursively, readFile, writeFile } from './js/util-file';
import { db_init, db_insert, db_update, db_find } from './js/util-db';
import { enable_viewer, enable_drawio} from './js/util-ace';
import './base.css'

const PLANTUML_SERVER = 'http://www.plantuml.com/plantuml'
const DIAGRAMS_SERVER = 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&configure=1';

let CRNT_FILE = undefined;

/*
    マークダウンパーサの準備
*/
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
    // load custom plugins
    .use(require('./js/markdown-it-drawio'))
    .use(require('./js/markdown-it-highlight'))
    .use(require('./js/markdown-it-message'))
    .use(require('./js/markdown-it-inject-line-no'));

/*
    DOMの取得及びAceEditorの設定
*/
const nav_notebook = document.querySelector('#nav-notebook');
const nav_page = document.querySelector('#nav-page');
const viewer = document.querySelector('#viewer');
const _editor = document.querySelector('#editor');

const editor = ace.edit('editor', {
    theme: 'ace/theme/monokai',
    mode: 'ace/mode/markdown',
    wrap: true,
    scrollPastEnd: 0.5,
    showPrintMargin: false,
});
editor.setKeyboardHandler("ace/keyboard/vim");

// キーバインディングは以下のように取得できる
ace.config.loadModule("ace/keyboard/vim", function(m) {
    var VimApi = m.CodeMirror.Vim
    VimApi.defineEx("write", "w", function(cm, input) {
        console.log(cm, input);

        writeFile(CRNT_FILE, editor.getValue());
        console.log(`Save ${CRNT_FILE}`);
    })
})

/*
    toggleから始まるボタンを押下した際に対になるパネルの表示・非表示を切り替える
*/
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

/*
    ツールボタンの設定
    invoke-drawio: drawio画面を開く．現在カーソル位置に応じて新規作成と編集を切り替える
    invoke-now: 現在時刻を現在カーソル位置に挿入する
*/
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
    ローカルのマークダウンのロード
*/
const list_notebook = document.querySelector('#list-notebook');
const list_tag = document.querySelector('#list-tag');
const list_page = document.querySelector('#list-page');

function init_lists() {
    list_notebook.querySelectorAll('li').forEach((elm) => {
        elm.classList.remove('highlight-notebook')
    })
    list_tag.querySelectorAll('li').forEach((elm) => {
        elm.classList.remove('highlight-tag')
    })
}
function init_pages() {
    list_page.querySelectorAll('li').forEach((elm) => {
        elm.classList.remove('highlight-page');
    });
}

function update_pages(docs) {
    list_page.innerHTML = ""

    docs.forEach((d) => {
        const li = document.createElement('li');
        li.classList.add('p-1', 'truncate');
        li.innerHTML = `<span class="mr-1"><i class="far fa-file"></i></span> ${d.title}</li>`;
        li.setAttribute('data-path', d.path);

        list_page.appendChild(li);
    });

    list_page.querySelectorAll('li').forEach((elm) => {
        elm.addEventListener('click', async function() {
            init_pages();
            this.classList.add('highlight-page');

            const fp = this.getAttribute('data-path');
            const data = await readFile(fp, 'utf-8');

            editor.session.setValue(data, 1);
            CRNT_FILE = fp;
        })
    });
}

db_init('markdown', [DIR_WORKDIR, 'user.neodb']);

readFileRecursively(DIR_NOTEBOOK).then(async (files) => {
    const messages = await Promise.all(files.map((f) => {
        return new Promise(async (resolve, reject) => {
            const markdown = await readFile(f.path, "utf-8");

            const { data, errors } = frontmatter(markdown);
            if (errors.length > 0) {
                reject(errors);
            } else {
                resolve([f, data]);
            }
        });
    }));

    const updates = messages.map(m => {
        const [fp, fm] = m;
        const query = { path: fp.path };
        const opt = { upsert: true }

        const create_at = fm.create_at ? dayjs(fm.create_at) : dayjs();
        const update_at = fm.update_at ? dayjs(fm.update_at) : dayjs();

        return db_update('markdown', query, {
            path: fp.path,
            notebook: fp.notebook,
            title: fm.title || fp.file.split('.')[0],
            create_at: create_at.format(),
            update_at: update_at.format(),
            tags: fm.tags || [],
        }, opt);
    });

    Promise.all(updates).then(() => {
        db_find('markdown', {}, {notebook:1}).then((docs) => {
            list_notebook.innerHTML = "";

            const books = docs.map((d) => d.notebook);

            [...new Set(books)].forEach((b) =>{
                const li = document.createElement('li');
                li.classList.add('data-notebook', 'p-1');
                li.innerText = b;
                li.setAttribute('data-notebook', b);

                list_notebook.appendChild(li);
            });

            list_notebook.querySelectorAll('li').forEach((elm) => {
                elm.addEventListener('click', function(ev) {
                    init_lists();
                    this.classList.add('highlight-notebook');

                    const notebook = this.getAttribute('data-notebook');
                    db_find('markdown', {notebook: notebook}, {path:1, title:1}).then(update_pages);
                });
            })
        });

        db_find('markdown', {tags: { $elemMatch: "Android"}}, {tags:1}).then((docs) => {
            list_tag.innerHTML = ""

            let tags = [];
            docs.forEach((d) => {
                tags = [...tags, ...d.tags]
            });

            [...new Set(tags)].forEach((t) => {
                const li = document.createElement('li');
                li.classList.add('data-tag', 'p-1');
                li.innerText = `# ${t}`;
                li.setAttribute('data-tag', t);
                
                list_tag.appendChild(li)
            })

            list_tag.querySelectorAll('li').forEach((elm) => {
                elm.addEventListener('click', function(ev) {
                    init_lists();
                    this.classList.add('highlight-tag');

                    const tag = this.getAttribute('data-tag');
                    db_find('markdown', {tags: { $elemMatch: tag }}, {path:1, title:1}).then(update_pages);
                });
            })
        });
    })
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