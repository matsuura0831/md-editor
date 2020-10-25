module.exports = (md) => {
    const messages = {
        info:    ['<i class="fas fa-info-circle"></i>', "info"],
        success: ['<i class="fas fa-check"></i>', "success"],
        warn:    ['<i class="fas fa-exclamation-triangle"></i>', "warning"],
        warning: ['<i class="fas fa-exclamation-triangle"></i>', "warning"],
        error:   ['<i class="fas fa-times"></i>', "error"],
    };
    const re = new RegExp(`^(${Object.keys(messages).join('|')})(\\s+.+)?$`);

    md.use(require('./markdown-it-fence'), 'message', {
        marker: ':',
        validate: (params) => params.trim().match(re),
        renderer: (token, idx) => {
            const l = token[idx].map[0];

            const {info:_info, content} = token[idx];
            const info = _info.trim();

            const [_mode, _title] = info.split(/\s+/, 2);
            const [icon, mode] = messages[_mode];
            const title = _title || mode;

            return `
        <div data-line="${l}" class="message-${mode} flex flex-row items-center m-2 p-2 rounded border-b-2">
            <div class="message-icon flex items-center border-2 justify-center h-8 w-8 flex-shrink-0 rounded-full">
                <span>${icon}</span>
            </div>
            <div class="message-content ml-4">
                <div class="message-title font-semibold text-lg">${title}</div>
                <div class="message-description text-sm">${content.replace(/\n/g, "<br/>\n")}</div>
            </div>
        </div>
            `
        },
    });
}