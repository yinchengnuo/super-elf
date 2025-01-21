<script setup>
import { RouterView } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<template>
  <AConfigProvider :locale="zhCN">
    <RouterView />
  </AConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}
.ant-page-header {
  padding: 8px;
}
.ant-form-item {
  margin-bottom: 0px !important;
}
</style>
