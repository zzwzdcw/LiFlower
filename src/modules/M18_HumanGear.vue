<!--
  模块编号：M18
  模块名称：装备（人类）
  显示模式：human-prep, human-action
-->
<template>
  <div class="module-m18">
    <ModuleHeader title="装备" subtitle="Equipment" />
    <div class="placeholder">
      <p>装备槽位（默认2个，可添加至8个）</p>
      <ul>
        <li>装备名称（文本框）</li>
        <li>加值（数字按钮）</li>
        <li>用途（文本框）</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import ModuleHeader from '@/components/ModuleHeader.vue'
</script>

<style scoped>
.module-m18 {
  padding: 16px;
}
.placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}
.placeholder ul {
  margin: 8px 0;
  padding-left: 20px;
}
.placeholder li {
  margin: 4px 0;
}
</style>
