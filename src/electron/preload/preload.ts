import { contextBridge, ipcRenderer } from 'electron'

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: any, text: any) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${ dependency }-version`, process.versions[dependency])
    }
})

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel: any, data: any) => {
        const validChannels = ['quit', 'minimize']

        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
        }
    },
    receive: (channel: any, func: any) => {
        const validChannels = ['test']

        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args))
        }
    }
    // openFile: () => ipcRenderer.invoke('dialog:openFile')
})
