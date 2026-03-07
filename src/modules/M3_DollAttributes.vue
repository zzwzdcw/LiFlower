<!--
  模块编号：M3
  模块名称：属性（人形）
  显示模式：doll-prep
  显示条件：人形整备模式 AND 已选择硬件规格（由 StandardModule 控制）
  功能：6属性涂格子加点
-->
<template>
  <div class="module-doll-attributes">
    <ModuleHeader title="属性点分配" subtitle="Attributes">
      <template #right>
        <span class="points-info">可用属性点：<span class="points-highlight">{{ remainingPoints }}</span> / {{ characterStore.totalAttributePoints }}</span>
      </template>
    </ModuleHeader>
    <!-- 属性点分配器 -->
    <AttributeAllocator
      :attribute-points="characterStore.totalAttributePoints"
      :attribute-limit="characterStore.attributeLimit"
      :attributes="characterStore.dollAttributes"
      :attribute-data="attributeData"
      :show-divider="false"
      :modifier-rules="modifierRules"
      @update:attributes="characterStore.updateDollAttributes"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { useModifiers } from '@/composables/useModifiers'
import AttributeAllocator from '@/components/AttributeAllocator.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'

// 导入属性数据
import attributeDataJson from '@/data/基本属性.json'

// 使用 store
const characterStore = useCharacterStore()

// 属性数据
const attributeData = attributeDataJson.attributeSystem

// 计算已分配属性点
const allocatedPoints = computed(() => {
  return Object.values(characterStore.dollAttributes).reduce((sum, val) => sum + val, 0)
})

// 计算剩余可用属性点
const remainingPoints = computed(() => {
  return characterStore.totalAttributePoints - allocatedPoints.value
})

// 调整值规则（示例：暗隼电子 -> 算力+1）
const modifierRules = [
  {
    id: 'darkhawk_compute',
    watch: () => characterStore.manufacturer,
    match: '暗隼电子',
    value: 1,
    target: 'compute'
  }
]

// 使用 useModifiers 计算调整值和总值
const { getModifierFor } = useModifiers(modifierRules)

// 属性键名列表
const attributeKeys = ['structure', 'torque', 'athletics', 'compute', 'information', 'power']

// 计算每个属性的总值（基础值 + 调整值）
const attributeTotals = computed(() => {
  const totals = {}
  attributeKeys.forEach(key => {
    const baseValue = characterStore.dollAttributes[key] || 0
    const modifier = getModifierFor(key)
    totals[key] = baseValue + modifier
  })
  return totals
})

// 数据输出
useAutoOutput({
  remainingPoints,
  allocatedPoints,
  totalAttributePoints: computed(() => characterStore.totalAttributePoints),
  attributeTotals,
  attributeModifiers: computed(() => {
    const modifiers = {}
    attributeKeys.forEach(key => {
      modifiers[key] = getModifierFor(key)
    })
    return modifiers
  })
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-doll-attributes {
  width: 100%;

  .points-info {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-family: "Courier New", "Consolas", monospace;
  }

  .points-highlight {
    color: $cyber-cyan;
    font-weight: 700;
  }
}
</style>
