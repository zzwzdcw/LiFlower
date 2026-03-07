<!--
  模块编号：M15
  模块名称：检定数据（人形）
  显示模式：doll-action
  功能：基于上方模块进行计算的模块
-->
<template>
  <div class="module-m15">
    <ModuleHeader title="检定数据" subtitle="Check Data">
      <template #right>
        <button class="mode-toggle" @click="isCompactMode = !isCompactMode">
          {{ isCompactMode ? '详细模式' : '简略模式' }}
        </button>
      </template>
    </ModuleHeader>

    <!-- 战斗数据部分 -->
    <div class="combat-data-section">
      <div class="section-header">
        <h4 class="section-title">战斗数据</h4>
      </div>

      <!-- 简略模式：表头（两行，每行两个表头） -->
      <div v-if="isCompactMode" class="combat-header-row">
        <div class="combat-header compact">
          <div class="compact-col compact-name">项目名称</div>
          <div class="compact-col compact-value">检定值</div>
          <div class="compact-col compact-btn"></div>
          <div class="compact-col compact-btn">优势</div>
        </div>
        <div class="combat-header compact">
          <div class="compact-col compact-name">项目名称</div>
          <div class="compact-col compact-value">检定值</div>
          <div class="compact-col compact-btn"></div>
          <div class="compact-col compact-btn">优势</div>
        </div>
      </div>

      <!-- 详细模式：表头 -->
      <div v-else class="combat-header detailed">
        <div class="col col-name">项目名称</div>
        <div class="col col-value">检定值</div>
        <div class="col col-operator"></div>
        <div class="col col-bonus">属性</div>
        <div class="col col-operator"></div>
        <div class="col col-bonus">技能</div>
        <div class="col col-operator"></div>
        <div class="col col-tool">工具加值</div>
        <div class="col col-btn"></div>
        <div class="col col-btn">优势</div>
      </div>

      <!-- 战斗数据条目 -->
      <div class="combat-entries" :class="{ 'compact': isCompactMode }">
        <CombatEntry
          v-for="entry in computedEntries"
          :key="entry.id"
          :name="entry.name"
          :value="entry.value"
          :attribute-bonus="entry.attributeBonus"
          :skill-bonus="entry.skillBonus"
          :skill-name="entry.skillName"
          :tool-bonus="entry.toolBonus"
          :tool-name="entry.toolName"
          :has-specialization="false"
          :specialization-active="false"
          :advantage-active="entry.advantageActive"
          :description="entry.description"
          :is-compact="isCompactMode"
          @update:tool-bonus="updateToolBonus(entry.id, $event)"
          @toggle-advantage="toggleAdvantage(entry.id)"
        />
      </div>
    </div>

    <!-- 检定数据部分 -->
    <div class="check-data-section">
      <div class="section-header">
        <h4 class="section-title">检定数据</h4>
      </div>

      <!-- 简略模式：表头（两行，每行两个表头） -->
      <div v-if="isCompactMode" class="combat-header-row">
        <div class="combat-header compact">
          <div class="compact-col compact-name">技能名称</div>
          <div class="compact-col compact-value">检定值</div>
          <div class="compact-col compact-btn"></div>
          <div class="compact-col compact-btn">优势</div>
        </div>
        <div class="combat-header compact">
          <div class="compact-col compact-name">技能名称</div>
          <div class="compact-col compact-value">检定值</div>
          <div class="compact-col compact-btn"></div>
          <div class="compact-col compact-btn">优势</div>
        </div>
      </div>

      <!-- 详细模式：表头 -->
      <div v-else class="check-header">
        <div class="check-col check-name">技能名称</div>
        <div class="check-col check-value">检定值</div>
        <div class="check-col check-operator"></div>
        <div class="check-col check-bonus">属性</div>
        <div class="check-col check-operator"></div>
        <div class="check-col check-bonus">技能</div>
        <div class="check-col check-operator"></div>
        <div class="check-col check-tool">工具加值</div>
        <div class="check-col check-btn"></div>
        <div class="check-col check-btn">优势</div>
      </div>

      <!-- 检定数据条目 -->
      <div class="check-entries" :class="{ 'compact': isCompactMode }">
        <CombatEntry
          v-for="entry in computedCheckEntries"
          :key="entry.id"
          :name="entry.name"
          :value="entry.value"
          :attribute-bonus="entry.attributeBonus"
          :skill-bonus="entry.skillBonus"
          :skill-name="entry.skillName"
          :tool-bonus="entry.toolBonus"
          :tool-name="entry.toolName || '工具'"
          :description="entry.description"
          :has-specialization="false"
          :specialization-active="false"
          :advantage-active="entry.advantageActive"
          :show-tool="true"
          :show-buttons="true"
          :is-compact="isCompactMode"
          @update:tool-bonus="updateCheckToolBonus(entry.id, $event)"
          @toggle-advantage="toggleCheckAdvantage(entry.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useModuleOutputsStore } from '@/stores/moduleOutputs'
