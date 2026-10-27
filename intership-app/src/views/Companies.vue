<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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
const itemsPerPage = 8

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
  <div class="min-h-screen bg-[#a8c4d8] p-10">
    <div class="max-w-7xl mx-auto">
      <div class="text-sm text-[#627d98] mb-4 font-medium">
        Home / <span class="text-[#102a43] font-semibold">Companies</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <!-- Left Sidebar: Active Filters -->
        <div class="lg:col-span-1">
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
        <div class="lg:col-span-3 space-y-6">
          <!-- Top bar with counter, search input, and Download PDF button -->
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#e4eff7]/80 backdrop-blur-md p-5 rounded-[28px] border border-white/60 shadow-sm"
          >
            <h1 class="text-2xl font-extrabold text-[#102a43]">
              {{ filteredCompanies.length }} companies found
            </h1>

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

          <!-- Companies Grid (8 items per page) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="company in paginatedCompanies"
              :key="company.id"
              class="bg-[#e4eff7]/80 backdrop-blur-md p-6 rounded-[28px] border border-white/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div class="mb-3">
                  <h2 class="text-xl font-bold text-[#102a43]">{{ company.brandName }}</h2>
                  <p class="text-sm text-[#627d98]">📍 {{ company.city }}</p>
                </div>

                <!-- Full Unclipped Company Description -->
                <p v-if="company.description" class="text-xs text-[#627d98] mb-4">
                  {{ company.description }}
                </p>

                <div class="flex flex-wrap gap-2 mb-6">
                  <span
                    v-for="(prog, idx) in company.sourceProgrammes"
                    :key="idx"
                    class="bg-[#fadadd]/80 text-[#9b2c2c] text-xs px-3 py-1.5 rounded-xl font-medium"
                  >
                    {{ prog }}
                  </span>
                </div>
              </div>

              <div>
                <div class="flex gap-2 mb-4">
                  <span
                    v-for="lang in company.websiteLanguages"
                    :key="lang"
                    class="bg-white/70 text-[#102a43] text-xs px-2.5 py-1 rounded-lg font-bold uppercase"
                  >
                    {{ lang }}
                  </span>
                </div>

                <div class="pt-4 border-t border-white/50 flex justify-between items-center">
                  <button
                    @click="openDetails(company.id)"
                    class="text-[#102a43] hover:text-[#78aacd] font-semibold text-sm flex items-center gap-1 cursor-pointer"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            </div>
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
