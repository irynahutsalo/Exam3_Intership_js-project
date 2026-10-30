// Import the page components used by the application's route table.
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompaniesView from '../views/Companies.vue'
import CompanyDetailsView from '../views/CompanyDetails.vue'
import AdminLogin from '../views/AdminLogin.vue' // Admin login page
import AdminDashboard from '../views/AdminDashboard.vue' // Protected admin dashboard page

// Define all application routes. Named routes allow components to navigate
// without hard-coding URL strings throughout the application.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/companies',
      name: 'companies',
      component: CompaniesView
    },
    {
      path: '/company/:slug',
      name: 'company-details',
      component: CompanyDetailsView
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: AdminLogin
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true } // Marks this route as protected (requires admin login)
    }
  ]
})

// Protect private routes before every navigation.
router.beforeEach((to, from, next) => {
  // The current demo authentication flag is stored locally in the browser.
  const isAuthenticated = localStorage.getItem('is_admin_logged') === 'true'

  // Redirect unauthenticated users away from the dashboard.
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin')
  } else {
    // Continue to the requested route when it is public or authenticated.
    next()
  }
})

export default router