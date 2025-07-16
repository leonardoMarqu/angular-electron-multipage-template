import {app} from 'electron'

app.on('ready', () => {
    console.log('App on activate')
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        console.log('App quit')
        app.quit()
    }
})

app.on('activate', () => {
    console.log('App activate')
})