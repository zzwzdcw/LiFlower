<!--
  模块编号：M2
  模块名称：人形车卡 - 基础信息
  显示模式：doll-prep
  功能：生产企业、硬件规格、角色阐述、特质槽位
-->
<template>
  <div class="module-doll-basic">
    <ModuleHeader title="基础信息" subtitle="Basic Information" />

    <el-form label-position="top">
      <!-- 角色名称（与 M0 同步） -->
      <el-form-item>
        <div class="form-row">
          <span class="field-label">角色名称</span>
          <el-input
            v-model="characterStore.characterName"
            placeholder="请输入"
            class="cyber-input-short"
            style="flex: 1"
          />
        </div>
      </el-form-item>

      <!-- 生产企业 -->
      <el-form-item>
        <div class="form-row">
          <span class="field-label">生产企业</span>
          <CyberSelect
            v-model="characterStore.manufacturer"
            placeholder="请选择生产企业"
            :options="manufacturerOptions"
            :clearable="true"
            @change="onEnterpriseChange"
            style="flex: 1"
          />
          <TipButton :level="3" :content="currentEnterpriseFullDesc">
            
          </TipButton>
        </div>
      </el-form-item>

      <!-- 企业效果（独立全宽区域） -->
      <div v-if="currentManufacturerEffectDesc && currentManufacturerEffectDesc.length > 0" class="effect-text-wrapper">
        <div class="cyber-effect-text">
          <div v-for="(item, index) in currentManufacturerEffectDesc" :key="index" class="effect-item" v-html="parseEffectText(item)"></div>
        </div>
      </div>

      <!-- 硬件规格 -->
      <el-form-item>
        <div class="form-row">
          <span class="field-label">硬件规格</span>
          <CyberSelect
            v-model="characterStore.hardwareSpec"
            placeholder="请选择硬件规格"
            :options="hardwareSpecOptions"
            :clearable="true"
            @change="onHardwareChange"
            style="flex: 1"
          />
          <TipButton :level="3" :content="currentHardwareFullDesc">

          </TipButton>
        </div>
      </el-form-item>

      <!-- 硬件规格效果（独立全宽区域） -->
      <div v-if="currentHardwareEffectDesc && currentHardwareEffectDesc.length > 0" class="effect-text-wrapper">
        <div class="cyber-effect-text">
          <div v-for="(item, index) in currentHardwareEffectDesc" :key="index" class="effect-item" v-html="parseEffectText(item)"></div>
        </div>
      </div>

      <!-- 可展开的角色阐述 -->
      <el-form-item class="character-desc-item">
        <el-collapse class="character-collapse">
          <el-collapse-item title="角色阐述">
            <el-input
              v-model="localData.description"
              type="textarea"
              :rows="4"
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
                  <TipButton :level="1" :content="trait.description" />
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
                <div v-else-if="getTraitEffect(trait.id)" class="cyber-effect-text trait-effect" v-html="parseEffectText(getTraitEffect(trait.id))">
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
import CyberSelect from "@/components/CyberSelect.vue"
import AttributeAllocator from "@/components/AttributeAllocator.vue"
import TipButton from "@/components/TipButton.vue"
import ModuleHeader from "@/components/ModuleHeader.vue"
import { useCharacterStore } from "@/stores/character"
import { useAutoOutput } from "@/composables/useModuleOutput"
import { getM2Cache, getHardwareSpecNameById, getManufacturerNameById, getHardwareSpecBonus, getManufacturerBonus } from "@/utils/cacheManager"
import { parseEffectText } from "@/utils/effectParser"

// 导入数据
import hardwareSpecData from "@/data/硬件规格.json"
import manufacturerData from "@/data/企业技术.json"
import attributeDataJson from "@/data/基本属性.json"
import traitsData from "@/data/特质.json"

// 使用 character store（与 M0 共享角色名称，与 M3 共享硬件规格）
const characterStore = useCharacterStore()

