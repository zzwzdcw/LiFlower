<template>
  <div class="mode-container">
    <div class="mode-header">
      <h2>人类整备模式 // HUMAN PREP MODE</h2>
      <p class="mode-desc">车卡阶段 - 创建你的人类角色</p>
    </div>

    <div class="modules-grid">
      <!-- 模块1：人类车卡-基础信息 -->
      <div class="module-card" data-module="M1">
        <div class="module-header">
          <span class="module-number">M1</span>
          <span class="module-name">人类基础信息</span>
        </div>
        <div class="module-content">
          <p>出身选择、能力信息、角色阐述、特质槽位</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块4：属性（人类） -->
      <div class="module-card" data-module="M4">
        <div class="module-header">
          <span class="module-number">M4</span>
          <span class="module-name">人类属性</span>
        </div>
        <div class="module-content">
          <p>6个属性涂格子加点（仅在特殊出身时出现）</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块5：技能（人类） -->
      <div class="module-card" data-module="M5">
        <div class="module-header">
          <span class="module-number">M5</span>
          <span class="module-name">人类技能</span>
        </div>
        <div class="module-content">
          <p>16个技能，加减按钮，可负值人性</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块6：专长（人类） -->
      <div class="module-card" data-module="M6">
        <div class="module-header">
          <span class="module-number">M6</span>
          <span class="module-name">人类专长</span>
        </div>
        <div class="module-content">
          <p>2-6个专长槽，大脑电子化按钮，关联检定</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块8：装备（人类） -->
      <div class="module-card" data-module="M8">
        <div class="module-header">
          <span class="module-number">M8</span>
          <span class="module-name">人类装备</span>
        </div>
        <div class="module-content">
          <p>装备槽（名称/加值/用途），2-8个槽位</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块97：转换按钮 -->
      <div class="module-card highlight" data-module="M97">
        <div class="module-header">
          <span class="module-number">M97</span>
          <span class="module-name">模式转换</span>
        </div>
        <div class="module-content">
          <el-button type="primary" size="large" @click="switchToAction">
            进入行动模式
          </el-button>
        </div>
      </div>

      <!-- 模块98：导入导出 -->
      <div class="module-card" data-module="M98">
        <div class="module-header">
          <span class="module-number">M98</span>
          <span class="module-name">数据管理</span>
        </div>
        <div class="module-content">
          <p>生成角色代码、读取角色代码、生成文本格式</p>
          <div class="placeholder-area">待实现</div>
        </div>
      </div>

      <!-- 模块99：清除缓存 -->
      <div class="module-card warning" data-module="M99">
        <div class="module-header">
          <span class="module-number">M99</span>
          <span class="module-name">清除缓存</span>
        </div>
        <div class="module-content">
          <el-button type="danger" plain>清除浏览器缓存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModeStore } from '@/stores/mode'

const modeStore = useModeStore()

const switchToAction = () => {
  modeStore.switchMode('human-action')
}
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;

.mode-container {
  padding: 20px;
}

.mode-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    color: $cyber-cyan;
    font-family: "Courier New", monospace;
    margin: 0;
  }

  .mode-desc {
    color: rgba(255, 255, 255, 0.6);
    margin-top: 8px;
  }
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.module-card {
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 8px;
  padding: 16px;

  &.highlight {
    border-color: $cyber-purple;
    background: rgba(188, 19, 254, 0.1);
  }

  &.warning {
    border-color: #ff5252;
    background: rgba(255, 82, 82, 0.1);
  }
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.module-number {
  background: $cyber-cyan;
  color: $cyber-dark;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  font-family: "Courier New", monospace;
}

.module-name {
  color: #fff;
  font-weight: 600;
}

.module-content {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.placeholder-area {
  margin-top: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}
</style>
