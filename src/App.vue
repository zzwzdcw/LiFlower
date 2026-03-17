<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { collectCacheData, saveCache } from '@/utils/cacheManager'

const characterStore = useCharacterStore()

// 存储各模块的本地数据引用
let m1LocalData = null
let m2LocalData = null
let m6LocalData = null
let m7LocalData = null
let m9LocalData = null
let m14LocalData = null
let m15LocalData = null
let m16LocalData = null
let m17LocalData = null
let m18LocalData = null
let m19LocalData = null
let m20LocalData = null

// 防止循环触发的标志
let isSaving = false

// 监听保存事件
const handleSaveCache = () => {
  // 清除缓存期间禁止保存（从 window 读取标志，因为刷新后会重置）
  if (window.liflowerCache?._isClearingCache) {
    console.log('[App] 清除缓存期间，跳过保存')
    // 清除标志，下次允许保存
    window.liflowerCache._isClearingCache = false
    return
  }
  
  // 防止循环触发
  if (isSaving) {
    return
  }
  
  isSaving = true
  const cacheData = collectCacheData(
    characterStore,
    m1LocalData,
    m2LocalData,
    m6LocalData,
    m7LocalData,
    m9LocalData,
    m14LocalData,
    m15LocalData,
    m16LocalData,
    m17LocalData,
    m18LocalData,
    m19LocalData,
    m20LocalData
  )
  saveCache(cacheData)
  // 延迟重置标志，防止循环触发
  setTimeout(() => {
    isSaving = false
  }, 100)
}

// 提供方法供子组件注册本地数据
window.liflowerCache = {
  registerM1: (data) => { m1LocalData = data; window.liflowerCache._m1LocalData = data; console.log('[App] M1 已注册') },
  registerM2: (data) => { m2LocalData = data; window.liflowerCache._m2LocalData = data; console.log('[App] M2 已注册') },
  registerM6: (data) => { m6LocalData = data; window.liflowerCache._m6LocalData = data; console.log('[App] M6 已注册') },
  registerM7: (data) => { m7LocalData = data; window.liflowerCache._m7LocalData = data; console.log('[App] M7 已注册') },
  registerM9: (data) => { m9LocalData = data; window.liflowerCache._m9LocalData = data; console.log('[App] M9 已注册') },
  registerM14: (data) => { m14LocalData = data; console.log('[App] M14 已注册') },
  registerM15: (data) => { m15LocalData = data; console.log('[App] M15 已注册') },
  registerM16: (data) => { m16LocalData = data; window.liflowerCache._m16LocalData = data; console.log('[App] M16 已注册') },
  registerM17: (data) => { m17LocalData = data; window.liflowerCache._m17LocalData = data; console.log('[App] M17 已注册') },
  registerM18: (data) => { m18LocalData = data; window.liflowerCache._m18LocalData = data; console.log('[App] M18 已注册') },
  registerM19: (data) => { m19LocalData = data; window.liflowerCache._m19LocalData = data; console.log('[App] M19 已注册') },
  registerM20: (data) => { m20LocalData = data; window.liflowerCache._m20LocalData = data; console.log('[App] M20 已注册') }
}

console.log('[App] window.liflowerCache 已定义')

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