// 本地数据（不需要共享的）
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
    window.liflowerCache.registerM2(localData)
  }

  const cache = getM2Cache()
  
  // 恢复硬件规格
  if (cache && cache.hardwareSpecId) {
    const specName = getHardwareSpecNameById(cache.hardwareSpecId)
    if (specName) {
      characterStore.hardwareSpec = specName
      characterStore.baseAttributePoints = getHardwareSpecBonus(cache.hardwareSpecId)
    }
  }

  // 恢复生产企业
  if (cache && cache.manufacturerId) {
    const mfrName = getManufacturerNameById(cache.manufacturerId)
    if (mfrName) {
      characterStore.manufacturer = mfrName
      // 重新计算总属性点
      characterStore.totalAttributePoints = characterStore.baseAttributePoints + getManufacturerBonus(cache.manufacturerId)
    }
  }

  // 恢复阐述
  if (cache && cache.description) {
    localData.description = cache.description
  }

  // 恢复特质
  if (cache && cache.traits && Array.isArray(cache.traits) && cache.traits.length > 0) {
    cache.traits.forEach((t, index) => {
      if (localData.traits[index]) {
        localData.traits[index].id = t.id || ''
        localData.traits[index].customEffect = t.custom || ''
        // 恢复描述和效果
        updateTraitInfo(index, t.id)
      }
    })
  } else {
    // 缓存为空时重置为初始状态
    localData.traits = [
      { id: "", description: "", effect: "", customEffect: "" },
      { id: "", description: "", effect: "", customEffect: "" }
    ]
    console.log('[M2] 缓存为空，重置特质')
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
  () => characterStore.hardwareSpec,
  () => characterStore.manufacturer,
  () => localData.description,
  () => localData.traits.map(t => t.id),
  () => localData.traits.map(t => t.customEffect)
], () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// 数据列表
const hardwareSpecList = hardwareSpecData
const manufacturerList = manufacturerData
const attributeData = attributeDataJson.attributeSystem

// 获取当前企业可生产的规格列表（使用 ID 匹配）
const currentManufacturerProducedSpecs = computed(() => {
  if (!characterStore.manufacturer) return null // 未选择企业，所有规格可用
  const manufacturer = manufacturerList.find(m => m.nameZh === characterStore.manufacturer)
  return manufacturer ? manufacturer.producedSpecs : null
})

// 硬件规格选项（根据企业禁用不可用的规格）
const hardwareSpecOptions = computed(() => {
  const producedSpecs = currentManufacturerProducedSpecs.value
  return hardwareSpecList.map((item) => ({
    label: item.name + '级',
    value: item.name,
    extra: `属性点:${item.effect.attributePointsBonus} | 上限:${item.effect.attributePointsBonus}`,
    disabled: producedSpecs ? !producedSpecs.includes(item.id) : false
  }))
})

// 生产企业选项
const manufacturerOptions = manufacturerList.map((item) => ({
  label: item.nameZh,
  value: item.nameZh,
  extra: item.nameEn,
}))

// 当前硬件规格的详细描述（用于 tip）
const currentHardwareFullDesc = computed(() => {
  if (!characterStore.hardwareSpec) return ""
  const selected = hardwareSpecList.find((item) => item.name === characterStore.hardwareSpec)
  return selected ? selected.description || "" : ""
})

// 当前企业的详细描述（用于 tip）
const currentEnterpriseFullDesc = computed(() => {
  if (!characterStore.manufacturer) return ""
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  return selected ? selected.description || "" : ""
})

// 当前硬件规格的效果描述（用于下方说明文字）
const currentHardwareEffectDesc = computed(() => {
  if (!characterStore.hardwareSpec) return []
  const selected = hardwareSpecList.find((item) => item.name === characterStore.hardwareSpec)
  return selected ? selected.effectDescription || [] : []
})

// 当前企业的效果描述（用于下方说明文字）
const currentManufacturerEffectDesc = computed(() => {
  if (!characterStore.manufacturer) return []
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  if (!selected || !selected.effect) return []

  const effectText = selected.effect.effectText || ''
  // 将 effectText 按分号分割为数组
  return effectText.split(';').map(s => s.trim()).filter(s => s)
})

// 可用特质列表（人形显示 doll+both，人类显示 human+both）
const availableTraits = computed(() => {
  return traitsData
    .filter(t => t.type === 'doll' || t.type === 'both')
    .map(t => ({
      label: t.name,
      value: t.id.toString()
    }))
})

// 根据特质 ID 获取描述
const getTraitDescription = (traitId) => {
  if (!traitId) return ''
  const trait = traitsData.find(t => t.id.toString() === traitId)
  return trait ? trait.description : ''
}

// 根据特质 ID 获取效果
const getTraitEffect = (traitId) => {
  if (!traitId) return ''
  const trait = traitsData.find(t => t.id.toString() === traitId)
  return trait ? trait.effect : ''
}

