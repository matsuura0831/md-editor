module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "mde",
                appId: "com.besolab.md.editor",
                win: {
                    icon: 'src/assets/app.ico',
                    target: [
                        {
                            target: 'zip', // 'zip', 'nsis', 'portable'
                            arch: ['x64'] // 'x64', 'ia32'
                        }
                    ]
                }
            }
        }
    }
}