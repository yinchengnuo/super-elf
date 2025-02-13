<script setup>
import { message } from 'ant-design-vue'

const list = [
  {
    mac: true,
    win: true,
    type: 'info',
    name: '文本阅读',
    code: "speechSynthesis.speak(new SpeechSynthesisUtterance('欢迎使用超级精灵'))",
  },
  {
    mac: false,
    win: true,
    type: 'info',
    name: '应用最小化恢复',
    code: "require('child_process').execSync(`${require('path').join(process.resourcesPath,'/nircmd.exe')} win activate title 超级精灵`);",
  },
  {
    mac: true,
    win: true,
    type: 'info',
    name: '本应用最小化',
    code: `require('electron').ipcRenderer.invoke('EVAL', 'window.minimize()')`,
  },
  {
    mac: true,
    win: true,
    type: 'info',
    name: '本应用关闭',
    code: `require('electron').ipcRenderer.invoke('EVAL', 'app.quit()')`,
  },
  {
    mac: false,
    win: true,
    type: 'info',
    name: '打开应用',
    code: `require('child_process').exec(require('path').join('C:', 'com.yinchengnuo.superelf', '超级精灵.exe'))`,
  },
  {
    mac: false,
    win: true,
    type: 'error',
    name: '关闭应用',
    code: `require('child_process').execSync('tasklist /FI "IMAGENAME eq 超级精灵.exe"').toString().split(' ').filter(e => e && !isNaN(+e)).forEach((e, i) => i%2 === 0 && process.kill(+e))`,
  },
  {
    mac: false,
    win: true,
    type: 'error',
    name: '电脑关机',
    code: 'require("child_process").exec("shutdown /s /t 0")',
  },
  {
    mac: false,
    win: true,
    type: 'error',
    name: '电脑重启',
    code: 'require("child_process").exec("shutdown /r /t 0 /f")',
  },
]

const copy = (item) => {
  navigator.clipboard.writeText(item.code)
  message.success('复制成功')
}

const run = (item) => {
  if ((process.platform === 'win32' && item.win) || (process.platform === 'darwin' && item.mac)) {
    eval(`(async () => {
      ${item.code}
      })()`)
  } else {
    message.error('当前系统不支持此操作')
  }
}
</script>

<template>
  <div style="height: calc(100vh - 120px); overflow: auto">
    <a-space direction="vertical" style="width: 100%">
      <a-alert v-for="item in list" :key="item.name" :type="item.type">
        <template #message>
          <div>{{ item.name }}</div>
        </template>
        <template #description>
          <code>{{ item.code }}</code>
        </template>
        <template #action>
          <a-space direction="vertical">
            <a-space>
              <a-button size="small" type="link" @click="copy(item)">复制</a-button>
              <a-button size="small" type="link" danger @click="run(item)">执行</a-button>
            </a-space>
            <a-space>
              <a-tag v-if="item.win" color="processing">Win</a-tag>
              <a-tag v-if="item.mac" color="success">Mac</a-tag>
            </a-space>
          </a-space>
        </template>
      </a-alert>
    </a-space>
  </div>
</template>
