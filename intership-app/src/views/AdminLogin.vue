<template>
  <!-- Main container with a nice background and centered content -->
  <div class="min-h-screen bg-[#a8c4d8] flex items-center justify-center p-6">
    
    <!-- Login card wrapper with glassmorphism effect -->
    <div class="w-full max-w-[480px] bg-[#e4eff7]/95 backdrop-blur-md rounded-[32px] border border-white/80 shadow-lg p-10">
      
      <!-- Logo and header section -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-14 h-14 bg-[#e53e3e] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md mb-4">
          SE
        </div>
        <h1 class="text-2xl font-extrabold text-[#102a43]">SEA Esbjerg</h1>
        <p class="text-sm text-[#627d98] font-medium">Admin Portal</p>
      </div>

      <h2 class="text-lg font-bold text-[#102a43] mb-6">Sign in to your account</h2>

      <!-- Login form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Email input field -->
        <div>
          <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider mb-2">
            Email address
          </label>
          <input 
            type="email" 
            v-model="email"
            required
            placeholder="admin@sea-esbjerg.dk"
            class="w-full h-12 px-4 bg-white/70 border border-white rounded-2xl text-[#102a43] font-medium focus:outline-none focus:border-[#102a43] transition-colors"
          />
        </div>

        <!-- Password input field -->
        <div>
          <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider mb-2">
            Password
          </label>
          <input 
            type="password" 
            v-model="password"
            required
            placeholder="••••••••"
            class="w-full h-12 px-4 bg-white/70 border border-white rounded-2xl text-[#102a43] font-medium focus:outline-none focus:border-[#102a43] transition-colors"
          />
        </div>

        <!-- Error message display if credentials are wrong -->
        <p v-if="errorMessage" class="text-red-500 text-xs font-semibold text-center">
          {{ errorMessage }}
        </p>

        <!-- Submit button -->
        <button 
          type="submit"
          class="w-full h-12 bg-[#102a43] hover:bg-[#1f3f5b] text-white font-semibold rounded-2xl transition-colors shadow-md cursor-pointer mt-2"
        >
          Sign In
        </button>
      </form>

      <!-- Demo credentials helper hint -->
      <div class="mt-6 text-center">
        <p class="text-xs text-[#627d98]">
          Demo: <span class="font-semibold text-[#102a43]">admin@sea-esbjerg.dk</span> / <span class="font-semibold text-[#102a43]">admin123</span>
        </p>
      </div>

      <!-- Navigation link back to the public website -->
      <div class="mt-8 pt-6 border-t border-white/50 text-center">
        <router-link to="/" class="text-xs font-semibold text-[#627d98] hover:text-[#102a43] transition-colors">
          &larr; Back to main site
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Initialize router for page redirection
const router = useRouter()

// Reactive variables for storing user input
const email = ref('')
const password = ref('')
const errorMessage = ref('')

// Function to handle login process
const handleLogin = () => {
  // Check if entered credentials match our demo credentials
  if (email.value === 'admin@sea-esbjerg.dk' && password.value === 'admin123') {
    // Save authentication flag in browser's localStorage
    localStorage.setItem('is_admin_logged', 'true')
    // Redirect user to admin dashboard
    router.push('/admin/dashboard')
  } else {
    // Show error message if credentials are incorrect
    errorMessage.value = 'Invalid email or password. Use demo credentials.'
  }
}
</script>