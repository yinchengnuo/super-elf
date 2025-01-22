<script setup>
import Make from './make.vue'
import { ref, onMounted, reactive } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

const refForm = ref()
const state = reactive({
  search: {
    name: '',
  },
  list: [],
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
  try {
    state.list = JSON.parse(localStorage.getItem('list') || '[]')
    state.list = [...state.list, ...state.list, ...state.list, ...state.list]
  } catch (_) {}
}

const add = () => {
  state.drawer.open = true
  state.drawer.title = '新增'
  state.drawer.data = { details: [] }
}

const edit = () => {}

const del = () => {}

const save = () => {
  refForm.value.validate().then(() => {
    console.log(123)
  })
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div style="height: calc(100vh - 128px)">
    <a-modal :open="state.modal.open" :title="state.modal.title" centered :footer="null" width="98vw" height="90vh" destroyOnClose :keyboard="false" :maskClosable="false" @cancel="state.modal.open = false">
      <Make :list="state.drawer.data.details" @save="((list) => (state.drawer.data.details = list), (state.modal.open = false))" />
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
            <a-form-item label="是否循环" name="loop" :rules="[{ required: true, message: '请选择是否循环' }]">
              <a-radio-group v-model:value="state.drawer.data.loop" button-style="solid" style="width: 152px">
                <a-radio-button :value="1">是</a-radio-button>
                <a-radio-button :value="0">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="循环间隔" name="interval" :rules="[{ required: true, message: '循环间隔' }]">
              <a-input-number v-model:value="state.drawer.data.interval" :min="0" :precision="0" @focus="({ target }) => target.select()" style="width: 152px">
                <template #addonAfter>秒</template>
              </a-input-number>
            </a-form-item>
            <a-form-item v-if="state.drawer.data.loop" label="循环次数" name="count" :rules="[{ required: true, message: '循环模式' }]">
              <a-input-number v-model:value="state.drawer.data.count" :min="0" :precision="0" @focus="({ target }) => target.select()" style="width: 152px">
                <template #addonAfter>
                  <a-tooltip title="输入0表示无限循环">
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </template>
              </a-input-number>
            </a-form-item>
          </a-form>
        </a-card>
        <a-card title="操作信息" :body-style="{ padding: '8px', height: 'calc(100% - 56px)', position: 'relative' }" style="width: 100%; flex: 1">
          <template #extra>
            <a-button v-if="state.drawer.data.details.length" type="primary" @click="((state.modal.title = '编辑操作'), (state.modal.data = state.drawer.data.details), (state.modal.open = true))">编辑</a-button>
            <a-button v-else type="primary" @click="((state.modal.title = '新增操作'), (state.modal.data = []), (state.modal.open = true))">新增操作</a-button>
          </template>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-wrap: wrap; align-content: flex-start; overflow: auto">
            <a-card-grid v-for="(item, index) in state.drawer.data.details" :key="item.id" style="width: calc((100% - 32px) / 4); margin: 4px; height: 74px; padding: 0">
              <a-card size="small" :bordered="false" :title="`${index + 1}、${item.type}`" :body-style="{ padding: '8px' }" style="width: 100%">
                <div v-if="item.type.includes('鼠标')">
                  <span v-if="item.subType === '移动至'">鼠标移动至 X:{{ item.x }} Y:{{ item.y }}</span>
                  <span v-else-if="item.subType === '滚轮'">滚轮{{ item.subTypeKey }}滚动{{ item.scroll }}</span>
                  <span v-else>{{ item.subTypeKey }}{{ item.subType }}</span>
                </div>
                <div v-if="item.type.includes('键盘')">
                  <span v-if="item.subType === '输入'">输入：{{ item.text }}</span>
                  <span v-else>{{ item.subType }}：{{ item.keys.join('+') }}</span>
                </div>
                <div v-if="item.type.includes('逻辑')">
                  <span v-if="item.subType === '等待执行'">等待 {{ item.sleep }} 秒后进行下一步操作</span>
                  <span v-else
                    >执行代码：<code>{{ item.code }}</code>
                  </span>
                </div>
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
          <a-input v-model:value="state.search.nae" placeholder="请输入名称搜索" allowClear />
        </a-form-item>
      </a-form>
      <a-space>
        <a-button type="primary">搜索</a-button>
        <a-button @click="state.search.name = ''">重置</a-button>
      </a-space>
    </div>
    <a-card title="超级精灵管理" style="width: 100%; margin-top: 8px" :body-style="{ padding: 0 }">
      <template #extra>
        <a-button type="primary" @click="add">新增</a-button>
      </template>
      <a-table size="small" :pagination="false" :data-source="state.list" :scroll="{ x: '100%', y: 'calc(100vh - 270px)' }" bordered>
        <a-table-column title="名称" data-index="name" align="center" :width="100" />
        <a-table-column title="描述" data-index="age" align="center" :width="100" />
        <a-table-column title="是否循环" data-index="age" align="center":width="100" />
        <a-table-column title="操作信息" data-index="age" align="center" />
        <a-table-column title="操作" data-index="action" align="center" :width="120">
          <template #default="{ record }">
            <a-space>
              <a-button type="link" style="padding: 0">运行</a-button>
              <a-button type="link" style="padding: 0">编辑</a-button>
              <a-button type="link" style="padding: 0" danger>删除</a-button>
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
  position: absolute;
}
</style>
