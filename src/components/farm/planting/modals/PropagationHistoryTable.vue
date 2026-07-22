<!--
  2026-07-03 v3：繁殖历史记录表 1:1 迁移自 V1.1 PropagationHistoryTable.tsx
  10 列布局（日期/温度/湿度/母株/子苗/状态/移栽位置/操作人/备注/操作）
-->
<template>
  <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
    <table class="w-full text-sm">
      <thead class="bg-blue-500 text-white sticky top-0">
        <tr>
          <th class="px-2 py-2 text-left">日期</th>
          <th class="px-2 py-2 text-left">温度</th>
          <th class="px-2 py-2 text-left">湿度</th>
          <th class="px-2 py-2 text-left">母株</th>
          <th class="px-2 py-2 text-left">子苗</th>
          <th class="px-2 py-2 text-left">状态</th>
          <th class="px-2 py-2 text-left">移栽位置</th>
          <th class="px-2 py-2 text-left">操作人</th>
          <th class="px-2 py-2 text-left">备注</th>
          <th class="px-2 py-2 text-center w-24">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50">
          <td class="px-2 py-1.5 whitespace-nowrap">{{ r.recordDate }}</td>
          <td class="px-2 py-1.5">{{ r.temperature != null ? `${r.temperature}℃` : '-' }}</td>
          <td class="px-2 py-1.5">{{ r.humidity != null ? `${r.humidity}%` : '-' }}</td>
          <td class="px-2 py-1.5">{{ r.motherPlantCount ?? '-' }}</td>
          <td class="px-2 py-1.5 text-emerald-600 font-medium">{{ r.seedlingOutput ?? '-' }}</td>
          <td class="px-2 py-1.5">
            <Badge v-if="r.seedlingStatus" variant="outline" class="text-xs">
              {{ STATUS_LABELS[r.seedlingStatus] || r.seedlingStatus }}
            </Badge>
            <span v-else>-</span>
          </td>
          <td class="px-2 py-1.5 text-gray-500 truncate max-w-[120px]">{{ r.transplantPosition || '-' }}</td>
          <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
          <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]">{{ r.remarks || '-' }}</td>
          <td class="px-2 py-1.5 text-center">
            <span v-if="editingId === r.id" class="text-xs text-amber-600">编辑中</span>
            <div v-else class="flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon" :class="'text-blue-600 hover:text-blue-700 hover:bg-blue-50'" @click="onEdit(r)">
                <Edit2 class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" :class="'text-red-600 hover:text-red-700 hover:bg-red-50'" @click="onDelete(r.id)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * 2026-07-22 1:1 迁移自 V1.1 PropagationHistoryTable.tsx
 */
import { Edit2, Trash2 } from 'lucide-vue-next'
import { Button, Badge } from '@/components/ui'

const STATUS_LABELS = {
  healthy: '健康',
  weak: '弱苗',
  diseased: '病害'
}

defineProps({
  records: { type: Array, required: true },
  editingId: { type: String, default: null },
  onEdit: { type: Function, required: true },
  onDelete: { type: Function, required: true }
})
</script>
