/*
 * @Author: Lee
 * @Date: 2023-01-11 11:35:52
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-11 11:42:44
 * @Description:
 */
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/index-page',
    },

    {
      path: '/index-page',
      name: 'index-page',
      component: () => import('@/views/IndexPage/index.vue'),
      meta: {
        title: 'lucky-draws',
      },
    },
    {
      path: '/scrolls',
      name: 'scrolls',
      component: () => import('@/views/Scrolls/index.vue'),
      meta: {
        title: 'scrolls',
      },
    },
    {
      path: '/turntable',
      name: 'Turntable',
      component: () => import('@/views/Turntable/index.vue'),
      meta: {
        title: 'turntable',
      },
    },
  ],
});

router.afterEach((to) => {
  // → 设置标题
  if (to.path !== '/favicon.icon') {
    document.title = to.meta.title ? (to.meta.title as string) : '';
  }
  // → 滚动
  window.scrollTo(0, 0);
});
export default router;
