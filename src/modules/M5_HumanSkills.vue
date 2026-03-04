<!--
  模块编号：M5
  模块名称：技能（人类）
  显示模式：human-prep
  功能：16个技能点分配
-->
<template>
  <div class="module-human-skills">
    <h3 class="module-title">技能点分配</h3>
    <!-- 技能点分配器 -->
    <AttributeAllocator
      :attribute-points="totalSkillPoints"
      :attribute-limit="skillLimit"
      :attributes="characterStore.skills"
      :attribute-data="skillData"
      :source-info="skillPointsInfo"
      :show-divider="false"
      :normal-range="{ min: 0, max: 4 }"
      :special-ranges="specialSkillRanges"
      :modifier-rules="modifierRules"
      @update:attributes="characterStore.updateSkills"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'
import AttributeAllocator from '@/components/AttributeAllocator.vue'

// 导入技能数据
import skillsData from '@/data/skills.json'

// 使用 store
const characterStore = useCharacterStore()

// 总技能点数（人类默认30点，可根据出身调整）
const totalSkillPoints = computed(() => characterStore.totalSkillPoints || 30)

// 单项技能上限
const skillLimit = 5

// 技能数据格式化（适配AttributeAllocator）
const skillData = computed(() => {
  const formatted = {}
  skillsData.forEach(skill => {
    formatted[skill.id] = {
      name: skill.name,
      description: skill.description,
      effects: skill.effects
    }
  })
  return formatted
})

// 特殊技能范围定义
// 人性技能可以突破到-4~+4，其他技能可以到5
const specialSkillRanges = {
  '1': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '2': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '3': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '4': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '5': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '6': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '7': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '8': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '9': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '10': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '11': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '12': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '13': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '14': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '15': { min: 0, max: 5, normalMin: 0, normalMax: 4 },
  '16': { min: -4, max: 4, normalMin: 0, normalMax: 4 }  // 人性技能
}

// 调整值规则
// 老派硬汉（ID=18）特质 -> 闪避（ID=2）+1
const modifierRules = [
  {
    id: 'old_school_evasion',
    name: '老派硬汉加成',
    watch: () => characterStore.selectedTraits,
    match: (traits) => traits.includes('18'),  // 检查是否包含老派硬汉ID
    value: 1,
    target: '2'  // 闪避技能的ID
  }
]

// 技能点来源信息
const skillPointsInfo = computed(() => {
  return `可用技能点：${totalSkillPoints.value}`
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-human-skills {
  width: 100%;

  .module-title {
    color: $cyber-cyan;
    margin: 0 0 16px 0;
    font-size: 16px;
    border-bottom: 1px solid rgba(0, 243, 255, 0.2);
    padding-bottom: 8px;
  }
}
</style>
