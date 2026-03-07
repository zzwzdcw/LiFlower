<!--
  模块编号：M4
  模块名称：属性（人类）
  显示模式：human-prep
  功能：6属性点分配（人类）- 当可用属性点>0时自动显示
-->
<template>
  <div class="module-human-attributes">
    <ModuleHeader title="属性点分配" subtitle="Attributes">
      <template #right>
        <span class="points-info">
          可用属性点：<span class="points-highlight">{{ remainingPoints }}</span> / {{ totalAttributePoints }}
        </span>
      </template>
    </ModuleHeader>
    <!-- 属性点分配器 -->
    <AttributeAllocator
      :attribute-points="totalAttributePoints"
      :attribute-limit="attributeLimit"
      :attributes="characterStore.humanAttributes"
      :attribute-data="attributeData"
      :show-divider="false"
      :modifier-rules="modifierRules"
      @update:attributes="handleAttributesUpdate"
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { useModifiers } from '@/composables/useModifiers'
import { useModeStore } from '@/stores/mode'
import AttributeAllocator from '@/components/AttributeAllocator.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'

// 导入属性数据
import attributeDataJson from '@/data/基本属性.json'
import backgroundData from '@/data/人类起源.json'

// 使用 store
const characterStore = useCharacterStore()
const outputsStore = useModuleOutputsStore()
const modeStore = useModeStore()

// 属性数据
const attributeData = attributeDataJson.attributeSystem

// 人类属性点限制
const attributeLimit = 5

// 总技能点数
const totalSkillPoints = 15

// 计算已用技能点
const usedSkillPoints = computed(() => {
  return Object.values(characterStore.skills).reduce((sum, val) => sum + val, 0)
})

// 计算剩余可用技能点
const remainingSkillPoints = computed(() => {
  return totalSkillPoints - usedSkillPoints.value
})

// ==================== 出身影响计算 ====================
// 获取当前出身数据
const currentBackground = computed(() => {
  const bgId = characterStore.humanBackground
  if (!bgId) return null
  return backgroundData.find(item => item.id.toString() === bgId.toString())
})

// 是否为"无意义一代"
const isSuperfluousGeneration = computed(() => {
  return currentBackground.value?.id === 1
})

// ==================== 从 M1 读取特质（检测忒修斯之船）====================
const m1Traits = computed(() => {
  return outputsStore.getModuleOutput('M1').traits || ''
})

// 是否为"忒修斯之船"特质（ID=29）- 最高优先级
const isTheseusShip = computed(() => {
  return m1Traits.value.includes('29')
})

// ==================== 从 M5 读取数据 ====================
const m5Data = computed(() => outputsStore.getModuleOutput('M5'))

// 人性当前值（ID=16）
const humanityValue = computed(() => m5Data.value.humanityValue || 0)

// 人性负值转化的额外点数
const humanityBonus = computed(() => {
  const val = humanityValue.value
  return val < 0 ? Math.abs(val) : 0
})

// ==================== 可用属性点计算 ====================
// 规则优先级：
// 1. 忒修斯之船（ID=29）：可用属性点 = 15 + 人性负值（每-1人性=+1属性）
// 2. 非"无意义一代"：可用属性点 = 0
// 3. "无意义一代"：可用属性点 = min(5, M5剩余技能点)

const totalAttributePoints = computed(() => {
  // 优先级1：忒修斯之船
  // 基础15点 + 人性负值转化（每-1人性=+1属性点）
  if (isTheseusShip.value) {
    return 15 + humanityBonus.value
  }

  // 优先级2：非无意义一代
  if (!isSuperfluousGeneration.value) {
    return 0
  }

  // 优先级3：无意义一代规则
  const m5Used = m5Data.value.usedSkillPoints || 0
  const m5Remaining = m5Data.value.remainingSkillPoints ?? 15
  const maxAllowedByTotal = 15 - m5Used
  const baseAvailable = Math.min(5, m5Remaining)
  return Math.min(baseAvailable, maxAllowedByTotal)
})

// 计算已分配属性点
const allocatedPoints = computed(() => {
  return Object.values(characterStore.humanAttributes).reduce((sum, val) => sum + val, 0)
})

// 计算剩余可用属性点
const remainingPoints = computed(() => {
  return totalAttributePoints.value - allocatedPoints.value
})

// 总消耗检查：已分配属性点超过可用上限时，清空属性点
// 只在人类整备模式下生效
watch([allocatedPoints, totalAttributePoints], ([allocated, available]) => {
  if (modeStore.currentMode !== 'human-prep') return
  
  if (allocated > available) {
    // 清空属性点选择
    characterStore.updateAttributes({
      structure: 0,
      torque: 0,
      athletics: 0,
      compute: 0,
      information: 0,
      power: 0
    })
  }
})

// 处理属性更新
const handleAttributesUpdate = (newAttrs) => {
  const newAttrPoints = Object.values(newAttrs).reduce((sum, val) => sum + val, 0)

  // 检查是否超过当前可用上限
  if (newAttrPoints > totalAttributePoints.value) {
    return
  }

  characterStore.updateHumanAttributes(newAttrs)
}

// 调整值规则
// 旧网信徒（出身ID=6）+ 大脑电子化 = 算力+2
const modifierRules = [
  {
    id: 'oldnet_cyberbrain_compute',
    name: '旧网信徒电子脑',
    watch: () => ({
      backgroundId: outputsStore.getModuleOutput('M1').background,
      hasCyberBrain: outputsStore.getModuleOutput('M6').hasCyberBrain
    }),
    match: (data) => data.backgroundId === '6' && data.hasCyberBrain === true,
    value: 2,
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
    const baseValue = characterStore.humanAttributes[key] || 0
    const modifier = getModifierFor(key)
    totals[key] = baseValue + modifier
  })
  return totals
})

// ==================== 模块显示控制 ====================
// 定义模块的显示条件：
// 1. 当可用属性点 > 0 时显示
// 2. 或者已经有任意属性被分配（attributeTotals 中有非零值）
const shouldShow = computed(() => {
  // 条件1：有可用属性点
  if (totalAttributePoints.value > 0) return true

  // 条件2：已经有属性被分配（任意一项不等于0）
  return Object.values(attributeTotals.value).some(val => val !== 0)
})

// 暴露给父组件（StandardModule）
defineExpose({
  shouldShow
})

// ==================== 模块数据输出 ====================
useAutoOutput({
  totalAttributePoints,
  remainingPoints,
  humanityValue,
  humanityBonus,
  isTheseusShip,
  isSuperfluousGeneration,
  shouldShow,
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

.module-human-attributes {
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

  .humanity-bonus {
    color: #bc13fe;
    font-size: 11px;
    margin-left: 8px;
  }
}
</style>
