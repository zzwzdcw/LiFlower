# 锂之花 (LiFlower) - 角色卡配置应用

> 基于 Vue 3 的赛博朋克风格 TRPG 角色创建与管理工具

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Vue](https://img.shields.io/badge/vue-3.5.29-green.svg)
![Vite](https://img.shields.io/badge/vite-7.3.1-purple.svg)

---

## 📖 项目简介

**锂之花 (LiFlower)** 是一款专为赛博朋克风格 TRPG 跑团游戏设计的角色卡配置应用。应用支持创建和管理两种角色类型：

- **人类 (Anthropos)** - 血肉之躯的角色
- **人形 (Anthroform)** - 仿生人/AI 驱动的人形角色

应用采用独特的**模式驱动架构**，根据角色类型和游戏阶段（整备/行动）自动切换界面，提供沉浸式的角色创建体验。

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

---

## 🏗️ 技术架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.29 | 核心框架 (Composition API) |
| Vite | 7.3.1 | 构建工具 |
| Element Plus | 2.13.3 | UI 组件库 |
| Vue Router | 5.0.3 | 路由管理 |
| Pinia | 3.0.4 | 状态管理 |
| Sass | 1.97.3 | CSS 预处理器 |

### 项目结构

```
C:\Project\LiFlower/
├── src/
│   ├── assets/              # 静态资源
│   │   └── main.scss        # 全局样式
│   ├── components/          # 通用组件
│   │   ├── AttributeAllocator.vue   # 属性点分配器
│   │   ├── Counter.vue              # 计数器组件
│   │   ├── CyberSelect.vue          # 赛博风格下拉选择器
│   │   ├── ModifierDisplay.vue      # 调整值显示组件
│   │   ├── StandardModule.vue       # 标准模块容器
│   │   └── TipButton.vue            # 带提示的按钮
│   ├── composables/         # 组合式函数
│   │   └── useModifiers.js  # 调整值计算逻辑
│   ├── config/              # 配置文件
│   │   └── moduleConfig.js  # 模块显示配置
│   ├── data/                # JSON 数据文件
│   │   ├── skills.json      # 技能数据 (16 项)
│   │   ├── 人类起源.json     # 人类出身背景 (12 种)
│   │   ├── 企业技术.json     # 人形生产企业 (8 家)
│   │   ├── 基本属性.json     # 6 项基础属性说明
│   │   ├── 特质.json        # 特质系统 (37 项)
│   │   └── 硬件规格.json     # 人形硬件等级 (5 级)
│   ├── modules/             # 功能模块 (M0-M99)
│   │   ├── M0_Import.vue          # 导入模块
│   │   ├── M1_HumanBasic.vue      # 人类基础信息
│   │   ├── M2_DollBasic.vue       # 人形基础信息
│   │   ├── M3_DollAttributes.vue  # 人形属性分配
│   │   ├── M4_HumanAttributes.vue # 人类属性分配
│   │   ├── M5_HumanSkills.vue     # 人类技能
│   │   ├── M6_HumanTalents.vue    # 人类专长
│   │   ├── M7_DollChips.vue       # 人形芯片
│   │   ├── M8_HumanGear.vue       # 人类装备
│   │   ├── M9_DollWeapon.vue      # 人形尖端武装
│   │   ├── M10_DollGear.vue       # 人形装备
│   │   ├── M11_Empty.vue          # 预留空模块
│   │   ├── M12_HumanBasicInfo.vue # 人类基础资料 (行动模式)
│   │   ├── M13_DollBasicInfo.vue  # 人形基础资料 (行动模式)
│   │   ├── M14_HumanCheck.vue     # 人类检定数据
│   │   ├── M15_DollCheck.vue      # 人形检定数据
│   │   ├── M16_HumanStatus.vue    # 人类角色状态
│   │   ├── M17_DollStatus.vue     # 人形角色状态
│   │   ├── M18_Memo.vue           # 备忘录
│   │   ├── M97_Switch.vue         # 模式切换按钮
│   │   ├── M98_DataManager.vue    # 数据管理
│   │   └── M99_ClearCache.vue     # 清除缓存
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── stores/              # Pinia 状态管理
│   │   ├── app.js           # 应用设置 (主题/语言)
│   │   ├── character.js     # 角色数据核心 store
│   │   ├── mode.js          # 应用模式管理
│   │   └── user.js          # 用户状态
│   ├── views/               # 页面组件
│   │   ├── CharacterCard.vue    # 主角色卡页面
│   │   └── modes/           # 模式视图
│   │       ├── WelcomeMode.vue    # 欢迎模式
│   │       ├── HumanPrepMode.vue  # 人类整备模式
│   │       ├── HumanActionMode.vue# 人类行动模式
│   │       ├── DollPrepMode.vue   # 人形整备模式
│   │       └── DollActionMode.vue # 人形行动模式
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── package.json
├── vite.config.js
├── CLAUDE.md                # 项目规范文档
└── README.md                # 本文件
```

---

## 🎮 核心功能

### 1. 五种应用模式

应用根据角色类型和游戏阶段，自动切换到对应的模式：

| 模式 | 说明 | 触发条件 |
|------|------|----------|
| **欢迎模式 (welcome)** | 首次进入，选择角色类型 | 应用启动 |
| **人类整备模式 (human-prep)** | 创建人类角色 | 选择人类后 |
| **人类行动模式 (human-action)** | 人类跑团界面 | 整备完成后切换 |
| **人形整备模式 (doll-prep)** | 创建人形角色 | 选择人形后 |
| **人形行动模式 (doll-action)** | 人形跑团界面 | 整备完成后切换 |

**模式切换流程：**
```
欢迎模式
    ├── 选择人类 → 人类整备模式 ↔ 人类行动模式
    └── 选择人形 → 人形整备模式 ↔ 人形行动模式
```

### 2. 模块化架构

应用包含 22 个功能模块 (编号 M0-M99)，通过配置系统控制显示：

| 模块编号 | 名称 | 显示模式 | 功能 |
|---------|------|---------|------|
| M0 | 导入 | welcome | 角色名称输入、代码导入 |
| M1 | 人类基础 | human-prep | 名称、出身、特质 |
| M2 | 人形基础 | doll-prep | 名称、硬件规格、企业 |
| M3 | 人形属性 | doll-prep | 6 项属性分配 |
| M4 | 人类属性 | human-prep | 特殊出身触发 |
| M5 | 人类技能 | human-prep | 16 项技能分配 |
| M6 | 人类专长 | human-prep | 2 个特质选择 |
| M7 | 人形芯片 | doll-prep | 芯片配置 |
| M8 | 人类装备 | human-prep | 装备配置 |
| M9 | 人形武装 | doll-prep | 尖端武装 |
| M10 | 人形装备 | doll-prep | 装备配置 |
| M12 | 人类资料 | human-action | 行动模式资料 |
| M13 | 人形资料 | doll-action | 行动模式资料 |
| M14 | 人类检定 | human-action | 检定数据计算 |
| M15 | 人形检定 | doll-action | 检定数据计算 |
| M16 | 人类状态 | human-action | HP/状态追踪 |
| M17 | 人形状态 | doll-action | HP/状态追踪 |
| M18 | 备忘录 | 行动模式 | 跑团笔记 |
| M97 | 模式切换 | 整备/行动 | 转换按钮 |
| M98 | 数据管理 | 非欢迎 | 导入导出 |
| M99 | 清除缓存 | 全部 | 重置应用 |

### 3. 角色数据类型

#### 人类 (Anthropos) 数据
- **基础信息**: 名称、出身背景、角色阐述
- **属性**: 6 项基础属性 (结构/力量/运动/算力/信息/功率)
- **技能**: 16 项技能 (体术/闪避/枪械/操控/破解/编程/工程/医疗/检索/侦察/隐藏/擦除/阶级/社会/交涉/人性)
- **特质**: 2 个特质槽位 (从 37 项中选择)

#### 人形 (Anthroform) 数据
- **基础信息**: 名称、硬件规格、生产企业
- **硬件规格**: 5 个等级 (劳工级 9 点/民用级 12 点/警用级 15 点/军用级 18 点/实验级 21 点)
- **生产企业**: 8 家企业 (柊神機巧/天穹防务/雪狼设计局/暗隼电子/机联社/赤道动力/海渊之子/黑品)
- **属性**: 6 项属性分配 (受硬件规格和企业影响)
- **芯片/武装/装备**: 人形专属配置

### 4. 属性系统

6 项基础属性适用于人类和人形：

| 属性 | 英文名 | 作用 |
|------|--------|------|
| **结构 (Structure)** | Structure | 决定 HP 上限，评估身体框架坚固性 |
| **力量 (Strength)** | Strength | 近战威力、重型武器驾驭能力 |
| **运动 (Athletics)** | Athletics | 闪避、轻型武器瞄准、先攻对抗 |
| **算力 (Compute)** | Compute | 骇入能力、防火墙强度 |
| **信息 (Information)** | Information | 侦察、网络搜索、抗干扰能力 |
| **功率 (Power)** | Power | 装备数量上限、每回合 EP 获取 |

---

## 🎨 视觉设计

### 赛博朋克配色

```scss
$cyber-cyan:    #00f3ff;  // 青色主色调
$cyber-purple:  #bc13fe;  // 紫色强调色
$cyber-dark:    #0a0a0f;  // 深色背景
$cyber-darker:  #050508;  // 更深背景
$cyber-red:     #ff5252;  // 警告色
```

### 设计特点

- **等宽字体**: 标题使用 `Courier New` / `Consolas` 营造科技感
- **发光效果**: 边框和文字带有青色/紫色辉光
- **瀑布流布局**: 使用 CSS Columns 实现三列卡片式布局
- **响应式**: 支持平板 (2 列) 和手机 (单列) 适配

---

## 📦 状态管理

### Pinia Stores

#### Mode Store (`src/stores/mode.js`)
管理应用的核心模式状态：

```javascript
// State
currentMode        // 当前模式
characterType      // 角色类型 (Anthropos/Anthroform)
hasLeftWelcome     // 是否已完成首次选择
isDebug            // 是否处于调试模式

// Actions
setMode()          // 设置当前模式
setCharacterType() // 设置角色类型
selectHuman()      // 选择人类
selectDoll()       // 选择人形
togglePrepAction() // 切换整备/行动模式
resetToWelcome()   // 重置到欢迎模式
```

#### Character Store (`src/stores/character.js`)
管理角色数据：

```javascript
// State
characterName           // 角色名称
characterType           // 角色类型
hardwareSpec            // 硬件规格 (人形)
manufacturer            // 生产企业 (人形)
humanBackground         // 人类出身
baseAttributePoints     // 基础属性点
totalAttributePoints    // 总属性点
attributeLimit          // 属性上限
attributes              // 6 项属性值
skills                  // 16 项技能值
selectedTraits          // 已选择的特质

// Actions
setCharacterName()      // 设置角色名称
setHardwareSpec()       // 设置硬件规格
setManufacturer()       // 设置生产企业
updateAttributes()      // 更新属性值
updateSkills()          // 更新技能值
setTrait()              // 设置特质
resetCharacter()        // 重置角色数据
```

---

## 🔧 核心组件

### StandardModule.vue - 标准模块容器
统一的模块容器，控制显示/隐藏：

```vue
<StandardModule
  module-id="M1"
  :show-in-modes="['human-prep']"
  :show-when="() => characterStore.hasHardwareSpec"
>
  <M1_HumanBasic />
</StandardModule>
```

### CyberSelect.vue - 赛博风格下拉框
自定义下拉选择器，支持双行显示：

```vue
<CyberSelect
  v-model="selectedValue"
  placeholder="请选择"
  :options="[{ label: '选项 1', value: '1' }]"
  :disabled-options="['2']"
/>
```

### AttributeAllocator.vue - 属性分配器
属性点增减按钮、范围验证、调整值显示：

```vue
<AttributeAllocator
  :attribute-points="totalAttributePoints"
  :attribute-limit="attributeLimit"
  :attributes="attributes"
  :attribute-data="attributeData"
/>
```

### ModifierDisplay.vue - 调整值显示
显示属性/技能的调整值来源：

```vue
<ModifierDisplay
  :base-value="5"
  :modifiers="[{ source: '硬件', value: 2 }]"
  :max-value="10"
/>
```

### TipButton.vue - 提示按钮
带信息图标的 Tooltip 按钮，支持 3 级显眼程度：

```vue
<TipButton
  level="3"
  content="详细说明文字"
>
  按钮文字
</TipButton>
```

---

## 📋 数据文件

### 硬件规格.json
5 个人形硬件等级配置：

```json
{
  "id": 2,
  "name": "民用级",
  "nameEn": "Civilian Grade",
  "attributePoints": 12,
  "attributeLimitBonus": 0,
  "description": "...",
  "recommendedForRoleplay": true,
  "effectDescription": "拥有 12 点的属性点数",
  "effect": {
    "attributePointsBonus": 12,
    "attributeLimitBonus": 0
  }
}
```

### 企业技术.json
8 家生产企业配置，包括属性加值和特殊效果。

### 基本属性.json
6 项属性的详细说明、机制描述和效果列表。

### 人类起源.json
12 种人类出身背景，包括无意义一代、螺丝钉、老兵、公司官僚等。

### 特质.json
37 项特质配置，分为三类：
- `human` - 人类专属
- `doll` - 人形专属
- `both` - 通用特质

### skills.json
16 项技能配置，分为战斗类、电子战类、工程类、情报类、社会类。

---

## 🎯 架构特点

### 1. 单页面 + 模式切换
整个应用只有一个路由 (`/`)，通过模式状态控制界面显示。

### 2. 模块配置驱动
通过 `moduleConfig.js` 配置每个模块的显示规则和顺序。

### 3. 数据外置
所有游戏数据存储在 JSON 文件中，易于扩展和维护。

### 4. 组件高度复用
通用组件 (StandardModule, CyberSelect 等) 在多个模块中复用。

### 5. 响应式布局
使用 CSS Columns 实现瀑布流，自动适配不同屏幕尺寸。

---

## 🛠️ 开发指南

### 添加新模块

1. 在 `src/modules/` 目录创建新组件，如 `M20_NewFeature.vue`
2. 在 `moduleConfig.js` 中添加配置：
   ```javascript
   export const moduleVisibility = {
     M20: ['human-prep', 'human-action'],
   }
   export const moduleOrder = ['M0', ..., 'M20', ...]
   ```
3. 在 `CharacterCard.vue` 中导入并渲染：
   ```vue
   <StandardModule module-id="M20" :show-in-modes="['human-prep']">
     <M20_NewFeature />
   </StandardModule>
   ```

### 添加新数据

1. 在 `src/data/` 目录创建 JSON 文件
2. 在组件中导入使用：
   ```javascript
   import newData from "@/data/新数据.json"
   ```

### 修改模式逻辑

编辑 `src/stores/mode.js` 中的 Actions。

---

## 📝 命名规范

自 v0.9 起，项目全面采用英文命名：

### JSON 字段名
- `名称` → `name`
- `属性点` → `attributePoints`
- `描述` → `description`

### Vue 变量名
- `character` - 角色对象
- `character.name` - 角色名称
- `hardwareSpec` - 硬件规格
- `manufacturer` - 生产企业

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

ISC License

---

## 🌸 项目名称来源

"锂之花" (LiFlower) 中的 "锂" 指代电池技术（锂电池），"花" 象征科技与美的结合。名称寓意在赛博朋克世界中，科技如花朵般绽放。
