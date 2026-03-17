<!--
  专长条目组件
  功能：单个专长的表单输入（紧凑布局，带删除按钮）
-->
<template>
  <div class="talent-item">
    <!-- 第一行：专长名称 + 关联技能 + 删除按钮 -->
    <div class="form-row name-skill-row">
      <el-input
        v-model="localData.name"
        placeholder="专长名称"
        class="cyber-input-short name-input"
      />
      <CyberSelect
        v-model="localData.skill"
        placeholder="关联技能"
        :options="skillOptions"
        class="cyber-select skill-select"
      />
      <button
        v-if="showDeleteButton"
        class="delete-btn"
        :title="hasContent ? '清空内容' : '移除专长'"
        @click="handleDelete"
      >
        <span class="delete-icon">🗑️</span>
      </button>
    </div>

    <!-- 第二行：限制条件（根据关联技能显示/隐藏） -->
    <div v-if="showLimitation" class="form-row">
      <el-input
        v-model="localData.limitation"
        :placeholder="limitationPlaceholder"
        class="cyber-input-short"
      />
    </div>

    <!-- 第三行：专长描述（只有输入了名称才显示） -->
    <div v-if="showDescription" class="form-row">
      <el-input
        v-model="localData.description"
        type="textarea"
        :rows="3"
        placeholder="专长描述..."
        class="cyber-input-long"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CyberSelect from './CyberSelect.vue'
import skillsData from '@/data/skills.json'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      skill: '',
      limitation: '',
      description: ''
    })
  },
  index: {
    type: Number,
    required: true
  },
  showDeleteButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'delete', 'clear'])

// 本地数据
const localData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 是否有内容
const hasContent = computed(() => {
  return !!localData.value.name || 
         !!localData.value.skill || 
         !!localData.value.limitation || 
         !!localData.value.description
})

// 处理删除按钮点击
const handleDelete = () => {
  if (hasContent.value) {
    // 有内容则清空
    emit('clear')
  } else {
    // 无内容则移除
    emit('delete')
  }
}

// 是否显示限制条件输入框
const showLimitation = computed(() => {
  return !!localData.value.skill
})

// 限制条件输入框的placeholder
const limitationPlaceholder = computed(() => {
  if (localData.value.skill === 'special') {
    return '描述擅长处理的特殊情况类型'
  }
  return '描述限制条件'
})

// 是否显示专长描述输入框
const showDescription = computed(() => {
  return !!localData.value.name.trim()
})

// 技能选项（排除人性ID=16，添加特殊对策）
const skillOptions = computed(() => {
  const options = [
    { label: '特殊对策', value: 'special' }
  ]
  
  skillsData
    .filter(skill => skill.id !== 16)
    .forEach(skill => {
      options.push({
        label: skill.name,
        value: skill.id.toString()
      })
    })
  
  return options
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-red: #ff5252;

.talent-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 243, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  .form-row {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 第一行：名称、技能、删除按钮并排
  .name-skill-row {
    display: flex;
    gap: 8px;
    align-items: center;

    .name-input {
      flex: 1.2;
    }

    .skill-select {
      flex: 0.8;
    }

    .delete-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 82, 82, 0.1);
      border: 1px solid rgba(255, 82, 82, 0.3);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;

      .delete-icon {
        font-size: 14px;
        opacity: 0.7;
        transition: all 0.3s ease;
      }

      &:hover {
        background: rgba(255, 82, 82, 0.2);
        border-color: rgba(255, 82, 82, 0.5);
        box-shadow: 0 0 8px rgba(255, 82, 82, 0.3);

        .delete-icon {
          opacity: 1;
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // CyberSelect 样式调整
  :deep(.cyber-select) {
    width: 100%;
  }
}
</style>
