# Editorial Layout Studio

一个可直接公开放到 GitHub 的 skill 仓库，目标是帮助 Codex / Claude 稳定生成、复刻或升级通用的图文排版网页。

这个仓库同时提供两部分内容：

- 一个可安装的 skill
- 一个可直接打开的静态 demo

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
├── LICENSE
└── README.md
```

## What The Skill Is For

适合这些请求：

- 做“图文排版工具”“内容卡片生成器”“文章转图片网页”
- 把长文章自动分页成 3:4 竖版卡片
- 生成封面页和正文分页
- 支持背景色、背景图、透明度、预览和 PNG 导出
- 交付可部署到 GitHub Pages / Vercel / Netlify 的静态网页

## Install As A Skill

如果你要把它装进 Codex：

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo <your-account>/editorial-layout-studio \
  --path .
```

安装后重启 Codex。

## Run The Demo

这个 demo 是纯静态文件。

直接打开：

- `demo/index.html`

或者在仓库根目录起一个静态服务：

```bash
python3 -m http.server 8000
```

然后访问：

- `http://localhost:8000/demo/`

## Deploy Publicly

### GitHub Pages

仓库已经自带 GitHub Actions 工作流：

- [deploy-demo.yml](./.github/workflows/deploy-demo.yml)

你只需要：

1. 新建 GitHub 仓库
2. 把本目录内容推到 `main`
3. 在仓库设置里启用 GitHub Pages
4. Source 选择 `GitHub Actions`

之后每次推送到 `main`，都会自动把 `demo/` 发布出去。

### Vercel / Netlify

直接导入仓库即可。

因为 demo 是纯静态页面，不需要构建步骤。

## Example Prompts

```text
用 editorial-layout-studio 帮我做一个图文排版网页，输入标题和文章后自动分页并下载 PNG。
```

```text
用 editorial-layout-studio 把我现在这个图文工具改成支持背景图上传、透明度调节和批量下载。
```

```text
用 editorial-layout-studio 做一个可以部署到 GitHub Pages 的 article-to-card generator。
```

## Reference

本仓库的功能规格参考了以下站点在 `2026-04-07` 的公开功能表现：

- [https://www.hezouyukuai.top/](https://www.hezouyukuai.top/)
