<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import { Bar } from 'vue-chartjs'

defineProps({
  content: {
    type: Object,
    required: true,
  },
})

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <div class="h-64">
    <Bar
      :data="content"
      :options="options"
    />
  </div>
</template>
