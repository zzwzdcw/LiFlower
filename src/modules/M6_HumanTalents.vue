<!--
  模块编号：M6
  模块名称：专长（人类）
  显示模式：human-prep
  功能：2-6个专长槽，大脑电子化按钮
-->
<template>
  <div class="module-human-talents">
    <div class="header">
      <h3 class="module-title">专长</h3>
      <el-button size="small">大脑电子化</el-button>
    </div>
    <div class="placeholder-content">
      <p>默认2个槽，最多6个</p>
      <p>每个槽：专长下拉 | 关联检定下拉 | TIP(1级)</p>
      <p>大脑电子化勾选后锁定第一槽</p>
    </div>
  </div>
</template>

<script setup>
// 模块逻辑待实现
</script>

<style lang="scss" scoped>
.module-human-talents {
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
  
  .placeholder-content {
    color: rgba(255, 255, 255, 0.5);
    line-height: 2;
  }
}
</style>
