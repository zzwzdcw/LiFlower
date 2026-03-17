<!--
  电子脑组件
  功能：只读的电子脑专长显示（大脑电子化后插入）
-->
<template>
  <div class="talent-item">
    <!-- 第一行：专长名称 + 关联技能（禁用状态的下拉列表） -->
    <div class="form-row name-skill-row">
      <el-input
        value="电子脑"
        class="cyber-input name-input"
        size="small"
        disabled
      />
      <CyberSelect
        v-model="selectedSkill"
        :options="[
          { label: '特殊专长', value: 'special' },
          { label: '────────', value: 'sep1', disabled: true },
          { label: '神经接口', value: 'neural', disabled: true },
          { label: '外部算力', value: 'external', disabled: true }
        ]"
        class="cyber-select skill-select"
        :disabled="true"
      />
    </div>

    <!-- 第二行：限制条件（只读） -->
    <div class="form-row">
      <el-input
        value="可以方便地接入网络，将1AP兑换为1NP。但会受到神经破坏程序的攻击。"
        class="cyber-input"
        size="small"
        disabled
      />
    </div>

    <!-- 第三行：专长描述（只读，无换行） -->
    <div class="form-row">
      <el-input
        type="textarea"
        :rows="3"
        value="电子脑严格意义上属于接口而非算力部件，连供电都没有，但是可以很方便地连接外部算力组件。所以使用电子脑必须有一台电子设备担任主机，有些神经连线会附带VR眼镜进行辅助操作。"
        class="cyber-textarea"
        disabled
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CyberSelect from './CyberSelect.vue'

// 固定选中"特殊专长"
const selectedSkill = ref('special')
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;

.talent-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 243, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  .form-row {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 第一行：名称和技能显示
  .name-skill-row {
    display: flex;
    gap: 8px;
    align-items: center;

    .name-input {
      flex: 1.2;

      :deep(.el-input__inner) {
        color: $cyber-cyan !important;
        font-weight: 600;
      }
    }

    .skill-select {
      flex: 0.8;

      // 确保底色与普通专长组件一致
      :deep(.cyber-select-input) {
        background: rgba(26, 26, 46, 0.8);
        border-color: rgba(0, 243, 255, 0.2);
        min-height: 32px;
        padding: 8px 12px;

        .selected-value {
          color: rgba(255, 255, 255, 0.8);
          font-family: "Courier New", "Consolas", monospace;
          font-size: 13px;
        }
      }
    }
  }

  // 赛博朋克风格输入框（只读状态）
  :deep(.cyber-input) {
    .el-input__wrapper {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      box-shadow: none;

      .el-input__inner {
        color: rgba(255, 255, 255, 0.8);
        font-family: "Courier New", "Consolas", monospace;
        background: transparent;
        font-size: 13px;
        cursor: default;
      }

      &.is-disabled {
        background: rgba(26, 26, 46, 0.5);
      }
    }
  }

  // 赛博朋克风格文本框（只读状态）
  :deep(.cyber-textarea) {
    .el-textarea__inner {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(0, 243, 255, 0.2);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.8);
      font-family: "Courier New", "Consolas", monospace;
      padding: 8px;
      line-height: 1.5;
      font-size: 13px;
      cursor: default;

      &:disabled {
        background: rgba(26, 26, 46, 0.5);
      }
    }
  }

  // CyberSelect 样式调整
  :deep(.cyber-select) {
    width: 100%;
  }
}
</style>
