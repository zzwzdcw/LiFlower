<template>
  <div class="attribute-allocator" :class="{ collapsible: collapsible }">
    <el-divider v-if="showDivider" />
    <el-form-item>
      <div class="attribute-section">
        <div v-if="sourceInfo" class="attribute-source-info">
          {{ sourceInfo }}
        </div>

        <div
          v-for="attrName in filteredAttributeOrder"
          :key="attrName"
          class="attribute-row"
          :class="{ expanded: isExpanded(attrName), 'has-value': getCurrentAttributeValue(attrName) > 0 }"
        >
          <!-- 可展开模式：头部 -->
          <div v-if="collapsible" class="attribute-header" @click="toggleExpand(attrName)">
            <div class="attribute-label">
              <span>{{ getAttributeName(attrName) }}</span>
              <TipButton
                level="1"
                :html-content="getAttributeTipContent(attrName)"
              />
            </div>
            <div class="attribute-summary">
              <span class="attribute-value" :class="{ 'out-of-range': isOutOfNormalRange(attrName), 'has-modifier': getModifierFor(attrName) !== 0 }">
                {{ getTotalValue(attrName) }}
              </span>
              <el-icon class="expand-icon">
                <ArrowDown v-if="isExpanded(attrName)" />
                <ArrowRight v-else />
              </el-icon>
            </div>
          </div>

          <!-- 普通模式：标签 -->
          <div v-else class="attribute-label">
            <span>{{ getAttributeName(attrName) }}</span>
            <TipButton
              level="1"
              :html-content="getAttributeTipContent(attrName)"
            />
          </div>

          <!-- 展开后的内容或普通模式的控制区 -->
          <div v-if="!collapsible || isExpanded(attrName)" class="attribute-controls">
            <!-- 减按钮 -->
            <button
              v-if="!isReadonly(attrName)"
              size="small"
              :class="['attr-btn', getDecreaseButtonState(attrName)]"
              @click="handleDecrease(attrName)"
            >
              <el-icon><Minus /></el-icon>
            </button>

            <!-- 数值显示 -->
            <span class="attribute-value" :class="{ 'out-of-range': isOutOfNormalRange(attrName), 'readonly': isReadonly(attrName) }">
              {{ getCurrentAttributeValue(attrName) }}
            </span>

            <!-- 加按钮 -->
            <button
              v-if="!isReadonly(attrName)"
              size="small"
              :class="['attr-btn', getIncreaseButtonState(attrName)]"
              @click="handleIncrease(attrName)"
            >
              <el-icon><Plus /></el-icon>
            </button>

            <!-- 只读提示 -->
            <span v-if="isReadonly(attrName)" class="readonly-hint">芯片</span>

            <!-- 调整值显示 -->
            <ModifierDisplay
              :base-value="getCurrentAttributeValue(attrName)"
              :modifier="getModifierFor(attrName)"
              :max-value="attributeLimit"
              :modifier-details="getModifierDetailsFor(attrName)"
            />
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Minus } from "@element-plus/icons-vue";
import TipButton from "./TipButton.vue";
import ModifierDisplay from "./ModifierDisplay.vue";
import { useModifiers } from "@/composables/useModifiers";
import { ArrowDown, ArrowRight } from "@element-plus/icons-vue";

/**
 * Props 定义
 * @property {Number} attributePoints - 总属性点数
 * @property {Number} attributeLimit - 单项属性上限（默认 5）
 * @property {Object} attributes - 当前各属性值对象
 * @property {Object} attributeData - 属性列表数据（用于获取描述）
 * @property {Boolean} showDivider - 是否显示分割线
 * @property {String} sourceInfo - 属性点来源信息
 * @property {Object} normalRange - 普通范围 { min: 0, max: 4 }
 * @property {Object} specialRanges - 特殊范围定义 { key: { min: 0, max: 5, requiresConfirm: true } }
 * @property {Boolean} collapsible - 是否可展开/收起
 * @property {Boolean} hideZero - 是否隐藏值为0的项
 */
