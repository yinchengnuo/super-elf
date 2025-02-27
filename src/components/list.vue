<script setup>
import Make from './make.vue'
import API from '@/utils/api'
import Store from '@/utils/store'
import Actions from './Actions.vue'
import ActionsData from '@/utils/actions'
import { message, Modal } from 'ant-design-vue'
import { ref, onMounted, reactive, watch } from 'vue'
import { runAction, getGentleHexColor } from '@/utils'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

const EMITS = defineEmits(['run'])
const PROPS = defineProps(['activeKey', 'list'])

const refForm = ref()
const state = reactive({
  search: {
    name: '',
  },
  list: Store.list,
  drawer: {
    open: false,
    title: '新增',
    data: {},
  },
  modal: {
    open: false,
    title: '新增',
    data: [],
  },
})

const getList = () => {
  API('/list/get').then((data) => {
    Store.list = data.map((e) => ({
      ...e,
      details: e.details.map((e) => ({
        ...e,
        action: ActionsData[e.type],
      })),
    }))
    if (state.search.name) {
      state.list = data.filter((item) => item.name.includes(state.search.name))
    } else {
      state.list = Store.list
    }
  })
}

const add = () => {
  state.drawer.open = true
  state.drawer.title = '新增'
  state.drawer.data = { delay: 0.2, details: [] }
}

const edit = (record) => {
  state.drawer.open = true
  state.drawer.title = '编辑'
  state.drawer.data = record
}

const del = (record) => {
  Modal.confirm({
    title: '删除',
    centered: true,
    content: '确定删除吗？',
    onOk: () => {
      state.list.splice(
        state.list.findIndex((item) => item.id === record.id),
        1,
      )
      API('/list/del', { _id: record._id }).then(() => {
        message.success('删除成功')
        getList()
      })
    },
  })
}

const save = () => {
  refForm.value.validate().then(() => {
    if (state.drawer.data.details.length) {
      state.drawer.open = false
      if (state.drawer.data._id) {
        API('/list/edit', { ...state.drawer.data, details: state.drawer.data.details.map((e) => ({ ...e, action: undefined })) }).then(() => {
          message.success('编辑成功')
          getList()
        })
      } else {
        API('/list/add', { ...state.drawer.data, details: state.drawer.data.details.map((e) => ({ ...e, action: undefined })) }).then(() => {
          message.success('新增成功')
          getList()
        })
      }
    } else {
      message.warn('没有操作信息')
    }
  })
}

const run = (record) => {
  sessionStorage.setItem('_run', JSON.stringify(record))
  EMITS('run')
}

const autoAdd = () => {
  if (sessionStorage.getItem('_detail')) {
    state.drawer.data = { delay: 0.2, details: JSON.parse(sessionStorage.getItem('_detail')) }
    sessionStorage.removeItem('_detail')
    state.drawer.title = '新增'
    state.drawer.open = true
  }
}

const runOne = async (item) => {
  await runAction(item).catch(() => {})
}

let running = false
const runAll = async (list) => {
  running = true
  for (const item of list) {
    if (running === false) return
    await runAction(item, list).catch(() => {
      running = false
    })
    await new Promise((resolve) => setTimeout(resolve, (PROPS.delay || 0.2) * 1000))
  }
}

watch(
  () => PROPS.activeKey,
  () => {
    if (PROPS.activeKey === 3) {
      autoAdd()
    }
  },
)

onMounted(() => {
  autoAdd()
})
</script>

