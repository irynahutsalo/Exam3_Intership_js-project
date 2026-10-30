<script setup>
// App is the root Vue component. It renders the persistent navigation once
// and delegates the active page to Vue Router.
import NavBar from '@/components/NavBar.vue'
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
    <!-- The navigation remains visible while RouterView changes the page content. -->
    <NavBar />
    <RouterView />

</template>

<style scoped/>