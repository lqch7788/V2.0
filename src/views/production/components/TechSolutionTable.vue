<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">技术方案列表</h3>
      <div v-if="batchMode || exportMode" class="flex gap-2">
        <button v-if="batchEditMode" :class="btnBlue" @click="emit('openBatchEdit')">
          <Edit class="w-4 h-4" />
          编辑
        </button>
        <button v-if="batchEditMode" :class="btnSecondary" @click="emit('cancelBatch')">
          取消
        </button>
        <button v-if="batchDeleteMode" :class="btnDestructive" @click="emit('openDelete')" :disabled="selectedRows.length === 0">
          <Delete class="w-4 h-4" />
          删除
        </button>
        <button v-if="batchDeleteMode" :class="btnSecondary" @click="emit('cancelBatch')">
          取消
        </button>
        <button v-if="exportMode" :class="btnDefault" @click="emit('openExport')">
          <Download class="w-4 h-4" />
          确认导出
        </button>
        <button v-if="exportMode" :class="btnSecondary" @click="emit('cancelExport')">
          取消
        </button>
      </div>
      <div v-else class="flex gap-2">
        <button v-if="canCreate" :class="btnDefault" @click="emit('create')">
          <Plus class="w-4 h-4" />
          新增
        </button>
        <button v-if="canEdit" :class="btnBlue" @click="emit('startBatchEdit')">
          <Edit class="w-4 h-4" />
          编辑
        </button>
        <button v-if="canDelete" :class="btnDestructive" @click="emit('startBatchDelete')">
          <Delete class="w-4 h-4" />
          删除
        </button>
        <button v-if="canExport" :class="btnDefault" @click="emit('startExport')">
          <Download class="w-4 h-4" />
          导出
        </button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <tr>
            <th v-if="batchMode || exportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
              <input
                type="checkbox"
                :checked="selectedRows.length === data.length && data.length > 0"
                @change="emit('selectAll')"
                class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案编号</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">关联生产计划批次</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案标题</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物品种</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植模式</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">适用范围</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">版本</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">编制人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">创建日期</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最后提交时间</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案是否有效</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案详情文件</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">备注</th>
            <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <tr
            v-for="tech in data"
            :key="tech.id"
            class="hover:bg-blue-100 transition-colors"
          >
            <td v-if="batchMode || exportMode" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedRows.includes(tech.id)"
                @change="emit('selectRow', tech.id)"
                class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            </td>
            <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">
              <button :class="btnGhost + ' text-blue-600 hover:text-blue-800 text-xs'" @click="emit('view', tech)">{{ tech.code }}</button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ tech.relatedBatchCode || '-' }}</td>
            <td class="px-4 py-3 text-sm font-medium text-green-700 whitespace-nowrap">
              <button :class="btnGhost + ' text-green-700 hover:text-green-900 text-xs'" @click="emit('view', tech)">{{ tech.title }}</button>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.crop }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.plantingMode }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ (tech.scopes && tech.scopes.length > 0) ? tech.scopes.join('、') : (tech.stage || '-') }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.version }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.author }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.createDate }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.lastSubmitTime ? tech.lastSubmitTime.slice(0, 10) : '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.approver }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.approveStatus === '已审批' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                {{ tech.approveStatus }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.statusClass === 'normal' ? 'bg-green-100 text-green-700' : tech.statusClass === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                {{ tech.status }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.isValid === '作废' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
                {{ tech.isValid || '有效' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <button v-if="tech.planDetailFileName" :class="btnGhost + ' text-blue-600 hover:text-blue-800 text-sm'" :title="'点击下载方案详情'" @click="emit('download', tech)">
                {{ tech.planDetailFileName }}
              </button>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap max-w-xs truncate" :title="tech.remarks">
              {{ tech.remarks || '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <button v-if="tech.isValid !== '作废'" :class="btnGhost + ' text-blue-600 hover:text-blue-800 p-1'" title="编辑" @click="emit('edit', tech)">
                  <Edit class="w-4 h-4" />
                </button>
                <button :class="btnGhost + ' text-red-600 hover:text-red-800 p-1'" title="删除" @click="emit('delete', [tech.id])">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="exportMode && data.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center gap-4">
          <button :class="btnGhost" @click="emit('selectAll')">
            {{ selectedRows.length === data.length ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Delete, Download } from 'lucide-vue-next'

// 样式常量
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`
const btnDestructive = `${btnBase} bg-red-600 text-white hover:bg-red-700 h-8 rounded-md px-3 text-xs`
const btnBlue = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 h-8 rounded-md px-3 text-xs`
const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`

interface Props {
  data: any[]
  selectedRows: (string | number)[]
  batchMode?: boolean
  batchEditMode?: boolean
  batchDeleteMode?: boolean
  exportMode?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canExport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  batchMode: false,
  batchEditMode: false,
  batchDeleteMode: false,
  exportMode: false,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
})

const emit = defineEmits<{
  'view': [tech: any]
  'edit': [tech: any]
  'delete': [ids: (string | number)[]]
  'download': [tech: any]
  'selectRow': [id: string | number]
  'selectAll': []
  'create': []
  'startBatchEdit': []
  'startBatchDelete': []
  'startExport': []
  'openBatchEdit': []
  'openDelete': []
  'openExport': []
  'cancelBatch': []
  'cancelExport': []
}>()
</script>
