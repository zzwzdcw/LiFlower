<!--
  芯片槽位组件
  功能：单个芯片槽位，支持专利芯片、常规芯片（技能熟练/额外程序）
-->
<template>
  <div class="chip-slot">
    <!-- 第一行：槽位标签 + 芯片类型选择 + 专利芯片/常规子类型选择 -->
    <div class="slot-row first-row">
      <!-- 槽位标签 -->
      <span class="slot-label">槽位 {{ index + 1 }}</span>
      
      <!-- 芯片类型选择 -->
      <CyberSelect
        v-model="slotType"
        :options="filteredOptions"
        class="chip-type-select"
        @change="handleTypeChange"
      />
      
      <!-- 专利芯片选择（仅在选择了专利芯片时显示） -->
      <CyberSelect
        v-if="showPatentSelector"
        v-model="selectedPatentChip"
        :options="availablePatentChipsFiltered"
        placeholder="选择专利芯片"
        class="sub-type-select"
      />
      
      <!-- 常规芯片子类型选择（仅在选择了常规芯片时显示） -->
      <CyberSelect
        v-if="showNormalSubtype"
        v-model="normalSubtype"
        :options="normalSubtypeOptions"
        placeholder="选择类型"
        class="sub-type-select"
        @change="handleSubtypeChange"
      />
    </div>
    
    <!-- 第二行：升级按钮（槽位标签正下方）+ 配置内容 -->
    <div v-if="showSecondRow" class="slot-row second-row">
      <!-- 升级按钮（固定在槽位标签正下方） -->
      <div class="upgrade-btn-wrapper">
        <button
          v-if="showUpgradeButton"
          :class="['upgrade-btn', { active: isUpgraded }]"
          @click="toggleUpgrade"
        >
          {{ isUpgraded ? '已升级' : '升级' }}
        </button>
      </div>

      <!-- 额外程序模式配置 -->
      <div v-if="isExtraProgramMode" class="program-config">
        <el-input
          v-model="programName"
          placeholder="程序名称"
          class="cyber-input-short program-input"
          size="small"
        />
        <!-- 升级后的额外输入框 -->
        <div v-if="isUpgraded" class="upgrade-effect-row">
          <el-input
            v-model="upgradeEffect"
            placeholder="升级效果描述"
            class="cyber-input-short program-input"
            size="small"
          />
        </div>
      </div>

      <!-- 技能熟练模式配置 -->
      <div v-if="isSkillMode" class="skill-config">
        <CyberSelect
          v-model="selectedSkill"
          :options="displayedSkillOptions"
          placeholder="选择技能"
          class="skill-select"
        />
      </div>
    </div>
    
    <!-- 专利芯片效果显示 -->
    <div v-if="selectedPatentChipInfo" class="cyber-effect-text chip-effect" v-html="parsedChipEffect">
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CyberSelect from './CyberSelect.vue'
import patentChipsData from '@/data/patentChips.json'
import manufacturerData from '@/data/企业技术.json'
import skillsData from '@/data/skills.json'
import { parseEffectText } from '@/utils/effectParser'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'none'
  },
  patentChipId: {
    type: [Number, String, null],
    default: null
  },
  chipConfig: {
    type: Object,
    default: () => ({
      normalSubtype: null,
      skillId: null,
      skillUpgraded: false,
      programName: '',
      programUpgraded: false,
      upgradeEffect: ''
    })
  },
  index: {
    type: Number,
    required: true
  },
  availableOptions: {
    type: Array,
    default: () => []
  },
  manufacturerId: {
    type: [Number, String, null],
    default: null
  },
  selectedPatentChipIds: {
    type: Array,
    default: () => []
  },
  hackMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:patentChipId', 'update:chipConfig'])

// 默认所有选项
const defaultOptions = [
  { label: '未安装', value: 'none', disabled: false },
  { label: '专利芯片', value: 'patent', disabled: false },
  { label: '常规芯片', value: 'normal', disabled: false },
  { label: '协调芯片', value: 'coordination', disabled: false }
]

