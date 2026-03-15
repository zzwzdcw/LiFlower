<!--
  模块编号：M20
  模块名称：备忘录
  显示模式：human-action, doll-action
  功能：玩家获取的资源等跑团记录
-->
<template>
  <div class="module-m20">
    <ModuleHeader title="备忘录" subtitle="Memo" />
    <p>玩家获取的资源等跑团记录</p>
    <div class="memo-content">
      <el-input
        v-model="memo"
        type="textarea"
        :rows="6"
        placeholder="记录你的跑团历程、获得的资源、重要事件..."
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getM20Cache } from '@/utils/cacheManager'
import ModuleHeader from '@/components/ModuleHeader.vue'

const memo = ref('')

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  const cache = getM20Cache()
  if (!cache) return
  
  // 恢复备忘录
  if (cache.memo) {
    memo.value = cache.memo
    console.log('[M20] 从缓存恢复备忘录:', memo.value)
  }
})

// 监听变化触发保存
watch(memo, () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
})

// 注册本地数据到全局缓存管理器
onMounted(() => {
  if (window.liflowerCache) {
    window.liflowerCache.registerM20({
      memo
    })
    console.log('[M20] 已注册到缓存管理器')
  } else {
    console.warn('[M20] window.liflowerCache 未定义')
  }
})
</script>

<style lang="scss" scoped>
.module-m20 {
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  .memo-content {
    :deep(.el-textarea__inner) {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      color: #fff;
      font-family: "Courier New", monospace;
    }
  }
}
</style>
