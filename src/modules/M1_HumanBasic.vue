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
          size="large"
          class="cyber-input"
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
import TipButton from "@/components/TipButton.vue"
import { useCharacterStore } from "@/stores/character"

// 导入数据
import backgroundData from "@/data/人类起源.json"
import traitsData from "@/data/特质.json"

// 使用 character store
const characterStore = useCharacterStore()

// 本地数据
const localData = reactive({
  description: "",
  traits: [
    { id: "", description: "", effect: "" },
    { id: "", description: "", effect: "" }
  ]
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
    trait.description = getTraitDescription(newId)
    trait.effect = getTraitEffect(newId)
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
