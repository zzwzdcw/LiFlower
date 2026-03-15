import { compress, decompress } from './codec.js'

/**
 * 缓存管理器 - 负责 M0~M5 数据的本地存储
 * 只存储可输入、可选择的部分，下拉框用 ID 存储
 * 属性/技能使用数组存储以节省空间
 */

import { toValue } from 'vue'
import backgroundData from "@/data/人类起源.json"
import hardwareSpecData from "@/data/硬件规格.json"
import manufacturerData from "@/data/企业技术.json"

const CACHE_KEY = 'liflower-cache-v1'
const CACHE_VERSION = '1.0'

// 属性键顺序（必须固定）
export const ATTRIBUTE_KEYS = ['structure', 'torque', 'athletics', 'compute', 'information', 'power']

// 技能键顺序（必须固定，1-16）
export const SKILL_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

/**
 * 收集 M0~M9 的数据用于保存
 * @param {Object} characterStore - character store 实例
 * @param {Object} m1Data - M1 的本地数据 {description, traits}
 * @param {Object} m2Data - M2 的本地数据 {description, traits}
 * @param {Object} m6Data - M6 的本地数据 {talents, isCyberBrainActive}
 * @param {Object} m7Data - M7 的本地数据 {chipSlots, hackMode}
 * @param {Object} m9Data - M9 的本地数据 {weaponTags}
 * @returns {Object|null} 缓存数据对象（已压缩），如果没有数据则返回 null
 */
