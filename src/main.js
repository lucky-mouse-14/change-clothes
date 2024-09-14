import { createApp } from 'vue'
import './styles/index.less'
import App from './App.vue'

import { setupRouter } from './router'

async function bootstrap() {
  const app = createApp(App)
  // 挂载路由
  await setupRouter(app)

  app.mount('#app')
}

bootstrap()