const props = defineProps({
  attributePoints: {
    type: Number,
    default: 0,
  },
  attributeLimit: {
    type: Number,
    default: 5,
  },
  attributes: {
    type: Object,
    default: () => ({}),
  },
  attributeData: {
    type: Object,
    default: () => ({}),
  },
  showDivider: {
    type: Boolean,
    default: true,
  },
  sourceInfo: {
    type: String,
    default: "",
  },
  normalRange: {
    type: Object,
    default: () => ({ min: 0, max: 4 })
  },
  specialRanges: {
    type: Object,
    default: () => ({})
  },
  // 调整值计算规则
  modifierRules: {
    type: Array,
    default: () => []
  },
  // 是否可展开/收起
  collapsible: {
    type: Boolean,
    default: false
  },
  // 是否隐藏值为0的项
  hideZero: {
    type: Boolean,
    default: false
  },
  // 只读属性列表（这些属性无法调整）
  readonlyAttributes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:attributes"]);

// 使用调整值计算系统
const { getModifierFor, getModifierDetailsFor } = useModifiers(props.modifierRules);

// 待确认的操作状态
const pendingIncrease = ref({});
const pendingDecrease = ref({});

// 展开状态（用于 collapsible 模式）
const expandedItems = ref({});

// 切换展开状态
const toggleExpand = (attrName) => {
  if (!props.collapsible) return;
  expandedItems.value[attrName] = !expandedItems.value[attrName];
};

// 检查是否展开
const isExpanded = (attrName) => {
  return !!expandedItems.value[attrName];
};

// 获取总值（基础值 + 调整值）
const getTotalValue = (attrName) => {
  const baseValue = getCurrentAttributeValue(attrName);
  const modifier = getModifierFor(attrName);
  return baseValue + modifier;
};

// 动态获取属性/技能顺序（过滤掉值为0的项）
const filteredAttributeOrder = computed(() => {
  const keys = Object.keys(props.attributeData);
  const order = keys.length > 0 ? keys : Object.keys(props.attributes);

  if (!props.hideZero) {
    return order;
  }

  // 隐藏值为0的项，但保留有调整值的项
  return order.filter(key => {
    const value = getCurrentAttributeValue(key);
    const modifier = getModifierFor(key);
    return value > 0 || modifier !== 0;
  });
});

// 动态获取属性/技能顺序
const attributeOrder = computed(() => {
  const keys = Object.keys(props.attributeData);
  if (keys.length > 0) return keys;
  return Object.keys(props.attributes);
});

// 获取属性/技能名称
const getAttributeName = (key) => {
  if (props.attributeData[key] && props.attributeData[key].name) {
    return props.attributeData[key].name;
  }
  return key;
};

// 获取属性描述
const getAttributeDescription = (attrName) => {
  const attr = props.attributeData[attrName];
  return attr ? attr.description : "";
};

// 获取属性效果（effects数组拼接）
const getAttributeEffects = (attrName) => {
  const attr = props.attributeData[attrName];
  if (!attr || !attr.effects || !Array.isArray(attr.effects)) return "";
  return attr.effects.join('\n');
};

// 生成tip的HTML内容
const getAttributeTipContent = (attrName) => {
  const effects = getAttributeEffects(attrName);
  const description = getAttributeDescription(attrName);
  
  let html = '';
  if (effects) {
    html += `<div style="color: #00f3ff; font-weight: 600; margin-bottom: 8px; line-height: 1.6; white-space: pre-line;">${effects.replace(/\n/g, '<br>')}</div>`;
  }
  if (description) {
    html += `<div style="color: rgba(255, 255, 255, 0.8); font-size: 13px; line-height: 1.6;">${description}</div>`;
  }
  return html;
};

// 计算已分配属性点总数
const allocatedPoints = computed(() => {
  return Object.values(props.attributes).reduce((sum, val) => sum + val, 0);
});

// 计算剩余可分配属性点（用于逻辑判断）
const remainingPoints = computed(() => {
  return props.attributePoints - allocatedPoints.value;
});

// 检查是否只读
const isReadonly = (attrName) => {
  return props.readonlyAttributes.includes(attrName.toString())
}

// 获取当前属性值
const getCurrentAttributeValue = (attrName) => {
  return props.attributes[attrName] || 0;
};

// 获取属性的有效范围
const getEffectiveRange = (attrName) => {
  // 如果有特殊范围定义，使用特殊范围
  if (props.specialRanges[attrName]) {
    return props.specialRanges[attrName];
  }
  // 否则使用默认范围
  return { 
    min: 0, 
    max: props.attributeLimit,
    normalMin: props.normalRange.min,
    normalMax: props.normalRange.max
  };
};

// 检查是否在普通范围外
const isOutOfNormalRange = (attrName) => {
  const value = getCurrentAttributeValue(attrName);
  const range = getEffectiveRange(attrName);
  const normalMin = range.normalMin !== undefined ? range.normalMin : props.normalRange.min;
  const normalMax = range.normalMax !== undefined ? range.normalMax : props.normalRange.max;
  return value < normalMin || value > normalMax;
};

// 检查是否需要确认（超出普通范围）
const requiresConfirm = (attrName, newValue) => {
  const range = getEffectiveRange(attrName);
  const normalMin = range.normalMin !== undefined ? range.normalMin : props.normalRange.min;
  const normalMax = range.normalMax !== undefined ? range.normalMax : props.normalRange.max;
  
  // 如果要进入或离开普通范围，需要确认
  const currentValue = getCurrentAttributeValue(attrName);
  const currentInNormal = currentValue >= normalMin && currentValue <= normalMax;
  const newInNormal = newValue >= normalMin && newValue <= normalMax;
  
  // 从普通范围到非普通范围，或反之，需要确认
  if (currentInNormal !== newInNormal) return true;
  
  // 如果已经在非普通范围，继续增减也需要确认
  if (!currentInNormal) return true;
  
  return false;
};

// 获取减按钮状态：'active' | 'disabled' | 'danger'
const getDecreaseButtonState = (attrName) => {
  const currentValue = getCurrentAttributeValue(attrName);
  const range = getEffectiveRange(attrName);
  
  // 检查是否可以减少（到达下限）
  if (currentValue <= (range.min !== undefined ? range.min : 0)) {
    return 'disabled';
  }
  
  // 检查是否需要确认（危险操作）
  const newValue = currentValue - 1;
  if (requiresConfirm(attrName, newValue)) {
    return 'danger';
  }
  
  return 'active';
};

// 获取加按钮状态：'active' | 'disabled' | 'danger'
const getIncreaseButtonState = (attrName) => {
  const currentValue = getCurrentAttributeValue(attrName);
  const range = getEffectiveRange(attrName);
  
  // 检查是否可以增加（到达上限或没有剩余点数）
  if (currentValue >= (range.max !== undefined ? range.max : props.attributeLimit)) {
    return 'disabled';
  }
  if (remainingPoints.value <= 0) {
    return 'disabled';
  }
  
  // 检查是否需要确认（危险操作）
  const newValue = currentValue + 1;
  if (requiresConfirm(attrName, newValue)) {
    return 'danger';
  }
  
  return 'active';
};

// 处理减少操作
const handleDecrease = (attrName) => {
  const state = getDecreaseButtonState(attrName);
  
  if (state === 'disabled') {
    return;
  }
  
  if (state === 'danger') {
    // 需要确认的操作
    if (!pendingDecrease.value[attrName]) {
      // 第一次点击，标记为待确认
      pendingDecrease.value[attrName] = 1;
      setTimeout(() => {
        pendingDecrease.value[attrName] = 0;
      }, 2000);
      return;
    } else if (pendingDecrease.value[attrName] === 1) {
      // 第二次点击，执行操作
      pendingDecrease.value[attrName] = 0;
      executeDecrease(attrName);
    }
  } else {
    // 普通操作，直接执行
    executeDecrease(attrName);
  }
};

// 执行减少
const executeDecrease = (attrName) => {
  const currentValue = getCurrentAttributeValue(attrName);
  const range = getEffectiveRange(attrName);
  const min = range.min !== undefined ? range.min : 0;
  
  if (currentValue > min) {
    const newAttrs = { 
      ...props.attributes, 
      [attrName]: currentValue - 1 
    };
    emit("update:attributes", newAttrs);
  }
};

// 处理增加操作
const handleIncrease = (attrName) => {
  const state = getIncreaseButtonState(attrName);
  
  if (state === 'disabled') {
    if (remainingPoints.value <= 0) {
      ElMessage.warning("没有足够的属性点");
    } else {
      ElMessage.warning("单项属性上限为 " + props.attributeLimit + " 点");
    }
    return;
  }
  
  if (state === 'danger') {
    // 需要确认的操作
    if (!pendingIncrease.value[attrName]) {
      // 第一次点击，标记为待确认
      pendingIncrease.value[attrName] = 1;
      // 2秒后重置
      setTimeout(() => {
        if (pendingIncrease.value[attrName] === 1) {
          pendingIncrease.value[attrName] = 0;
        }
      }, 2000);
      return;
    } else if (pendingIncrease.value[attrName] === 1) {
      // 第二次点击，执行操作
      pendingIncrease.value[attrName] = 0;
      executeIncrease(attrName);
    }
  } else {
    // 普通操作，直接执行
    executeIncrease(attrName);
  }
};

// 执行增加
const executeIncrease = (attrName) => {
  const currentValue = getCurrentAttributeValue(attrName);
  const range = getEffectiveRange(attrName);
  const max = range.max !== undefined ? range.max : props.attributeLimit;
  
  if (currentValue < max && remainingPoints.value > 0) {
    const newAttrs = { 
      ...props.attributes, 
      [attrName]: currentValue + 1 
    };
    emit("update:attributes", newAttrs);
  }
};
</script>

<style lang="scss" scoped>
// 赛博朋克配色
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;
$cyber-darker: #050508;
$cyber-red: #ff5252;

.attribute-allocator {
  width: 100%;
}

.attribute-section {
  width: 100%;
}

.attribute-source-info {
  margin-bottom: 12px;
  padding: 6px 10px;
  background: rgba(0, 243, 255, 0.05);
  border-left: 2px solid rgba(0, 243, 255, 0.3);
  font-size: 12px;
  color: rgba(0, 243, 255, 0.7);
  font-family: "Courier New", "Consolas", monospace;
}

.attribute-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }

  // 可展开模式样式
  .collapsible & {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    margin-bottom: 8px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba($cyber-cyan, 0.1);
    border-radius: 4px;
    overflow: hidden;

    &.expanded {
      border-color: rgba($cyber-cyan, 0.3);
    }

    &.has-value {
      background: rgba($cyber-cyan, 0.05);
    }
  }
}

