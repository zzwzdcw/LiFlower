<!--
  模块编号：M7
  模块名称：人形芯片
  显示模式：doll-prep, doll-action
-->
<template>
  <div class="module-m7">
    <h3 class="module-title">人形芯片</h3>
    <div class="placeholder">
      <p>芯片槽位管理</p>
      <ul>
        <li>芯片类型选择（未安装/专利芯片/常规芯片）</li>
        <li>专利芯片名称选择（基于企业）</li>
        <li>功能选择（技能熟练/额外程序）</li>
        <li>技能选择及升级</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.module-m7 {
  padding: 16px;
}
.module-title {
  color: #00f3ff;
  margin: 0 0 16px 0;
  font-family: "Courier New", monospace;
}
.placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}
.placeholder ul {
  margin: 8px 0;
  padding-left: 20px;
}
.placeholder li {
  margin: 4px 0;
}
</style>
