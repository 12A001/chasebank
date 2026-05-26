<script setup>
import { useRoute, useRouter } from 'vue-router'

import {
  House,
  Send,
  TrendingUp,
  User
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'Home', path: '/dashboard', icon: House },
  { name: 'Send', path: '/send', icon: Send },
  { name: 'Transactions', path: '/transactions', icon: TrendingUp },
  { name: 'Profile', path: '/profile', icon: User },
]

const go = (path) => {
  router.push(path)
}

const isActive = (path) => route.path === path
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
  >
    <div class="flex justify-around items-center py-2">

      <button
        v-for="item in navItems"
        :key="item.path"
        @click="go(item.path)"
        class="flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200"
        :class="
          isActive(item.path)
            ? 'text-[#0A4DB3] font-semibold'
            : 'text-gray-500'
        "
      >
        <!-- ICON -->
        <component
          :is="item.icon"
          class="w-6 h-6"
          :stroke-width="isActive(item.path) ? 2.5 : 2"
        />

        <!-- LABEL -->
        <span>{{ item.name }}</span>
      </button>

    </div>
  </div>
</template>
