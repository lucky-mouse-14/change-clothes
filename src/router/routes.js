import pagesRoutes from './modules/pages.js'

const routes = [
  {
    path: '/',
    name: 'Index',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/home.vue'),
  },
  ...pagesRoutes,
]

export default routes