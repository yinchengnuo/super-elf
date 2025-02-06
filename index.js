// 导入Electron模块
import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron'

// 禁用Node.js的TLS验证，允许不安全的连接
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// 在命令行中添加参数，禁用Web安全和忽略证书错误
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('ignore-certificate-errors')

// 清除Electron的安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = undefined

// 检查是否已经有一个实例在运行，如果是，则请求单实例锁
const gotTheLock = app.isPackaged ? app.requestSingleInstanceLock({}) : true

// 如果获取到锁，则继续执行应用程序
if (gotTheLock) {
  // 当Electron应用程序准备好时执行以下代码
  app.whenReady().then(() => {
    // 阻止显示器进入睡眠状态
    powerSaveBlocker.start('prevent-display-sleep')

    // 创建一个新的浏览器窗口
    const window = new BrowserWindow({
      // 隐藏窗口的默认框架
      frame: false,
      // 设置窗口的Web偏好设置
      webPreferences: {
        // 启用WebView标签
        webviewTag: true,
        // 启用Node.js集成
        nodeIntegration: true,
        // 禁用上下文隔离
        contextIsolation: false,
        // 允许运行不安全的内容
        allowRunningInsecureContent: true,
      },
    })

    // 当第二个实例启动时，聚焦到当前窗口
    app.on('second-instance', () => {
      if (window) window.focus()
      if (window && window.isMinimized()) window.restore()
    })

    // 如果应用程序已经打包，则加载生产环境的URL
    if (app.isPackaged) {
      window.loadURL('https://superelf.netlify.app/')
    } else {
      // 否则加载开发环境的URL
      window.loadURL('http://localhost:5173/')
    }

    // 处理来自渲染进程的'EVAL'事件，执行传入的代码
    ipcMain.handle('EVAL', (_, code) => eval(code))
  })

  // 当所有窗口关闭时，退出应用程序
  app.on('window-all-closed', () => app.quit())
} else {
  // 如果没有获取到锁，则退出应用程序
  app.quit()
}