<template>
  <div style="height: calc(100vh - 120px)">
    <a-modal :open="state.modal.open" :title="state.modal.title" centered :footer="null" width="98vw" height="90vh" destroyOnClose :keyboard="false" :maskClosable="false" @cancel="state.modal.open = false">
      <Make :delay="state.drawer.data.delay" :list="state.drawer.data.details" @save="((list) => (state.drawer.data.details = list), (state.modal.open = false))" />
    </a-modal>
    <a-drawer height="calc(100vh - 58px)" :title="state.drawer.title" placement="bottom" :open="state.drawer.open" :body-style="{ padding: 0 }" destroyOnClose :keyboard="false" :maskClosable="false" @close="state.drawer.open = false">
      <template #extra>
        <a-button type="primary" @click="save">保存</a-button>
      </template>
      <div style="height: calc(100vh - 124px); display: flex; flex-direction: column">
        <a-card title="基本信息" :bordered="false" :body-style="{ padding: '8px' }" style="width: 100%">
          <a-form ref="refForm" layout="inline" :model="state.drawer.data">
            <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称' }]">
              <a-input v-model:value="state.drawer.data.name" placeholder="请输入名称" allowClear style="width: 180px" />
            </a-form-item>
            <a-form-item label="描述" name="desc" :rules="[{ required: true, message: '请输入描述' }]">
              <a-input v-model:value="state.drawer.data.desc" placeholder="请输入描述" allowClear style="width: 180px" />
            </a-form-item>
            <a-form-item label="操作间隔" name="delay" :rules="[{ required: true, message: '请输入操作间隔' }]">
              <a-input-number v-model:value="state.drawer.data.delay" :min="0" :step="0.1" :precision="1" @focus="({ target }) => target.select()" style="width: 152px">
                <template #addonBefore>
                  <a-tooltip title="每次操作之间的等待时长">
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </template>
                <template #addonAfter>秒</template>
              </a-input-number>
            </a-form-item>
            <a-form-item label="运行时隐藏本应用" name="hide" :rules="[{ required: true, message: '请选择运行时是否隐藏本应用' }]">
              <a-radio-group v-model:value="state.drawer.data.hide" button-style="solid" style="width: 96px">
                <a-radio-button :value="1">是</a-radio-button>
                <a-radio-button :value="0">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="是否循环" name="loop" :rules="[{ required: true, message: '请选择是否循环' }]">
              <a-radio-group v-model:value="state.drawer.data.loop" button-style="solid" style="width: 152px">
                <a-radio-button :value="1">是</a-radio-button>
                <a-radio-button :value="0">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="循环间隔" name="interval" :rules="[{ required: true, message: '请输入循环间隔' }]">
              <a-input-number v-model:value="state.drawer.data.interval" :min="0" :precision="0" @focus="({ target }) => target.select()" style="width: 152px">
                <template #addonAfter>秒</template>
              </a-input-number>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="循环次数" name="count" :rules="[{ required: true, message: '请输入循环次数' }]">
              <a-input-number v-model:value="state.drawer.data.count" :min="0" :precision="0" @focus="({ target }) => target.select()" style="width: 152px">
                <template #addonAfter>
                  <a-tooltip title="输入0表示无限循环">
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </template>
              </a-input-number>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="运行后立即执行" name="loop" :rules="[{ required: true, message: '请选择运行后是否立即执行一次' }]">
              <a-radio-group v-model:value="state.drawer.data.iife" button-style="solid" style="width: 100px">
                <a-radio-button :value="1">是</a-radio-button>
                <a-radio-button :value="0">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="循环间隔倒计时" name="loop" :rules="[{ required: true, message: '请选择是否循环' }]">
              <a-radio-group v-model:value="state.drawer.data.clock" button-style="solid" style="width: 100px">
                <a-radio-button :value="1">是</a-radio-button>
                <a-radio-button :value="0">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-card>
        <a-card title="操作信息" :body-style="{ padding: '8px', height: 'calc(100% - 56px)', position: 'relative' }" style="width: 100%; flex: 1">
          <template #extra>
            <a-space>
              <a-button v-if="state.drawer.data.details.length" type="primary" @click="runAll(state.drawer.data.details)">运行一次</a-button>
              <a-button v-if="state.drawer.data.details.length" type="primary" @click="((state.modal.title = '编辑操作'), (state.modal.data = state.drawer.data.details), (state.modal.open = true))">编辑</a-button>
              <a-button v-else type="primary" @click="((state.modal.title = '新增操作'), (state.modal.data = []), (state.modal.open = true))">新增操作</a-button>
            </a-space>
          </template>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-wrap: wrap; align-content: flex-start; overflow: auto">
            <a-card-grid v-for="(item, index) in state.drawer.data.details" :key="item.id" style="width: calc((100% - 32px) / 4); margin: 4px; height: 74px; padding: 0">
              <a-card size="small" :bordered="false" :title="`${index + 1}、${item.type}`" :body-style="{ padding: '8px' }" style="width: 100%">
                <template #extra>
                  <a-button type="link" size="small" @click="runOne(item)">运行</a-button>
                </template>
                <Actions :item="item" />
              </a-card>
            </a-card-grid>
          </div>
          <a-empty v-if="!state.drawer.data.details.length" />
        </a-card>
      </div>
    </a-drawer>
    <div style="display: flex; justify-content: space-between">
      <a-form layout="inline" :model="state.search">
        <a-form-item label="名称">
          <a-input v-model:value.trim="state.search.name" placeholder="请输入名称搜索" allowClear />
        </a-form-item>
      </a-form>
      <a-space>
        <a-button type="primary" @click="getList()">搜索</a-button>
        <a-button @click="((state.search.name = ''), (state.list = Store.list))">重置</a-button>
      </a-space>
    </div>
    <a-card title="超级精灵管理" style="width: 100%; margin-top: 8px" :body-style="{ padding: 0 }">
      <template #extra>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <a-table size="small" :pagination="false" :data-source="state.list" :scroll="{ x: '100%', y: 'calc(100vh - 262px)' }" bordered>
        <a-table-column title="名称" data-index="name" align="center" />
        <a-table-column title="描述" data-index="desc" align="center" />
        <a-table-column title="运行时隐藏本应用" data-index="hide" align="center">
          <template #default="{ record }">
            <a-tag v-if="record.hide" color="processing">是</a-tag>
            <a-tag v-else color="error">否</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="是否循环" data-index="loop" align="center">
          <template #default="{ record }">
            <template v-if="record.loop">
              <a-tag :color="getGentleHexColor()">{{ record.interval }}秒</a-tag>
              <a-tag :color="getGentleHexColor()">{{ record.count || '无限' }}次</a-tag>
              <a-tag v-if="record.iife" :color="getGentleHexColor()">运行后立即执行</a-tag>
              <a-tag v-if="record.clock" :color="getGentleHexColor()">倒计时</a-tag>
            </template>
            <a-tag v-else>无</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作间隔" data-index="details" align="center">
          <template #default="{ record }">
            <a-tag :color="getGentleHexColor()">{{ record.delay }}秒</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" data-index="action" align="center" resizable>
          <template #default="{ record }">
            <a-space>
              <a-button type="link" style="padding: 0" @click="run(record)">运行</a-button>
              <a-button type="link" style="padding: 0" @click="edit(record)">编辑</a-button>
              <a-button type="link" style="padding: 0" danger @click="del(record)">删除</a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 8px !important;
}
:deep(.ant-form-item-explain) {
  z-index: 9;
  position: absolute;
}
.ant-tag {
  margin: 2px;
}
</style>
