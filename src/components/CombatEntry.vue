<!--
  组件名称：CombatEntry
  功能：战斗/检定数据条目单元 - 支持简略/详细模式
  属性：
    - name: 项目名称
    - value: 最终数值
    - attributeBonus: 属性加成
    - skillBonus: 技能加成
    - skillName: 技能名称
    - toolBonus: 工具加成
    - toolName: 工具名称
    - hasSpecialization: 是否有专精按钮
    - specializationActive: 专精是否激活
    - advantageActive: 优势是否激活
    - isCompact: 是否为简略模式
    - description: 项目描述（用于tip）
    - showTool: 是否显示工具列（默认true）
    - showButtons: 是否显示按钮（默认true）
  事件：
    - update:toolBonus: 更新工具加值
    - toggle-specialization: 切换专精状态
    - toggle-advantage: 切换优势状态
-->
<template>
  <!-- 简略模式 -->
  <div v-if="isCompact" class="combat-entry compact">
    <div class="compact-info">
      <span class="compact-name">
        <TipButton level="1" :content="description" :show-icon="false">{{ name }}</TipButton>
      </span>
      <span class="compact-value">{{ value > 0 ? '+' : '' }}{{ value }}</span>
    </div>
    <div v-if="showButtons" class="compact-btns">
      <button
        v-if="hasSpecialization"
        class="compact-btn"
        :class="{ 'active': specializationActive }"
        @click="$emit('toggle-specialization')"
        title="专精"
      >
        +
      </button>
      <span v-else class="compact-placeholder"></span>
      <button
        class="compact-btn"
        :class="{ 'active': advantageActive }"
        @click="$emit('toggle-advantage')"
        title="优势"
      >
        +
      </button>
    </div>
  </div>

  <!-- 详细模式 -->
  <div v-else class="combat-entry detailed">
    <!-- 项目名称 -->
    <div class="col col-name">
      <TipButton level="1" :content="description" :show-icon="false">{{ name }}</TipButton>
    </div>

    <!-- 检定值 -->
    <div class="col col-value">{{ value > 0 ? '+' : '' }}{{ value }}</div>

    <!-- 等号 -->
    <div class="col col-operator">=</div>

    <!-- 属性 -->
    <div class="col col-bonus">{{ attributeBonus > 0 ? '+' : '' }}{{ attributeBonus }}</div>

    <!-- 加号 -->
    <div class="col col-operator">+</div>

    <!-- 技能 -->
    <div class="col col-bonus">
      <template v-if="skillName === '-' || skillName === ''">-</template>
      <template v-else>{{ skillBonus > 0 ? '+' : '' }}{{ skillBonus }}</template>
    </div>

    <!-- 加号 -->
    <div class="col col-operator" v-if="showTool">+</div>

    <!-- 工具加值（可编辑文本框） -->
    <div v-if="showTool" class="col col-tool">
      <input
        type="number"
        :value="toolBonus"
        @input="$emit('update:toolBonus', parseInt($event.target.value) || 0)"
        class="tool-input"
        placeholder="0"
      />
    </div>

    <!-- 专精按钮 -->
    <div v-if="showButtons" class="col col-btn">
      <button
        v-if="hasSpecialization"
        class="icon-btn"
        :class="{ 'active': specializationActive }"
        @click="$emit('toggle-specialization')"
        title="专精"
      >
        +
      </button>
      <span v-else class="placeholder"></span>
    </div>

    <!-- 优势按钮 -->
    <div v-if="showButtons" class="col col-btn">
      <button
        class="icon-btn"
        :class="{ 'active': advantageActive }"
        @click="$emit('toggle-advantage')"
        title="优势"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup>
import TipButton from './TipButton.vue'

defineProps({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  attributeBonus: {
    type: Number,
    default: 0
  },
  skillBonus: {
    type: Number,
    default: 0
  },
  skillName: {
    type: String,
    default: ''
  },
  toolBonus: {
    type: Number,
    default: 0
  },
  toolName: {
    type: String,
    default: ''
  },
  hasSpecialization: {
    type: Boolean,
    default: false
  },
  specializationActive: {
    type: Boolean,
    default: false
  },
  advantageActive: {
    type: Boolean,
    default: false
  },
  isCompact: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  showTool: {
    type: Boolean,
    default: true
  },
  showButtons: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:toolBonus', 'toggle-specialization', 'toggle-advantage'])
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

// ========== 简略模式 ==========
.combat-entry.compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid rgba($cyber-cyan, 0.1);
  font-size: 12px;
  width: 50%;
  box-sizing: border-box;
  gap: 4px;

  &:hover {
    background: rgba($cyber-cyan, 0.03);
  }

  .compact-info {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .compact-name {
    color: #fff;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 40px;

    :deep(.tip-button) {
      color: #fff !important;
    }
  }

  .compact-value {
    color: $cyber-cyan;
    font-weight: 700;
    font-family: "Courier New", monospace;
    font-size: 13px;
    flex-shrink: 0;
    width: 30px;
    text-align: center;
  }

  .compact-btns {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .compact-btn {
    width: 24px;
    height: 22px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: rgba(255, 255, 255, 0.5);
      color: rgba(255, 255, 255, 0.8);
    }

    &.active {
      background: rgba($cyber-cyan, 0.3);
      border-color: $cyber-cyan;
      color: #fff;
    }
  }

  .compact-placeholder {
    width: 24px;
    height: 22px;
  }
}

// ========== 详细模式 ==========
.combat-entry.detailed {
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba($cyber-cyan, 0.1);
  font-size: 12px;
  gap: 2px;
  width: 100%;

  &:hover {
    background: rgba($cyber-cyan, 0.03);
  }
}

// 列基础样式 - 按比例分配
.col {
  text-align: center;
}

// 项目名称 - 比例 2
.col-name {
  flex: 2;
  min-width: 50px;
  text-align: left;
  color: #fff !important;
  font-weight: 500;

  :deep(.tip-button) {
    color: #fff !important;
  }
}

// 检定值 - 比例 1.5
.col-value {
  flex: 1.5;
  min-width: 35px;
  color: $cyber-cyan;
  font-weight: 700;
  font-family: "Courier New", monospace;
  font-size: 13px;
}

// 运算符 (= +)
.col-operator {
  flex: 0.5;
  min-width: 10px;
  color: rgba(255, 255, 255, 0.4);
}

// 属性/技能数值
.col-bonus {
  flex: 1.2;
  min-width: 30px;
  color: rgba(255, 255, 255, 0.7);
  font-family: "Courier New", monospace;
}

// 工具输入框
.col-tool {
  flex: 1.5;
  min-width: 40px;

  .tool-input {
    width: 90%;
    max-width: 45px;
    height: 22px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba($cyber-cyan, 0.2);
    border-radius: 3px;
    color: #fff;
    text-align: center;
    font-family: "Courier New", monospace;
    font-size: 11px;

    &:focus {
      outline: none;
      border-color: $cyber-cyan;
      box-shadow: 0 0 5px rgba($cyber-cyan, 0.2);
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;
  }
}

// 按钮列
.col-btn {
  flex: 0.8;
  min-width: 24px;
  display: flex;
  justify-content: center;
}

// 图标按钮
.icon-btn {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.8);
  }

  &.active {
    background: rgba($cyber-cyan, 0.3);
    border-color: $cyber-cyan;
    color: #fff;
  }
}

// 占位符
.placeholder {
  width: 22px;
  height: 22px;
}
</style>
