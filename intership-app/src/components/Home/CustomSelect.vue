<template>
  <div class="relative">
    <!-- Select trigger button -->
    <button 
      @click="$emit('toggle')"
      type="button"
      class="w-full h-[52px] px-5 bg-white/60 border border-white/80 rounded-2xl flex items-center justify-between text-left text-[15px] focus:outline-none transition-all cursor-pointer"
    >
      <span 
        :class="modelValue ? 'text-text-main font-medium' : 'text-text-muted'"
        :style="!modelValue ? 'color: var(--color-text-muted)' : ''"
      >
        {{ modelValue || placeholder }}
      </span>

      <!-- Arrow indicator -->
      <svg 
        class="w-4 h-4 text-text-main/50 transition-transform duration-200" 
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown list -->
    <div 
      v-if="isOpen" 
      class="absolute z-30 w-full mt-2 bg-white/95 border border-white rounded-2xl shadow-lg backdrop-blur-md overflow-hidden py-1 max-h-[240px] overflow-y-auto"
    >
      <div 
        v-for="option in options" 
        :key="option"
        @click="selectOption(option)"
        class="px-5 py-3 text-[15px] text-text-main font-medium hover:bg-navy-dark hover:text-white cursor-pointer transition-colors"
        :class="{ 'bg-navy-dark text-white': modelValue === option }"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,   // Selected value passed from parent
  placeholder: String,  // Default input text
  options: Array,       // Available options list
  isOpen: Boolean       // Controls dropdown visibility state
})

const emit = defineEmits(['update:modelValue', 'toggle', 'select'])

const selectOption = (option) => {
  emit('update:modelValue', option) // Emit value update to parent
  emit('select', option)
}
</script>