# 显示效果

![](../IMGs/lucky_draw.gif)

代码运行：

```shell
$ npm install
$ npm run dev
```

# 锲子

公司最近在做海外业务，主要针对CS-GO的开箱，我负责官网，其中有一个滚动抽奖的效果，之前电商业务主要以大转盘或者跑马灯抽奖形式为主，刚开始看到这个效果时，进入了误区，用的大转盘抽奖的思维，我们知道，大转盘效果只需要延着Z轴旋转到指定角度即可，所以在最开始时，我把所有的抽奖元素做成了3D效果，围成一个圈，然后让容器随着Y轴旋转，显然，效果不佳，也不是最终要实现的效果。后来，想着自己之前用JavaScript实现过轮播图效果，举一反三，最终完成了需求，这里分享给大家，如果大家觉得帮到了您，可以帮忙点个小心心哟。

# 说明

本篇文章主要给大家介绍实现的思路，后续会贴上代码，当然你也可以到 Github 仓库下载代码运行查看效果，毕竟音效通过录制gif是没办法体验的，哈哈。

技术方案：`Vue` + `TypeScript`

# 核心思路

核心思路： `Transition` +  `Transform:translateX` 

## 1. 布局基本结构

```html
<!-- 外层容器 -->
<div class="lucky-draw">
  <!-- 中间标识线（表示中奖的物品） -->
  <div class="lucky-draw-line"></div>
  <!-- 奖品容器，后续通过设置 transition + translateX 值实现滚动效果 -->
  <div class="lucky-draw-wrap">
    <!-- 奖品xn，撑起奖品容器的宽度 -->
    <div class="lucky-draw-item"></div>
    ...
  </div>
  <!-- 展示抽奖结果 -->
  <div class="lucky-draw-results"></div>
</div>
```

## 2. 计算元素宽度

首先我们要确定，容器在可视范围内 **完整展示** 多少个元素？为了让中奖的元素最终呈现在容器的最中间，建议展示奇数个（这样做的目的当然是为了方便后期计算啦）。因此，我们可以通过如下公式计算出元素的宽度： 
$$
元素宽度 = 外层容器宽度 \div 一屏完整展示元素的个数
$$

## 3. 数据处理

通常来说，参与到抽奖的奖品数量是有限的，可能只有几个奖品，几个奖品渲染到页面上所占的宽度是不够的，更别说做位移的动效了，那怎么办呢？我们可以自己随机数据呀，比如后端只返回了6条数据，那我要保证页面上展示70条，那我就从后端返回的数据中再随机64条数据（当然随机多少取决你自己，满足做位移动效的视觉效果就行），这样就可以让奖品所占的宽度足够长，便于我们做位移动画。随机的数据大概长这样：

<mark>[ ...随机数据x64, ... 后端返回的数据x6 ]</mark>

可能大家会有疑问，为什么把后端返回的数据放最后？这是为了尽可能稳定的去展示动画效果。

不过这样还有问题，如果中奖的物品刚好是最后一个元素，由于中奖物品要呈现在外层容器的最中间，那会出现容器后面有留白的问题，如下所示：

![](../IMGs/lucky_draw_layouts.png)

为了解决这个问题，我们可以在数组尾部，再追加1个元素占位即可，在计算中奖物品下标时，需要把尾部填充的数据排除。

当然，这只是在一屏展示3个元素的情况下追加1个，那如果一屏展示5个、7个甚至9个呢？这时我们可以动态计算，得出如下公式：
$$
后置填充数据条数 = Math.floor(一屏完整展示元素的个数 \div 2)
$$
根据如上公式可以得出：

- 一屏展示3个元素，后置需填充 1 条数据；
- 一屏展示5个元素，后置需填充 2 条数据；
- 一屏展示7个元素，后置需填充 3 条数据；
- 以此类推...

这样我们的数据结构应该是这样的：

<mark>[ ...前置填充数据, ...后端返回数据, ...后置填充数据]</mark>

这里，我封装了一个函数，大家可以自行理解：

```javascript
/**
 * 获取页面呈现的奖品数据源
 * @param configs
 * @returns
 */
static getLuckyDrawDataList<T>(configs: {
  /** 数据源（后端返回的数据） */
  source: Array<T>;
  /** 生成个数（界面需要展示的元素个数，用于撑起容器的宽度） */
  total: number;
  /** 可视个数（即在外层容器宽度内一屏展示的个数-奇数） */
  visibleCount: number;
}): Array<T> {
  // -- 解构数据
  const { source, total, visibleCount } = configs;
  // -- 创建数组，默认为数据源的数据
  const t = [...source];
  // -- 计算数据源数据的条数
  const len = source.length;
  // -- 计算后置填充的数据条数
  const tail = Math.floor(visibleCount / 2);
  // -- 前置填充
  while (t.length < total - tail) {
    const i = Math.floor(Math.random() * len);
    t.unshift(source[i]);
  }
  // -- 后置填充
  while (t.length < total) {
    const i = Math.floor(Math.random() * len);
    t.push(source[i]);
  }
  return t;
}
```

