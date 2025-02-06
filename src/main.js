// 导入根组件App
import App from './App.vue'
// 导入路由配置
import router from './router'
// 从Vue库中导入createApp函数
import { createApp } from 'vue'

/**
 * 创建Vue应用实例并挂载到DOM
 * @param {Object} App - 根组件
 * @param {Object} router - 路由配置
 * @returns {Object} - Vue应用实例
 */
const app = createApp(App)

// 使用路由插件
app.use(router)

/**
 * 将Vue应用实例挂载到DOM
 * @param {string} selector - DOM元素的选择器
 */
app.mount('#app')

/**
 * 创建Vue应用实例并挂载到DOM
 * @param {Object} App - 根组件
 * @param {Object} router - 路由配置
 * @returns {Object} - Vue应用实例
 */
