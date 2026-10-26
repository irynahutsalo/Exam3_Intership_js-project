<template>
  <div class="min-h-screen bg-[#a8c4d8] flex relative">
    
    <!-- Left Sidebar Navigation -->
    <aside class="w-64 bg-[#102a43] text-white flex flex-col justify-between p-6 shrink-0">
      <div>
        <div class="flex items-center gap-3 mb-10">
          <div class="w-9 h-9 bg-[#e53e3e] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow">
            SE
          </div>
          <span class="font-bold text-lg tracking-wide">SEA <span class="text-[#f6ad55]">Admin</span></span>
        </div>

        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Management</div>
        <nav class="space-y-1">
          <button type="button" class="w-full flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-medium text-sm text-white">
            <span>🏢</span> Companies
          </button>
        </nav>

        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-8 mb-3">Site</div>
        <nav class="space-y-1">
          <router-link to="/" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-sm text-gray-300 transition-colors">
            <span>🌐</span> View Site
          </router-link>
        </nav>
      </div>

      <div class="pt-6 border-t border-white/10">
        <button type="button" @click="logout" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-300 rounded-xl font-medium text-sm transition-colors cursor-pointer">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-10 overflow-y-auto">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Page Title and Create Button -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-extrabold text-[#102a43]">Companies</h1>
            <p class="text-sm text-[#627d98] font-medium">Manage all partner company listings</p>
          </div>
          <button 
            type="button"
            @click="openCreateModal"
            class="bg-[#e53e3e] hover:bg-[#d33030] text-white font-semibold px-5 py-3 rounded-2xl shadow-md transition-colors cursor-pointer text-sm flex items-center gap-2"
          >
            <span>+</span> Create New Company
          </button>
        </div>

        <!-- Statistics Cards Container -->
        <div style="display: flex; gap: 24px; width: 100%;">
          <div style="width: calc(33.333% - 16px);" class="bg-[#e4eff7]/90 backdrop-blur-md p-6 rounded-[24px] border border-white/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-[#627d98] uppercase tracking-wider">Total Companies</p>
              <h3 class="text-3xl font-extrabold text-[#102a43] mt-1">{{ companies.length }}</h3>
            </div>
            <div class="w-12 h-12 bg-white/70 rounded-2xl flex items-center justify-center text-xl shadow-sm">🏢</div>
          </div>

          <div style="width: calc(33.333% - 16px);" class="bg-[#e4eff7]/90 backdrop-blur-md p-6 rounded-[24px] border border-white/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-[#627d98] uppercase tracking-wider">Active Listings</p>
              <h3 class="text-3xl font-extrabold text-green-700 mt-1">{{ activeCount }}</h3>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">✅</div>
          </div>

          <div style="width: calc(33.333% - 16px);" class="bg-[#e4eff7]/90 backdrop-blur-md p-6 rounded-[24px] border border-white/80 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-[#627d98] uppercase tracking-wider">Inactive Listings</p>
              <h3 class="text-3xl font-extrabold text-gray-500 mt-1">{{ inactiveCount }}</h3>
            </div>
            <div class="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center text-xl shadow-sm">⏸️</div>
          </div>
        </div>

        <!-- Search Bar and Status Filters -->
        <div class="bg-[#e4eff7]/90 backdrop-blur-md p-3 rounded-[28px] border border-white/80 shadow-sm flex items-center gap-3 w-full">
          <div class="flex-1 w-full flex items-center bg-white/70 border border-white/60 rounded-2xl px-4 h-12">
            <span class="text-gray-400 mr-3 text-base select-none">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search by name or city..."
              class="w-full bg-transparent text-sm text-[#102a43] font-medium focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              @click="statusFilter = 'all'"
              class="px-6 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer"
              :class="statusFilter === 'all' ? 'bg-[#102a43] text-white shadow' : 'bg-white/70 text-[#102a43] hover:bg-white'"
            >
              All
            </button>
            <button 
              type="button"
              @click="statusFilter = 'active'"
              class="px-6 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer"
              :class="statusFilter === 'active' ? 'bg-[#102a43] text-white shadow' : 'bg-white/70 text-[#102a43] hover:bg-white'"
            >
              Active
            </button>
            <button 
              type="button"
              @click="statusFilter = 'inactive'"
              class="px-6 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer"
              :class="statusFilter === 'inactive' ? 'bg-[#102a43] text-white shadow' : 'bg-white/70 text-[#102a43] hover:bg-white'"
            >
              Inactive
            </button>
          </div>
        </div>

        <!-- Companies Data Table -->
        <div class="bg-[#e4eff7]/90 backdrop-blur-md rounded-[28px] border border-white/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/60 text-[11px] font-bold text-[#627d98] uppercase tracking-wider">
                  <th class="p-5">Company</th>
                  <th class="p-5">City</th>
                  <th class="p-5">Internship Fields</th>
                  <th class="p-5">Languages</th>
                  <th class="p-5">Status</th>
                  <th class="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/40 text-sm text-[#102a43]">
                
                <tr v-for="company in filteredCompanies" :key="company.companyId" class="hover:bg-white/35 transition-colors">
                  <td class="p-5">
                    <div class="font-bold text-[#102a43]">{{ company.brandName || company['name (source / legal)'] }}</div>
                    <!-- Display short description snippet inside table -->
                    <div v-if="company.description" class="text-xs text-[#627d98] mt-1 line-clamp-1 max-w-xs">
                      {{ company.description }}
                    </div>
                  </td>
                  <td class="p-5 text-[#627d98] font-medium">{{ company.city }}</td>
                  
                  <!-- Programmes badges -->
                  <td class="p-5">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <div 
                        v-for="(prog, idx) in getProgrammesList(company).slice(0, 2)" 
                        :key="idx"
                        style="background-color: #fadadd; color: #9b2c2c; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 8px;"
                      >
                        {{ prog }}
                      </div>
                    </div>
                  </td>
                  
                  <!-- Languages badges -->
                  <td class="p-5">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                      <div 
                        v-for="lang in getLanguagesList(company)" 
                        :key="lang"
                        style="background-color: #f3f4d3; color: #5f6629; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 8px; border: 1px solid #d4dc9c; display: inline-block;"
                      >
                        {{ formatLangCode(lang) }}
                      </div>
                    </div>
                  </td>
                  
                  <!-- Status badge -->
                  <td class="p-5">
                    <div 
                      style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 500; border: 1px solid;"
                      :style="company.status === 'inactive' ? 'background-color: #f3f4f6; color: #4b5563; border-color: #d1d5db;' : 'background-color: #d8eedf; color: #2d7d46; border-color: #aee4bc;'"
                    >
                      <div style="width: 8px; height: 8px; border-radius: 50%;" :style="company.status === 'inactive' ? 'background-color: #6b7280;' : 'background-color: #2d7d46;'"></div>
                      {{ company.status === 'inactive' ? 'Inactive' : 'Active' }}
                    </div>
                  </td>
                  
                  <!-- Action buttons -->
                  <td class="p-5 text-right whitespace-nowrap">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                      <button 
                        type="button"
                        @click="editCompany(company)"
                        style="display: inline-flex; align-items: center; gap: 6px; background-color: #ffffff; color: #102a43; font-weight: 600; font-size: 12px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #cbd5e1; cursor: pointer;"
                      >
                        <span>✏️</span> Edit
                      </button>
                      <button 
                        type="button"
                        @click="deleteCompany(company.companyId)"
                        style="display: inline-flex; align-items: center; gap: 6px; background-color: #fce8e6; color: #b91c1c; font-weight: 600; font-size: 12px; padding: 6px 14px; border-radius: 9999px; border: 1px solid #f8b4b4; cursor: pointer;"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredCompanies.length === 0">
                  <td colspan="6" class="p-10 text-center text-[#627d98] font-semibold">
                    No companies found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- MODAL WINDOW (FULLSCREEN FIXED) -->
    <div v-if="isModalOpen" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 16px;">
      <div style="background-color: #e4eff7; border: 1px solid #ffffff; border-radius: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.6); padding-bottom: 12px;">
          <h2 style="font-size: 20px; font-weight: 800; color: #102a43; margin: 0;">
            {{ isEditing ? 'Edit Company' : 'Create New Company' }}
          </h2>
          <button type="button" @click="closeModal" style="background: none; border: none; font-size: 18px; font-weight: bold; cursor: pointer; color: #486581;">✕</button>
        </div>

        <form @submit.prevent="saveCompany" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">Company / Brand Name</label>
            <input 
              type="text" 
              v-model="form.brandName" 
              required
              placeholder="e.g. 2care4"
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">City</label>
            <input 
              type="text" 
              v-model="form.city" 
              required
              placeholder="e.g. Esbjerg"
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500;"
            />
          </div>

          <!-- Description Field -->
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">Description</label>
            <textarea 
              v-model="form.description" 
              rows="3"
              placeholder="Enter company description..."
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500; resize: vertical;"
            ></textarea>
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">Internship Fields (comma separated)</label>
            <input 
              type="text" 
              v-model="form.sourceProgrammes" 
              placeholder="e.g. datamatiker, multimediedesigner"
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">Languages (e.g. DK, EN)</label>
            <input 
              type="text" 
              v-model="form.websiteLanguages" 
              placeholder="e.g. DK, EN"
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #627d98; text-transform: uppercase; margin-bottom: 4px;">Status</label>
            <select 
              v-model="form.status"
              style="width: 100%; background-color: rgba(255,255,255,0.9); border: 1px solid #ffffff; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #102a43; outline: none; font-weight: 500; cursor: pointer;"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.6); padding-top: 12px;">
            <button 
              type="button" 
              @click="closeModal"
              style="padding: 10px 16px; border-radius: 10px; background-color: #e2e8f0; color: #334155; font-weight: 600; font-size: 13px; border: none; cursor: pointer;"
            >
              Cancel
            </button>
            <button 
              type="submit"
              style="padding: 10px 16px; border-radius: 10px; background-color: #102a43; color: white; font-weight: 600; font-size: 13px; border: none; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import initialCompaniesData from '@/data/companies.json'

