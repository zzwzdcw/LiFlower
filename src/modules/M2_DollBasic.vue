<!--
  模块编号：M2
  模块名称：人形车卡-基础信息
  显示模式：doll-prep
  功能：生产企业、硬件规格、角色阐述、特质槽位
-->
<template>
  <div class="module-doll-basic">
    <h3 class="module-title">人形基础信息</h3>
    
    <el-form label-position="top">
      <!-- 角色名称（与 M0 同步） -->
      <el-form-item label="角色名称" required>
        <el-input
          v-model="characterStore.characterName"
          placeholder="请输入角色名称"
          size="large"
          class="cyber-input"
        />
      </el-form-item>

      <!-- 生产企业 -->
      <el-form-item label="生产企业">
        <div class="form-row">
          <CyberSelect
            v-model="characterStore.manufacturer"
            placeholder="请选择生产企业（可选）"
            :options="manufacturerOptions"
            :clearable="true"
            @change="onEnterpriseChange"
            style="flex: 1"
          />
          <TipButton level="2" :content="currentManufacturerDesc">
            企业文化
          </TipButton>
        </div>
        <!-- 效果说明文字（样式优化） -->
        <div v-if="currentManufacturerEffectDesc" class="effect-text">
          {{ currentManufacturerEffectDesc }}
        </div>
      </el-form-item>

      <!-- 硬件规格 -->
      <el-form-item label="硬件规格" required>
        <div class="form-row">
          <CyberSelect
            v-model="characterStore.hardwareSpec"
            placeholder="请选择硬件规格"
            :options="hardwareSpecOptions"
            @change="onHardwareChange"
            style="flex: 1"
          />
          <TipButton level="3" :content="currentHardwareFullDesc">
            规格说明
          </TipButton>
        </div>
        <!-- 效果说明文字（样式优化） -->
        <div v-if="currentHardwareEffectDesc" class="effect-text">
          {{ currentHardwareEffectDesc }}
        </div>
      </el-form-item>

      <!-- 可展开的角色阐述 -->
      <el-form-item class="character-desc-item">
        <el-collapse class="character-collapse">
          <el-collapse-item title="角色阐述">
            <el-input
              v-model="localData.description"
              type="textarea"
              :rows="4"
              placeholder="描述你的角色背景、性格、外貌等..."
              class="cyber-textarea"
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
                <!-- 特质效果描述 -->
                <div v-if="trait.effect" class="effect-text trait-effect">
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
import AttributeAllocator from "@/components/AttributeAllocator.vue"
import TipButton from "@/components/TipButton.vue"
import { useCharacterStore } from "@/stores/character"

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
    { id: "", description: "", effect: "" },
    { id: "", description: "", effect: "" }
  ]
})

// 数据列表
const hardwareSpecList = hardwareSpecData
const manufacturerList = manufacturerData
const attributeData = attributeDataJson.attributeSystem

// 获取当前企业可生产的规格列表
const currentManufacturerProducedSpecs = computed(() => {
  if (!characterStore.manufacturer) return null // 未选择企业，所有规格可用
  const manufacturer = manufacturerList.find(m => m.nameZh === characterStore.manufacturer)
  return manufacturer ? manufacturer.producedSpecs : null
})

