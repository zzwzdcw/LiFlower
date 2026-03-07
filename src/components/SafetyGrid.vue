<!--
  组件：SafetyGrid
  功能：安全值格子
  第一行：名称 + 计算值 + 手动调整输入框 + 锁定按钮
  第二行：格子（格子总数=计算值+手动调整，默認全部涂亮）
-->
<template>
  <div class="safety-grid">
    <!-- 第一行：名称 + 计算值 + 手动调整 + 锁定按钮 -->
    <div class="safety-row first-row">
      <span class="safety-name">{{ label }}</span>
      <div class="safety-values">
        <span class="calculated-value">{{ calculatedValue }}</span>
        <span class="plus">+</span>
        <input
          v-model.number="manualAdjust"
          type="number"
          class="manual-input"
          :class="{ locked: isLocked }"
          placeholder="0"
          :disabled="isLocked"
          @change="onManualChange"
        />
        <button
          class="lock-btn"
          :class="{ locked: isLocked }"
          @click="toggleLock"
          :title="isLocked ? '点击解锁' : '点击锁定'"
        >
          {{ isLocked ? '🔒' : '🔓' }}
        </button>
      </div>
    </div>

    <!-- 第二行：格子 -->
    <div class="safety-row second-row">
      <div class="grid-dots">
        <div
          v-for="n in totalDots"
          :key="n"
          class="grid-dot"
          :class="{ filled: n <= filledDots }"
          @click="handleClick(n)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  // 涂亮的格子数
  modelValue: {
    type: Number,
    default: 0
  },
  calculatedValue: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: '安全值'
  }
})

const emit = defineEmits(['update:modelValue', 'update:manualAdjust'])

// 手动调整值
const manualAdjust = ref(0)

// 锁定状态（默认锁定）
const isLocked = ref(true)

// 格子总数 = 计算值 + 手动调整
const totalDots = computed(() => {
  return Math.max(0, props.calculatedValue + manualAdjust.value)
})

// 涂亮的格子数（不能超过总数）
const filledDots = computed(() => {
  return Math.min(props.modelValue, totalDots.value)
})

// 监听总数变化，自动填满格子
watch(totalDots, (newTotal, oldTotal) => {
  if (newTotal > oldTotal) {
    // 总数增加时，自动填满所有格子
    emit('update:modelValue', newTotal)
  } else if (props.modelValue > newTotal) {
    // 总数减少时，如果涂亮数超过总数，调整到总数
    emit('update:modelValue', newTotal)
  }
}, { immediate: true })

const handleClick = (n) => {
  // 点击逻辑：切换涂亮状态
  // 如果点击的位置 <= 当前涂亮数，设置为点击位置-1（取消该格子）
  // 如果点击的位置 > 当前涂亮数，设置为点击位置（涂亮到该位置）
  const newFilled = filledDots.value >= n ? n - 1 : n
  emit('update:modelValue', newFilled)
}

const onManualChange = () => {
  emit('update:manualAdjust', manualAdjust.value)
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.safety-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.safety-row {
  display: flex;
  align-items: center;

  &.first-row {
    justify-content: space-between;
  }

  &.second-row {
    align-items: center;
  }
}

.safety-name {
  width: 80px;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  font-family: "Courier New", "Consolas", monospace;
}

.safety-values {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Courier New", "Consolas", monospace;

  .calculated-value {
    color: $cyber-cyan;
    font-size: 16px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }

  .plus {
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
  }

  .manual-input {
    width: 36px;
    padding: 4px 6px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba($cyber-cyan, 0.2);
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    text-align: center;
    transition: all 0.3s ease;

    // 隐藏原生上下调整按钮
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;

    &:focus {
      outline: none;
      border-color: rgba($cyber-cyan, 0.5);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    &:disabled {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba($cyber-cyan, 0.1);
      color: rgba(255, 255, 255, 0.4);
      cursor: not-allowed;
    }

    &.locked {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .lock-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($cyber-cyan, 0.1);
    border: 1px solid rgba($cyber-cyan, 0.3);
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;

    &:hover {
      background: rgba($cyber-cyan, 0.2);
      border-color: rgba($cyber-cyan, 0.5);
    }

    &.locked {
      background: rgba(255, 193, 7, 0.1);
      border-color: rgba(255, 193, 7, 0.3);

      &:hover {
        background: rgba(255, 193, 7, 0.2);
        border-color: rgba(255, 193, 7, 0.5);
      }
    }
  }
}

// 格子样式 - 与 DotGridAllocator 一致
.grid-dots {
  display: flex;
  gap: 8px;
  flex-grow: 1;
  flex-wrap: wrap;
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
</style>
