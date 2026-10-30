// Example Pinia store showing the standard pattern for shared reactive state.
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // The source value is reactive, so components using the store update automatically.
  const count = ref(0)
  // Derived state is calculated from count and cached by Vue until count changes.
  const doubleCount = computed(() => count.value * 2)
  // Store actions contain the mutations that components can call.
  function increment() {
    count.value++
  }

  // Expose state, derived state, and actions to store consumers.
  return { count, doubleCount, increment }
})
