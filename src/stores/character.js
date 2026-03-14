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
   * 当前属性值（人形）- M3 使用
   */
  const dollAttributes = ref({
    structure: 0,
    torque: 0,
    athletics: 0,
    compute: 0,
    information: 0,
    power: 0
  })

  /**
   * 当前属性值（人类）- M4 使用
   */
  const humanAttributes = ref({
    structure: 0,
    torque: 0,
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
   * 总技能点数
   */
  const totalSkillPoints = ref(15)

  /**
   * 选择的特质（2个槽位）
   */
  const selectedTraits = ref(['', ''])

  // ==================== Getters ====================

  /**
   * 是否有角色名称
   */
  const hasName = computed(() => characterName.value.trim().length > 0)

  /**
   * 是否有硬件规格
   */
  const hasHardwareSpec = computed(() => hardwareSpec.value.length > 0)

  /**
   * 人形已分配属性点
   */
  const dollAllocatedPoints = computed(() => {
    return Object.values(dollAttributes.value).reduce((sum, val) => sum + val, 0)
  })

  /**
   * 人类已分配属性点
   */
  const humanAllocatedPoints = computed(() => {
    return Object.values(humanAttributes.value).reduce((sum, val) => sum + val, 0)
  })

  /**
   * 人形剩余属性点
   */
  const dollRemainingPoints = computed(() => {
    return totalAttributePoints.value - dollAllocatedPoints.value
  })

  /**
   * 人类剩余属性点
   */
  const humanRemainingPoints = computed(() => {
    return totalAttributePoints.value - humanAllocatedPoints.value
  })

  /**
   * 技能范围（用于 AttributeAllocator）
   */
  const skillRanges = computed(() => {
    const ranges = {}
    for (let i = 1; i <= 16; i++) {
      ranges[i] = { min: -4, max: 5 }
    }
    return ranges
  })

  // ==================== Actions ====================

  /**
   * 设置角色名称
   * @param {String} name - 角色名称
   */
  function setCharacterName(name) {
    characterName.value = name
  }

  /**
   * 设置角色类型
   * @param {String} type - 角色类型（human/doll）
   */
  function setCharacterType(type) {
    characterType.value = type
  }

  /**
   * 设置硬件规格
   * @param {String} spec - 硬件规格名称
   * @param {Number} points - 基础属性点数
   */
  function setHardwareSpec(spec, points = 0) {
    hardwareSpec.value = spec
    baseAttributePoints.value = points
  }

  /**
   * 设置生产企业
   * @param {String} mfr - 生产企业名称
   * @param {Number} bonus - 属性点加值
   */
  function setManufacturer(mfr, bonus = 0) {
    manufacturer.value = mfr
    totalAttributePoints.value = baseAttributePoints.value + bonus
  }

  /**
   * 更新人形属性
   * @param {Object} attrs - 属性对象
   */
  function updateDollAttributes(attrs) {
    dollAttributes.value = { ...dollAttributes.value, ...attrs }
  }

  /**
   * 更新人类属性
   * @param {Object} attrs - 属性对象
   */
  function updateHumanAttributes(attrs) {
    humanAttributes.value = { ...humanAttributes.value, ...attrs }
  }

  /**
   * 更新技能值
   * @param {Object} newSkills - 技能对象
   */
  function updateSkills(newSkills) {
    skills.value = { ...skills.value, ...newSkills }
  }

  /**
   * 更新属性（兼容旧代码）
   * @param {Object} attrs - 属性对象
   */
  function updateAttributes(attrs) {
    dollAttributes.value = { ...dollAttributes.value, ...attrs }
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
    dollAttributes.value = { structure: 0, torque: 0, athletics: 0, compute: 0, information: 0, power: 0 }
    humanAttributes.value = { structure: 0, torque: 0, athletics: 0, compute: 0, information: 0, power: 0 }
    skills.value = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 }
    selectedTraits.value = ['', '']
    totalSkillPoints.value = 15
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
    dollAttributes,
    humanAttributes,
    skills,
    skillRanges,
    totalSkillPoints,
    selectedTraits,

    // Getters
    hasName,
    hasHardwareSpec,
    dollAllocatedPoints,
    humanAllocatedPoints,
    dollRemainingPoints,
    humanRemainingPoints,

    // Actions
    setCharacterName,
    setCharacterType,
    setHardwareSpec,
    setManufacturer,
    updateDollAttributes,
    updateHumanAttributes,
    updateSkills,
    updateAttributes,
    setTrait,
    resetCharacter
  }
})
