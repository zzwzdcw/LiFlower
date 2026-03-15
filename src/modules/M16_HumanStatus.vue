<!--
  模块编号：M16
  模块名称：角色状态（人类）
  显示模式：human-action
  功能：基于上方模块进行计算的模块，也包含玩家跑团中填写的东西
-->
<template>
  <div class="module-m16">
    <ModuleHeader title="角色状态" subtitle="Status" />

    <!-- 常数展示 -->
    <div class="constants-section">
      <div class="constant-item">
        <AdjustableValue v-model="apValue" :initial-value="2" label="AP" />
      </div>
      <div class="constant-item">
        <AdjustableValue v-model="npValue" :initial-value="0" label="NP" />
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
    />

    <!-- 命运点数 -->
    <FatePoints v-model="fatePoints" :humanity-value="humanityValue" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { getM16Cache } from '@/utils/cacheManager'
import ModuleHeader from '@/components/ModuleHeader.vue'
import SafetyGrid from '@/components/SafetyGrid.vue'
import ScarList from '@/components/ScarList.vue'
import FatePoints from '@/components/FatePoints.vue'
import AdjustableValue from '@/components/AdjustableValue.vue'
import ArmorValue from '@/components/ArmorValue.vue'

const moduleOutputs = useModuleOutputsStore()

// 常数值（AP/NP/EP）
const apValue = ref(2)
const npValue = ref(0)

// EP 基础值（从 M4 读取功率值）
const epBaseValue = computed(() => moduleOutputs.outputs.M4?.attributeTotals?.power || 0)
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

// 从 M4 读取结构属性
const structureValue = computed(() => {
  return moduleOutputs.outputs.M4?.attributeTotals?.structure || 0
})

// 从 M5 读取技能等级
const skillTotals = computed(() => {
  return moduleOutputs.outputs.M5?.skillTotals || {}
})

// 自动调整值（预留接口）
const hpAutoAdjust = ref(0)

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
// 物理安全值基础值 = 2 + 体术*1 + 闪避*1 + 自动调整
const physicalCalculated = computed(() => {
  const martialArts = skillTotals.value['1'] || 0 // 体术 ID=1
  const evasion = skillTotals.value['2'] || 0 // 闪避 ID=2
  return 2 + martialArts + evasion + physicalAutoAdjust.value
})
const physicalManualAdjust = ref(0)
const physicalFilled = ref(0)

// 电子安全值自动调整（预留接口）
const electronicAutoAdjust = ref(0)
// 电子安全值基础值 = 0 + 破解*1 + 编程*1 + 自动调整
const electronicCalculated = computed(() => {
  const hacking = skillTotals.value['5'] || 0 // 破解 ID=5
  const programming = skillTotals.value['6'] || 0 // 编程 ID=6
  return 0 + hacking + programming + electronicAutoAdjust.value
})
const electronicManualAdjust = ref(0)
const electronicFilled = ref(0)

// 伤痕列表
const scars = ref([])

// 人性技能值（从 M5 读取，ID=16）
const humanityValue = computed(() => {
  // 尝试字符串和数字两种键
  return skillTotals.value['16'] ?? skillTotals.value[16] ?? 0
})

// 命运点数（默认3，默认涂满）
const fatePoints = ref(3)

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  console.log('[M16] onMounted 开始恢复')
  const cache = getM16Cache()
  console.log('[M16] 获取到的 cache:', cache)
  if (!cache) {
    console.log('[M16] cache 为 null，跳过恢复')
    return
  }
  
  // 恢复 AP/NP/EP 调整
  if (cache.apAdjust !== undefined) {
    apValue.value = 2 + cache.apAdjust
  }
  if (cache.npAdjust !== undefined) {
    npValue.value = 0 + cache.npAdjust
  }
  if (cache.epAdjust !== undefined) {
    epValue.value = epInitialValue.value + cache.epAdjust
  }
  
  // 恢复护甲等级
  if (cache.armor1 !== undefined) armorValues.value.armor1 = cache.armor1
  if (cache.armor2 !== undefined) armorValues.value.armor2 = cache.armor2
  if (cache.armor3 !== undefined) armorValues.value.armor3 = cache.armor3
  
  // 恢复 HP 调整
  hpAdjust.value = cache.hpAdjust || 0
  
  // 恢复安全值调整
  physicalManualAdjust.value = cache.physicalAdjust || 0
  electronicManualAdjust.value = cache.electronicAdjust || 0
  
  // 恢复伤痕
  if (cache.scars && cache.scars.length > 0) {
    scars.value = cache.scars
  }
  
  console.log('[M16] 从缓存恢复数据:', cache)
})

// 监听变化触发保存
watch([
  apValue,
  npValue,
  epValue,
  armorValues,
  hpAdjust,
  physicalManualAdjust,
  electronicManualAdjust,
  scars
], () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// 注册本地数据到全局缓存管理器
onMounted(() => {
  if (window.liflowerCache) {
    window.liflowerCache.registerM16({
      apAdjust: computed(() => apValue.value - 2),
      npAdjust: computed(() => npValue.value - 0),
      epAdjust: computed(() => epValue.value - epInitialValue.value),
      armor1: computed(() => armorValues.value.armor1),
      armor2: computed(() => armorValues.value.armor2),
      armor3: computed(() => armorValues.value.armor3),
      hpAdjust,
      physicalAdjust: physicalManualAdjust,
      electronicAdjust: electronicManualAdjust,
      scars
    })
    console.log('[M16] 已注册到缓存管理器')
  } else {
    console.warn('[M16] window.liflowerCache 未定义')
  }
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m16 {
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
