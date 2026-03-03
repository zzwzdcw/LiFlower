<!--
  模块编号：M98
  模块名称：数据管理
  显示模式：除 welcome 外的所有模式
  功能：生成角色代码、读取角色代码、生成文本格式角色卡
-->
<template>
  <div class="module-m98">
    <h3>M98: 数据管理</h3>
    
    <!-- 代码导入区（欢迎模式显示） -->
    <div v-if="isWelcome" class="import-section">
      <h4>导入角色</h4>
      <el-input
        v-model="importCode"
        type="textarea"
        :rows="4"
        placeholder="请粘贴角色代码"
      />
      <div class="import-actions">
        <el-button type="primary" @click="importCharacter">导入角色</el-button>
        <TipButton level="3" content="粘贴角色代码以快速导入" />
      </div>
    </div>
    
    <!-- 整备模式功能 -->
    <div v-if="isPrepMode" class="prep-actions">
      <el-button @click="generateCode">生成角色代码</el-button>
      <el-button @click="showImportInput">读取角色代码</el-button>
      <el-button type="primary" @click="generateTextCard">生成文本格式角色卡</el-button>
    </div>
    
    <!-- 行动模式功能 -->
    <div v-if="isActionMode" class="action-actions">
      <el-button @click="generateCode">生成角色代码</el-button>
      <el-button type="primary" @click="generateTextCard">生成文本格式角色卡</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useModeStore } from '@/stores/mode'
import { ElMessage } from 'element-plus'
import TipButton from '@/components/TipButton.vue'

const modeStore = useModeStore()
const importCode = ref('')

const isWelcome = computed(() => modeStore.currentMode === 'welcome')
const isPrepMode = computed(() => ['human-prep', 'doll-prep'].includes(modeStore.currentMode))
const isActionMode = computed(() => ['human-action', 'doll-action'].includes(modeStore.currentMode))

const generateCode = () => {
  // TODO: 实现代码生成
  ElMessage.success('角色代码已生成（复制到剪贴板）')
}

const showImportInput = () => {
  // TODO: 显示导入输入框
  ElMessage.info('请粘贴角色代码')
}

const generateTextCard = () => {
  // TODO: 实现文本格式角色卡生成
  ElMessage.success('文本格式角色卡已生成')
}

const importCharacter = () => {
  if (!importCode.value.trim()) {
    ElMessage.warning('请先粘贴角色代码')
    return
  }
  // TODO: 实现导入逻辑
  ElMessage.success('角色导入成功')
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m98 {
  h3 {
    color: $cyber-cyan;
    margin: 0 0 16px 0;
  }
  
  h4 {
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;
    font-size: 14px;
  }
  
  .import-section {
    margin-bottom: 20px;
    
    :deep(.el-textarea__inner) {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      color: #fff;
      margin-bottom: 12px;
    }
  }
  
  .import-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .prep-actions,
  .action-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
