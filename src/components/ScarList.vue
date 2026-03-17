<!--
  组件：ScarList
  功能：伤痕列表，可展开，最多6个，无边框样式
-->
<template>
  <div class="scar-list">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="scars">
        <template #title>
          <div class="collapse-title">
            <div class="title-left">
              <span class="hp-label">HP</span>
              <span class="hp-current">{{ hpCurrent }}</span>
              <span class="hp-separator">/</span>
              <span class="hp-base">{{ hpBase }}+</span>
              <input
                v-model.number="hpAdjustInput"
                type="number"
                class="hp-input"
                :class="{ locked: isHpLocked }"
                placeholder="0"
                :disabled="isHpLocked"
                @change="onHpAdjustChange"
              />
              <button
                class="lock-btn"
                :class="{ locked: isHpLocked }"
                @click.stop="toggleHpLock"
                :title="isHpLocked ? '点击解锁' : '点击锁定'"
              >
                {{ isHpLocked ? '🔒' : '🔓' }}
              </button>
            </div>
            <div class="title-center">
              <span class="scar-title">伤痕</span>
              <span class="scar-count">({{ modelValue.length }}/6)</span>
            </div>
          </div>
        </template>

        <div class="scar-content">
          <div v-for="(scar, index) in modelValue" :key="scar.id" class="scar-item">
            <!-- 第一行：类型切换、严重程度、值、状态命令、删除按钮 -->
            <div class="scar-row first-row">
              <!-- 类型切换：物理/电子 -->
              <button
                class="type-toggle"
                :class="scar.damageType"
                @click.stop="toggleDamageType(index)"
              >
                {{ scar.damageType === 'physical' ? '物理' : '电子' }}
              </button>

              <!-- 数值调整组件 -->
              <div class="number-control">
                <input
                  v-model.number="scar.value"
                  type="number"
                  class="scar-input value-input"
                  :class="{ disabled: isValueDisabled(scar) }"
                  placeholder="0"
                  :disabled="isValueDisabled(scar)"
                  @wheel.prevent="handleWheel($event, index)"
                />
                <div class="num-arrows" v-if="!isValueDisabled(scar)">
                  <button class="arrow-btn up" @click.stop="increaseValue(index)">▲</button>
                  <button class="arrow-btn down" @click.stop="decreaseValue(index)">▼</button>
                </div>
              </div>

              <!-- 状态命令选择器 -->
              <select
                v-model="scar.status"
                class="scar-select"
                @click.stop
                @change="handleStatusChange(index, $event)"
              >
                <option value="active">生效中</option>
                <option value="healing">恢复中</option>
              </select>

              <button class="delete-btn" @click.stop="removeScar(index)">×</button>
            </div>

            <!-- 第二行：严重程度标签 + 效果描述 -->
            <div class="scar-row second-row">
              <!-- 严重程度文字（带Tip） -->
              <span class="severity-label" :class="getSeverityClass(scar.value)">
                <TipButton
                  level="1"
                  :content="getSeverityTip(scar.value, scar.damageType)"
                  :show-icon="false"
                >
                  {{ getSeverityLabel(scar.value) }}
                </TipButton>
              </span>

              <input
                v-model="scar.description"
                type="text"
                class="scar-input description-input"
                :class="{ disabled: isDescriptionDisabled(scar) }"
                placeholder="效果描述"
                :disabled="isDescriptionDisabled(scar)"
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
import { ref, computed, watch } from 'vue'
import TipButton from './TipButton.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  hpBase: {
    type: Number,
    default: 8
  },
  hpAdjust: {
    type: Number,
    default: 0
  },
  mode: {
    type: String,
    default: 'human', // 'human' 或 'doll'
    validator: (val) => ['human', 'doll'].includes(val)
  }
})

const emit = defineEmits(['update:modelValue', 'update:hpAdjust', 'update:hpCurrent'])

// 默认不展开
const activeNames = ref([])

// HP 锁定状态（默认锁定）
const isHpLocked = ref(true)

// HP 总值 = 基础值 + 调整值
const hpMax = computed(() => {
  return props.hpBase + props.hpAdjust
})

// 有效伤痕数值之和（只计算未被划掉的）
const activeScarSum = computed(() => {
  return props.modelValue.reduce((sum, scar) => {
    // 如果伤痕被划掉（恢复中且 1-6），不纳入计算
    if (scar.status === 'healing' && scar.value >= 1 && scar.value <= 6) {
      return sum
    }
    return sum + (scar.value || 0)
  }, 0)
})

// HP 当前值 = 总值 - 有效伤痕之和
const hpCurrent = computed(() => {
  return Math.max(0, hpMax.value - activeScarSum.value)
})

