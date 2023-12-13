import { join } from 'node:path'
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} from 'electron'

const isDev = process.env.npm_lifecycle_event === 'app:dev' ? true : false

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: 'Open File' })
    if (!canceled) {
        return filePaths[0]
    }
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 750,
        height: 494,
        frame: false,
        resizable: false,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
        },
    })

    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000')// Open the DevTools.
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(join(__dirname, '../../index.html'))
    }
    // mainWindow.loadURL( //this doesn't work on macOS in build and preview mode
    //     isDev ?
    //     'http://localhost:3000' :
    //     join(__dirname, '../../index.html')
    // );
}

app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    ipcMain.on('quit', (evt: any) => {
        app.quit()
    })

    ipcMain.on('minimize', (evt: any) => {
        app.hide()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
