<!--
  模块编号：M98
  模块名称：数据管理
  显示模式：除 welcome 外的所有模式
  功能：生成角色代码、读取角色代码、生成文本格式角色卡
-->
<template>
  <div class="module-m98">
    <ModuleHeader title="数据管理" subtitle="Data Manager" />

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
        <el-button type="primary" @click="handleImport">导入角色</el-button>
        <TipButton :level="3" content="粘贴角色代码以快速导入" />
      </div>
    </div>

    <!-- 整备模式功能 -->
    <div v-if="isPrepMode" class="prep-actions">
      <el-button @click="handleExport">生成角色代码</el-button>
      <el-button @click="showImportDialog">读取角色代码</el-button>
      <el-button type="primary" @click="generateTextCard">生成文本格式角色卡</el-button>
    </div>

    <!-- 行动模式功能 -->
    <div v-if="isActionMode" class="action-actions">
      <el-button @click="handleExport">生成角色代码</el-button>
      <el-button type="primary" @click="generateTextCard">生成文本格式角色卡</el-button>
    </div>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="角色代码"
      width="500px"
    >
      <el-input
        v-model="exportCode"
        type="textarea"
        :rows="8"
        readonly
      />
      <template #footer>
        <el-button @click="copyExportCode">复制到剪贴板</el-button>
        <el-button type="primary" @click="exportDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入角色"
      width="500px"
    >
      <el-input
        v-model="importCode"
        type="textarea"
        :rows="8"
        placeholder="请粘贴角色代码"
      />
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useModeStore } from '@/stores/mode'
import { useCharacterStore } from '@/stores/character'
import { exportCharacterCode, importCharacterCode } from '@/utils/cacheManager'
import { ElMessage, ElMessageBox } from 'element-plus'
import TipButton from '@/components/TipButton.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'

const modeStore = useModeStore()
const characterStore = useCharacterStore()
const importCode = ref('')
const exportCode = ref('')
const exportDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 本地数据引用（从 App.vue 获取）
const getM1Data = () => window.liflowerCache?._m1LocalData || null
const getM2Data = () => window.liflowerCache?._m2LocalData || null
const getM6Data = () => window.liflowerCache?._m6LocalData || null
const getM7Data = () => window.liflowerCache?._m7LocalData || null
const getM9Data = () => window.liflowerCache?._m9LocalData || null
const getM16Data = () => window.liflowerCache?._m16LocalData || null
const getM17Data = () => window.liflowerCache?._m17LocalData || null
const getM18Data = () => window.liflowerCache?._m18LocalData || null
const getM19Data = () => window.liflowerCache?._m19LocalData || null
const getM20Data = () => window.liflowerCache?._m20LocalData || null
const isWelcome = computed(() => modeStore.currentMode === 'welcome')
const isPrepMode = computed(() => ['human-prep', 'doll-prep'].includes(modeStore.currentMode))
const isActionMode = computed(() => ['human-action', 'doll-action'].includes(modeStore.currentMode))

// 导出角色代码
const handleExport = () => {
  const code = exportCharacterCode(
    characterStore,
    getM1Data(), getM2Data(), getM6Data(), getM7Data(), getM9Data(),
    null, null, getM16Data(), getM17Data(),
    getM18Data(), getM19Data(), getM20Data()
  )
  
  exportCode.value = code
  exportDialogVisible.value = true
  ElMessage.success('角色代码已生成')
}

// 显示导入对话框
const showImportDialog = () => {
  importCode.value = ''
  importDialogVisible.value = true
}

// 导入角色代码
const handleImport = () => {
  if (!importCode.value.trim()) {
    ElMessage.warning('请先粘贴角色代码')
    return
  }
  
  ElMessageBox.confirm(
    '导入角色将覆盖当前所有数据，是否继续？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const success = importCharacterCode(
      importCode.value,
      characterStore,
      getM1Data(), getM2Data(), getM6Data(), getM7Data(), getM9Data(),
      getM16Data(), getM17Data(), getM18Data(), getM19Data(), getM20Data()
    )

    if (success) {
      ElMessage.success('角色导入成功，页面将刷新')
      // 先触发保存，将数据写入 localStorage
      window.dispatchEvent(new CustomEvent('liflower-save-cache'))
      importDialogVisible.value = false
      // 立即刷新，不要等待
      window.location.reload()
    } else {
      ElMessage.error('角色导入失败，请检查代码格式')
    }
  }).catch(() => {
    // 取消导入
  })
}

// 复制导出代码
const copyExportCode = () => {
  navigator.clipboard.writeText(exportCode.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const generateTextCard = () => {
  ElMessage.info('文本格式角色卡功能开发中...')
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m98 {
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
