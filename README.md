# Editorial Layout Studio

Build article-to-card, carousel-post, and editorial layout tools with a strong Chinese-language workflow and first-class Xiaohongshu support.

`Editorial Layout Studio` 是一个面向 Codex / Claude 的可安装 skill，也附带一个可直接公开部署的静态 demo。它适合中文内容创作者、独立开发者、AI 工具作者，以及任何想做“文章转图文卡片 / 社媒轮播图 / 图文排版网页”的人。

## Highlights

- 面向中文内容工作流优化：标题、导语、正文、分页、封面逻辑都更贴近中文图文创作习惯
- 通用图文排版，不局限某个平台：适合知识卡片、内容海报、品牌轮播、文章卡片
- 兼容小红书图文开发：3:4 竖版、封面优先、正文分页、PNG 导出都可以直接用于小红书图文工具
- 纯前端优先：本地渲染、无需后端、易于公开部署
- 开箱可用：仓库同时包含 `SKILL.md` 和一个可运行 demo

## Demo

在线 demo：

- [https://dennydanoh.github.io/editorial-layout-studio/](https://dennydanoh.github.io/editorial-layout-studio/)

本地运行：

```bash
python3 -m http.server 8000
```

然后访问：

- [http://localhost:8000/demo/](http://localhost:8000/demo/)

## Best For

这个仓库特别适合这些任务：

- 做图文排版网页
- 做文章转图片、文章转卡片、长文自动分页工具
- 做小红书图文生成器、社媒轮播图生成器
- 做支持背景图、背景色、透明度和 PNG 导出的静态网页
- 做可部署到 GitHub Pages / Vercel / Netlify 的前端工具

## Install As A Skill

如果你要把它装进 Codex：

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo dennydanoh/editorial-layout-studio \
  --path .
```

安装后重启 Codex。

## Example Prompts

```text
用 editorial-layout-studio 帮我做一个图文排版网页，输入标题和文章后自动分页并下载 PNG。
```

```text
用 editorial-layout-studio 帮我做一个偏中文内容创作场景的文章转卡片工具，优先适配小红书图文。
```

```text
用 editorial-layout-studio 把我现在的小红书图文工具改成支持背景图上传、透明度调节和批量下载。
```

## Repo Structure

```text
editorial-layout-studio/
├── SKILL.md
├── references/
│   └── product-spec.md
├── demo/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .github/workflows/
│   └── deploy-demo.yml
├── LICENSE
└── README.md
```

## Public Deployment

### GitHub Pages

仓库已自带工作流：

- [deploy-demo.yml](./.github/workflows/deploy-demo.yml)

只要在仓库设置里把 Pages 的 Source 设为 `GitHub Actions`，推送到 `main` 后就会自动发布 `demo/`。

### Vercel / Netlify

直接导入仓库即可。这个 demo 是纯静态页面，不需要额外构建配置。

## Design Direction

这个项目的定位不是“只复刻某个现成页面”，而是沉淀一套可复用的图文排版产品能力：

- 中文用户优先
- 小红书图文场景友好
- 通用图文卡片场景也适配
- 稳定分页优先于花哨动画
- 公开部署优先于复杂后端

## Reference

功能规格参考了以下站点在 `2026-04-07` 的公开功能表现，并在此基础上做了通用化抽象：

- [https://www.hezouyukuai.top/](https://www.hezouyukuai.top/)
