<!--
  模块编号：M5
  模块名称：技能（人类）
  显示模式：human-prep
  功能：16个技能点分配
-->
<template>
  <div class="module-human-skills">
    <ModuleHeader title="技能点分配" subtitle="Skills">
      <template #right>
        <span class="points-info">
          可用技能点：<span class="points-highlight">{{ remainingPoints }}</span> / {{ effectiveSkillPoints }}
        </span>
      </template>
    </ModuleHeader>
    <div class="skills-allocator-wrapper">
      <AttributeAllocator
        :attribute-points="effectiveSkillPoints"
        :attribute-limit="skillLimit"
        :attributes="characterStore.skills"
        :attribute-data="skillData"
        :show-divider="false"
        :normal-range="{ min: 0, max: 4 }"
        :special-ranges="specialSkillRanges"
        :modifier-rules="modifierRules"
        @update:attributes="characterStore.updateSkills"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { useModifiers } from '@/composables/useModifiers'
import { getM5Cache, SKILL_KEYS } from '@/utils/cacheManager'
import AttributeAllocator from '@/components/AttributeAllocator.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import skillsData from '@/data/skills.json'

const characterStore = useCharacterStore()
const outputsStore = useModuleOutputsStore()

// 基础技能点数
const baseSkillPoints = 15

// 从 M4 读取剩余属性点（用于无意义一代计算）
const m4RemainingPoints = computed(() => {
  return outputsStore.getModuleOutput('M4')?.remainingPoints || 0
})

// 从 M1 读取出身
const m1Background = computed(() => {
  return outputsStore.getModuleOutput('M1')?.background || null
})

// 是否为"无意义一代"出身（ID=1）
const isSuperfluousGeneration = computed(() => {
  return m1Background.value === '1' || m1Background.value === 1
})

// 人性技能当前值（ID=16）
const humanityValue = computed(() => characterStore.skills[16] || 0)

// 人性负值转化的额外技能点（每-1人性=+1技能点）
const humanityBonus = computed(() => {
  const humanity = humanityValue.value
  return humanity < 0 ? Math.abs(humanity) : 0
})

// 从 M1 读取特质
const m1Traits = computed(() => {
  return outputsStore.getModuleOutput('M1').traits || ''
})

// 是否为"忒修斯之船"特质（ID=29）
const isTheseusShip = computed(() => {
  return m1Traits.value.includes('29')
})

// 总技能点数
// 默认：基础15 + 人性负值转化
// 无意义一代：10 + M4剩余属性点
// 忒修斯之船：0
const totalSkillPoints = computed(() => {
  if (isTheseusShip.value) {
    return 0
  }
  if (isSuperfluousGeneration.value) {
    return 10 + m4RemainingPoints.value
  }
  return baseSkillPoints + humanityBonus.value
})

// 单项技能上限
const skillLimit = 5

// 剩余技能点
const remainingPoints = computed(() => {
  // 忒修斯之船：技能点归零
  if (isTheseusShip.value) {
    return 0
  }

  let spent = 0
  for (let i = 1; i <= 16; i++) {
    spent += characterStore.skills[i] || 0
  }
  
  // 无意义一代：使用新的总技能点计算
  if (isSuperfluousGeneration.value) {
    return totalSkillPoints.value - spent
  }
  
  // 默认：使用基础15点计算
  return baseSkillPoints - spent
})

// 有效的技能点总数（用于 AttributeAllocator 上限控制）
const effectiveSkillPoints = computed(() => {
  if (isTheseusShip.value) {
    return 0
  }
  return totalSkillPoints.value
})

// 忒修斯之船模式下自动清空非人性技能
watch(isTheseusShip, (newVal) => {
  if (newVal) {
    const newSkills = { 16: characterStore.skills[16] || 0 }
    for (let i = 1; i <= 15; i++) {
      newSkills[i] = 0
    }
    characterStore.updateSkills(newSkills)
  }
})

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

// ==================== 调整值规则（监听 M1 输出）====================
// 所有出身技能加成效果基于人类起源.json

