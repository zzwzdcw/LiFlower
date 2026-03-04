<!--
  模块编号：M3
  模块名称：属性（人形）
  显示模式：doll-prep
  显示条件：人形整备模式 AND 已选择硬件规格（由 StandardModule 控制）
  功能：6属性涂格子加点
-->
<template>
  <div class="module-doll-attributes">
    <h3 class="module-title">属性点分配</h3>
    <!-- 属性点分配器 -->
    <AttributeAllocator
      :attribute-points="characterStore.totalAttributePoints"
      :attribute-limit="characterStore.attributeLimit"
      :attributes="characterStore.attributes"
      :attribute-data="attributeData"
      :source-info="attributePointsInfo"
      :show-divider="false"
      :modifier-rules="modifierRules"
      @update:attributes="characterStore.updateAttributes"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/character'
import AttributeAllocator from '@/components/AttributeAllocator.vue'

// 导入属性数据
import attributeDataJson from '@/data/基本属性.json'

// 使用 store
const characterStore = useCharacterStore()

// 属性数据
const attributeData = attributeDataJson.attributeSystem

// 属性点来源信息
const attributePointsInfo = computed(() => {
  const base = characterStore.baseAttributePoints
  const bonus = characterStore.totalAttributePoints - base
  if (bonus > 0) {
    return `硬件规格：${base} + 企业加值：${bonus}`
  }
  return `硬件规格：${base}`
})

// 调整值规则（示例：暗隼电子 -> 算力+1）
const modifierRules = [
  {
    id: 'darkhawk_compute',
    watch: () => characterStore.manufacturer,
    match: '暗隼电子',
    value: 1,
    target: 'compute'
  }
]
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-doll-attributes {
  width: 100%;

  .module-title {
    color: $cyber-cyan;
    margin: 0 0 16px 0;
    font-size: 16px;
    border-bottom: 1px solid rgba(0, 243, 255, 0.2);
    padding-bottom: 8px;
  }
}
</style>
