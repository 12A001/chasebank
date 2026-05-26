<template>
  <div class="min-h-screen bg-gray-100 flex justify-center p-1">
    <div class="w-full max-w-md overflow-hidden">

      <!-- HEADER -->
      <div class="relative bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] h-36 flex items-center justify-center rounded-b-[40%]">
        <button class="absolute left-4 top-4 text-white text-lg">←</button>
        <h1 class="text-white text-lg font-semibold">Profile</h1>
      </div>

      <!-- AVATAR -->
      <div class="flex justify-center -mt-1">

        <div
          class="w-20 h-20 rounded-full bg-[#0A4DB3] flex items-center justify-center text-white text-xl font-bold border-4 border-white cursor-pointer overflow-hidden relative"
          @click="triggerUpload"
        >

          <!-- LOADING SPINNER -->
          <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black/40">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- IMAGE -->
          <img
            v-if="profileImage"
            :src="profileImage"
            class="w-full h-full object-cover"
          />

          <!-- INITIALS -->
          <span v-else>
            {{ initials }}
          </span>
        </div>

        <!-- HIDDEN INPUT -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
      </div>

      <div class="p-6 space-y-6">

        <!-- PERSONAL INFO -->
        <div class="bg-gray-50 rounded-xl p-4 space-y-4">
          <h2 class="text-sm font-semibold text-gray-600 uppercase">Personal Information</h2>

          <div>
            <label class="text-xs text-gray-500">Full Name:</label>
            <div class="w-full mt-1 p-3 bg-gray-100 rounded-lg text-gray-700">
              {{ form.fullName || '---' }}
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-500">Date of Birth:</label>
            <div class="w-full mt-1 p-3 bg-gray-100 rounded-lg text-gray-700">
              {{ formattedDOB }}
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-500">Home Address:</label>
            <pre class="w-full mt-1 p-3 bg-gray-100 rounded-lg text-gray-700 whitespace-pre-line">
{{ formattedAddress }}
            </pre>
          </div>
        </div>

        <!-- CONTACT -->
        <div class="bg-gray-50 rounded-xl p-4 space-y-4">
          <h2 class="text-sm font-semibold text-gray-600 uppercase">Contact</h2>

          <input v-model="form.phone" class="w-full p-3 border rounded-lg" placeholder="Phone" />
          <input v-model="form.email" class="w-full p-3 border rounded-lg" placeholder="Email" />
        </div>

        <!-- SECURITY -->
        <div class="bg-gray-50 rounded-xl p-4 space-y-5">
          <h2 class="text-sm font-semibold text-gray-600 uppercase">Security</h2>

          <input
            v-model="form.loginPin"
            type="password"
            maxlength="8"
            class="w-full p-3 border rounded-lg"
            placeholder="Login PIN (8 digits)"
            @input="form.loginPin = form.loginPin.replace(/\D/g,'').slice(0,8)"
          />

          <input
            v-model="form.transferPin"
            type="password"
            maxlength="4"
            class="w-full p-3 border rounded-lg"
            placeholder="Transfer PIN (4 digits)"
            @input="form.transferPin = form.transferPin.replace(/\D/g,'').slice(0,4)"
          />
        </div>

        <!-- SAVE -->
        <button
          @click="saveProfile"
          :disabled="saving"
          class="w-full bg-gradient-to-r from-[#0A4DB3] to-[#0A2240] text-white py-3 mb-12 rounded-xl font-semibold"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>

      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const auth = useAuthStore()

const saving = ref(false)
const uploading = ref(false)

const fileInput = ref(null)
const profileImage = ref(null)

const form = reactive({
  fullName: '',
  birthday: '',
  address: '',
  phone: '',
  email: '',
  loginPin: '',
  transferPin: '',
})

/* =========================
   FETCH USER
========================= */
onMounted(async () => {
  await auth.fetchUser()
})

watch(
  () => auth.user,
  (user) => {
    if (!user) return

    form.fullName = user.fullName
    form.birthday = user.birthday
    form.address = user.address || 'Not set'
    form.phone = user.phone
    form.email = user.email

    profileImage.value = user.profileImage || null
  },
  { immediate: true }
)

/* =========================
   IMAGE UPLOAD (CLOUDINARY)
========================= */
const triggerUpload = () => {
  fileInput.value.click()
}

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 800

        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.7)
      }
    }
  })
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // VALIDATION
  if (!file.type.startsWith('image/')) {
    alert('Only images allowed')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image too large (max 5MB)')
    return
  }

  uploading.value = true

  try {
    const compressed = await compressImage(file)

    const formData = new FormData()
    formData.append('image', compressed, file.name)

    const { data } = await api.put('/user/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    profileImage.value = data.image
    auth.user.profileImage = data.image

  } catch (err) {
    console.log('UPLOAD ERROR:', err.response?.data)
    alert('Upload failed')
  } finally {
    uploading.value = false
  }
}

/* =========================
   DOB FORMAT
========================= */
const formattedDOB = computed(() => {
  if (!form.birthday) return 'Not set'

  return new Date(form.birthday).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

/* =========================
   ADDRESS FORMAT
========================= */
const formattedAddress = computed(() => {
  if (!form.address) return 'Not set'

  return form.address.split(',').map(p => p.trim()).join('\n')
})

/* =========================
   INITIALS
========================= */
const initials = computed(() =>
  (form.fullName || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
)

/* =========================
   SAVE PROFILE
========================= */
const saveProfile = async () => {
  saving.value = true

  try {
    const payload = {
      phone: form.phone,
      email: form.email,
    }

    if (form.loginPin && form.loginPin.length === 8) {
      payload.loginPin = form.loginPin
    }

    if (form.transferPin && form.transferPin.length === 4) {
      payload.transferPin = form.transferPin
    }

    await auth.updateProfile(payload)

    alert('Profile updated')
  } catch (err) {
    console.log(err.response?.data)
  } finally {
    saving.value = false
  }
}
</script>