export function collectCacheData(characterStore, m1Data, m2Data, m6Data, m7Data, m9Data, m14Data, m15Data, m16Data, m17Data, m18Data, m19Data, m20Data) {
  // 直接构建扁平化的数据结构（符合 codec 的映射）
  const rawData = {
    version: CACHE_VERSION,
    characterName: toValue(characterStore.characterName) || '',
    backgroundId: toValue(characterStore.humanBackground) || '',
    m1Description: toValue(m1Data?.description) || '',
    m1Traits: (toValue(m1Data?.traits) || []).map(t => ({
      id: t.id || '',
      custom: toValue(t.customEffect) || ''
    })),
    hardwareSpecId: getHardwareSpecId(toValue(characterStore.hardwareSpec)),
    manufacturerId: getManufacturerId(toValue(characterStore.manufacturer)),
    m2Description: toValue(m2Data?.description) || '',
    m2Traits: (toValue(m2Data?.traits) || []).map(t => ({
      id: t.id || '',
      custom: toValue(t.customEffect) || ''
    })),
    // M3 - 人形属性（数组）
    m3Attributes: ATTRIBUTE_KEYS.map(key => toValue(characterStore.dollAttributes[key]) || 0),
    // M4 - 人类属性（数组）+ 人性
    m4Attributes: ATTRIBUTE_KEYS.map(key => toValue(characterStore.humanAttributes[key]) || 0),
    m4Humanity: toValue(characterStore.skills[16]) || 0,
    // M5 - 人类技能（数组）
    m5Skills: SKILL_KEYS.map(key => toValue(characterStore.skills[key]) || 0),
    // M6 - 人类专长（数组）+ 电子脑（0/1）
    m6Talents: (toValue(m6Data?.talents) || []).map(t => [
      t.name || '',
      t.skill || '',
      t.limitation || '',
      t.description || ''
    ]),
    m6CyberBrain: toValue(m6Data?.isCyberBrainActive) ? 1 : 0,
    // M7 - 芯片槽位（数组）+ 破解模式（0/1）
    m7ChipSlots: (toValue(m7Data?.chipSlots) || []).map(slot => [
      slot.type || 'none',
      slot.patentChipId || null,
      slot.config || null
    ]),
    m7HackMode: toValue(m7Data?.hackMode) ? 1 : 0,
    // M9 - 尖端武装（完整武器数据）
    m9Weapon: m9Data ? [
      toValue(m9Data.weaponName) || '',
      toValue(m9Data.weaponLevel) || 0,
      toValue(m9Data.weaponDescription) || '',
      Array.isArray(toValue(m9Data.weaponTags)) ? toValue(m9Data.weaponTags) : []
    ] : ['', 0, '', []],
    // M14 - 人类检定工具加值
    m14ToolBonuses: {
      combat: toValue(m14Data?.combatToolBonuses) || [],
      check: toValue(m14Data?.checkToolBonuses) || []
    },
    // M15 - 人形检定工具加值
    m15ToolBonuses: {
      combat: toValue(m15Data?.combatToolBonuses) || [],
      check: toValue(m15Data?.checkToolBonuses) || []
    },
    // M16 - 人类状态
    m16ApNpEp: [
      toValue(m16Data?.apAdjust) || 0,
      toValue(m16Data?.npAdjust) || 0,
      toValue(m16Data?.epAdjust) || 0
    ],
    m16Armor: [
      toValue(m16Data?.armor1) || 0,
      toValue(m16Data?.armor2) || 0,
      toValue(m16Data?.armor3) || 0
    ],
    m16HpAdjust: toValue(m16Data?.hpAdjust) || 0,
    m16Safety: [
      toValue(m16Data?.physicalAdjust) || 0,
      toValue(m16Data?.electronicAdjust) || 0
    ],
    m16Scars: toValue(m16Data?.scars) || [],
    // M17 - 人形状态
    m17ApNpEp: [
      toValue(m17Data?.apAdjust) || 0,
      toValue(m17Data?.npAdjust) || 0,
      toValue(m17Data?.epAdjust) || 0
    ],
    m17Armor: [
      toValue(m17Data?.armor1) || 0,
      toValue(m17Data?.armor2) || 0,
      toValue(m17Data?.armor3) || 0
    ],
    m17HpAdjust: toValue(m17Data?.hpAdjust) || 0,
    m17Safety: [
      toValue(m17Data?.physicalAdjust) || 0,
      toValue(m17Data?.electronicAdjust) || 0
    ],
    m17Scars: toValue(m17Data?.scars) || [],
    // M18 - 人类装备
    m18Equipment: toValue(m18Data?.equipmentList) || [],
    // M19 - 人形装备
    m19Equipment: toValue(m19Data?.equipmentList) || [],
    // M20 - 备忘录
    m20Memo: toValue(m20Data?.memo) || ''
  }

  console.log('[Cache] 收集原始数据:', rawData)
  
  // 检查是否有实际数据
  const hasData =
    rawData.characterName ||
    rawData.backgroundId ||
    rawData.m1Description ||
    (rawData.m1Traits && rawData.m1Traits.some(t => t.id || t.custom)) ||
    rawData.hardwareSpecId ||
    rawData.manufacturerId ||
    rawData.m2Description ||
    (rawData.m2Traits && rawData.m2Traits.some(t => t.id || t.custom)) ||
    rawData.m3Attributes.some(v => v !== 0) ||
    rawData.m4Attributes.some(v => v !== 0) ||
    rawData.m4Humanity !== 0 ||
    rawData.m5Skills.some(v => v !== 0) ||
    (rawData.m6Talents && rawData.m6Talents.some(t => t.some(v => v !== ''))) ||
    rawData.m6CyberBrain !== 0 ||
    (rawData.m7ChipSlots && rawData.m7ChipSlots.some(s => s.some(v => v !== null && v !== 'none'))) ||
    rawData.m7HackMode !== 0 ||
    (rawData.m9Weapon && rawData.m9Weapon.some(v => Array.isArray(v) ? v.some(x => x !== '' && x !== 0) : v !== 0)) ||
    (rawData.m14ToolBonuses.combat && rawData.m14ToolBonuses.combat.some(v => v !== 0)) ||
    (rawData.m14ToolBonuses.check && rawData.m14ToolBonuses.check.some(v => v !== 0)) ||
    (rawData.m15ToolBonuses.combat && rawData.m15ToolBonuses.combat.some(v => v !== 0)) ||
    (rawData.m15ToolBonuses.check && rawData.m15ToolBonuses.check.some(v => v !== 0)) ||
    rawData.m16ApNpEp.some(v => v !== 0) ||
    rawData.m16Armor.some(v => v !== 0) ||
    rawData.m16HpAdjust !== 0 ||
    rawData.m16Safety.some(v => v !== 0) ||
    (rawData.m16Scars && rawData.m16Scars.length > 0) ||
    rawData.m17ApNpEp.some(v => v !== 0) ||
    rawData.m17Armor.some(v => v !== 0) ||
    rawData.m17HpAdjust !== 0 ||
    rawData.m17Safety.some(v => v !== 0) ||
    (rawData.m17Scars && rawData.m17Scars.length > 0) ||
    (rawData.m18Equipment && rawData.m18Equipment.length > 0) ||
    (rawData.m19Equipment && rawData.m19Equipment.length > 0) ||
    (rawData.m20Memo && rawData.m20Memo.length > 0)

  console.log('[Cache] 是否有数据:', hasData)
  if (hasData) {
    console.log('[Cache] 详细检查 - m1Traits:', rawData.m1Traits, 'some:', rawData.m1Traits?.some(t => t.id || t.custom))
    console.log('[Cache] 详细检查 - m6Talents:', rawData.m6Talents, 'some:', rawData.m6Talents?.some(t => t.some(v => v !== '')))
    console.log('[Cache] 详细检查 - m18Equipment:', rawData.m18Equipment, 'length:', rawData.m18Equipment?.length)
  }

  if (!hasData) {
    return null
  }
  
  // 压缩数据
  const compressed = compress(rawData)
  return compressed
}