// 监听变化，发送更新事件
watch(hpCurrent, (val) => {
  emit('update:hpCurrent', val)
}, { immediate: true })

// HP 调整输入框的值
const hpAdjustInput = computed({
  get: () => props.hpAdjust,
  set: (val) => {
    emit('update:hpAdjust', val)
  }
})

const toggleHpLock = () => {
  isHpLocked.value = !isHpLocked.value
}

const onHpAdjustChange = () => {
  emit('update:hpAdjust', hpAdjustInput.value)
}

let scarIdCounter = 0

// 严重程度样式类
const getSeverityClass = (value) => {
  if (!value || value <= 0) return ''
  if (value <= 3) return 'mild'
  if (value <= 6) return 'severe'
  return 'fatal'
}

// 严重程度标签
const getSeverityLabel = (value) => {
  if (!value || value <= 0) return '-'
  if (value <= 3) return '轻微'
  if (value <= 6) return '严重'
  return '致命'
}

// 严重程度提示内容
const getSeverityTip = (value, damageType = 'physical') => {
  if (!value || value <= 0) return '请输入伤痕数值'

  // 人形模式
  if (props.mode === 'doll') {
    if (damageType === 'electronic') {
      // 电子伤痕
      if (value <= 3) {
        return `轻微（1~3）：EAP撕裂、电池短路、器件驱动故障

处理建议：人形可以花费1h进行快速系统修复，找出漏洞和程序并修补。可因此恢复全部的轻微电子伤痕。但自检和重编译是两种不同的行为。`
      }
      if (value <= 6) {
        return `严重（4~6）：核心部件断裂、电路烧毁、处理器故障

处理建议：系统出现了难以修复的问题，程序已经完全被感染，必须重新安装可信的版本。维修过程必须全程联网，每清除1个严重电子伤痕需消耗1h。`
      }
      return `致命（7+）：结构损毁、停机、系统崩溃

处理建议：系统必须恢复出厂设置。必须连线一台大于此人形算力的设备作为隔离引导和人格储存，不但需要实时电源供应，还需要维修者进行编程技能检定，此时人形是完全无法思考的伪关机状态。消耗6h，完成后人形眼睛都清澈了不少。`
    } else {
      // 物理伤痕
      if (value <= 3) {
        return `轻微（1~3）：EAP撕裂、电池短路、器件驱动故障

处理建议：在整备时，人形可消耗1h重新编译控制系统，屏蔽问题组件或是调整电压曲线以恢复性能。这会让伤痕数值归零并且不再有负面作用，但是伤痕依然存在（占用槽位），只有在更换部件时才能彻底消除。`
      }
      if (value <= 6) {
        return `严重（4~6）：核心部件断裂、电路烧毁、处理器故障

处理建议：零件已经彻底报废，必须更换。更换需要拥有配件，以及进行工程技能检定。基础花费1h（拆开、组装、调试），每个部件更换消耗1h。结束后会完全移除一个严重物理伤痕。可因此恢复全部的轻微伤痕。`
      }
      return `致命（7+）：结构损毁、停机、系统崩溃

处理建议：则必须经历一次全面检修，需要专业的检修台和调试电脑，配件也是必不可少。在全面检修时人形处于安全模式，仍有意识但不能活动。消耗6h，完成后会让人形焕然一新。`
    }
  }

  // 人类模式（默认）
  if (value <= 3) {
    return `轻微（1~3）：擦伤、淤青、未伤及动脉的伤口

处理建议：人类的轻微伤痕会在6h后自动消失。`
  }
  if (value <= 6) {
    return `严重（4~6）：骨折、大出血、烧伤

处理建议：必须进行医疗行为（借助医疗用品，并且进行医工检定）。成功后移除伤痕的负面效果，并且会在24h后自动移除HP占用。如果受伤24h内没有进行医疗行为，此伤痕可能会演变（感染、撕裂等）。`
  }
  return `致命（7+）：重要脏器损坏、断肢、栓塞

处理建议：必须在手术室进行直接治疗。成功则会在3天后自动恢复HP，但不会移除负面效果，负面效果会持续7到30天。如果受伤后什么都不做，那么人类会在3天后直接死亡；如果仅能获取基础（如药物）治疗，则会移除死亡倒计时。`
}

// 判断数值是否禁用（恢复中且>=7）
const isValueDisabled = (scar) => {
  return scar.status === 'healing' && scar.value >= 7
}

// 判断描述是否禁用（恢复中且1-6）
const isDescriptionDisabled = (scar) => {
  return scar.status === 'healing' && scar.value >= 1 && scar.value <= 6
}

