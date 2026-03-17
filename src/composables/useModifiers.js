import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'

/**
 * 调整值计算系统
 * 
 * 规则格式：
 * {
 *   id: '规则唯一ID',
 *   watch: () => store.xxx,  // 监视的值
 *   match: 预期值,          // 可以是具体值、数组、或函数
 *   value: 1,              // 调整值（可为负）
 *   target: '目标属性ID'    // 可选，用于筛选
 * }
 * 
 * 或直接传入数字：
 * {
 *   id: 'fixed',
 *   value: 2  // 固定值
 * }
 */
export function useModifiers(rules = []) {
  const characterStore = useCharacterStore()

  // 计算所有生效的调整值
  const calculateModifiers = () => {
    const activeModifiers = []
    
    rules.forEach(rule => {
      let isMatch = false
      
      // 如果规则有 watch 和 match，需要判断条件
      if (rule.watch !== undefined) {
        const currentValue = typeof rule.watch === 'function' 
          ? rule.watch() 
          : rule.watch
        
        if (rule.match !== undefined) {
          // match 可以是函数（传入 currentValue 判断是否匹配）
          if (typeof rule.match === 'function') {
            isMatch = rule.match(currentValue)
          }
          // match 可以是数组（包含任一即匹配）
          else if (Array.isArray(rule.match)) {
            // 如果 currentValue 是数组，检查是否有交集
            if (Array.isArray(currentValue)) {
              isMatch = currentValue.some(v => rule.match.includes(v))
            } else {
              isMatch = rule.match.includes(currentValue)
            }
          }
          // match 是具体值
          else {
            isMatch = currentValue === rule.match
          }
        }
      }
      // 没有 watch 的规则直接生效（固定值）
      else {
        isMatch = true
      }
      
      if (isMatch) {
        activeModifiers.push({
          id: rule.id,
          name: rule.name || rule.id,
          value: rule.value || 0,
          target: rule.target || null
        })
      }
    })
    
    return activeModifiers
  }

  // 计算特定目标的总调整值
  const getModifierFor = (targetId) => {
    const modifiers = calculateModifiers()
    return modifiers
      .filter(m => !m.target || m.target === targetId)
      .reduce((sum, m) => sum + m.value, 0)
  }

  // 获取特定目标的调整值详情（包含规则名称）
  const getModifierDetailsFor = (targetId) => {
    const modifiers = calculateModifiers()
    return modifiers
      .filter(m => (!m.target || m.target === targetId) && m.value !== 0)
      .map(m => ({
        name: m.name || m.id,
        value: m.value
      }))
  }

  // 获取所有调整值（响应式）
  const activeModifiers = computed(() => calculateModifiers())

  return {
    activeModifiers,
    getModifierFor,
    getModifierDetailsFor
  }
}

/**
 * 预定义的规则模板
 */
export const ModifierTemplates = {
  // 企业相关规则
  manufacturer: {
    darkhawkCompute: {
      id: 'darkhawk_compute',
      watch: () => useCharacterStore().manufacturer,
      match: '暗隼电子',
      value: 1,
      target: 'compute'
    }
  }
}
