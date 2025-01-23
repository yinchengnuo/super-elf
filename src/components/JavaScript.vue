<script setup>
import { message } from 'ant-design-vue';

const list = [
  {
    type: 'info',
    name: '本应用最小化',
    code: `require('electron').ipcRenderer.invoke('EVAL', 'window.minimize()')`
  },
  {
    type: 'info',
    name: '打开应用',
    code: `require('child_process').exec(require('path').join('C:', 'com.yinchengnuo.superelf', '超级精灵.exe'))`
  },
  {
    type: 'error',
    name: '关闭应用',
    code: `require('child_process').execSync('tasklist /FI "IMAGENAME eq 超级精灵.exe"').toString().trim().match(/.exe +\d+/g).map(e => +e.match(/\d+/g)[0])`
  }
]

const copy = (item) => {
  navigator.clipboard.writeText(item.code)
  message.success('复制成功')
}

const run = (item) => {
  eval(`(async () => {
    ${item.code}
  })()`)
}
</script>

<template>
  <div style="height: calc(100vh - 128px); overflow: auto">
    <a-space direction="vertical" style="width: 100%">
      <a-alert v-for="item in list" :key="item.name" :type="item.type">
        <template #message>
          <div>{{ item.name }}</div>
        </template>
        <template #description>
            <code>{{ item.code }}</code>
        </template>
        <template #action>
          <a-space>
            <a-button size="small" type="link" @click="copy(item)">复制</a-button>
            <a-button size="small" type="link" @click="run(item)">执行</a-button>
          </a-space>
        </template>
      </a-alert>
    </a-space>
  </div>
</template>
