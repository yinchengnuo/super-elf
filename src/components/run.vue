<script setup>
import { runAction } from '@/utils'
import Actions from './Actions.vue'
import image from '@/assets/logo.png'
import { Modal } from 'ant-design-vue'
import { ref, reactive, watch, nextTick, h } from 'vue'

const stepRefs = ref([])
const EMITS = defineEmits('to')
const PROPS = defineProps(['activeKey'])
const IPC = require('electron').ipcRenderer

const state = reactive({
  elf: {},
  time: 0,
  count: 0,
  current: 0,
  running: false,
  loopWaitting: 0,
  loopWaittingTime: 0,
  start: Date.now(),
  log: [],
})

try {
  if (localStorage.getItem('running')) {
    state.elf = JSON.parse(localStorage.getItem('running'))
  }
} catch (_) {}

watch(
  () => PROPS.activeKey,
  () => {
    if (PROPS.activeKey === 1) {
      if (sessionStorage.getItem('_run')) {
        localStorage.setItem('running', sessionStorage.getItem('_run'))
        state.elf = JSON.parse(sessionStorage.getItem('_run'))
        sessionStorage.removeItem('_run')
      }
    }
  },
)
let timer

const getTime = () => ` ${new Date().toLocaleString()}.${new Date().getTime().toString().slice(-3)}`

let modal
const restore = () => {
  if (modal) modal?.destroy()
  modal = Modal.info({
    centered: true,
    title: '自动操作已结束',
    content: `共运行了 ${state.count} 次，执行了 ${state.count * state.elf.details.length + state.current + 1} 次操作，耗时 ${formatDuration(state.time)}`,
  })
  IPC.invoke('EVAL', `window.setAlwaysOnTop(true, 'screen-saver')`)
  setTimeout(() => IPC.invoke('EVAL', `window.focus()`))
  setTimeout(() => IPC.invoke('EVAL', `window.setAlwaysOnTop(false, 'screen-saver')`), 123)
}

