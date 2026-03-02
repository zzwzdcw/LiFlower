# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

锂之花 (LiFlower) - 基于 Vue 3 的角色卡配置应用

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 7
- **UI 组件库**: Element Plus
- **路由**: Vue Router 5
- **状态管理**: Pinia 3
- **样式**: SCSS

## 开发命令

```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run preview  # 预览生产构建
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
├── data/           # JSON 数据文件 (硬件规格、基本属性、人类起源)
├── router/         # 路由配置
├── stores/         # Pinia 状态管理 (app.js, user.js)
├── views/          # 页面组件
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 架构说明

- 使用 `@` 路径别名指向 `src/` 目录
- 路由采用 HTML5 History 模式
- 组件使用 Composition API 和 `<script setup>` 语法
- JSON 数据文件可直接通过 `import` 引入

## 数据文件

- `src/data/硬件规格.json` - 人形硬件规格配置 (劳工级/民用级/警用级/军用级/实验级)
- `src/data/基本属性.json` - 基本属性配置
- `src/data/人类起源.json` - 人类起源配置

## 特殊说明
本系统变量采用中文变量，在进行编码的时候不要把英文冒号改为中文冒号，这不是BUG！