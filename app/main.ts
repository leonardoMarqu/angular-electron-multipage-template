import { app } from 'electron'
import MultiWindowBrowserService from './services/multiWindowService'
import * as path from 'path'

const windowService = MultiWindowBrowserService.getInstance()

app.on('ready', () => {
    windowService.createGroup('main', 1, true)
    windowService.createWindow('main', 'main1', {
        width: 800,
        height: 600,
        type: 'url',
        url: 'http://localhost:4200',
        openDevTools: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Caminho absoluto!
            contextIsolation: true,
            nodeIntegration: false
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log('App quit')
        app.quit()
    }
})

app.on('activate', () => {

})