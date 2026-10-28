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
  <div class="min-h-screen bg-sky text-ink px-4 sm:px-6 pt-8 pb-16">
    <div class="max-w-[var(--width-content)] mx-auto">
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
        <!-- Left Sidebar: Active Filters -->
        <div class="min-w-0">
          <div
            class="bg-[#e4eff7]/95 backdrop-blur-md rounded-[28px] border border-white/80 shadow-md"
          >
            <div
              class="bg-[#102a43] text-white p-5 font-bold text-lg rounded-t-[28px] flex justify-between items-center"
            >
              <span>Active Filters</span>
              <!-- Clean All Button -->
              <button
                @click="clearAllFilters"
                class="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-xl transition-colors cursor-pointer font-normal"
              >
                Clean all
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Study Programme Filter -->
              <div>
                <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider mb-2">
                  Study Programme
                </label>
                <CustomSelect
                  v-model="selectedProgramme"
                  placeholder="All programmes"
                  :options="['All programmes', ...studyProgrammes]"
                  :is-open="isProgrammeOpen"
                  @toggle="isProgrammeOpen = !isProgrammeOpen"
                  @select="isProgrammeOpen = false"
                />
              </div>

              <!-- Cities Filter (Checkboxes) -->
              <div class="pt-4 border-t border-white/50">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider">
                    Cities
                  </label>
                  <span class="text-[10px] text-gray-500 bg-white/60 px-2 py-0.5 rounded-md"
                    >Multiple</span
                  >
                </div>
                <div class="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  <label
                    v-for="city in availableCities"
                    :key="city"
                    class="flex items-center gap-3 cursor-pointer text-sm font-medium text-[#102a43]"
                  >
                    <input
                      type="checkbox"
                      :value="city"
                      v-model="selectedCities"
                      class="w-4 h-4 rounded border-gray-300 text-[#102a43] focus:ring-0 cursor-pointer"
                    />
                    <span class="text-xs">{{ city }}</span>
                  </label>
                </div>
              </div>

              <!-- Internship Fields Checkboxes (Optional) -->
              <div class="pt-4 border-t border-white/50">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider">
                    Internship Fields
                  </label>
                  <span class="text-[10px] text-gray-500 bg-white/60 px-2 py-0.5 rounded-md"
                    >Optional</span
                  >
                </div>
                <div class="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  <label
                    v-for="field in availableInternshipFields"
                    :key="field"
                    class="flex items-center gap-3 cursor-pointer text-sm font-medium text-[#102a43]"
                  >
                    <input
                      type="checkbox"
                      :value="field"
                      v-model="selectedFields"
                      class="w-4 h-4 rounded border-gray-300 text-[#102a43] focus:ring-0 cursor-pointer"
                    />
                    <span class="text-xs">{{ field }}</span>
                  </label>
                </div>
              </div>

              <!-- Language Checkboxes Filter -->
              <div class="pt-4 border-t border-white/50">
                <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider mb-3">
                  Language
                </label>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="languageEnglish"
                      class="w-4 h-4 rounded border-gray-300 text-[#102a43] focus:ring-0 cursor-pointer"
                    />
                    <span class="text-sm font-medium text-[#102a43]">English</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="languageDanish"
                      class="w-4 h-4 rounded border-gray-300 text-[#102a43] focus:ring-0 cursor-pointer"
                    />
                    <span class="text-sm font-medium text-[#102a43]">Danish</span>
                  </label>
                </div>
              </div>

              <div class="pt-4 border-t border-white/50">
                <button
                  @click="router.push('/')"
                  class="w-full text-center py-3 bg-white/60 hover:bg-white border border-white/80 rounded-2xl text-[#102a43] font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  &larr; New Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="min-w-0 space-y-6">
          <!-- Top bar with counter, search input, and Download PDF button -->
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#e4eff7]/80 backdrop-blur-md p-5 rounded-[28px] border border-white/60 shadow-sm"
          >
            <p class="text-lg font-semibold text-ink" role="status">
              {{ filteredCompanies.length }} companies found
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <!-- Search by name input -->
              <div class="relative w-full sm:w-64">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search company by name..."
                  class="w-full px-4 py-2.5 bg-white/70 border border-white rounded-2xl text-sm text-[#102a43] placeholder-[#627d98] focus:outline-none focus:ring-2 focus:ring-[#102a43]/30 shadow-sm"
                />
              </div>

              <!-- Download PDF Button -->
              <button
                @click="downloadPDF"
                class="w-full sm:w-auto px-4 py-2.5 bg-[#102a43] hover:bg-[#1a3a5f] text-white font-semibold text-sm rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Download PDF</span>
              </button>
            </div>
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
                  class="min-w-0 font-display text-[26px] xl:text-[30px] font-semibold text-ink leading-tight break-words"
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

          <!-- Pagination (1, 2, 3...) -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 pt-4">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-2xl bg-white/60 border border-white/80 text-sm font-semibold text-[#102a43] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors shadow-sm cursor-pointer"
            >
              Previous
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              class="w-10 h-10 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer"
              :class="
                currentPage === page
                  ? 'bg-[#102a43] text-white shadow-md'
                  : 'bg-white/60 border border-white/80 text-[#102a43] hover:bg-white'
              "
            >
              {{ page }}
            </button>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-2xl bg-white/60 border border-white/80 text-sm font-semibold text-[#102a43] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
