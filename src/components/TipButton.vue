<!--
  组件：TipButton
  功能：带提示的按钮，支持3级显眼程度
  用法：
    <TipButton level="3" content="提示内容">按钮文字</TipButton>
-->
<template>
  <el-tooltip
    placement="top"
    :disabled="!hasContent"
    popper-class="tip-popper"
    raw-content
  >
    <template #content>
      <!-- 优先使用 htmlContent，否则将 content 作为 HTML 渲染 -->
      <div v-if="htmlContent" v-html="htmlContent"></div>
      <div v-else v-html="parsedContent"></div>
    </template>
    <span class="tip-button" :class="`level-${level}`">
      <slot />
      <el-icon v-if="showIcon" class="tip-icon"><InfoFilled /></el-icon>
    </span>
  </el-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  // 提示内容（纯文本）
  content: {
    type: String,
    default: ''
  },
  // HTML提示内容
  htmlContent: {
    type: String,
    default: ''
  },
  // 显眼程度：1-3，3最显眼
  level: {
    type: [Number, String],
    default: 1,
    validator: (val) => {
      const num = typeof val === 'string' ? parseInt(val) : val
      return [1, 2, 3].includes(num)
    }
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  }
})

// 是否有内容
const hasContent = computed(() => {
  return props.content || props.htmlContent
})

// 解析 [AUTO] 和 [MANUAL] 标记
const parsedContent = computed(() => {
  if (!props.content) return ''
  
  let text = props.content
  
  // 解析 [AUTO] 标记 -> 青色
  text = text.replace(/\[AUTO\](.*?)(?=\[|$)/g, '<span class="effect-auto">$1</span>')
  
  // 解析 [MANUAL] 标记 -> 橙色
  text = text.replace(/\[MANUAL\](.*?)(?=\[|$)/g, '<span class="effect-manual">$1</span>')
  
  return text
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.tip-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  .tip-icon {
    font-size: 14px;
    transition: all 0.3s ease;
  }

  // 1级：最不显眼
  &.level-1 {
    color: rgba(255, 255, 255, 0.5);

    .tip-icon {
      color: rgba(0, 243, 255, 0.4);
    }

    &:hover .tip-icon {
      color: $cyber-cyan;
    }
  }

  // 2级：中等显眼
  &.level-2 {
    color: rgba(255, 255, 255, 0.8);

    .tip-icon {
      color: rgba(0, 243, 255, 0.7);
    }

    &:hover .tip-icon {
      color: $cyber-cyan;
      transform: scale(1.1);
    }
  }

  // 3级：最显眼
  &.level-3 {
    color: #fff;
    font-weight: 600;

    .tip-icon {
      color: $cyber-cyan;
      font-size: 18px;
      filter: drop-shadow(0 0 6px rgba(0, 243, 255, 0.5));
    }

    &:hover .tip-icon {
      transform: scale(1.2);
      filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.8));
    }
  }
}

// 全局样式：控制 tip 弹窗的最大宽度
:global(.tip-popper) {
  max-width: 400px !important;
  white-space: pre-line !important;  // 支持换行符

  @media (max-width: 768px) {
    max-width: 280px !important;
  }
}

// Element Plus tooltip 内容样式
:global(.el-tooltip__popper) {
  &.tip-popper {
    max-width: 400px !important;
    line-height: 1.6 !important;
    white-space: pre-line !important;

    @media (max-width: 768px) {
      max-width: 280px !important;
    }

    // 确保内容区域也支持换行
    .el-popper__content {
      white-space: pre-line !important;
    }
    
    // 自动计算效果 - 青色
    .effect-auto {
      color: #00f3ff;
      font-weight: 500;
    }
    
    // 需手动调整效果 - 橙色
    .effect-manual {
      color: #ff9f43;
      font-style: italic;
    }
  }
}
</style>
