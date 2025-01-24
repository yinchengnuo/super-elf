<script setup>
import { getGentleHexColor } from '@/utils'
import { BugOutlined } from '@ant-design/icons-vue'

defineProps(['item'])
</script>

<template>
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
    <template v-if="item.subType === '输入'">
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