// 可展开模式的头部
.attribute-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba($cyber-cyan, 0.05);
  }
}

// 可展开模式的摘要区
.attribute-summary {
  display: flex;
  align-items: center;
  gap: 8px;

  .attribute-value {
    font-size: 18px;
    font-weight: bold;
    color: $cyber-cyan;
    font-family: "Courier New", monospace;
    min-width: 24px;
    text-align: center;

    &.has-modifier {
      color: #ffd700;
    }

    &.out-of-range {
      color: $cyber-red;
    }
  }

  .expand-icon {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }
}

.attribute-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-family: "Courier New", "Consolas", monospace;
}

.attribute-controls {
  display: flex;
  align-items: center;
  gap: 12px;

  // 可展开模式的控制区样式
  .collapsible .attribute-row.expanded & {
    padding: 12px;
    padding-top: 0;
    border-top: 1px solid rgba($cyber-cyan, 0.1);
    background: rgba(0, 0, 0, 0.1);
  }
}

.attr-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: transparent;
  position: relative;

  // 活跃状态（普通范围）
  &.active {
    background: rgba(0, 243, 255, 0.15);
    border-color: rgba(0, 243, 255, 0.4);
    color: $cyber-cyan;

    &:hover {
      background: rgba(0, 243, 255, 0.25);
      border-color: $cyber-cyan;
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
    }
  }

  // 禁用状态
  &.disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }

  // 危险状态（需要确认）- 和disabled看起来一模一样，但可点击
  &.danger {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
}

