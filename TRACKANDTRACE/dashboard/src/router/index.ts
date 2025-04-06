import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Packages/IndexView.vue'),
    },
    {
      path: '/packages/:slug',
      name: 'package',
      component: () => import('@/views/Packages/_slug.vue'),
    },
    {
      path: '/drivers',
      name: 'drivers',
      component: () => import('@/views/Drivers/IndexView.vue'),
    },
    {
      path: '/shipments',
      name: 'shipments',
      component: () => import('@/views/Shipments/IndexView.vue'),
    },
    {
      path: '/shipments/:slug',
      name: 'shipment',
      component: () => import('@/views/Shipments/_slug.vue'),
    },
  ],
})

export default router