// 常规芯片子类型选项
const normalSubtypeOptions = [
  { label: '技能熟练', value: 'skill' },
  { label: '额外程序', value: 'program' }
]

// 本地数据绑定 - 芯片类型
const slotType = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 本地数据绑定 - 选择的专利芯片ID
const selectedPatentChip = computed({
  get: () => props.patentChipId,
  set: (val) => emit('update:patentChipId', val)
})

// 本地配置数据
const normalSubtype = ref(props.chipConfig?.normalSubtype || null)
const selectedSkill = ref(props.chipConfig?.skillId || null)
const isUpgraded = ref(props.chipConfig?.skillUpgraded || props.chipConfig?.programUpgraded || false)
const programName = ref(props.chipConfig?.programName || '')
const upgradeEffect = ref(props.chipConfig?.upgradeEffect || '')

// 是否显示专利芯片选择器
const showPatentSelector = computed(() => slotType.value === 'patent')

// 是否显示常规芯片子类型选择器
const showNormalSubtype = computed(() => slotType.value === 'normal')

// 是否为额外程序模式
const isExtraProgramMode = computed(() => slotType.value === 'normal' && normalSubtype.value === 'program')

// 是否为技能熟练模式
const isSkillMode = computed(() => slotType.value === 'normal' && normalSubtype.value === 'skill')

// 是否显示升级按钮（在额外程序或技能熟练模式下显示）
const showUpgradeButton = computed(() => isExtraProgramMode.value || isSkillMode.value)

// 是否显示第二行（在额外程序或技能熟练模式下显示）
const showSecondRow = computed(() => isExtraProgramMode.value || isSkillMode.value)

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!props.availableOptions || props.availableOptions.length === 0) {
    return defaultOptions
  }
  return defaultOptions.map(defaultOpt => {
    const availableOpt = props.availableOptions.find(opt => opt.value === defaultOpt.value)
    if (availableOpt) {
      return { ...defaultOpt, disabled: availableOpt.disabled || false }
    }
    return defaultOpt
  })
})

// 根据企业ID获取可用的专利芯片列表（过滤掉已选择的）
const availablePatentChipsFiltered = computed(() => {
  // 破解模式：显示所有专利芯片
  if (props.hackMode) {
    const allChips = patentChipsData.chips.filter(chip => {
      if (chip.id === selectedPatentChip.value) return true
      return !props.selectedPatentChipIds.includes(chip.id)
    })
    
    const options = allChips.map(chip => ({
      label: chip.name,
      value: chip.id,
      extra: chip.manufacturer
    }))
    
    if (options.length === 0) {
      return [{ label: '无可用专利芯片', value: null, disabled: true }]
    }
    
    return options
  }
  
  // 正常模式：只显示本企业可用的专利芯片
  if (!props.manufacturerId) {
    return [{ label: '无可用专利芯片', value: null, disabled: true }]
  }

  const manufacturer = manufacturerData.find(m => m.id.toString() === props.manufacturerId.toString())
  if (!manufacturer || !manufacturer.availablePatentChips || manufacturer.availablePatentChips.length === 0) {
    return [{ label: '无可用专利芯片', value: null, disabled: true }]
  }

  const availableIds = manufacturer.availablePatentChips

  const filteredIds = availableIds.filter(id => {
    if (id === selectedPatentChip.value) return true
    return !props.selectedPatentChipIds.includes(id)
  })

  const options = filteredIds.map(chipId => {
    const chip = patentChipsData.chips.find(c => c.id === chipId)
    if (chip) {
      return {
        label: chip.name,
        value: chip.id,
        extra: chip.manufacturer
      }
    }
    return null
  }).filter(Boolean)

  if (options.length === 0) {
    return [{ label: '无可用专利芯片', value: null, disabled: true }]
  }

  return options
})

// 基础技能选项（排除人性ID=16）
const baseSkillOptions = computed(() => {
  return skillsData
    .filter(skill => skill.id !== 16)
    .map(skill => ({
      label: skill.name,
      value: skill.id.toString()
    }))
})

