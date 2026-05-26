<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center
           bg-gradient-to-b from-[#0A4DB3] to-[#0A2240] px-2"
  >

    <!-- Logo -->
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

    <!-- Login Card -->
    <div
      class="w-full max-w-sm bg-white rounded-3xl
             shadow-2xl px-6 py-7"
    >

      <form
        class="space-y-6"
        @submit.prevent="handleLogin"
      >

        <!-- User ID -->
        <div class="relative">

          <label class="block text-xs text-gray-600 mb-1">
            User ID
          </label>

          <input
            v-model.trim="userId"
            type="text"
            placeholder="Enter your User ID"
            class="peer w-full px-4 py-3 bg-transparent
                   border-b border-gray-300
                   focus:outline-none
                   text-gray-800 placeholder-gray-400"
          />

          <span
            class="absolute left-0 bottom-0 h-[2px] w-0
                   bg-[#0A4DB3] transition-all duration-300
                   peer-focus:w-full"
          ></span>

        </div>

        <!-- Password -->
        <div class="relative">

          <label class="block text-xs text-gray-600 mb-1">
            Password
          </label>

          <input
            :type="showPassword ? 'text' : 'password'"
            v-model.trim="password"
            placeholder="Enter your password"
            class="peer w-full px-4 py-3 bg-transparent
                   border-b border-gray-300
                   focus:outline-none
                   text-gray-800 placeholder-gray-400"
          />

          <span
            class="absolute left-0 bottom-0 h-[2px] w-0
                   bg-[#0A4DB3] transition-all duration-300
                   peer-focus:w-full"
          ></span>

          <img
            :src="showPassword ? eyeOpen : eyeClosed"
            alt="Toggle password visibility"
            class="absolute right-2 top-9 h-5 w-5
                   cursor-pointer opacity-70
                   hover:opacity-100 transition"
            @click="togglePassword"
          />

        </div>

        <!-- Face ID -->
        <div
          class="flex items-center justify-center gap-2
                 text-sm text-[#0A4DB3] cursor-pointer
                 hover:text-[#0A2240] transition"
          @click="openCamera"
        >
          <span>Use Face ID</span>
        </div>

        <!-- Options -->
        <div class="flex items-center justify-between text-xs">

          <label class="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="accent-[#0A4DB3]"
            />
            Remember my User ID
          </label>

          <a href="#" class="text-[#0A4DB3] font-medium hover:underline">
            Forgot?
          </a>

        </div>

        <!-- Sign In -->
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="w-full py-3 rounded-xl text-white font-semibold
                 flex items-center justify-center gap-2
                 transition
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            loading
              ? 'bg-[#0A2240]'
              : 'bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] hover:brightness-110 shadow-lg shadow-blue-900/30'
          "
        >

          <svg
            v-if="loading"
            class="animate-spin h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="4" opacity="0.25"/>
            <path fill="white" d="M4 12a8 8 0 018-8v8z"/>
          </svg>

          <span>
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </span>

        </button>

      </form>

      <!-- Enrollment -->
      <div class="text-center mt-6 text-xs text-gray-500">
        New to Chase Bank?
        <router-link
          to="/enrollment"
          class="text-[#0A4DB3] font-semibold ml-1 hover:underline"
        >
          Enroll Now
        </router-link>
      </div>

    </div>

    <!-- FACE ID CAMERA MODAL -->
    <div
      v-if="showCamera"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm
             flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-3xl p-4 w-full max-w-sm shadow-2xl">

        <h2 class="text-center text-lg font-semibold mb-3">
          Face Verification
        </h2>

        <div class="relative">
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="w-full rounded-2xl"
          ></video>

          <div class="absolute inset-4 border-2 border-[#0A4DB3] rounded-xl pointer-events-none"></div>
        </div>

        <div class="flex justify-between mt-4">

          <button
            class="px-4 py-2 text-sm bg-gray-200 rounded-xl"
            @click="closeCamera"
          >
            Cancel
          </button>

          <button
            class="px-4 py-2 text-sm bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] text-white rounded-xl"
            @click="captureFace"
          >
            Capture
          </button>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { login } from '@/services/authService'

import eyeOpen from '@/assets/images/eye.png'
import eyeClosed from '@/assets/images/visible.png'

const router = useRouter()
const auth = useAuthStore()

const userId = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const showCamera = ref(false)
const videoRef = ref(null)
let stream = null

const isFormValid = computed(() => {
  return userId.value.length > 3 && password.value.length > 5
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!isFormValid.value || loading.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    const data = await login({
      userId: userId.value,
      password: password.value,
      rememberMe: rememberMe.value
    })

localStorage.setItem('auth_token', data.token)

auth.setUser(data.user)

router.push('/dashboard')

  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

/* FACE ID (unchanged) */
const openCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    })

    showCamera.value = true

    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.srcObject = stream
      }
    }, 100)

  } catch (err) {
    console.error('Error accessing camera:', err)
    alert('Unable to access camera. Please check permissions and try again.')
  }
}

const closeCamera = () => {
  showCamera.value = false
  if (stream) stream.getTracks().forEach(track => track.stop())
}

const captureFace = () => {
  const video = videoRef.value

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  console.log(canvas.toDataURL('image/png'))

  closeCamera()
}

onUnmounted(() => {
  if (stream) stream.getTracks().forEach(track => track.stop())
})
</script>
