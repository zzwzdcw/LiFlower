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
import { computed, watch, ref } from 'vue'
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

// 是否为"无意义一代"出身（ID=1）
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
// 2. 无意义一代（出身ID=1）：可用属性点 = 5（技能点兑换，上限5点）
// 3. 默认：可用属性点 = 0（普通人类没有额外属性点）

const totalAttributePoints = computed(() => {
  // 优先级1：忒修斯之船
  if (isTheseusShip.value) {
    return 15 + humanityBonus.value
  }

  // 优先级2：无意义一代
  if (isSuperfluousGeneration.value) {
    return 5
  }

  // 默认：0点（普通人类没有额外属性点）
  return 0
})

// 计算已分配属性点
const allocatedPoints = computed(() => {
  return Object.values(characterStore.humanAttributes).reduce((sum, val) => sum + val, 0)
})

// 计算剩余可用属性点
const remainingPoints = computed(() => {
  return totalAttributePoints.value - allocatedPoints.value
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
const modifierRules = [
  // 旧网信徒（出身ID=6）+ 大脑电子化 = 算力+2
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
  },
  // 危险保险箱（ID=36）-> 算力+4
  {
    id: 'dangerous_safe_compute',
    name: '危险保险箱',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('36') || traits.includes(36)),
    value: 4,
    target: 'compute'
  },
  // 梦之匣（ID=30）-> 结构、出力、运动-5
  {
    id: 'dream_box_structure',
    name: '梦之匣',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('30') || traits.includes(30)),
    value: -5,
    target: 'structure'
  },
  {
    id: 'dream_box_torque',
    name: '梦之匣',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('30') || traits.includes(30)),
    value: -5,
    target: 'torque'
  },
  {
    id: 'dream_box_athletics',
    name: '梦之匣',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('30') || traits.includes(30)),
    value: -5,
    target: 'athletics'
  },
  // 古法炼体（ID=19）-> 出力+2
  {
    id: 'ancient_bodybuilding_torque',
    name: '古法炼体',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('19') || traits.includes(19)),
    value: 2,
    target: 'torque'
  }
]

// 使用 useModifiers 计算调整值和总值
const { getModifierFor } = useModifiers(modifierRules)

// 属性键名列表
const attributeKeys = ['structure', 'torque', 'athletics', 'compute', 'information', 'power']

// 获取各属性的最大可分配值（考虑调整值）
const getMaxAllocatable = (attrName) => {
  const modifier = getModifierFor(attrName)
  // 最大可分配值 = 5 - 调整值（但不能小于0）
  return Math.max(0, 5 - modifier)
}

// 监听调整值变化，如果变化则清空对应属性
const previousModifiers = ref({})

watch(() => attributeKeys.map(key => getModifierFor(key)), (newModifiers) => {
  attributeKeys.forEach((key, index) => {
    const newModifier = newModifiers[index]
    const oldModifier = previousModifiers.value[key]

    // 如果调整值发生变化且属性值超过新的最大值，清空属性
    if (oldModifier !== undefined && oldModifier !== newModifier) {
      const maxAllocatable = Math.max(0, 5 - newModifier)
      const currentValue = characterStore.humanAttributes[key] || 0

      if (currentValue > maxAllocatable) {
        const newAttributes = { ...characterStore.humanAttributes }
        newAttributes[key] = 0
        characterStore.updateHumanAttributes(newAttributes)
      }
    }

    previousModifiers.value[key] = newModifier
  })
}, { immediate: true, deep: true })

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
