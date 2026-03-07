<!--
  模块编号：M17
  模块名称：角色状态（人形）
  显示模式：doll-action
  功能：包括HP等基于上方模块进行计算的模块，也包含玩家跑团中填写的东西
-->
<template>
  <div class="module-m17">
    <ModuleHeader title="角色状态" subtitle="Status" />
    <p>包括HP等基于上方模块进行计算的模块，也包含玩家跑团中填写的东西</p>
    <div class="placeholder">待实现</div>
  </div>
</template>

<script setup>
import ModuleHeader from '@/components/ModuleHeader.vue'
</script>

<style lang="scss" scoped>
.module-m17 {
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  .placeholder {
    padding: 40px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
