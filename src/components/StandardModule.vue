<!--
  标准模块容器
  功能：控制模块的显示/隐藏，提供统一的模块外观
  编号：COMPONENT_STANDARD_MODULE
-->
<template>
  <div
    v-show="shouldShow"
    :class="['module-container', `module-${moduleId}`, { 'debug-mode': isDebugMode, 'bare': bare }, $attrs.class]"
    :data-module-id="moduleId"
  >
    <!-- 调试模式下的模块信息标签 -->
    <div v-if="isDebugMode" class="debug-badge">
      <span class="debug-id">{{ moduleId }}</span>
      <span class="debug-name">{{ moduleName }}</span>
      <span class="debug-modes">{{ showInModes.join(', ') }}</span>
    </div>
    
    <!-- 模块内容插槽（使用 wrapper ref） -->
    <div class="module-content">
      <slot></slot>
    </div>

    <!-- 调试模式：显示模块输出数据 -->
    <div v-if="isDebugMode && Object.keys(moduleData).length > 0" class="debug-outputs">
      <div class="debug-outputs-title">📤 输出数据</div>
      <div class="debug-outputs-content">
        <span
          v-for="(value, key) in moduleData"
          :key="key"
          class="output-item"
        >
          {{ key }}={{ formatValue(value) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, provide } from 'vue'
import { useModeStore } from '@/stores/mode'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'

const props = defineProps({
  // 模块编号（M0, M1, M2...）
  moduleId: {
    type: String,
    required: true
  },
  // 模块名称（调试模式显示用）
  moduleName: {
    type: String,
    default: ''
  },
  // 在哪些模式下显示
  showInModes: {
    type: Array,
    default: () => []
  },
  // 额外显示条件函数（返回 true 才显示）
  showWhen: {
    type: Function,
    default: null
  },
  // 是否强制显示（覆盖模式判断，用于调试）
  forceShow: {
    type: Boolean,
    default: false
  },
  // 是否裸样式（无边框、无底色、无标题，用于特殊按钮如 M97）
  bare: {
    type: Boolean,
    default: false
  }
})

const modeStore = useModeStore()
const outputsStore = useModuleOutputsStore()

// 是否调试模式（currentMode 为 'debug' 时）
const isDebugMode = computed(() => modeStore.currentMode === 'debug')

// ==================== 模块数据收集 ====================

/**
 * 当前模块的输出数据（由子组件提供）
 */
const moduleData = ref({})

/**
 * 注册模块数据的方法（通过 provide 提供给子组件）
 * @param {Object} data - 子组件提供的数据
 */
function registerModuleData(data) {
  moduleData.value = { ...moduleData.value, ...data }
}

/**
 * 更新模块数据的单个字段
 * @param {string} key - 字段名
 * @param {*} value - 字段值
 */
function setModuleField(key, value) {
  moduleData.value[key] = value
}

// 将注册方法提供给子组件
provide('moduleContext', {
  moduleId: props.moduleId,
  registerModuleData,
  setModuleField
})

// 监听数据变化，同步到全局 store
watch(
  moduleData,
  (newData) => {
    if (Object.keys(newData).length > 0) {
      outputsStore.updateModuleOutput(props.moduleId, newData)
    }
  },
  { deep: true, immediate: false }
)

// 子组件 ref（用于获取子组件的 shouldShow）
const slotRef = ref(null)

// 格式化输出值（用于调试显示）
function formatValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

// 子组件的显示状态（如果子组件提供了 shouldShow）
const childShouldShow = computed(() => {
  // 如果子组件有 shouldShow 属性，使用它
  if (slotRef.value?.shouldShow !== undefined) {
    return slotRef.value.shouldShow
  }
  // 否则默认显示
  return true
})

// 判断是否显示模块
const shouldShow = computed(() => {
  // 强制显示
  if (props.forceShow) return true

  // 调试模式：显示所有模块
  if (modeStore.currentMode === 'debug') return true

  // 检查外部传入的条件（如果有）
  if (props.showWhen && !props.showWhen()) return false

  // 检查子组件的内部条件
  if (!childShouldShow.value) return false

  // 空数组 = 所有模式都显示
  if (props.showInModes.length === 0) return true

  // 检查当前模式是否在允许列表中
  return props.showInModes.includes(modeStore.currentMode)
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;

.module-container {
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 243, 255, 0.4);
    box-shadow: 0 4px 20px rgba(0, 243, 255, 0.1);
  }

  // 调试模式样式
  &.debug-mode {
    border: 2px dashed $cyber-purple;
    background: rgba(188, 19, 254, 0.05);
    
    &:hover {
      border-color: $cyber-purple;
      box-shadow: 0 4px 20px rgba(188, 19, 254, 0.2);
    }
  }
}

// 调试信息标签
.debug-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin: -20px -20px 16px -20px;
  background: linear-gradient(135deg, rgba(188, 19, 254, 0.2), rgba(0, 243, 255, 0.1));
  border-bottom: 1px solid rgba(188, 19, 254, 0.3);
  border-radius: 8px 8px 0 0;
  font-family: "Courier New", monospace;
  font-size: 12px;

  .debug-id {
    background: $cyber-purple;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
  }

  .debug-name {
    color: #fff;
    font-weight: 600;
  }

  .debug-modes {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    margin-left: auto;
  }
}

.module-content {
  width: 100%;
}

// 裸样式：无边框、无底色，像悬空按钮
.module-container.bare {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;

  &:hover {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  // 调试模式下保留调试标签
  &.debug-mode {
    background: rgba(188, 19, 254, 0.05);
    border: 2px dashed $cyber-purple;
  }
}

// 调试输出数据显示
.debug-outputs {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 243, 255, 0.05);
  border: 1px dashed rgba(0, 243, 255, 0.3);
  border-radius: 4px;

  .debug-outputs-title {
    font-size: 11px;
    color: $cyber-cyan;
    margin-bottom: 8px;
    font-family: "Courier New", monospace;
  }

  .debug-outputs-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .output-item {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    font-family: "Courier New", monospace;
    background: rgba(0, 243, 255, 0.1);
    padding: 2px 8px;
    border-radius: 3px;
  }
}
</style>
