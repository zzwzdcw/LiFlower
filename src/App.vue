<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { collectCacheData, saveCache } from '@/utils/cacheManager'

const characterStore = useCharacterStore()

// 存储 M1 和 M2 的本地数据引用
let m1LocalData = null
let m2LocalData = null

// 监听保存事件
const handleSaveCache = () => {
  const cacheData = collectCacheData(characterStore, m1LocalData, m2LocalData)
  saveCache(cacheData)
}

// 提供方法供子组件注册本地数据
window.liflowerCache = {
  registerM1: (data) => { m1LocalData = data },
  registerM2: (data) => { m2LocalData = data }
}

onMounted(() => {
  window.addEventListener('liflower-save-cache', handleSaveCache)
})

onUnmounted(() => {
  window.removeEventListener('liflower-save-cache', handleSaveCache)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
