<template>
  <!-- Protected administration workspace for searching, reviewing, creating,
       editing, activating, and deleting company records. -->
  <div class="min-h-screen bg-sky text-ink">
    <main class="px-4 sm:px-6 py-8">
      <div class="max-w-[var(--width-content)] mx-auto">
        <!-- Navigation returns to the public directory or ends the admin session. -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
          <router-link
            to="/companies"
            class="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-red hover:underline underline-offset-4"
          >
            <span aria-hidden="true">←</span>
            View companies
          </router-link>

          <button
            type="button"
            @click="logout"
            class="min-h-11 px-4 border border-ink/20 rounded-md text-sm font-semibold hover:bg-paper/60 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

        <!-- Dashboard heading and primary action for creating a new record. -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <p class="text-sm font-medium text-ink/60 mb-3">Admin workspace</p>

            <h1
              class="font-display text-[42px] sm:text-[56px] font-semibold leading-[1.1] tracking-tight"
            >
              Company
              <span class="text-brand-red italic">database.</span>
            </h1>

            <p class="mt-4 text-base text-ink/75">Manage company information and listing status.</p>
          </div>

          <button
            type="button"
            @click="openCreateModal"
            class="inline-flex min-h-[48px] items-center justify-center gap-2 shrink-0 px-5 py-3 bg-brand-red text-white font-semibold rounded-md hover:bg-brand-red-hover transition-colors cursor-pointer"
          >
            <span aria-hidden="true">+</span>
            Add company
          </button>
        </div>

        <!-- Reactive summary cards show the current total and status distribution. -->
        <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-paper border border-ink/10 rounded-md p-5">
            <dt class="text-sm text-ink/65">Total companies</dt>
            <dd class="mt-2 text-[32px] font-semibold">
              {{ companies.length }}
            </dd>
          </div>

          <div class="bg-paper border border-ink/10 rounded-md p-5">
            <dt class="text-sm text-ink/65">Active listings</dt>
            <dd class="mt-2 text-[32px] font-semibold text-green-800">
              {{ activeCount }}
            </dd>
          </div>

          <div class="bg-paper border border-ink/10 rounded-md p-5">
            <dt class="text-sm text-ink/65">Inactive listings</dt>
            <dd class="mt-2 text-[32px] font-semibold text-ink/55">
              {{ inactiveCount }}
            </dd>
          </div>
        </dl>

        <!-- Search and status controls narrow the table without changing stored data. -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div class="w-full lg:max-w-[440px]">
            <label for="admin-company-search" class="sr-only">
              Search by company name or city
            </label>

            <input
              id="admin-company-search"
              v-model="searchQuery"
              type="search"
              placeholder="Search by name or city..."
              class="w-full h-[52px] px-4 bg-paper border border-ink/20 rounded-md text-base focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
            />
          </div>

          <div class="flex flex-wrap gap-2" aria-label="Listing status">
            <button
              v-for="option in [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]"
              :key="option.value"
              type="button"
              @click="statusFilter = option.value"
              :aria-pressed="statusFilter === option.value"
              class="min-h-11 px-5 py-2 border rounded-md text-sm font-semibold transition-colors cursor-pointer"
              :class="
                statusFilter === option.value
                  ? 'bg-ink border-ink text-white'
                  : 'bg-paper border-ink/15 text-ink hover:border-ink/40'
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <p role="status" class="text-sm text-ink/65 mb-3">
          {{ filteredCompanies.length }}
          {{ filteredCompanies.length === 1 ? 'company found' : 'companies found' }}
        </p>

        <!-- Responsive management table presents normalized company data and actions. -->
        <div class="bg-paper border border-ink/15 rounded-md overflow-hidden">
          <div
            class="overflow-x-auto"
            tabindex="0"
            role="region"
            aria-label="Company database table"
          >
            <table class="w-full min-w-[960px] text-left border-collapse">
              <caption class="sr-only">
                Companies with study programmes, website languages and management actions
              </caption>

              <thead class="bg-ink/5">
                <tr class="border-b border-ink/15 text-sm text-ink/65">
                  <th scope="col" class="px-5 py-4 font-semibold">Company</th>
                  <th scope="col" class="px-5 py-4 font-semibold">City</th>
                  <th scope="col" class="px-5 py-4 font-semibold">Study programme</th>
                  <th scope="col" class="px-5 py-4 font-semibold">Website language</th>
                  <th scope="col" class="px-5 py-4 font-semibold">Status</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-ink/10 text-sm">
                <tr
                  v-for="company in filteredCompanies"
                  :key="company.companyId"
                  class="hover:bg-white/50 transition-colors"
                >
                  <th scope="row" class="px-5 py-4 text-left font-normal">
                    <div class="font-semibold text-[15px]">
                      {{ company.brandName || company['name (source / legal)'] }}
                    </div>

                    <p
                      v-if="company.description"
                      class="mt-1 max-w-[260px] line-clamp-2 text-xs leading-relaxed text-ink/60"
                    >
                      {{ company.description }}
                    </p>
                  </th>

                  <td class="px-5 py-4 text-ink/70">
                    {{ company.city || 'Not provided' }}
                  </td>

                  <td class="px-5 py-4">
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="programme in getProgrammesList(company)"
                        :key="programme"
                        class="bg-sky/30 px-2 py-1 rounded text-xs"
                      >
                        {{
                          programme.toLowerCase() === 'datamatiker'
                            ? 'Datamatiker / Computer Science'
                            : programme.toLowerCase() === 'multimediedesigner'
                              ? 'Multimedia Design'
                              : programme
                        }}
                      </span>

                      <span v-if="!getProgrammesList(company).length" class="text-ink/50">
                        Not provided
                      </span>
                    </div>
                  </td>

                  <td class="px-5 py-4 text-ink/70">
                    {{ getLanguagesList(company).join(', ') || 'Not provided' }}
                  </td>

                  <td class="px-5 py-4">
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                      :class="
                        company.status === 'inactive'
                          ? 'bg-ink/5 text-ink/60'
                          : 'bg-green-100 text-green-800'
                      "
                    >
                      <span aria-hidden="true" class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{ company.status === 'inactive' ? 'Inactive' : 'Active' }}
                    </span>
                  </td>

                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        @click="editCompany(company)"
                        :aria-label="`Edit ${company.brandName || company['name (source / legal)']}`"
                        class="min-h-11 px-3 border border-ink/20 rounded-md font-semibold hover:bg-white cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        @click="deleteCompany(company.companyId)"
                        :aria-label="`Delete ${company.brandName || company['name (source / legal)']}`"
                        class="min-h-11 px-3 rounded-md text-brand-red hover:bg-brand-red/5 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredCompanies.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <p class="font-semibold mb-2">No companies found</p>
                    <p class="text-ink/60">Try another name, city or status.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal editor keeps create and edit workflows in one reusable form. -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/50 p-4"
      @keydown.esc.stop="closeModal"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-editor-title"
        class="w-full max-w-[760px] max-h-[90vh] overflow-y-auto bg-paper text-ink rounded-md border border-ink/15 shadow-xl"
      >
        <div class="flex items-center justify-between gap-4 border-b border-ink/15 px-6 py-5">
          <div>
            <p class="text-sm text-ink/60 mb-1">Company database</p>
            <h2 id="company-editor-title" class="text-2xl font-semibold">
              {{ isEditing ? 'Edit company' : 'Add company' }}
            </h2>
          </div>

          <button
            type="button"
            @click="closeModal"
            aria-label="Close company editor"
            class="min-w-11 min-h-11 rounded-md text-2xl hover:bg-ink/5 cursor-pointer"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <form @submit.prevent="saveCompany" class="p-6">
          <p class="text-sm text-ink/60 mb-6">Fields marked * are required.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div v-for="field in formFields" :key="field.key">
              <label :for="`company-${field.key}`" class="block text-sm font-semibold mb-2">
                {{ field.label }}
                <span v-if="field.required" class="text-brand-red">*</span>
              </label>

              <input
                :id="`company-${field.key}`"
                v-model="form[field.key]"
                :type="field.type"
                :required="field.required"
                :aria-describedby="field.hint ? `hint-${field.key}` : undefined"
                class="w-full min-h-[48px] px-3 py-2 bg-white/75 border border-ink/20 rounded-md text-base focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
              />

              <p
                v-if="field.hint"
                :id="`hint-${field.key}`"
                class="mt-2 text-xs leading-relaxed text-ink/60"
              >
                {{ field.hint }}
              </p>
            </div>
          </div>

          <div class="mt-6">
            <label for="company-description" class="block text-sm font-semibold mb-2">
              Description
            </label>

            <textarea
              id="company-description"
              v-model="form.description"
              rows="5"
              class="w-full px-3 py-3 bg-white/75 border border-ink/20 rounded-md text-base resize-y focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15"
            ></textarea>
          </div>

          <div class="mt-5">
            <label for="company-status" class="block text-sm font-semibold mb-2">
              Listing status
            </label>

            <select
              id="company-status"
              v-model="form.status"
              class="w-full sm:max-w-[240px] min-h-[48px] px-3 bg-white/75 border border-ink/20 rounded-md focus:outline-none focus:border-brand-red"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <p
            v-if="saveError"
            role="alert"
            class="mt-5 px-4 py-3 bg-brand-red/5 border border-brand-red/20 rounded-md text-sm text-brand-red"
          >
            {{ saveError }}
          </p>

          <div class="flex flex-wrap justify-end gap-3 mt-7 pt-5 border-t border-ink/15">
            <button
              type="button"
              @click="closeModal"
              class="min-h-[48px] px-5 border border-ink/20 rounded-md font-semibold hover:bg-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="min-h-[48px] px-6 bg-brand-red text-white rounded-md font-semibold hover:bg-brand-red-hover cursor-pointer"
            >
              {{ isEditing ? 'Save changes' : 'Add company' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
// The dashboard is the CRUD interface for the company directory. It keeps
// records in localStorage so changes are available to the public pages.
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import initialCompaniesData from '@/data/companies.json'

const router = useRouter()

const companies = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')

// Modal state determines whether the editor is open and whether it is creating
// a new record or updating an existing one.
const isModalOpen = ref(false)
const isEditing = ref(false)
const emptyCompanyForm = () => ({
  companyId: null,
  brandName: '',
  city: '',
  description: '',
  sourceProgrammes: '',
  internshipFields: '',
  websiteLanguages: '',
  website: '',
  careerUrl: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
})

const form = ref(emptyCompanyForm())
const saveError = ref('')

// Configuration-driven form fields avoid duplicating label, type, and hint markup.
const formFields = [
  {
    key: 'brandName',
    label: 'Company / brand name',
    type: 'text',
    required: true,
  },
  {
    key: 'city',
    label: 'City',
    type: 'text',
    required: true,
  },
  {
    key: 'sourceProgrammes',
    label: 'Study programmes',
    type: 'text',
    hint: 'Separate with commas: datamatiker, multimediedesigner',
  },
  {
    key: 'internshipFields',
    label: 'Internship fields',
    type: 'text',
    hint: 'Use field codes separated by commas, for example: frontend-development, ux-ui-design. Leave empty if not specified.',
  },
  {
    key: 'websiteLanguages',
    label: 'Website languages',
    type: 'text',
    hint: 'Separate with commas: Danish, English',
  },
  {
    key: 'website',
    label: 'Website',
    type: 'url',
    hint: 'Full link starting with https://',
  },
  {
    key: 'careerUrl',
    label: 'Careers page',
    type: 'url',
    hint: 'Leave empty if there is no careers page.',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'tel',
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
  },
]

onMounted(() => {
  // Restore admin data from localStorage or initialize it from the bundled dataset.
  const saved = localStorage.getItem('companies_list')
  if (saved) {
    companies.value = JSON.parse(saved)
  } else {
    companies.value = initialCompaniesData.map((item) => ({
      ...item,
      description: item.description || item['description'] || '',
      status: item.status || 'active',
    }))
    localStorage.setItem('companies_list', JSON.stringify(companies.value))
  }
})

const activeCount = computed(() => companies.value.filter((c) => c.status !== 'inactive').length)
const inactiveCount = computed(() => companies.value.filter((c) => c.status === 'inactive').length)

// Convert delimited source strings into arrays for table badges.
const getProgrammesList = (company) => {
  if (!company.sourceProgrammes) return []
  return company.sourceProgrammes
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const getLanguagesList = (company) => {
  if (!company.websiteLanguages) return []
  return company.websiteLanguages
    .split(/[,;]/)
    .map((l) => l.trim())
    .filter(Boolean)
}

const filteredCompanies = computed(() => {
  // Apply both text search and the selected listing-status filter.
  return companies.value.filter((company) => {
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
  // Ask for confirmation before permanently removing a local record.
  if (confirm('Are you sure you want to delete this company?')) {
    companies.value = companies.value.filter((c) => c.companyId !== id)
    localStorage.setItem('companies_list', JSON.stringify(companies.value))
  }
}

const openCreateModal = () => {
  // Start with a blank form and generate a unique id for the new company.
  isEditing.value = false
  saveError.value = ''
  form.value = {
    ...emptyCompanyForm(),
    companyId: crypto.randomUUID(),
  }
  isModalOpen.value = true
}

const editCompany = (company) => {
  // Copy the selected record into editable text fields without mutating the
  // table entry until the user submits the form.
  isEditing.value = true
  saveError.value = ''

  const toText = (value) => {
    return Array.isArray(value) ? value.join(', ') : String(value || '')
  }

  form.value = {
    companyId: company.companyId,
    brandName: company.brandName || company['name (source / legal)'] || '',
    city: toText(company.city),
    description: toText(company.description),
    sourceProgrammes: toText(company.sourceProgrammes),
    internshipFields: toText(company['internshipFieldSlugs (optional)']),
    websiteLanguages: toText(company.websiteLanguages),
    website: toText(company.website),
    careerUrl: toText(company.careerUrl),
    email: toText(company.email),
    phone: toText(company.phone),
    address: toText(company.address),
    status: company.status || 'active',
  }

  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  saveError.value = ''
}

const saveCompany = () => {
  // Validate required fields and external links before writing the record.
  saveError.value = ''

  const brandName = form.value.brandName.trim()
  const city = form.value.city.trim()

  if (!brandName || !city) {
    saveError.value = 'Enter a company name and city.'
    return
  }

  for (const key of ['website', 'careerUrl']) {
    const value = form.value[key].trim()
    if (!value) continue

    try {
      const url = new URL(value)

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      saveError.value = 'Website and Careers links must start with https:// or http://.'
      return
    }
  }

  const updatedFields = {
    companyId: form.value.companyId,
    brandName,
    city,
    description: form.value.description.trim(),
    sourceProgrammes: form.value.sourceProgrammes.trim(),
    'internshipFieldSlugs (optional)': form.value.internshipFields.trim(),
    websiteLanguages: form.value.websiteLanguages.trim(),
    website: form.value.website.trim(),
    careerUrl: form.value.careerUrl.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim(),
    address: form.value.address.trim(),
    status: form.value.status,
  }

  let updatedCompanies

  if (isEditing.value) {
    // Replace only the matching record while preserving all other companies.
    const index = companies.value.findIndex((company) => company.companyId === form.value.companyId)

    if (index === -1) {
      saveError.value = 'Company not found. Close this window and try again.'
      return
    }

    updatedCompanies = companies.value.map((company, companyIndex) => {
      return companyIndex === index ? { ...company, ...updatedFields } : company
    })
  } else {
    // Put newly created companies at the beginning of the directory.
    updatedCompanies = [updatedFields, ...companies.value]
  }

  try {
    // Persist first, then update the reactive list so the UI reflects a
    // successfully stored change.
    localStorage.setItem('companies_list', JSON.stringify(updatedCompanies))
    companies.value = updatedCompanies
    closeModal()
  } catch {
    saveError.value = 'Could not save changes in this browser. Please try again.'
  }
}

const logout = () => {
  // Remove the local session flag and return to the login page.
  localStorage.removeItem('is_admin_logged')
  router.push('/admin')
}
</script>
