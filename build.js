import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { build, Platform } from 'electron-builder'

const Package = JSON.parse(fs.readFileSync(path.resolve('./package.json')).toString())

const target = process.env.npm_lifecycle_event.split(':')[1]

fs.existsSync(path.resolve('./build')) && execSync(`${process.platform === 'win32' ? 'rmdir /s /q' : 'rm -rf'} ${path.resolve('./build')}`)

fs.mkdirSync(path.resolve('./build'))

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

if (target === 'mac') await build({ config: Package.build, targets: Platform.MAC.createTarget() })

if (target === 'win') await build({ config: Package.build, targets: Platform.WINDOWS.createTarget() })
