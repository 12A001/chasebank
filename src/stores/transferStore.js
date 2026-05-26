// stores/transferStore.js

import { defineStore } from 'pinia'
import axios from 'axios'

export const useTransferStore = defineStore('transfer', {
  state: () => ({
    recentAccounts: [],
    loadingRecentAccounts: false,
  }),

  actions: {
  async fetchRecentAccounts() {
  try {
    this.loadingRecentAccounts = true

    const { data } = await axios.get('/api/transfers/recent')

    // REMOVE INVALID ENTRIES
    this.recentAccounts = (data || []).filter(user =>
      user &&
      user.name &&
      user.account &&
      user.bank
    )

  } catch (error) {
    console.log(error)
  } finally {
    this.loadingRecentAccounts = false
  }
}
  },
})
