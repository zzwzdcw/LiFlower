<!--
  模块编号：M13
  模块名称：基础资料（人形）
  显示模式：doll-action
  功能：展示人形角色基础资料（读取前面模块数据）
-->
<template>
  <div class="module-doll-basic-info">
    <!-- 模块标题 -->
    <ModuleHeader title="角色信息" subtitle="Character Information" />

    <!-- 角色姓名 -->
    <div class="character-name">
      <DataDisplayItem
        v-if="characterName"
        :label="characterName.label"
        :name="characterName.name"
        :content="characterName.content"
        :show-label="characterName.showLabel"
        :show-name="characterName.showName"
        :show-content="characterName.showContent"
        :class="{ 'is-title': characterName.isTitle }"
      />
    </div>

    <!-- 企业和规格信息（终端风格） -->
    <div class="terminal-info">
      <div v-if="isBlackMarket" class="terminal-line illegal">
        <span class="terminal-text">非法人形</span>
      </div>
      <div v-else-if="manufacturerName || hardwareSpecName" class="terminal-line">
        <span class="terminal-text">{{ specDisplayText }}</span>
      </div>
      <div v-else class="terminal-line unknown">
        <span class="terminal-text">规格未知·未查询到序列号</span>
      </div>
    </div>

    <!-- 角色阐述 -->
    <div v-if="characterDescription" class="character-description">
      {{ characterDescription }}
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

    <!-- 企业规格效果 -->
    <div v-if="manufacturerEffectDesc || hardwareSpecEffectDesc" class="cyber-effect-text">
      <div v-if="manufacturerEffectDesc && manufacturerName">
        <strong>{{ manufacturerName }}：</strong>{{ manufacturerEffectDesc }}
      </div>
      <div v-if="hardwareSpecEffectDesc && hardwareSpecName">
        <strong>{{ hardwareSpecName }}人形：</strong>{{ hardwareSpecEffectDesc }}
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

    <!-- 芯片信息展示 -->
    <div v-if="chipTextOutput" class="cyber-effect-text chip-info-section">
      <div class="chip-info-title">已安装芯片</div>
      <div class="chip-info-content" v-html="parsedChipTextOutput"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import DataDisplayItem from '@/components/DataDisplayItem.vue'
import { extractManualText, extractAutoText, parseEffectText } from '@/utils/effectParser'
import ModuleHeader from '@/components/ModuleHeader.vue'
import config from '@/data/basicInfoConfig.json'

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

// 从 M3 获取属性总值
const attributeTotals = computed(() => {
  return moduleOutputs.outputs.M3?.attributeTotals || {}
})

// 是否有属性数据
const hasAttributes = computed(() => {
  return Object.keys(attributeTotals.value).length > 0
})

// 从 M2 获取生产企业名称
const manufacturerName = computed(() => {
  return moduleOutputs.outputs.M2?.manufacturerName || ''
})

// 从 M2 获取硬件规格名称
const hardwareSpecName = computed(() => {
  return moduleOutputs.outputs.M2?.hardwareSpecName || ''
})

// 从 M2 获取生产企业ID（用于判断黑品）
const manufacturerId = computed(() => {
  return moduleOutputs.outputs.M2?.manufacturerId || null
})

// 是否是黑品（ID=8）
const isBlackMarket = computed(() => {
  return manufacturerId.value === 8
})

// 规格显示文本
const specDisplayText = computed(() => {
  const spec = hardwareSpecName.value || '未知规格'
  const manufacturer = manufacturerName.value
  if (!manufacturer) {
    return `${spec}人形·厂商不明`
  }
  return `${spec}人形·由${manufacturer}制造`
})

// 角色姓名（ID 1）
const characterName = computed(() => {
  const moduleData = moduleOutputs.outputs.M0 || {}
  const nameValue = moduleData.characterName || ''
  return {
    label: '',
    name: nameValue || 'UNKNOWN',
    content: '',
    showLabel: false,
    showName: true,
    showContent: false,
    isTitle: true
  }
})

// 角色阐述（ID 8）
const characterDescription = computed(() => {
  const moduleData = moduleOutputs.outputs.M2 || {}
  return moduleData.description || ''
})

// 企业效果描述（只显示手动部分）
const manufacturerEffectDesc = computed(() => {
  const moduleData = moduleOutputs.outputs.M2 || {}
  const rawEffect = moduleData.manufacturerEffect || ''
  const manualEffect = extractManualText(rawEffect)
  return manualEffect || '效果已自动计入数据'
})

// 硬件规格效果描述（只显示手动部分）
const hardwareSpecEffectDesc = computed(() => {
  const moduleData = moduleOutputs.outputs.M2 || {}
  const rawEffect = moduleData.hardwareSpecEffect || ''
  const manualEffect = extractManualText(rawEffect)
  return manualEffect || '效果已自动计入数据'
})

// 特质数据（ID 9,10）在属性之后显示
const traitItems = computed(() => {
  return config.items
    .filter(item => [9, 10].includes(item.id))
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

// 从 M7 获取芯片文本输出
const chipTextOutput = computed(() => {
  return moduleOutputs.outputs.M7?.chipTextOutput || ''
})

// 解析芯片文本输出（只显示 [MANUAL] 部分）
const parsedChipTextOutput = computed(() => {
  const rawOutput = chipTextOutput.value
  if (!rawOutput) return ''
  // 按行分割，每行提取 [MANUAL] 部分
  const lines = rawOutput.split('\n')
  const filteredLines = lines.filter(line => line.trim())
  const processedLines = filteredLines.map(line => {
    // 分离芯片名和效果（格式：芯片名：效果 或 芯片名：效果）
    // 先找中文冒号，再找英文冒号
    let colonIndex = line.indexOf('：')
    if (colonIndex === -1) {
      colonIndex = line.indexOf(':')
    }
    if (colonIndex === -1) return line

    const chipName = line.substring(0, colonIndex + 1)
    // 移除字面的 <br> 字符串（不是 HTML 标签）
    let effectText = line.substring(colonIndex + 1)
    effectText = effectText.replace(/<br>/gi, ' ').replace(/<br\s*\/?>/g, ' ').trim()
    
    const manualEffect = extractManualText(effectText)

    // 如果没有 [MANUAL] 内容，显示提示
    if (!manualEffect) {
      return chipName + '效果已自动计入数据'
    }
    return chipName + manualEffect
  })

  return processedLines.join('<br>')
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-doll-basic-info {
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

  // 终端风格信息展示
  .terminal-info {
    margin-top: 16px;
    font-family: "Courier New", "Consolas", monospace;
  }

  .terminal-line {
    .terminal-text {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    &.illegal {
      .terminal-text {
        color: #ff2a6d;
        font-size: 16px;
        font-weight: 700;
      }
    }

    &.unknown {
      .terminal-text {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  // 企业和规格信息
  .manufacturer-info {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .manufacturer-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }

  .spec-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-style: italic;
  }

  // 企业规格效果（使用全局样式）
  .effects-section {
    margin-top: 16px;
  }

  // 角色阐述
  .character-description {
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.6;
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

  // 企业和规格信息
  .manufacturer-section {
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba($cyber-cyan, 0.05);
    border-left: 3px solid rgba($cyber-cyan, 0.3);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .manufacturer-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-family: "Courier New", monospace;
  }

  .spec-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-family: "Courier New", monospace;
    font-style: italic;
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

  // 芯片信息展示（使用全局样式）
  .chip-info-section {
    margin-top: 16px;
  }

  .chip-info-title {
    margin-bottom: 8px;
  }
}
</style>
