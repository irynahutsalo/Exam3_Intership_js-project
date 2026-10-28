<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const handleLogin = () => {
  errorMessage.value = ''

  if (email.value.trim() === 'admin@sea-esbjerg.dk' && password.value === 'admin123') {
    localStorage.setItem('is_admin_logged', 'true')
    router.push('/admin/dashboard')
  } else {
    errorMessage.value = 'Invalid email or password. Please try again.'
  }
}
</script>

<template>
  <main
    class="relative isolate min-h-[calc(100vh-64px)] bg-sky text-ink px-4 sm:px-6 pt-8 pb-[200px] sm:pb-[260px]"
  >
    <div class="relative z-10 max-w-[var(--width-content)] mx-auto">
      <RouterLink
        to="/companies"
        class="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-red hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
      >
        <span aria-hidden="true">←</span>
        Back to companies
      </RouterLink>

      <div class="relative max-w-[480px] mx-auto mt-8 sm:mt-12">
        <!-- Page heading -->
        <div class="mb-7">
          <p class="text-sm font-medium text-ink/60 mb-3">Find Your Internship</p>

          <h1
            class="font-display text-[46px] sm:text-[60px] font-semibold tracking-tight leading-[1.1]"
          >
            Admin
            <span class="text-brand-red italic">access.</span>
          </h1>

          <p class="mt-4 text-base text-ink/75">Sign in to manage company information.</p>
        </div>

        <!-- Decorative plane -->
        <img
          src="/images/paper-plane-trail.svg"
          alt=""
          aria-hidden="true"
          draggable="false"
          class="pointer-events-none absolute hidden xl:block w-[220px] h-auto top-0 left-full ml-10"
        />

        <!-- Login form -->
        <section
          aria-labelledby="login-heading"
          class="bg-paper border border-ink/10 border-l-4 border-l-brand-red rounded-md p-6 sm:p-8"
        >
          <h2 id="login-heading" class="text-2xl font-semibold mb-6">Sign in</h2>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label for="admin-email" class="block text-sm font-semibold mb-2">
                Email address
              </label>

              <input
                id="admin-email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="username"
                autocapitalize="none"
                :spellcheck="false"
                required
                :aria-invalid="Boolean(errorMessage)"
                :aria-describedby="errorMessage ? 'login-error' : undefined"
                class="w-full h-[52px] px-4 bg-white/70 border border-ink/20 rounded-md text-base text-ink focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 transition-colors"
              />
            </div>

            <div>
              <label for="admin-password" class="block text-sm font-semibold mb-2">
                Password
              </label>

              <div class="relative">
                <input
                  id="admin-password"
                  v-model="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :aria-invalid="Boolean(errorMessage)"
                  :aria-describedby="errorMessage ? 'login-error' : undefined"
                  class="w-full h-[52px] pl-4 pr-20 bg-white/70 border border-ink/20 rounded-md text-base text-ink focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15 transition-colors"
                />

                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  :aria-pressed="showPassword"
                  aria-controls="admin-password"
                  class="absolute inset-y-1 right-1 px-3 rounded text-sm font-semibold text-ink/65 hover:text-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-red"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <p
              v-if="errorMessage"
              id="login-error"
              role="alert"
              class="rounded-md border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm text-brand-red"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="w-full min-h-[52px] flex items-center justify-center gap-3 bg-brand-red text-white rounded-md px-5 py-3 font-semibold hover:bg-brand-red-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
            >
              Sign in
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <!-- Existing demo access -->
          <div class="mt-6 pt-5 border-t border-ink/15">
            <p class="text-sm font-semibold text-ink/70 mb-2">Demo access</p>

            <p class="text-sm leading-relaxed text-ink/60 break-words">
              Email: admin@sea-esbjerg.dk<br />
              Password: admin123
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Bottom decoration -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 z-0">
      <img
        src="/images/building-sun.png"
        alt=""
        draggable="false"
        class="block w-[280px] sm:w-[400px] lg:w-[480px] max-w-full h-auto"
      />
    </div>
  </main>
</template>
