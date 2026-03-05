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

  /**
   * 人类出身背景
   */
  const humanBackground = ref('')

  /**
   * 基础属性点数（来自硬件规格）
   */
  const baseAttributePoints = ref(0)

  /**
   * 总属性点数（基础 + 企业加值）
   */
  const totalAttributePoints = ref(0)

  /**
   * 单项属性上限
   */
  const attributeLimit = ref(5)

  /**
   * 当前属性值（人形）
   */
  const attributes = ref({
    structure: 0,
    strength: 0,
    athletics: 0,
    compute: 0,
    information: 0,
    power: 0
  })

  /**
   * 当前技能值（人类）- 支持负值（如人性可为负）
   */
  const skills = ref({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0,
    9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0
  })

  /**
   * 技能特殊范围定义
   */
  const skillRanges = ref({
    16: { min: -4, max: 4 }  // 人性技能范围 -4 ~ +4
  })

  /**
   * 已选择的特质（人类）
   */
  const selectedTraits = ref(['', ''])

  /**
   * 总技能点数
   */
  const totalSkillPoints = ref(30)

  // ==================== Getters ====================

  /**
   * 是否有角色名称
   */
  const hasName = computed(() => characterName.value.trim().length > 0)

  /**
   * 是否已选择硬件规格
   */
  const hasHardwareSpec = computed(() => hardwareSpec.value !== '')

  /**
   * 已分配属性点总数
   */
  const allocatedPoints = computed(() => {
    return Object.values(attributes.value).reduce((sum, val) => sum + val, 0)
  })

  /**
   * 剩余可用属性点
   */
  const remainingPoints = computed(() => totalAttributePoints.value - allocatedPoints.value)
  
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
   * 设置硬件规格
   * @param {string} spec - 硬件规格名称
   * @param {number} points - 基础属性点数
   */
  function setHardwareSpec(spec, points) {
    hardwareSpec.value = spec
    baseAttributePoints.value = points
    totalAttributePoints.value = points
    // 重置属性值
    attributes.value = { structure: 0, strength: 0, athletics: 0, compute: 0, information: 0, power: 0 }
  }

  /**
   * 设置生产企业
   * @param {string} mfr - 生产企业名称
   * @param {number} bonus - 属性点加值
   */
  function setManufacturer(mfr, bonus) {
    manufacturer.value = mfr
    totalAttributePoints.value = baseAttributePoints.value + bonus
  }

  /**
   * 更新属性值
   * @param {Object} newAttributes - 新的属性值对象
   */
  function updateAttributes(newAttributes) {
    attributes.value = { ...newAttributes }
  }

  /**
   * 更新技能值
   * @param {Object} newSkills - 新的技能值对象
   */
  function updateSkills(newSkills) {
    skills.value = { ...newSkills }
  }

  /**
   * 更新特质选择
   * @param {Number} index - 特质索引（0或1）
   * @param {String} traitId - 特质ID
   */
  function setTrait(index, traitId) {
    selectedTraits.value[index] = traitId
  }

  /**
   * 重置角色数据
   */
  function resetCharacter() {
    characterName.value = ''
    characterType.value = ''
    hardwareSpec.value = ''
    manufacturer.value = ''
    humanBackground.value = ''
    baseAttributePoints.value = 0
    totalAttributePoints.value = 0
    attributeLimit.value = 5
    attributes.value = { structure: 0, strength: 0, athletics: 0, compute: 0, information: 0, power: 0 }
    skills.value = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 }
    selectedTraits.value = ['', '']
    totalSkillPoints.value = 30
  }

  return {
    // State
    characterName,
    characterType,
    hardwareSpec,
    manufacturer,
    humanBackground,
    baseAttributePoints,
    totalAttributePoints,
    attributeLimit,
    attributes,
    skills,
    skillRanges,
    totalSkillPoints,
    selectedTraits,

    // Getters
    hasName,
    hasHardwareSpec,
    allocatedPoints,
    remainingPoints,

    // Actions
    setCharacterName,
    setCharacterType,
    setHardwareSpec,
    setManufacturer,
    updateAttributes,
    updateSkills,
    setTrait,
    resetCharacter
  }
})
