<script setup>
// Details page resolves one company from the route, normalizes its values,
// preserves the previous search, and exposes safe contact links.
import { computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getCompanySlug } from '@/utils/companyUrls'
import companiesData from '@/data/companies.json'
import { getCompanyFields } from '@/utils/internshipFields'


// Router utilities provide the requested slug and navigation targets.
const route = useRoute()
const router = useRouter()

// Normalize source values that may contain several comma- or semicolon-separated entries.
const splitValues = (value) => {
  const values = Array.isArray(value) ? value : [value || '']

  return values
    .flatMap((item) => String(item).split(/[;,]/))
    .map((item) => item.trim())
    .filter(Boolean)
}

// Accept only HTTP(S) links so external navigation is predictable and safe.
const safeWebsite = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''

  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)

    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

// Convert source programme codes into labels suitable for the user interface.
const programmeLabels = {
  datamatiker: 'Datamatiker / Computer Science',
  multimediedesigner: 'Multimedia Design',
}

// Convert language codes into readable language names.
const languageLabels = {
  en: 'English',
  english: 'English',
  dk: 'Danish',
  da: 'Danish',
  danish: 'Danish',
}

// Resolve the requested company from localStorage when available, falling back
// to bundled data, then return one normalized object for the template.
const company = computed(() => {
  let data = companiesData

  try {
    const saved = JSON.parse(localStorage.getItem('companies_list'))
    if (Array.isArray(saved)) data = saved
  } catch {
    // Use the imported data if the saved list cannot be read.
  }

  const requestedSlug = String(route.params.slug || '')

  // Find by readable name, with support for old links containing an ID.
  const item =
    data.find((entry) => getCompanySlug(entry) === requestedSlug) ||
    data.find((entry) => String(entry.companyId) === requestedSlug)

  if (!item) return null

  return {
    slug: getCompanySlug(item),
    brandName: item.brandName || item['name (source / legal)'],
    city: String(item.city || '').trim(),
    description: String(item.description || '').trim(),
    address: String(item.address || '').trim(),
    email: String(item.email || '').trim(),
    phone: String(item.phone || '').trim(),
    website: safeWebsite(item.website),
    careerUrl: safeWebsite(item.careerUrl),
    programmes: splitValues(item.sourceProgrammes).map(
      (value) => programmeLabels[value.toLowerCase()] || value,
    ),
    languages: splitValues(item.websiteLanguages).map(
      (value) => languageLabels[value.toLowerCase()] || value,
    ),
    fields: getCompanyFields(item),
  }
})

// Normalize legacy or shared links while preserving the user's return-to-list state.
watch(
  () => [company.value?.slug, route.fullPath],
  ([slug]) => {
    if (!slug) return

    // Preserve filters from an old shared company link.
    if (typeof route.query.filters === 'string') {
      try {
        sessionStorage.setItem(
          'companies_return_query',
          JSON.stringify({ filters: route.query.filters }),
        )
      } catch {
        // The company page can still open without saved search state.
      }
    }

    const hasQuery = Object.keys(route.query).length > 0
    const hasOldAddress = String(route.params.slug) !== slug

    if (!hasQuery && !hasOldAddress) return

    // Clean up query parameters and standardize the URL structure
    router.replace({
      name: 'company-details',
      params: { slug },
      query: {},
      hash: route.hash,
    })
  },
  { immediate: true },
)

// Build a back link that restores the filters saved before opening this profile.
const backToCompanies = computed(() => {
  let query = {}

  try {
    const saved = JSON.parse(sessionStorage.getItem('companies_return_query') || '{}')

    if (saved && typeof saved.filters === 'string') {
      query = { filters: saved.filters }
    }
  } catch {
    // Return to the full list if saved search state is unavailable.
  }

  return {
    name: 'companies',
    query,
  }
})

// Printing uses the browser's print styles to create a PDF-friendly profile.
const downloadPDF = () => window.print()
</script>

