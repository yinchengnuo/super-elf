// 导入文件系统模块
import fs from 'fs'
// 导入路径模块
import path from 'path'
// 导入子进程模块中的execSync函数
import { execSync } from 'child_process'
// 导入electron-builder模块中的build和Platform
import { build, Platform } from 'electron-builder'

// 读取并解析package.json文件
const Package = JSON.parse(fs.readFileSync(path.resolve('./package.json')).toString())

// 获取npm生命周期事件的目标平台
const target = process.env.npm_lifecycle_event.split(':')[1]

// 如果build目录存在，则删除它
fs.existsSync(path.resolve('./build')) && execSync(`${process.platform === 'win32' ? 'rmdir /s /q' : 'rm -rf'} ${path.resolve('./build')}`)

// 创建build目录
fs.mkdirSync(path.resolve('./build'))

// 写入installer.nsh文件，设置安装路径
fs.writeFileSync(
  path.resolve('./build/installer.nsh'),
  `!macro preInit
    SetRegView 64
      WriteRegExpandStr HKLM "\${INSTALL_REGISTRY_KEY}" InstallLocation "C:\\${Package.build.appId}"
      WriteRegExpandStr HKCU "\${INSTALL_REGISTRY_KEY}" InstallLocation "C:\\${Package.build.appId}"
      SetRegView 32
      WriteRegExpandStr HKLM "\${INSTALL_REGISTRY_KEY}" InstallLocation "C:\\${Package.build.appId}"
      WriteRegExpandStr HKCU "\${INSTALL_REGISTRY_KEY}" InstallLocation "C:\\${Package.build.appId}"
    !macroend`,
)

// 如果目标平台是macOS，则构建macOS应用
if (target === 'mac') await build({ config: Package.build, targets: Platform.MAC.createTarget() })

// 如果目标平台是Windows，则构建Windows应用
if (target === 'win') await build({ config: Package.build, targets: Platform.WINDOWS.createTarget() })
