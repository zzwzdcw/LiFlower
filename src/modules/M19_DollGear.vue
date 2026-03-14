<!--
  模块编号：M19
  模块名称：装备（人形）
  显示模式：doll-action
  功能：人形装备管理
-->
<template>
  <div class="module-m19">
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
import { ref, computed } from 'vue'
import { useAutoOutput } from '@/composables/useModuleOutput'
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
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m19 {
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