## 4. 执行抽奖动效

执行抽奖动效，大致分为如下几个步骤：

1. 调用后端接口，获取中奖的物品

2. 查询中奖物品的下标

   ⚠️ ：这一步非常关键，首先你需要排除后置填充的数据，然后从后往前查找中奖物品的下标。

3. 根据得到的下标计算位移值，公式如下：

   📌：$$ offset = -(index - mIndex) \times itemWidth $$

   - `index`：上一步计算出来的中奖下标
   - `mIndex`：中间位置，$$ Math.floor(一屏完整展示元素的个数 \div 2)$$
   - `itemWidth`：奖品元素的宽度

4. 为容器动态设置 `Transition` + `Transform:translateX(offset)` 值



当然，为了方便后续使用，我封装了一个执行动效的方法，供大家参考，首先看一下参数类型：

```typescript
interface LuckyDrawOptions {
  /** 容器元素，用于设置其 translateX 以达到位移效果 */
  wrap: HTMLElement;
  /** 中奖物品标识（ID） */
  winningID: string | number;
  /** 存有所有奖品标识（ID）的字符串数组 */
  winningIDs: Array<string | number>;
  /** 奖品元素宽度（不考虑间距） */
  itemWidth: number;
  /** 可视区域一屏展示的奖品个数 */
  visibleItemCount: number;
  /** 回调，抽奖动效结束之后的回调 */
  completed: Function;
  /** 开始音效，动画执行过程中的音效 */
  audioUriForStart?: string;
  /** 结束音效，动画执行结束时的音效*/
  audioUriForEnd?: string;
  /** 持续时间，默认10s（注意：持续时间必须与开始音效的持续时间保持一致，效果更好） */
  duration?: number;
  /** 是否启用动画 (默认true)*/
  openAnimation?: boolean;
  /** 是否启用音效 (默认true)*/
  openSound?: boolean;
}
```

方法内容：

```javascript
/**
 * 开始抽奖动效
 * @param options
 */
static draw(options: LuckyDrawOptions) {
  // -- 解构参数，处理默认值
  const {
    itemWidth,
    wrap,
    completed,
    winningID,
    winningIDs,
    visibleItemCount,
    audioUriForStart,
    audioUriForEnd,
    duration = 10,
    openAnimation = true,
    openSound = true,
  } = options;
  // -- 每次触发动画之前先复位状态
  wrap.style.transition = `transform 0s ease 0s`;
  wrap.style.transform = `translateX(0px)`;
  // -- 满足条件：播放开始音效
  if (openSound && openAnimation && audioUriForStart) {
    LuckyDraw.playAudio(audioUriForStart);
  }
  // -- 在屏幕刷新周期内，如果重复设置 style 无视觉效果
  // -- 所以调用 requestAnimationFrame 在下一周期内开始抽奖动效
  requestAnimationFrame(() => {
    // -- 查询中奖物品的下标（从后往前查找），便于计算位移距离
    /**
     * 特殊处理：
     * 1. 查询一屏展示的元素中（奇数个）中间元素的下标，如一屏展示5个，则中间元素为第3个元素，其下标为2，
     *    📌 计算公式：mIndex = Math.floor(visibleItemCount / 2)
     * 2. 动态计算截取长度，假设一屏展示5个元素，如果中奖元素刚好是最后一个，当我们执行动效把最后一个元素呈现在最中间时，
     *    最后两个元素的区域会是空白的，为了解决这个问题，我们必须考虑在最后预留两个元素作为填充，不计入计算中奖下标的位置。
     *    填充多少个元素在末尾不参与计算，可参照如下公式：
     *    📌 计算公式：winningIDs.slice(0, winningIDs.length - mIndex)
     */
    const mIndex = Math.floor(visibleItemCount / 2);
    const slice = winningIDs.slice(0, winningIDs.length - mIndex);
    const index = slice.lastIndexOf(winningID);
    // -- 未找到中奖物品，终止程序
    if (index === -1) return;
    // -- 动态计算偏移
    const offset = -(index - mIndex) * itemWidth;
    // -- 收尾函数
    const handleStop = () => {
      if (openSound && audioUriForEnd) {
        LuckyDraw.playAudio(audioUriForEnd);
      }
      completed();
    };
    // -- 判断是否启用动画
    if (openAnimation) {
      wrap.style.transition = `transform ${duration}s cubic-bezier(0.35, 0.08, 0.26, 0.93) 0s`;
      wrap.style.transform = `translateX(${offset}px)`;
      wrap.ontransitionend = function () {
        handleStop();
      };
    } else {
      wrap.style.transform = `translateX(${offset}px)`;
      handleStop();
    }
  });
}
```

# 完成代码

阅读源码










