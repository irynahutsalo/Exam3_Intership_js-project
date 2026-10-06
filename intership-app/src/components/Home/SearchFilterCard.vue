<template>
  <div class="w-[768px] mx-auto p-10 bg-white/40 border border-white/60 rounded-[28px] backdrop-blur-md shadow-sm transition-all duration-300">
    
    <!-- Step 1: Institution selection -->
    <div class="mb-6">
      <label class="block text-[16px] font-bold text-text-main mb-4">
        1. Where do you study?
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
        2. What do you study?
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

    <!-- Step 3: Internship fields dynamically filtered by study programme (Optional) -->
    <div v-if="selectedProgramme" class="mb-6 pt-6 border-t border-white/40">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <label class="block text-[16px] font-bold text-text-main">
            3. What kind of internship are you looking for?
          </label>
          <span class="px-2.5 py-0.5 bg-white/60 text-text-muted text-[12px] rounded-full font-medium" style="color: var(--color-text-muted);">
            Optional
          </span>
        </div>
        <button 
          @click="toggleSelectAllFields" 
          type="button" 
          class="text-[14px] text-text-main/70 hover:text-text-main font-medium cursor-pointer transition-colors"
        >
          {{ isAllFieldsSelected ? 'Deselect all' : 'Select all' }}
        </button>
      </div>
      <p class="text-[13px] text-text-muted mb-4" style="color: var(--color-text-muted);">
        Select one or more.
      </p>

      <!-- Dynamic Checkboxes Grid -->
      <div class="grid grid-cols-2 gap-x-8 gap-y-3">
        <label 
          v-for="field in availableInternshipFields" 
          :key="field" 
          class="flex items-center space-x-3 cursor-pointer text-[15px] text-text-main font-medium select-none"
        >
          <input 
            type="checkbox" 
            :value="field" 
            v-model="selectedFields"
            class="w-4 h-4 rounded border-white/80 text-navy-dark focus:ring-0 cursor-pointer"
          />
          <span>{{ field }}</span>
        </label>
      </div>
    </div>

    <!-- Step 4: Preferred language (Optional) -->
    <div v-if="selectedProgramme" class="mb-6 pt-6 border-t border-white/40">
      <div class="flex items-center space-x-2 mb-4">
        <label class="block text-[16px] font-bold text-text-main">
          4. Preferred language
        </label>
        <span class="px-2.5 py-0.5 bg-white/60 text-text-muted text-[12px] rounded-full font-medium" style="color: var(--color-text-muted);">
          Optional
        </span>
      </div>

      <div class="flex items-center space-x-8">
        <label 
          v-for="lang in languages" 
          :key="lang" 
          class="flex items-center space-x-3 cursor-pointer text-[15px] text-text-main font-medium select-none"
        >
          <input 
            type="checkbox" 
            :value="lang" 
            v-model="selectedLanguages"
            class="w-4 h-4 rounded border-white/80 text-navy-dark focus:ring-0 cursor-pointer"
          />
          <span>{{ lang }}</span>
        </label>
      </div>
    </div>

    <!-- Submit Button (Темна за замовчуванням, ховер акцентний / світліший) -->
    <button 
      @click="handleSubmit"
      type="button" 
      class="w-full h-[52px] mt-4 rounded-2xl font-semibold text-[15px] transition-all duration-300 shadow-sm"
      :class="isFormValid 
        ? 'bg-navy-dark text-white hover:bg-[#1f3f5b] cursor-pointer shadow-md' 
        : 'bg-navy-dark/40 text-white/50 cursor-not-allowed'"
      :disabled="!isFormValid"
    >
      Find companies
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CustomSelect from './CustomSelect.vue'

const router = useRouter()
const activeDropdown = ref(null)

const selectedInstitution = ref('')
const selectedProgramme = ref('')
const selectedFields = ref([])
const selectedLanguages = ref([])

const institutions = ref([
  'SEA - Syddansk Erhvervsakademi'
])

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
  'Cyber Security'
])

const programFieldsMap = {
  'Multimedia Design': [
    'UX/UI Design',
    'Frontend Development',
    'Graphic Design',
    'Content Creation',
    'Social Media',
    'Web Content / CMS',
    'Digital Marketing'
  ],
  'Datamatiker / Computer Science': [
    'Frontend Development',
    'Backend Development',
    'Full-stack Development',
    'Cyber Security',
    'Database Management'
  ],
  'Marketing Management': [
    'Digital Marketing',
    'Social Media Management',
    'Market Research',
    'Customer Experience',
    'Sales'
  ],
  'Service & Experience Management': [
    'Customer Experience',
    'Event Management',
    'HR & People',
    'Operations & Logistics',
    'Project Management'
  ]
}

const defaultFields = [
  'Customer Experience',
  'Event Management',
  'HR & People',
  'Operations & Logistics',
  'Project Management'
]

const languages = ref(['English', 'Danish'])

const availableInternshipFields = computed(() => {
  if (!selectedProgramme.value) return []
  return programFieldsMap[selectedProgramme.value] || defaultFields
})

const isAllFieldsSelected = computed(() => {
  return availableInternshipFields.value.length > 0 && 
         selectedFields.value.length === availableInternshipFields.value.length
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
  selectedFields.value = []
}

const handleProgrammeSelect = () => {
  activeDropdown.value = null
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
    fields: selectedFields.value,
    languages: selectedLanguages.value
  }
  localStorage.setItem('user_search_filters', JSON.stringify(filterState))

  router.push('/companies')
}
</script>