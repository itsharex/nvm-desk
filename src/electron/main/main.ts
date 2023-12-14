import { join } from 'node:path'
import { spawn } from 'node:child_process'
import {
    app,
    BrowserWindow,
    ipcMain,
} from 'electron'

const isDev = process.env.npm_lifecycle_event === 'app:dev' ? true : false

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

    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.send('setPlatform', process.platform)
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    ipcMain.on('quit', () =>  app.quit())
    ipcMain.on('minimize', () =>app.hide())
    ipcMain.on('runCommand', (evt: any, param: any) => {
        let result: string [] = []

        if (process.platform === 'darwin') {
            for (let i = 0; i < 10; i++) {
                result.push(`v21.4.0`)
            }
            evt.reply('resCommand', { result, os: process.platform })
            return
        }

        const cmd = spawn(param.cmd, param.args)

        cmd.stdout.on('data', data => {
            result = String(data).split('\n')
            console.log('-> ', result)
        })

        cmd.stdout.on('end', () => {
            evt.reply('resCommand', result)
        })
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