// 处理状态变化
const handleStatusChange = (index, event) => {
  const newStatus = event.target.value
  const newScars = [...props.modelValue]
  newScars[index].status = newStatus

  // 恢复中时执行相应操作
  if (newStatus === 'healing') {
    const value = newScars[index].value || 0
    // 1-6：效果描述不再生效（由样式处理）
    // 7+：数字本身不再生效（由样式处理）
  }

  emit('update:modelValue', newScars)
}

const addScar = () => {
  if (props.modelValue.length >= 6) return

  const newScar = {
    id: ++scarIdCounter,
    damageType: 'physical', // physical | electronic
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

const toggleDamageType = (index) => {
  const newScars = [...props.modelValue]
  newScars[index].damageType = newScars[index].damageType === 'physical' ? 'electronic' : 'physical'
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
      padding: 4px 16px;
      height: 36px;
      color: $cyber-cyan;
      font-size: 14px;
    }

    .el-collapse-item__wrap {
      background: transparent;
      border: none;
    }

    .el-collapse-item__content {
      padding: 12px 0 0 0;
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

  .hp-label {
    color: #ff4757;
    font-size: 16px;
    font-weight: bold;
    font-family: "Courier New", "Consolas", monospace;
    margin-right: 4px;
  }

  .hp-current {
    color: #ff4757;
    font-size: 24px;
    font-weight: bold;
    font-family: "Courier New", "Consolas", monospace;
    text-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
  }

  .hp-separator {
    color: rgba(255, 255, 255, 0.4);
    font-size: 18px;
    margin: 0 4px;
  }

  .hp-base {
    color: $cyber-cyan;
    font-size: 14px;
    font-weight: bold;
    font-family: "Courier New", "Consolas", monospace;
  }

  .hp-input {
    width: 28px;
    padding: 2px 4px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba($cyber-cyan, 0.2);
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    font-family: "Courier New", "Consolas", monospace;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;

    &:focus {
      outline: none;
      border-color: rgba($cyber-cyan, 0.5);
    }

    &:disabled {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba($cyber-cyan, 0.1);
      color: rgba(255, 255, 255, 0.6);
      cursor: not-allowed;
    }
  }

  .lock-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($cyber-cyan, 0.1);
    border: 1px solid rgba($cyber-cyan, 0.3);
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    margin-left: 4px;

    &:hover {
      background: rgba($cyber-cyan, 0.2);
      border-color: rgba($cyber-cyan, 0.5);
    }

    &.locked {
      background: rgba(255, 193, 7, 0.1);
      border-color: rgba(255, 193, 7, 0.3);

      &:hover {
        background: rgba(255, 193, 7, 0.2);
        border-color: rgba(255, 193, 7, 0.5);
      }
    }
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
  padding: 8px 0;
}

.scar-item {
  margin-bottom: 8px;
  padding: 6px 0;

  &:last-child {
    margin-bottom: 0;
  }
}

.scar-row {
  display: flex;
  align-items: center;
  gap: 6px;

  &.first-row {
    margin-bottom: 6px;
  }

  &.second-row {
    padding-left: 0;
    align-items: center;

    .severity-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      text-align: center;
      font-size: 12px;
      cursor: help;
      flex-shrink: 0;
      padding: 3px 4px;
      border-radius: 4px;
      border: 1px solid;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);

      &.mild {
        background: rgba(46, 204, 113, 0.15);
        border-color: rgba(46, 204, 113, 0.5);
        color: #2ecc71;
      }

      &.severe {
        background: rgba(241, 196, 15, 0.15);
        border-color: rgba(241, 196, 15, 0.5);
        color: #f1c40f;
      }

      &.fatal {
        background: rgba(231, 76, 60, 0.15);
        border-color: rgba(231, 76, 60, 0.5);
        color: #e74c3c;
      }

      :deep(.tip-button) {
        color: inherit;
      }
    }

    .description-input {
      flex: 1;

      &.disabled {
        text-decoration: line-through;
        color: rgba(255, 255, 255, 0.4);
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
}

// 类型切换按钮
.type-toggle {
  width: 46px;
  padding: 5px 8px;
  background: rgba($cyber-cyan, 0.1);
  border: 1px solid rgba($cyber-cyan, 0.3);
  border-radius: 4px;
  color: $cyber-cyan;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($cyber-cyan, 0.2);
    border-color: rgba($cyber-cyan, 0.5);
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

    &.disabled {
      text-decoration: line-through;
      color: rgba(255, 255, 255, 0.4);
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
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
