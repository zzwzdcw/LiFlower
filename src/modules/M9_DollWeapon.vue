<!--
  模块编号：M9
  模块名称：尖端武装（人形）
  显示模式：doll-prep, doll-action
  功能：尖端武装配置（默认1个）
-->
<template>
  <div class="module-advanced-weapon">
    <ModuleHeader title="尖端武装" subtitle="Advanced Weapon">
      <template #right>
        <span class="weapon-count">默认1部</span>
      </template>
    </ModuleHeader>

    <!-- 尖端武装配置 -->
    <div class="weapon-config">
      <!-- 第一行：名称 + 等级 -->
      <div class="first-row">
        <el-input
          v-model="weaponName"
          placeholder="尖端武装名称"
          class="cyber-input-short weapon-name"
        />
        <DotGridAllocator
          v-model="weaponLevel"
          :max="5"
          borderless
          class="weapon-level"
        />
      </div>
      
      <!-- 第二行：描述 -->
      <div class="second-row">
        <el-input
          v-model="weaponDescription"
          type="textarea"
          placeholder="描述尖端武装的外形、功能、原理..."
          class="cyber-input-long"
          :rows="3"
        />
      </div>
      
      <!-- 第三行：词条选择 -->
      <div class="tags-row">
        <div class="tags-label">限制词条</div>
        <WeaponTagSelector v-model="weaponTags" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { getM9Cache } from '@/utils/cacheManager'
import DotGridAllocator from '@/components/DotGridAllocator.vue'
import WeaponTagSelector from '@/components/WeaponTagSelector.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'

// 武器数据
const weaponName = ref('')
const weaponLevel = ref(0)
const weaponDescription = ref('')
const weaponTags = ref(['']) // 默认1个空词条槽位

// 数据输出
useAutoOutput({
  weapon: computed(() => ({
    name: weaponName.value,
    level: weaponLevel.value,
    description: weaponDescription.value,
    tags: weaponTags.value.filter(tag => tag) // 过滤掉空值
  }))
})

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  const cache = getM9Cache()
  if (!cache) return
  
  // 恢复武器数据
  if (cache.weaponName) {
    weaponName.value = cache.weaponName
  }
  if (cache.weaponLevel) {
    weaponLevel.value = cache.weaponLevel
  }
  if (cache.weaponDescription) {
    weaponDescription.value = cache.weaponDescription
  }
  if (cache.weaponTags && Array.isArray(cache.weaponTags)) {
    weaponTags.value = cache.weaponTags.length > 0 ? cache.weaponTags : ['']
    console.log('[M9] 从缓存恢复武器标签:', weaponTags.value)
  }
  
  console.log('[M9] 从缓存恢复武器:', {
    name: weaponName.value,
    level: weaponLevel.value,
    description: weaponDescription.value,
    tags: weaponTags.value
  })
})

// 监听变化触发保存
watch([weaponName, weaponLevel, weaponDescription, weaponTags], () => {
  console.log('[M9] 武器数据变化，触发保存')
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// 注册本地数据到全局缓存管理器
onMounted(() => {
  if (window.liflowerCache) {
    window.liflowerCache.registerM9({
      weaponName,
      weaponLevel,
      weaponDescription,
      weaponTags
    })
    console.log('[M9] 已注册到缓存管理器')
  } else {
    console.warn('[M9] window.liflowerCache 未定义')
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/input-styles.scss' as *;

$cyber-cyan: #00f3ff;

.module-advanced-weapon {
  .weapon-count {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-family: "Courier New", monospace;
  }

  .weapon-config {
    .first-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 12px;

      .weapon-name {
        flex: 2;
      }

      .weapon-level {
        flex: 0 0 auto;
        min-width: 180px;

        :deep(.dot-grid-row) {
          margin-bottom: 0;
          background: transparent;
          border: none;
          padding: 0;
        }
      }
    }
    
    .second-row {
      margin-bottom: 16px;
    }
    
    .tags-row {
      .tags-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        margin-bottom: 8px;
        font-family: "Courier New", monospace;
      }
    }
  }
}
</style>
