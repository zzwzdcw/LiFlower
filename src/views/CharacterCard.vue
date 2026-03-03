<template>
  <div class="character-card-container">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <div class="title-section">
        <h1 class="main-title">锂之花 <span class="title-separator">//</span> 角色卡</h1>
        <p class="sub-title">Lithium Lilith Ludus <span class="version">v0.8</span></p>
      </div>
      <div class="type-switcher">
        <div class="switch-segments">
          <div
            class="segment"
            :class="{ active: character.类型 === 'Anthropos' }"
            @click="onTypeChange('Anthropos')"
          >
            人类 Anthropos
          </div>
          <div
            class="segment"
            :class="{ active: character.类型 === 'Anthroform' }"
            @click="onTypeChange('Anthroform')"
          >
            人形 Anthroform
          </div>
        </div>
      </div>
    </div>

    <div class="three-column-layout">
      <!-- 左栏：当前表单 -->
      <div class="column column-left">
        <el-card class="form-card">
          <template #header>
            <span class="card-header">基本信息</span>
          </template>
          <el-form :model="角色" label-position="top">
            <el-form-item label="角色名称" required>
              <el-input
                v-model="character.姓名"
                placeholder="请输入角色名称"
                size="large"
              />
            </el-form-item>

            <el-form-item
              v-if="character.类型 === 'Anthroform'"
              label="硬件规格"
              required
            >
              <div style="display: flex; align-items: center; gap: 8px; width: 100%">
                <CyberSelect
                  v-model="character.硬件规格"
                  placeholder="请选择硬件规格"
                  :options="硬件规格选项"
                  @change="onHardwareChange"
                  style="flex: 1; min-width: 0"
                />
                <el-popover
                  v-if="当前硬件描述"
                  placement="right"
                  :width="300"
                  trigger="hover"
                  :content="当前硬件描述"
                >
                  <template #reference>
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </template>
                </el-popover>
              </div>
            </el-form-item>

            <el-form-item v-if="character.类型 === 'Anthroform'" label="生产企业">
              <div style="display: flex; align-items: center; gap: 8px; width: 100%">
                <CyberSelect
                  v-model="character.企业技术"
                  placeholder="请选择生产企业（可选）"
                  :options="企业技术选项"
                  clearable
                  @change="onEnterpriseChange"
                  style="flex: 1; min-width: 0"
                />
                <el-popover
                  v-if="当前企业描述"
                  placement="right"
                  :width="300"
                  trigger="hover"
                  :content="当前企业描述"
                >
                  <template #reference>
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </template>
                </el-popover>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 中间栏：待添加 -->
      <div class="column column-middle">
        <el-card class="placeholder-card">
          <template #header>
            <span class="card-header">中间栏位</span>
          </template>
          <div class="placeholder-content">
            <el-icon size="48" color="#c0c4cc"><Plus /></el-icon>
            <p>待添加内容</p>
          </div>
        </el-card>
      </div>

      <!-- 右栏：待添加 -->
      <div class="column column-right">
        <el-card class="placeholder-card">
          <template #header>
            <span class="card-header">右边栏位</span>
          </template>
          <div class="placeholder-content">
            <el-icon size="48" color="#c0c4cc"><Plus /></el-icon>
            <p>待添加内容</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, InfoFilled } from "@element-plus/icons-vue";
import CyberSelect from "@/components/CyberSelect.vue";
import 硬件规格数据 from "@/data/硬件规格.json";
import 企业技术数据 from "@/data/企业技术.json";

const character = reactive({
  姓名: "",
  类型: "Anthropos",
  硬件规格: "",
  企业技术: "",
  起源: "",
  属性点: "",
  属性上限: 0,
});

const 硬件规格列表 = 硬件规格数据;
const 企业技术列表 = 企业技术数据;

// 转换数据为选项格式
const 硬件规格选项 = 硬件规格列表.map((item) => ({
  label: item.名称,
  value: item.名称,
  extra: `属性点:${item.效果.属性点数加值} | 上限加值:${item.效果.属性上限加值}`,
}));

