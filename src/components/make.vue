<script setup>
import KEYS from '@/utils/key'
import { getPosition, runAction } from '@/utils'
import { onMounted, onUnmounted, reactive } from 'vue'

const state = reactive({
  x: 0,
  y: 0,
  width: screen.width,
  height: screen.height,
  list: [],
})

const ACTION = [
  {
    type: '鼠标操作',
    action: [
      { type: '移动至' },
      { type: '点击', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
      { type: '双击', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
      {
        type: '滚轮',
        action: [{ type: '向上' }, { type: '向下' }, { type: '向左' }, { type: '向右' }],
      },
      {
        type: '按下并按住',
        action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }],
      },
      { type: '释放', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
    ],
  },
  {
    type: '键盘操作',
    action: [
      { type: '输入' },
      { type: '敲击', action: Object.keys(KEYS).map((type) => ({ type })) },
      { type: '按下并按住', action: Object.keys(KEYS).map((type) => ({ type })) },
      { type: '释放', action: Object.keys(KEYS).map((type) => ({ type })) },
    ],
  },
  { type: '逻辑操作', action: [{ type: '延时器' }, { type: 'JavaScript' }] },
]

const add = (item) => {
  state.list.push({
    ...item,
    keys: [],
    id: Date.now(),
  })
}

const run = async (item) => {
  await runAction(item)
}

const runAll = async () => {
  for (const item of state.list) {
    await runAction(item)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}
const IPC = require('electron').ipcRenderer


const save = () => {
  //
}

onMounted(() => {
  const timer = setInterval(async () => {
    const { x, y } = await getPosition()
    state.x = x
    state.y = y
  }, 50)
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<template>
  <a-card
    :title="`屏幕宽度：${state.width} &nbsp;&nbsp; 屏幕高度：${state.height} &nbsp;&nbsp; 鼠标坐标：${state.x}，${state.y}`"
    :bodyStyle="{ height: 'calc(100vh - 186px)', overflow: 'auto' }"
  >
    <template #extra>
      <a-space>
        <a-dropdown>
          <a-button type="primary">新增</a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="item in ACTION" :key="item.type" @click="add(item)">
                {{ item.type }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button type="primary" @click="runAll">运行</a-button>
        <a-button type="primary" danger @click="state.list.length = 0">清空</a-button>
        <a-button type="primary" @click="save">保存</a-button>
      </a-space>
    </template>
    <a-empty v-if="!state.list.length" />
    <a-space direction="vertical" style="width: 100%">
      <a-alert
        v-for="(item, index) in state.list"
        :key="item.id"
        :message="`${index + 1}、${item.type}`"
        type="info"
        closable
        @close="state.list.splice(index, 1)"
      >
        <template #description>
          <template v-if="item.type === '鼠标操作'">
            <a-space>
              <a-form-item label="行为">
                <a-select
                  v-model:value="item.subType"
                  @change="item.subTypeKey = null"
                  style="width: 120px"
                >
                  <a-select-option v-for="item in item.action" :value="item.type">
                    {{ item.type }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="操作"
                v-if="item.action.find((e) => e.type === item.subType)?.action"
              >
                <a-select v-model:value="item.subTypeKey" style="width: 120px">
                  <a-select-option
                    v-for="itemm in item.action.find((e) => e.type === item.subType)?.action ?? []"
                    :key="itemm.type"
                    :value="itemm.type"
                  >
                    {{ itemm.type }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="屏幕坐标"
                v-if="item.subType && !item.action.find((e) => e.type === item.subType)?.action"
              >
                <a-input-number
                  v-model:value="item.x"
                  :min="0"
                  :precision="0"
                  :max="state.width"
                  style="width: 120px"
                >
                  <template #addonBefore> X</template>
                </a-input-number>
                <a-input-number
                  v-model:value="item.y"
                  :min="0"
                  :precision="0"
                  :max="state.height"
                  style="width: 120px"
                >
                  <template #addonBefore> Y</template>
                </a-input-number>
              </a-form-item>
              <a-form-item label="滚动距离" v-if="item.subType?.includes('滚轮')">
                <a-input-number
                  v-model:value="item.scroll"
                  :min="0"
                  :precision="0"
                  style="width: 120px"
                >
                </a-input-number>
              </a-form-item>
            </a-space>
          </template>
          <template v-if="item.type === '键盘操作'">
            <a-space>
              <a-form-item label="行为">
                <a-select
                  v-model:value="item.subType"
                  @change="item.subTypeKey = null"
                  style="width: 120px"
                >
                  <a-select-option v-for="item in item.action" :value="item.type">
                    {{ item.type }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="文字" v-if="item.subType === '输入'">
                <a-input
                  v-model:value="item.text"
                  placeholder="请输入文字"
                  allowClear
                  style="width: 240px"
                />
              </a-form-item>
              <a-form-item label="按键" v-if="item.subType && item.subType !== '输入'">
                <a-select
                  v-model:value="item.keys"
                  mode="multiple"
                  showSearch
                  style="width: 240px"
                  placeholder="请选择按键"
                >
                  <a-select-option
                    v-for="item in item.action.find((e) => e.type === item.subType)?.action"
                    :value="item.type"
                  >
                    {{ item.type }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-space>
          </template>
          <template v-if="item.type === '逻辑操作'">
            <a-space>
              <a-form-item label="行为">
                <a-select
                  v-model:value="item.subType"
                  @change="item.subTypeKey = null"
                  style="width: 120px"
                >
                  <a-select-option v-for="item in item.action" :value="item.type">
                    {{ item.type }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="等待时间" v-if="item.subType === '延时器'">
                <a-input-number
                  v-model:value="item.sleep"
                  :min="0"
                  :precision="1"
                  style="width: 120px"
                >
                  <template #addonAfter> 秒</template>
                </a-input-number>
              </a-form-item>
              <a-form-item label="执行代码" v-if="item.subType === 'JavaScript'">
                <a-input v-model:value="item.code" placeholder="请输入代码" style="width: 50vw" />
              </a-form-item>
            </a-space>
          </template>
        </template>
        <template #action>
          <a-button type="link" @click="run(item)">运行此操作</a-button>
        </template>
      </a-alert>
    </a-space>
  </a-card>
</template>
