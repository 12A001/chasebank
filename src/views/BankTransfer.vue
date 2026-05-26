<template>
  <div class="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-4">

    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">

      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#0A2240]">Bank Transfer</h1>
        <p class="text-sm text-gray-500">Send money from another bank account</p>
      </div>

      <!-- AMOUNT -->
      <label class="text-sm text-gray-600">Amount</label>
      <input
        v-model="amount"
        type="number"
        placeholder="0.00"
        class="w-full p-4 border rounded-2xl mt-1 mb-4"
      />

      <!-- BANK DETAILS -->
      <div class="space-y-3">

        <input
          v-model="bankName"
          placeholder="Bank Name"
          class="w-full p-4 border rounded-2xl"
        />

        <input
          v-model="accountNumber"
          placeholder="Account Number"
          class="w-full p-4 border rounded-2xl"
        />

        <input
          v-model="accountName"
          placeholder="Account Name"
          class="w-full p-4 border rounded-2xl"
        />

      </div>

      <!-- REFERENCE -->
      <div class="mt-4 p-4 bg-gray-50 rounded-2xl">
        <p class="text-xs text-gray-500">Reference</p>

        <div class="flex items-center justify-between">
          <p class="font-semibold text-[#0A2240]">{{ reference }}</p>

          <button @click="copyRef" class="text-[#0A4DB3] text-sm">
            Copy
          </button>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="mt-4 text-sm text-gray-600 space-y-1">
        <p>✔ Secure bank transfer</p>
        <p>✔ Processing time: 1–5 minutes</p>
      </div>

      <!-- SUBMIT -->
      <button
        @click="submitTransfer"
        class="w-full mt-6 bg-[#0A4DB3] text-white py-4 rounded-2xl font-semibold hover:bg-[#083A87]"
      >
        Confirm Transfer
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const amount = ref('')
const bankName = ref('')
const accountNumber = ref('')
const accountName = ref('')

const reference = ref('TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase())

const copyRef = () => {
  navigator.clipboard.writeText(reference.value)
  alert('Reference copied!')
}

const submitTransfer = async () => {
  const payload = {
    amount: amount.value,
    bankName: bankName.value,
    accountNumber: accountNumber.value,
    accountName: accountName.value,
    reference: reference.value
  }

  console.log('BANK TRANSFER →', payload)

  // backend ready:
  // await axios.post('/api/bank-transfer', payload)

  alert('Transfer submitted!')
}
</script>
