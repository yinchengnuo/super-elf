<script setup>
import { reactive } from 'vue'
import Store from '@/utils/store'
import logo from '@/assets/logo.png'
import run from '@/components/run.vue'
import make from '@/components/make.vue'
import list from '@/components/list.vue'
import market from '@/components/market.vue'
import JavaScript from '@/components/JavaScript.vue'

import { MinusOutlined, CloseOutlined } from '@ant-design/icons-vue'

const state = reactive({
  activeKey: 1,
})

const IPC = require('electron').ipcRenderer

const mini = () => {
  IPC.invoke('EVAL', `window.minimize()`)
}

const close = () => {
  IPC.invoke('EVAL', `try{ process._c.close(); process._c.destory() }catch(_){};`)
  IPC.invoke('EVAL', `app.quit()`).catch(() => {})
}

IPC.invoke('EVAL', `window.maximize()`).catch(() => {})
</script>

<template>
  <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="超级精灵" sub-title="简约强大的键鼠自动操作编排工具">
    <template #tags>
      <a-tag color="blue">点我定制</a-tag>
    </template>
    <template #avatar>
      <a-dropdown>
        <img :src="logo" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px" />
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;">ID：{{ Store.id }}</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">机器码：{{ Store.Machine }}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>

    <template #extra>
      <a-button shape="circle">
        <MinusOutlined @click="mini" />
      </a-button>
      <a-button shape="circle">
        <CloseOutlined @click="close" />
      </a-button>
    </template>
  </a-page-header>
  <div style="padding: 0 8px">
    <a-tabs v-model:activeKey="state.activeKey">
      <a-tab-pane :key="1" tab="超级精灵运行">
        <run :activeKey="state.activeKey" @to="(activeKey) => (state.activeKey = activeKey)" />
      </a-tab-pane>
      <a-tab-pane :key="2" tab="超级精灵制作">
        <make :activeKey="state.activeKey" @save="state.activeKey = 3" @more="state.activeKey = 4" />
      </a-tab-pane>
      <a-tab-pane :key="3" tab="超级精灵管理">
        <list :activeKey="state.activeKey" @run="state.activeKey = 1" />
      </a-tab-pane>
      <a-tab-pane :key="4" tab="超级精灵市场">
        <market :activeKey="state.activeKey" @buy="state.activeKey = 1" @run="state.activeKey = 1" />
      </a-tab-pane>
      <a-tab-pane :key="5" tab="常用JavaScript脚本">
        <JavaScript :activeKey="state.activeKey" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
