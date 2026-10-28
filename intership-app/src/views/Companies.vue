<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import CustomSelect from '@/components/Home/CustomSelect.vue'
import companiesData from '@/data/companies.json'
import jsPDF from 'jspdf'
import { getCompanyFields, getAvailableFields } from '@/utils/internshipFields'

const router = useRouter()
const companies = ref([])

const selectedProgramme = ref('All programmes')
const isProgrammeOpen = ref(false)

// Array for multiple selected cities (checkboxes)
const selectedCities = ref([])

const selectedFields = ref([])
const languageEnglish = ref(false)
const languageDanish = ref(false)

// Search and Pagination states
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 14

const studyProgrammes = [
  'Datamatiker / Computer Science',
  'Multimedia Design',
  'Marketing Management',
  'Finansøkonom',
  'Finansbachelor',
  'Service & Experience Management',
  'International Sales & Marketing',
  'Production Technology',
  'Bygningskonstruktør',
  'Cyber Security',
]

// Dynamically collect unique cities from available companies
const availableCities = computed(() => {
  const citySet = new Set()
  companies.value.forEach((c) => {
    if (c.city) {
      const trimmed = c.city.trim()
      if (trimmed) citySet.add(trimmed)
    }
  })
  return Array.from(citySet).sort()
})

const programFieldsMap = {
  'Multimedia Design': [
    'UX/UI Design',
    'Frontend Development',
    'Graphic Design',
    'Content Creation',
    'Social Media',
    'Web Content / CMS',
    'Digital Marketing',
  ],
  'Datamatiker / Computer Science': [
    'Frontend Development',
    'Backend Development',
    'Full-stack Development',
    'Cyber Security',
    'Database Management',
  ],
  'Marketing Management': [
    'Digital Marketing',
    'Social Media Management',
    'Market Research',
    'Customer Experience',
    'Sales',
  ],
  'Service & Experience Management': [
    'Customer Experience',
    'Event Management',
    'HR & People',
    'Operations & Logistics',
    'Project Management',
  ],
}

const defaultFields = [
  'Customer Experience',
  'Event Management',
  'HR & People',
  'Operations & Logistics',
  'Project Management',
]

// Use the same programme-specific field list as the home page.
const availableInternshipFields = computed(() => {
  return getAvailableFields(companiesData, selectedProgramme.value)
})

// Reset selected fields when the study programme changes.
watch(
  selectedProgramme,
  () => {
    selectedFields.value = []
  },
  { flush: 'sync' },
)

// Collect selected filters for the removable chips.
const activeFilters = computed(() => {
  const filters = []

  if (selectedProgramme.value !== 'All programmes' && selectedProgramme.value) {
    filters.push({
      type: 'programme',
      value: selectedProgramme.value,
      label: selectedProgramme.value,
    })
  }

  selectedFields.value.forEach((field) => {
    filters.push({
      type: 'field',
      value: field,
      label: field,
    })
  })

  selectedCities.value.forEach((city) => {
    filters.push({
      type: 'city',
      value: city,
      label: city,
    })
  })

  if (languageEnglish.value) {
    filters.push({
      type: 'language',
      value: 'English',
      label: 'Website: English',
    })
  }

  if (languageDanish.value) {
    filters.push({
      type: 'language',
      value: 'Danish',
      label: 'Website: Danish',
    })
  }

  return filters
})

// Remove the selected filter and update its control.
const removeFilter = (filter) => {
  if (filter.type === 'programme') {
    selectedProgramme.value = 'All programmes'
  } else if (filter.type === 'field') {
    selectedFields.value = selectedFields.value.filter((field) => field !== filter.value)
  } else if (filter.type === 'city') {
    selectedCities.value = selectedCities.value.filter((city) => city !== filter.value)
  } else if (filter.value === 'English') {
    languageEnglish.value = false
  } else if (filter.value === 'Danish') {
    languageDanish.value = false
  }
}

