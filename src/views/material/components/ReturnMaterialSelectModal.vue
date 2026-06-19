<template>
  <ElModal
    :model-value="show"
    title="选择物料"
    :width="1080"
    :height="650"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
 showMaterialSelectModal = v"
      @close="showMaterialSelectModal = false"
    >
      <div class="p-2">
        <!-- 搜索栏 -->
        <div class="mb-4">
          <input v-model="materialSelectSearch" placeholder="搜索物料编码或名称..." class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>

        <!-- 物料列表 -->
        <div v-if="filteredWarehouseMaterials.length > 0" class="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <table class="w-full text-xs">
            <thead class="bg-emerald-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th class="px-3 py-2 text-left font-semibold w-12">
                  <input type="checkbox" :checked="filteredWarehouseMaterials.length > 0 && filteredWarehouseMaterials.every(m => selectedMaterialCodes.has(m.code || m.name))" @change="toggleAllMaterialSelect" class="w-4 h-4 rounded border-white" />
                </th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">库存数量</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">仓库货位</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="row in filteredWarehouseMaterials" :key="row.code || row.name" class="hover:bg-gray-50 cursor-pointer" @click="toggleMaterialSelect(row.code || row.name)">
                <td class="px-3 py-2">
                  <input type="checkbox" :checked="selectedMaterialCodes.has(row.code || row.name)" class="w-4 h-4 rounded border-gray-400" />
                </td>
                <td class="px-3 py-2 font-mono text-xs text-blue-600 whitespace-nowrap">{ row.code || row.name }</td>
                <td class="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{ row.name }</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ row.specification || '-' }</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ row.unit }</td>
                <td class="px-3 py-2 text-xs text-gray-800 whitespace-nowrap">{ row.stockQuantity }</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{ row.location || '-' }</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">暂无物料数据</div>

        <div class="mt-4 text-sm text-gray-500">
          已选择 <strong>{ selectedMaterialCodes.size }</strong> 项
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="showMaterialSelectModal = false">取消</el-button>
        <el-button type="primary" size="small" @click="confirmMaterialSelect">确认添加</el-button>
      </template>
    
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
defineProps({
  show: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>
