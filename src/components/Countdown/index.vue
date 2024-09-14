<template>
  <Transition name="fade-scale">
    <div v-show="isCountdown" class="countdown">
      <div class="number-box">{{ currentNumber }}</div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, defineProps, onMounted, onBeforeUnmount, defineExpose, } from 'vue'

const props = defineProps({
  number: {
    type: [String, Number],
    default: 3,
  },
})

let timer = null

const currentNumber = ref(0)
const isCountdown = ref(false)

defineExpose({
  startCountdown
})

onBeforeUnmount(() => {
  endCountdown()
})

function startCountdown() {
  isCountdown.value = true
  currentNumber.value = props.number * 1
  timer = setInterval(() => {
    if (currentNumber.value === 0) {
      endCountdown()
      return null
    }
    currentNumber.value--
  }, 1000);
}

function endCountdown() {
  isCountdown.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
</script>

<style lang="less" scoped>
.countdown {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  font-size: 100%;

  .number-box {
    font-size: 10em;
    color: orange;
    font-weight: 600;
  }
}
</style>