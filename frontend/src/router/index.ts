import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../pages/Layout'),
      children: [
        {
          path: '',
          redirect: '/option-1',
        },
        {
          path: 'option-1',
          name: 'option-1',
          component: () => import('../pages/Dashboard'),
          meta: { title: 'Option 1' },
        },
        {
          path: 'option-2',
          name: 'option-2',
          component: () => import('../pages/Dashboard'),
          meta: { title: 'Option 2' },
        },
        {
          path: 'option-3',
          name: 'option-3',
          component: () => import('../pages/Dashboard'),
          meta: { title: 'Option 3' },
        },
        {
          path: 'option-4',
          name: 'option-4',
          component: () => import('../pages/Dashboard'),
          meta: { title: 'Option 4' },
        },
        {
          path: 'option-5',
          name: 'option-5',
          component: () => import('../pages/Dashboard'),
          meta: { title: 'Option 5' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login'),
    },
  ],
})

export default router
