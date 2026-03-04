<template>
  <div class="character-card-container">
    <!-- ==================== 顶部标题栏（始终显示在最上面）==================== -->
    <div class="top-bar">
      <div class="title-section">
        <h1 class="main-title">锂之花 <span class="title-separator">//</span> 角色卡</h1>
        <p class="sub-title">Lithium Lilith Ludus <span class="version">v0.8</span></p>
      </div>
      <div class="type-switcher">
        <div class="switch-segments">
          <div
            class="segment"
            :class="{ active: isHumanMode }"
            @click="onTypeChange('Anthropos')"
          >
            人类 Anthropos
          </div>
          <div
            class="segment"
            :class="{ active: isDollMode }"
            @click="onTypeChange('Anthroform')"
          >
            人形 Anthroform
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 模块网格（按顺序排列）==================== -->
    <div
      class="modules-container"
      :class="{
        'debug-mode': modeStore.currentMode === 'debug',
        'welcome-layout': modeStore.currentMode === 'welcome'
      }"
    >
      <!-- M0: 导入 -->
      <StandardModule module-id="M0" :show-in-modes="['welcome']">
        <M0_Import />
      </StandardModule>

      <!-- M1: 人类车卡-基础信息 -->
      <StandardModule module-id="M1" :show-in-modes="['human-prep']">
        <M1_HumanBasic />
      </StandardModule>

      <!-- M2: 人形车卡-基础信息 -->
      <StandardModule module-id="M2" :show-in-modes="['doll-prep']">
        <M2_DollBasic />
      </StandardModule>

      <!-- M3: 属性（人形）- 仅在选择了硬件规格后显示 -->
      <StandardModule
        module-id="M3"
        :show-in-modes="['doll-prep']"
        :show-when="() => characterStore.hasHardwareSpec"
      >
        <M3_DollAttributes />
      </StandardModule>

      <!-- M4: 属性（人类）- 特殊情况下显示 -->
      <StandardModule module-id="M4" :show-in-modes="['human-prep']">
        <M4_HumanAttributes />
      </StandardModule>

      <!-- M5: 技能（人类） -->
      <StandardModule module-id="M5" :show-in-modes="['human-prep']">
        <M5_HumanSkills />
      </StandardModule>

      <!-- M6: 专长（人类） -->
      <StandardModule module-id="M6" :show-in-modes="['human-prep']">
        <M6_HumanTalents />
      </StandardModule>

      <!-- M7: 人形芯片 -->
      <StandardModule module-id="M7" :show-in-modes="['doll-prep']">
        <M7_DollChips />
      </StandardModule>

      <!-- M8: 装备（人类） -->
      <StandardModule module-id="M8" :show-in-modes="['human-prep']">
        <M8_HumanGear />
      </StandardModule>

      <!-- M9: 尖端武装（人形） -->
      <StandardModule module-id="M9" :show-in-modes="['doll-prep']">
        <M9_DollWeapon />
      </StandardModule>

      <!-- M10: 装备（人形） -->
      <StandardModule module-id="M10" :show-in-modes="['doll-prep']">
        <M10_DollGear />
      </StandardModule>

      <!-- M11: 预留模块（仅调试模式显示） -->
      <StandardModule module-id="M11" :show-in-modes="['debug']">
        <M11_Empty />
      </StandardModule>

      <!-- M12: 基础资料（人类） -->
      <StandardModule module-id="M12" :show-in-modes="['human-action']">
        <M12_HumanBasicInfo />
      </StandardModule>

      <!-- M13: 基础资料（人形） -->
      <StandardModule module-id="M13" :show-in-modes="['doll-action']">
        <M13_DollBasicInfo />
      </StandardModule>

      <!-- M14: 检定数据（人类） -->
      <StandardModule module-id="M14" :show-in-modes="['human-action']">
        <M14_HumanCheck />
      </StandardModule>

      <!-- M15: 检定数据（人形） -->
      <StandardModule module-id="M15" :show-in-modes="['doll-action']">
        <M15_DollCheck />
      </StandardModule>

      <!-- M16: 角色状态（人类） -->
      <StandardModule module-id="M16" :show-in-modes="['human-action']">
        <M16_HumanStatus />
      </StandardModule>

      <!-- M17: 角色状态（人形） -->
      <StandardModule module-id="M17" :show-in-modes="['doll-action']">
        <M17_DollStatus />
      </StandardModule>

      <!-- M18: 备忘录 -->
      <StandardModule module-id="M18" :show-in-modes="['human-action', 'doll-action']">
        <M18_Memo />
      </StandardModule>

      <!-- M97: 转换按钮（作为分割线，占满整行，裸样式） -->
      <StandardModule
        module-id="M97"
        :show-in-modes="['human-prep', 'human-action', 'doll-prep', 'doll-action']"
        class="module-functional module-divider-row"
        :bare="true"
      >
        <M97_Switch />
      </StandardModule>

      <!-- M98: 导入导出（功能性模块，沉底） -->
      <StandardModule
        module-id="M98"
        :show-in-modes="['human-prep', 'human-action', 'doll-prep', 'doll-action']"
        class="module-functional"
      >
        <M98_DataManager />
      </StandardModule>

      <!-- M99: 清除缓存（功能性模块，沉底，欢迎模式不显示） -->
      <StandardModule
        module-id="M99"
        :show-in-modes="['human-prep', 'human-action', 'doll-prep', 'doll-action']"
        class="module-functional"
      >
        <M99_ClearCache />
      </StandardModule>
    </div>

    <!-- ==================== 调试控制栏（开发调试用，可随时删除）==================== -->
    <div class="debug-bar">
      <div class="debug-title">🛠️ 开发调试工具（可删除）</div>
      <div class="debug-controls">
        <button
          v-for="mode in modeList"
          :key="mode.value"
          :class="['debug-btn', { active: modeStore.currentMode === mode.value }]"
          @click="modeStore.setMode(mode.value)"
        >
          {{ mode.label }}
        </button>
        <div class="divider"></div>
        <button
          :class="['debug-btn', 'debug-toggle', { active: modeStore.isDebug }]"
          @click="modeStore.toggleDebug()"
        >
          {{ modeStore.isDebug ? '🔍 退出调试' : '🔍 调试模式' }}
        </button>
      </div>
      <div class="debug-info">
        当前: {{ currentModeLabel }} | 显示模块数: {{ visibleModuleCount }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { useModeStore } from "@/stores/mode";
import { useCharacterStore } from "@/stores/character";
import StandardModule from "@/components/StandardModule.vue";

// ==================== 导入所有模块 ====================
import M0_Import from "@/modules/M0_Import.vue";
import M1_HumanBasic from "@/modules/M1_HumanBasic.vue";
import M2_DollBasic from "@/modules/M2_DollBasic.vue";
import M3_DollAttributes from "@/modules/M3_DollAttributes.vue";
import M4_HumanAttributes from "@/modules/M4_HumanAttributes.vue";
import M5_HumanSkills from "@/modules/M5_HumanSkills.vue";
import M6_HumanTalents from "@/modules/M6_HumanTalents.vue";
import M7_DollChips from "@/modules/M7_DollChips.vue";
import M8_HumanGear from "@/modules/M8_HumanGear.vue";
import M9_DollWeapon from "@/modules/M9_DollWeapon.vue";
import M10_DollGear from "@/modules/M10_DollGear.vue";
import M11_Empty from "@/modules/M11_Empty.vue";
import M12_HumanBasicInfo from "@/modules/M12_HumanBasicInfo.vue";
import M13_DollBasicInfo from "@/modules/M13_DollBasicInfo.vue";
import M14_HumanCheck from "@/modules/M14_HumanCheck.vue";
import M15_DollCheck from "@/modules/M15_DollCheck.vue";
import M16_HumanStatus from "@/modules/M16_HumanStatus.vue";
import M17_DollStatus from "@/modules/M17_DollStatus.vue";
import M18_Memo from "@/modules/M18_Memo.vue";
import M97_Switch from "@/modules/M97_Switch.vue";
import M98_DataManager from "@/modules/M98_DataManager.vue";
import M99_ClearCache from "@/modules/M99_ClearCache.vue";

// ==================== 初始化 ====================
const modeStore = useModeStore();
const characterStore = useCharacterStore();

// ==================== 模式列表（用于调试栏）====================
const modeList = [
  { value: "welcome", label: "欢迎" },
  { value: "human-prep", label: "人类整备" },
  { value: "human-action", label: "人类行动" },
  { value: "doll-prep", label: "人形整备" },
  { value: "doll-action", label: "人形行动" },
];

// ==================== 计算属性 ====================
const currentModeLabel = computed(() => {
  const mode = modeList.find((m) => m.value === modeStore.currentMode);
  return mode?.label || modeStore.currentMode;
});

// 判断当前是否是人类相关模式（用于顶部按钮高亮）
const isHumanMode = computed(() => {
  return (
    modeStore.currentMode === "human-prep" ||
    modeStore.currentMode === "human-action" ||
    (modeStore.currentMode === "welcome" && modeStore.characterType === "human")
  );
});

// 判断当前是否是人形相关模式（用于顶部按钮高亮）
const isDollMode = computed(() => {
  return (
    modeStore.currentMode === "doll-prep" ||
    modeStore.currentMode === "doll-action" ||
    (modeStore.currentMode === "welcome" && modeStore.characterType === "doll")
  );
});

// 计算当前显示的模块数（调试用）
const visibleModuleCount = computed(() => {
  if (modeStore.isDebug) return 22; // 调试模式显示所有
  const mode = modeStore.currentMode;
  const moduleVisibility = {
    welcome: 2, // M0, M99
    "human-prep": 9, // M1, M4, M5, M6, M8, M97, M98, M99 + 其他
    "human-action": 5, // M12, M14, M16, M18, M97, M98, M99
    "doll-prep": 10, // M2, M3, M7, M9, M10, M97, M98, M99
    "doll-action": 5, // M13, M15, M17, M18, M97, M98, M99
  };
  return moduleVisibility[mode] || 0;
});

// ==================== 方法 ====================
const onTypeChange = (type) => {
  // 如果在欢迎模式，点击按钮直接切换到对应的车卡模式
  if (modeStore.currentMode === "welcome") {
    if (type === "Anthropos") {
      enterHumanPrep();
    } else if (type === "Anthroform") {
      enterDollPrep();
    }
    return;
  }

  // 在其他模式下，切换到对应的模式
  if (type === "Anthropos") {
    // 当前是人类相关模式，切换到人类整备模式
    modeStore.setCharacterType("human");
    modeStore.setMode("human-prep");
    ElMessage.success("切换到人类整备模式");
  } else if (type === "Anthroform") {
    // 当前是人形相关模式，切换到人形整备模式
    modeStore.setCharacterType("doll");
    modeStore.setMode("doll-prep");
    ElMessage.success("切换到人形整备模式");
  }
};

const enterHumanPrep = () => {
  modeStore.setCharacterType("human");
  modeStore.setMode("human-prep");
  ElMessage.success("进入人类整备模式");
};

const enterDollPrep = () => {
  modeStore.setCharacterType("doll");
  modeStore.setMode("doll-prep");
  ElMessage.success("进入人形整备模式");
};
</script>

<style lang="scss" scoped>
// 赛博朋克配色
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-dark: #0a0a0f;
$cyber-darker: #050508;

.character-card-container {
  min-height: 100vh;
  background-color: $cyber-darker;
  padding-bottom: 100px; // 为调试栏留出空间
}

// ==================== 顶部标题栏 ====================
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.95),
    rgba(26, 26, 46, 0.95)
  );
  border-bottom: 2px solid $cyber-cyan;
  box-shadow: 0 4px 20px rgba(0, 243, 255, 0.15);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, $cyber-cyan, transparent);
  }
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: $cyber-cyan;
  margin: 0;
  font-family: "Courier New", "Consolas", monospace;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
  letter-spacing: 4px;

  .title-separator {
    color: $cyber-purple;
    margin: 0 8px;
  }
}

