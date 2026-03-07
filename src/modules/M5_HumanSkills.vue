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
</template>

<script setup>
import { computed, watch } from 'vue'
import { useCharacterStore } from '@/stores/character'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { useModifiers } from '@/composables/useModifiers'
import AttributeAllocator from '@/components/AttributeAllocator.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import skillsData from '@/data/skills.json'

const characterStore = useCharacterStore()
const outputsStore = useModuleOutputsStore()

// 基础技能点数
const baseSkillPoints = 15

// 人性技能当前值（ID=16）
const humanityValue = computed(() => characterStore.skills[16] || 0)

// 人性负值转化的额外技能点（每-1人性=+1技能点）
const humanityBonus = computed(() => {
  const humanity = humanityValue.value
  return humanity < 0 ? Math.abs(humanity) : 0
})

// 总技能点数（基础15 + 人性负值转化）
const totalSkillPoints = computed(() => baseSkillPoints + humanityBonus.value)

// 单项技能上限
const skillLimit = 5

// 从 M1 读取特质（检测忒修斯之船）
const m1Traits = computed(() => {
  return outputsStore.getModuleOutput('M1').traits || ''
})

// 是否为"忒修斯之船"特质（ID=29）
const isTheseusShip = computed(() => {
  return m1Traits.value.includes('29')
})

// 剩余技能点（忒修斯之船模式下强制为0）
// 注意：使用 baseSkillPoints 计算，因为人性负值已经在 totalSkillPoints 中体现
// 避免重复计算（如人性-2时：total=17, spent=-2, remaining=19 是错误的）
const remainingPoints = computed(() => {
  // 忒修斯之船：技能点归零，全部转为属性点
  if (isTheseusShip.value) {
    return 0
  }

  let spent = 0
  for (let i = 1; i <= 16; i++) {
    spent += characterStore.skills[i] || 0
  }
  // 使用基础15点计算，人性负值的bonus已经在 totalSkillPoints 中
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
    // 普通模式：只有人性技能特殊
    ranges['16'] = { min: -4, max: 4, normalMin: 0, normalMax: 4 }
  }

  return ranges
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
  }
]

// 使用 useModifiers 计算调整值
const { getModifierFor } = useModifiers(modifierRules)

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
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-human-skills {
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
