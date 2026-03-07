<!--
  模块编号：M99
  模块名称：清除缓存
  显示模式：所有模式
  功能：清除浏览器缓存，加上提示
-->
<template>
  <div class="module-m99">
    <ModuleHeader title="系统设置" subtitle="Settings" />
    <div class="warning-section">
      <p class="warning-text">⚠️ 警告：此操作将删除所有本地保存的角色数据，不可恢复！</p>
      <el-button type="danger" plain @click="confirmClear">清除浏览器缓存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import ModuleHeader from '@/components/ModuleHeader.vue'

const confirmClear = () => {
  ElMessageBox.confirm(
    '确定要清除所有本地数据吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    localStorage.clear()
    ElMessage.success('缓存已清除，页面将刷新')
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }).catch(() => {
    ElMessage.info('已取消')
  })
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m99 {
  .warning-section {
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid rgba(255, 82, 82, 0.3);
    border-radius: 8px;
    padding: 16px;
  }
  
  .warning-text {
    color: rgba(255, 82, 82, 0.9);
    margin: 0 0 16px 0;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