const router = useRouter()

const companies = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const form = ref({
  companyId: null,
  brandName: '',
  city: '',
  description: '',
  sourceProgrammes: '',
  websiteLanguages: '',
  status: 'active'
})

onMounted(() => {
  const saved = localStorage.getItem('companies_list')
  if (saved) {
    companies.value = JSON.parse(saved)
  } else {
    companies.value = initialCompaniesData.map(item => ({
      ...item,
      description: item.description || item['description'] || '',
      status: item.status || 'active'
    }))
    localStorage.setItem('companies_list', JSON.stringify(companies.value))
  }
})

const activeCount = computed(() => companies.value.filter(c => c.status !== 'inactive').length)
const inactiveCount = computed(() => companies.value.filter(c => c.status === 'inactive').length)

const getProgrammesList = (company) => {
  if (!company.sourceProgrammes) return []
  return company.sourceProgrammes.split(/[,;]/).map(s => s.trim()).filter(Boolean)
}

const getLanguagesList = (company) => {
  if (!company.websiteLanguages) return []
  return company.websiteLanguages.split(/[,;]/).map(l => l.trim()).filter(Boolean)
}

const formatLangCode = (code) => {
  const clean = code.trim().toLowerCase()
  if (clean === 'danish' || clean === 'da' || clean === 'dk') return 'DK'
  if (clean === 'english' || clean === 'eng' || clean === 'en') return 'EN'
  if (clean === 'german' || clean === 'de') return 'DE'
  return code.slice(0, 2).toUpperCase()
}

