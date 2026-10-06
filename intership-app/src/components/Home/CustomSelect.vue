<template>
  <div class="relative w-full">
    <!-- Select trigger button -->
    <button 
      @click="$emit('toggle')"
      type="button"
      class="w-full h-[52px] px-5 bg-white/60 border border-white/80 rounded-2xl flex items-center justify-between text-left text-[15px] focus:outline-none transition-all cursor-pointer shadow-sm"
    >
      <span class="text-[#102a43] font-medium truncate">
        {{ modelValue || placeholder }}
      </span>

      <!-- Arrow indicator -->
      <svg 
        class="w-4 h-4 text-[#102a43]/50 transition-transform duration-200 shrink-0 ml-2" 
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown list with clean scroll container -->
    <div 
      v-if="isOpen" 
      class="absolute left-0 right-0 z-50 mt-2 bg-white/95 border border-white/90 rounded-2xl shadow-xl backdrop-blur-md py-1 max-h-[220px] overflow-y-auto"
    >
      <div 
        v-for="option in options" 
        :key="option"
        @click="selectOption(option)"
        class="px-5 py-3 text-[14px] text-[#102a43] font-medium hover:bg-[#102a43] hover:text-white cursor-pointer transition-colors"
        :class="{ 'bg-[#102a43] text-white': modelValue === option }"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,   
  placeholder: String,  
  options: Array,       
  isOpen: Boolean       
})

const emit = defineEmits(['update:modelValue', 'toggle', 'select'])

const selectOption = (option) => {
  emit('update:modelValue', option) 
  emit('select', option)
}
</script>