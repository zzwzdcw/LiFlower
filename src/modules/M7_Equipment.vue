<!--
  模块编号：M7
  模块名称：芯片（人形）
  显示模式：doll-prep
  功能：芯片槽位管理（支持专利芯片与协调芯片规则）
-->
<template>
  <div class="module-equipment">
    <ModuleHeader title="芯片" subtitle="Chips">
      <template #right>
        <span class="slot-info">
          芯片槽位：<span class="slot-count">{{ usedSlots }}/{{ maxSlots }}</span>
          <span v-if="patentCount > 0" class="patent-info">
            (专利{{ patentCount }}个<span v-if="coordinationCount > 0">，协调{{ coordinationCount }}个</span>)
          </span>
        </span>
      </template>
    </ModuleHeader>

    <!-- 芯片槽位列表 -->
    <div class="chip-slots-list">
      <ChipSlot
        v-for="(slot, index) in chipSlots"
        :key="index"
        v-model="slot.type"
        v-model:patent-chip-id="slot.patentChipId"
        v-model:chip-config="slot.config"
        :index="index"
        :available-options="getAvailableOptions(index)"
        :manufacturer-id="selectedManufacturerId"
        :selected-patent-chip-ids="otherPatentChipIds(index)"
        @update:modelValue="handleSlotChange(index, $event)"
      />
    </div>

    <!-- 规则提示 -->
    <div class="rules-hint">
      <p>规则：每2个专利芯片之间需要1个协调芯片</p>
      <p>1专利=1槽 | 2专利+1协调=3槽 | 3专利+3协调=6槽</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import { useAutoOutput } from '@/composables/useModuleOutput'
import ChipSlot from '@/components/ChipSlot.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import patentChipsData from '@/data/patentChips.json'

const outputsStore = useModuleOutputsStore()

// 最大芯片槽位数（默认6）
const maxSlots = ref(6)

// 芯片槽位数据（包含类型、专利芯片ID和配置）
const chipSlots = ref(
  Array(maxSlots.value).fill(null).map(() => ({
    type: 'none',
    patentChipId: null,
    config: {
      normalSubtype: null,
      skillId: null,
      skillUpgraded: false,
      programName: '',
      programUpgraded: false,
      upgradeEffect: ''
    }
  }))
)

// 读取M2选择的人形企业ID
const selectedManufacturerId = computed(() => {
  const m2Output = outputsStore.getModuleOutput('M2')
  return m2Output?.manufacturerId || null
})

// 统计专利芯片数量
const patentCount = computed(() => {
  return chipSlots.value.filter(slot => slot.type === 'patent').length
})

// 统计协调芯片数量
const coordinationCount = computed(() => {
  return chipSlots.value.filter(slot => slot.type === 'coordination').length
})

// 统计常规芯片数量
const normalCount = computed(() => {
  return chipSlots.value.filter(slot => slot.type === 'normal').length
})

// 计算实际占用的槽位
const usedSlots = computed(() => {
  return chipSlots.value.filter(slot => slot.type !== 'none').length
})

// 检查是否可以添加专利芯片
const canAddPatent = computed(() => {
  const p = patentCount.value
  const c = coordinationCount.value

  if (p === 0) return true
  if (p === 1 && c >= 1) return true
  if (p === 2 && c >= 3) return true
  return false
})

// 获取其他槽位已选择的专利芯片ID（用于去重）
const otherPatentChipIds = (currentIndex) => {
  return chipSlots.value
    .filter((slot, index) => index !== currentIndex && slot.type === 'patent' && slot.patentChipId)
    .map(slot => slot.patentChipId)
}

// 获取某个槽位可用的选项
const getAvailableOptions = (index) => {
  const currentValue = chipSlots.value[index].type

  const options = [
    { label: '未安装', value: 'none', disabled: false },
    { label: '常规芯片', value: 'normal', disabled: false },
    { label: '协调芯片', value: 'coordination', disabled: false }
  ]

  const isPatentAvailable = canAddPatent.value || currentValue === 'patent'
  options.push({
    label: '专利芯片',
    value: 'patent',
    disabled: !isPatentAvailable
  })

  return options
}

