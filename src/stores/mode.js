import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * ============================================
 * Mode Store - 应用模式状态管理
 * ============================================
 * 
 * 本 Store 管理应用的5个核心模式：
 * - welcome: 欢迎模式（首次进入，选择人类/人形）
 * - human-prep: 人类整备模式（车卡阶段）
 * - human-action: 人类行动模式（跑团阶段）
 * - doll-prep: 人形整备模式（车卡阶段）
 * - doll-action: 人形行动模式（跑团阶段）
 * 
 * 模式切换规则：
 * 1. 首次打开（无缓存）→ 欢迎模式
 * 2. 欢迎模式选择类型后 → 对应整备模式
 * 3. 整备模式点击"整备模式"按钮 → 切换到行动模式
 * 4. 行动模式点击"行动模式"按钮 → 切换回整备模式
 * 5. 模式切换不可逆（欢迎模式选择后不能返回）
 */

export const useModeStore = defineStore('mode', () => {
  // ==================== State ====================
  
  /**
   * 当前模式
   * @type {Ref<'welcome' | 'human-prep' | 'human-action' | 'doll-prep' | 'doll-action'>}
   */
  const currentMode = ref('welcome')
  
  /**
   * 角色类型（人类/人形）
   * @type {Ref<'Anthropos' | 'Anthroform' | null>}
   */
  const characterType = ref(null)
  
  /**
   * 是否已完成首次选择（从欢迎模式离开）
   * @type {Ref<boolean>}
   */
  const hasLeftWelcome = ref(false)

  /**
   * 是否处于调试模式
   * @type {Ref<boolean>}
   */
  const isDebug = ref(false)

  // ==================== Getters ====================
  
  /**
   * 是否是欢迎模式
   */
  const isWelcomeMode = computed(() => currentMode.value === 'welcome')
  
  /**
   * 是否是人类相关模式
   */
  const isHumanMode = computed(() => 
    currentMode.value === 'human-prep' || currentMode.value === 'human-action'
  )
  
  /**
   * 是否是人形相关模式
   */
  const isDollMode = computed(() => 
    currentMode.value === 'doll-prep' || currentMode.value === 'doll-action'
  )
  
  /**
   * 是否是整备模式（车卡阶段）
   */
  const isPrepMode = computed(() => 
    currentMode.value === 'human-prep' || currentMode.value === 'doll-prep'
  )
  
  /**
   * 是否是行动模式（跑团阶段）
   */
  const isActionMode = computed(() => 
    currentMode.value === 'human-action' || currentMode.value === 'doll-action'
  )
  
  /**
   * 当前模式的中文名称（用于显示）
   */
  const currentModeName = computed(() => {
    const modeNames = {
      'welcome': '欢迎模式',
      'human-prep': '人类整备模式',
      'human-action': '人类行动模式',
      'doll-prep': '人形整备模式',
      'doll-action': '人形行动模式'
    }
    return modeNames[currentMode.value] || '未知模式'
  })

  // ==================== Actions ====================
  
  /**
   * 设置当前模式
   * @param {string} mode - 目标模式
   */
  function setMode(mode) {
    const validModes = ['welcome', 'human-prep', 'human-action', 'doll-prep', 'doll-action', 'debug']
    if (validModes.includes(mode)) {
      currentMode.value = mode
      console.log(`[ModeStore] 切换到: ${mode}`)
    } else {
      console.error(`[ModeStore] 无效的模式: ${mode}`)
    }
  }

  /**
   * 设置角色类型
   * @param {string} type - 角色类型：'human' | 'doll' | 'Anthropos' | 'Anthroform'
   */
  function setCharacterType(type) {
    if (type === 'human' || type === 'Anthropos') {
      characterType.value = 'Anthropos'
    } else if (type === 'doll' || type === 'Anthroform') {
      characterType.value = 'Anthroform'
    }
    console.log(`[ModeStore] 设置角色类型: ${characterType.value}`)
  }
  
  /**
   * 从欢迎模式选择人类
   * 触发: 欢迎模式点击"人类"按钮
   */
  function selectHuman() {
    characterType.value = 'Anthropos'
    hasLeftWelcome.value = true
    currentMode.value = 'human-prep'
    console.log('[ModeStore] 选择人类，进入人类整备模式')
  }
  
  /**
   * 从欢迎模式选择人形
   * 触发: 欢迎模式点击"人形"按钮
   */
  function selectDoll() {
    characterType.value = 'Anthroform'
    hasLeftWelcome.value = true
    currentMode.value = 'doll-prep'
    console.log('[ModeStore] 选择人形，进入人形整备模式')
  }
  
  /**
   * 在整备模式和行动模式之间切换
   * 触发: 模块97的"整备/行动"按钮
   */
  function togglePrepAction() {
    if (currentMode.value === 'human-prep') {
      currentMode.value = 'human-action'
    } else if (currentMode.value === 'human-action') {
      currentMode.value = 'human-prep'
    } else if (currentMode.value === 'doll-prep') {
      currentMode.value = 'doll-action'
    } else if (currentMode.value === 'doll-action') {
      currentMode.value = 'doll-prep'
    }
    console.log(`[ModeStore] 切换到: ${currentMode.value}`)
  }
  
  /**
   * 重置到欢迎模式（清除缓存时使用）
   */
  function resetToWelcome() {
    currentMode.value = 'welcome'
    characterType.value = null
    hasLeftWelcome.value = false
    isDebug.value = false
    console.log('[ModeStore] 重置到欢迎模式')
  }

  /**
   * 切换调试模式
   */
  function toggleDebug() {
    if (currentMode.value === 'debug') {
      // 退出调试模式，回到欢迎模式
      currentMode.value = 'welcome'
      isDebug.value = false
      console.log('[ModeStore] 退出调试模式')
    } else {
      // 进入调试模式
      currentMode.value = 'debug'
      isDebug.value = true
      console.log('[ModeStore] 进入调试模式')
    }
  }

  /**
   * 直接切换到指定模式（临时导航栏使用，正式环境不应直接调用）
   * @param {string} mode - 目标模式
   */
  function devSwitchMode(mode) {
    currentMode.value = mode
    if (mode.includes('human')) {
      characterType.value = 'Anthropos'
    } else if (mode.includes('doll')) {
      characterType.value = 'Anthroform'
    }
    console.log(`[ModeStore] [DEV] 切换到: ${mode}`)
  }

  return {
    // State
    currentMode,
    characterType,
    hasLeftWelcome,
    isDebug,

    // Getters
    isWelcomeMode,
    isHumanMode,
    isDollMode,
    isPrepMode,
    isActionMode,
    currentModeName,

    // Actions
    setMode,
    setCharacterType,
    selectHuman,
    selectDoll,
    togglePrepAction,
    toggleDebug,
    resetToWelcome,
    devSwitchMode
  }
})