// 监听特质选择变化，同步到 store
localData.traits.forEach((trait, index) => {
  watch(() => trait.id, (newId) => {
    // 同步到 store（人形和人类共用 selectedTraits）
    characterStore.setTrait(index, newId)
  })
})

// 硬件规格变更 - 更新 store，M3 会自动响应
const onHardwareChange = (value) => {
  const selected = hardwareSpecList.find((item) => item.name === value)
  if (selected) {
    characterStore.setHardwareSpec(value, selected.effect.attributePointsBonus)
  }
}

// 企业变更 - 更新 store
const onEnterpriseChange = (value) => {
  if (!value) {
    characterStore.setManufacturer("", 0)
  } else {
    const selected = manufacturerList.find((item) => item.nameZh === value)
    if (selected) {
      const bonus = selected.effect?.attributePointsBonus || 0
      characterStore.setManufacturer(value, bonus)

      // 检查当前选择的规格是否在新企业的生产范围内
      if (characterStore.hardwareSpec && !selected.producedSpecs.includes(characterStore.hardwareSpec)) {
        // 重置硬件规格选择
        characterStore.setHardwareSpec("", 0)
      }
    }
  }
}

// ==================== 数据输出 ====================
// 获取企业 ID
const manufacturerId = computed(() => {
  if (!characterStore.manufacturer) return null
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  return selected?.id || null
})

// 获取硬件规格 ID
const hardwareSpecId = computed(() => {
  if (!characterStore.hardwareSpec) return null
  const selected = hardwareSpecList.find((item) => item.name === characterStore.hardwareSpec)
  return selected?.id || null
})

// 生产企业名称
const manufacturerName = computed(() => characterStore.manufacturer || '')

// 生产企业效果描述
const manufacturerEffect = computed(() => {
  if (!characterStore.manufacturer) return ''
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  if (!selected || !selected.effect) return ''
  return selected.effect.effectText || ''
})

// 硬件规格名称
const hardwareSpecName = computed(() => characterStore.hardwareSpec || '')

// 硬件规格效果描述（将数组拼接为字符串）
const hardwareSpecEffect = computed(() => {
  if (!characterStore.hardwareSpec) return ''
  const selected = hardwareSpecList.find((item) => item.name === characterStore.hardwareSpec)
  if (!selected) return ''
  const effects = selected.effectDescription || []
  return effects.join('；')
})

// 特质输出（排序后，消除顺序差异）
const traitsOutput = computed(() => {
  // 收集所有特质信息（包括自定义效果）
  const traitInfos = localData.traits
    .filter(t => t.id !== '')
    .map(t => {
      const traitData = traitsData.find(item => item.id.toString() === t.id)
      // 如果是自由特质（ID=0），使用自定义输入的效果
      const isCustom = (t.id === '0' || t.id === 0)
      return {
        id: t.id,
        name: traitData ? traitData.name : '',
        effect: isCustom ? (t.customEffect || '自定义特质效果') : (traitData ? traitData.effect : '')
      }
    })
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))

  // 获取特质 1 和特质 2 的详细信息
  const trait1 = traitInfos[0] || { name: '', effect: '' }
  const trait2 = traitInfos[1] || { name: '', effect: '' }

  return {
    trait1Name: trait1.name,
    trait1Effect: trait1.effect,
    trait2Name: trait2.name,
    trait2Effect: trait2.effect
  }
})

useAutoOutput({
  manufacturerId,
  hardwareSpecId,
  description: computed(() => localData.description),
  traitIds: computed(() => localData.traits.map(t => t.id).filter(id => id)),
  manufacturerName,
  manufacturerEffect,
  hardwareSpecName,
  hardwareSpecEffect,
  trait1Name: computed(() => traitsOutput.value.trait1Name),
  trait1Effect: computed(() => traitsOutput.value.trait1Effect),
  trait2Name: computed(() => traitsOutput.value.trait2Name),
  trait2Effect: computed(() => traitsOutput.value.trait2Effect)
})
</script>

<style lang="scss" scoped>
@use '@/styles/input-styles.scss' as *;

$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-doll-basic {
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

  .desc-text {
    margin-top: 8px;
    padding: 10px 12px;
    background: rgba(0, 243, 255, 0.05);
    border: 1px solid rgba(0, 243, 255, 0.2);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    line-height: 1.6;
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
