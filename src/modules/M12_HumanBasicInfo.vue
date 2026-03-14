<!--
  模块编号：M12
  模块名称：基础资料（人类）
  显示模式：human-action
  功能：展示人类角色基础资料（读取前面模块数据）
-->
<template>
  <div class="module-human-basic-info">
    <!-- 模块标题 -->
    <ModuleHeader title="角色信息" subtitle="Character Information" />

    <!-- 数据展示列表 -->
    <div class="info-list">
      <DataDisplayItem
        v-for="item in displayItems"
        :key="item.id"
        :label="item.label"
        :name="item.name"
        :content="item.content"
        :show-label="item.showLabel"
        :show-name="item.showName"
        :show-content="item.showContent"
        :class="{ 'is-title': item.isTitle }"
      />
    </div>

    <!-- 属性展示区域 -->
    <div v-if="hasAttributes" class="attributes-section">
      <div class="attributes-grid">
        <div
          v-for="(value, key) in attributeTotals"
          :key="key"
          class="attribute-item"
        >
          <span class="attr-name">{{ attributeNames[key] }}</span>
          <span class="attr-value">{{ value > 0 ? '+' : '' }}{{ value }}</span>
        </div>
      </div>
    </div>

    <!-- 特质展示列表 -->
    <div class="traits-list">
      <DataDisplayItem
        v-for="item in traitItems"
        :key="item.id"
        :label="item.label"
        :name="item.name"
        :content="item.content"
        :show-label="item.showLabel"
        :show-name="item.showName"
        :show-content="item.showContent"
      />
    </div>

    <!-- 专长展示 -->
    <div v-if="parsedTalentsOutput && parsedTalentsOutput.length > 0" class="cyber-effect-text talents-section">
      <div class="talents-title">专长</div>
      <div class="talents-content" v-html="parsedTalentsOutput"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import DataDisplayItem from '@/components/DataDisplayItem.vue'
import TipButton from '@/components/TipButton.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import config from '@/data/basicInfoConfig.json'
import { extractManualText, extractAutoText, parseEffectText } from '@/utils/effectParser'

const moduleOutputs = useModuleOutputsStore()

// 属性名称映射
const attributeNames = {
  structure: '结构',
  torque: '出力',
  athletics: '运动',
  compute: '算力',
  information: '信息',
  power: '功率'
}

// 从 M4 获取属性总值
const attributeTotals = computed(() => {
  return moduleOutputs.outputs.M4?.attributeTotals || {}
})

// 是否有属性数据（不全为 0）
const hasAttributes = computed(() => {
  const totals = attributeTotals.value
  if (!totals || Object.keys(totals).length === 0) return false
  return Object.values(totals).some(val => val !== 0)
})

// 根据配置和模块输出构建展示数据（M12 显示 ID 1,2,3）
// ID 1: 角色名，ID 2: 出身，ID 3: 角色阐述
const displayItems = computed(() => {
  return config.items
    .filter(item => [1, 2, 3].includes(item.id))
    .map(item => {
      // 获取来源模块的数据
      const moduleData = moduleOutputs.outputs[item.sourceModule] || {}

      // 获取名称值
      let nameValue = moduleData[item.sourceField] || ''

      // 角色名称 (ID=1) 和出身 (ID=2) 在没有数据时显示 "UNKNOWN"
      if (!nameValue && [1, 2].includes(item.id)) {
        nameValue = 'UNKNOWN'
      }

      // 获取内容值（如果有 contentField，否则如果 showName 为 false，则 sourceField 作为内容）
      const rawContent = item.contentField
        ? (moduleData[item.contentField] || '')
        : (!item.showName && item.showContent) ? nameValue : ''
      // 出身/角色阐述效果只显示 [MANUAL] 部分
      const manualContent = item.contentField ? extractManualText(rawContent) : rawContent
      // 如果没有 [MANUAL] 内容，显示提示
      const contentValue = item.contentField ? (manualContent || '效果已自动计入数据') : rawContent

      return {
        id: item.id,
        label: item.label,
        name: nameValue,
        content: contentValue,
        showLabel: item.showLabel,
        showName: item.showName,
        showContent: item.showContent,
        isTitle: item.isTitle || false
      }
    }).filter(item => {
      // 过滤掉没有数据的项
      const hasData = item.name || item.content
      return hasData
    })
})

// 特质数据（ID 4,5）在属性之后显示
const traitItems = computed(() => {
  return config.items
    .filter(item => [4, 5].includes(item.id))
    .map(item => {
      const moduleData = moduleOutputs.outputs[item.sourceModule] || {}
      const nameValue = moduleData[item.sourceField] || ''
      const rawContent = item.contentField
        ? (moduleData[item.contentField] || '')
        : ''
      // 特质效果处理：
      // 1. 优先显示 [MANUAL] 部分
      // 2. 如果没有 [MANUAL] 但有 [AUTO]，显示"效果已自动计入数据"
      // 3. 如果都没有（如自由特质），显示原始内容
      const manualContent = extractManualText(rawContent)
      const autoContent = extractAutoText(rawContent)
      let contentValue = ''
      
      if (manualContent) {
        contentValue = manualContent
      } else if (autoContent) {
        contentValue = '效果已自动计入数据'
      } else if (rawContent) {
        contentValue = rawContent
      }

      return {
        id: item.id,
        label: item.label,
        name: nameValue,
        content: contentValue,
        showLabel: item.showLabel,
        showName: item.showName,
        showContent: item.showContent
      }
    }).filter(item => item.name || item.content)
})

// 从 M6 获取专长数据并解析
const parsedTalentsOutput = computed(() => {
  const talents = moduleOutputs.outputs.M6?.talents || []
  if (!talents || talents.length === 0) return ''
  
  const lines = talents.map(talent => {
    // 格式：【专长名称（专长类型）】：【专长内容】【tip】
    const namePart = talent.name || '未命名专长'
    const typePart = talent.skillName || talent.skill || ''
    const contentPart = talent.limitation || ''
    const tipPart = talent.description || ''
    
    let result = `<strong>${namePart}</strong>`
    if (typePart) {
      result += `（${typePart}）`
    }
    result += ':'
    if (contentPart) {
      result += ` ${contentPart}`
    }
    if (tipPart) {
      result += ` <TipButton level="1" content="${tipPart.replace(/"/g, '&quot;')}" />`
    }
    return result
  })
  
  return lines.join('<br>')
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-human-basic-info {
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .is-title {
    font-size: 18px;
    font-weight: bold;

    :deep(.data-name) {
      color: $cyber-cyan;
      font-size: 18px;
    }
  }

  // 属性展示区域
  .attributes-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba($cyber-cyan, 0.2);
  }

  .attributes-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;

    // 只在非常窄的屏幕切换为 3 列
    @media (max-width: 500px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
  }

  .attribute-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba($cyber-cyan, 0.05);
    }
  }

  .attr-name {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    margin-bottom: 4px;
  }

  .attr-value {
    font-size: 18px;
    font-weight: 700;
    font-family: "Courier New", monospace;
    color: rgba(255, 255, 255, 0.9);
  }

  // 特质列表
  .traits-list {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba($cyber-cyan, 0.15);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  // 专长展示区域
  .talents-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba($cyber-cyan, 0.15);
  }

  .talents-title {
    color: $cyber-cyan;
    font-size: 14px;
    font-weight: 600;
    font-family: "Courier New", monospace;
    margin-bottom: 8px;
  }

  .talents-content {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
