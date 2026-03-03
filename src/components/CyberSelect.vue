<template>
  <div ref="cyberSelectRef" class="cyber-select" :class="{ open: isOpen }">
    <!-- 输入框区域 -->
    <div class="cyber-select-input" @click="toggleDropdown">
      <span v-if="modelValue" class="selected-value">{{ modelValue }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <el-icon v-if="clearable && modelValue" class="clear-icon" @click.stop="clearValue">
        <CircleClose />
      </el-icon>
      <el-icon class="arrow-icon" :class="{ rotated: isOpen }">
        <ArrowDown />
      </el-icon>
    </div>
  </div>

  <!-- 下拉列表 - 传送到 body 实现漂浮效果 -->
  <teleport to="body">
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="cyber-select-dropdown"
      :style="dropdownPosition"
    >
      <div
        v-for="item in options"
        :key="item.value"
        class="cyber-select-option"
        :class="{ selected: item.value === modelValue }"
        @click="selectOption(item)"
      >
        <div class="option-main">{{ item.label }}</div>
        <div v-if="item.extra" class="option-sub">{{ item.extra }}</div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ArrowDown, CircleClose } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  clearable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const cyberSelectRef = ref(null);
const dropdownRef = ref(null);
const dropdownPosition = ref({});

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!cyberSelectRef.value) return;

  const rect = cyberSelectRef.value.getBoundingClientRect();

  dropdownPosition.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    'z-index': '9999'
  };
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const selectOption = (item) => {
  emit('update:modelValue', item.value);
  emit('change', item.value);
  closeDropdown();
};

const clearValue = () => {
  emit('update:modelValue', '');
  emit('change', '');
};

// 点击外部关闭下拉框
const handleClickOutside = (e) => {
  if (cyberSelectRef.value && !cyberSelectRef.value.contains(e.target)) {
    closeDropdown();
  }
  // 也检查是否点击在下拉框上
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) && cyberSelectRef.value && !cyberSelectRef.value.contains(e.target)) {
    closeDropdown();
  }
};

// 滚动时关闭下拉框并更新位置
const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', handleScroll);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', handleScroll);
});
</script>

<style lang="scss">
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;
$cyber-darker: #050508;

.cyber-select {
  position: relative;
  width: 100%;
  flex: 1;
}

.cyber-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 40px;
  box-sizing: border-box;

  &:hover {
    border-color: rgba(0, 243, 255, 0.4);
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.1);
  }
}

.cyber-select.open .cyber-select-input {
  border-color: $cyber-cyan;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
}

.selected-value,
.placeholder {
  flex: 1;
  font-size: 14px;
  color: #fff;
  font-family: 'Courier New', 'Consolas', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.clear-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
  margin-right: 8px;
  transition: color 0.3s ease;

  &:hover {
    color: $cyber-cyan;
  }
}

.arrow-icon {
  font-size: 16px;
  color: $cyber-cyan;
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.cyber-select-dropdown {
  max-height: 240px;
  overflow-y: auto;
  background: rgba(10, 10, 15, 0.98);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 243, 255, 0.15);
  padding: 4px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(10, 10, 15, 0.5);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 243, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 243, 255, 0.5);
    }
  }
}

.cyber-select-option {
  display: flex;
  flex-direction: column;  // 纵向排列
  gap: 4px;                // 两行之间的间距
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  .option-main {
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Courier New', 'Consolas', monospace;
    font-size: 14px;
    white-space: nowrap;      // 不换行
    overflow: hidden;         // 溢出隐藏
    text-overflow: ellipsis;  // 显示省略号
  }

  .option-sub {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-family: 'Courier New', 'Consolas', monospace;
    white-space: nowrap;      // 不换行
    overflow: hidden;         // 溢出隐藏
    text-overflow: ellipsis;  // 显示省略号
  }

  &:hover {
    background-color: rgba(0, 243, 255, 0.15);

    .option-main,
    .option-sub {
      color: #fff;
    }
  }

  &.selected {
    background-color: rgba(0, 243, 255, 0.1);

    .option-main {
      color: $cyber-cyan;
      font-weight: 700;
    }
  }
}
</style>
