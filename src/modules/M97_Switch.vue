<!--
  模块编号：M97
  模块名称：转换按钮
  显示模式：human-prep, human-action, doll-prep, doll-action
  功能：整备模式/行动模式切换
-->
<template>
  <div class="module-m97">
    <div class="switch-buttons">
      <el-button 
        v-if="isPrepMode" 
        type="primary" 
        size="large" 
        @click="switchToAction"
      >
        进入行动模式
      </el-button>
      <el-button 
        v-else 
        type="warning" 
        size="large" 
        @click="switchToPrep"
      >
        返回整备模式
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useModeStore } from '@/stores/mode'

const modeStore = useModeStore()

const isPrepMode = computed(() => {
  return modeStore.currentMode === 'human-prep' || modeStore.currentMode === 'doll-prep'
})

const switchToAction = () => {
  if (modeStore.characterType === 'human') {
    modeStore.setMode('human-action')
  } else {
    modeStore.setMode('doll-action')
  }
}

const switchToPrep = () => {
  if (modeStore.characterType === 'human') {
    modeStore.setMode('human-prep')
  } else {
    modeStore.setMode('doll-prep')
  }
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-m97 {
  .switch-buttons {
    display: flex;
    justify-content: center;
    
    :deep(.el-button) {
      background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(188, 19, 254, 0.2));
      border-color: $cyber-cyan;
      color: #fff;
      
      &:hover {
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(188, 19, 254, 0.3));
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
      }
    }
  }
}
</style>