// 处理槽位变更
const handleSlotChange = (index, newValue) => {
  const oldValue = chipSlots.value[index].type

  if (newValue === 'patent' && oldValue !== 'patent') {
    if (!canAddPatent.value) {
      return
    }
  }

  chipSlots.value[index].type = newValue

  if (oldValue === 'coordination' && newValue !== 'coordination') {
    validateAndFixPatentChips()
  }
}

// 验证并修复专利芯片配置
const validateAndFixPatentChips = () => {
  const p = patentCount.value
  const c = coordinationCount.value

  let isValid = true
  if (p === 0) {
    isValid = true
  } else if (p === 1) {
    isValid = true
  } else if (p === 2) {
    isValid = c >= 1
  } else if (p >= 3) {
    isValid = c >= 3
  }

  if (!isValid) {
    for (let i = chipSlots.value.length - 1; i >= 0; i--) {
      if (chipSlots.value[i].type === 'patent') {
        chipSlots.value[i].type = 'none'
        chipSlots.value[i].patentChipId = null
        chipSlots.value[i].config = {
          normalSubtype: null,
          skillId: null,
          skillUpgraded: false,
          programName: '',
          programUpgraded: false,
          upgradeEffect: ''
        }
        validateAndFixPatentChips()
        return
      }
    }
  }
}

// 监听芯片变化，自动验证
watch(chipSlots, () => {
  validateAndFixPatentChips()
}, { deep: true })

// 专利芯片ID列表（仅ID编号）
const patentChipIds = computed(() => {
  return chipSlots.value
    .filter(slot => slot.type === 'patent' && slot.patentChipId)
    .map(slot => slot.patentChipId)
})

// 技能熟练芯片获得的技能加成（技能ID + 是否升级）
const skillBonuses = computed(() => {
  return chipSlots.value
    .filter(slot => 
      slot.type === 'normal' && 
      slot.config?.normalSubtype === 'skill' && 
      slot.config?.skillId
    )
    .map(slot => ({
      skillId: slot.config.skillId,
      upgraded: slot.config.skillUpgraded || false
    }))
})

// 额外程序芯片详细数据
const extraPrograms = computed(() => {
  return chipSlots.value
    .filter(slot => 
      slot.type === 'normal' && 
      slot.config?.normalSubtype === 'program' && 
      slot.config?.programName
    )
    .map(slot => ({
      name: slot.config.programName,
      upgraded: slot.config.programUpgraded || false,
      upgradeEffect: slot.config.upgradeEffect || null
    }))
})

// 获取类型名称
const getTypeName = (type) => {
  const names = {
    none: '未安装',
    patent: '专利芯片',
    normal: '常规芯片',
    coordination: '协调芯片'
  }
  return names[type] || '未安装'
}

// 是否应该输出数据（只有安装了专利芯片或常规芯片时才输出）
const shouldOutput = computed(() => {
  return patentCount.value > 0 || normalCount.value > 0
})

// 数据输出（分开输出各个字段）
useAutoOutput({
  patentChips: patentChipIds,
  skillBonuses,
  extraPrograms,
  shouldOutput
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-equipment {
  .slot-info {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-family: "Courier New", monospace;

    .slot-count {
      color: $cyber-cyan;
      font-weight: 600;
    }

    .patent-info {
      color: rgba(255, 255, 255, 0.5);
      margin-left: 8px;
      font-size: 12px;
    }
  }

  .chip-slots-list {
    margin-top: 12px;
  }

  .rules-hint {
    margin-top: 16px;
    padding: 12px;
    background: rgba(0, 243, 255, 0.05);
    border: 1px dashed rgba(0, 243, 255, 0.3);
    border-radius: 4px;

    p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      margin: 4px 0;
      font-family: "Courier New", monospace;
    }
  }
}
</style>
