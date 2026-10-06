<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CustomSelect from '@/components/Home/CustomSelect.vue';
import companiesData from '@/data/companies.json';

const router = useRouter();
const companies = ref([]);

const selectedProgramme = ref('All programmes');
const isProgrammeOpen = ref(false);
const selectedFields = ref([]);
const languageEnglish = ref(false);
const languageDanish = ref(false);

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
  'Cyber Security'
];

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
};

const defaultFields = [
  'Customer Experience',
  'Event Management',
  'HR & People',
  'Operations & Logistics',
  'Project Management'
];

const availableInternshipFields = computed(() => {
  if (selectedProgramme.value === 'All programmes' || !selectedProgramme.value) {
    const all = new Set();
    Object.values(programFieldsMap).forEach(arr => arr.forEach(f => all.add(f)));
    return Array.from(all);
  }
  return programFieldsMap[selectedProgramme.value] || defaultFields;
});

onMounted(() => {
    // Завантажуємо стан компаній
    const saved = localStorage.getItem('companies_list');
    const rawData = saved ? JSON.parse(saved) : companiesData;

    companies.value = rawData.map(item => {
        let progs = [];
        if (item.sourceProgrammes) {
            progs = item.sourceProgrammes
                .split(/[,;]/)
                .map(s => s.trim())
                .filter(Boolean);
        }

        return {
            id: item.companyId,
            brandName: item.brandName || item['name (source / legal)'],
            city: item.city,
            sourceProgrammes: progs,
            websiteLanguages: item.websiteLanguages ? item.websiteLanguages.split(/[,;]/).map(l => l.trim().toLowerCase()).filter(Boolean) : []
        };
    });

    if (!saved) {
        localStorage.setItem('companies_list', JSON.stringify(rawData));
    }

    // Зчитуємо фільтри, передані з головної сторінки
    const savedFilters = localStorage.getItem('user_search_filters');
    if (savedFilters) {
        try {
            const parsed = JSON.parse(savedFilters);
            if (parsed.programme) selectedProgramme.value = parsed.programme;
            if (parsed.fields) selectedFields.value = parsed.fields;
            if (parsed.english !== undefined) languageEnglish.value = parsed.english;
            if (parsed.danish !== undefined) languageDanish.value = parsed.danish;
        } catch (e) {
            console.error("Error loading filters", e);
        }
    }
});

const programmeMapping = {
  'Multimedia Design': ['multimedia', 'multimediedesigner'],
  'Datamatiker / Computer Science': ['datamatiker', 'computer', 'it'],
  'Marketing Management': ['marketing', 'sales'],
  'Finansøkonom': ['finans', 'finance', 'economy'],
  'Finansbachelor': ['bachelor', 'finans'],
  'Service & Experience Management': ['service', 'experience', 'management'],
  'International Sales & Marketing': ['sales', 'marketing', 'international'],
  'Production Technology': ['production', 'technology'],
  'Bygningskonstruktør': ['bygning', 'construction', 'konstruktør'],
  'Cyber Security': ['security', 'cyber', 'it']
};

// М'яка фільтрація (чекбокси опціональні і не блокують результат)
const filteredCompanies = computed(() => {
    return companies.value.filter(company => {
        // 1. Програма
        let matchesProgramme = true;
        if (selectedProgramme.value && selectedProgramme.value !== 'All programmes') {
            const keywords = programmeMapping[selectedProgramme.value] || [selectedProgramme.value.toLowerCase()];
            matchesProgramme = company.sourceProgrammes.some(prog => {
                const pLower = prog.toLowerCase();
                return keywords.some(kw => pLower.includes(kw));
            });
        }
        
        // 2. Чекбокси напрямів (опціонально)
        let matchesFields = true;
        if (selectedFields.value.length > 0) {
            const hasFieldMatch = selectedFields.value.some(field => {
                return company.sourceProgrammes.some(p => p.toLowerCase().includes(field.toLowerCase())) ||
                       (company.brandName && company.brandName.toLowerCase().includes(field.toLowerCase()));
            });
            if (hasFieldMatch) {
                matchesFields = true;
            }
        }

        // 3. Мова
        let matchesLanguage = true;
        if (languageEnglish.value && !company.websiteLanguages.includes('en') && !company.websiteLanguages.includes('english')) {
            matchesLanguage = false;
        }
        if (languageDanish.value && !company.websiteLanguages.includes('dk') && !company.websiteLanguages.includes('danish')) {
            matchesLanguage = false;
        }

        return matchesProgramme && matchesFields && matchesLanguage;
    });
});

const openDetails = (id) => {
    router.push(`/company/${id}`);
};
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
          <div class="bg-[#e4eff7]/95 backdrop-blur-md rounded-[28px] border border-white/80 shadow-md">
            
            <div class="bg-[#102a43] text-white p-5 font-bold text-lg rounded-t-[28px]">
              Active Filters
            </div>

            <div class="p-6 space-y-6">
              
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

              <!-- Internship Fields Checkboxes (Optional) -->
              <div class="pt-4 border-t border-white/50">
                <div class="flex justify-between items-center mb-3">
                  <label class="block text-xs font-bold text-[#627d98] uppercase tracking-wider">
                    Internship Fields
                  </label>
                  <span class="text-[10px] text-gray-500 bg-white/60 px-2 py-0.5 rounded-md">Optional</span>
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
                    >
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
                    >
                    <span class="text-sm font-medium text-[#102a43]">English</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="languageDanish"
                      class="w-4 h-4 rounded border-gray-300 text-[#102a43] focus:ring-0 cursor-pointer"
                    >
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
          
          <h1 class="text-3xl font-extrabold text-[#102a43]">
            {{ filteredCompanies.length }} companies found
          </h1>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="company in filteredCompanies" 
              :key="company.id"
              class="bg-[#e4eff7]/80 backdrop-blur-md p-6 rounded-[28px] border border-white/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div class="mb-3">
                  <h2 class="text-xl font-bold text-[#102a43]">{{ company.brandName }}</h2>
                  <p class="text-sm text-[#627d98]">📍 {{ company.city }}</p>
                </div>
                
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

          <div v-if="filteredCompanies.length === 0" class="bg-white/50 backdrop-blur-md p-10 rounded-[28px] text-center text-[#102a43] font-semibold">
            No companies found matching your selected filters.
          </div>

        </div>

      </div>

    </div>
  </div>
</template>