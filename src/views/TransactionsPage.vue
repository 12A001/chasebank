<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/transactionStore'

import BottomNav from '@/components/BottomNav.vue'
import ChartsWidgetV2 from '@/components/ChartsWidgetV2.vue'

import { ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'

const router = useRouter()
const txStore = useTransactionStore()

onMounted(() => {
  txStore.fetchTransactions()
})

/* =========================
   ROUTE ON CLICK
========================= */
const openTransaction = (tx) => {
  router.push(`/transaction/${tx._id}`)
}

/* =========================
   ACCOUNT NUMBER LOGIC
========================= */
const getTransactionAccount = (tx) => {
  if (!tx) return ''

  if (tx.direction === 'received') {
    return tx.senderAccountNumber || tx.fromAccountNumber || ''
  }

  if (tx.direction === 'sent') {
    return tx.receiverAccountNumber || tx.toAccountNumber || ''
  }

  return tx.accountNumber || ''
}

/* =========================
   DATE FORMATTER (NEW)
   22nd May 26 STYLE
========================= */
const formatDate = (dateString) => {
  const date = new Date(dateString)

  const day = date.getDate()

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th'

  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = String(date.getFullYear()).slice(-2)

  return `${day}${suffix} ${month} ${year}`
}

/* =========================
   CHART DATA
========================= */
const chartData = computed(() => ({
  labels: txStore.monthlyStats.map((item) => item.month),

  datasets: [
    {
      label: 'Sent',
      data: txStore.monthlyStats.map((item) => item.sent),
      backgroundColor: '#EF4444',
      borderRadius: 10,
    },
    {
      label: 'Received',
      data: txStore.monthlyStats.map((item) => item.received),
      backgroundColor: '#0A4DB3',
      borderRadius: 10,
    },
  ],
}))

/* =========================
   GROUP BY DATE
========================= */
const grouped = computed(() => {
  const groups = {}

  txStore.filteredTransactions.forEach((tx) => {
    const date = new Date(tx.createdAt).toDateString()

    if (!groups[date]) groups[date] = []

    groups[date].push(tx)
  })

  return groups
})
</script>

<template>
  <div class="min-h-screen bg-[#F4F7FC] pb-24">
    <!-- HEADER -->
    <div class="p-4">
      <h1 class="text-2xl font-bold text-[#0A2240]">Transaction History</h1>

      <!-- SEARCH -->
      <div class="mt-3 mb-4">
        <input
          v-model="txStore.search"
          type="text"
          placeholder="Search transactions..."
          class="w-full p-3 rounded-xl bg-white border outline-none focus:ring-2 focus:ring-[#0A4DB3]"
        />
      </div>

      <!-- FILTERS -->
      <div class="flex gap-2 mt-3">
        <button
          v-for="f in ['all', 'sent', 'received']"
          :key="f"
          @click="txStore.setFilter(f)"
          class="px-4 py-2 rounded-full text-sm font-semibold transition"
          :class="txStore.filter === f ? 'bg-[#0A4DB3] text-white' : 'bg-white text-gray-600'"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <!-- CHART -->
    <div class="px-4 mb-6">
      <div class="bg-white p-4 rounded-2xl shadow-sm">
        <ChartsWidgetV2 :content="chartData" />
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="txStore.loading" class="p-4 text-center text-gray-500">Loading transactions...</div>

    <!-- LIST -->
    <div v-else class="px-4 space-y-6">
      <div
        v-if="Object.keys(grouped).length === 0"
        class="bg-white rounded-2xl p-10 text-center shadow-sm"
      >
        <p class="text-gray-500">No transactions found</p>
      </div>

      <div v-for="(items, date) in grouped" :key="date">
        <p class="text-xs text-gray-500 mb-3 uppercase tracking-wide">
          {{ date }}
        </p>

        <div class="space-y-3">
          <div
            v-for="tx in items"
            :key="tx._id"
            @click="openTransaction(tx)"
            class="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition cursor-pointer"
          >
            <!-- LEFT -->
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="tx.direction === 'received' ? 'bg-green-100' : 'bg-red-100'"
              >
                <ArrowDownLeft v-if="tx.direction === 'received'" class="w-5 h-5 text-green-600" />
                <ArrowUpRight v-else class="w-5 h-5 text-red-500" />
              </div>

              <div>
                <p class="font-semibold text-[#0A2240]">
                  {{ tx.accountName }}
                </p>

                <!-- 🔥 FIXED: bank → account number -->
                <p class="text-xs text-gray-500">
                  {{ getTransactionAccount(tx) }}
                </p>
              </div>
            </div>

            <!-- RIGHT -->
            <div class="text-right">
              <p
                class="font-bold"
                :class="tx.direction === 'received' ? 'text-green-600' : 'text-red-500'"
              >
                {{ tx.direction === 'received' ? '+' : '-' }}
                ${{ tx.amount.toLocaleString() }}
              </p>

              <p class="text-xs text-gray-400">
                {{ formatDate(tx.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