const modifierRules = [
  // ==================== 特质加成 ====================
  // 老派硬汉（ID=18）-> 闪避（ID=2）+1
  {
    id: 'old_school_evasion',
    name: '老派硬汉',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && traits.includes('18'),
    value: 1,
    target: '2'
  },

  // 亚文化一代（ID=24）-> 检索（ID=9）+1, 交涉（ID=15）-1
  {
    id: 'subculture_search',
    name: '亚文化一代',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && traits.includes('24'),
    value: 1,
    target: '9'
  },
  {
    id: 'subculture_negotiation_neg',
    name: '亚文化一代',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && traits.includes('24'),
    value: -1,
    target: '15'
  },

  // 顶尖玩家（ID=27）-> 交涉（ID=15）-2, 工程（ID=7）+2
  {
    id: 'top_player_negotiation_neg',
    name: '顶尖玩家',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && traits.includes('27'),
    value: -2,
    target: '15'
  },
  {
    id: 'top_player_engineering',
    name: '顶尖玩家',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && traits.includes('27'),
    value: 2,
    target: '7'
  },

  // ==================== 出身加成 ====================
  // 老兵（ID=3）-> 枪械（ID=3）+2
  {
    id: 'veteran_firearms',
    name: '老兵',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '3',
    value: 2,
    target: '3'
  },

  // 公司官僚（ID=4）-> 交涉（ID=15）+2
  {
    id: 'corporate_bureaucrat_negotiation',
    name: '公司官僚',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '4',
    value: 2,
    target: '15'
  },

  // 战区拾荒者（ID=5）-> 隐藏/隐匿（ID=11）+2
  {
    id: 'scavenger_stealth',
    name: '战区拾荒者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '5',
    value: 2,
    target: '11'
  },

  // 技术堡垒工作者（ID=7）-> 操控（ID=4）+2
  {
    id: 'tech_fortress_piloting',
    name: '技术堡垒工作者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '7',
    value: 2,
    target: '4'
  },

  // 无国界佣兵（ID=8）-> 体术（ID=1）+2, 侦察（ID=10）+1
  {
    id: 'mercenary_martial',
    name: '无国界佣兵',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '8',
    value: 2,
    target: '1'
  },
  {
    id: 'mercenary_investigation',
    name: '无国界佣兵',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '8',
    value: 1,
    target: '10'
  },

  // 人类保护者（ID=9）-> 医疗（ID=8）+2
  {
    id: 'protector_medicine',
    name: '人类保护者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '9',
    value: 2,
    target: '8'
  },

  // 意识形态主义者（ID=10）-> 阶级（ID=13）+1, 社会（ID=14）+1, 交涉（ID=15）+1
  {
    id: 'ideologist_etiquette',
    name: '意识形态主义者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '10',
    value: 1,
    target: '13'
  },
  {
    id: 'ideologist_streetwise',
    name: '意识形态主义者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '10',
    value: 1,
    target: '14'
  },
  {
    id: 'ideologist_negotiation',
    name: '意识形态主义者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '10',
    value: 1,
    target: '15'
  },

  // 新世界建设者（ID=11）-> 工程（ID=7）+2
  {
    id: 'builder_engineering',
    name: '新世界建设者',
    watch: () => outputsStore.getModuleOutput('M1').background,
    match: '11',
    value: 2,
    target: '7'
  },
  // 虚伪凝聚力（ID=25）-> 擦除（ID=12）-1
  {
    id: 'false_cohesion_erase',
    name: '虚伪凝聚力',
    watch: () => outputsStore.getModuleOutput('M1').traits,
    match: (traits) => traits && (traits.includes('25') || traits.includes(25)),
    value: -1,
    target: '12'
  }
]

// 使用 useModifiers 计算调整值
const { getModifierFor } = useModifiers(modifierRules)

// 技能键名列表（1-16）
const skillKeys = Array.from({ length: 16 }, (_, i) => (i + 1).toString())

// 获取各技能的最大可分配值（考虑调整值）
const getMaxAllocatable = (skillId) => {
  const modifier = getModifierFor(skillId)
  // 最大可分配值 = 5 - 调整值（但不能小于0）
  return Math.max(0, 5 - modifier)
}

// 检查是否有古法炼体特质（ID=19）
const hasAncientBodybuilding = computed(() => {
  const traits = outputsStore.getModuleOutput('M1').traits || []
  return traits.includes('19') || traits.includes(19)
})

