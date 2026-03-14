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
        <span class="points-info">可用属性点：<span class="points-highlight">{{ remainingPoints }}</span> / {{ totalPoints }}</span>
      </template>
    </ModuleHeader>
    <!-- 属性点分配器 -->
    <AttributeAllocator
      :attribute-points="totalPoints"
      :attribute-limit="attributeLimit"
      :attributes="characterStore.dollAttributes"
      :attribute-data="attributeData"
      :show-divider="false"
      :modifier-rules="modifierRules"
      :normal-range="normalRange"
      :special-ranges="specialRanges"
      @update:attributes="characterStore.updateDollAttributes"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { useModifiers } from '@/composables/useModifiers'
import AttributeAllocator from '@/components/AttributeAllocator.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'

// 导入属性数据
import attributeDataJson from '@/data/基本属性.json'
import hardwareSpecData from '@/data/硬件规格.json'

// 使用 store
const characterStore = useCharacterStore()
const moduleOutputs = useModuleOutputsStore()

// 属性数据
const attributeData = attributeDataJson.attributeSystem

// 从 M2 读取 hardwareSpecId 和 manufacturerId
const m2Output = computed(() => moduleOutputs.outputs.M2 || {})
const hardwareSpecId = computed(() => m2Output.value.hardwareSpecId || null)
const manufacturerId = computed(() => m2Output.value.manufacturerId || null)

// 获取硬件规格数据
const hardwareSpec = computed(() => {
  if (!hardwareSpecId.value) return null
  return hardwareSpecData.find(spec => spec.id === hardwareSpecId.value)
})

// 基础属性点（来自硬件规格）
const basePoints = computed(() => {
  return hardwareSpec.value?.attributePoints || 0
})

// 调整值（manufacturerId=1 时 +3）
const adjustPoints = computed(() => {
  return manufacturerId.value === 1 ? 3 : 0
})

// 总属性点
const totalPoints = computed(() => {
  return basePoints.value + adjustPoints.value
})

// 属性上限（常规）
const normalAttributeLimit = computed(() => {
  // hardwareSpecId=5 时常规上限为 5，否则为 4
  return hardwareSpecId.value === 5 ? 5 : 4
})

// 属性上限（特殊）
const specialAttributeLimit = computed(() => {
  // 特殊上限固定为 5
  return 5
})

// 计算属性上限（用于 AttributeAllocator）
const attributeLimit = computed(() => {
  return specialAttributeLimit.value
})

// 调整值规则
const modifierRules = [
  // 暗隼电子 -> 算力+1
  {
    id: 'darkhawk_compute',
    watch: () => characterStore.manufacturer,
    match: '暗隼电子',
    value: 1,
    target: 'compute'
  },
  // 液体燃料（ID=3）-> 功率+1
  {
    id: 'liquid_fuel_power',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('3') || traitIds.includes(3)),
    value: 1,
    target: 'power'
  },
  // 古臭萝卜（ID=4）-> 运动-1，功率+1
  {
    id: 'retro_mecha_athletics',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('4') || traitIds.includes(4)),
    value: -1,
    target: 'athletics'
  },
  {
    id: 'retro_mecha_power',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('4') || traitIds.includes(4)),
    value: 1,
    target: 'power'
  },
  // 机房幻梦（ID=6）-> 结构、出力、运动 = -5
  {
    id: 'server_dream_structure',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('6') || traitIds.includes(6)),
    value: -5,
    target: 'structure'
  },
  {
    id: 'server_dream_torque',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('6') || traitIds.includes(6)),
    value: -5,
    target: 'torque'
  },
  {
    id: 'server_dream_athletics',
    watch: () => m2Output.value.traitIds,
    match: (traitIds) => traitIds && (traitIds.includes('6') || traitIds.includes(6)),
    value: -5,
    target: 'athletics'
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

// 常规范围定义（考虑调整值）
const normalRange = computed(() => {
  // 默认使用常规上限，但各属性实际最大值可能因调整值而降低
  return {
    min: 0,
    max: normalAttributeLimit.value
  }
})

// 检查是否有机房幻梦特质（ID=6）
const hasServerDream = computed(() => {
  const traitIds = m2Output.value?.traitIds || []
  return traitIds.includes('6') || traitIds.includes(6)
})

// 特殊范围定义（出力属性）
const specialRanges = computed(() => {
  const ranges = {}

  attributeKeys.forEach(key => {
    const maxAllocatable = getMaxAllocatable(key)
    const normalMax = normalAttributeLimit.value
    const specialMax = specialAttributeLimit.value

    // 机房幻梦：算力、信息、功率范围变为 0~5（实验级）
    let effectiveNormalMax = normalMax
    if (hasServerDream.value && ['compute', 'information', 'power'].includes(key)) {
      effectiveNormalMax = 5 // 实验级上限
    }

    // 实际最大值 = min(硬件上限, 5-调整值)
    const actualMax = Math.min(
      effectiveNormalMax,
      maxAllocatable
    )

    ranges[key] = {
      min: 0,
      max: actualMax,
      normalMin: 0,
      normalMax: actualMax,
      requiresConfirm: hardwareSpecId.value !== 5 && actualMax > normalMax
    }
  })

  return ranges
})

// 监听调整值变化，如果变化则清空对应属性
const previousModifiers = ref({})

watch(() => attributeKeys.map(key => getModifierFor(key)), (newModifiers) => {
  attributeKeys.forEach((key, index) => {
    const newModifier = newModifiers[index]
    const oldModifier = previousModifiers.value[key]

    // 如果调整值发生变化且属性值超过新的最大值，清空属性
    if (oldModifier !== undefined && oldModifier !== newModifier) {
      const maxAllocatable = Math.max(0, 5 - newModifier)
      const currentValue = characterStore.dollAttributes[key] || 0

      if (currentValue > maxAllocatable) {
        const newAttributes = { ...characterStore.dollAttributes }
        newAttributes[key] = 0
        characterStore.updateDollAttributes(newAttributes)
      }
    }

    previousModifiers.value[key] = newModifier
  })
}, { immediate: true, deep: true })

// 计算已分配属性点
const allocatedPoints = computed(() => {
  return Object.values(characterStore.dollAttributes).reduce((sum, val) => sum + val, 0)
})

// 计算剩余可用属性点
const remainingPoints = computed(() => {
  return totalPoints.value - allocatedPoints.value
})

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
  totalAttributePoints: totalPoints,
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
