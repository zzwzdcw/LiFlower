import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Character Store - 角色数据管理
 * 存储角色的基本信息，供多个模块共享
 */
export const useCharacterStore = defineStore('character', () => {
  // ==================== State ====================
  
  /**
   * 角色名称
   */
  const characterName = ref('')
  
  /**
   * 角色类型（human/doll）
   */
  const characterType = ref('')
  
  /**
   * 硬件规格
   */
  const hardwareSpec = ref('')
  
  /**
   * 生产企业
   */
  const manufacturer = ref('')
  
  // ==================== Getters ====================
  
  /**
   * 是否有角色名称
   */
  const hasName = computed(() => characterName.value.trim().length > 0)
  
  // ==================== Actions ====================
  
  /**
   * 设置角色名称
   * @param {string} name - 角色名称
   */
  function setCharacterName(name) {
    characterName.value = name
  }
  
  /**
   * 设置角色类型
   * @param {string} type - 角色类型 human/doll
   */
  function setCharacterType(type) {
    characterType.value = type
  }
  
  /**
   * 重置角色数据
   */
  function resetCharacter() {
    characterName.value = ''
    characterType.value = ''
    hardwareSpec.value = ''
    manufacturer.value = ''
  }
  
  return {
    // State
    characterName,
    characterType,
    hardwareSpec,
    manufacturer,
    
    // Getters
    hasName,
    
    // Actions
    setCharacterName,
    setCharacterType,
    resetCharacter
  }
})
