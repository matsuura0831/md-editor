module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "mde",
                appId: "com.besolab.md.editor",
                win: {
                    icon: 'src/assets/app.ico',
                    target: "portable", // 'zip', 'nsis', 'portable'
                },
                linux: {
                    icon: 'src/assets/app.png',
                    target: "deb",
                    category: "Development"
                }
            }
        }
    }
}