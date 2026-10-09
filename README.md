# Life Ledger OS · 慢慢，展开

在线访问：https://virtue192.github.io/zhishiku-blog-pages/

当前首页是个人 Wiki 的交互框架：纸船叙事开场、图标导航、指针光点与涟漪、漂浮卡片、中英文界面、日夜模式、环境音、手机布局与键盘导航。正文仍留白，后续可以逐步填入。

源码在 `site/`。页面使用 Astro、Preact、Anime.js 与 Morphicons，场景和图标为 SVG/CSS，没有外部商业图片、字体或音乐。

## 本地运行

需要 Node.js 24。

```sh
cd site
npm ci
npm run dev
```

访问 http://127.0.0.1:4324/zhishiku-blog-pages/ 。静态产物检查：`npm run check`、`npm run build`；`npm run preview` 可预览与 Pages 相同的路径。

## 自动更新

修改 `site/` 后推送到 `main`，GitHub Actions 会检查、构建并更新现有 Pages 首页。也可以手动运行 `Build Life Ledger OS and update Pages`。沿用既有 Pages 设置：`main` 分支、仓库根目录、没有自定义域名；不需要服务器或付费 API。

构建只发布首页、自有图标和带指纹的前端资源，保留此前的文章、知识库路由及其资源。生成产物的提交不触发源码构建循环；工作流会显式请求 Pages 构建，处理 GitHub 的自动提交触发限制。

## 邮件订阅

GitHub Pages 不运行应用后端。本版保留信封、订阅面板和状态反馈，明确显示邮件服务未接入，不调用不存在的 API、不提交或保存邮箱。真正的邮件通知需后续接入订阅服务。原本的本地测试后端仍留在私有工程中。

空内容阶段首页保留 `noindex,nofollow`；正式发布文章时再调整索引设置。主题、语言、布局等偏好只在访问者的浏览器保存。
