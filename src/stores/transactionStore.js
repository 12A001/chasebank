import { defineStore } from 'pinia'
import api from '@/services/api'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    filter: 'all',
    search: '',
  }),

  getters: {
    filteredTransactions: (state) => {
      const list = Array.isArray(state.transactions)
        ? state.transactions
        : []

      let filtered = list

      // filter sent/received
      if (state.filter === 'sent') {
        filtered = filtered.filter((t) => t.direction === 'sent')
      }

      if (state.filter === 'received') {
        filtered = filtered.filter((t) => t.direction === 'received')
      }

      // search
      if (state.search) {
        const q = state.search.toLowerCase()

        filtered = filtered.filter((t) =>
          (t.accountName || '').toLowerCase().includes(q) ||
          (t.bank || '').toLowerCase().includes(q) ||
          (t.note || '').toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        )
      }

      return filtered
    },

    /* =========================
        MONTHLY ANALYTICS
    ========================= */
    monthlyStats: (state) => {
      const map = {}

      const list = Array.isArray(state.transactions)
        ? state.transactions
        : []

      list.forEach((tx) => {
        const date = new Date(tx.createdAt)
        const month = date.toLocaleString('default', { month: 'short' })

        if (!map[month]) {
          map[month] = { month, sent: 0, received: 0 }
        }

        if (tx.direction === 'sent') {
          map[month].sent += tx.amount
        } else {
          map[month].received += tx.amount
        }
      })

      return Object.values(map)
    },
  },

  actions: {
    async fetchTransactions() {
  try {
    this.loading = true

    // console.log(
    //   'TOKEN:',
    //   localStorage.getItem('auth_token')
    // )

    const { data } = await api.get('/transactions')

    // console.log('TRANSACTIONS:', data)

    this.transactions = Array.isArray(data)
      ? data
      : data.transactions || []

  } catch (err) {
    console.log(
      'TRANSACTION ERROR:',
      err.response?.data || err.message
    )

    this.transactions = []
  } finally {
    this.loading = false
  }
},

    setFilter(type) {
      this.filter = type
    },

    setSearch(value) {
      this.search = value
    },
  },
})