/**
 * 保存到 localStorage
 * @param {Object} data - 缓存数据
 */
export function saveCache(data) {
  // 如果没有数据，清除缓存
  if (!data) {
    clearCache()
    return
  }
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[Cache] 保存失败:', e)
  }
}

/**
 * 从 localStorage 加载
 * @returns {Object|null} 缓存数据或 null
 */
export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const compressed = JSON.parse(raw)

    // 检查是否只有版本号没有实际数据
    const keys = Object.keys(compressed)
    if (keys.length <= 1 && compressed.V) {
      clearCache()
      return null
    }

    // 解压数据
    const data = decompress(compressed)

    // 版本检查
    if (data.version !== CACHE_VERSION) {
      clearCache()
      return null
    }
    return data
  } catch (e) {
    console.error('[Cache] 加载失败:', e)
    clearCache()
    return null
  }
}

/**
 * 清除缓存
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (e) {
    console.error('[Cache] 清除失败:', e)
  }
}

/**
 * 获取缓存的 M0 数据
 * @returns {Object|null}
 */
export function getM0Cache() {
  const cache = loadCache()
  return cache ? { characterName: cache.characterName || '' } : null
}

/**
 * 获取缓存的 M1 数据
 * @returns {Object|null}
 */
export function getM1Cache() {
  const cache = loadCache()
  if (!cache) return null
  
  return {
    backgroundId: cache.backgroundId || '',
    description: cache.m1Description || '',
    traits: cache.m1Traits || []
  }
}

/**
 * 获取缓存的 M2 数据
 * @returns {Object|null}
 */
export function getM2Cache() {
  const cache = loadCache()
  if (!cache) return null
  
  return {
    hardwareSpecId: cache.hardwareSpecId || '',
    manufacturerId: cache.manufacturerId || '',
    description: cache.m2Description || '',
    traits: cache.m2Traits || []
  }
}

/**
 * 获取缓存的 M3 数据（人形属性）
 * @returns {Object|null}
 */
export function getM3Cache() {
  const cache = loadCache()
  if (!cache) return null
  
  return {
    attributes: cache.m3Attributes || []
  }
}

/**
 * 获取缓存的 M4 数据（人类属性 + 人性）
 * @returns {Object|null}
 */
export function getM4Cache() {
  const cache = loadCache()
  if (!cache) return null
  
  return {
    attributes: cache.m4Attributes || [],
    humanity: cache.m4Humanity || 0
  }
}

/**
 * 获取缓存的 M5 数据（人类技能）
 * @returns {Object|null}
 */
