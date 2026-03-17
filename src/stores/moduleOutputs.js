import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * ============================================
 * Module Outputs Store - 模块输出数据管理
 * ============================================
 *
 * 存储各模块的关键输出数据，用于：
 * 1. 模块间数据互通
 * 2. 生成角色代码
 * 3. 调试和日志
 *
 * 数据格式规范：
 * {
 *   M0: { characterName: "我是猪" },
 *   M2: { background: 1, backgroundName: "无意义一代" },
 *   M3: { attributes: { str: 3, dex: 2 } },
 *   ...
 * }
 */

export const useModuleOutputsStore = defineStore('moduleOutputs', () => {
  // ==================== State ====================

  /**
   * 模块输出数据存储
   * @type {Ref<Object>}
   */
  const outputs = ref({})

  // ==================== Getters ====================

  /**
   * 获取指定模块的输出数据
   * @param {string} moduleId - 模块ID (M0, M1, M2...)
   * @returns {Object} 该模块的输出数据
   */
  const getModuleOutput = computed(() => {
    return (moduleId) => outputs.value[moduleId] || {}
  })

  /**
   * 获取所有模块的输出数据（扁平化）
   * @returns {Object} 所有模块数据的合并对象
   */
  const allOutputs = computed(() => {
    return outputs.value
  })

  /**
   * 生成角色代码字符串
   * @returns {string} 格式化的角色代码
   */
  const characterCode = computed(() => {
    const lines = []
    const sortedKeys = Object.keys(outputs.value).sort()

    for (const moduleId of sortedKeys) {
      const moduleData = outputs.value[moduleId]
      if (!moduleData || Object.keys(moduleData).length === 0) continue

      // 格式化模块数据
      const entries = Object.entries(moduleData)
        .filter(([key, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
          // 简单值直接显示，对象/数组序列化
          if (typeof value === 'object') {
            return `${key}=${JSON.stringify(value)}`
          }
          return `${key}=${value}`
        })

      if (entries.length > 0) {
        lines.push(`${moduleId}:${entries.join(',')}`)
      }
    }

    return lines.join(';')
  })

  /**
   * 获取人类可读的角色摘要
   */
  const characterSummary = computed(() => {
    const summary = []

    // M0: 角色名
    if (outputs.value.M0?.characterName) {
      summary.push(`角色名: ${outputs.value.M0.characterName}`)
    }

    // M2: 人类出身
    if (outputs.value.M2?.backgroundName) {
      summary.push(`出身: ${outputs.value.M2.backgroundName}`)
    }

    // 可以扩展更多...

    return summary.join(' | ')
  })

  // ==================== Actions ====================

  /**
   * 更新模块输出数据
   * @param {string} moduleId - 模块ID
   * @param {Object} data - 输出数据对象
   */
  function updateModuleOutput(moduleId, data) {
    outputs.value[moduleId] = {
      ...outputs.value[moduleId],
      ...data
    }
    console.log(`[ModuleOutputs] ${moduleId} 更新:`, data)
  }

  /**
   * 设置模块的单个字段
   * @param {string} moduleId - 模块ID
   * @param {string} key - 字段名
   * @param {*} value - 字段值
   */
  function setModuleField(moduleId, key, value) {
    if (!outputs.value[moduleId]) {
      outputs.value[moduleId] = {}
    }
    outputs.value[moduleId][key] = value
  }

  /**
   * 清除指定模块的输出数据
   * @param {string} moduleId - 模块ID
   */
  function clearModuleOutput(moduleId) {
    delete outputs.value[moduleId]
  }

  /**
   * 清除所有输出数据
   */
  function clearAllOutputs() {
    outputs.value = {}
    console.log('[ModuleOutputs] 已清除所有数据')
  }

  /**
   * 从角色代码解析并恢复数据
   * @param {string} code - 角色代码字符串
   */
  function importFromCode(code) {
    try {
      clearAllOutputs()
      const modules = code.split(';')

      for (const moduleStr of modules) {
        const [moduleId, dataStr] = moduleStr.split(':')
        if (!moduleId || !dataStr) continue

        const data = {}
        const entries = dataStr.split(',')

        for (const entry of entries) {
          const [key, value] = entry.split('=')
          if (!key) continue

          // 尝试解析 JSON
          try {
            data[key] = JSON.parse(value)
          } catch {
            // 不是 JSON，作为字符串
            data[key] = value
          }
        }

        outputs.value[moduleId] = data
      }

      console.log('[ModuleOutputs] 导入成功:', outputs.value)
      return true
    } catch (error) {
      console.error('[ModuleOutputs] 导入失败:', error)
      return false
    }
  }

  return {
    // State
    outputs,

    // Getters
    getModuleOutput,
    allOutputs,
    characterCode,
    characterSummary,

    // Actions
    updateModuleOutput,
    setModuleField,
    clearModuleOutput,
    clearAllOutputs,
    importFromCode
  }
})
