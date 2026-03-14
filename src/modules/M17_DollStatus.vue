<!--
  模块编号：M17
  模块名称：角色状态（人形）
  显示模式：doll-action
  功能：包括HP等基于上方模块进行计算的模块，也包含玩家跑团中填写的东西
-->
<template>
  <div class="module-m17">
    <ModuleHeader title="角色状态" subtitle="Status" />

    <!-- 常数展示 -->
    <div class="constants-section">
      <div class="constant-item">
        <AdjustableValue v-model="apValue" :initial-value="2" label="AP" />
      </div>
      <div class="constant-item">
        <AdjustableValue v-model="npValue" :initial-value="1" label="NP" />
      </div>
      <div class="constant-item">
        <AdjustableValue v-model="epValue" :initial-value="epInitialValue" label="EP" />
      </div>
    </div>

    <!-- 护甲等级 -->
    <ArmorValue v-model="armorValues" label="护甲等级" />

    <!-- 安全值 -->
    <div class="safety-section">
      <SafetyGrid
        v-model="physicalFilled"
        v-model:manual-adjust="physicalManualAdjust"
        :calculated-value="physicalCalculated"
        label="物理安全值"
      />
      <SafetyGrid
        v-model="electronicFilled"
        v-model:manual-adjust="electronicManualAdjust"
        :calculated-value="electronicCalculated"
        label="电子安全值"
      />
    </div>

    <!-- 伤痕列表（包含 HP 逻辑） -->
    <ScarList
      v-model="scars"
      :hp-base="hpBase"
      v-model:hp-adjust="hpAdjust"
      v-model:hp-current="currentHp"
      mode="doll"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import ModuleHeader from '@/components/ModuleHeader.vue'
import SafetyGrid from '@/components/SafetyGrid.vue'
import ScarList from '@/components/ScarList.vue'
import AdjustableValue from '@/components/AdjustableValue.vue'
import ArmorValue from '@/components/ArmorValue.vue'

const moduleOutputs = useModuleOutputsStore()

// 常数值（AP/NP/EP）
const apValue = ref(2)
const npValue = ref(1)

// EP 基础值（从 M3 读取功率值）
const epBaseValue = computed(() => moduleOutputs.outputs.M3?.attributeTotals?.power || 0)
// EP 当前值（可调）
const epValue = ref(0)
// EP 初始值（用于按钮高亮显示）
const epInitialValue = ref(0)
// 同步 EP 基础值到当前值和初始值
watch(epBaseValue, (newVal) => {
  epValue.value = newVal
  epInitialValue.value = newVal
}, { immediate: true })

// 护甲值
const armorValues = ref({ armor1: 0, armor2: 0, armor3: 0 })

// 读取 M2 输出
const m2Output = computed(() => moduleOutputs.outputs.M2 || {})

// 从 M3 读取结构属性（人形使用 M3 的属性）
const structureValue = computed(() => {
  return moduleOutputs.outputs.M3?.attributeTotals?.structure || 0
})

// 从 M7 读取技能总值（已包含芯片和特质调整值）
const skillValues = computed(() => {
  return moduleOutputs.outputs.M7?.skillValues || {}
})

// 读取 M7 输出（专利芯片列表）
const m7Output = computed(() => moduleOutputs.outputs.M7 || {})

// 获取技能总值（直接读取 M7 输出）
function getSkillValue(skillId) {
  if (!skillId) return 0
  return skillValues.value[skillId.toString()] || 0
}

// HP 自动调整值
const hpAutoAdjust = computed(() => {
  let adjust = 0
  // 雪狼企业 ID=3 时 +4
  if (m2Output.value.manufacturerId === 3) {
    adjust += 4
  }
  // 损伤管理算法芯片（ID=9）时 +4
  const patentChips = m7Output.value?.patentChips || []
  if (patentChips.includes(9) || patentChips.includes('9')) {
    adjust += 4
  }
  return adjust
})

// HP 基础值 = 8 + 结构值 * 2 + 自动调整
const hpBase = computed(() => {
  return 8 + structureValue.value * 2 + hpAutoAdjust.value
})

// HP 手动调整值
const hpAdjust = ref(0)
// HP 当前值（由 ScarList 组件计算并更新）
const currentHp = ref(8)

// 物理安全值自动调整（预留接口）
const physicalAutoAdjust = ref(0)
// 物理安全值基础值 = 4 + 体术技能值 + 闪避技能值 + 自动调整
const physicalCalculated = computed(() => {
  const martialArts = getSkillValue(1) // 体术 ID=1
  const evasion = getSkillValue(2) // 闪避 ID=2
  return 4 + martialArts + evasion + physicalAutoAdjust.value
})
const physicalManualAdjust = ref(0)
const physicalFilled = ref(0)

// 电子安全值自动调整（预留接口）
const electronicAutoAdjust = ref(0)
// 电子安全值基础值 = 4 + 破解技能值 + 编程技能值 + 自动调整
const electronicCalculated = computed(() => {
  const hacking = getSkillValue(5) // 破解 ID=5
  const programming = getSkillValue(6) // 编程 ID=6
  return 4 + hacking + programming + electronicAutoAdjust.value
})
const electronicManualAdjust = ref(0)
const electronicFilled = ref(0)

// 伤痕列表
const scars = ref([])
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m17 {
  .constants-section {
    display: flex;
    justify-content: space-around;
    margin: 12px 0;

    .constant-item {
      flex: 1;
      display: flex;
      justify-content: center;
    }
  }

  .safety-section {
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
