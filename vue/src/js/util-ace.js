function enableViewer(editor, viewer, change_func) {
    let timer = undefined;
    let rows = [];
    function lazy_scroll(row, t=1000) {
        rows.unshift(row);

        function update() {
            for(let r of rows) {
                const e = document.querySelector(`[data-line="${r}"]`);
                if(e) {
                    console.log('Scroll to', r, rows, e);
                    e.scrollIntoView(true)
                    break
                }
            }
            timer = undefined;
            rows = [];
        }

        if(timer !== undefined) {
            clearTimeout(timer);
        }
        timer = setTimeout(update, t);
    }

    editor.getSession().on('changeScrollTop', (/*scroll*/) => {
        const r = editor.getFirstVisibleRow();
        lazy_scroll(r);
    });

    let crnt_row = 0;
    editor.getSession().selection.on('changeCursor', () => {
        const cr = editor.selection.getCursor().row;
        if(crnt_row != cr) {
            crnt_row = cr;

            const r = editor.getFirstVisibleRow();
            lazy_scroll(r);
        }
    })

    function update() {
        viewer.innerHTML = change_func(editor.getSession().getValue());
    }

    editor.getSession().on('change', update);
    update();
}

function enableDrawio(editor, elm, get_url) {
    elm.addEventListener('click', () => {
        //let r = editor.selection.getCursor().row;
        let r = editor.getCursorPosition().row;
        let t = editor.session.getLine(r);

        let target_line;
        let find_markup = false;
        if(!t.match(/^:::\s*drawio$/)) {
            let nr = r - (t.match(/^:::\s*$/) ? 2 : 1);
            let nt = editor.session.getLine(nr);

            if(nt.match(/^:::\s*drawio$/)) {
                // find drawio markup
                target_line = nr + 1;
                find_markup = true;
            } else {
                target_line = r;
            }
        } else {
            target_line = r + 1;
            find_markup = true;
        }

        let draft_key = `.draft-${target_line}`;

        let draft = localStorage.getItem(draft_key);
        if (draft != null) {
            draft = JSON.parse(draft);
            if (!confirm("A version of this page from " + new Date(draft.lastModified) + " is available. Would you like to continue editing?")) {
                draft = null;
            }
        }

        edit((base64) => {
            if(!find_markup) {
                base64 = `:::drawio\n${base64}\n:::`
            }

            editor.session.replace({
                start: {row: target_line, column: 0},
                end: {row: target_line, column: Number.MAX_VALUE},
            }, base64);
        })

        function edit(callback) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('frameborder', '0');
            iframe.classList.add('z-10');

            var close = function () {
                window.removeEventListener('message', receive);
                document.body.removeChild(iframe);
            };

            var receive = function (evt) {
                if (evt.data.length > 0) {
                    const msg = JSON.parse(evt.data);

                    // If configure=1 URL parameter is used the application
                    // waits for this message. For configuration options see
                    // https://desk.draw.io/support/solutions/articles/16000058316
                    if (msg.event == 'configure') {
                        // Configuration example
                        iframe.contentWindow.postMessage(JSON.stringify({
                            action: 'configure',
                            config: { defaultFonts: ["Humor Sans", "Helvetica", "Times New Roman"] }
                        }), '*');
                    }
                    else if (msg.event == 'init') {
                        if (draft) {
                            iframe.contentWindow.postMessage(JSON.stringify({
                                action: 'load',
                                autosave: 1, xml: draft.xml
                            }), '*');
                            iframe.contentWindow.postMessage(JSON.stringify({
                                action: 'status',
                                modified: true
                            }), '*');
                        }
                        else {
                            // Avoids unescaped < and > from innerHTML for valid XML
                            let svg = "";
                            if(find_markup) {
                                const line = editor.session.getLine(target_line);
                                svg = line ? atob(line) : "";
                            }

                            iframe.contentWindow.postMessage(JSON.stringify({
                                action: 'load',
                                autosave: 1, xml: svg
                            }), '*');
                        }
                    }
                    else if (msg.event == 'export') {
                        // Extracts SVG DOM from data URI to enable links
                        const svg = msg.data.substring(msg.data.indexOf(',') + 1);

                        callback(svg);
                        localStorage.removeItem(draft_key);
                        draft = null;
                        close();
                    }
                    else if (msg.event == 'autosave') {
                        localStorage.setItem(draft_key, JSON.stringify({ lastModified: new Date(), xml: msg.xml }));
                    }
                    else if (msg.event == 'save') {
                        iframe.contentWindow.postMessage(JSON.stringify({
                            action: 'export',
                            format: 'xmlsvg', xml: msg.xml, spin: 'Updating page'
                        }), '*');
                        localStorage.setItem(draft_key, JSON.stringify({ lastModified: new Date(), xml: msg.xml }));
                    }
                    else if (msg.event == 'exit') {
                        localStorage.removeItem(draft_key);
                        draft = null;
                        close();
                    }
                }
            };

            window.addEventListener('message', receive);
            iframe.setAttribute('src', get_url());
            document.body.appendChild(iframe);
        }
    });
}

export { enableViewer, enableDrawio }