@keyframes pulse-danger {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 82, 82, 0.1);
  }
}

.attribute-value {
  min-width: 24px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: $cyber-cyan;
  font-family: "Courier New", "Consolas", monospace;
  transition: all 0.3s ease;

  &.out-of-range {
    color: $cyber-red;
    text-shadow: 0 0 10px rgba(255, 82, 82, 0.5);
  }
}

// 空位（预留，可装下"+1"）
.extra-slot {
  min-width: 24px;
  text-align: center;
  font-family: "Courier New", "Consolas", monospace;
}

// 调整值显示
.modifier-value {
  min-width: 24px;
  text-align: center;
  font-family: "Courier New", "Consolas", monospace;
  font-size: 14px;
  font-weight: 600;
  color: #00f3ff;
  text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
}

// Tip内容样式
.tip-content {
  max-width: 400px;
  
  .tip-effects {
    color: $cyber-cyan;
    font-weight: 600;
    margin-bottom: 8px;
    line-height: 1.6;
    white-space: pre-line;
  }
  
  .tip-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    line-height: 1.6;
  }
}

.info-icon-small {
  font-size: 14px;
  color: rgba(0, 243, 255, 0.5);
  cursor: help;
  transition: all 0.3s ease;

  &:hover {
    color: $cyber-cyan;
  }
}

// 只读属性样式
.attribute-value.readonly {
  color: #ffd700;
  font-weight: bold;
}

.readonly-hint {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(#ffd700, 0.15);
  border: 1px solid rgba(#ffd700, 0.3);
  border-radius: 4px;
  color: #ffd700;
  margin-left: 4px;
}
</style>