export function getM5Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    skills: cache.m5Skills || []
  }
}

/**
 * 获取缓存的 M6 数据（人类专长 + 电子脑）
 * @returns {Object|null}
 */
export function getM6Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    talents: (cache.m6Talents || []).map(([name, skill, limitation, description]) => ({
      name, skill, limitation, description
    })),
    isCyberBrainActive: cache.m6CyberBrain === 1
  }
}

/**
 * 获取缓存的 M7 数据（芯片槽位 + 破解模式）
 * @returns {Object|null}
 */
export function getM7Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    chipSlots: (cache.m7ChipSlots || []).map(([type, patentChipId, config]) => ({
      type, patentChipId, config
    })),
    hackMode: cache.m7HackMode === 1
  }
}

/**
 * 获取缓存的 M9 数据（尖端武装）
 * @returns {Object|null}
 */
export function getM9Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    weaponName: cache.m9Weapon?.[0] || '',
    weaponLevel: cache.m9Weapon?.[1] || 0,
    weaponDescription: cache.m9Weapon?.[2] || '',
    weaponTags: cache.m9Weapon?.[3] || cache.m9WeaponTags || []
  }
}

/**
 * 获取缓存的 M14 数据（人类检定工具加值）
 * @returns {Object|null}
 */
export function getM14Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    combatToolBonuses: cache.m14ToolBonuses?.combat || [],
    checkToolBonuses: cache.m14ToolBonuses?.check || []
  }
}

/**
 * 获取缓存的 M15 数据（人形检定工具加值）
 * @returns {Object|null}
 */
export function getM15Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    combatToolBonuses: cache.m15ToolBonuses?.combat || [],
    checkToolBonuses: cache.m15ToolBonuses?.check || []
  }
}

/**
 * 获取缓存的 M16 数据（人类状态）
 * @returns {Object|null}
 */
export function getM16Cache() {
  const cache = loadCache()
  console.log('[getM16Cache] loadCache 返回:', cache)
  if (!cache) return null

  const result = {
    apAdjust: cache.m16ApNpEp?.[0] || 0,
    npAdjust: cache.m16ApNpEp?.[1] || 0,
    epAdjust: cache.m16ApNpEp?.[2] || 0,
    armor1: cache.m16Armor?.[0] || 0,
    armor2: cache.m16Armor?.[1] || 0,
    armor3: cache.m16Armor?.[2] || 0,
    hpAdjust: cache.m16HpAdjust || 0,
    physicalAdjust: cache.m16Safety?.[0] || 0,
    electronicAdjust: cache.m16Safety?.[1] || 0,
    scars: cache.m16Scars || []
  }
  console.log('[getM16Cache] 返回结果:', result)
  return result
}

/**
 * 获取缓存的 M17 数据（人形状态）
 * @returns {Object|null}
 */
export function getM17Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    apAdjust: cache.m17ApNpEp?.[0] || 0,
    npAdjust: cache.m17ApNpEp?.[1] || 0,
    epAdjust: cache.m17ApNpEp?.[2] || 0,
    armor1: cache.m17Armor?.[0] || 0,
    armor2: cache.m17Armor?.[1] || 0,
    armor3: cache.m17Armor?.[2] || 0,
    hpAdjust: cache.m17HpAdjust || 0,
    physicalAdjust: cache.m17Safety?.[0] || 0,
    electronicAdjust: cache.m17Safety?.[1] || 0,
    scars: cache.m17Scars || []
  }
}

/**
 * 获取缓存的 M18 数据（人类装备）
 * @returns {Object|null}
 */
export function getM18Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    equipmentList: cache.m18Equipment || []
  }
}

/**
 * 获取缓存的 M19 数据（人形装备）
 * @returns {Object|null}
 */
export function getM19Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    equipmentList: cache.m19Equipment || []
  }
}

/**
 * 获取缓存的 M20 数据（备忘录）
 * @returns {Object|null}
 */
export function getM20Cache() {
  const cache = loadCache()
  if (!cache) return null

  return {
    memo: cache.m20Memo || ''
  }
}

