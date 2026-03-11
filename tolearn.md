# UI 优化复刻指南 (Claude Code 适用)

这份文档总结了对“AI vs 真人”判定结果界面的 UI 优化细节。你可以直接将此文档提供给 Claude Code，让其在你的项目中复刻这些改进。

## 1. 核心依赖
确保项目中已安装以下依赖：
- `tailwindcss` (用于样式)
- `lucide-react` (用于图标)
- `motion` 或 `framer-motion` (用于动画)

## 2. 布局与风格优化 (整体)
- **背景与容器**：将原本单调的背景改为带有细微灰度（如 `bg-[#F4F4F0]`）的背景，主体卡片使用纯白 `bg-white`，增加大圆角 `rounded-[2.5rem]` 和柔和的阴影 `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`，使卡片具有悬浮感。
- **排版 (Typography)**：统一使用无衬线字体，加强标题的字重（`font-black` 或 `font-bold`），并使用 `tracking-tight` 收紧字间距，提升现代感。
- **色彩规范**：
  - 错误状态（判定失误）：使用 `#E76F51` 替代原本偏暗的红色，更加醒目且现代。
  - 正确状态（判断正确）：使用 `emerald-500` (#10b981)。
  - 中性文本：使用 `stone-900` 作为主色，`stone-500` 作为辅助色。

## 3. 顶部导航与判定结果
- **按钮**：将“返回”和“继续”按钮改为胶囊形状（`rounded-full`）。“继续”按钮作为主要操作（Primary Action），使用深色背景（`bg-stone-900 text-white`）突出显示；“返回”按钮作为次要操作，使用浅色背景。增加 `active:scale-95` 点击反馈。
- **结果提示**：引入 `lucide-react` 的 `XCircle` 图标配合“判定失误”文字，并使用 Framer Motion 添加一个轻微的放大淡入动画（`scale: 0.8 -> 1`, `opacity: 0 -> 1`）。
- **文字高亮**：给“真人创作”文字底部增加了一个浅色的高亮背景块（`bg-[#E76F51]/20`），增加视觉层次感。

## 4. 媒体展示区 (图片/视频)
- 给图片容器增加 `aspect-[4/3]` 比例，添加 `rounded-3xl` 圆角和内阴影。
- **来源标签优化**：将其改为悬浮在图片右上角的毛玻璃质感徽章（`bg-white/95 backdrop-blur-md`），并加入一个小圆点指示器（如真人用 `#E76F51`，AI 用紫色），并给圆点增加 `animate-pulse` 呼吸灯效果，提升精致度。

## 5. 数据统计卡片优化 ("全网判断" -> "全网共识度")
- **文案优化**：将“全网判断”改为更具专业感和互动感的“全网共识度”，并配上 `Users` 图标。将参与人数作为 Badge 放在右上角。
- **数字动画 (核心改进)**：
  - 实现一个 `AnimatedNumber` 组件，利用 `requestAnimationFrame` 和缓动函数（Ease-out），让百分比数字从 0 快速平滑滚动到目标值（如 82）。
- **进度条动画**：
  - 进度条背景使用浅灰色，填充部分使用深色（`bg-stone-900`）。
  - 使用 Framer Motion 的 `<motion.div>` 给填充条添加宽度增长动画：`initial={{ width: 0 }}` 到 `animate={{ width: '82%' }}`，配合自定义的弹簧缓动曲线 `ease: [0.16, 1, 0.3, 1]`。
  - 进度条内部增加了一个扫光动画（Shimmer effect），让加载完成后的状态依然具有动感。
  - 在进度条下方增加两端的极值提示（如 左侧“真人 18%”，右侧“AI 82%”），让数据含义更清晰。

## 6. 核心代码结构参考

```tsx
// 进度条动画示例
<div className="relative h-4 bg-stone-200/80 rounded-full overflow-hidden shadow-inner">
  <motion.div 
    initial={{ width: 0 }}
    animate={{ width: `${percentageThinkingAI}%` }}
    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
    className="absolute top-0 left-0 h-full bg-stone-900 rounded-full relative overflow-hidden"
  >
    {/* 扫光效果 */}
    <motion.div 
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1.5 }}
      className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
    />
  </motion.div>
</div>

// 数字滚动动画逻辑示例
useEffect(() => {
  let startTime: number;
  const duration = 1200;
  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    setDisplayValue(Math.floor(easeProgress * value));
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}, [value]);
```

## 7. 榜单 (Leaderboard) 优化
- **整体结构**：增加了底部导航栏（Bottom Navigation），方便在“判定”、“榜单”、“我的”之间切换。
- **前三名领奖台 (Podium)**：
  - 采用阶梯式布局，第一名居中且最高，第二名在左，第三名在右。
  - 第一名使用主题色渐变背景（`bg-gradient-to-b from-[#E76F51] to-[#D95D3F]`），并配有皇冠图标（`Crown`）和扫光动画，突出荣誉感。
  - 头像使用圆形边框，第一名带有主题色发光阴影。
- **列表项 (List)**：
  - 采用纯白卡片（`bg-white rounded-2xl`）配合极淡的阴影（`shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]`），保持界面干净通透。
  - 排名数字使用斜体加粗（`italic font-black text-stone-300`），既有设计感又不会喧宾夺主。
  - 列表项加入 `active:scale-95` 的点击反馈，提升交互手感。
  - 列表项入场带有错落有致的滑动淡入动画（Framer Motion `delay: i * 0.05`）。

## 8. 详细间距与尺寸规范 (Spacing & Sizing)
为了确保复刻效果完美，请严格遵循以下 Tailwind 间距和尺寸类名：

### 8.1 榜单头部 (Header)
- **外边距/内边距**：`pt-12 pb-6 px-6` (顶部留白 48px，底部留白 24px，左右内边距 24px)。
- **标题文字**：`text-3xl font-black text-[#E76F51] tracking-tight`。
- **副标题文字**：`text-stone-500 text-sm mt-1 font-medium` (与主标题间距 `mt-1` 即 4px)。

### 8.2 前三名领奖台 (Podium)
- **整体容器**：`px-6 pt-4 pb-10 flex items-end justify-center gap-3` (底部对齐 `items-end`，间距 `gap-3` 即 12px)。
- **头像区域**：
  - 容器外边距：`mb-3` (距离下方柱子 12px)。
  - 头像尺寸：`w-14 h-14` (56x56px)。
  - 第一名皇冠定位：`absolute -top-7 left-1/2 -translate-x-1/2` (向上偏移 28px 居中)。
- **柱子高度与样式**：
  - 第一名：高度 `h-40` (160px)，背景 `bg-gradient-to-b from-[#E76F51] to-[#D95D3F]`，文字 `text-white`。
  - 第二名：高度 `h-32` (128px)，背景 `bg-stone-200`，文字 `text-stone-600`。
  - 第三名：高度 `h-28` (112px)，背景 `bg-stone-300`，文字 `text-stone-700`。
  - 柱子统一圆角：`rounded-t-2xl`，顶部内边距 `pt-4`。
- **底部用户信息**：
  - 容器上边距：`mt-3` (12px)。
  - 用户名：`text-sm font-bold text-stone-800 truncate w-20` (限制宽度防溢出)。
  - 准确率：`text-xs font-semibold text-[#E76F51] mt-0.5`。
  - 题数：`text-[10px] text-stone-400 font-medium mt-0.5`。

### 8.3 列表项 (List Items)
- **列表容器**：`px-4 flex flex-col gap-3` (左右内边距 16px，卡片间距 12px)。
- **卡片本身**：`bg-white rounded-2xl p-4 flex items-center` (内边距 16px，垂直居中)。
- **排名数字**：`w-8 text-center text-lg font-black text-stone-300 italic mr-2` (固定宽度 32px，右侧间距 8px)。
- **头像**：`w-10 h-10 rounded-full mr-3` (尺寸 40x40px，右侧间距 12px)。
- **中间信息 (Flex-1)**：
  - 用户名：`text-sm font-bold text-stone-800`。
  - 准确率：`text-xs text-stone-500 font-medium mt-0.5`。
- **右侧信息**：
  - 题数数值：`text-sm font-bold text-[#E76F51]`。
  - 题数标签：`text-[10px] text-stone-400 font-medium`。

### 8.4 底部导航栏 (Bottom Navigation)
- **容器**：`absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-stone-200/50 pb-safe z-50`。
- **内部 Flex 布局**：`flex justify-around items-center h-16 px-4` (高度 64px)。
- **按钮项**：`flex flex-col items-center justify-center w-16 gap-1` (固定宽度 64px，图标与文字间距 4px)。
- **文字尺寸**：`text-[10px] font-bold`。
