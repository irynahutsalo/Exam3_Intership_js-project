import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompaniesView from '../views/Companies.vue'
import CompanyDetailsView from '../views/CompanyDetails.vue'
import AdminLogin from '../views/AdminLogin.vue' // Admin login page
import AdminDashboard from '../views/AdminDashboard.vue' // Protected admin dashboard page

// Define all application routes
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

// Global navigation guard to secure admin routes
router.beforeEach((to, from, next) => {
  // Check if the user is authenticated by looking into localStorage
  const isAuthenticated = localStorage.getItem('is_admin_logged') === 'true'

  // If the route requires authentication and the user is not logged in, redirect to admin login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin')
  } else {
    next() // Proceed to the requested route normally
  }
})

export default router