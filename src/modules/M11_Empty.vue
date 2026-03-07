<!--
  模块编号：M11
  模块名称：无（留空）
  显示模式：doll-prep, doll-action
-->
<template>
  <div class="module-m11">
    <ModuleHeader title="预留模块" subtitle="Reserved" />
    <div class="placeholder">
      <p>此模块为预留空位</p>
    </div>
  </div>
</template>

<script setup>
import ModuleHeader from '@/components/ModuleHeader.vue'
</script>

<style scoped>
.module-m11 {
  padding: 16px;
}
.placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  font-style: italic;
}
</style>
