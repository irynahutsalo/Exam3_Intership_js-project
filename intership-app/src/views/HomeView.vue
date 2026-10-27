<template>
  <main class="relative isolate min-h-screen pb-16 sm:pb-24 lg:pb-[180px]">
    <!-- Decorative collage -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <!-- Large hand with a paper plane -->
      <img
        src="/images/hand-plane.png"
        alt=""
        draggable="false"
        class="absolute -top-10 right-0 hidden lg:block w-[40vw] max-w-[640px] h-auto"
      />

      <!-- Building and sun partially behind the form -->
      <img
        src="/images/building-sun.png"
        alt=""
        draggable="false"
        class="absolute bottom-0 left-0 hidden lg:block w-[45vw] max-w-[720px] h-auto"
      />

      <!-- Large roof with a seated man -->
      <img
        src="/images/man-roof.png"
        alt=""
        draggable="false"
        class="absolute bottom-0 right-0 hidden lg:block w-[49vw] max-w-[780px] h-auto"
      />
    </div>

    <!-- Content above the collage -->
    <div class="relative z-10">
      <HeroHeader />

      <div class="px-4 sm:px-6">
        <SearchFilterCard />
      </div>
    </div>
  </main>
</template>

<script setup>
import HeroHeader from '../components/Home/HeroHeader.vue'
import SearchFilterCard from '../components/Home/SearchFilterCard.vue'
</script>
