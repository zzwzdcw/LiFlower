<!--
  组件：DotGridAllocator
  功能：涂写格子属性/技能分配器
  
  用法：
  <DotGridAllocator
    v-model="value"
    :max="5"
    label="体术"
    description="近战格斗技能"
  />
-->
<template>
  <div class="dot-grid-row" :class="{ 'no-label': !label, 'borderless': borderless }">
    <span v-if="label" class="grid-label">{{ label }}</span>
    <div class="grid-dots">
      <div
        v-for="n in max"
        :key="n"
        class="grid-dot"
        :class="{ filled: n <= modelValue }"
        @click="handleClick(n)"
      ></div>
    </div>
    <TipButton v-if="description" level="1" :content="description" />
    <span class="grid-value">{{ modelValue }}</span>
  </div>
</template>

<script setup>
import TipButton from './TipButton.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  borderless: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClick = (n) => {
  // 点击当前最高亮的格子 = 清零
  const newVal = props.modelValue === n ? 0 : n
  emit('update:modelValue', newVal)
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-dark: #0a0a0f;

.dot-grid-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  background: rgba(10, 10, 15, 0.8);
  padding: 8px 12px;
  border: 1px solid rgba(0, 243, 255, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 243, 255, 0.3);
    background: rgba(0, 243, 255, 0.05);
  }

  // 无边框模式
  &.borderless {
    background: transparent;
    border: none;
    padding: 0;

    &:hover {
      background: transparent;
    }
  }
}

.grid-label {
  width: 80px;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  font-family: "Courier New", "Consolas", monospace;
}

.grid-dots {
  display: flex;
  gap: 8px;
  flex-grow: 1;
}

.grid-dot {
  width: 20px;
  height: 20px;
  border: 1px solid $cyber-cyan;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &.filled {
    background: $cyber-cyan;
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.6);
  }

  &:hover {
    border-color: #fff;
    box-shadow: 0 0 8px rgba(0, 243, 255, 0.4);
  }
}

.grid-value {
  margin-left: 12px;
  font-size: 14px;
  color: $cyber-cyan;
  font-weight: bold;
  font-family: "Courier New", "Consolas", monospace;
  min-width: 20px;
  text-align: center;
}
</style>