import ModuleHeader from '@/components/ModuleHeader.vue'
import CombatEntry from '@/components/CombatEntry.vue'
import combatRules from '@/data/combatRules.json'

const moduleOutputs = useModuleOutputsStore()

// 简略/详细模式切换
const isCompactMode = ref(false)

// 获取属性值（从 M3 读取人形属性）
const attributes = computed(() => {
  return moduleOutputs.outputs.M3?.attributeTotals || {}
})

// 获取 M7 技能加成
const skillBonuses = computed(() => {
  return moduleOutputs.outputs.M7?.skillBonuses || []
})

// 获取技能值（根据 M7 的 skillBonuses 计算）
function getSkillValue(skillId) {
  if (!skillId) return 0
  const bonus = skillBonuses.value.find(b => b.skillId === skillId.toString())
  if (!bonus) return 0
  return bonus.upgraded ? 3 : 2
}

// 战斗数据条目状态
const combatEntries = ref(
  combatRules.combatEntries.map(rule => ({
    id: rule.id,
    name: rule.name,
    attributeId: rule.attributeId,
    attributeName: rule.attributeName,
    skillId: rule.skillId,
    skillName: rule.skillName,
    hasSpecializationRule: rule.hasSpecialization,
    specializationBonus: rule.specializationBonus || 2,
    advantageBonus: rule.advantageBonus || 2,
    toolName: rule.toolName,
    description: rule.description || rule.formula,
    // 动态状态
    attributeBonus: 0,
    skillBonus: 0,
    toolBonus: 0,
    specializationActive: false,
    advantageActive: false
  }))
)

// 检定数据条目状态
const checkEntries = ref(
  combatRules.checkEntries.map(rule => ({
    id: rule.id,
    name: rule.name,
    skillId: rule.skillId,
    skillName: rule.skillName || rule.name,
    description: rule.tipDescription || rule.description,
    attributeId: rule.attributeId,
    attributeName: rule.attributeName,
    hasSpecializationRule: rule.hasSpecialization,
    specializationBonus: rule.specializationBonus || 2,
    advantageBonus: rule.advantageBonus || 2,
    toolName: '工具',
    // 动态状态
    attributeBonus: 0,
    skillBonus: 0,
    toolBonus: 0,
    specializationActive: false,
    advantageActive: false
  }))
)

// 更新工具加值
function updateToolBonus(entryId, value) {
  const entry = combatEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.toolBonus = value
  }
}

// 切换优势状态
function toggleAdvantage(entryId) {
  const entry = combatEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.advantageActive = !entry.advantageActive
  }
}

// 切换检定数据优势状态
function toggleCheckAdvantage(entryId) {
  const entry = checkEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.advantageActive = !entry.advantageActive
  }
}

// 更新检定数据工具加值
function updateCheckToolBonus(entryId, value) {
  const entry = checkEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.toolBonus = value
  }
}

// 计算战斗条目数值
const computedEntries = computed(() => {
  return combatEntries.value.map(entry => {
    // 获取属性值
    const attributeValue = attributes.value[entry.attributeId] || 0
    entry.attributeBonus = attributeValue

    // 获取技能值（从 M7 的 skillBonuses 计算）
    const skillValue = getSkillValue(entry.skillId)
    entry.skillBonus = skillValue

    // 计算总值 = 属性 + 技能 + 工具 + 优势
    let totalValue = entry.attributeBonus + entry.skillBonus + entry.toolBonus
    if (entry.advantageActive) {
      totalValue += entry.advantageBonus
    }

    // M15 不显示专精按钮
    const hasSpec = false

    // 重置专精状态
    if (entry.specializationActive) {
      entry.specializationActive = false
    }

    return {
      ...entry,
      value: totalValue,
      hasSpecialization: hasSpec
    }
  })
})

