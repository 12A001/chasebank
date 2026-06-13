<script setup>
import BottomNav from '@/components/BottomNav.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { useTransactionStore } from '@/stores/transactionStore'

const router = useRouter()
const auth = useAuthStore()
const txStore = useTransactionStore()

/* =========================
   FORM STATE
========================= */
const form = ref({
  account: '',
  accountName: '',
  bank: '',
  amount: '',
  note: '',
})

/* =========================
   UI STATE
========================= */
const error = ref('')
const loading = ref(false)
const showSuccess = ref(false)

/* =========================
   STEP CONTROL
========================= */
const step = ref(1) // 1 = form, 2 = PIN
const transferPin = ref('')
const pinError = ref('')
const verifyingPin = ref(false)

/* =========================
   FORMAT AMOUNT
========================= */
const formatAmount = (e) => {
  let value = e.target.value.replace(/\D/g, '')

  if (!value) {
    form.value.amount = ''
    error.value = ''
    return
  }

  value = value.replace(/^0+/, '')
  form.value.amount = value

  const amount = Number(value)

  if (amount > 100000) {
    error.value = 'Maximum transfer limit is $100,000'
  } else if (amount > auth.balance) {
    error.value = 'Insufficient balance'
  } else {
    error.value = ''
  }
}

/* =========================
   FORMAT DISPLAY
========================= */
const formattedAmount = computed(() => {
  if (!form.value.amount) return ''
  return Number(form.value.amount).toLocaleString()
})

const isFrozen = computed(() => auth.user?.isFrozen)

const contactSupport = () => {
  const phone = '16996894839'

  const message = encodeURIComponent(
    `Hello Support, my account (${auth.accountNumber}) is currently frozen. Please assist me with restoring access.`
  )

  window.open(
    `https://wa.me/${phone}?text=${message}`,
    '_blank'
  )
}
/* =========================
   VALIDATION
========================= */
const isValid = computed(() => {
  const amount = Number(form.value.amount || 0)

  return (
    form.value.account &&
    form.value.accountName &&
    form.value.bank &&
    amount > 0 &&
    amount <= 100000 &&
    amount <= auth.balance &&
    !loading.value
  )
})

/* =========================
   STEP 1 → CONTINUE
========================= */
const goToPinStep = () => {
    if (isFrozen.value) return

  if (!isValid.value) return
  step.value = 2
}

/* =========================
   VERIFY PIN + SEND
========================= */
const confirmTransfer = async () => {
  if (isFrozen.value) {
  return
}
  try {
    verifyingPin.value = true
    pinError.value = ''

    if (transferPin.value.length !== 4) {
      pinError.value = 'Enter 4-digit PIN'
      return
    }

    //  VERIFY PIN WITH BACKEND (SECURE)
    const { data } = await api.post('/user/verify-transfer-pin', {
      pin: transferPin.value,
    })

    if (!data.valid) {
      pinError.value = 'Incorrect transfer PIN'
      return
    }

    //  PROCEED TRANSFER
    loading.value = true

    const amount = Number(form.value.amount)

    await api.post('/transactions/send', {
      accountNumber: form.value.account,
      accountName: form.value.accountName,
      bank: form.value.bank,
      amount,
      note: form.value.note,
    })

    // update local state
    auth.deductBalance(amount)
    await txStore.fetchTransactions()

    showSuccess.value = true

    setTimeout(() => {
      showSuccess.value = false
      router.push('/dashboard')
    }, 1500)

    // reset
    step.value = 1
    transferPin.value = ''
    form.value = {
      account: '',
      accountName: '',
      bank: '',
      amount: '',
      note: '',
    }

  } catch (err) {
    pinError.value = err.response?.data?.message || 'Transfer failed'
  } finally {
    loading.value = false
    verifyingPin.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F4F7FC] pb-28 p-1">

    <!-- HEADER -->
    <div class="bg-[#0A2240] text-white p-5 rounded-b-3xl shadow-lg">
      <!-- FROZEN ACCOUNT NOTICE -->
<div
  v-if="isFrozen"
  class="mx-4 mt-4 bg-red-50 border border-red-200 rounded-3xl p-5"
>
  <div class="flex items-start gap-3">
    <div
      class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"
    >
      🔒
    </div>

    <div class="flex-1">
      <h3 class="text-red-700 font-bold text-lg">
        Account Restricted
      </h3>

      <p class="text-red-600 text-sm mt-2">
        Your account has been temporarily restricted and outgoing
        transfers are currently disabled.
      </p>

      <p class="text-red-600 text-sm mt-2">
        Reason:
        <span class="font-semibold">
          {{ auth.user?.frozenReason || 'Account under review' }}
        </span>
      </p>

      <p class="text-gray-600 text-sm mt-3">
        Please contact support for assistance.
      </p>

      <button
        @click="contactSupport"
        class="mt-4 bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold w-full"
      >
        Contact Support on WhatsApp
      </button>

      <p class="text-xs text-gray-500 text-center mt-2">
        +1 (699) 689-4839
      </p>
    </div>
  </div>
</div>
      <h1 class="text-2xl font-bold">Send Money</h1>
      <p class="text-sm text-blue-100">Secure transfer flow</p>
    </div>

    <!-- STEP 1 -->
<div
  v-if="step === 1 && !isFrozen"
  class="p-4 max-w-xl mx-auto space-y-4"
>
      <input v-model="form.account" placeholder="Recipient Account" class="w-full p-4 rounded-2xl border bg-white" />

      <input v-model="form.accountName" placeholder="Account Name" class="w-full p-4 rounded-2xl border bg-white" />

      <input v-model="form.bank" placeholder="Bank Name" class="w-full p-4 rounded-2xl border bg-white" />

      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2">$</span>

        <input
          :value="formattedAmount"
          @input="formatAmount"
          placeholder="0.00"
          class="w-full pl-10 p-4 rounded-2xl border bg-white"
        />
      </div>

      <input v-model="form.note" placeholder="Note" class="w-full p-4 rounded-2xl border bg-white" />

      <!-- CONTINUE -->
      <button
        @click="goToPinStep"
        :disabled="!isValid"
        class="w-full py-4 rounded-2xl text-white font-semibold"
        :class="isValid ? 'bg-[#0A4DB3]' : 'bg-gray-400'"
      >
        Continue
      </button>
    </div>

    <!-- STEP 2 (PIN MODAL) -->
    <div v-if="step === 2" class="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div class="bg-white p-6 rounded-2xl w-[90%] max-w-sm space-y-4">

        <h2 class="text-lg font-bold text-center">Enter Transfer PIN</h2>

        <input
          v-model="transferPin"
          type="password"
          maxlength="4"
          placeholder="••••"
          class="w-full p-4 border rounded-xl text-center tracking-widest"
          @input="transferPin = transferPin.replace(/\D/g,'').slice(0,4)"
        />

        <p v-if="pinError" class="text-red-500 text-sm text-center">
          {{ pinError }}
        </p>

        <div class="flex gap-2">
          <button
            @click="step = 1"
            class="w-1/2 py-3 bg-gray-200 rounded-xl"
          >
            Back
          </button>

          <button
            @click="confirmTransfer"
            class="w-1/2 py-3 bg-[#0A4DB3] text-white rounded-xl"
          >
            {{ verifyingPin ? 'Verifying...' : 'Confirm' }}
          </button>
        </div>

      </div>
    </div>

    <!-- SUCCESS -->
    <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-2xl text-center w-[85%] max-w-sm">
        <h2 class="text-xl font-bold text-green-600">Success</h2>
        <p class="text-gray-600 mt-2">Transfer completed successfully</p>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
