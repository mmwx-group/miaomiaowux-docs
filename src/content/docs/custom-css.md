---
title: "自定义 CSS"
description: "往面板每个页面注入自己的样式：改配色、换字体、藏元素（PRO）"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

自定义 CSS 让你往妙妙屋X 的**每个页面**注入一段自己的样式，用来改配色、换字体、调圆角、藏掉用不上的元素。不需要改代码、不需要重新编译前端，保存即生效。

自定义 CSS 是 PRO 功能，与「自定义品牌」共用 `custom_branding` 授权 —— 两者都是「把面板改成自己的样子」这一件事。没有该授权时**内容照样能填能保存**，只是不下发、不生效；许可证续上后自动开始生效，不用重新保存一次。

## 在哪里配置

**系统设置 → 外观 → 自定义 CSS**

填进文本框、点保存即可。保存后当前页面立刻套用，其他页面刷新后生效。

## 生效范围

样式随页面 HTML 一起下发，因此覆盖：

- 管理面板的所有页面
- **登录页**（用户还没登录时就已经生效）
- 用户端页面

注入点是 `<body>` 开头的一个 `<style id="mmwx-custom-css">` 元素。它排在应用自带样式表**之后**，所以同等优先级下你的规则会赢 —— 大多数情况**不需要写 `!important`**。只有对上 Tailwind 的高优先级工具类时才需要提高权重。

## 可用的钩子

### CSS 变量（最推荐）

面板的配色统一走 CSS 变量，改变量比逐个改选择器稳得多 —— 换版本也不容易失效。变量定义在 `:root`（浅色）与 `.dark`（深色）上：

| 变量 | 作用 |
| --- | --- |
| `--primary` / `--primary-foreground` | 主色与主色上的文字 |
| `--background` / `--foreground` | 页面底色与正文色 |
| `--card` / `--card-foreground` | 卡片底色与文字 |
| `--sidebar` / `--sidebar-foreground` | 左侧栏底色与文字 |
| `--border` / `--input` / `--ring` | 边框、输入框边框、聚焦光圈 |
| `--muted` / `--muted-foreground` | 次要底色与次要文字 |
| `--destructive` | 危险操作（删除等）的红 |
| `--radius` | 全局圆角半径 |
| `--font-sans` | 全局字体栈 |

### 组件钩子 `data-slot`

界面组件都带 `data-slot` 属性，比 class 稳定（class 是 Tailwind 生成的，会随版本变）：

`card`、`card-header`、`card-title`、`card-content`、`button`、`input`、`badge`、`table`、`sidebar-container`、`sidebar-header`、`sidebar-content`、`sidebar-footer` 等。

用法：`[data-slot="card"] { ... }`

### 主题 class

当前主题以 class 挂在 `<html>` 上，可以只对某个主题生效：

| 主题 | class |
| --- | --- |
| 妙妙屋（像素风，默认） | 无 class |
| 扁平 | `.theme-flat` |
| 二次元 | `.theme-anime` |
| 高级黑金 | `.theme-premium` |
| 深色模式 | `.dark`（与上面几个叠加） |

## 示例

### 换成蓝色主色调

深浅两套都要写，否则切到另一套就露馅：

```css
:root {
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --ring: rgba(37, 99, 235, 0.6);
}

.dark {
  --primary: #60a5fa;
  --primary-foreground: #0b1220;
  --ring: rgba(96, 165, 250, 0.6);
}
```

### 圆角改直角

```css
:root {
  --radius: 0;
}
```

### 换全局字体

先确保字体在访问者机器上装了，或自己在前面 `@import` 一个 Web 字体：

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap");

:root {
  --font-sans: "Noto Sans SC", system-ui, sans-serif;
}
```

> `@import` 必须写在整段 CSS 的**最前面**，前面不能有别的规则，否则浏览器会忽略它。

### 左侧栏调窄

```css
[data-slot="sidebar-container"] {
  width: 200px;
}
```

### 卡片加重阴影、去掉边框

```css
[data-slot="card"] {
  border-color: transparent;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
```

### 只在深色模式下压暗背景

```css
.dark {
  --background: #0b0e14;
  --card: #11151d;
}
```

### 只对某个主题生效

```css
/* 只有选了「扁平」主题的用户会看到 */
.theme-flat [data-slot="card"] {
  border-radius: 4px;
}
```

### 手机端隐藏左侧栏的页脚

```css
@media (max-width: 640px) {
  [data-slot="sidebar-footer"] {
    display: none;
  }
}
```

### 登录页卡片加宽

登录框本身就是一张卡片，用主题 class 之外的方式很难只挑它；简单做法是按宽度类挑：

```css
[data-slot="card"].max-w-sm {
  max-width: 28rem;
}
```

## 限制

| 限制 | 说明 |
| --- | --- |
| 大小上限 64 KiB | 这段样式跟着**每个页面**下发，包括登录页，太大是所有访客每次都要付的流量 |
| 不能包含 `</style` | 它会提前结束样式块，后面的内容会被当成 HTML 解析。保存时会直接拒绝 |
| 不能执行脚本 | CSS 本身不具备执行 JS 的能力，这是浏览器的限制，不是本功能的限制 |

## 写坏了打不开面板怎么办

自定义 CSS 有可能把界面写到点不动或看不见 —— 而要改回来又得先进面板，正是进不去的那一环。

**应急开关**：给主控设置环境变量后重启，注入点会留空，面板恢复原样：

```bash
MMWX_DISABLE_CUSTOM_CSS=1
```

Docker 部署在 `docker-compose.yml` 的 `environment:` 里加一行；systemd 部署在 service 文件里加 `Environment=MMWX_DISABLE_CUSTOM_CSS=1`。

**你填的内容不会丢** —— 只是暂时不注入。进面板改好或清空后，去掉这个环境变量再重启即可恢复。

> 同类应急开关还有 `MMWX_FORCE_PUBLIC_ACCESS`（公网访问设置锁死面板）和 `MMWX_DISABLE_CAPTCHA`（人机验证配错登不进去）。它们都只认环境变量、不做面板设置 —— 做成面板设置就还是要先能进面板。

## 常见问题

### 保存了没反应？

按顺序排查：

1. **许可证里有没有 `custom_branding`**：卡片上会显示 PRO 门控提示，没有授权时不会下发。
2. **是不是设了 `MMWX_DISABLE_CUSTOM_CSS`**：设了的话卡片顶部会有黄色提示条。
3. **其他页面要刷新**：保存只对当前页面即时生效。
4. **规则被应用样式压过去了**：F12 看元素的计算样式，被划掉说明权重不够，给选择器加权重或用 `!important`。

### 改了主色调，但有些地方没变

那些地方可能没走 `--primary` 变量，而是写了固定颜色。用 F12 选中元素看它实际取的是哪个变量或颜色，再针对性覆盖。

### 会影响订阅下发吗？

不会。自定义 CSS 只注入面板页面的 HTML，订阅内容（YAML / JSON / URI）完全不经过它。
