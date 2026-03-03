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

      <!-- 硬件规格 -->
      <el-form-item label="硬件规格" required>
        <div class="form-row">
          <CyberSelect
            v-model="character.hardwareSpec"
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

      <!-- 生产企业 -->
      <el-form-item label="生产企业">
        <div class="form-row">
          <CyberSelect
            v-model="character.manufacturer"
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
        <div v-if="currentManufacturerDesc" class="desc-text">
          {{ currentManufacturerDesc }}
        </div>
      </el-form-item>

      <!-- 属性点分配 -->
      <AttributeAllocator
        v-if="character.attributePoints > 0"
        :attribute-points="character.attributePoints"
        :attribute-limit="character.attributeLimit"
        :attributes="character.attributes"
        :attribute-data="attributeData"
        :source-info="attributePointsInfo"
        @update:attributes="character.attributes = $event"
      />

      <!-- 可展开的角色阐述 -->
      <el-form-item>
        <el-collapse>
          <el-collapse-item title="角色阐述">
            <el-input
              v-model="character.description"
              type="textarea"
              :rows="4"
              placeholder="描述你的角色背景、性格、外貌等..."
            />
            
            <!-- 特质槽位 -->
            <div class="traits-section">
              <div class="trait-slot" v-for="(trait, index) in character.traits" :key="index">
                <span class="trait-label">特质 {{ index + 1 }}</span>
                <el-select v-model="trait.name" placeholder="选择特质">
                  <el-option
                    v-for="t in availableTraits"
                    :key="t.value"
                    :label="t.label"
                    :value="t.value"
                  />
                </el-select>
                <TipButton level="1" :content="trait.description">
                  说明
                </TipButton>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import CyberSelect from "@/components/CyberSelect.vue"
import AttributeAllocator from "@/components/AttributeAllocator.vue"
import TipButton from "@/components/TipButton.vue"
import { useCharacterStore } from "@/stores/character"

// 导入数据
import hardwareSpecData from "@/data/硬件规格.json"
import manufacturerData from "@/data/企业技术.json"
import attributeDataJson from "@/data/基本属性.json"

// 使用 character store（与 M0 共享角色名称）
const characterStore = useCharacterStore()

// 角色数据
const character = reactive({
  name: "",
  hardwareSpec: "",
  manufacturer: "",
  baseAttributePoints: 0,
  attributePoints: 0,
  attributeLimit: 5,
  attributes: { structure: 0, strength: 0, athletics: 0, compute: 0, information: 0, power: 0 },
  description: "",
  traits: [
    { name: "", description: "" },
    { name: "", description: "" }
  ]
})

// 数据列表
const hardwareSpecList = hardwareSpecData
const manufacturerList = manufacturerData
const attributeData = attributeDataJson.attributeSystem

// 硬件规格选项
const hardwareSpecOptions = hardwareSpecList.map((item) => ({
  label: item.name,
  value: item.name,
  extra: `属性点:${item.effect.attributePointsBonus} | 上限:${item.effect.attributeLimitBonus}`,
}))

// 生产企业选项
const manufacturerOptions = manufacturerList.map((item) => ({
  label: item.nameZh,
  value: item.nameZh,
  extra: item.nameEn,
}))

// 当前硬件规格的详细描述（用于 tip）
const currentHardwareFullDesc = computed(() => {
  if (!character.hardwareSpec) return ""
  const selected = hardwareSpecList.find((item) => item.name === character.hardwareSpec)
  return selected ? selected.description || "" : ""
})

// 当前硬件规格的效果描述（用于下方说明文字）
const currentHardwareEffectDesc = computed(() => {
  if (!character.hardwareSpec) return ""
  const selected = hardwareSpecList.find((item) => item.name === character.hardwareSpec)
  return selected ? selected.effectDescription || "" : ""
})

// 当前企业描述
const currentManufacturerDesc = computed(() => {
  if (!character.manufacturer) return ""
  const selected = manufacturerList.find((item) => item.nameZh === character.manufacturer)
  return selected ? selected.effectDescription || "" : ""
})

// 企业属性加值
const manufacturerAttributeBonus = computed(() => {
  if (!character.manufacturer) return 0
  const selected = manufacturerList.find((item) => item.nameZh === character.manufacturer)
  return selected?.effect?.attributePointsBonus || 0
})

// 属性点来源信息
const attributePointsInfo = computed(() => {
  const bonus = manufacturerAttributeBonus.value
  return `硬件规格：${character.baseAttributePoints}${bonus > 0 ? ` + 企业加值：${bonus}` : ""}`
})

// 可用特质列表（示例）
const availableTraits = [
  { label: "战斗本能", value: "combat", description: "战斗时获得额外加值" },
  { label: "技术专家", value: "tech", description: "技术检定获得优势" },
  { label: "社交达人", value: "social", description: "社交互动更加顺利" },
  { label: "侦查敏锐", value: "scout", description: "侦查和感知能力增强" }
]

// 硬件规格变更
const onHardwareChange = (value) => {
  const selected = hardwareSpecList.find((item) => item.name === value)
  if (selected) {
    character.baseAttributePoints = selected.effect.attributePointsBonus
    character.attributeLimit = 5
    character.attributes = { structure: 0, strength: 0, athletics: 0, compute: 0, information: 0, power: 0 }
    character.manufacturer = ""
    character.attributePoints = character.baseAttributePoints
  }
}

// 企业变更
const onEnterpriseChange = (value) => {
  if (!value) {
    character.attributePoints = character.baseAttributePoints
    ElMessage.info("已取消选择生产企业")
  } else {
    const selected = manufacturerList.find((item) => item.nameZh === value)
    if (selected) {
      const bonus = selected.effect?.attributePointsBonus || 0
      character.attributePoints = character.baseAttributePoints + bonus
      ElMessage.success(`已选择 ${selected.nameZh}${bonus > 0 ? ` (属性点 +${bonus})` : ""}`)
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

  .traits-section {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trait-slot {
    display: flex;
    align-items: center;
    gap: 8px;

    .trait-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      min-width: 60px;
    }

    .el-select {
      flex: 1;
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
