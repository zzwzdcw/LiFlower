<!--
  模块编号：M0
  模块名称：导入
  显示模式：welcome
  功能：角色名输入、代码导入
-->
<template>
  <div class="module-m0">
    <ModuleHeader title="导入" subtitle="Import" />

    <div class="form-item">
      <label>角色名字</label>
      <el-input
        v-model="characterStore.characterName"
        placeholder="请输入角色名称"
        class="cyber-input-short"
      />
    </div>

    <div class="form-item">
      <label>导入角色代码</label>
      <el-input
        v-model="importCode"
        type="textarea"
        :rows="4"
        placeholder="请粘贴角色代码"
        class="cyber-input-long"
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import TipButton from '@/components/TipButton.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import { useCharacterStore } from '@/stores/character'
import { useAutoOutput } from '@/composables/useModuleOutput'

const characterStore = useCharacterStore()
const importCode = ref('')

// 使用计算属性包装 store 中的值，使其成为响应式 ref
const characterName = computed({
  get: () => characterStore.characterName,
  set: (val) => characterStore.setCharacterName(val)
})

// 自动同步到模块输出：M0:characterName=我是猪
useAutoOutput({
  characterName,
  hasImportCode: computed(() => importCode.value !== '')
})

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
@use '@/styles/input-styles.scss' as *;

.module-m0 {
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

  // 使用全局短文本框样式
  :deep(.cyber-input-short) {
    @extend .cyber-input-short;
  }

  // 使用全局长文本框样式
  :deep(.cyber-input-long) {
    @extend .cyber-input-long;
  }
}
</style>
