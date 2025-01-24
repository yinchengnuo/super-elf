<script setup>
import { reactive } from 'vue'
import logo from '@/assets/logo.png'
import make from '@/components/make.vue'
import list from '@/components/list.vue'
import example from '@/components/example.vue'
import JavaScript from '@/components/JavaScript.vue'

import { MinusOutlined, CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'

const state = reactive({
  status: 0,
  activeKey: 1
})

const IPC = require('electron').ipcRenderer

const getWindowStatus = () => {
  const code = Date.now()
  IPC.once(code, (_, is) => {
    if (is) {
      state.status = 1
    }
    IPC.once(code, (_, is) => {
      if (is) {
        state.status = -1
      }
    })
    IPC.invoke('EVAL', `window.webContents.send('${code}', window.isMinimized())`).catch(() => { })
  })
  IPC.invoke('EVAL', `window.webContents.send('${code}', window.isMaximized())`).catch(() => { })
}
getWindowStatus()

document.onvisibilitychange = getWindowStatus

const mini = () => {
  state.status = -1
  IPC.invoke('EVAL', `window.minimize()`)
}

const full = () => {
  IPC.invoke('EVAL', `window.${state.status ? 'unmaximize' : 'maximize'}()`).catch(() => { })
  state.status = state.status ? 0 : 1
}

const close = () => {
  IPC.invoke('EVAL', `app.quit()`).catch(() => { })
}
</script>

<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="超级精灵" sub-title="简约强大的键鼠自动操作编排工具"
    :avatar="{ src: logo }">
    <template #tags>
      <a-tag color="blue">试用版</a-tag>
    </template>
    <template #extra>
      <a-button shape="circle">
        <MinusOutlined @click="mini" />
      </a-button>
      <a-button shape="circle" @click="full">
        <FullscreenOutlined v-if="state.status === 0" />
        <FullscreenExitOutlined v-else />
      </a-button>
      <a-button shape="circle">
        <CloseOutlined @click="close" />
      </a-button>
    </template>
  </a-page-header>
  <div style="padding: 0 8px">
    <a-tabs v-model:activeKey="state.activeKey">
      <a-tab-pane :key="1" tab="超级精灵运行">
        <example :activeKey="state.activeKey" />
      </a-tab-pane>
      <a-tab-pane :key="2" tab="超级精灵制作">
        <make :activeKey="state.activeKey" @save="state.activeKey = 3" @more="state.activeKey = 4" />
      </a-tab-pane>
      <a-tab-pane :key="3" tab="超级精灵管理">
        <list :activeKey="state.activeKey" @run="state.activeKey = 1" />
      </a-tab-pane>
      <a-tab-pane :key="4" tab="常用JavaScript脚本">
        <JavaScript :activeKey="state.activeKey" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
