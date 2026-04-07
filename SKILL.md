---
name: xiaohongshu-editorial-studio
description: Use this skill whenever the user wants to build, clone, modify, or polish a Xiaohongshu-style carousel post generator, Rednote image-post editor, article-to-image web tool, or any static page that turns long-form text into paginated 3:4 social images with cover generation, body pagination, background customization, preview, and PNG export. Trigger even if the user does not say "skill" explicitly but asks for "小红书图文生成", "文章转小红书图片", "图文排版网页", "Rednote carousel generator", "封面+正文分页导出", or wants a browser-only publishing tool that can be deployed publicly on GitHub Pages, Vercel, or Netlify.
---

# Xiaohongshu Editorial Studio

## Overview

这个 skill 用来交付一类很具体、很实用的网页工具：

- 把一篇长文拆成适合小红书图文发布的多张 3:4 竖版图片
- 自动生成封面页和正文分页
- 支持背景色、背景图、透明度、预览和逐张/批量导出 PNG
- 尽量保持纯前端、本地渲染、可直接公开部署

如果用户要的是一个能被普通人直接打开使用的网页，而不是一段抽象算法，这个 skill 应该优先触发。

## When To Use

- 用户要做“小红书图文生成器”“图文卡片生成网页”“文章转图片工具”。
- 用户要把文章、笔记、教程、口播稿排成一组适合社媒发布的长图或卡片。
- 用户明确要求静态网页、浏览器本地处理、可上传 GitHub 公开使用。
- 用户想复刻、升级或二次封装类似 `https://www.hezouyukuai.top/` 这一类工具。
- 用户要补功能，比如背景图上传、封面文案限制、自动分页、导出 PNG、保存输入状态。

如果用户只是要写小红书文案，而不是做网页工具，不要触发本 skill。

## Default Deliverable

默认交付应尽量是一个可直接运行和部署的前端项目，而不是只给思路。

优先满足这些要求：

1. 纯前端静态站点，避免不必要后端
2. 本地浏览器内完成渲染与导出
3. 可直接部署到 GitHub Pages / Vercel / Netlify
4. 桌面和移动端都能正常使用
5. UI 要有清晰的输入区、参数区、预览区和导出动作

## Working Style

### 1. 先识别是不是“工具型网页”

先确认用户真正要的是什么：

- 一个可公开访问的网页工具
- 一个可复用的 skill
- 或者两者一起交付

如果用户没有特别说明，默认理解为：
“交付一个 skill，指导模型稳定生成或改造这一类网页工具；如果当前仓库允许，也顺手把对应文件骨架落下来。”

### 2. 按产品能力拆解

核心模块通常包括：

- 标题输入
- 导语/角标输入
- 正文输入
- 文章分段与分页
- 封面排版
- 正文页排版
- 背景色选择
- 背景图上传与移除
- 透明度调节
- 预览网格
- 单张导出
- 批量导出
- 本地状态持久化

详细规格见 [product-spec.md](./references/product-spec.md)。

### 3. 默认采用浏览器端 Canvas 渲染

优先采用：

- `HTML + CSS + JavaScript`
- `canvas` 负责最终导出画面
- 表单负责内容输入和参数控制
- `localStorage` 保存最近一次编辑状态

除非用户明确要求服务端生成图片，否则不要引入后端。

### 4. 稳定分页优先

先保证：

- 文本不会溢出
- 长文能稳定分页
- 封面标题不会炸版
- 背景切换后预览和导出一致
- 导出文件名清晰

### 5. 输出时解释关键取舍

如果你实现或修改了工具，简要说明：

- 为什么选择纯前端
- 分页规则如何工作
- 标题和正文如何限制溢出
- 导出命名规则是什么
- 用户如何公开部署

## Functional Requirements

除非用户明确缩减范围，默认至少覆盖这些能力：

- 输入标题、导语、正文
- 根据正文自动拆分段落
- 自动生成 1 张封面 + 多张正文
- 输出比例为 3:4 竖版，适配小红书图文
- 支持背景纯色和背景图两种模式
- 支持透明度调节
- 页面内预览所有卡片
- 支持逐张下载 PNG
- 支持下载全部 PNG
- 支持刷新后保留输入状态

## Quality Bar

- 生成逻辑应可读，不要把所有功能塞进超长匿名回调
- 上传图片、空内容、标题过长、正文过长都要有合理处理
- 预览和下载结果必须一致
- 发布后普通用户无需登录即可使用
- 如果要上 GitHub，项目结构要清晰，至少包含 README 和运行说明

## Implementation Notes

- 标题建议设置显示字符上限，并在封面侧做多级字号回退
- 正文分页优先按空行分段，再按句子拆长段，最后按绘制宽度换行
- 导出文件名应基于标题做清洗
- 背景图应采用 cover 式铺满，避免变形
- 有背景图时再叠加半透明浅色蒙层，可提升文字可读性

## Example Requests

**Example 1**
Input: 帮我做一个小红书图文生成网页，输入标题和文章后能自动分页并下载 PNG。
Output: 触发本 skill，生成一个可部署的静态前端项目方案或直接实现代码。

**Example 2**
Input: 把这个小红书图文网页改成支持背景图上传和透明度调节。
Output: 触发本 skill，围绕现有工具补齐参数区、渲染逻辑和导出一致性。

**Example 3**
Input: 我想做一个能公开放到 GitHub 上的 Rednote carousel generator。
Output: 触发本 skill，优先交付适合公开部署的静态网页实现和说明文档。

