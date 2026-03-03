<!--
  模块编号：M1
  模块名称：人类车卡-基础信息
  显示模式：human-prep
  功能：出身选择、能力信息、角色阐述、特质槽位
-->
<template>
  <div class="module-human-basic">
    <h3 class="module-title">出身</h3>
    <div class="placeholder-content">
      <p>出身下拉列表 + 右侧TIP(3级)</p>
      <p>能力信息展示</p>
      <p>可展开的角色阐述 + 2个特质槽位</p>
    </div>
  </div>
</template>

<script setup>
// 模块逻辑待实现
</script>

<style lang="scss" scoped>
.module-human-basic {
  .module-title {
    color: #00f3ff;
    margin-bottom: 16px;
  }
  
  .placeholder-content {
    color: rgba(255, 255, 255, 0.5);
    line-height: 2;
  }
}
</style>
