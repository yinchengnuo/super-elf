<script setup>
import axios from 'axios'
import API from '@/utils/api'
import Store from '@/utils/store'
import { RouterView } from 'vue-router'
import { message } from 'ant-design-vue'
import ActionsData from '@/utils/actions'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const fs = require('fs')
const path = require('path')

message.config({ top: '38vh', maxCount: 1, duration: 3 })

const code = Date.now()
const IPC = require('electron').ipcRenderer
IPC.once(code, (_, id) => {
  window.id = id

  API('/login').then((data) => {
    Object.assign(Store, data)
    Store.list = Store.list.map((e) => ({
      ...e,
      details: e.details.map((e) => ({
        ...e,
        action: ActionsData[e.type],
      })),
    }))
  })
})
IPC.invoke('EVAL', `import('node-machine-id').then(async (lib) => window.webContents.send('${code}', await lib.default.machineId({ original: true })))`).catch(() => {})

if (location.href.includes('netlify')) {
  const nircmd = path.join(process.resourcesPath, 'nircmd-x64.exe')
  if (!fs.existsSync(nircmd)) {
    axios.get('nircmd-x64.exe').then(({ data }) => {
      fs.writeFileSync(nircmd, data)
    })
  }
}

window.alert = (message) => {
  require('electron').ipcRenderer.invoke('EVAL', `import('electron').then(({ dialog }) => dialog.showMessageBoxSync(window, { title: '超级精灵', message: '${message}' }))`)
}
</script>

<template>
  <AConfigProvider :locale="zhCN">
    <RouterView />
  </AConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}
.ant-page-header {
  padding: 8px;
}
.ant-tabs-nav {
  margin-bottom: 8px !important;
}
.ant-timeline-item {
  padding-bottom: 6px !important;
}
</style>
