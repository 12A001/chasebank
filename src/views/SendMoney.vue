<script setup>
import BottomNav from '@/components/BottomNav.vue'
import { ref } from 'vue'

const form = ref({
  account: '',
  amount: '',
  bank: '',
  note: ''
})

const sendMoney = () => {
  console.log('Sending...', form.value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24">

    <!-- HEADER -->
    <div class="bg-blue-600 text-white p-6">
      <h1 class="text-xl font-semibold">Send Money</h1>
      <p class="text-sm opacity-80">Transfer funds securely</p>
    </div>

    <!-- FORM -->
    <div class="p-4 space-y-4">

      <input v-model="form.account"
        placeholder="Recipient Account Number"
        class="w-full p-3 border rounded-lg"
      />

      <input v-model="form.bank"
        placeholder="Bank Name"
        class="w-full p-3 border rounded-lg"
      />

      <input v-model="form.amount"
        placeholder="Amount"
        type="number"
        class="w-full p-3 border rounded-lg"
      />

      <input v-model="form.note"
        placeholder="Note (optional)"
        class="w-full p-3 border rounded-lg"
      />

      <button
        @click="sendMoney"
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
      >
        Send Money
      </button>
    </div>

    <!-- BOTTOM NAV -->
    <BottomNav />
  </div>
</template>
