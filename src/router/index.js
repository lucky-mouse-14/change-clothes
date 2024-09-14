import { createRouter, createWebHashHistory, } from 'vue-router'
import routes from './routes'

export const router = createRouter({
  history: createWebHashHistory('/'),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0, })
})

export async function setupRouter(app) {
  app.use(router)
}