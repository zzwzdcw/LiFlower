<!--
  组件：HpDisplay
  功能：显示角色 HP，显眼但简洁
-->
<template>
  <div class="hp-display">
    <span class="hp-label">HP</span>
    <span class="hp-value">
      <span class="current">{{ current }}</span>
      <span class="separator">/</span>
      <span class="max">{{ max }}</span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  current: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 0
  }
})
</script>

<style lang="scss" scoped>
$hp-red: #ff4757;

.hp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
}

.hp-label {
  font-size: 20px;
  font-weight: bold;
  color: $hp-red;
  font-family: "Courier New", "Consolas", monospace;
}

.hp-value {
  font-family: "Courier New", "Consolas", monospace;

  .current {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
  }

  .separator {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 4px;
  }

  .max {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
