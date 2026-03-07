<!--
  组件：ScarList
  功能：伤痕列表，可展开，最多6个，使用 el-collapse 样式
-->
<template>
  <div class="scar-list">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="scars">
        <template #title>
          <div class="collapse-title">
            <div class="title-left">
              <span class="hp-display">HP {{ hpCurrent }}/{{ hpMax }}</span>
            </div>
            <div class="title-center">
              <span class="scar-title">伤痕</span>
              <span class="scar-count">({{ modelValue.length }}/6)</span>
            </div>
            <span class="dropdown-arrow">▼</span>
          </div>
        </template>

        <div class="scar-content">
          <div v-for="(scar, index) in modelValue" :key="scar.id" class="scar-item">
            <!-- 第一行：属性、值、tip、状态框、删除按钮 -->
            <div class="scar-row first-row">
              <button
                class="attr-toggle"
                :class="{ active: scar.attrActive }"
                @click.stop="toggleAttr(index)"
              >
                {{ scar.attrActive ? 'ON' : 'OFF' }}
              </button>

              <!-- 数值调整组件 -->
              <div class="number-control">
                <input
                  v-model.number="scar.value"
                  type="number"
                  class="scar-input value-input"
                  placeholder="0"
                  @wheel.prevent="handleWheel($event, index)"
                />
                <div class="num-arrows">
                  <button class="arrow-btn up" @click.stop="increaseValue(index)">▲</button>
                  <button class="arrow-btn down" @click.stop="decreaseValue(index)">▼</button>
                </div>
              </div>

              <TipButton level="1" :content="scar.tip || '暂无提示'" />

              <select v-model="scar.status" class="scar-select" @click.stop>
                <option value="active">生效中</option>
                <option value="suppressed">被抑制</option>
                <option value="healing">恢复中</option>
              </select>

              <button class="delete-btn" @click.stop="removeScar(index)">×</button>
            </div>

            <!-- 第二行：效果描述 -->
            <div class="scar-row second-row">
              <input
                v-model="scar.description"
                type="text"
                class="scar-input description-input"
                placeholder="效果描述"
              />
            </div>
          </div>

          <!-- 添加按钮或提示 -->
          <div v-if="modelValue.length < 6" class="add-section">
            <button class="add-btn" @click="addScar">添加伤痕</button>
          </div>
          <div v-else class="merge-hint">
            建议合并伤痕
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TipButton from './TipButton.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  hpCurrent: {
    type: Number,
    default: 0
  },
  hpMax: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

// 默认不展开
const activeNames = ref([])

let scarIdCounter = 0

const addScar = () => {
  if (props.modelValue.length >= 6) return

  const newScar = {
    id: ++scarIdCounter,
    attrActive: false,
    value: 0,
    tip: '',
    status: 'active',
    description: ''
  }

  emit('update:modelValue', [...props.modelValue, newScar])
}

const removeScar = (index) => {
  const newScars = [...props.modelValue]
  newScars.splice(index, 1)
  emit('update:modelValue', newScars)
}

const toggleAttr = (index) => {
  const newScars = [...props.modelValue]
  newScars[index].attrActive = !newScars[index].attrActive
  emit('update:modelValue', newScars)
}

const increaseValue = (index) => {
  const newScars = [...props.modelValue]
  newScars[index].value = (newScars[index].value || 0) + 1
  emit('update:modelValue', newScars)
}

const decreaseValue = (index) => {
  const newScars = [...props.modelValue]
  newScars[index].value = Math.max(0, (newScars[index].value || 0) - 1)
  emit('update:modelValue', newScars)
}

const handleWheel = (event, index) => {
  if (event.deltaY < 0) {
    increaseValue(index)
  } else {
    decreaseValue(index)
  }
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.scar-list {
  margin-top: 20px;

  :deep(.el-collapse) {
    border: none;
    background: transparent;

    .el-collapse-item__header {
      background: transparent;
      border: none;
      border-radius: 4px;
      padding: 0 16px;
      color: $cyber-cyan;
      font-size: 14px;
    }

    .el-collapse-item__wrap {
      background: transparent;
      border: none;
    }

    .el-collapse-item__content {
      padding: 16px 0 0 0;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.collapse-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;

  .title-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .title-center {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: center;
  }

  .hp-display {
    color: #ff4757;
    font-size: 16px;
    font-weight: bold;
    font-family: "Courier New", "Consolas", monospace;
  }

  .dropdown-arrow {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s ease;
  }
}

// 展开时箭头旋转
:deep(.el-collapse-item.is-active) {
  .dropdown-arrow {
    transform: rotate(180deg);
  }
}

.scar-title {
  color: $cyber-cyan;
  font-size: 14px;
  font-weight: 600;
}

.scar-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.scar-content {
  padding: 12px 0;
}

.scar-item {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.scar-row {
  display: flex;
  align-items: center;
  gap: 8px;

  &.first-row {
    margin-bottom: 8px;
  }

  &.second-row {
    .description-input {
      flex: 1;
    }
  }
}

.attr-toggle {
  width: 46px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    background: rgba($cyber-cyan, 0.2);
    border-color: $cyber-cyan;
    color: $cyber-cyan;
  }
}

// 数值调整组件
.number-control {
  display: flex;
  align-items: center;
  position: relative;

  .value-input {
    width: 44px;
    height: 26px;
    padding: 0 18px 0 0;
    text-align: center;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba($cyber-cyan, 0.2);
    border-radius: 4px;
    color: #fff;
    font-size: 13px;

    // 隐藏原生上下调整按钮
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;

    &:focus {
      outline: none;
      border-color: rgba($cyber-cyan, 0.5);

      & + .num-arrows {
        opacity: 1;
      }
    }
  }

  .num-arrows {
    position: absolute;
    right: 1px;
    top: 1px;
    bottom: 1px;
    width: 16px;
    display: flex;
    flex-direction: column;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    .arrow-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba($cyber-cyan, 0.15);
      border: none;
      color: $cyber-cyan;
      font-size: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
      line-height: 1;

      &:hover {
        background: rgba($cyber-cyan, 0.3);
      }

      &:active {
        background: rgba($cyber-cyan, 0.4);
      }

      &.up {
        border-radius: 0 3px 0 0;
        border-bottom: 1px solid rgba($cyber-cyan, 0.1);
      }

      &.down {
        border-radius: 0 0 3px 0;
      }
    }
  }

  &:hover .num-arrows {
    opacity: 1;
  }
}

.scar-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($cyber-cyan, 0.2);
  border-radius: 4px;
  padding: 5px 10px;
  color: #fff;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: rgba($cyber-cyan, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
}

.scar-select {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($cyber-cyan, 0.2);
  border-radius: 4px;
  padding: 5px 10px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba($cyber-cyan, 0.5);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
}

.delete-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 4px;
  color: rgba(255, 71, 87, 0.8);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 71, 87, 0.2);
    border-color: rgba(255, 71, 87, 0.5);
    color: #ff4757;
  }
}

.add-section {
  margin-top: 12px;
  text-align: center;
}

.add-btn {
  padding: 8px 20px;
  background: rgba($cyber-cyan, 0.1);
  border: 1px solid rgba($cyber-cyan, 0.3);
  border-radius: 4px;
  color: $cyber-cyan;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($cyber-cyan, 0.2);
    border-color: rgba($cyber-cyan, 0.5);
  }
}

.merge-hint {
  margin-top: 12px;
  padding: 8px;
  text-align: center;
  color: rgba(255, 193, 7, 0.8);
  font-size: 13px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 4px;
}
</style>
