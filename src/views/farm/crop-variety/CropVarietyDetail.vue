<!--
  作物品种详情组件
  对标 V1.1 src/components/farm/crop-variety/CropVarietyDetail.tsx
-->
<template>
  <div v-if="variety" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div><span class="text-gray-500 text-sm">编码：</span><span class="font-mono font-medium">{{ variety.code }}</span></div>
      <div><span class="text-gray-500 text-sm">名称：</span><span class="font-medium">{{ variety.name }}</span></div>
      <div><span class="text-gray-500 text-sm">类别：</span>{{ variety.category }}</div>
      <div><span class="text-gray-500 text-sm">类型：</span>{{ variety.type }}</div>
      <div><span class="text-gray-500 text-sm">生长周期：</span>{{ variety.growthPeriod }} 天</div>
      <div>
        <span class="text-gray-500 text-sm">状态：</span>
        <el-tag :type="variety.status === 'active' ? 'success' : 'info'" size="small">
          {{ variety.status === 'active' ? '启用' : '停用' }}
        </el-tag>
      </div>
    </div>
    <div v-if="variety.remark">
      <div class="text-gray-500 text-sm mb-1">备注：</div>
      <p class="text-gray-700 text-sm">{{ variety.remark }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variety: { type: Object, default: null },
})
</script>