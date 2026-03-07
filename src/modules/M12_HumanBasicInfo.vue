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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import DataDisplayItem from '@/components/DataDisplayItem.vue'
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
      const contentValue = item.contentField
        ? (moduleData[item.contentField] || '')
        : (!item.showName && item.showContent) ? nameValue : ''

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
      const contentValue = item.contentField
        ? (moduleData[item.contentField] || '')
        : ''

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
}
</style>
