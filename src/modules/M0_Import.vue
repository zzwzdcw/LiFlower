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
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TipButton from '@/components/TipButton.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import { useCharacterStore } from '@/stores/character'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { getM0Cache, importCharacterCode } from '@/utils/cacheManager'

const characterStore = useCharacterStore()
const importCode = ref('')

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

// 从缓存恢复
onMounted(() => {
  const cache = getM0Cache()
  if (cache?.characterName) {
    characterStore.setCharacterName(cache.characterName)
  }
})

// 监听变化，触发保存
watch(() => characterStore.characterName, () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
})

// 导入角色代码
const importCharacter = () => {
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
      // 立即刷新，不要等待
      window.location.reload()
    } else {
      ElMessage.error('角色导入失败，请检查代码格式')
    }
  }).catch(() => {
    // 取消导入
  })
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
