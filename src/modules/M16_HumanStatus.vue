<!--
  模块编号：M16
  模块名称：角色状态（人类）
  显示模式：human-action
  功能：基于上方模块进行计算的模块，也包含玩家跑团中填写的东西
-->
<template>
  <div class="module-m16">
    <ModuleHeader title="角色状态" subtitle="Status" />

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

    <!-- 伤痕列表（包含 HP） -->
    <ScarList v-model="scars" :hp-current="currentHp" :hp-max="maxHp" />

    <!-- 命运点数 -->
    <FatePoints v-model="fatePoints" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import HpDisplay from '@/components/HpDisplay.vue'
import SafetyGrid from '@/components/SafetyGrid.vue'
import ScarList from '@/components/ScarList.vue'
import FatePoints from '@/components/FatePoints.vue'

// HP 状态（先设定为8，后面再写逻辑）
const currentHp = ref(8)
const maxHp = ref(8)

// 物理安全值
const physicalCalculated = ref(0) // 计算值，后面再写逻辑
const physicalManualAdjust = ref(0)
const physicalFilled = ref(0) // 涂亮的格子数

// 电子安全值
const electronicCalculated = ref(0) // 计算值，后面再写逻辑
const electronicManualAdjust = ref(0)
const electronicFilled = ref(0) // 涂亮的格子数

// 伤痕列表
const scars = ref([])

// 命运点数（默认3，默认涂满）
const fatePoints = ref(3)
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m16 {
  .safety-section {
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
