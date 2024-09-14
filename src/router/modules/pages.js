const pages = [
  {
    path: '/2d-mask-video',
    name: '2DMaskVideo',
    component: () => import('@/views/2d-mask-video/index.vue'),
    meta: {
      title: '2D遮罩 - 视频'
    }
  },
  {
    path: '/2d-mask-camera',
    name: '2DMaskCamera',
    component: () => import('@/views/2d-mask-camera/index.vue'),
    meta: {
      title: '2D遮罩 - 单目摄像头'
    }
  },
  {
    path: '/3d-mask-video',
    name: '3DMaskVideo',
    component: () => import('@/views/3d-mask-video/index.vue'),
    meta: {
      title: '3D遮罩 - 视频'
    }
  },
  {
    path: '/3d-mask-camera',
    name: '3DMaskCamera',
    component: () => import('@/views/3d-mask-camera/index.vue'),
    meta: {
      title: '3D遮罩 - 单目摄像头'
    }
  },
]
export default pages