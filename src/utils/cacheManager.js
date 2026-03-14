/**
 * 缓存管理器 - 负责 M0~M2 数据的本地存储
 * 只存储可输入、可选择的部分，下拉框用ID存储
 */

import backgroundData from "@/data/人类起源.json"
import hardwareSpecData from "@/data/硬件规格.json"
import manufacturerData from "@/data/企业技术.json"

const CACHE_KEY = 'liflower-cache-v1'
const CACHE_VERSION = '1.0'

/**
 * 收集 M0~M2 的数据用于保存
 * @param {Object} characterStore - character store 实例
 * @param {Object} m1Data - M1 的本地数据 {description, traits}
 * @param {Object} m2Data - M2 的本地数据 {description, traits}
 * @returns {Object} 缓存数据对象
 */
export function collectCacheData(characterStore, m1Data, m2Data) {
  return {
    version: CACHE_VERSION,
    timestamp: Date.now(),
    m0: {
      characterName: characterStore.characterName || ''
    },
    m1: {
      backgroundId: characterStore.humanBackground || '',
      description: m1Data?.description || '',
      traits: (m1Data?.traits || []).map(t => ({
        id: t.id || '',
        custom: t.customEffect || ''
      }))
    },
    m2: {
      hardwareSpecId: getHardwareSpecId(characterStore.hardwareSpec),
      manufacturerId: getManufacturerId(characterStore.manufacturer),
      description: m2Data?.description || '',
      traits: (m2Data?.traits || []).map(t => ({
        id: t.id || '',
        custom: t.customEffect || ''
      }))
    }
  }
}

/**
 * 保存到 localStorage
 * @param {Object} data - 缓存数据
 */
export function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    console.log('[Cache] 数据已保存')
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

    const data = JSON.parse(raw)
    if (data.version !== CACHE_VERSION) {
      console.warn('[Cache] 版本不匹配，忽略旧数据')
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
    console.log('[Cache] 已清除')
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
  return cache?.m0 || null
}

/**
 * 获取缓存的 M1 数据
 * @returns {Object|null}
 */
export function getM1Cache() {
  const cache = loadCache()
  return cache?.m1 || null
}

/**
 * 获取缓存的 M2 数据
 * @returns {Object|null}
 */
export function getM2Cache() {
  const cache = loadCache()
  return cache?.m2 || null
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
