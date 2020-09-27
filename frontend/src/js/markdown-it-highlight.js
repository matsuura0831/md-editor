const hljs = require('highlight.js')

module.exports = (md) => {
    const hilight_plugins = {
        'after:highlight': function (ctx) {
            const nb_enter = ctx.code.split('\n').length;
            const spans = [...Array(nb_enter - 1).keys()].map((i) => { return '<span></span>' }).join('\n')

            ctx.value += `<span class="line-number-rows">${spans}</span>`
        },
    }
    hljs.addPlugin(hilight_plugins);

    md.options.highlight = function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs language-${lang}"><code>` +
                    hljs.highlight(lang, code, true).value +
                    '</code></pre>';
            } catch (__) { }
        }
        return '<pre class="hljs"><code>' + hljs.highlight('plaintext', code, true).value + '</code></pre>';
    }
}