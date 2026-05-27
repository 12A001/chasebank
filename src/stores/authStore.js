import { defineStore } from 'pinia'
import api from '@/services/api'

/* =========================
   SAFE LOCALSTORAGE PARSER
========================= */
const getStoredBoolean = (key, fallback = true) => {
  try {
    const value = localStorage.getItem(key)

    if (value === null || value === 'undefined') {
      return fallback
    }

    return JSON.parse(value)
  } catch (err) {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    showBalance: getStoredBoolean('showBalance', true),
  }),

  getters: {
    balance: (state) => state.user?.balance ?? 0,

    name: (state) => state.user?.fullName ?? state.user?.name ?? '---',

    accountNumber: (state) =>
      state.user?.accountNumber || state.user?.account_number || state.user?.accountNo || null,
  },

  actions: {
    /* =========================
       SET USER (LOGIN PURPOSE)
    ========================= */
    setUser(user) {
      this.user = user
    },

    /* =========================
       TOGGLE BALANCE VISIBILITY
    ========================= */
    toggleBalance() {
      this.showBalance = !this.showBalance
      localStorage.setItem('showBalance', JSON.stringify(this.showBalance))
    },

    /* =========================
       FETCH USER FROM BACKEND
    ========================= */
    async fetchUser() {
      try {
        this.loading = true

       const { data } = await api.get('/user')

        // normalize safely
        this.user = data?.user || data?.data || data || null

      } catch (err) {
        console.log('Failed to fetch user:', err)
        this.user = null
      } finally {
        this.loading = false
      }
    },
    hydrate() {
  const token = localStorage.getItem('auth_token')
  if (token && !this.user) {
    this.fetchUser()
  }
},

    /* =========================
       DEDUCT BALANCE (LOCAL UPDATE)
    ========================= */
    deductBalance(amount) {
      if (!this.user) return
      this.user.balance = Math.max(0, this.user.balance - amount)
    },

    /* =========================
       UPDATE PROFILE
    ========================= */
    async updateProfile(payload) {
      try {
const { data } = await api.put('/user/profile', payload)
        this.user = {
          ...this.user,
          ...data,
        }

        return data
      } catch (err) {
        console.log('Profile update failed:', err)
        throw err
      }
    },
  },
})
