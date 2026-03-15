/**
 * 角色卡数据压缩/解压模块
 * 
 * 压缩后格式示例：
 * {"V":"1.0","0A":"张三","1A":"1","1B":"阐述","1C":["2:","0:自定义"],"2A":"3","2B":"1"}
 * 
 * 字段映射规则：模块号 + 字母
 * - V: version (版本号)
 * 
 * - 0A: characterName (角色名) - M0
 * 
 * - 1A: backgroundId (出身 ID) - M1
 * - 1B: description (角色阐述) - M1
 * - 1C: traits (特质数组，格式 ["id:custom", ...]) - M1
 * 
 * - 2A: manufacturerId (企业 ID) - M2
 * - 2B: hardwareSpecId (硬件规格 ID) - M2
 * - 2C: description (角色阐述) - M2
 * - 2D: traits (特质数组，格式 ["id:custom", ...]) - M2
 */

// ============ 字段映射表 ============

// 压缩映射：短键 → 长键
const FIELD_MAP = {
  // 版本
  'V': 'version',
  
  // M0 - 导入
  '0A': 'characterName',
  
  // M1 - 人类基础
  '1A': 'backgroundId',
  '1B': 'm1Description',
  '1C': 'm1Traits',
  
  // M2 - 人形基础
  '2A': 'manufacturerId',
  '2B': 'hardwareSpecId',
  '2C': 'm2Description',
  '2D': 'm2Traits',
  
  // M3 - 人形属性（数组：[结构，出力，运动，算力，信息，功率]）
  '3A': 'm3Attributes',
  
  // M4 - 人类属性（数组：[结构，出力，运动，算力，信息，功率]）
  '4A': 'm4Attributes',
  '4B': 'm4Humanity',  // 人性值
  
  // M5 - 人类技能（数组：[技能 1, 技能 2, ..., 技能 16]）
  '5A': 'm5Skills',
  
  // M6 - 人类专长
  '6A': 'm6Talents',         // 专长数组：[[name,skill,limitation,description], ...]
  '6B': 'm6CyberBrain',      // 电子脑：0/1
  
  // M7 - 人形芯片
  '7A': 'm7ChipSlots',       // 芯片槽位数组：[[type,patentChipId,config], ...]
  '7B': 'm7HackMode',        // 破解模式：0/1
  
  // M9 - 尖端武装
  '9A': 'm9Weapon',          // 武器数据：[name, level, description, tags]
  '9B': 'm9WeaponTags',       // 武器标签数组（已废弃，保留兼容）
  
  // M14 - 人类检定（只保存工具加值）
  'EA': 'm14ToolBonuses',    // 工具加值数组
  
  // M15 - 人形检定（只保存工具加值）
  'FA': 'm15ToolBonuses',     // 工具加值数组
  
  // M16 - 人类状态
  '16A': 'm16ApNpEp',      // [apAdjust, npAdjust, epAdjust]
  '16B': 'm16Armor',       // [armor1, armor2, armor3]
  '16C': 'm16Scars',       // 伤痕数组
  '16D': 'm16HpAdjust',    // HP 调整值
  '16E': 'm16Safety',      // [physicalAdjust, electronicAdjust]
  
  // M17 - 人形状态
  '17A': 'm17ApNpEp',      // [apAdjust, npAdjust, epAdjust]
  '17B': 'm17Armor',       // [armor1, armor2, armor3]
  '17C': 'm17HpAdjust',    // HP 调整值
  '17D': 'm17Safety',      // [physicalAdjust, electronicAdjust]
  '17E': 'm17Scars',        // 伤痕数组

  // M18 - 人类装备
  '18A': 'm18Equipment',   // 装备数组

  // M19 - 人形装备
  '19A': 'm19Equipment',   // 装备数组

  // M20 - 备忘录
  '20A': 'm20Memo'         // 备忘录文本
}

// 解压映射：长键 → 短键
const REVERSE_FIELD_MAP = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([k, v]) => [v, k])
)

// ============ 压缩/解压函数 ============

/**
 * 压缩数据（用于导出字符代码）
 * @param {Object} data - 原始数据对象
 * @returns {Object} 压缩后的数据对象
 */
export function compress(data) {
  const compressed = {}
  
  for (const [key, value] of Object.entries(data)) {
    const shortKey = REVERSE_FIELD_MAP[key]
    if (shortKey) {
      // 特质数组特殊处理：[{id, custom}] → ["id:custom", ...]
      if (key === 'traits' && Array.isArray(value)) {
        compressed[shortKey] = value.map(t => {
          const id = t.id || ''
          const custom = t.custom || t.customEffect || ''
          return `${id}:${custom}`
        }).filter(s => s) // 过滤空字符串
      } else if (value !== '' && value !== null && value !== undefined) {
        // 只保存非空值
        compressed[shortKey] = value
      }
    }
  }
  
  return compressed
}

/**
 * 解压数据（用于导入字符代码）
 * @param {Object} compressed - 压缩后的数据对象
 * @returns {Object} 解压后的数据对象
 */
export function decompress(compressed) {
  const data = {}
  
  for (const [key, value] of Object.entries(compressed)) {
    const longKey = FIELD_MAP[key]
    if (longKey) {
      // 特质数组特殊处理：["id:custom"] → [{id, custom}]
      if (longKey === 'traits' && Array.isArray(value)) {
        data[longKey] = value.map(s => {
          const [id, ...customParts] = s.split(':')
          return {
            id: id || '',
            custom: customParts.join(':') || ''
          }
        })
      } else {
        data[longKey] = value
      }
    }
  }
  
  return data
}

/**
 * 将数据对象转为字符串（用于导出）
 * @param {Object} data - 原始数据对象
 * @returns {string} 压缩后的 JSON 字符串
 */
export function toCode(data) {
  const compressed = compress(data)
  return JSON.stringify(compressed)
}

/**
 * 将字符串解析为数据对象（用于导入）
 * @param {string} code - 压缩后的 JSON 字符串
 * @returns {Object|null} 解压后的数据对象，失败返回 null
 */
export function fromCode(code) {
  try {
    const compressed = JSON.parse(code)
    return decompress(compressed)
  } catch (e) {
    console.error('[Codec] 解析失败:', e)
    return null
  }
}