<template>
  <!-- Company profile page with navigation, normalized information panels,
       contact actions, and a not-found fallback. -->
  <main
    class="company-details relative isolate min-h-screen bg-sky text-ink px-4 sm:px-6 pt-8 pb-0"
  >
    <div class="relative z-10 max-w-[var(--width-content)] mx-auto">
      <!-- Return navigation and print/export action. -->
      <div class="page-actions flex flex-wrap items-center justify-between gap-3 mb-8">
        <RouterLink
          :to="backToCompanies"
          class="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-red hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-red"
        >
          <span aria-hidden="true">←</span>
          Back to companies
        </RouterLink>

        <button
          v-if="company"
          type="button"
          @click="downloadPDF"
          class="min-h-11 px-3 text-sm font-semibold text-brand-red hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-red"
        >
          Download PDF ↓
        </button>
      </div>

      <!-- Profile heading identifies the selected company before its details. -->
      <div class="relative mb-3">
        <p class="text-[14px] sm:text-[16px] font-medium text-ink/60">Company details</p>

        <img
          src="/images/paper-plane-trail.svg"
          alt=""
          aria-hidden="true"
          draggable="false"
          class="decoration pointer-events-none absolute right-0 top-0 hidden md:block w-[260px] lg:w-[340px] h-auto -scale-x-100"
        />
      </div>

      <!-- Render the full profile only after the route has resolved a company. -->
      <template v-if="company">
        <div class="mb-7 sm:mb-9 md:pr-[280px] lg:pr-[360px]">
          <h1
            class="font-sans text-[36px] sm:text-[48px] lg:text-[56px] font-semibold text-ink tracking-tight leading-[1.1] break-words"
          >
            {{ company.brandName }}
          </h1>

          <p v-if="company.city" class="mt-3 text-[16px] sm:text-[18px] text-ink/65">
            {{ company.city }}
          </p>
        </div>

        <!-- Main information panel and contact sidebar adapt to screen width. -->
        <div class="details-grid grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Descriptive and classification information about the company. -->
          <section
            aria-label="Company information"
            class="details-panel lg:col-span-2 bg-paper border border-ink/10 rounded-md p-6 sm:p-8"
          >

          <!-- About company section -->
            <div class="pb-6">
              <h3 class="text-xl font-semibold mb-3">About the company</h3>

              <p class="text-[16px] leading-relaxed text-ink/80 whitespace-pre-line">
                {{ company.description || 'Description not provided.' }}
              </p>
            </div>

            <!-- Study programme tags section -->
            <div class="border-t border-ink/15 py-6">
              <h3 class="text-xl font-semibold mb-4">Study programme</h3>

              <div v-if="company.programmes.length" class="flex flex-wrap gap-2">
                <span
                  v-for="programme in company.programmes"
                  :key="programme"
                  class="bg-sky/35 rounded-md px-3 py-2 text-sm"
                >
                  {{ programme }}
                </span>
              </div>

              <p v-else class="text-ink/60">Not provided</p>
            </div>

            <!-- Internship fields tags section -->
            <div class="border-t border-ink/15 py-6">
              <h3 class="text-xl font-semibold mb-4">Internship fields</h3>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="field in company.fields"
                  :key="field"
                  class="border border-ink/25 rounded-md px-3 py-2 text-sm"
                >
                  {{ field === 'Other' ? 'Other / Not specified' : field }}
                </span>
              </div>

              <p class="mt-3 text-sm leading-relaxed text-ink/60">
                Contact the company to confirm available opportunities.
              </p>
            </div>

            <!-- Website languages section -->
            <div class="border-t border-ink/15 pt-6">
              <h3 class="text-xl font-semibold mb-3">Website language</h3>
              <p class="text-ink/80">
                {{ company.languages.join(' · ') || 'Not provided' }}
              </p>
            </div>
          </section>

          <!-- Contact panel turns available values into actionable links. -->
          <aside
            aria-label="Company contact details"
            class="details-panel bg-paper border border-ink/10 rounded-md p-6 sm:p-8"
          >
            <h3 class="text-xl font-semibold mb-6">Get in touch</h3>

            <dl class="space-y-5 text-[15px]">

              <!-- Website link item -->
              <div>
                <dt class="text-sm text-ink/60 mb-1">Website</dt>
                <dd class="break-words">
                  <a
                    v-if="company.website"
                    :href="company.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-brand-red underline underline-offset-4"
                  >
                    {{ company.website }}
                  </a>
                  <span v-else class="text-ink/60">Not provided</span>
                </dd>
              </div>

              <!-- Email link item -->
              <div>
                <dt class="text-sm text-ink/60 mb-1">Email</dt>
                <dd class="break-words">
                  <a
                    v-if="company.email"
                    :href="`mailto:${company.email}`"
                    class="text-brand-red underline underline-offset-4"
                  >
                    {{ company.email }}
                  </a>
                  <span v-else class="text-ink/60">Not provided</span>
                </dd>
              </div>

              <!-- Phone link item -->
              <div>
                <dt class="text-sm text-ink/60 mb-1">Phone</dt>
                <dd>
                  <a
                    v-if="company.phone"
                    :href="`tel:${company.phone.replace(/[^\d+]/g, '')}`"
                    class="hover:text-brand-red hover:underline underline-offset-4"
                  >
                    {{ company.phone }}
                  </a>
                  <span v-else class="text-ink/60">Not provided</span>
                </dd>
              </div>
              
              <!-- Address item -->
              <div>
                <dt class="text-sm text-ink/60 mb-1">Address</dt>
                <dd class="leading-relaxed">
                  {{ company.address || 'Not provided' }}
                </dd>
              </div>
            </dl>

            <div class="mt-7 space-y-3">
              <a
                v-if="company.website"
                :href="company.website"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-3 text-white font-semibold hover:bg-brand-red-hover transition-colors"
              >
                Visit website <span aria-hidden="true">↗</span>
              </a>

              <a
                v-if="company.careerUrl"
                :href="company.careerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-brand-red px-4 py-3 text-brand-red font-semibold hover:bg-brand-red/5 transition-colors"
              >
                Careers <span aria-hidden="true">↗</span>
              </a>
            </div>

            <p class="mt-4 text-sm leading-relaxed text-ink/60">
              Check the company website for current internship opportunities.
            </p>
          </aside>
        </div>
      </template>

      <!-- Explicit fallback for an unknown or outdated company slug. -->
      <section v-else class="bg-paper rounded-md border border-ink/10 p-8">
        <h2 class="text-2xl font-semibold mb-3">Company not found</h2>
        <p class="text-ink/70">Return to the company list and select another company.</p>
      </section>
    </div>

    <!-- Decorative footer artwork is visual-only and excluded from assistive tech. -->
    <div
      aria-hidden="true"
      class="decoration pointer-events-none relative z-0 -mt-[10px] -mx-4 sm:-mx-6"
    >
      <!-- Building and sun on the left -->
      <img
        src="/images/building-sun.webp"
        alt=""
        draggable="false"
        class="absolute bottom-0 left-0 w-[180px] sm:w-[320px] lg:w-[460px] max-w-[45%] h-auto"
      />

      <!-- Man on the right -->
      <img
        src="/images/man-roof.webp"
        alt=""
        draggable="false"
        class="block ml-auto w-[380px] sm:w-[540px] lg:w-[680px] max-w-[55%] h-auto"
      />
    </div>
  </main>
</template>

<style scoped>
/* Styles optimized for paper printouts and PDF exports */
@media print {
  .page-actions,
  .decoration {
    display: none !important;
  }

  .company-details {
    background: white !important;
    padding: 0 !important;
    min-height: auto !important;
  }

  .details-grid {
    display: block;
  }

  .details-panel {
    margin-bottom: 16px;
    background: #faf7ef !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  h2,
  h3 {
    break-after: avoid;
  }

  dl > div {
    break-inside: avoid;
  }
}
</style>
