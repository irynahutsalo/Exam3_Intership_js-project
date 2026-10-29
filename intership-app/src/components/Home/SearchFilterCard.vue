<template>
  <!-- Form panel with a solid background and red left border -->
  <div
    class="w-full max-w-[760px] mx-auto p-5 sm:p-8 lg:p-10 bg-paper text-ink border-l-4 border-brand-red rounded-md"
  >
    <!-- Step 1: Institution selection -->
    <div class="mb-6">
      <label class="block text-[16px] font-bold text-text-main mb-4">
        1. Where do you study? *
      </label>
      <CustomSelect
        v-model="selectedInstitution"
        placeholder="Select your educational institution"
        :options="institutions"
        :is-open="activeDropdown === 'institution'"
        @toggle="toggleDropdown('institution')"
        @select="handleInstitutionSelect"
      />
    </div>

    <!-- Step 2: Study programme selection (Visible after Step 1) -->
    <div v-if="selectedInstitution" class="mb-6 pt-6 border-t border-white/40">
      <label class="block text-[16px] font-bold text-text-main mb-4">
        2. What do you study? *
      </label>
      <CustomSelect
        v-model="selectedProgramme"
        placeholder="Select your study programme"
        :options="studyProgrammes"
        :is-open="activeDropdown === 'programme'"
        @toggle="toggleDropdown('programme')"
        @select="handleProgrammeSelect"
      />
    </div>

    <!-- Step 3: City selection (Compact scrollable container) -->
    <div v-if="selectedProgramme" class="mb-6 pt-6 border-t border-white/40">
      <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 mb-2">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <label class="block text-[16px] font-bold text-text-main"> 3. Select cities </label>
          <span
            class="px-2.5 py-0.5 bg-white/60 text-[12px] rounded-full font-medium"
            style="color: var(--color-text-muted)"
          >
            Optional
          </span>
        </div>
        <button
          @click="toggleSelectAllCities"
          type="button"
          class="min-h-11 shrink-0 px-1 text-[14px] text-brand-red hover:underline underline-offset-4 font-medium cursor-pointer transition-colors"
        >
          {{ isAllCitiesSelected ? 'Deselect all' : 'Select all' }}
        </button>
      </div>
      <p class="text-[13px] text-text-muted mb-4" style="color: var(--color-text-muted)">
        Select one or more.
      </p>

      <!-- Scrollable container with reduced max-height -->
      <div class="max-h-[160px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <label
            v-for="city in cities"
            :key="city"
            class="flex min-h-11 min-w-0 items-center gap-3 py-2 cursor-pointer text-[15px] text-ink font-medium select-none"
          >
            <input
              type="checkbox"
              :value="city"
              v-model="selectedCities"
              class="w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            />
            <span class="min-w-0 break-words leading-5">{{ city }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Step 4: Internship fields dynamically filtered by study programme (Optional) -->
    <div v-if="selectedProgramme" class="mb-6 pt-6 border-t border-white/40">
      <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 mb-2">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <label class="block text-[16px] font-bold text-text-main">
            4. What kind of internship are you looking for?
          </label>
          <span
            class="px-2.5 py-0.5 bg-white/60 text-text-muted text-[12px] rounded-full font-medium"
            style="color: var(--color-text-muted)"
          >
            Optional
          </span>
        </div>
        <button
          @click="toggleSelectAllFields"
          type="button"
          class="min-h-11 shrink-0 px-1 text-[14px] text-brand-red hover:underline underline-offset-4 font-medium cursor-pointer transition-colors"
        >
          {{ isAllFieldsSelected ? 'Deselect all' : 'Select all' }}
        </button>
      </div>
      <p class="text-[13px] text-text-muted mb-4" style="color: var(--color-text-muted)">
        Select one or more.
      </p>

      <!-- Dynamic Checkboxes Grid -->
      <div class="grid grid-cols-2 gap-x-8 gap-y-3">
        <label
          v-for="field in availableInternshipFields"
          :key="field"
          class="flex min-h-11 min-w-0 items-center gap-3 py-2 cursor-pointer text-[15px] text-ink font-medium select-none"
        >
          <input
            type="checkbox"
            :value="field"
            v-model="selectedFields"
            class="w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          />
          <span class="min-w-0 break-words leading-5">{{ field }}</span>
        </label>
      </div>
    </div>

    <!-- Step 5: Preferred language (Optional) -->
    <div v-if="selectedProgramme" class="mb-6 pt-6 border-t border-white/40">
      <div class="flex items-center space-x-2 mb-4">
        <label class="block text-[16px] font-bold text-text-main"> 5. Preferred language </label>
        <span
          class="px-2.5 py-0.5 bg-white/60 text-[12px] rounded-full font-medium"
          style="color: var(--color-text-muted)"
        >
          Optional
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label
          v-for="lang in languages"
          :key="lang"
          class="flex min-h-11 min-w-0 items-center gap-3 py-2 cursor-pointer text-[15px] text-ink font-medium select-none"
        >
          <input
            type="checkbox"
            :value="lang"
            v-model="selectedLanguages"
            class="w-4 h-4 shrink-0 accent-brand-red cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          />
          <span>{{ lang }}</span>
        </label>
      </div>
    </div>

    <!-- Search button -->
    <button
      @click="handleSubmit"
      type="button"
      :disabled="!isFormValid"
      class="w-full min-h-[52px] mt-4 px-6 py-3 rounded-md text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
      :class="
        isFormValid
          ? 'bg-brand-red text-white hover:bg-brand-red-hover cursor-pointer'
          : 'bg-ink/10 text-ink/45 cursor-not-allowed'
      "
    >
      Find companies
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CustomSelect from './CustomSelect.vue'
import companiesData from '@/data/companies.json'
import { getAvailableFields } from '@/utils/internshipFields'

const router = useRouter()
const activeDropdown = ref(null)

const selectedInstitution = ref('')
const selectedProgramme = ref('')
const selectedCities = ref([])
const selectedFields = ref([])
const selectedLanguages = ref([])

const institutions = ref(['SEA - Syddansk Erhvervsakademi'])

const studyProgrammes = ref([
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
])

// Dynamically collect unique cities from JSON file
const cities = computed(() => {
  const citySet = new Set()
  companiesData.forEach((item) => {
    if (item.city) {
      const trimmed = item.city.trim()
      if (trimmed) citySet.add(trimmed)
    }
  })
  return Array.from(citySet).sort()
})

// Toggle select all / deselect all for cities
const isAllCitiesSelected = computed(() => {
  return cities.value.length > 0 && selectedCities.value.length === cities.value.length
})

const toggleSelectAllCities = () => {
  if (isAllCitiesSelected.value) {
    selectedCities.value = []
  } else {
    selectedCities.value = [...cities.value]
  }
}

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

const languages = ref(['English', 'Danish'])

// Build the field list from companies in the selected programme.
const availableInternshipFields = computed(() => {
  if (!selectedProgramme.value) return []

  return getAvailableFields(companiesData, selectedProgramme.value)
})

const isAllFieldsSelected = computed(() => {
  return (
    availableInternshipFields.value.length > 0 &&
    selectedFields.value.length === availableInternshipFields.value.length
  )
})

const toggleSelectAllFields = () => {
  if (isAllFieldsSelected.value) {
    selectedFields.value = []
  } else {
    selectedFields.value = [...availableInternshipFields.value]
  }
}

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const handleInstitutionSelect = () => {
  activeDropdown.value = null
  selectedProgramme.value = ''
  selectedCities.value = []
  selectedFields.value = []
}

const handleProgrammeSelect = () => {
  activeDropdown.value = null
  selectedCities.value = []
  selectedFields.value = []
}

const isFormValid = computed(() => {
  return Boolean(selectedInstitution.value && selectedProgramme.value)
})

const handleSubmit = () => {
  if (!isFormValid.value) return

  const filterState = {
    institution: selectedInstitution.value,
    programme: selectedProgramme.value,
    cities: selectedCities.value,
    fields: selectedFields.value,
    languages: selectedLanguages.value,
  }
  localStorage.setItem('user_search_filters', JSON.stringify(filterState))

  router.push('/companies')
}
</script>

<style scoped>
/* Custom smooth scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(16, 42, 67, 0.2);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 42, 67, 0.4);
}
</style>
