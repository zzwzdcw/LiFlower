import { inject, ref, watch } from 'vue'

/**
 * ============================================
 * useModuleOutput - 模块数据输出 Composable
 * ============================================
 *
 * 在模块组件中使用，将数据自动输出到全局 store
 *
 * 使用示例：
 * ```javascript
 * // 在 M0_Import.vue 中
 * import { useModuleOutput } from '@/composables/useModuleOutput'
 *
 * const { setOutput, setField, moduleId } = useModuleOutput()
 *
 * // 方式1：一次性设置多个字段
 * setOutput({
 *   characterName: '我是猪',
 *   playerName: '张三'
 * })
 *
 * // 方式2：逐个设置字段
 * setField('characterName', '我是猪')
 *
 * // 方式3：使用响应式数据自动同步
 * const characterName = ref('')
 * useModuleOutput({ characterName })  // characterName 变化会自动同步
 * ```
 */

/**
 * 使用模块输出功能
 * @param {Object} reactiveData - 可选，响应式数据对象，会自动监听变化
 * @returns {Object} { setOutput, setField, moduleId }
 */
export function useModuleOutput(reactiveData = null) {
  // 从父组件（StandardModule）获取上下文
  const moduleContext = inject('moduleContext', null)

  // 如果没有在 StandardModule 内使用，给出警告
  if (!moduleContext) {
    console.warn('[useModuleOutput] 必须在 StandardModule 内使用')
    return {
      setOutput: () => {},
      setField: () => {},
      moduleId: 'unknown'
    }
  }

  const { moduleId, registerModuleData, setModuleField } = moduleContext

  // 如果有响应式数据，自动监听并同步
  if (reactiveData) {
    // 对每个响应式字段设置监听
    Object.entries(reactiveData).forEach(([key, refValue]) => {
      if (refValue && typeof refValue === 'object' && 'value' in refValue) {
        watch(
          refValue,
          (newVal) => {
            setModuleField(key, newVal)
          },
          { immediate: true }
        )
      }
    })
  }

  /**
   * 设置多个输出字段
   * @param {Object} data - 数据对象
   */
  function setOutput(data) {
    registerModuleData(data)
  }

  /**
   * 设置单个字段
   * @param {string} key - 字段名
   * @param {*} value - 字段值
   */
  function setField(key, value) {
    setModuleField(key, value)
  }

  return {
    setOutput,
    setField,
    moduleId
  }
}

/**
 * 简化的自动同步版本
 * 直接将响应式 ref 同步到模块输出
 *
 * 使用示例：
 * ```javascript
 * const characterName = ref('')
 * const playerName = ref('')
 *
 * // 这两个 ref 的变化会自动同步到模块输出
 * useAutoOutput({
 *   characterName,
 *   playerName
 * })
 * ```
 */
export function useAutoOutput(reactiveMap) {
  return useModuleOutput(reactiveMap)
}
