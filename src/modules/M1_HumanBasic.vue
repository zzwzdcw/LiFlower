<!--
  模块编号：M1
  模块名称：人类车卡-基础信息
  显示模式：human-prep
  功能：角色名称、人类出身、角色阐述、特质槽位
-->
<template>
  <div class="module-human-basic">
    <h3 class="module-title">人类基础信息</h3>

    <el-form label-position="top">
      <!-- 角色名称（与 M0 同步） -->
      <el-form-item label="角色名称" required>
        <el-input
          v-model="characterStore.characterName"
          placeholder="请输入角色名称"
          class="cyber-input-short"
        />
      </el-form-item>

      <!-- 人类出身 -->
      <el-form-item label="人类出身" required>
        <div class="form-row">
          <CyberSelect
            v-model="selectedBackground"
            placeholder="请选择出身背景"
            :options="backgroundOptions"
            style="flex: 1"
          />
          <TipButton level="3" :content="currentBackgroundDesc">
            出身说明
          </TipButton>
        </div>
        <!-- 效果说明文字 -->
        <div v-if="currentBackgroundEffect" class="effect-text">
          {{ currentBackgroundEffect }}
        </div>
      </el-form-item>

      <!-- 可展开的角色阐述 -->
      <el-form-item class="character-desc-item">
        <el-collapse class="character-collapse">
          <el-collapse-item title="角色阐述">
            <el-input
              v-model="localData.description"
              type="textarea"
              placeholder="描述你的角色背景、性格、外貌等..."
              class="cyber-input-long"
            />

            <!-- 特质槽位 -->
            <div class="traits-section">
              <div
                class="trait-item"
                v-for="(trait, index) in localData.traits"
                :key="index"
              >
                <div class="trait-slot">
                  <span class="trait-label">特质 {{ index + 1 }}</span>
                  <CyberSelect
                    v-model="trait.id"
                    placeholder="选择特质"
                    :options="availableTraits"
                    style="flex: 1"
                  />
                  <TipButton level="1" :content="trait.description" />
                </div>
                <!-- 自由特质：显示自定义输入框 -->
                <div v-if="isCustomTrait(trait.id)" class="custom-trait-input">
                  <el-input
                    v-model="trait.customEffect"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入自定义特质效果..."
                    class="cyber-input-long"
                  />
                </div>
                <!-- 普通特质：显示效果描述 -->
                <div v-else-if="trait.effect" class="effect-text trait-effect">
                  {{ trait.effect }}
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import CyberSelect from "@/components/CyberSelect.vue"
import TipButton from "@/components/TipButton.vue"
import { useCharacterStore } from "@/stores/character"
import { useAutoOutput } from "@/composables/useModuleOutput"

// 导入数据
import backgroundData from "@/data/人类起源.json"
import traitsData from "@/data/特质.json"

// 使用 character store
const characterStore = useCharacterStore()

// 本地数据（必须先定义）
const localData = reactive({
  description: "",
  traits: [
    { id: "", description: "", effect: "", customEffect: "" },
    { id: "", description: "", effect: "", customEffect: "" }
  ]
})

// 判断是否为自由特质（ID为0）
const isCustomTrait = (traitId) => {
  return traitId === '0' || traitId === 0
}

// ==================== 模块数据输出 ====================
// 使用计算属性包装，自动同步到全局 store
// 输出格式：M1:background=1,backgroundName=无意义一代,trait1=2,trait2=5

const backgroundOutput = computed(() => {
  const bgId = characterStore.humanBackground
  if (!bgId) return { background: '', backgroundName: '' }
  const bg = backgroundData.find(item => item.id.toString() === bgId)
  return {
    background: bgId,
    backgroundName: bg ? bg.中文名 : ''
  }
})

// 特质输出（排序后，消除顺序差异）
// [1,2] 和 [2,1] 都会输出为 traits=1,2
// 自由特质会包含自定义文本
const traitsOutput = computed(() => {
  // 收集所有特质信息（包括 ID、名称和效果）
  const traitInfos = localData.traits
    .filter(t => t.id !== '')
    .map(t => {
      if (isCustomTrait(t.id)) {
        // 自由特质：名称为"自由特质"，效果为玩家输入的文本
        return {
          id: t.id,
          name: '自由特质',
          effect: t.customEffect || '',
          custom: t.customEffect || ''
        }
      }
      // 普通特质：从数据文件获取名称和效果
      const traitData = traitsData.find(item => item.id.toString() === t.id)
      return {
        id: t.id,
        name: traitData ? traitData.name : '',
        effect: traitData ? traitData.effect : '',
        custom: ''
      }
    })
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))

  // 构建 traits 字符串（ID 用逗号分隔，自由特质用 | 追加文本）
  const traitStrs = traitInfos.map(t => {
    if (t.custom) {
      return `${t.id}|${t.custom}`
    }
    return t.id
  })

  // 获取特质 1 和特质 2 的详细信息
  const trait1 = traitInfos[0] || { name: '', effect: '' }
  const trait2 = traitInfos[1] || { name: '', effect: '' }

  return {
    traits: traitStrs.join(',') || '',
    traitCount: traitInfos.length,
    trait1Name: trait1.name,
    trait1Effect: trait1.effect,
    trait2Name: trait2.name,
    trait2Effect: trait2.effect
  }
})

