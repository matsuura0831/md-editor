const { app, BrowserWindow } = require('electron');
const path = require('path')
const url = require('url')

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        width: 800,
        height: 600,
    });

    let p = path.join(__dirname, '../build', 'index.html');
    console.log(__dirname, p);

    mainWindow.loadURL(url.format({
        pathname: p,
        protocol: 'file:',
        slashes: true
      }))

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});