const task = async () => {
  let running = true
  state.loopWaitting = 0
  for (const item of state.elf.details) {
    if (running === false) break
    state.current = state.elf.details.indexOf(item)
    nextTick(() => stepRefs.value[state.current].$el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    await runAction(item, state.elf.details, state.count + 1)
      .then(() => state.log.unshift({ id: Date.now().toString(), name: '执行成功', item, color: 'green', time: `${getTime()}` }))
      .catch((e) => {
        running = false
        if (e === true) {
          stop()
        } else {
          state.log.unshift({ id: Date.now().toString(), name: '执行失败：逻辑终止', item, color: 'red', time: `${getTime()}` })
        }
      })
      .finally(() => nextTick(() => (state.log = state.log.slice(0, 100))))
    if (state.running === false) {
      return state.log.unshift({ id: Date.now().toString(), name: '自动操作结束', color: 'green', time: `${getTime()}` })
    }
    await new Promise((resolve) => setTimeout(resolve, (state.elf.delay || 0) * 1000))
  }
  state.count++
  if (state.elf.loop) {
    if (state.count < state.elf.count) {
      if (state.running) {
        state.loopWaitting = Date.now()
        state.timer = setTimeout(() => {
          task()
        }, state.elf.interval * 1000)
      }
    } else {
      stop()
      state.log.unshift({ id: Date.now().toString(), name: '自动操作结束', color: 'green', time: `${getTime()}` })
    }
  } else {
    stop()
  }
}

const run = async () => {
  Modal.confirm({
    centered: true,
    title: '确认开始自动操作',
    content: h('ol', { style: 'color:red;' }, [h('li', '自动操作开始后请勿操作键盘鼠标，以免造成误操作'), h('li', '使用键盘左上角的 Esc 键可退出自动操作')]),
    onOk() {
      IPC.once('esc', () => {
        stop()
        IPC.invoke('EVAL', `import('electron').then(({ globalShortcut }) => globalShortcut.unregister('Escape'))`).catch(() => {})
      })
      IPC.invoke('EVAL', `import('electron').then(({ globalShortcut }) => globalShortcut.register('Escape', () => window.webContents.send('esc')))`).catch(() => {})
      state.time = 0
      state.count = 0
      state.current = 0
      state.running = true
      state.log.length = 0
      state.start = Date.now()
      timer = setInterval(() => {
        state.time = Date.now() - state.start
        if (state.loopWaitting) {
          state.loopWaittingTime = Date.now() - state.loopWaitting
        } else {
          state.loopWaittingTime = 0
        }
        if (state.elf.loop) {
          if (state.loopWaittingTime) {
            localStorage.setItem('clock', `<h1 style="color: red; line-height: 100vh; text-align: center; font-size: 50vh; opacity: 0.1">${Math.ceil((state.elf.interval * 1000 - state.loopWaittingTime) / 1000)}</h1>`)
          } else {
            localStorage.setItem('clock', ``)
          }
        }
      })
      if (state.elf.loop) {
        if (state.elf.iife) {
          task()
        } else {
          state.loopWaitting = Date.now()
          state.timer = setTimeout(() => {
            task()
          }, state.elf.interval * 1000)
        }
        if (state.elf.clock) {
          IPC.invoke(
            'EVAL',
            `try{ process._c.close(); process._c.destory() }catch(_){};
            process._c = new BrowserWindow({ frame: false, transparent: true, alwaysOnTop: true, skipTaskbar: true });
            process._c.loadURL('${location.origin}/clock.html');
            process._c.setIgnoreMouseEvents(true)
            `,
          )
        }
      } else {
        task()
      }
      if (state.elf.hide) {
        IPC.invoke('EVAL', `window.minimize()`)
      }
    },
  })
}

const stop = () => {
  restore()
  clearInterval(timer)
  state.running = false
  clearTimeout(state.timer)
  state.elf.hide && IPC.invoke('EVAL', `window.restore()`)
  IPC.invoke('EVAL', `try{ process._c.close(); process._c.destory() }catch(_){};`)
}

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${milliseconds.toString().slice(-3)}`
}
</script>

<template>
  <div style="">
    <div v-if="state.elf.name">
      <a-page-header :title="state.elf.name" :sub-title="state.elf.desc">
        <template #tags>
          <a-tag :color="state.running ? 'error' : 'processing'">{{ state.running ? '运行中' : '未运行' }}</a-tag>
          <a-tag v-if="state.running && state.elf.loop" color="error">{{ state.loopWaitting ? '循环操作等待中：预计还需等待 ' + Math.ceil((state.elf.interval * 1000 - state.loopWaittingTime) / 1000) + ' 秒' : '循环操作执行中' }}</a-tag>
        </template>
        <a-descriptions size="small" :column="3">
          <a-descriptions-item label="运行时隐藏本应用">
            <a-tag>{{ state.elf.hide ? '是' : '否' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作间隔">
            <a-tag>{{ state.elf.delay }}秒</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="循环间隔">
            <a-tag>{{ state.elf.loop ? state.elf.interval + '秒' : '不循环' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="循环次数">
            <a-tag>{{ state.elf.loop ? state.elf.count + '次' : '不循环' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="运行后立即执行">
            <a-tag>{{ state.elf.loop ? (state.elf.iife ? '是' : '否') : '不循环' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="循环间隔倒计时">
            <a-tag>{{ state.elf.loop ? (state.elf.clock ? '是' : '否') : '不循环' }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
        <template #extra>
          <a-button v-if="!state.running" type="primary" @click="run">运行</a-button>
        </template>
      </a-page-header>
      <div style="display: flex">
        <a-card title="运行步骤" size="small" style="flex: 1" :bodyStyle="{ height: 'calc(100vh - 286px)', padding: '16px', overflow: 'auto' }">
          <template #extra>
            <a-button v-if="state.count" type="link">已运行 {{ state.count }} 次</a-button>
          </template>
          <a-steps direction="vertical" :current="state.current">
            <a-step v-for="(item, index) in state.elf.details" :key="item.id" :ref="(el) => (stepRefs[index] = el)">
              <template #title>{{ item.type }}</template>
              <template #description>
                <Actions :item="item" />
              </template>
            </a-step>
          </a-steps>
        </a-card>
        <a-divider type="vertical" style="height: calc(100vh - 252px)" />
        <a-card title="运行日志" size="small" style="flex: 1" :bodyStyle="{ height: 'calc(100vh - 286px)', padding: '16px', overflow: 'auto' }">
          <template #extra>
            <a-button v-if="state.time" type="link">已运行 {{ formatDuration(state.time).split('.')[0] }}</a-button>
          </template>
          <a-timeline v-if="state.log.length">
            <a-timeline-item v-for="item in state.log" :key="item.id" :color="item.color">
              <div>{{ item.time }}</div>
              <a-tag v-if="item.name === '执行成功'" color="success">{{ item.name }}</a-tag>
              <a-tag v-else-if="item.name === '开始失败'" color="error">{{ item.name }}</a-tag>
              <a-tag v-else>{{ item.name }}</a-tag>
              <Actions v-if="item.item" :item="item.item" text />
            </a-timeline-item>
          </a-timeline>
          <a-empty v-else :image="image" description="暂无日志" style="margin-top: 25%" />
        </a-card>
      </div>
    </div>
    <div v-else style="height: calc(100vh - 128px); display: flex; flex-direction: column; align-items: center; justify-content: center">
      <a-empty :image="image" description="暂无运行中的超级精灵" />
      <a-divider />
      <a-space>
        <a-button size="large" type="primary" @click="EMITS('to', 2)">去制作</a-button>
        <a-button size="large" type="primary" @click="EMITS('to', 3)">去管理</a-button>
      </a-space>
    </div>
  </div>
</template>