onMounted(() => {
  // Scroll to the top of the page smoothly on mount
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Load companies state
  const saved = localStorage.getItem('companies_list')
  const rawData = saved ? JSON.parse(saved) : companiesData

  companies.value = rawData.map((item) => {
    let progs = []
    if (item.sourceProgrammes) {
      progs = item.sourceProgrammes
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    }

    return {
      id: item.companyId,
      brandName: item.brandName || item['name (source / legal)'],
      city: item.city ? item.city.trim() : '',
      description: item.description || item['description'] || '',
      sourceProgrammes: progs,
      internshipFields: getCompanyFields(item),
      websiteLanguages: item.websiteLanguages
        ? item.websiteLanguages
            .split(/[,;]/)
            .map((l) => l.trim().toLowerCase())
            .filter(Boolean)
        : [],
    }
  })

  if (!saved) {
    localStorage.setItem('companies_list', JSON.stringify(rawData))
  }

  // Read saved filters passed from the home search card
  const savedFilters = localStorage.getItem('user_search_filters')
  if (savedFilters) {
    try {
      const parsed = JSON.parse(savedFilters)
      if (parsed.programme) selectedProgramme.value = parsed.programme

      if (parsed.cities && Array.isArray(parsed.cities)) {
        selectedCities.value = parsed.cities
      } else if (parsed.city && parsed.city !== 'All cities') {
        selectedCities.value = [parsed.city]
      }

      if (parsed.fields && Array.isArray(parsed.fields)) {
        selectedFields.value = parsed.fields
      }

      if (parsed.languages && Array.isArray(parsed.languages)) {
        languageEnglish.value = parsed.languages.includes('English')
        languageDanish.value = parsed.languages.includes('Danish')
      }
    } catch (e) {
      console.error('Error loading filters from storage', e)
    }
  }
})

// Function to clear all filters and search state
const clearAllFilters = () => {
  selectedProgramme.value = 'All programmes'
  selectedCities.value = []
  selectedFields.value = []
  languageEnglish.value = false
  languageDanish.value = false
  searchQuery.value = ''
  currentPage.value = 1
  localStorage.removeItem('user_search_filters')
}

const programmeMapping = {
  'Multimedia Design': ['multimedia', 'multimediedesigner'],
  'Datamatiker / Computer Science': ['datamatiker', 'computer', 'it'],
  'Marketing Management': ['marketing', 'sales'],
  Finansøkonom: ['finans', 'finance', 'economy'],
  Finansbachelor: ['bachelor', 'finans'],
  'Service & Experience Management': ['service', 'experience', 'management'],
  'International Sales & Marketing': ['sales', 'marketing', 'international'],
  'Production Technology': ['production', 'technology'],
  Bygningskonstruktør: ['bygning', 'construction', 'konstruktør'],
  'Cyber Security': ['security', 'cyber', 'it'],
}

// Filter companies based on programme, cities, fields, languages, and name search query
const filteredCompanies = computed(() => {
  return companies.value.filter((company) => {
    // 1. Programme filter
    let matchesProgramme = true
    if (selectedProgramme.value && selectedProgramme.value !== 'All programmes') {
      const keywords = programmeMapping[selectedProgramme.value] || [
        selectedProgramme.value.toLowerCase(),
      ]
      matchesProgramme = company.sourceProgrammes.some((prog) => {
        const pLower = prog.toLowerCase()
        return keywords.some((kw) => pLower.includes(kw))
      })
    }

    // 2. Cities filter (checkboxes: if none selected, show all)
    let matchesCity = true
    if (selectedCities.value.length > 0) {
      matchesCity = selectedCities.value.some(
        (city) => company.city.toLowerCase() === city.toLowerCase(),
      )
    }

    // 3. Internship fields filter (optional)
    // Match any selected internship field.
    // With no fields selected, keep all companies.
    const matchesFields =
      selectedFields.value.length === 0 ||
      selectedFields.value.some((field) => company.internshipFields.includes(field))

    // 4. Language filter
    let matchesLanguage = true
    if (
      languageEnglish.value &&
      !company.websiteLanguages.includes('en') &&
      !company.websiteLanguages.includes('english')
    ) {
      matchesLanguage = false
    }
    if (
      languageDanish.value &&
      !company.websiteLanguages.includes('dk') &&
      !company.websiteLanguages.includes('danish')
    ) {
      matchesLanguage = false
    }

    // 5. Name search query filter
    let matchesSearch = true
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      matchesSearch = company.brandName && company.brandName.toLowerCase().includes(query)
    }

    return matchesProgramme && matchesCity && matchesFields && matchesLanguage && matchesSearch
  })
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredCompanies.value.length / itemsPerPage) || 1
})

