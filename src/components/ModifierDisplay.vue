<!--
  组件：ModifierDisplay
  功能：显示属性/技能的调整值，支持警告模式和来源提示

  用法：
  <ModifierDisplay
    :base-value="当前值"
    :modifier="调整值"
    :max-value="5"
    :modifier-details="[{name: '规则1', value: 1}, {name: '规则2', value: 2}]"
  />
-->
<template>
  <span
    class="modifier-display"
    :class="{ 'warning': showWarning }"
  >
    <template v-if="showWarning">
      ⚠️
    </template>
    <template v-else-if="displayValue !== 0">
      <TipButton level="1" :content="tipContent">
        {{ formattedValue }}
      </TipButton>
    </template>
    <template v-else>
      <span class="empty-slot"></span>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import TipButton from './TipButton.vue'

const props = defineProps({
  // 基础值（左边按钮分配的值）
  baseValue: {
    type: Number,
    default: 0
  },
  // 调整值（计算得出的值）
  modifier: {
    type: Number,
    default: 0
  },
  // 最大值（默认5）
  maxValue: {
    type: Number,
    default: 5
  },
  // 调整值详情（规则名称和值）
  modifierDetails: {
    type: Array,
    default: () => []
  }
})

// 是否显示警告（基础值 + 调整值 > 最大值）
const showWarning = computed(() => {
  return props.baseValue + props.modifier > props.maxValue
})

// 显示的值
const displayValue = computed(() => {
  return props.modifier
})

// 格式化显示（带正负号）
const formattedValue = computed(() => {
  const val = props.modifier
  return val > 0 ? `+${val}` : `${val}`
})

// 生成 tip 内容
const tipContent = computed(() => {
  if (!props.modifierDetails || props.modifierDetails.length === 0) {
    return '调整值来源未知'
  }
  
  // 按规则名称分组，统计每个规则的总值
  const ruleMap = {}
  props.modifierDetails.forEach(detail => {
    if (ruleMap[detail.name]) {
      ruleMap[detail.name] += detail.value
    } else {
      ruleMap[detail.name] = detail.value
    }
  })
  
  // 生成显示文本
  const parts = Object.entries(ruleMap).map(([name, value]) => {
    const sign = value > 0 ? '+' : ''
    return `${name}: ${sign}${value}`
  })
  
  return parts.join('\n')
})
</script>

<style lang="scss" scoped>
.modifier-display {
  min-width: 24px;
  text-align: center;
  font-family: "Courier New", "Consolas", monospace;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.warning {
    color: #ff5252;
    text-shadow: 0 0 8px rgba(255, 82, 82, 0.5);
    font-size: 12px;
  }

  .empty-slot {
    display: inline-block;
    width: 24px;
  }
  
  :deep(.tip-button) {
    color: #00f3ff;
    text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
  }
}
</style>
