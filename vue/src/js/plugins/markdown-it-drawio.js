module.exports = (md) => {
    md.use(require('./markdown-it-fence'), 'drawio', {
        marker: ':',
        validate: (params) => params.trim().match(/^drawio$/),
        renderer: (token, idx) => {
            const svg = atob(token[idx].content);
            return `<div class="max-w-full bg-white border border-gray-400 p-2">${svg}</div>`;
        },
    });
}