<template>
  <!-- Home page combines decorative artwork with the hero and search workflow. -->
  <!-- Main layout container with responsive bottom padding for background illustrations -->
  <main class="relative isolate min-h-screen pb-16 sm:pb-24 lg:pb-[180px]">
    <!-- Decorative collage background layer (hidden on small screens, visible on large screens) -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <!-- Top-right decorative illustration: Hand with a paper plane -->
      <img
        src="/images/hand-plane.webp"
        alt=""
        draggable="false"
        class="absolute top-4 right-[-4vw] hidden lg:block w-[36vw] max-w-[560px] h-auto"
      />

      <!-- Building and sun partially behind the form -->
      <img
        src="/images/building-sun.webp"
        alt=""
        draggable="false"
        class="absolute bottom-0 left-0 hidden lg:block w-[45vw] max-w-[720px] h-auto"
      />

      <!-- Large roof with a seated man -->
      <img
        src="/images/man-roof.webp"
        alt=""
        draggable="false"
        class="absolute bottom-0 right-0 hidden lg:block w-[49vw] max-w-[780px] h-auto"
      />
    </div>

    <!-- Content above the collage -->
    <div class="relative z-10">
      <HeroHeader />

      <!-- Centered container wrapping the main interactive search and filter card -->
      <div class="px-4 sm:px-6">
        <SearchFilterCard />
      </div>
    </div>
  </main>
</template>

<script setup>
// Compose the home page from focused presentational and form components.
import HeroHeader from '../components/Home/HeroHeader.vue'
import SearchFilterCard from '../components/Home/SearchFilterCard.vue'
</script>
