import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('ignore-certificate-errors')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = undefined
const gotTheLock = app.isPackaged ? app.requestSingleInstanceLock({}) : true
if (gotTheLock) {
    app.whenReady().then(() => {
        powerSaveBlocker.start('prevent-display-sleep')
        const window = new BrowserWindow({
            show: false,
            webPreferences: { webviewTag: true, nodeIntegration: true, contextIsolation: false, allowRunningInsecureContent: true }
        })
        if (process.platform === 'win32') window.maximize()
        if (process.platform === 'darwin') window.setFullScreen(true)
        app.on('second-instance', () => {
            if (window) window.focus()
            if (window && window.isMinimized()) window.restore()
        })
        if (app.isPackaged) {
            window.loadURL('http://localhost:5173/')
        } else {
            window.loadURL('http://localhost:5173/')
        }
        ipcMain.handle('EVAL', (_, code) => eval(code))
        window.webContents.once('did-finish-load', () => window.show())
    })
    app.on('window-all-closed', () => app.quit())
} else {
    app.quit()
}