.sub-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0 0;
  font-family: "Courier New", "Consolas", monospace;
  letter-spacing: 2px;

  .version {
    color: $cyber-purple;
    font-weight: 700;
  }
}

// 类型切换器
.type-switcher {
  flex-shrink: 0;
}

.switch-segments {
  display: flex;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.segment {
  padding: 12px 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Courier New", "Consolas", monospace;
  border-right: 1px solid rgba(0, 243, 255, 0.2);

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: rgba(0, 243, 255, 0.1);
    color: $cyber-cyan;
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgba(0, 243, 255, 0.3),
      rgba(188, 19, 254, 0.3)
    );
    color: $cyber-cyan;
    font-weight: 700;
    box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.2);
  }
}

// ==================== 模块容器（瀑布流/卡片式布局）====================
.modules-container {
  // 使用 CSS Columns 实现瀑布流布局
  column-count: 3;
  column-gap: 20px;
  padding: 30px 40px;
  max-width: 1600px;
  margin: 0 auto;

  // 防止模块被截断
  :deep(.module-container) {
    break-inside: avoid;
    margin-bottom: 20px;
  }

  // 调试模式：显示所有模块
  &.debug-mode {
    :deep(.module-container) {
      display: block !important;
    }
  }

  // 平板：2列
  @media (max-width: 1200px) {
    column-count: 2;
    padding: 20px;
  }

  // 手机：单列
  @media (max-width: 768px) {
    column-count: 1;
    padding: 16px;
  }

  // ==================== 欢迎模式特殊布局 ====================
  &.welcome-layout {
    // 使用 Flex 布局实现居中
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;

    // 普通模块（非功能性）
    :deep(.module-container:not(.module-functional)) {
      width: 400px;
      max-width: 90%;
      break-inside: unset; // 取消瀑布流的防截断
    }

    // 功能性模块在欢迎模式下也沉底
    :deep(.module-functional) {
      width: 100%;
      max-width: 400px;
      order: 999;
      margin-top: 20px;
      opacity: 0.7;
    }

    // 手机端恢复单列
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;

      :deep(.module-container) {
        width: 100%;
        max-width: 100%;
      }
    }
  }

  // ==================== 功能性模块样式（M98、M99）====================
  :deep(.module-functional) {
    // 视觉上与主模块区分开（但保持实线边框）
    opacity: 0.9;
    border-color: rgba(0, 243, 255, 0.25);

    // 悬停时恢复正常亮度和边框
    &:hover {
      opacity: 1;
      border-color: rgba(0, 243, 255, 0.4);
    }
  }

  // ==================== M97 作为分割线（占满整行，裸样式）====================
  // 注意：M97 同时有 module-functional 和 bare 类，但 bare 优先级更高
  :deep(.module-divider-row) {
    // 瀑布流中占据整行
    column-span: all;
    width: 100%;

    // 普通间距，和其他模块一样
    margin-top: 20px;

    // 强制无边框（覆盖 module-functional 的样式）
    border: none !important;
    background: transparent !important;

    // 内容居中
    :deep(.module-content) {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

// ==================== 调试控制栏 ====================
.debug-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.98),
    rgba(26, 26, 46, 0.98)
  );
  border-top: 2px solid $cyber-cyan;
  padding: 12px 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 -4px 20px rgba(0, 243, 255, 0.15);
}

