<template>
  <div class="counter">
    <h3>{{ title }}</h3>
    <div class="counter-controls">
      <van-button icon="minus" @click="decrement" />
      <span class="counter-value">{{ count }}</span>
      <van-button icon="plus" @click="increment" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '计数器'
  },
  initialCount: {
    type: Number,
    default: 0
  }
})

const count = ref(props.initialCount)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style lang="scss" scoped>
.counter {
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
  margin: 16px;

  h3 {
    font-size: 16px;
    color: #323233;
    margin-bottom: 16px;
    text-align: center;
  }
}

.counter-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.counter-value {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
  min-width: 60px;
  text-align: center;
}
</style>