// 特殊技能范围定义
// 人性技能（ID=16）在忒修斯模式下只能为负值（-4到0），用于转化为属性点
// 其他技能在忒修斯模式下固定为0（max=0，无法增加）
const specialSkillRanges = computed(() => {
  const ranges = {}

  if (isTheseusShip.value) {
    // 忒修斯模式：人性技能范围 -4~0，其他技能 max=0（无法加点）
    for (let i = 1; i <= 16; i++) {
      if (i === 16) {
        ranges[i] = { min: -4, max: 0, normalMin: 0, normalMax: 0 }
      } else {
        ranges[i] = { min: 0, max: 0, normalMin: 0, normalMax: 0 }
      }
    }
  } else {
    // 普通模式：所有技能考虑调整值限制
    for (let i = 1; i <= 16; i++) {
      const skillId = i.toString()
      const maxAllocatable = getMaxAllocatable(skillId)
      
      // 古法炼体（ID=19）：技能3~15范围限制为0~2
      let effectiveMax = maxAllocatable
      if (hasAncientBodybuilding.value && i >= 3 && i <= 15) {
        effectiveMax = Math.min(2, maxAllocatable)
      }
      
      // 人性技能（ID=16）特殊范围 -4~4
      if (i === 16) {
        ranges[skillId] = {
          min: -4,
          max: Math.min(4, effectiveMax),
          normalMin: 0,
          normalMax: Math.min(4, effectiveMax)
        }
      } else {
        ranges[skillId] = {
          min: 0,
          max: effectiveMax,
          normalMin: 0,
          normalMax: effectiveMax
        }
      }
    }
  }

  return ranges
})

// 监听调整值变化，如果变化则清空对应技能
const previousModifiers = ref({})

watch(() => skillKeys.map(key => getModifierFor(key)), (newModifiers) => {
  skillKeys.forEach((key, index) => {
    const newModifier = newModifiers[index]
    const oldModifier = previousModifiers.value[key]

    // 如果调整值发生变化且技能值超过新的最大值，清空技能
    if (oldModifier !== undefined && oldModifier !== newModifier) {
      const maxAllocatable = getMaxAllocatable(key)
      const currentValue = characterStore.skills[key] || 0

      if (currentValue > maxAllocatable) {
        const newSkills = { ...characterStore.skills }
        newSkills[key] = 0
        characterStore.updateSkills(newSkills)
      }
    }

    previousModifiers.value[key] = newModifier
  })
}, { immediate: true, deep: true })

// 计算每个技能的总值（基础值 + 调整值）
const skillTotals = computed(() => {
  const totals = {}
  for (let i = 1; i <= 16; i++) {
    const baseValue = characterStore.skills[i] || 0
    const modifier = getModifierFor(i.toString())
    totals[i] = baseValue + modifier
  }
  return totals
})

// ==================== 数据输出 ====================
// 输出技能点相关信息供其他模块使用
useAutoOutput({
  baseSkillPoints: computed(() => baseSkillPoints),
  totalSkillPoints,
  humanityValue,
  humanityBonus,
  remainingSkillPoints: remainingPoints,
  usedSkillPoints: computed(() => totalSkillPoints.value - remainingPoints.value),
  isTheseusShip,
  skillTotals,
  skillModifiers: computed(() => {
    const modifiers = {}
    for (let i = 1; i <= 16; i++) {
      modifiers[i] = getModifierFor(i.toString())
    }
    return modifiers
  })
})

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  const cache = getM5Cache()
  if (!cache || !cache.skills || !Array.isArray(cache.skills)) return
  
  // 从数组恢复技能值（不验证上限，让玩家自己处理）
  const newSkills = {}
  SKILL_KEYS.forEach((key, index) => {
    newSkills[key] = cache.skills[index] || 0
  })
  characterStore.updateSkills(newSkills)
  
  console.log('[M5] 从缓存恢复技能:', newSkills)
})

// 监听技能变化触发保存
watch(characterStore.skills, () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-human-skills {
  width: 100%;

  .skills-allocator-wrapper {
    width: 100%;
  }

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
