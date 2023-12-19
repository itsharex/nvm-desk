import { join } from 'node:path'

import { spawn } from 'node:child_process'
import { app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, Tray } from 'electron'
import { createSchema, getSchema, setSchema } from '../../utils/storage.js'

const isDev = process.env.npm_lifecycle_event === 'app:dev' ? true : false

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 750,
        height: 494,
        frame: false,
        resizable: false,
        icon: join(__dirname, '../../../src/assets/img/logo-256x256.png'),
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
        },
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(join(__dirname, '../../index.html'))
    }

    mainWindow.webContents.on('dom-ready', () => {
        createSchema()
        const config = getSchema()

        mainWindow.webContents.send('setPlatform', process.platform)
        mainWindow.webContents.send('getConfig', config)
    })
}

function createTray() {
    const icon = nativeImage.createFromPath(join(__dirname, '../../../src/assets/img/logo-32x32.ico'))
    const tray = new Tray(icon)

    const item: any = [
        { label: '1' },
        { type: 'separator' },
        { label: 'Quit', click: () => app.exit() }
    ]
    const contextMenu = Menu.buildFromTemplate(item)

    tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
    createWindow()
    createTray()

    ipcMain.on('quit', () => app.quit())
    ipcMain.on('minimize', () => app.hide())
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
            if (param.args[0] === 'install') {
                evt.reply('streamCommand', data)
            } else {
                result = String(data).split('\n')
            }
        })

        cmd.stdout.on('end', () => {
            evt.reply('resCommand', { result, os: process.platform })
        })
    })

    ipcMain.on('setConfig', (_, config) => {
        setSchema({ config })
    })

    ipcMain.on('showNotification', (_, param) => new Notification(param).show())
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
