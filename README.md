# DSH DeepSeek Balance

一个用于 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 的个人使用插件。

它会在 DSH 左侧底部提供一个入口，用来查看：

- DeepSeek 开放平台 API 余额
- DSH 本机保存会话的累计消费金额
- 今日消费金额
- Flash 和 Pro 的分别消费金额

## 安装

先安装 Node.js，然后打开 PowerShell。普通用户不需要全局安装 `dsh`，直接执行：

```powershell
npx @deepseek-ai/dsh plugin --profile web add github:Bob-Bo1/dsh-deepseek-balance
```

如果第一次运行提示 `Ok to proceed? (y)`，输入 `y` 并按回车。看到 `Done` 后，启动 DSH：

```powershell
npx @deepseek-ai/dsh web
```

然后打开 `http://127.0.0.1:3080`。如果 DSH 已经在运行，请先在运行窗口按 `Ctrl+C`，安装插件后重新启动。

如果 Windows PowerShell 无法执行 `npx`，可以把命令中的 `npx` 改成 `npx.cmd`：

```powershell
npx.cmd @deepseek-ai/dsh plugin --profile web add github:Bob-Bo1/dsh-deepseek-balance
```

GitHub 安装需要网络连接。第一次安装 GitHub 插件时，如果 pnpm 提示需要允许构建脚本，请按照提示把它加入当前 profile 的 `pnpm-workspace.yaml`，然后重新执行安装命令。

### 常见问题

- 如果提示找不到 `dsh`，继续使用上面的 `npx @deepseek-ai/dsh ...` 命令，不需要额外配置全局命令。
- 如果安装后左下角没有入口，请在运行 DSH 的窗口按 `Ctrl+C`，再执行 `npx @deepseek-ai/dsh web`，最后刷新网页。
- 如果面板提示未配置 `DEEPSEEK_API_KEY`，请先在 DSH 模型设置中配置 DeepSeek 官方 API Key。不要把 Key 粘贴到 PowerShell、README 或 GitHub Issue 中。
- 如果余额接口请求失败，请检查网络和 API Key 是否仍然有效。插件不会把 Key 发送到本项目服务器。

## 配置 API Key

插件读取 DSH 凭据中的：

```text
DEEPSEEK_API_KEY
```

配置步骤：

1. 打开 DSH 的模型设置。
2. 配置 DeepSeek 官方 API Key。
3. 点击左下角的“DeepSeek 余额与费用”。

插件会在 DSH Host 侧读取凭据，并请求 DeepSeek 官方余额接口。浏览器页面只会收到清理后的余额和统计结果。

请不要把 API Key 写入 README、代码、截图、Issue 或 GitHub Actions 配置。

## 数据安全

- API Key 保存在用户自己的 DSH 凭据存储中。
- API Key 不会进入浏览器页面。
- API Key 不会上传到本项目，也不会发送到第三方服务器。
- 余额请求只发送到 `https://api.deepseek.com/user/balance`。
- 消费统计只读取本机 DSH 已保存的会话日志。
- 插件不会上传会话正文。
- 插件只通过本机 DSH 路由把统计结果交给页面。

## 消费统计范围

消费金额根据 DSH 会话中的模型和 token 用量重新计算：

- 累计消费：本机 DSH 已保存记录中的全部可识别 DeepSeek 请求。
- 今日消费：按 `Asia/Shanghai` 时区计算当天请求。
- Flash：包含 `deepseek-v4-flash` 以及 DSH 中兼容的旧模型名称。
- Pro：包含 `deepseek-v4-pro`。
- 页面金额保留 2 位小数。

当前代码中的公开单价为人民币/百万 token：

| 模型 | 缓存命中 | 缓存未命中 | 输出 |
| --- | ---: | ---: | ---: |
| Flash | ¥0.02 | ¥1.00 | ¥2.00 |
| Pro | ¥0.025 | ¥3.00 | ¥6.00 |

价格可能随 DeepSeek 官方公告调整。价格调整后，需要更新插件中的价格常量再发布新版本。

## 重要限制

### 余额和消费是两类数据

余额来自当前 `DEEPSEEK_API_KEY` 对应的 DeepSeek 账户。

消费金额来自这台电脑上的 DSH 会话记录，两者统计范围不同。

当前版本不会自动获得以下数据：

- 其他电脑上的 DSH 使用记录
- DSH 以外客户端的使用记录
- 没有保存 token 用量的历史请求
- 其他 API Key 的独立消费记录

因此，页面中的消费金额适合做本机 DSH 使用情况参考，不代表 DeepSeek 账户后台的完整账单。

### 多个 API Key

当前版本使用一个主凭据引用：`DEEPSEEK_API_KEY`。

如果你有多个 API Key，请先选择一个作为 DSH 当前使用的主 Key。多个 Key 属于同一个 DeepSeek 账户时，余额不能相加；属于不同账户时，也需要分别查看，避免把金额混在一起。

## 本地接口

插件提供两个本机路由：

```text
GET /api/deepseek-balance
GET /api/deepseek-balance/usage
```

余额结果缓存 30 秒，消费统计结果缓存 30 秒。面板打开时会刷新，之后每 60 秒自动刷新一次。

## 项目结构

```text
deepseek-balance/
├─ package.json          # npm 和 DSH 插件清单
├─ cordis.patch.yml      # 自动注册 profile layer
├─ lib/
│  ├─ index.js           # DSH Host 侧：凭据、余额接口、本地统计
│  └─ client.js          # 浏览器侧：左下角入口和显示面板
├─ README.md
├─ LICENSE
└─ .gitignore
```

## 开发检查

修改代码后，可以执行：

```powershell
node --check lib/index.js
node --check lib/client.js
```

本项目没有把 DSH 的个人 profile、会话文件、凭据文件和本地工作区一起放进仓库。

## 许可证

MIT License，详见 [LICENSE](LICENSE)。
