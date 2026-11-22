# Charloom｜字织

<p align="center">
  <img src="assets/branding/charloom-horizontal.svg" alt="Charloom｜字织" width="420" />
</p>

**把字符织成画面。**

Charloom 是 Windows 原生、离线运行的 ASCII / ANSI 字符艺术创作工具。将图片或文字转换为字符画，调整质量、编辑与比较结果，再保存可继续创作的项目或导出作品。转换与导出在本机完成。

[下载 1.0.0](https://github.com/msmapwr/charloom/releases/tag/v1.0.0) · [官网与作品展示](https://msmapwr.github.io/charloom/) · [更新记录](CHANGELOG.md) · [命令行教程](docs/CLI_TUTORIAL.md)

## 看看转换效果

![山景图片与半块双色字符画对比](assets/showcase/landscape-before-after.png)

![系统字体原图与字符画转换结果对比](assets/showcase/text-before-after.png)

样例由应用共用的转换与导出代码生成，原图由仓库工具绘制，可按[样例说明](assets/showcase/README.md)离线复现。

<p>
  <img src="assets/showcase/app.png" width="49%" alt="Windows 桌面创作界面" />
  <img src="assets/showcase/text-workflow.gif" width="49%" alt="文字输入、生成与切换内容的操作演示" />
</p>

以上界面截图和操作演示来自更名前的 AsciiStudio，供了解创作流程；当前应用名称为 Charloom。

## 下载与运行

在 [1.0.0 Release](https://github.com/msmapwr/charloom/releases/tag/v1.0.0) 中选择与设备匹配的文件：

| 设备架构 | 下载文件 |
| --- | --- |
| Intel / AMD 64 位 Windows | `Charloom-1.0.0-win-x64.zip` |
| ARM64 Windows | `Charloom-1.0.0-win-arm64.zip` |

1. 完整解压 ZIP，保留其中所有文件与目录。
2. 双击 `Charloom.exe` 打开桌面应用，或在解压目录的终端运行 `charloom-cli.exe`。
3. 从图片转换或文字转换开始，生成后可编辑结果、保存 `.asciiproj` 项目，或选择导出格式。

运行目标为 Windows 10 1809 及以上版本，提供 x64／ARM64 自包含便携包，无需安装开发 SDK。不要单独复制 EXE，程序还需要同目录中的 DLL、PRI、XBF 和资源文件。

ZIP 未做代码签名。Release 中的 `SHA256SUMS.txt` 可用于核对下载完整性；在 PowerShell 中计算文件摘要：

```powershell
Get-FileHash .\Charloom-1.0.0-win-x64.zip -Algorithm SHA256
```

ARM64 已有交叉构建检查，实机运行验收仍单独跟踪。

## 可以做什么

| 能力 | 内容 |
| --- | --- |
| 图片转字符画 | PNG、JPEG、BMP、GIF 首帧、TIFF；尺寸与比例、裁剪／旋转／翻转、颜色调整、字体密度、边缘与抖动、Braille、半块双色和透明处理 |
| 文字转字符画 | FIGlet 与系统字形、字行距、换行与对齐、中文描边与填充、缺字提示、字体导入与收藏、标题和边框 |
| ANSI 查看 | 常见编码与颜色、SAUCE 信息、iCE 色彩 |
| 编辑与比较 | 撤销／重做、Unicode 选区、大结果分页、缩放与适应、原图／结果并排比较；保留手工编辑并管理候选结果 |
| 保存与恢复 | `.asciiproj` 项目、多项目工作区、来源与参数保存、最近项目、会话恢复 |
| 导出作品 | TXT、PNG、JPEG、静态 GIF、HTML、SVG、ANSI、JSON、Markdown |
| 辅助创作 | 七种生成器、文本整理、代码注释、本地加密／编码／压缩与摘要 |
| 界面与设置 | 中文／English 即时切换、深浅主题、界面与作品字体分离、设置搜索与收藏、偏好导入导出 |

GIF 目前只转换第一帧，导出的 GIF 也是静态图。FIGlet 模式接受 ASCII 输入；中文请使用系统字体模式。中文、emoji 和组合字符按字符簇及显示列处理，实际外观仍取决于字体与终端。

## 命令行快速开始

1.0.0 提供 73 个命令及逐级中英文帮助。在 ZIP 的解压目录打开 PowerShell：

```powershell
# 查看版本和中文帮助
.\charloom-cli.exe --version
.\charloom-cli.exe --help --language zh-CN

# 将文字转换为字符画，保存为文本
.\charloom-cli.exe text --text "Charloom" --output hello.txt

# 转换图片，同时保存可继续编辑的项目
.\charloom-cli.exe image --input photo.png --columns 120 --format ANSI --output art.ans --save-project art.asciiproj

# 查询当前已实现和待完成的功能
.\charloom-cli.exe capabilities --json
```

CLI 支持持久编辑历史、Unicode 选区、独立工作区、候选结果、几何历史、批处理与显式剪贴板操作。默认拒绝覆盖已有输出文件；作品写入 stdout，错误写入 stderr。

桌面与 CLI 尚未全部对齐。完整示例见[命令行教程](docs/CLI_TUTORIAL.md)，参数与覆盖状态见 [CLI 说明](docs/CLI.md)，几何草稿见[几何历史教程](docs/CLI_GEOMETRY.md)。旧入口 `asciistudio-cli.exe` 继续保留兼容。

## 数据与资源边界

Charloom 原名 AsciiStudio。为兼容旧版，桌面设置、最近项目、恢复数据和日志继续使用 `%LOCALAPPDATA%\AsciiStudio`；CLI 默认使用其下的 `Cli` 子目录。恢复数据保存在本机，最近项目列表记录本机文件路径。

| 项目 | 上限与行为 |
| --- | --- |
| 图片输入 | 文件 100 MB（十进制），源图 2 亿像素 |
| 处理图 | 等比缩至最长边 12000 像素，同时不超过 1600 万像素 |
| 图片结果 | 每边最多 200000 字符，同时最多 4000 万采样点；Braille 每字符 8 点，半块每字符 2 点 |
| 位图导出 | 1 亿像素，单边不超过 32767 像素 |
| HTML / SVG | 最多 1.6 亿标记字符 |
| 项目与 CLI 侧文件 | 最多 256 MB |
| 编辑历史 | 最多 100 步／64 MB；CLI 几何历史独立保留最多 40 步 |

各算法仍可能有更小的输入限制。大作品需要更多内存，遇到资源限制时可降低尺寸或使用文本格式导出。

## 当前限制与后续计划

1.0.0 已获得正式发布授权，但不代表路线图全部完成。以下能力仍在开发计划中：

- CLI 预览、缩放适应、分页、选区定位与原图比较。
- 工具栏收藏、个人配方、平台助手、代码变量包装和 CLI 教程入口。
- 共享服务领域错误的完整双语化与扩展动效。

双语跨页面 UI 验收尚未全部结束；ARM64 实机、多显示器 DPI 和真实系统剪贴板也仍需独立验收。动画编辑、视频、摄像头和 3D 不在当前范围；MCP／API 与快速 UI 测试入口仅作后续规划。详见[路线图](docs/ROADMAP.md)和[功能覆盖表](docs/CLI.md)。

## 从源码开发

开发环境为 Windows、Visual Studio 2026 的 WinUI 工作负载与 Windows SDK 26100。项目使用 .NET 10、Windows App SDK 2.5.1；`global.json` 指定 SDK 10.0.401 并允许同功能段的新补丁版本。WinUI 开发还需 WinApp CLI 和 `microsoft/win-dev-skills`，具体约定见 [AGENTS.md](AGENTS.md)。

在仓库根目录构建或启动：

```powershell
# 仅构建，不打开应用
.\scripts\build.ps1 -Configuration Release

# 通过项目包装脚本构建并启动桌面应用
.\BuildAndRun.ps1 .\src\Charloom\Charloom.csproj --detach
```

也可在 Visual Studio 中打开 `Charloom.slnx`，将 `Charloom` 设为启动项目。自动构建、便携包与发布流程见 [CI 与 Release](docs/CI_RELEASE.md)。

## 文档导航

[图片质量](docs/IMAGE_QUALITY.md) · [文字排版](docs/TEXT_LAYOUT.md) · [ANSI](docs/ANSI_VIEWER.md) · [预览与对比](docs/VIEWPORT.md) · [Unicode](docs/UNICODE.md) · [设置](docs/SETTINGS.md) · [加密与编码](docs/CRYPTO_TOOLS.md)

[架构与测试](docs/ARCHITECTURE.md) · [第三方依赖](docs/THIRD_PARTY.md) · [历史归档](docs/archive/README.md) · [网站源码](website/dist)