// 检定数据条目计算
const computedCheckEntries = computed(() => {
  return checkEntries.value.map(entry => {
    // 获取属性值
    const attributeValue = entry.attributeId ? (attributes.value[entry.attributeId] || 0) : 0
    entry.attributeBonus = attributeValue

    // 获取技能值（从 M7 的 skillBonuses 计算）
    const skillValue = getSkillValue(entry.skillId)
    entry.skillBonus = skillValue

    // 计算总值 = 属性 + 技能 + 工具 + 优势
    let totalValue = entry.attributeBonus + entry.skillBonus + entry.toolBonus
    if (entry.advantageActive) {
      totalValue += entry.advantageBonus
    }

    // M15 不显示专精按钮
    const hasSpec = false

    // 重置专精状态
    if (entry.specializationActive) {
      entry.specializationActive = false
    }

    return {
      ...entry,
      value: totalValue,
      hasSpecialization: hasSpec
    }
  })
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m15 {
  .combat-data-section,
  .check-data-section {
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba($cyber-cyan, 0.2);
  }

  .section-title {
    color: $cyber-cyan;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .mode-toggle {
    background: rgba($cyber-cyan, 0.1);
    border: 1px solid rgba($cyber-cyan, 0.3);
    color: $cyber-cyan;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba($cyber-cyan, 0.2);
    }
  }

  // 表头样式
  .combat-header-row {
    display: flex;
    width: 100%;

    .combat-header.compact {
      width: 50%;
    }
  }

  .combat-header {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 0;
    border-bottom: 2px solid rgba($cyber-cyan, 0.3);
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;

    // 简略模式表头
    &.compact {
      gap: 4px;
      padding: 5px 8px;
      box-sizing: border-box;

      .compact-col {
        text-align: center;
        font-size: 9px;
      }

      .compact-name {
        flex: 1;
        text-align: left;
        min-width: 40px;
      }

      .compact-value {
        width: 30px;
      }

      .compact-btn {
        width: 24px;
      }
    }

    // 详细模式表头
    &.detailed {
      .col {
        text-align: center;
      }

      // 项目名称 - 比例 2
      .col-name {
        flex: 2;
        min-width: 50px;
        text-align: left;
      }

      // 检定值 - 比例 1.5
      .col-value {
        flex: 1.5;
        min-width: 35px;
      }

      // 运算符列 - 比例 0.5
      .col-operator {
        flex: 0.5;
        min-width: 10px;
      }

      // 属性/技能 - 比例 1.2
      .col-bonus {
        flex: 1.2;
        min-width: 30px;
      }

      // 工具加值 - 比例 1.5
      .col-tool {
        flex: 1.5;
        min-width: 40px;
      }

      // 按钮列 - 比例 0.8
      .col-btn {
        flex: 0.8;
        min-width: 24px;
      }
    }
  }

  // 条目容器
  .combat-entries {
    display: flex;
    flex-direction: column;

    // 简略模式：两列布局
    &.compact {
      flex-direction: row;
      flex-wrap: wrap;

      :deep(.combat-entry.compact) {
        width: 50%;
      }
    }
  }

  .placeholder {
    padding: 40px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
  }

  // ========== 检定数据表头样式 - 匹配 CombatEntry 列宽 ==========
  .check-header {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 0;
    border-bottom: 2px solid rgba($cyber-cyan, 0.3);
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;

    .check-col {
      text-align: center;
    }

    // 项目名称 - 比例 2
    .check-name {
      flex: 2;
      min-width: 50px;
      text-align: left;
    }

    // 检定值 - 比例 1.5
    .check-value {
      flex: 1.5;
      min-width: 35px;
    }

    // 运算符列 - 比例 0.5
    .check-operator {
      flex: 0.5;
      min-width: 10px;
    }

    // 属性/技能 - 比例 1.2
    .check-bonus {
      flex: 1.2;
      min-width: 30px;
    }

    // 工具加值 - 比例 1.5
    .check-tool {
      flex: 1.5;
      min-width: 40px;
    }

    // 按钮列 - 比例 0.8
    .check-btn {
      flex: 0.8;
      min-width: 24px;
    }
  }

  .check-entries {
    display: flex;
    flex-direction: column;

    // 简略模式：两列布局
    &.compact {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
}
</style>
