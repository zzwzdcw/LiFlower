<template>
  <div class="attribute-allocator">
    <el-divider v-if="showDivider" />
    <el-form-item label="属性点分配">
      <div class="attribute-section">
        <div class="attribute-points-info">
          <span>可用属性点：<span class="points-highlight">{{ 剩余属性点 }}</span> / {{ 总属性点 }}</span>
        </div>

        <div v-for="属性名 in 属性顺序" :key="属性名" class="attribute-row">
          <div class="attribute-label">
            <span>{{ 属性名 }}</span>
            <el-tooltip :content="获取属性描述 (属性名)" placement="top" :disabled="!获取属性描述 (属性名)">
              <el-icon class="info-icon-small"><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="attribute-controls">
            <el-button size="small" :disabled="!可以减少属性 (属性名)" @click="减少属性 (属性名)" class="attr-btn">
              <el-icon><Minus /></el-icon>
            </el-button>
            <span class="attribute-value">{{ 当前属性值 (属性名) }}</span>
            <el-button size="small" :disabled="!可以增加属性 (属性名)" @click="增加属性 (属性名)" class="attr-btn">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Minus, InfoFilled } from "@element-plus/icons-vue";

const props = defineProps({
  属性点：{
    type: Number,
    default: 0,
  },
  属性上限：{
    type: Number,
    default: 5,
  },
  属性：{
    type: Object,
    default: () => ({ 结构：0, 力量：0, 运动：0, 算力：0, 信息：0, 功率：0 }),
  },
  属性列表：{
    type: Object,
    default: () => ({}),
  },
  showDivider: {
    type: Boolean,
    default: true,
  },
});

const 属性顺序 = ["结构", "力量", "运动", "算力", "信息", "功率"];

const emit = defineEmits(["update:属性"]);

// 计算已分配属性点
const 已分配属性点 = computed(() => {
  return Object.values(props.属性).reduce((sum, val) => sum + val, 0);
});

// 计算剩余可分配属性点
const 剩余属性点 = computed(() => {
  return props.属性点 - 已分配属性点.value;
});

// 获取当前属性值
const 当前属性值 = (属性名) => {
  return props.属性 [属性名] || 0;
};

// 检查属性是否可以增加
const 可以增加属性 = (属性名) => {
  const 当前值 = props.属性 [属性名] || 0;
  return 当前值 < props.属性上限 && 剩余属性点.value > 0;
};

// 检查属性是否可以减少
const 可以减少属性 = (属性名) => {
  return (props.属性 [属性名] || 0) > 0;
};

// 增加属性
const 增加属性 = (属性名) => {
  if (可以增加属性 (属性名)) {
    const newAttrs = { ...props.属性，[属性名]: (props.属性 [属性名] || 0) + 1 };
    emit("update:属性", newAttrs);
  } else {
    const 当前值 = props.属性 [属性名] || 0;
    if (当前值 >= props.属性上限) {
      ElMessage.warning("单项属性上限为 5 点");
    } else {
      ElMessage.warning("没有足够的属性点");
    }
  }
};

// 减少属性
const 减少属性 = (属性名) => {
  if (可以减少属性 (属性名)) {
    const newAttrs = { ...props.属性，[属性名]: (props.属性 [属性名] || 0) - 1 };
    emit("update:属性", newAttrs);
  }
};

// 获取属性描述
const 获取属性描述 = (属性名) => {
  const attr = props.属性列表 [属性名];
  return attr ? attr.描述："";
};
</script>

<style lang="scss" scoped>
// 赛博朋克配色
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;
$cyber-darker: #050508;

.attribute-allocator {
  width: 100%;
}

.attribute-section {
  width: 100%;
}

.attribute-points-info {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(0, 243, 255, 0.08);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-family: "Courier New", "Consolas", monospace;

  .points-highlight {
    color: $cyber-cyan;
    font-weight: 700;
    font-size: 16px;
  }
}

.attribute-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 243, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
}

.attribute-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: "Microsoft YaHei", sans-serif;
}

.attribute-controls {
  display: flex;
  align-items: center;
  gap: 8px;

  .attribute-value {
    min-width: 24px;
    text-align: center;
    color: $cyber-cyan;
    font-size: 16px;
    font-weight: 700;
    font-family: "Courier New", "Consolas", monospace;
  }

  .attr-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: rgba(0, 243, 255, 0.3);
    background: rgba(0, 243, 255, 0.05);
    color: $cyber-cyan;

    &:hover:not(:disabled) {
      background: rgba(0, 243, 255, 0.15);
      border-color: $cyber-cyan;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}

// 小信息图标
.info-icon-small {
  color: rgba(0, 243, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $cyber-cyan;
  }
}
</style>
