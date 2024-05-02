import { onMounted, onUnmounted, } from 'vue'
import emitter from '@/utils'

export default function useEventBus() {
  onMounted(() => {
    emitter.on('update-boneObj', () => { })
  })

  onUnmounted(() => {
    emitter.off('update-boneObj')
  })
}