/**
 * 导出角色代码（压缩后的 JSON 字符串）
 * @param {Object} characterStore - character store 实例
 * @param {Object} m1Data - M1 的本地数据
 * @param {Object} m2Data - M2 的本地数据
 * @param {Object} m6Data - M6 的本地数据
 * @param {Object} m7Data - M7 的本地数据
 * @param {Object} m9Data - M9 的本地数据
 * @param {Object} m14Data - M14 的本地数据
 * @param {Object} m15Data - M15 的本地数据
 * @param {Object} m16Data - M16 的本地数据
 * @param {Object} m17Data - M17 的本地数据
 * @param {Object} m18Data - M18 的本地数据
 * @param {Object} m19Data - M19 的本地数据
 * @param {Object} m20Data - M20 的本地数据
 * @returns {string} 角色代码字符串
 */
export function exportCharacterCode(
  characterStore,
  m1Data, m2Data, m6Data, m7Data, m9Data,
  m14Data, m15Data, m16Data, m17Data,
  m18Data, m19Data, m20Data
) {
  const cacheData = collectCacheData(
    characterStore,
    m1Data, m2Data, m6Data, m7Data, m9Data,
    m14Data, m15Data, m16Data, m17Data,
    m18Data, m19Data, m20Data
  )
  
  if (!cacheData) {
    return JSON.stringify({})
  }
  
  return JSON.stringify(cacheData)
}

/**
 * 导入角色代码并恢复到各模块
 * @param {string} code - 角色代码字符串
 * @param {Object} characterStore - character store 实例
 * @param {Object} m1Data - M1 的本地数据（ref）
 * @param {Object} m2Data - M2 的本地数据（ref）
 * @param {Object} m6Data - M6 的本地数据（ref）
 * @param {Object} m7Data - M7 的本地数据（ref）
 * @param {Object} m9Data - M9 的本地数据（ref）
 * @param {Object} m16Data - M16 的本地数据（ref）
 * @param {Object} m17Data - M17 的本地数据（ref）
 * @param {Object} m18Data - M18 的本地数据（ref）
 * @param {Object} m19Data - M19 的本地数据（ref）
 * @param {Object} m20Data - M20 的本地数据（ref）
 * @returns {boolean} 导入是否成功
 */
