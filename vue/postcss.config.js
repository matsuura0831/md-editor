const src = `${__dirname}/src`

const purgecss = require("@fullhuman/postcss-purgecss")({
    content: [`${src}/**/*.html`, `${src}/**/*.vue`],
    /*
    defaultExtractor: (content) => {
        const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
        return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
    },
    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    */
    defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
        return broadMatches.concat(innerMatches)
    },
    whitelistPatterns: [
        /^vex.*/,
        /^hljs.*/,
        /^ace.*/,
        /*
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!cursor-move).+-move$/,
        /^router-link(|-exact)-active$/
        */
    ],

});

module.exports = {
    plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
        ...(process.env.NODE_ENV === "production" ? [purgecss] : [])
    ]
};