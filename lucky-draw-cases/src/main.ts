/*
 * @Author: Lee
 * @Date: 2023-01-11 11:35:52
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-11 13:37:10
 * @Description:
 */
import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
