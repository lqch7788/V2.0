<template>
  <!-- 施肥记录详情弹窗 -->
  <el-dialog :model-value="isOpen" @update:model-value="$emit('close')" title="施肥记录详情" width="650px" top="5vh">
    <div v-if="record" class="space-y-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-xs text-gray-500">施肥编号</p><p class="text-sm font-medium font-mono text-emerald-600">{{ record.fertilizerCode }}</p></div>
          <div><p class="text-xs text-gray-500">肥料名称</p><p class="text-sm font-medium">{{ record.fertilizerName }}</p></div>
          <div><p class="text-xs text-gray-500">肥料类型</p><span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{{ record.fertilizerType }}</span></div>
          <div><p class="text-xs text-gray-500">稀释比例</p><p class="text-sm">{{ record.dilutionRatio || '-' }}</p></div>
          <div><p class="text-xs text-gray-500">施肥量</p><p class="text-sm font-bold text-emerald-600">{{ record.quantity }} kg</p></div>
          <div><p class="text-xs text-gray-500">总成本</p><p class="text-sm font-bold text-amber-600">{{ record.totalCost }} 元</p></div>
          <div><p class="text-xs text-gray-500">作物品种</p><p class="text-sm">{{ record.cropName || '-' }}</p></div>
          <div><p class="text-xs text-gray-500">温室位置</p><p class="text-sm">{{ record.greenhouseName || '-' }}</p></div>
          <div><p class="text-xs text-gray-500">施肥时间</p><p class="text-sm">{{ record.fertilizeTime }}</p></div>
          <div><p class="text-xs text-gray-500">数据来源</p><p class="text-sm">{{ record.dataSource === 'auto_iot' ? 'IoT自动采集' : '手动录入' }}</p></div>
          <div><p class="text-xs text-gray-500">操作员</p><p class="text-sm">{{ record.operatorName || '-' }}</p></div>
        </div>
      </div>
      <div v-if="record.remarks" class="bg-gray-50 rounded-lg p-4">
        <p class="text-xs text-gray-500 mb-1">备注</p>
        <p class="text-sm">{{ record.remarks }}</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  record: { type: Object, default: null },
})
defineEmits(['close'])
</script>
