<template>
  <div class="character-card-container">
    <div class="page-header">
      <h1 class="page-title">锂之花角色卡</h1>
    </div>

    <div class="three-column-layout">
      <!-- 左栏:当前表单 -->
      <div class="column column-left">
        <el-card class="form-card">
          <template #header>
            <span class="card-header">基本信息</span>
          </template>
          <el-form :model="角色" label-position="top">
            <el-form-item label="角色名称" required>
              <el-input v-model="角色.姓名" placeholder="请输入角色名称" size="large" />
            </el-form-item>

            <el-form-item label="形态类型" required>
              <div class="type-selector">
                <div
                  class="type-btn"
                  :class="{ active: 角色.类型 === 'human' }"
                  @click="onTypeChange('human')"
                >
                  <el-icon size="36"><User /></el-icon>
                  <span>人类</span>
                </div>
                <div
                  class="type-btn"
                  :class="{ active: 角色.类型 === 'android' }"
                  @click="onTypeChange('android')"
                >
                  <el-icon size="36"><Avatar /></el-icon>
                  <span>人形</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item v-if="角色.类型 === 'android'" label="硬件规格" required>
              <el-select
                v-model="角色.硬件规格"
                placeholder="请选择硬件规格"
                size="large"
                style="width: 100%"
              >
                <el-option
                  v-for="item in 硬件规格列表"
                  :key="item.id"
                  :label="item.名称"
                  :value="item.名称"
                >
                  <span>{{ item.名称 }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    属性点:{{ item.属性点 }} | 拓展:{{ item.属性上限拓展 }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 中间栏:待添加 -->
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

      <!-- 右栏:待添加 -->
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
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { User, Avatar, Plus } from "@element-plus/icons-vue";
import 硬件规格数据 from "@/data/硬件规格.json";

const 角色 = reactive({
  姓名: "",
  类型: "",
  硬件规格: "",
  起源: "",
});

const 硬件规格列表 = 硬件规格数据;

const onTypeChange = (type) => {
  角色.类型 = type;
  if (type === "human") {
    角色.硬件规格 = "";
  }
};
</script>

<style lang="scss" scoped>
.character-card-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.page-header {
  padding: 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  padding: 0 24px;
  max-width: 1800px;
  margin: 0 auto;
}

.column {
  min-width: 0;
}

.form-card,
.placeholder-card {
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom-color: #ebeef5;
  padding: 16px 20px;
}

:deep(.el-card__body) {
  padding: 24px;
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;

  span {
    margin-top: 8px;
    font-size: 14px;
    color: #606266;
  }

  &:hover {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  &.active {
    border-color: #409eff;
    background-color: #ecf5ff;

    span {
      color: #409eff;
      font-weight: 500;
    }

    .el-icon {
      color: #409eff;
    }
  }
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;

  p {
    margin-top: 16px;
    font-size: 14px;
    color: #c0c4cc;
  }
}

// 响应式:移动端单栏
@media (max-width: 1024px) {
  .three-column-layout {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }

  .page-title {
    font-size: 28px;
    letter-spacing: 6px;
  }

  .column {
    order: 0;
  }
}

// 平板端双栏
@media (min-width: 1025px) and (max-width: 1400px) {
  .three-column-layout {
    grid-template-columns: 1fr 1fr;
  }

  .column-right {
    grid-column: span 2;
  }
}
</style>
