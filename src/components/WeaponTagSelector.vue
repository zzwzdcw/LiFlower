<!--
  尖端武装词条选择器
  功能：选择武装限制词条，不可重复
-->
<template>
  <div class="weapon-tag-selector">
    <!-- 词条列表 -->
    <div class="tag-list">
      <div
        v-for="(tag, index) in selectedTags"
        :key="index"
        class="tag-row"
      >
        <!-- 词条选择下拉框（2个汉字宽度） -->
        <div class="tag-select-wrapper">
          <CyberSelect
            v-model="selectedTags[index]"
            :options="availableTagOptions(index)"
            placeholder="选择"
            class="tag-select"
          />
        </div>
        
        <!-- Tip按钮 -->
        <TipButton
          v-if="getTagInfo(selectedTags[index])"
          level="2"
          :content="getTagInfo(selectedTags[index])?.description || ''"
        />
        
        <!-- 效果文本 -->
        <span v-if="getTagInfo(selectedTags[index])" class="tag-effect">
          {{ getTagInfo(selectedTags[index])?.effect }}
        </span>
      </div>
    </div>
    
    <!-- 增加词条按钮 -->
    <div v-if="canAddMore" class="add-tag-row">
      <button class="add-tag-btn" @click="addTag">
        <span class="add-icon">+</span>
        <span>增加词条</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CyberSelect from './CyberSelect.vue'
import TipButton from './TipButton.vue'
import tagData from '@/data/advancedWeaponTags.json'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['']
  }
})

const emit = defineEmits(['update:modelValue'])

// 选中的词条列表
const selectedTags = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 所有词条选项
const allTagOptions = computed(() => {
  return tagData.tags.map(tag => ({
    label: tag.name,
    value: tag.id
  }))
})

// 获取词条信息
const getTagInfo = (tagId) => {
  if (!tagId) return null
  return tagData.tags.find(t => t.id === tagId)
}

// 获取可用的词条选项（排除已选择的）
const availableTagOptions = (currentIndex) => {
  const currentId = selectedTags.value[currentIndex]
  
  return allTagOptions.value.map(option => {
    // 检查是否已被其他位置选择
    const isUsedElsewhere = selectedTags.value.some((id, idx) => 
      idx !== currentIndex && id === option.value
    )
    
    return {
      ...option,
      disabled: isUsedElsewhere && option.value !== currentId
    }
  })
}

// 是否可以添加更多词条
const canAddMore = computed(() => {
  // 检查是否还有未选择的词条
  const usedTags = selectedTags.value.filter(id => id)
  return usedTags.length < tagData.tags.length
})

// 添加词条
const addTag = () => {
  selectedTags.value.push('')
}
</script>

<style lang="scss" scoped>
@use '@/styles/input-styles.scss' as *;

$cyber-cyan: #00f3ff;

.weapon-tag-selector {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

// 词条选择下拉框外层容器（固定宽度）
.tag-select-wrapper {
  flex: 0 0 70px;
  width: 70px;
  max-width: 70px;
  min-width: 70px;
  overflow: hidden;
}

// 词条选择下拉框
.tag-select {
  width: 100%;
}

// 效果文本（使用全局样式）
.tag-effect {
  @extend .cyber-effect-text;
  flex: 1;
  margin: 0;
  margin-left: 4px;
}

// 添加按钮行
.add-tag-row {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 243, 255, 0.2);
}

.add-tag-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 243, 255, 0.05);
  border: 1px dashed rgba(0, 243, 255, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  .add-icon {
    color: $cyber-cyan;
    font-size: 16px;
    font-weight: bold;
  }

  &:hover {
    background: rgba(0, 243, 255, 0.1);
    border-color: $cyber-cyan;
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
