<script setup>
import { getGentleHexColor } from '@/utils'
import { BugOutlined } from '@ant-design/icons-vue'

defineProps(['item', 'text'])
</script>

<template>
  <template v-if="text === undefined">
    <template v-if="item.type.includes('鼠标')">
      <template v-if="item.subType === '移动至'">
        <a-tag :color="getGentleHexColor()">鼠标移动至</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.x }}, {{ item.y }}</a-tag>
      </template>
      <template v-else-if="item.subType === '滚轮'">
        <a-tag :color="getGentleHexColor()">滚轮</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.subTypeKey }}</a-tag>
        <a-tag :color="getGentleHexColor()">滚动{{ item.scroll }}</a-tag>
      </template>
      <template v-else>
        <a-tag :color="getGentleHexColor()">{{ item.subTypeKey }}</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.subType }}</a-tag>
      </template>
    </template>
    <template v-if="item.type.includes('键盘')">
      <template v-if="item.subType.startsWith('输入')">
        <a-tag :color="getGentleHexColor()">输入</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.text }}</a-tag>
      </template>
      <template v-else>
        <a-tag :color="getGentleHexColor()">{{ item.subType }}</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.keys.join('+') }}</a-tag>
      </template>
    </template>
    <template v-if="item.type.includes('逻辑')">
      <template v-if="item.subType === '等待执行'">
        <a-tag :color="getGentleHexColor()">等待</a-tag>
        <a-tag :color="getGentleHexColor()">{{ item.sleep }} 秒</a-tag>
      </template>
      <template v-else>
        <a-tag :color="getGentleHexColor()">执行代码</a-tag>
        <a-tooltip :title="item.code">
          <a-tag :color="getGentleHexColor()">
            <BugOutlined />
          </a-tag>
        </a-tooltip>
      </template>
    </template>
  </template>
  <template v-else>
    <template v-if="item.type.includes('鼠标')">
      <template v-if="item.subType === '移动至'"> 鼠标移动至 {{ item.x }}, {{ item.y }} </template>
      <template v-else-if="item.subType === '滚轮'"> 滚轮 {{ item.subTypeKey }} 滚动{{ item.scroll }} </template>
      <template v-else> {{ item.subTypeKey }} {{ item.subType }} </template>
    </template>
    <template v-if="item.type.includes('键盘')">
      <template v-if="item.subType.startsWith('输入')"> 输入 {{ item.text }} </template>
      <template v-else> {{ item.subType }} {{ item.keys.join('+') }} </template>
    </template>
    <template v-if="item.type.includes('逻辑')">
      <template v-if="item.subType === '等待执行'"> 等待 {{ item.sleep }} 秒 </template>
      <template v-else> 执行代码：{{ item.code }} </template>
    </template>
  </template>
</template>
