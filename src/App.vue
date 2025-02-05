<script setup>
import { RouterView } from 'vue-router'
import { message } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import api from '@/utils/api'

message.config({ top: '38vh', maxCount: 1, duration: 3 })

const code = Date.now()
const IPC = require('electron').ipcRenderer
IPC.once(code, (_, id) => {
  window.id = id

  api('/login').then((res) => {
    console.log(res)
  })
})
IPC.invoke('EVAL', `import('node-machine-id').then(async (lib) => window.webContents.send('${code}', await lib.default.machineId()))`).catch(() => {})
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
