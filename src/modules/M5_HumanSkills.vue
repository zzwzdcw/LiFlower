<!--
  模块编号：M5
  模块名称：技能（人类）
  显示模式：human-prep
  功能：16个技能加减按钮，可负值人性
-->
<template>
  <div class="module-human-skills">
    <div class="header">
      <h3 class="module-title">技能</h3>
      <span class="points-display">已用: 0 / 总点数: 0</span>
    </div>
    <div class="placeholder-content">
      <p>16个技能，每行：名称 | TIP(1级) | [-] 数值 [+] | 评估 | 搭配属性</p>
      <p>人性可负值（-4），负值增加等量技能点</p>
      <p>出身技能不计入已用点</p>
    </div>
  </div>
</template>

<script setup>
// 模块逻辑待实现
</script>

<style lang="scss" scoped>
.module-human-skills {
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