// 硬件规格选项（根据企业禁用不可用的规格）
const hardwareSpecOptions = computed(() => {
  const producedSpecs = currentManufacturerProducedSpecs.value
  return hardwareSpecList.map((item) => ({
    label: item.name,
    value: item.name,
    extra: `属性点:${item.effect.attributePointsBonus} | 上限:${item.effect.attributePointsBonus}`,
    disabled: producedSpecs ? !producedSpecs.includes(item.name) : false
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

// 当前硬件规格的效果描述（用于下方说明文字）
const currentHardwareEffectDesc = computed(() => {
  if (!characterStore.hardwareSpec) return ""
  const selected = hardwareSpecList.find((item) => item.name === characterStore.hardwareSpec)
  return selected ? selected.effectDescription || "" : ""
})

// 当前企业的详细描述（用于 tip）
const currentManufacturerDesc = computed(() => {
  if (!characterStore.manufacturer) return ""
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  return selected ? selected.description || "" : ""
})

// 当前企业的效果描述（用于下方说明文字）
const currentManufacturerEffectDesc = computed(() => {
  if (!characterStore.manufacturer) return ""
  const selected = manufacturerList.find((item) => item.nameZh === characterStore.manufacturer)
  return selected ? selected.effectDescription || "" : ""
})

// 可用特质列表（人形显示doll+both，人类显示human+both）
const availableTraits = computed(() => {
  return traitsData
    .filter(t => t.type === 'doll' || t.type === 'both')
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
    trait.description = getTraitDescription(newId)
    trait.effect = getTraitEffect(newId)
    // 同步到 store（人形和人类共用 selectedTraits）
    characterStore.setTrait(index, newId)
  })
})

// 硬件规格变更 - 更新 store，M3 会自动响应
const onHardwareChange = (value) => {
  const selected = hardwareSpecList.find((item) => item.name === value)
  if (selected) {
    characterStore.setHardwareSpec(value, selected.effect.attributePointsBonus)
    ElMessage.success(`已选择 ${selected.name}，获得 ${selected.effect.attributePointsBonus} 点属性点`)
  }
}

// 企业变更 - 更新 store
const onEnterpriseChange = (value) => {
  if (!value) {
    characterStore.setManufacturer("", 0)
    ElMessage.info("已取消选择生产企业")
  } else {
    const selected = manufacturerList.find((item) => item.nameZh === value)
    if (selected) {
      const bonus = selected.effect?.attributePointsBonus || 0
      characterStore.setManufacturer(value, bonus)
      
      // 检查当前选择的规格是否在新企业的生产范围内
      if (characterStore.hardwareSpec && !selected.producedSpecs.includes(characterStore.hardwareSpec)) {
        // 重置硬件规格选择
        characterStore.setHardwareSpec("", 0)
        ElMessage.warning(`${selected.nameZh} 不生产 ${characterStore.hardwareSpec}，请重新选择硬件规格`)
      } else {
        ElMessage.success(`已选择 ${selected.nameZh}${bonus > 0 ? ` (属性点 +${bonus})` : ""}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;

.module-doll-basic {
  .module-title {
    color: $cyber-cyan;
    margin-bottom: 20px;
    font-size: 18px;
    border-bottom: 1px solid rgba(0, 243, 255, 0.2);
    padding-bottom: 10px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
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

  // 效果说明文字（无框线，更像自然说明）
  .effect-text {
    margin-top: 8px;
    padding: 8px 0;
    color: rgba(0, 243, 255, 0.8);
    font-size: 13px;
    font-style: italic;
    border-left: 3px solid rgba(0, 243, 255, 0.3);
    padding-left: 12px;
    line-height: 1.6;
  }

  // 赛博朋克风格输入框
  :deep(.cyber-input) {
    .el-input__wrapper {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      box-shadow: none;

      .el-input__inner {
        color: #fff;
        font-family: "Courier New", "Consolas", monospace;
        background: transparent;

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }

      &:focus-within {
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
        border-color: #00f3ff;
      }
    }
  }

  // 角色阐述区域宽度修复
  .character-desc-item {
    :deep(.el-form-item__content) {
      width: 100%;
    }
  }

  // 折叠面板宽度修复
  .character-collapse {
    width: 100%;
  }

  // 赛博朋克风格文本框
  :deep(.cyber-textarea) {
    width: 100%;

    .el-textarea__inner {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      border-radius: 4px;
      color: #fff;
      font-family: "Courier New", "Consolas", monospace;
      padding: 12px;
      line-height: 1.6;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      &:focus {
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
        border-color: #00f3ff;
      }
    }
  }

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

