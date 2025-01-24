<script setup>
import { runAction } from '@/utils'
import Actions from './Actions.vue'
import image from '@/assets/logo.png'
import { ref, reactive, watch, nextTick } from 'vue'

const stepRefs = ref([])
const EMITS = defineEmits('to')
const PROPS = defineProps(['activeKey'])

const state = reactive({
  elf: {},
  time: 0,
  count: 0,
  current: 0,
  running: false,
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
    } else {
      if (state.running) {
        // 停止
      }
    }
  },
)
let timer

const task = async () => {
  for (const item of state.elf.details) {
    state.current = state.elf.details.indexOf(item)
    nextTick(() => stepRefs.value[state.current].$el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    state.log.unshift({
      log: `${new Date().toLocaleString()}.${new Date().getTime().toString().slice(-3)} 开始执行： ${item.type.includes('操作') ? item.type.replace('操作', '') : item.type}${item.subType}${item.subTypeKey || ''}${item.x || ''} ${item.y || ''}${item.scroll || ''}`,
      color: 'green',
    })
    await runAction(item, state.elf.details)
      .then(() => {
        state.log.unshift({
          log: `${new Date().toLocaleString()}.${new Date().getTime().toString().slice(-3)} 执行成功： ${item.type.includes('操作') ? item.type.replace('操作', '') : item.type}${item.subType}${item.subTypeKey || ''}${item.x || ''} ${item.y || ''}${item.scroll || ''}`,
          color: 'green',
        })
      })
      .catch(() => {
        state.log.unshift({
          log: `${new Date().toLocaleString()}.${new Date().getTime().toString().slice(-3)} 执行失败： ${item.type.includes('操作') ? item.type.replace('操作', '') : item.type}${item.subType}${item.subTypeKey || ''}${item.x || ''} ${item.y || ''}${item.scroll || ''}`,
          color: 'red',
        })
      })
      .finally(() => {
        nextTick(() => (state.log = state.log.slice(0, 100)))
      })
    await new Promise((resolve) => setTimeout(resolve, (state.elf.delay || 0) * 1000))
  }
  state.count++
  if (state.elf.loop) {
    if (state.count < state.elf.count) {
      state.timer = setTimeout(() => {
        task()
      }, state.elf.interval * 1000)
    } else {
      stop()
    }
  } else {
    stop()
  }
}

const run = async () => {
  state.time = 0
  state.count = 0
  state.current = 0
  state.running = true
  state.start = Date.now()
  timer = setInterval(() => {
    state.time = Date.now() - state.start
  })
  task()
}

const stop = () => {
  state.running = false
  clearInterval(timer)
  clearTimeout(state.timer)
}

const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}
</script>

<template>
  <div style="">
    <div v-if="state.elf.name">
      <a-page-header :title="state.elf.name" :sub-title="state.elf.desc">
        <template #tags>
          <a-tag :color="state.running ? 'error' : 'processing'">{{ state.running ? '运行中' : '未运行' }}</a-tag>
        </template>
        <a-descriptions size="small" :column="3">
          <a-descriptions-item label="操作间隔">
            <a-tag>{{ state.elf.delay }}秒</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="循环间隔">
            <a-tag>{{ state.elf.loop ? state.elf.interval + '秒' : '不循环' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="循环次数">
            <a-tag>{{ state.elf.loop ? state.elf.count + '次' : '不循环' }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
        <template #extra>
          <a-button v-if="state.running" type="primary" danger @click="run">停止</a-button>
          <a-button v-else type="primary" @click="run">运行</a-button>
        </template>
      </a-page-header>
      <div style="display: flex">
        <a-card title="运行步骤" size="small" style="flex: 1" :bodyStyle="{ height: 'calc(100vh - 256px)', padding: '16px', overflow: 'auto' }">
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
        <a-divider type="vertical" style="height: calc(100vh - 222px)" />
        <a-card title="运行日志" size="small" style="flex: 1" :bodyStyle="{ height: 'calc(100vh - 256px)', padding: '16px', overflow: 'auto' }">
          <template #extra>
            <a-button v-if="state.time" type="link">已运行 {{ formatDuration(state.time) }}</a-button>
          </template>
          <a-timeline v-if="state.log.length">
            <a-timeline-item v-for="item in state.log" :key="item.log" :color="item.color">
              <h5>{{ item.log }}</h5>
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
