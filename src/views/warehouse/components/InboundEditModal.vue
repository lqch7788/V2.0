<!--
  编辑入库弹窗 - 从 WarehouseInbound.vue 提取
  原文件 L243-385 (~143 行模板)
  V2.0-PM-004 拆分第 5/6 阶段
-->
<template>
  <ElModal
    :model-value="show"
    title="编辑入库记录"
    :width="900"
    :height="600"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    :show-maximize="false"
    :enable-drag="false"
    :enable-resize="false"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >
    <div v-if="record">
      <!-- 已完成状态警告 -->
      <div v-if="record.status === 'completed'" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span class="text-sm text-amber-700">此记录已完成，物料明细不可编辑。如需修改请申请作废后重新录入。</span>
      </div>
      <!-- 已作废状态提示 -->
      <div v-if="record.status === 'voided'" class="mb-4 p-3 bg-gray-100 border border-gray-400 rounded-lg flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span class="text-sm text-gray-600">此记录已作废，仅供查看，无法编辑。</span>
      </div>

      <!-- 入库单信息 -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <span class="text-xs text-gray-500 block">入库单号</span>
            <span class="text-sm font-medium text-gray-900">{{ record.code }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">入库日期</span>
            <span class="text-sm font-medium text-gray-900">{{ record.inboundDate }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">供应商</span>
            <span class="text-sm font-medium text-gray-900">{{ record.supplier }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">操作员</span>
            <span class="text-sm font-medium text-gray-900">{{ record.operator }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">状态</span>
            <span class="text-sm font-medium" :class="{
              'text-amber-600': record.status === 'pending',
              'text-green-600': record.status === 'completed',
              'text-gray-500': record.status === 'voided'
            }">{{ getStatusText(record.status) }}</span>
          </div>
        </div>
      </div>

      <!-- 物料明细 -->
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ form.materials.length }}种物料）</h4>
        <button v-if="record.status === 'pending'" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="$emit('add-material-row')">
          <Plus class="w-3 h-3 inline mr-1" />添加物料
        </button>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white max-h-80">
        <table class="text-xs" style="min-width: 1600px">
          <thead>
            <tr>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">操作</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">分类</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">规格</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">条形码</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">单位</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">数量</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">单价</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">批次号</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">存放位置</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">生产日期</th>
              <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">过期日期</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(m, idx) in form.materials" :key="m.id">
              <td class="px-2 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <button class="text-red-500 hover:bg-red-50 p-1 rounded" @click="$emit('remove-material-row', idx)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </template>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.code" placeholder="编码" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-blue-600 font-medium">{{ m.code }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.name" placeholder="名称" class="w-32 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ m.name }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.category" placeholder="分类" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.category || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.specification" placeholder="规格" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.specification || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.barcode" placeholder="条形码" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.barcode || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <select v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs bg-white">
                    <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                  </select>
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.unit }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model.number="m.quantity" type="number" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ m.quantity }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.price" placeholder="单价" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-900">{{ m.price }}元</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.batchNo" placeholder="批次号" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.batchNo || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.location" placeholder="位置" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.location || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.productionDate" type="date" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.productionDate || '-' }}</span>
              </td>
              <td class="px-1 py-1.5 whitespace-nowrap">
                <template v-if="record.status === 'pending'">
                  <input v-model="m.expiryDate" type="date" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                </template>
                <span v-else class="text-xs text-gray-600">{{ m.expiryDate || '-' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button size="small" @click="$emit('close')">取消</el-button>
        <el-button type="primary" size="small" @click="$emit('save')">保存</el-button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
import { AlertTriangle, Plus, Trash2 } from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false },
  record: { type: Object, default: null },
  form: {
    type: Object,
    required: true
    // shape: { materials: Array }
  },
  unitOptions: { type: Array, default: () => ['袋', '箱', '个', '公斤', '升', '平方米', '吨', '包', '卷', '套', '台'] }
})

defineEmits(['close', 'save', 'add-material-row', 'remove-material-row'])

const getStatusText = (status) => {
  const map = {
    pending: '待入库',
    completed: '已入库',
    voided: '已作废'
  }
  return map[status] || status
}
</script>
