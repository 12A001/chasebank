<template>
  <div class="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-2">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#0A2240]">Add Card</h1>

        <p class="text-sm text-gray-500">Securely link your debit or credit card</p>
      </div>

      <!-- ERROR -->
      <div
        v-if="error"
        class="mb-4 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm"
      >
        {{ error }}
      </div>

      <!-- SUCCESS MODAL -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div
          v-if="success"
          class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center animate-successPop"
          >
            <!-- SUCCESS ICON -->
            <div class="relative w-28 h-28 mx-auto flex items-center justify-center">
              <!-- OUTER VERIFIED RING -->
              <div
                class="absolute inset-0 rounded-full border-[6px] border-green-200 animate-ping opacity-70"
              ></div>

              <!-- SECOND RING -->
              <div class="absolute inset-2 rounded-full border-4 border-green-300"></div>

              <!-- MAIN BADGE -->
              <div
                class="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.45)] animate-successBadge overflow-hidden"
              >
                <!-- INNER GLOW -->
                <div class="absolute w-16 h-16 rounded-full bg-white/10"></div>

                <!-- SUCCESS TICK -->
                <div class="relative z-10 animate-checkContainer">
                  <Check class="w-10 h-10 text-white stroke-[4] animate-checkDraw" />
                </div>
              </div>
            </div>

            <!-- TEXT -->
            <h2 class="text-2xl font-bold text-[#0A2240] mt-6">Payment Successful</h2>

            <p class="text-gray-500 mt-2 leading-relaxed">
              Your card has been charged successfully and your account balance has been updated.
            </p>

            <!-- AMOUNT -->
            <div class="mt-6 bg-[#F8FAFF] rounded-2xl py-4 px-5">
              <p class="text-sm text-gray-500">Amount Added</p>

              <h3 class="text-3xl font-extrabold text-[#0A2240] mt-1">${{ amount }}</h3>
            </div>

            <!-- LOADER -->
            <div class="mt-6 flex justify-center">
              <div
                class="w-8 h-8 border-4 border-[#0A4DB3] border-t-transparent rounded-full animate-spin"
              ></div>
            </div>

            <p class="text-xs text-gray-400 mt-3">Redirecting to dashboard...</p>
          </div>
        </div>
      </transition>

      <!-- CARD TYPE -->
      <div class="flex justify-between items-center mb-3 text-xs text-gray-400">
        <div class="flex items-center gap-2">
          <span class="text-gray-400">Detected:</span>

          <img v-if="cardType" :src="cardType" alt="Card" class="h-6 object-contain" />

          <span v-else class="text-gray-400"> Unknown </span>
        </div>
        <span>Visa • Mastercard • Amex</span>
      </div>

      <!-- CARD FORM -->
      <div class="border rounded-2xl overflow-hidden bg-white">
        <!-- CARD NUMBER -->
        <input
          v-model="cardNumber"
          type="text"
          name="cc-number"
          autocomplete="cc-number"
          inputmode="numeric"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="1234 1234 1234 1234"
          maxlength="19"
          class="w-full p-4 border-b outline-none focus:bg-[#F8FAFF]"
          @input="onCardInput"
        />

        <!-- EXPIRY + CVC -->
        <div class="flex">
          <input
            v-model="expiry"
            type="text"
            name="cc-exp"
            autocomplete="cc-exp"
            inputmode="numeric"
            placeholder="MM/YY"
            maxlength="5"
            class="w-1/2 p-4 border-r outline-none focus:bg-[#F8FAFF]"
            @input="formatExpiry"
          />

          <input
            v-model="cvc"
            :type="showCvc ? 'text' : 'password'"
            name="cc-csc"
            autocomplete="cc-csc"
            inputmode="numeric"
            placeholder="CVC"
            maxlength="4"
            class="w-1/2 p-4 outline-none focus:bg-[#F8FAFF] pr-12"
            @input="formatCVC"
          />

          <!-- CVC TOGGLE -->
          <button
            type="button"
            @click="showCvc = !showCvc"
            class="absolute right-10 mt-4 text-gray-400 hover:text-[#0A4DB3]"
          >
            <Eye v-if="!showCvc" class="w-5 h-5" />

            <EyeOff v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- CARDHOLDER -->
      <input
        v-model="cardholderName"
        type="text"
        name="cc-name"
        autocomplete="cc-name"
        autocorrect="off"
        autocapitalize="words"
        spellcheck="false"
        placeholder="Cardholder name"
        class="w-full mt-4 p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#0A4DB3]"
      />

      <!-- COUNTRY -->
      <select
        v-model="country"
        class="w-full mt-4 p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#0A4DB3]"
      >
        <option>Nigeria</option>
        <option>United Kingdom</option>
        <option>United States</option>
        <option>Canada</option>
        <option>Germany</option>
      </select>

      <!-- SECURITY INFO -->
      <div class="mt-4 bg-[#F8FAFF] border border-[#DCE8FF] rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <Shield class="w-5 h-5 text-[#0A4DB3] mt-0.5" />

          <div>
            <p class="text-sm font-semibold text-[#0A2240]">Secure Card Encryption</p>

            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Your card details are securely encrypted and protected.
            </p>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex gap-3 mt-6">
        <!-- CANCEL -->
        <button
          type="button"
          @click="router.push('/dashboard')"
          class="w-1/2 py-4 rounded-2xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>

        <!-- SAVE BUTTON -->
        <button
          :disabled="loading"
          @click="submitCard"
          class="w-1/2 py-4 rounded-2xl font-semibold text-white transition-all"
          :class="
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0A4DB3] hover:bg-[#083A87] active:scale-[0.98]'
          "
        >
          {{ loading ? 'Saving Card...' : 'Save & Use Card' }}
        </button>
      </div>
    </div>
  </div>
  <!-- AMOUNT MODAL -->
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showAmountModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <!-- BACKDROP -->
      <div class="absolute inset-0" @click="showAmountModal = false"></div>

      <!-- MODAL -->
      <div class="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl z-10">
        <div class="mb-5">
          <h2 class="text-2xl font-bold text-[#0A2240]">Add Money</h2>

          <p class="text-sm text-gray-500 mt-1">Enter amount you want to add from your card</p>
        </div>

        <!-- AMOUNT INPUT -->
        <div>
          <label class="text-sm text-gray-500"> Amount </label>

          <div class="relative mt-2">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500"
            >
              $
            </span>

            <input
              :value="amount"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full pl-10 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#0A4DB3] text-2xl font-bold tracking-wide"
              @input="formatAmount"
            />
          </div>
        </div>

        <!-- QUICK AMOUNTS -->
        <div class="grid grid-cols-3 gap-3 mt-5">
          <button
            type="button"
            @click="amount = '1,000'"
            class="py-3 rounded-xl border border-gray-200 hover:border-[#0A4DB3] hover:bg-[#F8FAFF] font-semibold"
          >
            $1,000
          </button>

          <button
            type="button"
            @click="amount = '5,000'"
            class="py-3 rounded-xl border border-gray-200 hover:border-[#0A4DB3] hover:bg-[#F8FAFF] font-semibold"
          >
            $5,000
          </button>

          <button
            type="button"
            @click="amount = '10,000'"
            class="py-3 rounded-xl border border-gray-200 hover:border-[#0A4DB3] hover:bg-[#F8FAFF] font-semibold"
          >
            $10,000
          </button>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="showAmountModal = false"
            class="w-1/2 py-4 rounded-2xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            :disabled="loading"
            @click="confirmFunding"
            class="w-1/2 py-4 rounded-2xl font-semibold text-white transition"
            :class="loading ? 'bg-gray-400' : 'bg-[#0A4DB3] hover:bg-[#083A87]'"
          >
            {{ loading ? 'Processing...' : 'Add Money' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Eye, EyeOff, Shield } from 'lucide-vue-next'
import visaLogo from '@/assets/images/visa.png'
import mastercardLogo from '@/assets/images/mastercard.png'
import amexLogo from '@/assets/images/amex.png'

const router = useRouter()

const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const cardholderName = ref('')
const country = ref('Nigeria')

const error = ref('')
const loading = ref(false)
const success = ref(false)
const cardType = ref('')
const showCvc = ref(false)
const showAmountModal = ref(false)

const amount = ref('')

/* -----------------------------
   LUHN VALIDATION
------------------------------*/
const isValidCardNumber = (num) => {
  let arr = (num + '')
    .replace(/\D/g, '')
    .split('')
    .reverse()
    .map((x) => parseInt(x))

  let sum = arr.reduce((acc, val, i) => {
    if (i % 2 !== 0) {
      val *= 2

      if (val > 9) val -= 9
    }

    return acc + val
  }, 0)

  return sum % 10 === 0
}

/* -----------------------------
   CARD TYPE DETECTION
------------------------------*/
const detectCardType = (num) => {
  const cleaned = num.replace(/\D/g, '')

  if (/^4/.test(cleaned)) return visaLogo

  if (/^5[1-5]/.test(cleaned)) return mastercardLogo

  if (/^3[47]/.test(cleaned)) return amexLogo

  return ''
}

/* -----------------------------
   CARD NUMBER INPUT
------------------------------*/
const onCardInput = (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16)

  cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim()

  cardType.value = detectCardType(v)
}

/* -----------------------------
   EXPIRY FORMAT
------------------------------*/
const formatExpiry = (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4)

  if (v.length >= 3) {
    expiry.value = v.slice(0, 2) + '/' + v.slice(2)
  } else {
    expiry.value = v
  }
}

