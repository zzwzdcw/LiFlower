// 从芯片计算技能值（类似 M15 的算法）
const skillValues = computed(() => {
  const values = {}

  // 初始化所有技能为 0
  skillsData.forEach(skill => {
    values[skill.id] = 0
  })

  // 专利芯片技能加值映射（ID: {skillId, value}）
  const patentChipSkillBonuses = {
    1: { skillId: 3, value: 2 },  // 火控芯片 -> 枪械 +2
    2: { skillId: 6, value: 2 },  // 冰墙 -> 编程 +2
    6: { skillId: 7, value: 3 }   // 工程制作核心 -> 工程 +3
  }

  // 先处理专利芯片技能加值
  chipSlots.value.forEach(slot => {
    if (slot.type === 'patent' && slot.patentChipId) {
      const bonus = patentChipSkillBonuses[slot.patentChipId]
      if (bonus) {
        values[bonus.skillId] = bonus.value
      }
    }
  })

  // 再处理常规芯片技能加成（与专利芯片重叠时取最高值）
  chipSlots.value.forEach(slot => {
    if (slot.type === 'normal' &&
        slot.config?.normalSubtype === 'skill' &&
        slot.config?.skillId) {
      const skillId = slot.config.skillId
      const chipValue = slot.config.skillUpgraded ? 3 : 2
      // 取最高值
      values[skillId] = Math.max(values[skillId] || 0, chipValue)
    }
  })

  return values
})
