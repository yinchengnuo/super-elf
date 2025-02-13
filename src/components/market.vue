<script setup>
import { message } from 'ant-design-vue'

const list = [
  {
    mac: true,
    win: true,
    type: 'info',
    name: '应用最小化恢复',
    code: "require('child_process').execSync(`${require('path').join(process.resourcesPath,'/nircmd.exe')} win activate title 超级精灵`);",
  },
  {
    mac: true,
    win: true,
    type: 'info',
    name: '应用最小化',
    code: `require('electron').ipcRenderer.invoke('EVAL', 'window.minimize()')`,
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
  eval(`(async () => {
    ${item.code}
  })()`)
}
</script>

<template>
  <div style="height: calc(100vh - 120px); overflow: auto">
    123
  </div>
</template>
