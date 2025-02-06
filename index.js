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
      frame: false,
      webPreferences: {
        webviewTag: true,
        nodeIntegration: true,
        contextIsolation: false,
        backgroundThrottling: false,
        allowRunningInsecureContent: true,
      },
    })

    app.on('second-instance', () => {
      if (window) window.focus()
      if (window && window.isMinimized()) window.restore()
    })

    if (app.isPackaged) {
      window.loadURL('https://superelf.netlify.app/')
    } else {
      window.loadURL('http://localhost:5173/')
    }

    ipcMain.handle('EVAL', (_, code) => eval(code))
  })

  app.on('window-all-closed', () => app.quit())
} else {
  app.quit()
}
