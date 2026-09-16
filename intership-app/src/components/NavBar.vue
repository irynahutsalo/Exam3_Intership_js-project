<template>
  <header class="w-full h-[64px] bg-navy-dark/72 border-b border-white/10 text-[14px]">
    <!-- Centered container with max-width limitation -->
    <div class="max-w-[var(--width-content)] h-full mx-auto px-6 flex items-center justify-between">
      
      <!-- Brand title with active state background on current page -->
      <div class="font-medium">
        <RouterLink 
          to="/" 
          active-class="bg-text-accent/15 text-text-accent backdrop-blur-sm"
          class="px-4 py-2 rounded-xl text-text-accent/70 hover:text-text-accent hover:bg-text-accent/10 transition-all inline-block"
        >
          Find Your Internship
        </RouterLink>
      </div>

      <!-- Navigation links on the right -->
      <nav class="flex items-center gap-2 font-medium">
        <RouterLink 
          to="/companies" 
          active-class="bg-text-accent/15 text-text-accent backdrop-blur-sm"
          class="px-4 py-2 rounded-xl text-text-accent/70 hover:text-text-accent hover:bg-text-accent/10 transition-all"
        >
          Find companies
        </RouterLink>

        <RouterLink 
          to="/admin" 
          active-class="bg-text-accent/15 text-text-accent backdrop-blur-sm"
          class="px-4 py-2 rounded-xl text-text-accent/55 hover:text-text-accent hover:bg-text-accent/10 transition-all"
        >
          Admin
        </RouterLink>
      </nav>

    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>