export function importCharacterCode(
  code,
  characterStore,
  m1Data, m2Data, m6Data, m7Data, m9Data,
  m16Data, m17Data, m18Data, m19Data, m20Data
) {
  try {
    const compressed = JSON.parse(code)
    
    // 验证数据格式（检查 V 或 version 字段）
    if (!compressed || (!compressed.version && !compressed.V)) {
      console.error('[Import] 无效的角色代码格式')
      return false
    }
    
    // 解压数据
    const data = decompress(compressed)

    // 恢复 M0 - 角色名
    if (data.characterName) {
      characterStore.setCharacterName(data.characterName)
    }

    // 恢复 M1 - 人类出身
    if (data.backgroundId) {
      characterStore.humanBackground = data.backgroundId
    }
    if (data.m1Description && m1Data) {
      m1Data.description = data.m1Description
    }
    if (data.m1Traits && m1Data) {
      // 直接修改 ref 的 value
      if (Array.isArray(m1Data.traits)) {
        m1Data.traits.splice(0, m1Data.traits.length, ...data.m1Traits.map(t => ({
          id: t.id || '',
          customEffect: t.custom || ''
        })))
      }
    }

    // 恢复 M2 - 人形基础
    if (data.hardwareSpecId && m2Data) {
      const specName = getHardwareSpecNameById(data.hardwareSpecId)
      if (specName) {
        characterStore.hardwareSpec = specName
      }
    }
    if (data.manufacturerId && m2Data) {
      const mfrName = getManufacturerNameById(data.manufacturerId)
      if (mfrName) {
        characterStore.manufacturer = mfrName
      }
    }
    if (data.m2Description && m2Data) {
      m2Data.description = data.m2Description
    }
    if (data.m2Traits && m2Data) {
      // 直接修改 ref 的 value
      if (Array.isArray(m2Data.traits)) {
        m2Data.traits.splice(0, m2Data.traits.length, ...data.m2Traits.map(t => ({
          id: t.id || '',
          customEffect: t.custom || ''
        })))
      }
    }

    // 恢复 M3 - 人形属性
    if (data.m3Attributes && characterStore) {
      const attrs = {}
      data.m3Attributes.forEach((value, index) => {
        attrs[ATTRIBUTE_KEYS[index]] = value
      })
      characterStore.updateDollAttributes(attrs)
    }

    // 恢复 M4 - 人类属性
    if (data.m4Attributes && characterStore) {
      const attrs = {}
      data.m4Attributes.forEach((value, index) => {
        attrs[ATTRIBUTE_KEYS[index]] = value
      })
      characterStore.updateHumanAttributes(attrs)
    }
    if (data.m4Humanity && characterStore) {
      characterStore.updateSkills({ 16: data.m4Humanity })
    }

    // 恢复 M5 - 人类技能
    if (data.m5Skills && characterStore) {
      const skills = {}
      data.m5Skills.forEach((value, index) => {
        skills[SKILL_KEYS[index]] = value
      })
      characterStore.updateSkills(skills)
    }

    // 恢复 M6 - 专长
    if (data.m6Talents && m6Data) {
      const talents = data.m6Talents.map(([name, skill, limitation, description]) => ({
        name, skill, limitation, description
      }))
      // m6Data.talents 是 ref，需要访问 .value
      if (m6Data.talents && Array.isArray(m6Data.talents.value)) {
        m6Data.talents.value.splice(0, m6Data.talents.value.length, ...talents)
        // 强制触发响应式更新（用于导入功能）
        m6Data.talents.value = [...m6Data.talents.value]
      }
      if (data.m6CyberBrain === 1 && m6Data.isCyberBrainActive) {
        m6Data.isCyberBrainActive.value = true
      }
    }

    // 恢复 M7 - 芯片
    if (data.m7ChipSlots && m7Data) {
      // 解析压缩后的芯片槽位格式
      const slots = data.m7ChipSlots.map(([type, patentChipId, configArr]) => ({
        type,
        patentChipId,
        config: configArr ? {
          normalSubtype: configArr[0],
          skillId: configArr[1],
          skillUpgraded: configArr[2] === 1,
          programName: configArr[3],
          programUpgraded: configArr[4] === 1,
          upgradeEffect: configArr[5]
        } : null
      }))
      // 先清空现有槽位，然后填充导入的数据
      if (Array.isArray(m7Data.chipSlots)) {
        m7Data.chipSlots.splice(0, m7Data.chipSlots.length, ...slots)
        // 填充空槽位到 6 个
        while (m7Data.chipSlots.length < 6) {
          m7Data.chipSlots.push({
            type: 'none',
            patentChipId: null,
            config: {
              normalSubtype: null,
              skillId: null,
              skillUpgraded: false,
              programName: '',
              programUpgraded: false,
              upgradeEffect: ''
            }
          })
        }
      }
      if (data.m7HackMode === 1) {
        m7Data.hackMode = true
      }
    }

    // 恢复 M9 - 武器
    if (data.m9Weapon && m9Data) {
      m9Data.weaponName = data.m9Weapon[0] || ''
      m9Data.weaponLevel = data.m9Weapon[1] || 0
      m9Data.weaponDescription = data.m9Weapon[2] || ''
      if (Array.isArray(m9Data.weaponTags)) {
        m9Data.weaponTags.splice(0, m9Data.weaponTags.length, ...data.m9Weapon[3])
      }
    }

    // 恢复 M16 - 人类状态
    if (data.m16Armor && m16Data) {
      m16Data.armor1 = data.m16Armor[0] || 0
      m16Data.armor2 = data.m16Armor[1] || 0
      m16Data.armor3 = data.m16Armor[2] || 0
    }
    if (data.m16HpAdjust && m16Data) {
      m16Data.hpAdjust = data.m16HpAdjust
    }
    if (data.m16Safety && m16Data) {
      m16Data.physicalAdjust = data.m16Safety[0] || 0
      m16Data.electronicAdjust = data.m16Safety[1] || 0
    }
    if (data.m16Scars && m16Data) {
      if (Array.isArray(m16Data.scars)) {
        m16Data.scars.splice(0, m16Data.scars.length, ...data.m16Scars)
      }
    }

    // 恢复 M17 - 人形状态
    if (data.m17Armor && m17Data) {
      m17Data.armor1 = data.m17Armor[0] || 0
      m17Data.armor2 = data.m17Armor[1] || 0
      m17Data.armor3 = data.m17Armor[2] || 0
    }
    if (data.m17HpAdjust && m17Data) {
      m17Data.hpAdjust = data.m17HpAdjust
    }
    if (data.m17Safety && m17Data) {
      m17Data.physicalAdjust = data.m17Safety[0] || 0
      m17Data.electronicAdjust = data.m17Safety[1] || 0
    }
    if (data.m17Scars && m17Data) {
      if (Array.isArray(m17Data.scars)) {
        m17Data.scars.splice(0, m17Data.scars.length, ...data.m17Scars)
      }
    }

    // 恢复 M18 - 人类装备
    if (data.m18Equipment && m18Data) {
      // m18Data.equipmentList 是 ref，需要访问 .value
      if (m18Data.equipmentList && Array.isArray(m18Data.equipmentList.value)) {
        m18Data.equipmentList.value.splice(0, m18Data.equipmentList.value.length, ...data.m18Equipment)
        // 强制触发响应式更新（用于导入功能）
        m18Data.equipmentList.value = [...m18Data.equipmentList.value]
      }
    }

    // 恢复 M19 - 人形装备
    if (data.m19Equipment && m19Data) {
      // m19Data.equipmentList 是 ref，需要访问 .value
      if (m19Data.equipmentList && Array.isArray(m19Data.equipmentList.value)) {
        m19Data.equipmentList.value.splice(0, m19Data.equipmentList.value.length, ...data.m19Equipment)
        // 强制触发响应式更新（用于导入功能）
        m19Data.equipmentList.value = [...m19Data.equipmentList.value]
      }
    }

    // 恢复 M20 - 备忘录
    if (data.m20Memo && m20Data) {
      m20Data.memo = data.m20Memo
    }

    console.log('[Import] 角色导入成功')
    return true
  } catch (e) {
    console.error('[Import] 导入失败:', e)
    return false
  }
}

