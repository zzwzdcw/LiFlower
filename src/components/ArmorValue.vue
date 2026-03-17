<!--
  组件：ArmorValue
  功能：护甲值展示，一行布局，无边框底纹
-->
<template>
  <div class="armor-value">
    <span class="armor-label">{{ label }}</span>
    <span class="armor-total">{{ totalArmor }}</span>
    <span class="armor-equals">=</span>
    <div class="armor-inputs">
      <input
        v-model.number="armor1"
        type="number"
        class="armor-input"
        min="0"
        placeholder="0"
      />
      <span class="armor-plus">+</span>
      <input
        v-model.number="armor2"
        type="number"
        class="armor-input"
        min="0"
        placeholder="0"
      />
      <span class="armor-plus">+</span>
      <input
        v-model.number="armor3"
        type="number"
        class="armor-input"
        min="0"
        placeholder="0"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ armor1: 0, armor2: 0, armor3: 0 })
  },
  label: {
    type: String,
    default: '护甲值'
  }
})

const emit = defineEmits(['update:modelValue'])

const armor1 = computed({
  get: () => props.modelValue.armor1 || 0,
  set: (val) => emit('update:modelValue', { ...props.modelValue, armor1: val })
})

const armor2 = computed({
  get: () => props.modelValue.armor2 || 0,
  set: (val) => emit('update:modelValue', { ...props.modelValue, armor2: val })
})

const armor3 = computed({
  get: () => props.modelValue.armor3 || 0,
  set: (val) => emit('update:modelValue', { ...props.modelValue, armor3: val })
})

const totalArmor = computed(() => {
  return (armor1.value || 0) + (armor2.value || 0) + (armor3.value || 0)
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.armor-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;

  .armor-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-family: "Courier New", "Consolas", monospace;
  }

  .armor-total {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    font-family: "Courier New", "Consolas", monospace;
    min-width: 24px;
    text-align: center;
  }

  .armor-equals {
    color: rgba($cyber-cyan, 0.5);
    font-size: 13px;
  }

  .armor-inputs {
    display: flex;
    align-items: center;
    gap: 6px;

    .armor-input {
      width: 36px;
      height: 28px;
      background: transparent;
      border: 1px solid rgba($cyber-cyan, 0.2);
      border-radius: 3px;
      color: #fff;
      font-size: 13px;
      text-align: center;
      font-family: "Courier New", "Consolas", monospace;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: rgba($cyber-cyan, 0.5);
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
    }

    .armor-plus {
      color: rgba($cyber-cyan, 0.4);
      font-size: 12px;
    }
  }
}
</style>
