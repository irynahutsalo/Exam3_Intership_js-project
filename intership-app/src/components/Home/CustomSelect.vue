<template>
  <div class="relative w-full">
    <!-- Button that opens and closes the dropdown -->
    <button
      @click="$emit('toggle')"
      type="button"
      :aria-expanded="isOpen"
      class="w-full min-h-[52px] px-4 py-3 bg-white border rounded-md flex items-center justify-between gap-3 text-left text-[15px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
      :class="isOpen ? 'border-brand-red' : 'border-ink/30 hover:border-ink/60'"
    >
      <span
        class="min-w-0 break-words font-medium"
        :class="modelValue ? 'text-ink' : 'text-ink/60'"
      >
        {{ modelValue || placeholder }}
      </span>

      <!-- Arrow rotates when the dropdown is open -->
      <svg
        class="w-4 h-4 shrink-0 transition-transform duration-200"
        :class="[isOpen ? 'text-brand-red' : 'text-ink/60', { 'rotate-180': isOpen }]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown options -->
    <div
      v-if="isOpen"
      class="absolute left-0 right-0 z-50 mt-2 max-h-[220px] overflow-y-auto bg-white border border-ink/25 rounded-md shadow-lg p-1"
    >
      <button
        v-for="option in options"
        :key="option"
        @click="selectOption(option)"
        type="button"
        class="w-full px-3 py-3 rounded-sm text-left text-[15px] font-medium flex items-center justify-between gap-3 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-red"
        :class="
          modelValue === option ? 'bg-brand-red/10 text-brand-red' : 'text-ink hover:bg-paper'
        "
      >
        <span class="min-w-0 break-words">{{ option }}</span>

        <!-- Checkmark identifies the selected option -->
        <svg
          v-if="modelValue === option"
          class="w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m5 12 4 4L19 6"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  placeholder: String,
  options: Array,
  isOpen: Boolean,
})

const emit = defineEmits(['update:modelValue', 'toggle', 'select'])

// Update the value and notify the parent component.
const selectOption = (option) => {
  emit('update:modelValue', option)
  emit('select', option)
}
</script>
