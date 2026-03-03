<!--
  模块编号：M0
  模块名称：导入
  显示模式：welcome
  功能：角色名输入、代码导入
-->
<template>
  <div class="module-m0">
    <h3 class="module-title">模块0：导入</h3>
    
    <div class="form-item">
      <label>角色名字</label>
      <el-input
        v-model="characterStore.characterName"
        placeholder="请输入角色名称"
        size="large"
        class="cyber-input"
      />
    </div>

    <div class="form-item">
      <label>导入角色代码</label>
      <el-input
        v-model="importCode"
        type="textarea"
        :rows="4"
        placeholder="请粘贴角色代码"
      />
      <div class="import-actions">
        <el-button type="primary" @click="importCharacter">
          导入角色
        </el-button>
        <TipButton 
          content="粘贴角色代码以快速导入" 
          level="3"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import TipButton from '@/components/TipButton.vue'
import { useCharacterStore } from '@/stores/character'

const characterStore = useCharacterStore()
const importCode = ref('')

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
.module-m0 {
  .module-title {
    color: #00f3ff;
    font-family: "Courier New", monospace;
    margin-bottom: 20px;
  }

  .form-item {
    margin-bottom: 20px;

    label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
      font-size: 13px;
    }
  }

  .import-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  // 赛博朋克风格输入框
  :deep(.cyber-input) {
    .el-input__wrapper {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      box-shadow: none;

      .el-input__inner {
        color: #fff;
        font-family: "Courier New", "Consolas", monospace;
        background: transparent;

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }

      &:focus-within {
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
        border-color: #00f3ff;
      }
    }
  }
}
</style>