const 企业技术选项 = 企业技术列表.map((item) => ({
  label: item.中文名,
  value: item.中文名,
  extra: item.英文名,
}));

// 计算属性：获取当前选择的硬件规格描述
const 当前硬件描述 = computed(() => {
  if (!character.硬件规格) return "";
  const selected = 硬件规格列表.find((item) => item.名称 === character.硬件规格);
  return selected ? selected.描述 : "";
});

// 计算属性：获取当前选择的企业技术描述
const 当前企业描述 = computed(() => {
  if (!character.企业技术) return "";
  const selected = 企业技术列表.find((item) => item.中文名 === character.企业技术);
  return selected ? selected.描述 : "";
});

const onTypeChange = (type) => {
  character.类型 = type;
  if (type === "Anthropos") {
    character.硬件规格 = "";
    character.企业技术 = "";
    character.属性点 = "";
  }
};

const onHardwareChange = (value) => {
  const selected = 硬件规格列表.find((item) => item.名称 === value);
  if (selected) {
    character.属性点 = selected.效果.属性点数加值;
    character.分配属性点上限 = selected.效果.属性点数加值 + selected.效果.属性上限加值;
  }
};

const onEnterpriseChange = (value) => {
  if (!value) {
    character.企业技术 = "";
  } else {
    const selected = 企业技术列表.find((item) => item.中文名 === value);
    if (selected) {
      ElMessage.success(
        `已选择 ${selected.中文名} - ${selected.特殊效果 || "无特殊效果"}`
      );
    }
  }
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
  padding-bottom: 40px;
}

// 顶部标题栏
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.95), rgba(26, 26, 46, 0.95));
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
    background: linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(188, 19, 254, 0.3));
    color: $cyber-cyan;
    font-weight: 700;
    box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.2);
  }
}

// 三栏布局
.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  padding: 30px 40px;
  max-width: 1800px;
  margin: 0 auto;
}

.column {
  min-width: 0;
}

.form-card,
.placeholder-card {
  height: 100%;
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(10, 10, 15, 0.95));
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 243, 255, 0.15);
    border-color: rgba(0, 243, 255, 0.4);
  }
}

.card-header {
  font-size: 14px;
  font-weight: 600;
  color: $cyber-cyan;
  font-family: "Courier New", "Consolas", monospace;
  letter-spacing: 2px;
}

:deep(.el-card__header) {
  background: rgba(10, 10, 15, 0.8);
  border-bottom-color: rgba(0, 243, 255, 0.2);
  padding: 14px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

// 表单样式
:deep(.el-form-item__label) {
  color: $cyber-cyan;
  font-family: "Courier New", "Consolas", monospace;
  font-size: 12px;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

:deep(.el-form-item) {
  width: 100%;
}

:deep(.el-form-item__content) {
  width: 100% !important;
}

// 信息图标样式
.info-icon {
  color: $cyber-cyan;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: rgba(0, 243, 255, 0.7);
    transform: scale(1.1);
  }
}

// Popover 样式
:deep(.el-popover) {
  background: rgba(10, 10, 15, 0.98) !important;
  border: 1px solid rgba(0, 243, 255, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 243, 255, 0.15) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 13px;
  line-height: 1.6;
}

// 输入框样式
:deep(.el-input__wrapper) {
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.2);
  box-shadow: none;

  .el-input__inner {
    color: #fff;
    font-family: "Courier New", "Consolas", monospace;
  }

  &:focus-within {
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
    border-color: $cyber-cyan;
  }
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(0, 243, 255, 0.4);

  p {
    margin-top: 16px;
    font-size: 13px;
    color: rgba(192, 196, 204, 0.5);
    font-family: "Courier New", "Consolas", monospace;
  }
}

// 响应式
@media (max-width: 1200px) {
  .three-column-layout {
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
  .three-column-layout {
    grid-template-columns: 1fr 1fr;
  }

  .column-right {
    grid-column: span 2;
  }
}
</style>
