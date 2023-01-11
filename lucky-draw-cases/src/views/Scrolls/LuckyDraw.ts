/*
 * @Author: Lee
 * @Date: 2023-01-11 15:17:20
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-11 18:41:47
 * @Description: 滚动抽奖
 */

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

class LuckyDraw {
  /**
   * 播放音效
   * @param uri 音效地址
   */
  static playAudio(uri: string) {
    const audio = new Audio(uri);
    audio.play();
    audio.onended = function () {
      audio.src = '';
      audio.srcObject = null;
      audio.remove();
    };
  }
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
}

export default LuckyDraw;
