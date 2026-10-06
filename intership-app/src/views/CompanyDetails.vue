<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import companiesData from '@/data/companies.json';

const route = useRoute();
const router = useRouter();
const company = ref(null);

// Lifecycle hook: runs when the component is mounted to load and filter company details
onMounted(() => {
    // Retrieve saved list from localStorage or fallback to imported JSON file
    const saved = localStorage.getItem('companies_list');
    const rawData = saved ? JSON.parse(saved) : companiesData;

    // Map and normalize raw data fields for UI presentation
    const list = rawData.map(item => ({
        id: item.companyId,
        brandName: item.brandName || item['name (source / legal)'],
        legalName: item['name (source / legal)'],
        city: item.city,
        sourceProgrammes: item.sourceProgrammes ? item.sourceProgrammes.split(',').map(s => s.trim()) : [],
        website: item.website,
        careerUrl: item.careerUrl,
        email: item.email,
        phone: item.phone,
        websiteLanguages: item.websiteLanguages ? item.websiteLanguages.split(';') : ['DK', 'EN'],
        description: item.description,
        address: item.address
    }));

    // Find the specific company based on the ID parameter from the route
    company.value = list.find(c => String(c.id) === String(route.params.id));
});

// Trigger browser native print dialog, which allows saving the page as a PDF cleanly
const downloadPDF = () => {
    window.print();
};
</script>

<template>
  <div class="min-h-screen bg-[#a8c4d8] p-10">
    <div class="max-w-6xl mx-auto">
      
      <!-- Top Navigation & PDF Export Action Bar -->
      <div class="flex justify-between items-center mb-6">
        <button @click="router.back()" class="text-[#102a43] font-semibold hover:underline cursor-pointer">
          &larr; Back to list
        </button>
        <button 
          @click="downloadPDF"
          class="bg-[#102a43] text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-[#102a43]/90 transition-colors shadow-sm cursor-pointer"
        >
          Download PDF 📄
        </button>
      </div>

      <!-- Main Content Container for Details and Print Preview -->
      <div v-if="company" class="space-y-6">
        
        <!-- Dark Hero Banner Header -->
        <div class="bg-[#102a43] text-white p-8 rounded-[28px] shadow-sm flex justify-between items-center">
          <div>
            <span class="inline-block px-3 py-1 bg-emerald-800/60 text-emerald-200 text-xs rounded-full font-medium mb-3">
              Currently Recruiting
            </span>
            <h1 class="text-4xl font-bold mb-2">{{ company.brandName }}</h1>
            <p class="text-[#8faabb] text-sm">📍 {{ company.address || company.city }}</p>
          </div>
          <div>
            <a 
              v-if="company.website" 
              :href="company.website" 
              target="_blank" 
              class="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors border border-white/20"
            >
              🌐 Website
            </a>
          </div>
        </div>

        <!-- Two-Column Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column: Main Description and Categories -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- About Section Card -->
            <div class="bg-white/60 backdrop-blur-md p-8 rounded-[24px] border border-white/80 shadow-sm">
              <h2 class="text-xl font-bold text-[#102a43] mb-4">About {{ company.brandName }}</h2>
              <p class="text-[#102a43]/80 leading-relaxed">{{ company.description || 'Description is not available in the database.' }}</p>
            </div>

            <!-- Internship Areas Offered Card -->
            <div class="bg-white/60 backdrop-blur-md p-8 rounded-[24px] border border-white/80 shadow-sm">
              <h2 class="text-xl font-bold text-[#102a43] mb-4">Internship Areas Offered</h2>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(prog, idx) in company.sourceProgrammes" 
                  :key="idx"
                  class="bg-[#fadadd] text-[#9b2c2c] text-sm px-4 py-2 rounded-xl font-medium"
                >
                  {{ prog }}
                </span>
              </div>
            </div>

            <!-- Working Languages Card -->
            <div class="bg-white/60 backdrop-blur-md p-8 rounded-[24px] border border-white/80 shadow-sm">
              <h2 class="text-xl font-bold text-[#102a43] mb-4">Working Languages</h2>
              <div class="flex gap-3">
                <span 
                  v-for="lang in company.websiteLanguages" 
                  :key="lang"
                  class="bg-amber-100 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  {{ lang.trim() }}
                </span>
              </div>
            </div>

          </div>

          <!-- Right Column: Contact Details and Apply Actions -->
          <div class="space-y-6">
            
            <!-- Contact Information Box -->
            <div class="bg-white/60 backdrop-blur-md p-6 rounded-[24px] border border-white/80 shadow-sm">
              <h3 class="text-lg font-bold text-[#102a43] mb-4">Contact Information</h3>
              
              <div class="space-y-4 text-sm text-[#102a43]">
                <div v-if="company.email">
                  <p class="text-[#627d98] text-xs">Email</p>
                  <p class="font-semibold">{{ company.email }}</p>
                </div>
                <div v-if="company.phone">
                  <p class="text-[#627d98] text-xs">Phone</p>
                  <p class="font-semibold">{{ company.phone }}</p>
                </div>
              </div>

              <a 
                v-if="company.careerUrl || company.website"
                :href="company.careerUrl || company.website" 
                target="_blank"
                class="mt-6 block w-full text-center bg-[#D9534F] text-white py-3 rounded-xl font-semibold hover:bg-[#c9302c] transition-colors shadow-sm"
              >
                Apply on Website
              </a>
            </div>

            <!-- How to Apply Guide Box -->
            <div class="bg-[#102a43] text-white p-6 rounded-[24px] shadow-sm">
              <h3 class="text-lg font-bold mb-2">How to Apply</h3>
              <p class="text-[#8faabb] text-sm leading-relaxed mb-4">
                Apply through the official career portal. Complete their application form and upload your CV and cover letter.
              </p>
              <a 
                v-if="company.careerUrl"
                :href="company.careerUrl" 
                target="_blank" 
                class="inline-block text-[#78aacd] hover:text-white font-medium text-sm"
              >
                Go to Portal &rarr;
              </a>
            </div>

          </div>
        </div>

      </div>

      <!-- Fallback state if company ID is invalid or missing -->
      <div v-else class="text-center py-20 text-[#102a43] font-semibold">
        Company not found.
      </div>

    </div>
  </div>
</template>

<style>
/* Print media styles to match exact website design and colors */
@media print {
  /* Hide navigation buttons and header elements */
  button, nav, header {
    display: none !important;
  }

  /* Force background colors and remove glassmorphism blur for stable PDF rendering */
  body {
    background-color: #a8c4d8 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Keep container layout solid */
  .max-w-6xl {
    max-width: 100% !important;
    padding: 0 !important;
  }

  /* Restore solid background for cards instead of translucent glass */
  .bg-white\/60 {
    background-color: #ffffff !important;
    border-color: #cbd5e1 !important;
  }

  /* Ensure dark header banner retains its branding */
  .bg-\[\#102a43\] {
    background-color: #102a43 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Keep badges colored properly */
  .bg-\[\#fadadd\] {
    background-color: #fadadd !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>