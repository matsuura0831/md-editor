const src = `${__dirname}/src`

const purgecss = require("@fullhuman/postcss-purgecss")({
    content: [`${src}/**/*.html`, `${src}/**/*.vue`, `${src}/**/*.js`],
    defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
        return broadMatches.concat(innerMatches)
    },
    whitelistPatterns: [
        /^vex.*/,
        /^hljs.*/,
        /^ace.*/,
    ],

});

module.exports = {
    plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
        ...(process.env.NODE_ENV === "production" ? [purgecss] : [])
    ]
};