// ============ 辅助函数 ============

/**
 * 硬件规格名称转 ID
 */
function getHardwareSpecId(name) {
  if (!name) return ''
  const spec = hardwareSpecData.find(item => item.name === name)
  return spec ? spec.id.toString() : ''
}

/**
 * 生产企业名称转 ID
 */
function getManufacturerId(name) {
  if (!name) return ''
  const mfr = manufacturerData.find(item => item.nameZh === name)
  return mfr ? mfr.id.toString() : ''
}

/**
 * 硬件规格 ID 转名称
 */
export function getHardwareSpecNameById(id) {
  if (!id) return ''
  const spec = hardwareSpecData.find(item => item.id.toString() === id.toString())
  return spec ? spec.name : ''
}

/**
 * 生产企业 ID 转名称
 */
export function getManufacturerNameById(id) {
  if (!id) return ''
  const mfr = manufacturerData.find(item => item.id.toString() === id.toString())
  return mfr ? mfr.nameZh : ''
}

/**
 * 获取硬件规格属性点加值
 */
export function getHardwareSpecBonus(id) {
  if (!id) return 0
  const spec = hardwareSpecData.find(item => item.id.toString() === id.toString())
  return spec ? spec.effect?.attributePointsBonus || 0 : 0
}

/**
 * 获取生产企业属性点加值
 */
export function getManufacturerBonus(id) {
  if (!id) return 0
  const mfr = manufacturerData.find(item => item.id.toString() === id.toString())
  return mfr ? mfr.effect?.attributePointsBonus || 0 : 0
}
