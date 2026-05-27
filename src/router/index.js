import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/LoginPage.vue'
import Enrollment from '@/views/EnrollmentPage.vue'
import SendMoney from '@/views/SendMoney1.vue'
import Dashboard from '@/views/DashboardPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import Addcard from '@/views/AddCard.vue'
import BankTransfer from '@/views/BankTransfer.vue'
import TransactionsPage from '@/views/TransactionsPage.vue'
import TransactionReceipt from '@/views/TransactionReceipt.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/login',
    },

    // PUBLIC ROUTES
    {
      path: '/login',
      name: 'login',
      component: Login,
    },

    {
      path: '/enrollment',
      name: 'enrollment',
      component: Enrollment,
    },

    // PROTECTED ROUTES
    {
      path: '/send',
      name: 'SendMoney',
      component: SendMoney,
      meta: { requiresAuth: true },
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },

    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },

    {
      path: '/add-card',
      name: 'addcard',
      component: Addcard,
      meta: { requiresAuth: true },
    },

    {
      path: '/bank-transfer',
      name: 'banktransfer',
      component: BankTransfer,
      meta: { requiresAuth: true },
    },

    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsPage,
      meta: { requiresAuth: true },
    },

    {
      path: '/transaction/:id',
      name: 'transaction',
      component: TransactionReceipt,
      meta: { requiresAuth: true },
    },
  ],

  scrollBehavior() {
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})

/* =========================
   ROUTE GUARD
========================= */

router.beforeEach((to, from, next) => {
const token = localStorage.getItem('auth_token')
  // BLOCK ACCESS TO PROTECTED ROUTES
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // ALLOW ACCESS
  next()
})

export default router