// 显示的技能选项（根据升级状态显示"技能+"）
const displayedSkillOptions = computed(() => {
  return baseSkillOptions.value.map(skill => ({
    ...skill,
    label: isUpgraded.value ? `${skill.label}+` : skill.label
  }))
})

// 获取当前选中的专利芯片信息
const selectedPatentChipInfo = computed(() => {
  if (!showPatentSelector.value || !selectedPatentChip.value) return null
  return patentChipsData.chips.find(c => c.id === selectedPatentChip.value)
})

// 解析芯片效果文本（支持 [AUTO] 和 [MANUAL] 标记）
const parsedChipEffect = computed(() => {
  if (!selectedPatentChipInfo.value) return ''
  return parseEffectText(selectedPatentChipInfo.value.effect)
})

// 切换升级状态
const toggleUpgrade = () => {
  isUpgraded.value = !isUpgraded.value
  updateConfig()
}

// 处理类型变更
const handleTypeChange = (newType) => {
  if (newType !== 'patent') {
    emit('update:patentChipId', null)
  }
  
  if (newType !== 'normal') {
    normalSubtype.value = null
    selectedSkill.value = null
    programName.value = ''
    isUpgraded.value = false
    upgradeEffect.value = ''
  }
  
  if (newType === 'none' || newType === 'coordination') {
    normalSubtype.value = null
    selectedSkill.value = null
    programName.value = ''
    isUpgraded.value = false
    upgradeEffect.value = ''
  }
  
  updateConfig()
}

// 处理子类型变更
const handleSubtypeChange = () => {
  selectedSkill.value = null
  programName.value = ''
  isUpgraded.value = false
  upgradeEffect.value = ''
  updateConfig()
}

// 更新配置对象
const updateConfig = () => {
  const config = {
    normalSubtype: normalSubtype.value,
    skillId: selectedSkill.value,
    skillUpgraded: isSkillMode.value ? isUpgraded.value : false,
    programName: programName.value,
    programUpgraded: isExtraProgramMode.value ? isUpgraded.value : false,
    upgradeEffect: upgradeEffect.value
  }
  emit('update:chipConfig', config)
}

// 监听配置变化
watch([normalSubtype, selectedSkill, isUpgraded, programName, upgradeEffect], () => {
  updateConfig()
}, { deep: true })

// 监听类型变化
watch(() => slotType.value, (newType) => {
  if (newType !== 'patent') {
    emit('update:patentChipId', null)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/input-styles.scss' as *;

$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.chip-slot {
  width: 100%;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 243, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
}

.slot-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  &.first-row {
    margin-bottom: 8px;
  }

  &.second-row {
    // 第二行与第一行使用相同的网格布局
    .upgrade-btn-wrapper {
      width: 60px; // 与槽位标签同宽
      flex-shrink: 0;
      display: flex;
      justify-content: flex-start;
    }
  }
}

// 槽位标签
.slot-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  min-width: 60px;
  font-family: "Courier New", monospace;
}

// 芯片类型选择器
.chip-type-select {
  flex: 0.5;
  min-width: 120px;
}

// 子类型选择器
.sub-type-select {
  flex: 0.5;
  min-width: 200px;
}

// 升级按钮
.upgrade-btn {
  padding: 6px 12px;
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 243, 255, 0.2);
    border-color: rgba(0, 243, 255, 0.5);
  }

  &.active {
    background: rgba(0, 243, 255, 0.3);
    border-color: $cyber-cyan;
    color: $cyber-cyan;
    box-shadow: 0 0 8px rgba(0, 243, 255, 0.3);
  }
}

// 额外程序配置
.program-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.program-input {
  width: 100%;
}

.upgrade-effect-row {
  margin-top: 4px;
}

// 技能配置
.skill-config {
  flex: 1;
}

.skill-select {
  width: 100%;
}

// 专利芯片效果显示（使用全局样式）
.chip-effect {
  margin-top: 6px;
  margin-left: 72px;
}
</style>
