<!--
  模块编号：M4
  模块名称：属性（人类）
  显示模式：human-prep（仅在特殊出身时出现）
  功能：6属性涂格子加点
-->
<template>
  <div class="module-human-attributes">
    <div class="header">
      <h3 class="module-title">属性（特殊）</h3>
      <span class="points-display">已用: 0 / 总点数: 0</span>
    </div>
    <div class="placeholder-content">
      <p>仅在特殊出身时出现</p>
      <p>6个属性，涂格子加点</p>
      <p>+1~+5都是不显眼方框</p>
    </div>
  </div>
</template>

<script setup>
// 模块逻辑待实现
</script>

<style lang="scss" scoped>
.module-human-attributes {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .module-title {
    color: #00f3ff;
    margin: 0;
  }
  
  .points-display {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }
  
  .placeholder-content {
    color: rgba(255, 255, 255, 0.5);
    line-height: 2;
  }
}
</style>
