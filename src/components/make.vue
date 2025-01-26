<script setup>
import KEYS from '@/utils/key'
import { getPosition, runAction } from '@/utils'
import { PlusOutlined } from '@ant-design/icons-vue'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const EMITS = defineEmits(['save', 'more'])
const PROPS = defineProps(['activeKey', 'list', 'delay'])
const refScroll = ref()

const state = reactive({
  x: 0,
  y: 0,
  width: screen.width,
  height: screen.height,
  list: [],
})
try {
  if (PROPS.activeKey) {
    state.list = JSON.parse(localStorage.getItem('detail') || '[]')
  } else {
    state.list = PROPS.list
  }
} catch (_) {}

watch(
  () => state.list,
  () => localStorage.setItem('detail', JSON.stringify(state.list)),
  { deep: true },
)

const list = computed(() => {
  const list = state.list.map((item) => {
    if (item.subType) {
      if (item.subType === '移动至') {
        if (typeof item.x === 'number' && typeof item.y === 'number') {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      } else if (item.subType === '滚轮') {
        if (item.subTypeKey) {
          if (typeof item.scroll === 'number') {
            item._type = 'info'
          } else {
            item._type = 'error'
          }
        } else {
          item._type = 'error'
        }
      } else if (item.type.includes('键盘') && item.subType === '输入') {
        if (item.text) {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      } else if (item.type.includes('键盘') && item.subType !== '输入') {
        if (item.keys.length) {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      } else if (item.subType === '等待执行') {
        if (typeof item.sleep === 'number') {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      } else if (item.subType === 'JavaScript') {
        if (item.code) {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      } else {
        if (item.subTypeKey) {
          item._type = 'info'
        } else {
          item._type = 'error'
        }
      }
    } else {
      item._type = 'error'
    }
    return item
  })
  return list
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
    action: [{ type: '输入' }, { type: '敲击', action: Object.keys(KEYS).map((type) => ({ type })) }, { type: '按下并按住', action: Object.keys(KEYS).map((type) => ({ type })) }, { type: '释放', action: Object.keys(KEYS).map((type) => ({ type })) }],
  },
  { type: '逻辑操作', action: [{ type: '等待执行' }, { type: 'JavaScript' }] },
]

const add = (item, index) => {
  if (index === undefined) {
    state.list.push({ ...item, keys: [], id: Date.now().toString() })
    nextTick(() => refScroll.value.$el.parentElement.scrollBy(0, 999999999))
  } else {
    state.list.splice(index + 1, 0, { ...item, keys: [], id: Date.now().toString() })
  }
}

const runOne = async (item) => {
  await runAction(item).catch(() => { })
}

const runAll = async (list) => {
  for (const item of list) {
    await runAction(item, list).catch(() => { })
    await new Promise((resolve) => setTimeout(resolve, (PROPS.delay || 0.2) * 1000))
  }
}

const IPC = require('electron').ipcRenderer

const save = () => {
  if (PROPS.activeKey) {
    EMITS('save', state.list)
    sessionStorage.setItem('_detail', JSON.stringify(state.list))
  } else {
    EMITS('save', state.list)
  }
}

onMounted(() => {
  let timer
  if (PROPS.activeKey) {
    watch(
      () => PROPS.activeKey,
      () => {
        if (PROPS.activeKey === 2) {
          timer = setInterval(async () => {
            const { x, y } = await getPosition()
            state.x = x
            state.y = y
          }, 50)
        } else {
          clearInterval(timer)
        }
      },
      { immediate: true },
    )
  } else {
    timer = setInterval(async () => {
      const pos = await getPosition()
      state.x = pos.x
      state.y = pos.y
    }, 50)
  }
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<template>
  <a-card
    :title="`屏幕宽度：${state.width} &nbsp;&nbsp; 屏幕高度：${state.height} &nbsp;&nbsp; 鼠标坐标：${state.x}，${state.y}`"
    :bodyStyle="{
      height: 'calc(100vh - 178px)',
      overflow: 'auto',
      paddingTop: '8px',
      paddingBottom: 0,
    }"
  >
    <template #extra>
      <a-space>
        <a-button type="primary" :disabled="!list.length || list.some((e) => e._type === 'error')" @click="runAll(state.list)">运行</a-button>
        <a-button type="primary" :disabled="!list.length || list.some((e) => e._type === 'error')" @click="save">保存</a-button>
        <a-popconfirm title="确定清空？" @confirm="state.list.length = 0">
          <a-button type="primary" danger :disabled="!list.length">清空</a-button>
        </a-popconfirm>
      </a-space>
    </template>
    <a-empty v-if="!list.length" />
    <a-space ref="refScroll" direction="vertical" style="width: 100%">
      <div v-for="(item, index) in list" :key="item.id">
        <a-divider style="margin: 0; cursor: pointer">
          <a-dropdown>
            <PlusOutlined />
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="item in ACTION" :key="item.type" @click="add(item, index - 1)">
                  {{ item.type }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-divider>
        <a-alert :message="`${index + 1}、${item.type}`" :type="item._type" closable @close="state.list.splice(index, 1)">
          <template #description>
            <template v-if="item.type === '鼠标操作'">
              <a-space>
                <a-form-item label="行为" required>
                  <a-select v-model:value="item.subType" @change="item.subTypeKey = null" style="width: 120px">
                    <a-select-option v-for="item in item.action" :value="item.type">
                      {{ item.type }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="操作" required v-if="item.action.find((e) => e.type === item.subType)?.action">
                  <a-select v-model:value="item.subTypeKey" style="width: 240px">
                    <a-select-option v-for="itemm in item.action.find((e) => e.type === item.subType)?.action ?? []" :key="itemm.type" :value="itemm.type">
                      {{ itemm.type }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="坐标" required v-if="item.subType && !item.action.find((e) => e.type === item.subType)?.action">
                  <a-space>
                    <a-input-number v-model:value="item.x" :min="0" :precision="0" :max="state.width" @focus="({ target }) => target.select()" style="width: 116px">
                      <template #addonBefore> X</template>
                    </a-input-number>
                    <a-input-number v-model:value="item.y" :min="0" :precision="0" :max="state.height" @focus="({ target }) => target.select()" style="width: 116px">
                      <template #addonBefore> Y</template>
                    </a-input-number>
                  </a-space>
                </a-form-item>
                <a-form-item label="滚动距离" required v-if="item.subType?.includes('滚轮')">
                  <a-input-number v-model:value="item.scroll" :min="0" :precision="0" @focus="({ target }) => target.select()" style="width: 240px" />
                </a-form-item>
              </a-space>
            </template>
            <template v-if="item.type === '键盘操作'">
              <a-space>
                <a-form-item label="行为" required>
                  <a-select v-model:value="item.subType" @change="item.subTypeKey = null" style="width: 120px">
                    <a-select-option v-for="item in item.action" :value="item.type">
                      {{ item.type }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="文字" required v-if="item.subType === '输入'">
                  <a-input v-model:value="item.text" placeholder="请输入文字" allowClear @focus="({ target }) => target.select()" style="width: 240px" />
                </a-form-item>
                <a-form-item label="按键" required v-if="item.subType && item.subType !== '输入'">
                  <a-select v-model:value="item.keys" mode="multiple" showSearch style="width: 240px" placeholder="请选择按键">
                    <a-select-option v-for="item in item.action.find((e) => e.type === item.subType)?.action" :value="item.type">
                      {{ item.type }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-space>
            </template>
            <template v-if="item.type === '逻辑操作'">
              <a-space>
                <a-form-item label="行为" required>
                  <a-select v-model:value="item.subType" @change="item.subTypeKey = null" style="width: 120px">
                    <a-select-option v-for="item in item.action" :value="item.type">
                      {{ item.type }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="等待时长" required v-if="item.subType === '等待执行'">
                  <a-input-number v-model:value="item.sleep" :min="0" :precision="1" @focus="({ target }) => target.select()" style="width: 210px">
                    <template #addonAfter>秒</template>
                  </a-input-number>
                </a-form-item>
                <a-form-item label="执行代码" required v-if="item.subType === 'JavaScript'">
                  <a-input v-model:value="item.code" placeholder="请输入代码" @focus="({ target }) => target.select()" style="width: calc(100vw - 521px)" />
                </a-form-item>
              </a-space>
            </template>
          </template>
          <template #action>
            <a-space ref="refScroll" direction="vertical" style="width: 100%">
              <a-button type="link" :disabled="item._type === 'error'" @click="runOne(item)">运行此操作</a-button>
              <a-tooltip>
                <template #title>
                  <h6>理论上可使用此操作实现任何功能，API 支持如下：</h6>
                  <h5>1、默认支持任意 Web API</h5>
                  <h5>2、item 对象表示正在执行的操作</h5>
                  <h5>3、list 对象表示正在执行的流程</h5>
                  <h5>4、count 表示正在执行第 count 次</h5>
                  <h5>count 可用于区分单次执行和循环执行</h5>
                  <h5>5、resolve 方法用于结束当前操作</h5>
                  <h5>6、reject 方法用于结束当前流程</h5>
                  <h5>7、require 方法支持任意 Nodejs API</h5>
                  <h5>8、IPC&EVAL 支持所有 Electron API</h5>
                  <h5>9、IPC&EVAL window 对象为当前窗体</h5>
                  <h5>更多实例见：<a-button type="link" size="small" style="padding: 0;" @click="EMITS('more')">常用JavaScript脚本</a-button> </h5>
                </template>
                <a-button v-if="item.subType === 'JavaScript'" type="link" danger>JS 注意事项</a-button>
              </a-tooltip>
            </a-space>
          </template>
        </a-alert>
      </div>
    </a-space>
    <div style="position: sticky; bottom: 0; background: #fff; overflow: hidden">
      <a-divider v-if="!list.length" />
      <a-dropdown>
        <a-button block type="primary" style="margin: 8px 0">
          <span>新增操作</span>
          <PlusOutlined />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item v-for="item in ACTION" :key="item.type" @click="add(item)">
              {{ item.type }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-divider v-if="!list.length" />
    </div>
  </a-card>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 0px !important;
}
</style>
