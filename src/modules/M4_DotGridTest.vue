<!--
  模块编号：M4
  模块名称：涂写格子测试
  显示模式：doll-prep, human-prep
  功能：展示 DotGridAllocator 组件
-->
<template>
  <div class="module-m4-test">
    <h3 class="module-title">涂写格子测试 (M4)</h3>
    
    <div class="test-section">
      <h4>人形属性测试</h4>
      <DotGridAllocator
        v-model="testAttributes.structure"
        :max="5"
        label="结构"
        description="决定基础HP上限"
        show-value
      />
      <DotGridAllocator
        v-model="testAttributes.power"
        :max="5"
        label="出力"
        description="决定近战攻击威力上限"
        show-value
      />
      <DotGridAllocator
        v-model="testAttributes.athletics"
        :max="5"
        label="运动"
        description="决定移动能力和闪避"
        show-value
      />
    </div>

    <div class="test-section">
      <h4>人类技能测试</h4>
      <DotGridAllocator
        v-model="testSkills.melee"
        :max="5"
        label="体术"
        description="近战格斗，决定近战武器加值"
        show-value
      />
      <DotGridAllocator
        v-model="testSkills.dodge"
        :max="5"
        label="闪避"
        description="直接决定防御加值"
        show-value
      />
      <DotGridAllocator
        v-model="testSkills.gun"
        :max="5"
        label="枪械"
        description="决定轻武器射击加值"
        show-value
      />
    </div>

    <div class="test-info">
      <p>当前属性值: {{ testAttributes }}</p>
      <p>当前技能值: {{ testSkills }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import DotGridAllocator from '@/components/DotGridAllocator.vue'

// 测试数据
const testAttributes = reactive({
  structure: 0,
  power: 0,
  athletics: 0
})

const testSkills = reactive({
  melee: 0,
  dodge: 0,
  gun: 0
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.module-m4-test {
  width: 100%;

  .module-title {
    color: $cyber-cyan;
    margin: 0 0 16px 0;
    font-size: 16px;
    border-bottom: 1px solid rgba(0, 243, 255, 0.2);
    padding-bottom: 8px;
  }

  .test-section {
    margin-bottom: 24px;

    h4 {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0 0 12px 0;
      font-family: "Courier New", "Consolas", monospace;
    }
  }

  .test-info {
    margin-top: 20px;
    padding: 12px;
    background: rgba(0, 243, 255, 0.05);
    border-radius: 4px;
    font-family: "Courier New", "Consolas", monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);

    p {
      margin: 4px 0;
    }
  }
}
</style>