.debug-title {
  font-size: 12px;
  color: $cyber-cyan;
  font-family: "Courier New", "Consolas", monospace;
  letter-spacing: 2px;
}

.debug-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.debug-btn {
  padding: 8px 16px;
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-family: "Courier New", "Consolas", monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 243, 255, 0.2);
    border-color: $cyber-cyan;
    color: $cyber-cyan;
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgba(0, 243, 255, 0.3),
      rgba(188, 19, 254, 0.3)
    );
    border-color: $cyber-cyan;
    color: $cyber-cyan;
    font-weight: 700;
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
  }

  &.debug-toggle {
    border-color: $cyber-purple;
    background: rgba(188, 19, 254, 0.1);

    &:hover {
      border-color: $cyber-purple;
      color: $cyber-purple;
    }

    &.active {
      background: linear-gradient(
        135deg,
        rgba(188, 19, 254, 0.3),
        rgba(0, 243, 255, 0.3)
      );
      border-color: $cyber-purple;
      color: $cyber-purple;
    }
  }
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 243, 255, 0.3);
  margin: 0 8px;
}

.debug-info {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: "Courier New", "Consolas", monospace;
}

// ==================== 响应式 ====================
@media (max-width: 1200px) {
  .modules-container {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .top-bar {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .title-section {
    text-align: center;
  }

  .main-title {
    font-size: 24px;
  }

  .switch-segments {
    width: 100%;
  }

  .segment {
    flex: 1;
    text-align: center;
  }
}

@media (min-width: 1201px) and (max-width: 1600px) {
  .modules-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
