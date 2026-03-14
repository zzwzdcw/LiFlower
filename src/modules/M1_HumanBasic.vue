<!--
  模块编号：M1
  模块名称：人类车卡-基础信息
  显示模式：human-prep
  功能：角色名称、人类出身、角色阐述、特质槽位
-->
<template>
  <div class="module-human-basic">
    <ModuleHeader title="人类基础信息" subtitle="Human Basic Info" />

    <el-form label-position="top">
      <!-- 角色名称（与 M0 同步） -->
      <el-form-item>
        <div class="form-row">
          <span class="field-label">角色名称</span>
          <el-input
            v-model="characterStore.characterName"
            placeholder="请输入角色名称"
            class="cyber-input-short"
            style="flex: 1"
          />
        </div>
      </el-form-item>

      <!-- 人类出身 -->
      <el-form-item>
        <div class="form-row">
          <span class="field-label">人类出身</span>
          <CyberSelect
            v-model="selectedBackground"
            placeholder="请选择出身背景"
            :options="backgroundOptions"
            style="flex: 1"
          />
          <TipButton level="3" :content="currentBackgroundDesc">
            
          </TipButton>
        </div>
      </el-form-item>

      <!-- 效果说明文字（独立全宽区域） -->
      <div v-if="currentBackgroundEffect" class="effect-text-wrapper">
        <div class="cyber-effect-text" v-html="parseEffectText(currentBackgroundEffect)"></div>
      </div>
      <!-- 可生产规格限制 -->
      <div v-if="currentBackgroundSpecs && currentBackgroundSpecs.length > 0" class="effect-text-wrapper">
        <div class="cyber-effect-text">
          <strong>可用人形规格：</strong>{{ currentBackgroundSpecs.join('、') }}
        </div>
      </div>

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
                <div v-else-if="trait.effect" class="cyber-effect-text trait-effect" v-html="parseEffectText(trait.effect)">
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
import { reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CyberSelect from "@/components/CyberSelect.vue"
import TipButton from "@/components/TipButton.vue"
import ModuleHeader from "@/components/ModuleHeader.vue"
import { useCharacterStore } from "@/stores/character"
import { useAutoOutput } from "@/composables/useModuleOutput"
import { getM1Cache } from "@/utils/cacheManager"
import { parseEffectText } from "@/utils/effectParser"

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

// ==================== 从缓存恢复 ====================
onMounted(() => {
  // 注册本地数据到全局缓存管理器
  if (window.liflowerCache) {
    window.liflowerCache.registerM1(localData)
  }

  const cache = getM1Cache()
  if (!cache) return

  // 恢复出身
  if (cache.backgroundId) {
    characterStore.humanBackground = cache.backgroundId
  }

  // 恢复阐述
  if (cache.description) {
    localData.description = cache.description
  }

  // 恢复特质
  if (cache.traits && Array.isArray(cache.traits)) {
    cache.traits.forEach((t, index) => {
      if (localData.traits[index]) {
        localData.traits[index].id = t.id || ''
        localData.traits[index].customEffect = t.custom || ''
        // 恢复描述和效果
        updateTraitInfo(index, t.id)
      }
    })
  }
})

// 辅助函数：根据特质ID更新描述和效果
function updateTraitInfo(index, traitId) {
  if (!traitId) {
    localData.traits[index].description = ''
    localData.traits[index].effect = ''
    return
  }
  if (isCustomTrait(traitId)) {
    localData.traits[index].description = '自定义特质'
    localData.traits[index].effect = localData.traits[index].customEffect || ''
  } else {
    const trait = traitsData.find(t => t.id.toString() === traitId)
    localData.traits[index].description = trait ? trait.description : ''
    localData.traits[index].effect = trait ? trait.effect : ''
  }
}

// ==================== 监听变化触发保存 ====================
watch([
  () => characterStore.humanBackground,
  () => localData.description,
  () => localData.traits.map(t => t.id),
  () => localData.traits.map(t => t.customEffect)
], () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// ==================== 模块数据输出 ====================
// 使用计算属性包装，自动同步到全局 store
// 输出格式：M1:background=1,backgroundName=无意义一代,trait1=2,trait2=5

const backgroundOutput = computed(() => {
  const bgId = characterStore.humanBackground
  if (!bgId) return { background: '', backgroundName: '', backgroundEffect: '' }
  const bg = backgroundData.find(item => item.id.toString() === bgId)
  return {
    background: bgId,
    backgroundName: bg ? bg.中文名 : '',
    backgroundEffect: bg ? bg.效果描述 || '' : ''
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

// 当前出身的可生产规格
const currentBackgroundSpecs = computed(() => {
  if (!selectedBackground.value) return []
  const selected = backgroundData.find(item => item.id.toString() === selectedBackground.value)
  return selected ? selected.可生产规格 || [] : []
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
  .form-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .field-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    min-width: 70px;
    flex-shrink: 0;
  }

  // 角色阐述区域
  .character-desc-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }

  // 覆盖 el-form-item 的默认底部 margin，改为顶部 margin
  :deep(.el-form-item) {
    margin-bottom: 0;   // 下方无间距
    margin-top: 8px;    // 上方有间距

    &:first-child {
      margin-top: 0;    // 第一个元素上方无间距
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

    // 特质效果与特质选择器对齐
    .trait-effect,
    .custom-trait-input {
      margin-left: 78px;  // 与 trait-label (60px) + gap (8px) + 额外间距对齐
      margin-top: 0;      // 紧贴上方特质选择器（无间距）
      margin-bottom: 6px; // 与下方元素留间距
    }
  }

  // 效果文本全宽容器
  .effect-text-wrapper {
    width: 100%;
    margin-top: 0;        // 紧贴上方下拉框（无间距）
    margin-bottom: 8px;   // 与下方元素留间距
    padding-left: 78px;   // 与 field-label (70px) + gap (8px) 对齐
    box-sizing: border-box;

    // 覆盖全局 cyber-effect-text 的 margin-top
    .cyber-effect-text {
      margin-top: 0;
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
