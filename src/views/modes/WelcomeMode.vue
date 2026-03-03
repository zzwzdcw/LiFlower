<!-- 
  模块编号：MODE_WELCOME
  功能：欢迎模式
  触发条件：首次打开（无缓存）
  包含模块：{背景(标题+类型选择), 模块0(导入), 模块98(代码导入区)}
-->
<template>
  <div class="welcome-mode">
    <!-- 提示：使用顶部栏选择角色类型 -->
    <div class="welcome-hint">
      <p>请从顶部栏选择角色类型开始创建，或导入已有角色</p>
    </div>

    <!-- 模块0：角色名输入 -->
    <div class="module-section">
      <h2 class="module-title">模块0：导入</h2>
      <div class="module-content">
        <div class="form-item">
          <label>角色名字</label>
          <el-input 
            v-model="characterName" 
            placeholder="请输入角色名称"
            size="large"
          />
        </div>
      </div>
    </div>

    <!-- 模块98：代码导入 -->
    <div class="module-section">
      <h2 class="module-title">模块98：导入角色</h2>
      <div class="module-content">
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
          <el-tooltip content="粘贴角色代码以快速导入" placement="right">
            <el-icon class="tip-icon level-3"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 本地状态
const characterName = ref('')
const importCode = ref('')

// 导入角色
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
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;
$cyber-darker: #050508;

.welcome-mode {
  min-height: calc(100vh - 120px); // 减去顶部栏和导航栏的高度
  background: linear-gradient(135deg, $cyber-darker 0%, $cyber-dark 100%);
  padding: 40px 20px;
}

// 提示区域
.welcome-hint {
  text-align: center;
  padding: 30px;
  margin-bottom: 30px;
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 8px;

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-family: "Microsoft YaHei", sans-serif;
  }
}

// 模块区域
.module-section {
  margin-bottom: 30px;
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid rgba(0, 243, 255, 0.15);
  border-radius: 8px;
  padding: 24px;

  .module-title {
    font-size: 14px;
    color: $cyber-cyan;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 243, 255, 0.2);
    font-family: "Courier New", "Consolas", monospace;
    letter-spacing: 2px;
  }

  .module-content {
    .form-item {
      label {
        display: block;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        font-family: "Microsoft YaHei", sans-serif;
      }
    }
  }
}

// 导入操作区
.import-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

// Tip 图标 - 3级显眼
.tip-icon {
  font-size: 20px;
  color: $cyber-cyan;
  cursor: pointer;
  transition: all 0.3s ease;

  &.level-3 {
    font-size: 24px;
    color: $cyber-cyan;
    filter: drop-shadow(0 0 8px rgba(0, 243, 255, 0.5));
  }

  &:hover {
    transform: scale(1.1);
  }
}

:deep(.el-input__wrapper) {
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.2);
  box-shadow: none;

  .el-input__inner {
    color: #fff;
    font-family: "Courier New", "Consolas", monospace;
  }
}

:deep(.el-textarea__inner) {
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.2);
  color: #fff;
  font-family: "Courier New", "Consolas", monospace;
}
</style>
