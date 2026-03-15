<!--
  组件：EquipmentSlot
  功能：装备槽组件，分两行展示装备信息
-->
<template>
  <div class="equipment-slot">
    <!-- 第一行：名称、类型、等级加值、删除按钮 -->
    <div class="slot-row first-row">
      <el-input
        v-model="localName"
        placeholder="装备名称"
        class="cyber-input-short name-input"
      />
      <TipButton :level="2" :content="typeTipContent" :show-icon="false">
        <CyberSelect
          v-model="localType"
          :options="typeOptions"
          placeholder="类型"
          class="type-select"
        />
      </TipButton>
      <TipButton :level="2" :content="levelTipContent" :show-icon="false">
        <div class="number-input-wrapper">
          <input
            :value="displayLevel"
            type="text"
            class="number-input"
            placeholder="0"
            readonly
          />
          <div class="num-arrows">
            <button class="arrow-btn up" @click="increaseLevel">▲</button>
            <button class="arrow-btn down" @click="decreaseLevel">▼</button>
          </div>
        </div>
      </TipButton>
      <button class="delete-btn" @click="emit('delete')">×</button>
    </div>
    <!-- 第二行：用途效果描述 -->
    <div class="slot-row second-row">
      <el-input
        v-model="localDescription"
        placeholder="用途效果描述"
        class="cyber-input-short description-input"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElInput } from 'element-plus'
import CyberSelect from './CyberSelect.vue'
import TipButton from './TipButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      type: '',
      level: 0,
      description: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'delete'])

const typeOptions = [
  { label: '改装部件', value: 'mod' },
  { label: '防护武装', value: 'armor' },
  { label: '枪械炸弹', value: 'weapon' },
  { label: '计算机', value: 'computer' },
  { label: '道具', value: 'item' },
  { label: '载具', value: 'vehicle' },
  { label: '其他', value: 'other' }
]

const localName = computed({
  get: () => props.modelValue.name,
  set: (val) => emit('update:modelValue', { ...props.modelValue, name: val })
})

const localType = computed({
  get: () => props.modelValue.type,
  set: (val) => emit('update:modelValue', { ...props.modelValue, type: val })
})

const localLevel = computed({
  get: () => props.modelValue.level,
  set: (val) => emit('update:modelValue', { ...props.modelValue, level: val })
})

const localDescription = computed({
  get: () => props.modelValue.description,
  set: (val) => emit('update:modelValue', { ...props.modelValue, description: val })
})

// 类型对应的 Tip 内容
const typeTipContent = computed(() => {
  const tips = {
    'mod': '改装部件：用于强化人形或装备性能的改造组件',
    'armor': '防护武装：提供防御能力的护甲和盾牌',
    'weapon': '枪械炸弹：各类武器和爆炸物',
    'computer': '计算机：电子设备、黑客工具',
    'item': '道具：各类消耗品和工具',
    'vehicle': '载具：交通工具',
    'other': '其他：无法归类的特殊物品'
  }
  return tips[localType.value] || '请选择装备类型'
})

// 等级 Tip 内容
const levelTipContent = '装备提供的加值\n通用专业装备的默认加值为+2\n此项值可填入检定的工具加值处'

// 显示等级（正数带+号）
const displayLevel = computed(() => {
  const val = localLevel.value || 0
  if (val > 0) return `+${val}`
  return val.toString()
})

// 增加等级
const increaseLevel = () => {
  localLevel.value = (localLevel.value || 0) + 1
}

// 减少等级
const decreaseLevel = () => {
  const current = localLevel.value || 0
  if (current > 0) {
    localLevel.value = current - 1
  }
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-red: #ff2a6d;

.equipment-slot {
  padding: 8px 0;

  .slot-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .name-input {
    flex: 1.5;
    min-width: 120px;
  }

  .type-select {
    width: 120px;
  }

  // 数字输入框包装器（和 ScarList 样式一致）
  .number-input-wrapper {
    position: relative;
    width: 60px;
    height: 32px;

    .number-input {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba($cyber-cyan, 0.2);
      border-radius: 4px;
      padding: 5px 20px 5px 8px;
      color: #fff;
      font-size: 14px;
      font-family: "Courier New", "Consolas", monospace;
      text-align: center;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: rgba($cyber-cyan, 0.5);

        & + .num-arrows {
          opacity: 1;
        }
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
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

  .description-input {
    flex: 1;
    width: 100%;
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($cyber-red, 0.1);
    border: 1px solid rgba($cyber-red, 0.3);
    border-radius: 4px;
    color: rgba($cyber-red, 0.7);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;

    &:hover {
      background: rgba($cyber-red, 0.2);
      border-color: rgba($cyber-red, 0.5);
      color: $cyber-red;
    }
  }
}
</style>