const filteredCompanies = computed(() => {
  return companies.value.filter(company => {
    const name = (company.brandName || company['name (source / legal)'] || '').toLowerCase()
    const city = (company.city || '').toLowerCase()
    const query = searchQuery.value.toLowerCase()

    const matchesSearch = name.includes(query) || city.includes(query)

    let matchesStatus = true
    if (statusFilter.value === 'active') {
      matchesStatus = company.status !== 'inactive'
    } else if (statusFilter.value === 'inactive') {
      matchesStatus = company.status === 'inactive'
    }

    return matchesSearch && matchesStatus
  })
})

const deleteCompany = (id) => {
  if (confirm('Are you sure you want to delete this company?')) {
    companies.value = companies.value.filter(c => c.companyId !== id)
    localStorage.setItem('companies_list', JSON.stringify(companies.value))
  }
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    companyId: Date.now(),
    brandName: '',
    city: '',
    description: '',
    sourceProgrammes: '',
    websiteLanguages: 'DK, EN',
    status: 'active'
  }
  isModalOpen.value = true
}

const editCompany = (company) => {
  isEditing.value = true
  form.value = {
    companyId: company.companyId,
    brandName: company.brandName || company['name (source / legal)'] || '',
    city: company.city || '',
    description: company.description || company['description'] || '',
    sourceProgrammes: company.sourceProgrammes || '',
    websiteLanguages: company.websiteLanguages || '',
    status: company.status || 'active'
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveCompany = () => {
  if (isEditing.value) {
    const index = companies.value.findIndex(c => c.companyId === form.value.companyId)
    if (index !== -1) {
      companies.value[index] = {
        ...companies.value[index],
        brandName: form.value.brandName,
        city: form.value.city,
        description: form.value.description,
        sourceProgrammes: form.value.sourceProgrammes,
        websiteLanguages: form.value.websiteLanguages,
        status: form.value.status
      }
    }
  } else {
    companies.value.unshift({
      companyId: form.value.companyId,
      brandName: form.value.brandName,
      city: form.value.city,
      description: form.value.description,
      sourceProgrammes: form.value.sourceProgrammes,
      websiteLanguages: form.value.websiteLanguages,
      status: form.value.status
    })
  }

  localStorage.setItem('companies_list', JSON.stringify(companies.value))
  closeModal()
}

const logout = () => {
  localStorage.removeItem('is_admin_logged')
  router.push('/admin')
}
</script>