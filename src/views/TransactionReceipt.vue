<template>
  <div class="min-h-screen bg-[#F4F7FC] pb-10">
    <div class="max-w-md mx-auto p-4">

      <!-- TOP -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="$router.back()"
          class="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
        >
          ←
        </button>

        <h1 class="text-xl font-bold text-black">Receipt</h1>

        <div class="w-10"></div>
      </div>

      <!-- RECEIPT -->
      <div id="receipt" class="receipt bg-white text-black rounded-2xl shadow-sm p-6 pdf-safe">

        <!-- STATUS -->
        <div class="text-center border-b pb-6">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center">
            <span class="text-lg font-bold text-black">
              {{ tx.direction === 'received' ? 'CREDITED' : 'DEBITED' }}
            </span>
          </div>

          <h2 class="mt-3 text-3xl font-bold text-black">
            ${{ Number(tx.amount || 0).toLocaleString() }}
          </h2>

          <!--  REPLACED TEXT WITH FORMATTED DATE -->
          <p class="text-gray-600 mt-1">
            {{ formatDate(tx.createdAt) }}
          </p>
        </div>

        <!-- DETAILS -->
        <div class="mt-6 space-y-4 text-sm text-black">

          <!-- ===================== -->
          <!-- CREDITED (RECEIVED) -->
          <!-- ===================== -->
          <template v-if="tx.direction === 'received'">

            <div class="flex justify-between">
              <span class="text-gray-600">Sender Name</span>
              <span class="font-semibold">{{ tx.senderName || 'N/A' }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Sender Account</span>
              <span class="font-semibold">
                {{ tx.senderAccountNumber || 'N/A' }}
              </span>
            </div>

          </template>

          <!-- ===================== -->
          <!-- DEBITED (SENT) -->
          <!-- ===================== -->
          <template v-else>

            <div class="flex justify-between">
              <span class="text-gray-600">Recipient Name</span>
              <span class="font-semibold">{{ tx.receiverName || 'N/A' }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Recipient Account</span>
              <span class="font-semibold">
                {{ tx.receiverAccountNumber || 'N/A' }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Sender Name</span>
              <span class="font-semibold">{{ tx.senderName || 'N/A' }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Sender Account</span>
              <span class="font-semibold">
                {{ mask(tx.senderAccountNumber) }}
              </span>
            </div>

          </template>

          <!-- COMMON -->
          <div class="flex justify-between">
            <span class="text-gray-600">Transaction ID</span>
            <span class="font-semibold break-all">{{ tx._id }}</span>
          </div>

          <div v-if="tx.note" class="flex justify-between">
            <span class="text-gray-600">Note</span>
            <span class="font-semibold">{{ tx.note }}</span>
          </div>

        </div>
      </div>

      <!-- ACTIONS -->
      <div class="grid grid-cols-2 gap-4 mt-6">

        <button
          @click="downloadReceipt"
          :disabled="loadingPdf"
          class="bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span v-if="loadingPdf">Generating...</span>
          <span v-else>Download PDF</span>
        </button>

        <button
          @click="shareWhatsApp"
          :disabled="loadingShare"
          class="bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span v-if="loadingShare">Preparing...</span>
          <span v-else>WhatsApp</span>
        </button>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import api from '@/services/api'

const route = useRoute()
const tx = ref({})
const loadingPdf = ref(false)
const loadingShare = ref(false)

onMounted(async () => {
  const { data } = await api.get(`/transactions/${route.params.id}`)
  tx.value = data
})

/* =========================
   FORMAT DATE (22nd May 2026)
========================= */
const formatDate = (dateStr) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)

  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()

  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th'

  return `${day}${suffix} ${month} ${year}`
}

/* MASK ONLY FOR DEBITED SENDER */
const mask = (num) => {
  if (!num) return '****'
  const str = String(num)
  if (str.length <= 6) return str
  return str.slice(0, 4) + '***' + str.slice(-3)
}

/* PDF */
const downloadReceipt = async () => {
  if (loadingPdf.value) return
  loadingPdf.value = true

  try {
    const element = document.getElementById('receipt')

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = (canvas.height * pageWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
    pdf.save(`receipt-${tx.value._id}.pdf`)
  } finally {
    loadingPdf.value = false
  }
}

/* WHATSAPP */
const shareWhatsApp = async () => {
  if (loadingShare.value) return
  loadingShare.value = true

  try {
    const msg = `
Transaction Receipt

Amount: $${tx.value.amount}
Type: ${tx.value.direction}

Sender: ${tx.value.senderName}
Receiver: ${tx.value.receiverName || 'N/A'}

Transaction ID: ${tx.value._id}
Date: ${formatDate(tx.value.createdAt)}
`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      '_blank'
    )
  } finally {
    loadingShare.value = false
  }
}
</script>

<style scoped>
#receipt {
  background: #ffffff !important;
  color: #000000 !important;
}

.pdf-safe,
.pdf-safe * {
  color: #000 !important;
  background-color: transparent !important;
  border-color: #ddd !important;
  box-shadow: none !important;
}

.pdf-safe {
  all: revert;
  font-family: Arial, sans-serif !important;
}
</style>
