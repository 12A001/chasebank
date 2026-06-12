<template>
  <div class="min-h-screen bg-[#F4F7FC] pb-24 overflow-x-hidden">
    <!-- CONTAINER -->
    <div class="w-full max-w-md mx-auto">
      <!-- TOP HEADER -->
      <div class="px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div class="min-w-0">
          <p class="text-gray-500 text-sm sm:text-lg">Hello,</p>

          <h1
            class="text-2xl sm:text-4xl font-extrabold text-[#0A2240] uppercase tracking-tight truncate"
          >
            {{ auth.name ?? 'Loading...' }}
          </h1>
        </div>

        <div
          @click="$router.push('/profile')"
          class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#0A4DB3] flex items-center justify-center overflow-hidden shadow-md cursor-pointer"
        >
          <img
            v-if="auth.user?.profileImage"
            :src="auth.user.profileImage"
            class="w-full h-full object-cover"
          />

          <span v-else class="text-white font-bold">
            {{ initials }}
          </span>
        </div>
      </div>

      <!-- FROZEN ACCOUNT ALERT -->
      <div
        v-if="auth.user?.isFrozen"
        class="mx-4 mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-2xl"
      >
        <p class="font-bold">⚠️ Account Frozen</p>
        <p class="text-sm mt-1">
          {{ auth.user?.frozenReason || 'Your account is currently restricted.' }}
        </p>
      </div>

      <!-- BALANCE CARD -->
      <div class="px-4 sm:px-6 mt-6 sm:mt-8">
        <div
          class="bg-gradient-to-br from-[#0A4DB3] to-[#0A2240] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden"
        >
          <!-- CARD GLOW -->
          <div
            class="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"
          ></div>

          <div class="flex items-center justify-between relative z-10">
            <p class="text-blue-100 font-medium text-sm sm:text-lg">Available Balance</p>

            <button @click="toggleBalance" class="text-white/80 hover:text-white transition">
              <Eye v-if="showBalance" class="w-5 h-5 sm:w-6 sm:h-6" />

              <EyeOff v-else class="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <!-- BALANCE -->
          <h2
            class="text-white text-3xl sm:text-5xl font-extrabold mt-4 sm:mt-5 tracking-tight break-words relative z-10"
          >
            {{ showBalance ? formattedBalance : '••••••••' }}
          </h2>

          <!-- ACCOUNT INFO -->
          <div
            class="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mt-6 sm:mt-8 relative z-10"
          >
            <div>
              <p class="text-blue-100 text-xs sm:text-sm">Account Number</p>

              <p class="text-white text-lg sm:text-2xl font-bold tracking-wide">
                {{ auth.accountNumber ?? 'Loading...' }}
              </p>
            </div>

            <!-- ADD MONEY BUTTON -->
            <button
              @click="handleAddMoney"
              :disabled="isFrozen"
              :class="isFrozen ? 'opacity-50 cursor-not-allowed' : ''"
              class="w-full sm:w-auto bg-white text-[#0A4DB3] px-5 py-3 rounded-2xl font-bold"
            >
              + Add Money
            </button>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="px-4 sm:px-6 mt-8 sm:mt-10">
        <div class="grid grid-cols-4 gap-3 sm:gap-4">
          <button
            v-for="action in quickActions"
            :key="action.name"
            @click="action.action()"
            class="bg-white rounded-2xl py-4 sm:py-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 hover:shadow-md active:scale-95 transition"
          >
            <component :is="action.icon" class="w-5 h-5 sm:w-7 sm:h-7 text-[#0A4DB3]" />

            <span
              class="text-[11px] sm:text-sm text-gray-600 font-semibold mt-2 sm:mt-3 text-center"
            >
              {{ action.name }}
            </span>
          </button>
        </div>
      </div>

      <!-- RECENT TRANSACTIONS -->
      <div class="px-4 sm:px-6 mt-10 sm:mt-14">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0A2240]">Recent Transactions</h2>

          <button
            @click="$router.push('/transactions')"
            class="text-[#0A4DB3] text-sm sm:text-base font-bold hover:underline"
          >
            See All
          </button>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-if="transactions.length === 0"
          class="flex flex-col items-center justify-center py-20 sm:py-24"
        >
          <Receipt class="w-14 h-14 sm:w-16 sm:h-16 text-gray-300" />

          <p class="text-gray-400 mt-5 sm:mt-6 text-base sm:text-xl">No recent transactions</p>
        </div>

        <!-- TRANSACTION LIST -->
        <div v-else class="space-y-4 mt-6 sm:mt-8">
          <div
            v-for="tx in transactions"
            @click="$router.push(`/transaction/${tx._id}`)"
            :key="tx._id"
            class="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm border border-gray-100 active:scale-[0.98] transition"
          >
            <div class="flex items-center gap-3 sm:gap-4 min-w-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                :class="tx.direction === 'received' ? 'bg-green-100' : 'bg-red-100'"
              >
                <ArrowDownLeft
                  v-if="tx.direction === 'received'"
                  class="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
                />

                <ArrowUpRight v-else class="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>

              <div class="min-w-0">
                <h3 class="font-bold text-[#0A2240] text-sm sm:text-base truncate">
                  {{ tx.accountName }}
                </h3>

                <p class="text-gray-500 text-xs sm:text-sm truncate">
                  {{ maskAccountNumber(getTransactionAccount(tx)) }}
                </p>
              </div>
            </div>

            <p
              class="font-bold text-sm sm:text-lg flex-shrink-0"
              :class="tx.type === 'credit' ? 'text-green-600' : 'text-red-600'"
            >
              {{ tx.direction === 'received' ? '+' : '-' }}$
              {{ Number(tx.amount).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD MONEY MODAL -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showAddMoneyModal"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <!-- BACKDROP -->
        <div class="absolute inset-0" @click="showAddMoneyModal = false"></div>

        <!-- MODAL -->
        <div
          class="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slideUp z-10"
        >
          <!-- HEADER -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-[#0A2240]">Add Money</h2>
              <p class="text-sm text-gray-500 mt-1">Fund your Chase account securely</p>
            </div>

            <button
              @click="showAddMoneyModal = false"
              class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- AMOUNT -->
          <!-- <div>
            <label class="text-sm font-medium text-gray-600 block mb-2">Amount</label>

            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>

              <input
                v-model="addMoney.amount"
                type="number"
                placeholder="0.00"
                class="w-full pl-9 pr-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A4DB3] text-lg font-semibold"
              />
            </div>
          </div> -->

          <!-- PAYMENT METHODS -->
          <div class="mt-6 space-y-4">
            <!-- CARD -->
            <button
              @click="goToCardPage"
              class="w-full border border-gray-200 hover:border-[#0A4DB3] hover:bg-[#F8FAFF] transition rounded-2xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-[#E8F0FF] flex items-center justify-center">
                  <CreditCard class="w-6 h-6 text-[#0A4DB3]" />
                </div>

                <div class="text-left">
                  <p class="font-semibold text-[#0A2240]">Add with Card</p>
                  <p class="text-sm text-gray-500">Visa, Mastercard & Debit Cards</p>
                </div>
              </div>

              <ChevronRight class="w-5 h-5 text-gray-400" />
            </button>

            <!-- BANK -->
            <button
              @click="goToBankPage"
              class="w-full border border-gray-200 hover:border-[#0A4DB3] hover:bg-[#F8FAFF] transition rounded-2xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-[#E8F0FF] flex items-center justify-center">
                  <Building2 class="w-6 h-6 text-[#0A4DB3]" />
                </div>

                <div class="text-left">
                  <p class="font-semibold text-[#0A2240]">Bank Transfer</p>
                  <p class="text-sm text-gray-500">Transfer from another bank</p>
                </div>
              </div>

              <ChevronRight class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- BOTTOM NAV -->
    <BottomNav />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BottomNav from '@/components/BottomNav.vue'
import { useAuthStore } from '@/stores/authStore'
import { useTransactionStore } from '@/stores/transactionStore'

import {
  Eye,
  EyeOff,
  ArrowLeftRight,
  Smartphone,
  Lightbulb,
  QrCode,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building2,
  ChevronRight,
  X,
} from 'lucide-vue-next'

const router = useRouter()

/*
|--------------------------------------------------------------------------
| USER STATE
|--------------------------------------------------------------------------
*/
const auth = useAuthStore()

const txStore = useTransactionStore()

onMounted(async () => {
  await auth.fetchUser()
  await txStore.fetchTransactions()
})

/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

const transactions = computed(() => {
  if (!Array.isArray(txStore.transactions)) return []

  return txStore.transactions
    .map((tx) => ({
      ...tx,
      type: tx.direction === 'received' ? 'credit' : 'debit',
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
})

/*
|--------------------------------------------------------------------------
| ACCOUNT NUMBER HELPERS (FIXED FEATURE)
|--------------------------------------------------------------------------
*/

const getTransactionAccount = (tx) => {
  if (!tx) return ''

  // RECEIVED → show sender
  if (tx.direction === 'received') {
    return tx.senderAccountNumber || tx.fromAccountNumber || tx.accountNumber || ''
  }

  // SENT → show receiver
  if (tx.direction === 'sent') {
    return tx.receiverAccountNumber || tx.toAccountNumber || tx.accountNumber || ''
  }

  return tx.accountNumber || ''
}

const maskAccountNumber = (number) => {
  if (!number) return '****'

  const str = String(number).replace(/\s/g, '')

  if (str.length <= 6) return str

  return `${str.slice(0, 4)}***${str.slice(-3)}`
}

/*
|--------------------------------------------------------------------------
| UI STATE
|--------------------------------------------------------------------------
*/

const showAddMoneyModal = ref(false)

const showBalance = computed(() => auth.showBalance)

const toggleBalance = () => {
  auth.toggleBalance()
}
const isFrozen = computed(() => auth.user?.isFrozen)
/*
|--------------------------------------------------------------------------
| QUICK ACTIONS
|--------------------------------------------------------------------------
*/

const quickActions = [
  { name: 'Transfer', icon: ArrowLeftRight, action: () => handleTransfer() },
  { name: 'Airtime', icon: Smartphone, action: () => {} },
  { name: 'Bills', icon: Lightbulb, action: () => {} },
  { name: 'Scan QR', icon: QrCode, action: () => {} },
]
const handleTransfer = () => {
  if (auth.user?.isFrozen) {
    alert('Account is frozen. You cannot transfer.')
    return
  }

  router.push('/send')
}

/*
|--------------------------------------------------------------------------
| COMPUTED
|--------------------------------------------------------------------------
*/

const initials = computed(() => {
  const name = auth.name || ''
  if (!name) return ''

  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
})

const formattedBalance = computed(() => {
  return `$${Number(auth.balance || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

const handleAddMoney = () => {
  showAddMoneyModal.value = true
}

const goToCardPage = () => {
  showAddMoneyModal.value = false
  router.push('/add-card')
}

const goToBankPage = () => {
  showAddMoneyModal.value = false
  router.push('/bank-transfer')
}
</script>

<style scoped>
button {
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slideUp {
  animation: slideUp 0.25s ease;
}
</style>
