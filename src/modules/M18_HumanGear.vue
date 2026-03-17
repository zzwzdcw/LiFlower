<!--
  模块编号：M18
  模块名称：装备（人类）
  显示模式：human-action
  功能：人类装备管理
-->
<template>
  <div class="module-m18">
    <ModuleHeader title="装备" subtitle="Equipment">
      <template #right>
        <span class="points-info">
          装备点数：<span class="points-highlight">{{ totalPoints }}</span>
        </span>
      </template>
    </ModuleHeader>

    <!-- 装备列表 -->
    <div class="equipment-list">
      <EquipmentSlot
        v-for="(item, index) in equipmentList"
        :key="item.id"
        v-model="equipmentList[index]"
        @delete="removeEquipment(index)"
      />
    </div>

    <!-- 添加按钮 -->
    <button class="add-btn" @click="addEquipment">
      <span class="add-icon">+</span>
      <span class="add-text">添加装备</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { getM18Cache } from '@/utils/cacheManager'
import ModuleHeader from '@/components/ModuleHeader.vue'
import EquipmentSlot from '@/components/EquipmentSlot.vue'

// 装备列表
const equipmentList = ref([])

// 装备ID计数器
let equipmentIdCounter = 0

// 添加装备
const addEquipment = () => {
  equipmentList.value.push({
    id: ++equipmentIdCounter,
    name: '',
    type: '',
    level: 2,
    description: ''
  })
}

// 删除装备
const removeEquipment = (index) => {
  equipmentList.value.splice(index, 1)
}

// 计算装备点数总和
const totalPoints = computed(() => {
  return equipmentList.value.reduce((sum, item) => sum + (item.level || 0), 0)
})

// 数据输出
useAutoOutput({
  equipmentList,
  totalPoints
})

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  const cache = getM18Cache()

  // 恢复装备列表（逐个修改元素，保持引用不变）
  if (cache && cache.equipmentList && cache.equipmentList.length > 0) {
    // 先调整数组长度
    while (equipmentList.value.length < cache.equipmentList.length) {
      equipmentList.value.push({ id: 0, name: '', type: '', level: 2, description: '' })
    }
    // 逐个修改元素
    cache.equipmentList.forEach((e, index) => {
      if (equipmentList.value[index]) {
        equipmentList.value[index].id = e.id
        equipmentList.value[index].name = e.name
        equipmentList.value[index].type = e.type
        equipmentList.value[index].level = e.level
        equipmentList.value[index].description = e.description
      }
    })
    // 更新 ID 计数器
    if (equipmentList.value.length > 0) {
      equipmentIdCounter = Math.max(...equipmentList.value.map(e => e.id || 0))
    }
    console.log('[M18] 从缓存恢复装备:', equipmentList.value)
  } else {
    // 缓存为空时重置为初始状态
    equipmentList.value = []
    equipmentIdCounter = 0
    console.log('[M18] 缓存为空，重置装备')
  }
})

// 监听变化触发保存
watch(equipmentList, () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// 注册本地数据到全局缓存管理器
onMounted(() => {
  if (window.liflowerCache) {
    window.liflowerCache.registerM18({
      equipmentList
    })
    console.log('[M18] 已注册到缓存管理器')
  } else {
    console.warn('[M18] window.liflowerCache 未定义')
  }
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m18 {
  .points-info {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-family: "Courier New", "Consolas", monospace;
  }

  .points-highlight {
    color: $cyber-cyan;
    font-weight: 600;
  }

  .equipment-list {
    margin: 12px 0;
  }

  .add-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    background: transparent;
    border: 1px dashed rgba($cyber-cyan, 0.3);
    border-radius: 4px;
    color: rgba($cyber-cyan, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($cyber-cyan, 0.05);
      border-color: rgba($cyber-cyan, 0.5);
      color: $cyber-cyan;
    }

    .add-icon {
      font-size: 16px;
      font-weight: 600;
    }

    .add-text {
      font-family: "Courier New", "Consolas", monospace;
    }
  }
}
</style>
