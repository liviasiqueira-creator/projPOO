import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../pages/Layout'),
      children: [
        {
          path: '/home',
          name: 'Home',
          component: () => import('../pages/Home'),
          meta: { title: 'Barbearias' },
        },
        {
          path: '/barbershop/:id',
          name: 'barbershop-profile',
          component: () => import('../pages/BarberShopProfile'),
          meta: { title: 'Perfil da barbearia' },
        },
        {
          path: '/barbershop/register',
          name: 'barbershop-register',
          component: () => import('../pages/BarberShopCreate'),
          meta: { title: 'Cadastrar barbearia' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/CreateClient'),
    }
  ],
})

export default router
