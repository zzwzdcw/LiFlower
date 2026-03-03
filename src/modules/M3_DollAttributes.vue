<!--
  模块编号：M3
  模块名称：属性（人形）
  显示模式：doll-prep
  功能：6属性涂格子加点
-->
<template>
  <div class="module-doll-attributes">
    <div class="header">
      <h3 class="module-title">属性</h3>
      <span class="points-display">已用: 0 / 总点数: 0</span>
    </div>
    <div class="placeholder-content">
      <p>6个属性，每行：名称 | TIP(1级) | 涂格子区域 | 数值 | 评估</p>
      <p>涂格子：+1~+4空心方框，+5不显眼方框，点击亮起</p>
      <p>出身加成格子锁定</p>
    </div>
  </div>
</template>

<script setup>
// 模块逻辑待实现
</script>

<style lang="scss" scoped>
.module-doll-attributes {
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
