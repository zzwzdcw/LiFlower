<!--
  组件：AdjustableValue
  功能：可调数字展示，竖排上下按钮，无边框底纹
-->
<template>
  <div class="adjustable-value">
    <span class="value-label">{{ label }}</span>
    <div class="value-control">
      <span class="value-number" :class="{ increased: currentValue > initialValue, decreased: currentValue < initialValue }">
        {{ currentValue }}
      </span>
      <div class="arrow-buttons">
        <button
          class="arrow-btn up"
          :class="{ active: currentValue > initialValue }"
          @click="increase"
        >▲</button>
        <button
          class="arrow-btn down"
          :class="{ active: currentValue < initialValue }"
          @click="decrease"
        >▼</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  modelValue: {
    type: Number,
    default: 0
  },
  initialValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const currentValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const decrease = () => {
  currentValue.value--
}

const increase = () => {
  currentValue.value++
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-red: #ff2a6d;
$cyber-green: #05ffa1;

.adjustable-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;

  .value-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-family: "Courier New", "Consolas", monospace;
  }

  .value-control {
    display: flex;
    align-items: center;
    gap: 8px;

    .value-number {
      min-width: 24px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      font-family: "Courier New", "Consolas", monospace;

      &.increased {
        color: $cyber-green;
      }

      &.decreased {
        color: $cyber-red;
      }
    }

    .arrow-buttons {
      display: flex;
      flex-direction: column;
      width: 20px;
      height: 36px;

      .arrow-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba($cyber-cyan, 0.1);
        border: none;
        color: rgba($cyber-cyan, 0.5);
        font-size: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        line-height: 1;

        &:hover {
          background: rgba($cyber-cyan, 0.2);
          color: $cyber-cyan;
        }

        &:active {
          background: rgba($cyber-cyan, 0.3);
        }

        &.up {
          border-radius: 3px 3px 0 0;
          border-bottom: 1px solid rgba($cyber-cyan, 0.1);

          &.active {
            background: rgba($cyber-green, 0.2);
            color: $cyber-green;
          }
        }

        &.down {
          border-radius: 0 0 3px 3px;

          &.active {
            background: rgba($cyber-red, 0.2);
            color: $cyber-red;
          }
        }
      }
    }
  }
}
</style>
