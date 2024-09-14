import { onMounted, onBeforeUnmount } from 'vue'

export function useFrame() {
  let animationId = null
  let frameCount = 0
  const framesPerUpdate = 1

  onBeforeUnmount(() => {
    stopFrame()
    frameCount = 0
  })

  /** startFrame */
  function startFrame(callback) {
    frameCount++

    if (frameCount % framesPerUpdate === 0) {
      callback && callback()
      frameCount = 0
    }

    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    // 一帧执行一次
    animationId = requestAnimationFrame(() => {
      startFrame(callback)
    })
  }

  function stopFrame() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  return {
    startFrame,
    stopFrame,
  }
}