<!--
  数据展示单元组件
  功能：展示单个数据条目，格式：【数据项目】：【名称】【内容】
  特点：无边框、无分隔样式，所有部分可隐藏
-->
<template>
  <div class="data-display-item">
    <span v-if="showLabel && label" class="data-label">{{ label }}</span>
    <span v-if="showLabel && label && (showName || showContent)" class="data-separator">：</span>
    <span v-if="showName && name" class="data-name">{{ name }}</span>
    <span v-if="showName && name && showContent && content" class="data-separator">：</span>
    <span v-if="showContent && content" class="data-content" v-html="content"></span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  showName: {
    type: Boolean,
    default: true
  },
  showContent: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped>
.data-display-item {
  display: inline;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.data-label {
  color: rgba(255, 255, 255, 0.6);
  font-family: "Courier New", monospace;
}

.data-separator {
  color: rgba(255, 255, 255, 0.4);
  margin: 0 2px;
}

.data-name {
  color: #fff;
  font-weight: 500;
}

.data-content {
  color: rgba(255, 255, 255, 0.8);
  margin-left: 4px;
}
</style>
