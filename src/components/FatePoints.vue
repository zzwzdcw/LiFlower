<!--
  组件：FatePoints
  功能：命运点数，1行显示，可涂格子，可加上限
-->
<template>
  <div class="fate-points">
    <span class="fate-label">命运点数</span>
    <div class="grid-dots">
      <div
        v-for="n in maxPoints"
        :key="n"
        class="grid-dot"
        :class="{ filled: n <= currentPoints }"
        @click="handleClick(n)"
      ></div>
    </div>
    <button
      class="add-btn"
      :disabled="!canAdd"
      @click="addMax"
      title="增加上限"
    >
      +
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:modelValue'])

// 默认上限3，默认涂满
const defaultMax = 3
const maxPoints = ref(defaultMax)
const currentPoints = ref(props.modelValue)

// 同步外部值
watch(() => props.modelValue, (val) => {
  currentPoints.value = val
}, { immediate: true })

// 是否可以增加上限（当前涂满时可用）
const canAdd = computed(() => {
  return currentPoints.value >= maxPoints.value
})

const handleClick = (n) => {
  // 点击逻辑：切换涂亮状态
  // 如果点击的位置 <= 当前涂亮数，设置为点击位置-1（取消该格子）
  // 如果点击的位置 > 当前涂亮数，设置为点击位置（涂亮到该位置）
  const newPoints = currentPoints.value >= n ? n - 1 : n

  // 如果取消涂格子导致超出上限，减少上限
  if (newPoints < maxPoints.value && maxPoints.value > defaultMax) {
    // 新的上限 = max(默认上限, 新的涂亮数)
    maxPoints.value = Math.max(defaultMax, newPoints)
  }

  currentPoints.value = newPoints
  emit('update:modelValue', newPoints)
}

const addMax = () => {
  if (!canAdd.value) return

  // 增加上限，并自动涂亮新格子
  maxPoints.value += 1
  currentPoints.value = maxPoints.value
  emit('update:modelValue', currentPoints.value)
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$fate-gold: #ffd700;

.fate-points {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.fate-label {
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
  flex-wrap: wrap;
}

.grid-dot {
  width: 20px;
  height: 20px;
  border: 1px solid $fate-gold;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &.filled {
    background: $fate-gold;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }

  &:hover {
    border-color: #fff;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
  }
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($fate-gold, 0.1);
  border: 1px solid rgba($fate-gold, 0.3);
  border-radius: 4px;
  color: $fate-gold;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  line-height: 1;

  &:hover:not(:disabled) {
    background: rgba($fate-gold, 0.2);
    border-color: rgba($fate-gold, 0.5);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
}
</style>