const descriptionOutput = computed(() => ({
  description: localData.description
}))

// 自动同步所有输出数据
useAutoOutput({
  background: computed(() => backgroundOutput.value.background),
  backgroundName: computed(() => backgroundOutput.value.backgroundName),
  backgroundEffect: computed(() => backgroundOutput.value.backgroundEffect),
  traits: computed(() => traitsOutput.value.traits),
  traitCount: computed(() => traitsOutput.value.traitCount),
  description: computed(() => descriptionOutput.value.description),
  trait1Name: computed(() => traitsOutput.value.trait1Name),
  trait1Effect: computed(() => traitsOutput.value.trait1Effect),
  trait2Name: computed(() => traitsOutput.value.trait2Name),
  trait2Effect: computed(() => traitsOutput.value.trait2Effect)
})

// 出身选择
const selectedBackground = computed({
  get: () => characterStore.humanBackground || "",
  set: (value) => {
    characterStore.humanBackground = value
  }
})

// 出身选项
const backgroundOptions = backgroundData.map(item => ({
  label: item.中文名,
  value: item.id.toString()
}))

// 当前出身的详细描述（用于 tip）
const currentBackgroundDesc = computed(() => {
  if (!selectedBackground.value) return ""
  const selected = backgroundData.find(item => item.id.toString() === selectedBackground.value)
  return selected ? selected.描述 || "" : ""
})

// 当前出身的效果描述
const currentBackgroundEffect = computed(() => {
  if (!selectedBackground.value) return ""
  const selected = backgroundData.find(item => item.id.toString() === selectedBackground.value)
  return selected ? selected.效果描述 || "" : ""
})

// 可用特质列表（人类显示 human+both）
const availableTraits = computed(() => {
  return traitsData
    .filter(t => t.type === 'human' || t.type === 'both')
    .map(t => ({
      label: t.name,
      value: t.id.toString()
    }))
})

// 根据特质ID获取描述
const getTraitDescription = (traitId) => {
  if (!traitId) return ''
  const trait = traitsData.find(t => t.id.toString() === traitId)
  return trait ? trait.description : ''
}

// 根据特质ID获取效果
const getTraitEffect = (traitId) => {
  if (!traitId) return ''
  const trait = traitsData.find(t => t.id.toString() === traitId)
  return trait ? trait.effect : ''
}

// 监听特质选择变化，更新描述和效果，并同步到 store
localData.traits.forEach((trait, index) => {
  watch(() => trait.id, (newId) => {
    if (isCustomTrait(newId)) {
      // 自由特质：清空预设效果，保留自定义文本
      trait.description = getTraitDescription(newId)
      trait.effect = ''
    } else {
      // 普通特质：更新描述和效果，清空自定义文本
      trait.description = getTraitDescription(newId)
      trait.effect = getTraitEffect(newId)
      trait.customEffect = ''
    }
    // 同步到 store
    characterStore.setTrait(index, newId)
  })
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-human-basic {
  .module-title {
    color: $cyber-cyan;
    font-family: "Courier New", monospace;
    margin-bottom: 20px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  // 效果说明文字样式
  .effect-text {
    margin-top: 8px;
    color: rgba(0, 243, 255, 0.8);
    font-size: 13px;
    font-style: italic;
    border-left: 3px solid rgba(0, 243, 255, 0.3);
    padding-left: 12px;
    line-height: 1.6;
  }

  // 角色阐述区域
  .character-desc-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }

  .character-collapse {
    width: 100%;

    :deep(.el-collapse-item__header) {
      background: rgba(0, 243, 255, 0.05);
      border: 1px solid rgba(0, 243, 255, 0.2);
      border-radius: 4px;
      padding: 0 16px;
      color: $cyber-cyan;
      font-size: 14px;
    }

    :deep(.el-collapse-item__wrap) {
      background: transparent;
      border: none;
    }

    :deep(.el-collapse-item__content) {
      padding: 16px 0 0 0;
    }
  }

  // 特质槽位样式
  .traits-section {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trait-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .trait-slot {
      display: flex;
      align-items: center;
      gap: 8px;

      .trait-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        min-width: 60px;
      }

      .cyber-select {
        flex: 1;
      }
    }

    .trait-effect {
      margin-left: 68px;
      margin-top: 4px;
    }

    // 自定义特质输入框
    .custom-trait-input {
      margin-left: 68px;
      margin-top: 8px;
    }
  }
}

:deep(.el-collapse) {
  border: none;
  background: transparent;

  .el-collapse-item__header {
    background: rgba(0, 243, 255, 0.05);
    border: 1px solid rgba(0, 243, 255, 0.2);
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
</style>
