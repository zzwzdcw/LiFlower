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
  },
  humanityValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

// 基础值3
const baseValue = 3

// 命运点数总值 = 3 + 人性技能值（下限为3）
const calculatedMax = computed(() => {
  const total = baseValue + props.humanityValue
  return Math.max(3, total)
})

// 手动增加的上限值
const manualBonus = ref(0)

// 总上限 = 计算值 + 手动增加值
const maxPoints = computed(() => {
  return calculatedMax.value + manualBonus.value
})

const currentPoints = ref(props.modelValue)

// 同步外部值
watch(() => props.modelValue, (val) => {
  currentPoints.value = val
}, { immediate: true })

// 监听基础值变化，自动涂满新增的格子
watch(calculatedMax, (newVal, oldVal) => {
  if (newVal > oldVal) {
    // 基础上限增加了，自动涂满新增的格子
    currentPoints.value = maxPoints.value
    emit('update:modelValue', currentPoints.value)
  }
})

// 是否可以增加上限（当前涂满时可用）
const canAdd = computed(() => {
  return currentPoints.value >= maxPoints.value
})

const handleClick = (n) => {
  // 点击逻辑：切换涂亮状态
  const newPoints = currentPoints.value >= n ? n - 1 : n

  // 如果取消涂格子导致低于计算值，减少手动增加值
  if (newPoints < calculatedMax.value) {
    manualBonus.value = 0
  } else if (newPoints < maxPoints.value) {
    manualBonus.value = newPoints - calculatedMax.value
  }

  currentPoints.value = newPoints
  emit('update:modelValue', newPoints)
}

const addMax = () => {
  if (!canAdd.value) return

  // 增加手动增加值
  manualBonus.value += 1
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
