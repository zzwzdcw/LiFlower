<!--
  模块标题组件
  功能：统一模块标题样式，支持中文标题+英文副标题，右侧可放置功能块
-->
<template>
  <div class="module-header">
    <div class="header-left">
      <h3 class="module-title">{{ title }}</h3>
      <span v-if="subtitle" class="module-subtitle">{{ subtitle }}</span>
    </div>
    <div v-if="$slots.right" class="header-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.module-title {
  color: $cyber-cyan;
  font-family: "Courier New", monospace;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
}

.module-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-family: "Arial", "Helvetica", sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* 分隔线 */
.module-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 243, 255, 0.3), rgba(0, 243, 255, 0.1), transparent);
}

.module-header {
  position: relative;
  padding-bottom: 12px;
  margin-bottom: 16px;
}
</style>
