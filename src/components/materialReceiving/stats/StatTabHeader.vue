<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
    <div class="border-b border-gray-100">
      <div class="flex items-center gap-1 p-2">
        <el-button
          :type="activeTab === 'monthly' ? 'primary' : 'default'"
          :plain="activeTab !== 'monthly'"
          size="small"
          @click="onTabChange('monthly')"
        >
          📅 月度汇总
        </el-button>
        <el-button
          :type="activeTab === 'material' ? 'primary' : 'default'"
          :plain="activeTab !== 'material'"
          size="small"
          @click="onTabChange('material')"
        >
          📦 物料汇总
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeTab: { type: String, default: 'monthly' }
})

const emit = defineEmits(['tab-change'])

const onTabChange = (tab) => {
  emit('tab-change', tab)
}
</script>
