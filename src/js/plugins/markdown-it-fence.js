module.exports = (md, name, opt) => {
    function validateDefault(params/*, markup*/) {
        return params.trim().split(' ', 2)[0] === name;
    }

    function renderDefault(tokens, idx, _options, env, slf) {
        if (tokens[idx].nesting === 1) {
            tokens[idx].attrJoin('class', name);
        }

        return slf.renderToken(tokens, idx, _options, env, slf);
    }

    const {
        marker = ':',
        renderer = renderDefault,
        validate = validateDefault,
    } = opt || {};

    const min_markers = 3,
            marker_char = marker.charCodeAt(0),
            marker_len = marker.length;

    function parser(state, startLine, endLine, silent) {
        let pos;
        let auto_closed = false,
            start = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];

        // Check out the first character quickly,
        // this should filter out most of non-containers
        if (marker_char !== state.src.charCodeAt(start)) { return false; }

        // Check out the rest of the marker string
        for (pos = start + 1; pos <= max; pos++) {
            if (marker[(pos - start) % marker_len] !== state.src[pos]) {
                break;
            }
        }

        let marker_count = Math.floor((pos - start) / marker_len);
        if (marker_count < min_markers) { return false; }
        pos -= (pos - start) % marker_len;

        let markup = state.src.slice(start, pos);
        let params = state.src.slice(pos, max);
        if (!validate(params, markup)) { return false; }

        // Since start is found, we can report success here in validation mode
        if (silent) { return true; }

        // Search for the end of the block
        let nextLine = startLine;

        for (; ;) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            start = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (start < max && state.sCount[nextLine] < state.blkIndent) {
                // non-empty line with negative indent should stop the list:
                // - ```
                //  test
                break;
            }

            if (marker_char !== state.src.charCodeAt(start)) { continue; }

            if (state.sCount[nextLine] - state.blkIndent >= 4) {
                // closing fence should be indented less than 4 spaces
                continue;
            }

            for (pos = start + 1; pos <= max; pos++) {
                if (marker[(pos - start) % marker_len] !== state.src[pos]) {
                    break;
                }
            }

            // closing code fence must be at least as long as the opening one
            if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

            // make sure tail has spaces only
            pos -= (pos - start) % marker_len;
            pos = state.skipSpaces(pos);

            if (pos < max) { continue; }

            // found!
            auto_closed = true;
            break;
        }

        let len = state.sCount[startLine];
        let token = state.push(name, 'div', 0);
        token.info = params;
        token.markup = markup;
        token.content = state.getLines(startLine + 1, nextLine, len, true);
        token.map = [startLine + 1, nextLine];
        token.block = true;

        state.line = nextLine + (auto_closed ? 1 : 0);
        return true;
    }

    md.block.ruler.before('fence', name, parser, {
        alt: ['paragraph', 'reference', 'blockquote']
    });
    md.renderer.rules[name] = renderer;
}