/* -----------------------------
   CVC FORMAT
------------------------------*/
const formatCVC = (e) => {
  cvc.value = e.target.value.replace(/\D/g, '').slice(0, 4)
}

/* -----------------------------
   VALIDATION
------------------------------*/
const validate = () => {
  error.value = ''

  const num = cardNumber.value.replace(/\s/g, '')

  if (!num || num.length < 13) {
    error.value = 'Invalid card number'
    return false
  }

  if (!isValidCardNumber(num)) {
    error.value = 'Card number is not valid'
    return false
  }

  if (!expiry.value.includes('/')) {
    error.value = 'Invalid expiry date'
    return false
  }

  const [mm, yy] = expiry.value.split('/')

  const month = parseInt(mm)

  const year = parseInt('20' + yy)

  if (month < 1 || month > 12) {
    error.value = 'Invalid expiry month'
    return false
  }

  const now = new Date()

  const expDate = new Date(year, month)

  if (expDate < now) {
    error.value = 'Card is expired'
    return false
  }

  if (!cvc.value || cvc.value.length < 3) {
    error.value = 'Invalid CVC'
    return false
  }

  if (!cardholderName.value.trim()) {
    error.value = 'Cardholder name required'
    return false
  }

  return true
}

/* -----------------------------
   SUBMIT CARD
------------------------------*/
const submitCard = async () => {
  if (!validate()) return

  showAmountModal.value = true
}
/* -----------------------------
   FORMAT AMOUNT
------------------------------*/
const formatAmount = (e) => {
  let value = e.target.value.replace(/\D/g, '')

  amount.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/* -----------------------------
   CONFIRM FUNDING
------------------------------*/
const confirmFunding = async () => {
  if (!amount.value) {
    error.value = 'Enter amount to add'
    return
  }

  loading.value = true
  error.value = ''

  const payload = {
    cardNumber: cardNumber.value,
    expiry: expiry.value,
    cvc: cvc.value,
    cardholderName: cardholderName.value,
    country: country.value,
    cardType: cardType.value,
    amount: amount.value,
  }

  console.log('CARD SAVED & WALLET FUNDED →', payload)

  try {
    // backend ready
    // await axios.post('/api/cards/fund', payload)

    await new Promise((res) => setTimeout(res, 1800))

    /* --------------------------------
   UPDATE USER BALANCE
---------------------------------*/
    const currentBalance = Number(localStorage.getItem('balance')) || 200000

    const cleanAmount = Number(amount.value.replace(/,/g, ''))

    const updatedBalance = currentBalance + cleanAmount

    localStorage.setItem('balance', updatedBalance)

    /* --------------------------------
   SUCCESS UI
---------------------------------*/
    success.value = true

    showAmountModal.value = false

    /* --------------------------------
   REDIRECT TO DASHBOARD
---------------------------------*/
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  } catch (err) {
    console.error(err)

    error.value = 'Failed to fund wallet. Please try again.'
  } finally {
    loading.value = false
    showAmountModal.value = false
  }
}
</script>

<style scoped>
@keyframes successBadge {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }

  60% {
    transform: scale(1.08);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

@keyframes checkContainer {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes checkDraw {
  0% {
    transform: scale(0) rotate(-20deg);
    opacity: 0;
  }

  60% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

.animate-successBadge {
  animation: successBadge 0.5s ease;
}

.animate-checkContainer {
  animation: checkContainer 0.35s ease 0.2s both;
}

.animate-checkDraw {
  animation: checkDraw 0.45s ease 0.25s both;
}
</style>