const visiblePages = computed(() => {
  const count = Math.min(5, totalPages.value)

  const start = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - count + 1))

  return Array.from({ length: count }, (_, index) => start + index)
})

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCompanies.value.slice(start, end)
})

// Reset page to 1 when any filter or search query changes
watch(
  [selectedProgramme, selectedCities, selectedFields, languageEnglish, languageDanish, searchQuery],
  () => {
    currentPage.value = 1
  },
)

const openDetails = (id) => {
  router.push(`/company/${id}`)
}

// Function to download filtered companies list as PDF using jsPDF
const downloadPDF = () => {
  const doc = new jsPDF()
  let yPosition = 20

  doc.setFontSize(18)
  doc.text('Filtered Companies List', 14, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.text(`Total found: ${filteredCompanies.value.length}`, 14, yPosition)
  yPosition += 10

  filteredCompanies.value.forEach((company, index) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${company.brandName} (${company.city || 'N/A'})`, 14, yPosition)
    yPosition += 6

    if (company.description) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const splitDesc = doc.splitTextToSize(company.description, 180)
      doc.text(splitDesc, 14, yPosition)
      yPosition += splitDesc.length * 4 + 4
    }

    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(`Programmes: ${company.sourceProgrammes.join(', ') || 'None'}`, 14, yPosition)
    yPosition += 10
  })

  doc.save('filtered-companies.pdf')
}
</script>

<template>
  <div
    class="relative isolate min-h-screen bg-sky text-ink px-4 sm:px-6 pt-8 pb-[210px] sm:pb-[290px] lg:pb-[360px]"
  >
    <!-- Decorative building and sun below the results -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden"
    >
      <img
        src="/images/building-sun.png"
        alt=""
        draggable="false"
        loading="lazy"
        class="absolute bottom-0 left-0 w-[340px] sm:w-[520px] lg:w-[700px] max-w-full h-auto"
      />
    </div>
    <div class="relative z-10 max-w-[var(--width-content)] mx-auto">
      <!-- Page heading -->
      <section class="relative mb-10 sm:mb-12">
        <div class="relative z-10 md:pr-[240px] lg:pr-[320px]">
          <h1
            class="font-display text-[44px] sm:text-[60px] lg:text-[76px] font-semibold tracking-tight leading-[1.08]"
          >
            Find
            <span class="text-brand-red italic">companies.</span>
          </h1>

          <p class="mt-4 max-w-[580px] text-base sm:text-lg text-ink/75 leading-relaxed">
            Explore companies relevant to your studies.
          </p>

          <p class="mt-2 max-w-[580px] text-sm text-ink/65 leading-relaxed">
            Check company websites for current internship opportunities.
          </p>
        </div>

        <!-- Decorative paper plane -->
        <img
          src="/images/paper-plane-trail.svg"
          alt=""
          aria-hidden="true"
          draggable="false"
          class="pointer-events-none absolute right-0 top-0 hidden md:block w-[220px] lg:w-[300px] h-auto"
        />
      </section>

      <!-- Filters and results -->
      <div class="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        <!-- Left sidebar: filters -->
        <aside
          aria-label="Company filters"
          class="min-w-0 bg-paper border border-ink/10 rounded-md p-5"
        >
          <!-- Filter heading and reset button -->
          <div class="flex items-center justify-between gap-3 mb-6">
            <h2 class="text-xl font-semibold text-ink">Filters</h2>

            <button
              @click="clearAllFilters"
              type="button"
              class="min-h-11 text-sm text-brand-red hover:text-brand-red-hover hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              Clear all
            </button>
          </div>

          <!-- Study programme -->
          <div class="mb-6">
            <h3 class="text-[15px] font-semibold text-ink mb-3">Study programme</h3>

            <CustomSelect
              v-model="selectedProgramme"
              placeholder="All programmes"
              :options="['All programmes', ...studyProgrammes]"
              :is-open="isProgrammeOpen"
              @toggle="isProgrammeOpen = !isProgrammeOpen"
              @select="isProgrammeOpen = false"
            />
          </div>

          <!-- Internship fields -->
          <fieldset class="min-w-0 mb-6">
            <legend class="text-[15px] font-semibold text-ink mb-3">Internship fields</legend>

            <div class="max-h-[260px] overflow-y-auto pr-2">
              <label
                v-for="field in availableInternshipFields"
                :key="field"
                class="flex items-start gap-3 py-2 text-sm text-ink/85 cursor-pointer"
              >
                <input
                  v-model="selectedFields"
                  type="checkbox"
                  :value="field"
                  class="mt-0.5 w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                />

                <span class="leading-5">
                  {{ field }}
                  <span v-if="field === 'Other'" class="block text-xs text-ink/60">
                    Field not specified
                  </span>
                </span>
              </label>

              <p
                v-if="availableInternshipFields.length === 0"
                class="text-sm text-ink/65 leading-relaxed"
              >
                No internship fields available for this programme.
              </p>
            </div>
          </fieldset>

          <!-- Cities -->
          <fieldset class="min-w-0 mb-6">
            <legend class="text-[15px] font-semibold text-ink mb-3">Cities</legend>

            <div class="max-h-[220px] overflow-y-auto pr-2">
              <label
                v-for="city in availableCities"
                :key="city"
                class="flex items-start gap-3 py-2 text-sm text-ink/85 cursor-pointer"
              >
                <input
                  v-model="selectedCities"
                  type="checkbox"
                  :value="city"
                  class="mt-0.5 w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                />

                <span class="leading-5">{{ city }}</span>
              </label>
            </div>
          </fieldset>

          <!-- Website language -->
          <fieldset class="min-w-0">
            <legend class="text-[15px] font-semibold text-ink mb-3">Website language</legend>

            <label class="flex items-center gap-3 py-2 text-sm text-ink/85 cursor-pointer">
              <input
                v-model="languageEnglish"
                type="checkbox"
                class="w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              />
              <span>English</span>
            </label>

            <label class="flex items-center gap-3 py-2 text-sm text-ink/85 cursor-pointer">
              <input
                v-model="languageDanish"
                type="checkbox"
                class="w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              />
              <span>Danish</span>
            </label>
          </fieldset>
        </aside>

        <!-- Right Content Area -->
        <div class="min-w-0 space-y-6">
          <!-- Top bar with counter, search input, and Download PDF button -->
          <!-- Search and PDF download -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1 min-w-0">
              <label for="company-search" class="sr-only"> Search company by name </label>

              <input
                id="company-search"
                v-model="searchQuery"
                type="search"
                placeholder="Search company by name..."
                class="w-full sm:max-w-[680px] min-h-[52px] px-4 py-3 bg-paper border border-ink/20 rounded-md text-[15px] text-ink placeholder:text-ink/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              />
            </div>

            <button
              @click="downloadPDF"
              type="button"
              :disabled="filteredCompanies.length === 0"
              class="inline-flex min-h-11 items-center justify-center gap-2 px-2 text-sm font-medium text-brand-red hover:text-brand-red-hover hover:underline underline-offset-4 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M12 3v12m-4-4 4 4 4-4" />
                <path d="M5 16v4h14v-4" />
              </svg>

              Download PDF
            </button>
          </div>

          <!-- Result count and current range -->
          <div class="flex flex-wrap items-center justify-between gap-2" role="status">
            <p class="text-base font-semibold text-ink">
              {{ filteredCompanies.length }}
              {{ filteredCompanies.length === 1 ? 'company found' : 'companies found' }}
            </p>

            <p v-if="filteredCompanies.length > 0" class="text-sm text-ink/65">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }}–{{
                Math.min(currentPage * itemsPerPage, filteredCompanies.length)
              }}
              of {{ filteredCompanies.length }}
            </p>
          </div>

          <!-- Selected filters with remove buttons -->
          <div
            v-if="activeFilters.length > 0"
            class="flex flex-wrap items-center gap-2"
            aria-label="Selected filters"
          >
            <button
              v-for="filter in activeFilters"
              :key="`${filter.type}:${filter.value}`"
              @click="removeFilter(filter)"
              type="button"
              :aria-label="`Remove filter: ${filter.label}`"
              class="inline-flex min-h-11 max-w-full items-center gap-3 px-3 py-2 bg-paper border border-ink/15 rounded-md text-sm text-ink text-left hover:border-brand-red hover:text-brand-red transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              <span class="break-words">{{ filter.label }}</span>
              <span aria-hidden="true" class="shrink-0 text-lg leading-none">×</span>
            </button>

            <button
              @click="clearAllFilters"
              type="button"
              class="min-h-11 px-3 text-sm text-brand-red hover:text-brand-red-hover hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              Clear all
            </button>
          </div>

          <!-- Companies grid: 14 items per page -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article
              v-for="company in paginatedCompanies"
              :key="company.id"
              class="min-w-0 flex flex-col bg-paper border border-ink/10 rounded-md p-5 xl:p-6"
            >
              <!-- Company name and location -->
              <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-4">
                <h2
                  class="font-sans text-[22px] xl:text-[24px] font-semibold text-ink leading-[1.25] tracking-[-0.02em] break-words"
                >
                  {{ company.brandName }}
                </h2>

                <p v-if="company.city" class="pt-1 text-sm text-ink/70">
                  {{ company.city }}
                </p>
              </div>

              <!-- Short preview; the full description is on the company page -->
              <p
                v-if="company.description"
                class="text-[15px] text-ink/80 leading-relaxed line-clamp-3 mb-6"
              >
                {{ company.description }}
              </p>

              <!-- Programme and website languages -->
              <div class="mt-auto">
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-ink mb-2">Study programme</p>

                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="programme in company.sourceProgrammes"
                        :key="programme"
                        class="max-w-full px-2.5 py-1 rounded-md bg-sky/35 text-ink text-xs leading-relaxed"
                      >
                        {{
                          programme.toLowerCase() === 'multimediedesigner'
                            ? 'Multimedia Design'
                            : programme.toLowerCase() === 'datamatiker'
                              ? 'Datamatiker / Computer Science'
                              : programme
                        }}
                      </span>

                      <span
                        v-if="company.sourceProgrammes.length === 0"
                        class="text-sm text-ink/65"
                      >
                        Not specified
                      </span>
                    </div>
                  </div>

                  <div class="xl:border-l xl:border-ink/15 xl:pl-4">
                    <p class="text-sm font-semibold text-ink mb-2">Website language</p>

                    <p class="text-sm text-ink/75 leading-relaxed">
                      {{
                        company.websiteLanguages.length
                          ? company.websiteLanguages
                              .map((language) => {
                                if (language === 'en' || language === 'english') {
                                  return 'English'
                                }
                                if (
                                  language === 'dk' ||
                                  language === 'da' ||
                                  language === 'danish'
                                ) {
                                  return 'Danish'
                                }
                                return language.charAt(0).toUpperCase() + language.slice(1)
                              })
                              .join(', ')
                          : 'Not specified'
                      }}
                    </p>
                  </div>
                </div>

                <!-- Company details link -->
                <div class="border-t border-ink/10 pt-3">
                  <RouterLink
                    :to="`/company/${company.id}`"
                    :aria-label="`View company: ${company.brandName}`"
                    class="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-brand-red hover:text-brand-red-hover hover:underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
                  >
                    View company
                    <span aria-hidden="true">→</span>
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredCompanies.length === 0"
            class="bg-white/50 backdrop-blur-md p-10 rounded-[28px] text-center text-[#102a43] font-semibold shadow-sm"
          >
            No companies found matching your selected filters or search query.
          </div>

          <!-- Pagination -->
          <nav
            v-if="totalPages > 1"
            aria-label="Company results pages"
            class="flex flex-wrap items-center justify-center gap-2 pt-6"
          >
            <button
              @click="currentPage--"
              type="button"
              :disabled="currentPage === 1"
              class="min-h-11 px-4 py-2 bg-paper border border-ink/15 rounded-md text-sm font-medium text-ink hover:border-brand-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              Previous
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              type="button"
              :aria-label="`Page ${page}`"
              :aria-current="currentPage === page ? 'page' : undefined"
              class="min-w-11 min-h-11 px-3 py-2 border rounded-md text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              :class="
                currentPage === page
                  ? 'bg-brand-red border-brand-red text-white'
                  : 'bg-paper border-ink/15 text-ink hover:border-brand-red'
              "
            >
              {{ page }}
            </button>

            <button
              @click="currentPage++"
              type="button"
              :disabled="currentPage === totalPages"
              class="min-h-11 px-4 py-2 bg-paper border border-ink/15 rounded-md text-sm font-medium text-ink hover:border-brand-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
