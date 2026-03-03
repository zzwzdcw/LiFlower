<!--
  模块编号：M18
  模块名称：备忘录
  显示模式：human-action, doll-action
  功能：玩家获取的资源等跑团记录
-->
<template>
  <div class="module-m18">
    <h3>M18: 备忘录</h3>
    <p>玩家获取的资源等跑团记录</p>
    <div class="memo-content">
      <el-input
        v-model="memo"
        type="textarea"
        :rows="6"
        placeholder="记录你的跑团历程、获得的资源、重要事件..."
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const memo = ref('')
</script>

<style lang="scss" scoped>
.module-m18 {
  h3 {
    color: #00f3ff;
    margin: 0 0 12px 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0 0 16px 0;
  }
  
  .memo-content {
    :deep(.el-textarea__inner) {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      color: #fff;
      font-family: "Courier New", monospace;
    }
  }
}
</style>
