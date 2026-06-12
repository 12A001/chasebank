<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/services/api'

const users = ref([])
const loading = ref(false)
const search = ref('')

const fetchUsers = async () => {
  loading.value = true
  const { data } = await axios.get('/admin/users')
  users.value = data
  loading.value = false
}

onMounted(fetchUsers)

const freezeUser = async (accountNumber) => {
  const reason = prompt('Reason for freezing account:')

  await axios.post('/admin/freeze', {
    accountNumber,
    reason
  })

  fetchUsers()
}

const unfreezeUser = async (accountNumber) => {
  await axios.post('/admin/unfreeze', {
    accountNumber
  })

  fetchUsers()
}

const filteredUsers = () => {
  if (!search.value) return users.value

  return users.value.filter(u =>
    u.accountNumber.includes(search.value) ||
    u.name.toLowerCase().includes(search.value.toLowerCase())
  )
}
</script>

<template>
  <div class="p-4 min-h-screen bg-gray-100">

    <!-- HEADER -->
    <h1 class="text-2xl font-bold mb-4">Admin - Users</h1>

    <!-- SEARCH -->
    <input
      v-model="search"
      placeholder="Search by name or account number"
      class="w-full p-3 border rounded-lg mb-4"
    />

    <!-- USERS LIST -->
    <div v-if="loading">Loading...</div>

    <div v-else class="space-y-3">

      <div
        v-for="user in filteredUsers()"
        :key="user._id"
        class="bg-white p-4 rounded-xl shadow flex justify-between items-center"
      >

        <!-- USER INFO -->
        <div>
          <p class="font-bold">{{ user.name }}</p>
          <p class="text-sm text-gray-500">
            {{ user.accountNumber }}
          </p>

          <p
            v-if="user.isFrozen"
            class="text-red-500 text-sm font-bold"
          >
            ❌ Frozen: {{ user.frozenReason }}
          </p>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex gap-2">

          <button
            v-if="!user.isFrozen"
            @click="freezeUser(user.accountNumber)"
            class="bg-red-500 text-white px-3 py-1 rounded-lg"
          >
            Freeze
          </button>

          <button
            v-else
            @click="unfreezeUser(user.accountNumber)"
            class="bg-green-500 text-white px-3 py-1 rounded-lg"
          >
            Unfreeze
          </button>

        </div>
      </div>

    </div>
  </div>
</template>
