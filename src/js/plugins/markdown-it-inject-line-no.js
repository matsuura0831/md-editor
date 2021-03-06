module.exports = (md) => {
    function injectLineNumbers(tokens, idx, options, env, slf) {
        if (tokens[idx].map) {
            const line = tokens[idx].map[0];
//            tokens[idx].attrJoin('class', 'source-line');
            tokens[idx].attrSet('data-line', String(line));
        }
        return slf.renderToken(tokens, idx, options, env, slf);
    }

    md.renderer.rules.paragraph_open = injectLineNumbers;
    md.renderer.rules.heading_open = injectLineNumbers;
    md.renderer.rules.list_item_open = injectLineNumbers;
    md.renderer.rules.table_open = injectLineNumbers;
};