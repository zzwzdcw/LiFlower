/**
 * 效果文本解析器
 * 解析 [AUTO] 和 [MANUAL] 标记为 HTML
 */

/**
 * 解析效果文本中的标记
 * @param {string} text - 原始文本，如 "[AUTO]闪避+2；[MANUAL]HP+4"
 * @returns {string} HTML 字符串
 */
export function parseEffectText(text) {
  if (!text) return ''

  // 解析 [AUTO] 标记 -> 青色（使用内联样式确保生效）
  text = text.replace(/\[AUTO\](.*?)(?=\[|$)/g, '<span style="color: #00f3ff; font-weight: 600; font-style: normal;">$1</span>')

  // 解析 [MANUAL] 标记 -> 橙色（使用内联样式确保生效）
  text = text.replace(/\[MANUAL\](.*?)(?=\[|$)/g, '<span style="color: #ff9f43; font-weight: 600; font-style: italic;">$1</span>')

  return text
}

/**
 * 提取仅 [MANUAL] 标记的文本
 * 用于 M12/M13 只显示需要手动调整的效果
 * @param {string} text - 原始文本
 * @returns {string} 仅包含手动部分的文本
 */
export function extractManualText(text) {
  if (!text) return ''

  // 提取所有 [MANUAL] 标记后的内容
  const matches = text.match(/\[MANUAL\](.*?)(?=\[|$)/g)
  if (!matches || matches.length === 0) return ''

  // 移除 [MANUAL] 标记，保留内容，用分号连接
  return matches
    .map(m => m.replace(/\[MANUAL\]/g, '').trim())
    .filter(t => t)
    .join('；')
}

/**
 * 提取仅 [AUTO] 标记的文本
 * @param {string} text - 原始文本
 * @returns {string} 仅包含自动部分的文本
 */
export function extractAutoText(text) {
  if (!text) return ''

  // 提取所有 [AUTO] 标记后的内容
  const matches = text.match(/\[AUTO\](.*?)(?=\[|$)/g)
  if (!matches || matches.length === 0) return ''

  // 移除 [AUTO] 标记，保留内容，用分号连接
  return matches
    .map(m => m.replace(/\[AUTO\]/g, '').trim())
    .filter(t => t)
    .join('；')
}
