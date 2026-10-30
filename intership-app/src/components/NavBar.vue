<template>
  <!-- Persistent site header that provides the main navigation on every page. -->
  <header class="w-full border-b border-ink/25 text-ink">
    <!-- Centered container; links wrap on small screens -->
    <div
      class="max-w-[var(--width-content)] mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-x-10 gap-y-1 py-3"
    >
      <!-- Home link -->
      <RouterLink
        to="/"
        exact-active-class="border-brand-red"
        class="inline-flex min-h-11 items-center border-b-2 border-transparent text-xl font-bold hover:text-brand-red transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        Find Your Internship
      </RouterLink>

      <!-- Main navigation -->
      <nav aria-label="Main navigation" class="flex items-center gap-6 text-sm font-medium">
        <RouterLink
          to="/companies"
          active-class="border-brand-red"
          class="inline-flex min-h-11 items-center border-b-2 border-transparent hover:text-brand-red transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Find companies
        </RouterLink>

        <RouterLink
          to="/admin"
          active-class="border-brand-red"
          class="inline-flex min-h-11 items-center border-b-2 border-transparent hover:text-brand-red transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Admin
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
// RouterLink provides client-side navigation without full page reloads.
import { RouterLink } from 'vue-router'
</script>
