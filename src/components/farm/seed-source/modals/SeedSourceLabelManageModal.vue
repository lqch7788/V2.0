<template>
  <!--
    种源标签管理弹窗（V1.1 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/modals/SeedSourceLabelManageModal.tsx
    功能：种源标签全生命周期管理（两栏布局：标签列表 + 履历面板）
  -->
  <el-dialog
    :model-value="visible"
    :title="`种源标签管理 - ${seedSourceCode}`"
    width="1350px"
    top="5vh"
    :close-on-click-modal="true"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @update:model-value="(v) => $emit('update:visible', v)"
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义绿色渐变 header 1:1 对齐 V1.1 UnifiedModal 默认 header（最大化 + 关闭）-->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">{{ `种源标签管理 - ${seedSourceCode}` }}</h3>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="最大化"
            title="最大化/还原"
            @click="toggleMaximize"
          >
            <component :is="isMaximized ? Minimize2 : Maximize2" :size="18" />
          </button>
          <button
            type="button"
            class="text-white hover:bg-emerald-700 rounded p-1 transition-colors"
            aria-label="关闭"
            @click="handleClose"
          >
            <X :size="20" />
          </button>
        </div>
      </div>
    </template>
    <!-- 主体两栏：左 LabelTable + 右 LabelResumePanel（对齐 V1.1，无顶部统计卡片）-->
    <div class="flex gap-4" style="min-height: 600px">
      <!-- 左：标签列表（V1.1 1:1：4 列 + 搜索框带图标 + 选中行绿色高亮）-->
      <div class="w-1/2 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div class="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
          <div class="relative flex-1">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Search /></el-icon>
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索标签编号..."
              class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <el-button size="small" :disabled="selectedIds.size === 0" @click="clearSelection">取消选择</el-button>
        </div>
        <el-table
          v-loading="loading"
          :data="pagedLabels"
          :row-key="(row) => row.id"
          :row-class-name="labelRowClass"
          @row-click="handleSelectLabel"
          @selection-change="handleSelectionChange"
          height="450"
          size="small"
          :row-style="{ cursor: 'pointer' }"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column label="标签编号" prop="labelNumber" min-width="160" show-overflow-tooltip />
          <el-table-column label="移入位置" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="inline-flex items-center gap-1">
                <span>{{ row.moveInAreaName || '-' }}</span>
                <span
                  v-if="row.moveInAreaName"
                  class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold cursor-help"
                  title="种源标签所在的具体仓库位置"
                >?</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="移入日期" prop="moveInDate" min-width="110" />
          <el-table-column label="数量/状态" min-width="100" align="right">
            <template #default="{ row }">
              <span class="font-medium">{{ row.quantity || 0 }} {{ unit || '粒' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="px-3 py-2 border-t border-gray-200 flex items-center justify-end">
          <el-pagination
            v-model:current-page="labelPage"
            :page-size="20"
            :total="filteredLabels.length"
            layout="total, prev, pager, next"
            small
            background
          />
        </div>
      </div>

      <!-- 右：履历面板（V1.1 1:1：时间线/表格切换，无"新增履历"按钮）-->
      <div class="w-1/2 border border-gray-200 rounded-lg flex flex-col">
        <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span class="text-sm font-semibold">
            履历记录（{{ resumes.length }} 条）
          </span>
          <!-- V1.1 1:1：时间线/表格 切换按钮组 -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              class="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
              :class="resumeViewMode === 'timeline' ? 'bg-white shadow text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-700'"
              @click="resumeViewMode = 'timeline'"
            >
              <el-icon><Clock /></el-icon> 时间线
            </button>
            <button
              type="button"
              class="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors"
              :class="resumeViewMode === 'table' ? 'bg-white shadow text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-700'"
              @click="resumeViewMode = 'table'"
            >
              <el-icon><List /></el-icon> 表格
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <!-- 未选择标签：地图标记 + 提示（V1.1 风格）-->
          <div v-if="!selectedLabelId" class="py-12 text-center text-gray-400">
            <el-icon :size="48" class="mb-3 text-gray-300"><MapPin /></el-icon>
            <p>请在左侧选择一个标签查看履历</p>
          </div>
          <!-- 选中标签无履历：地图标记 + 暂无履历记录 -->
          <div v-else-if="resumes.length === 0" class="py-12 text-center text-gray-400">
            <el-icon :size="48" class="mb-3 text-gray-300"><MapPin /></el-icon>
            <p>暂无履历记录</p>
          </div>
          <!-- 时间线视图 -->
          <el-timeline v-else-if="resumeViewMode === 'timeline'">
            <el-timeline-item
              v-for="r in resumes"
              :key="r.id"
              :timestamp="r.operationDate"
              :type="resumeType(r.operationType)"
            >
              <strong>{{ resumeActionLabel(r.operationType) }}</strong>
              <span v-if="r.operatorName" class="ml-2 text-gray-500">操作人：{{ r.operatorName }}</span>
              <span v-if="r.toAreaName" class="ml-2 text-gray-500">→ {{ r.toAreaName }}</span>
              <span v-if="r.fromAreaName" class="ml-2 text-gray-500">从 {{ r.fromAreaName }}</span>
              <div v-if="r.reason" class="text-sm text-gray-600 mt-1">{{ r.reason }}</div>
            </el-timeline-item>
          </el-timeline>
          <!-- 表格视图（V1.1 1:1：9 列详细表格）-->
          <div v-else class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-xs">
              <thead class="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-left whitespace-nowrap">日期</th>
                  <th class="px-2 py-2 text-left whitespace-nowrap">操作</th>
                  <th class="px-2 py-2 text-left">从区域</th>
                  <th class="px-2 py-2 text-left">到区域</th>
                  <th class="px-2 py-2 text-right whitespace-nowrap">数量变化</th>
                  <th class="px-2 py-2 text-right whitespace-nowrap">剩余</th>
                  <th class="px-2 py-2 text-left">标记</th>
                  <th class="px-2 py-2 text-left">操作员</th>
                  <th class="px-2 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="r in resumes" :key="r.id" class="hover:bg-gray-50 align-top">
                  <td class="px-2 py-1.5 whitespace-nowrap">{{ r.operationDate || '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span class="inline-block px-1.5 py-0.5 rounded text-xs font-medium" :class="resumeOpClass(r.operationType)">
                      {{ resumeActionLabel(r.operationType) }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5 text-gray-600">{{ r.fromAreaName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-600">{{ r.toAreaName || '-' }}</td>
                  <td class="px-2 py-1.5 text-right">
                    <span v-if="r.quantityChange != null" :class="r.quantityChange > 0 ? 'text-emerald-600' : 'text-orange-600'">
                      {{ r.quantityChange > 0 ? '+' : '' }}{{ r.quantityChange }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-2 py-1.5 text-right text-gray-600">{{ r.quantityAfter != null ? r.quantityAfter : '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span v-if="r.markName" class="inline-block px-1.5 py-0.5 rounded text-xs text-white" :style="{ backgroundColor: r.markColor || '#9ca3af' }">
                      {{ r.markName }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-2 py-1.5 text-gray-600">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 max-w-[160px] truncate" :title="r.reason || ''">{{ r.reason || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- V1.1 1:1：新增履历内嵌表单（绿色背景栏，在底部操作栏上方）-->
    <div v-if="showAddResume" class="px-4 py-3 border-t border-emerald-200 bg-emerald-50 flex-shrink-0">
      <div class="text-xs font-semibold text-emerald-900 mb-2">
        新增履历 — 当前标签：{{ selectedLabel?.labelNumber || '-' }}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <!-- 4 个操作类型 Tab（移入/移出/打标记/作废） -->
        <button
          v-for="opt in ADD_OP_TYPE_OPTIONS"
          :key="opt.v"
          type="button"
          class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
          :class="addOpType === opt.v
            ? opt.cls + ' ring-2 ring-offset-1 ring-emerald-400'
            : 'bg-white text-gray-600 border border-gray-300'"
          @click="handleOpTypeChange(opt.v)"
        >
          <component :is="opt.icon" class="w-3 h-3" />{{ opt.label }}
        </button>

        <!-- 操作日期 -->
        <input
          v-model="addOpDate"
          type="date"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7"
        />

        <!-- 区域输入（移入/移出用） -->
        <input
          v-if="addOpType !== 'mark' && addOpType !== 'void'"
          v-model="addAreaName"
          type="text"
          :placeholder="addOpType === 'move_in' ? '移入到哪个区域（如：东区-A区）' : '移出到哪个区域（如：隔离区）'"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-48"
        />

        <!-- 标记选择（打标记用） -->
        <div v-if="addOpType === 'mark'" class="flex gap-1">
          <button
            v-for="m in MARK_OPTIONS"
            :key="m.id"
            type="button"
            class="px-2 py-1 rounded text-xs font-medium text-white"
            :class="addMarkId === m.id ? 'ring-2 ring-offset-1 ring-emerald-400' : 'opacity-70'"
            :style="{ backgroundColor: m.color }"
            @click="addMarkId = m.id"
          >{{ m.name }}</button>
        </div>

        <!-- 数量变更（非标记操作时显示） -->
        <input
          v-if="addOpType !== 'mark'"
          v-model="quantityChange"
          type="number"
          placeholder="数量变更（如：-5, +3）"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-36"
        />

        <!-- 原因（非标记操作时显示） -->
        <input
          v-if="addOpType !== 'mark'"
          v-model="reason"
          type="text"
          placeholder="原因（如：移栽损耗）"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 flex-1 min-w-[120px]"
        />

        <!-- 备注（通用） -->
        <input
          v-model="addRemarks"
          type="text"
          placeholder="备注（可选）"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 flex-1 min-w-[120px]"
        />

        <!-- 拍照按钮 -->
        <input ref="photoInputRef" type="file" accept="image/*" capture="environment" class="hidden" @change="handlePhotoChange" />
        <el-button size="small" :title="addPhotoBase64 ? '已附图' : '拍照/选择图片'" @click="photoInputRef?.click()">
          <el-icon><Camera /></el-icon>
          {{ addPhotoBase64 ? '已附图' : '拍照' }}
        </el-button>

        <!-- 提交/取消按钮 -->
        <el-button size="small" :loading="addSubmitting" @click="handleAddResume">
          {{ addSubmitting ? '提交中...' : '确认' }}
        </el-button>
        <el-button size="small" @click="closeAddResume">取消</el-button>
      </div>

      <!-- 图片预览 -->
      <div v-if="addPhotoBase64" class="mt-2 flex items-center gap-2">
        <img :src="addPhotoBase64" alt="预览" class="w-16 h-16 object-cover rounded border border-gray-300" />
        <button type="button" class="text-xs text-red-500 hover:text-red-700" @click="addPhotoBase64 = null">
          删除图片
        </button>
      </div>
    </div>

    <!-- V1.1 1:1：补充生成内嵌表单（蓝色背景栏，不是 el-dialog） -->
    <div v-if="showBatchGenerate" class="px-4 py-3 border-t border-blue-200 bg-blue-50 flex-shrink-0">
      <div class="text-xs font-semibold text-blue-900 mb-2">补充生成标签</div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="generateForm.count"
          type="number"
          placeholder="生成数量"
          class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-24"
        />
        <div class="flex items-center gap-1">
          <input
            v-model="generateForm.areaName"
            type="text"
            placeholder="区域（如：A区-1号架）"
            class="px-2 py-1 border border-gray-300 rounded text-xs h-7 w-40"
          />
          <span
            class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold cursor-help"
            title="该种源标签所在的具体仓库位置（如：A区-1号架-3层），非育苗温室区域"
          >?</span>
        </div>
        <el-button size="small" :loading="batchGenerating" :disabled="batchGenerating" @click="handleBatchGenerate">
          {{ batchGenerating ? '生成中...' : '生成' }}
        </el-button>
        <el-button size="small" @click="showBatchGenerate = false; generateForm.areaName = ''">取消</el-button>
      </div>
    </div>

    <!-- V1.1 1:1：底部操作栏（4 个按钮实色，关闭由 el-dialog 自带 X 处理）-->
    <div class="mt-4 p-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
      <span class="text-xs text-gray-400">
        共 {{ filteredLabels.length }} 个标签
      </span>
      <div class="flex items-center gap-2">
        <el-button
          @click="showAddResume = !showAddResume"
          :disabled="!selectedLabelId || selectedLabelStatus === 'voided' || selectedIds.size > 0"
          :title="!selectedLabelId ? '请先在左侧选择标签' : selectedLabelStatus === 'voided' ? '已作废标签无法添加履历' : selectedIds.size > 0 ? '多选模式下请先取消勾选' : ''"
          size="small"
        >
          <el-icon><Plus /></el-icon>
          新增履历
        </el-button>
        <el-button @click="showBatchGenerate = !showBatchGenerate" size="small" class="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600">
          <el-icon><Plus /></el-icon>
          补充生成
        </el-button>
        <el-button @click="showExportModal = true" :disabled="labels.length === 0" size="small" class="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600">
          导出
        </el-button>
        <el-button
          :disabled="selectedIds.size === 0"
          @click="showBatchVoid = true"
          size="small"
          class="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
        >
          批量作废{{ selectedIds.size > 0 ? ` (${selectedIds.size})` : '' }}
        </el-button>
        <!-- V1.1 1:1：关闭按钮（红色实色 + X 图标）-->
        <el-button size="small" class="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600" @click="handleClose">
          <el-icon><X /></el-icon>
          关闭
        </el-button>
      </div>
    </div>

    <!-- 批量作废弹窗（V1.1 红色 header 1:1 对齐）-->
    <el-dialog v-model="showBatchVoid" :show-close="false" width="500px" append-to-body>
      <template #header>
        <div class="bg-gradient-to-r from-red-500 to-red-600 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-white flex items-center gap-2">
            批量作废 {{ selectedIds.size }} 个标签
          </h3>
          <button type="button" class="text-white hover:bg-red-700 rounded p-1 transition-colors" @click="showBatchVoid = false">
            <X :size="18" />
          </button>
        </div>
      </template>
      <el-alert type="warning" :closable="false" class="mb-3">
        即将作废 <strong>{{ selectedIds.size }}</strong> 个标签，操作后标签状态变为"已作废"且不可再添加履历
      </el-alert>
      <el-form :model="voidForm" label-width="80px">
        <el-form-item label="作废原因" required>
          <el-input v-model="voidForm.reason" type="textarea" :rows="3" placeholder="如：标签重复、录入错误等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchVoid = false">取消</el-button>
        <el-button type="danger" :loading="batchVoiding" :disabled="!voidForm.reason" @click="handleBatchVoid">确认作废</el-button>
      </template>
    </el-dialog>

    <!-- 导出弹窗（V1.1 蓝色 header 1:1 对齐）-->
    <el-dialog v-model="showExportModal" :show-close="false" width="600px" append-to-body>
      <template #header>
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-white flex items-center gap-2">
            选择导出内容
          </h3>
          <button type="button" class="text-white hover:bg-blue-700 rounded p-1 transition-colors" @click="showExportModal = false">
            <X :size="18" />
          </button>
        </div>
      </template>
      <el-form label-width="100px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportScope">
            <el-radio value="selected">已选 ({{ selectedIds.size }})</el-radio>
            <el-radio value="filtered">筛选结果 ({{ filteredLabels.length }})</el-radio>
            <el-radio value="all">全部 ({{ labels.length }})</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出字段">
          <div class="flex gap-2 mb-2">
            <el-button size="small" @click="selectAllExportFields">全选</el-button>
            <el-button size="small" @click="deselectAllExportFields">全不选</el-button>
          </div>
          <el-checkbox-group v-model="selectedExportFields">
            <el-checkbox v-for="f in exportFieldOptions" :key="f.value" :value="f.value" :label="f.label" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { X, Camera, ArrowRight, ArrowLeft, Stamp, Trash2, Search, Clock, List, MapPin, Maximize2, Minimize2 } from 'lucide-vue-next'
import { Plus } from '@element-plus/icons-vue'
import { enhancedApiClient } from '@/lib/apiClient'
import { useUserStore } from '@/stores/modules/user'

/** 本地日期 YYYY-MM-DD（V1.1 todayLocal 替代） */
function todayLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** V1.1 一致：标记选项（与后端 plant_marks 默认数据一致） */
const MARK_OPTIONS = [
  { id: 1, name: '正常', color: '#22c55e' },
  { id: 2, name: '关注', color: '#f59e0b' },
  { id: 3, name: '问题', color: '#ef4444' },
  { id: 4, name: '优质', color: '#3b82f6' },
]

/** V1.1 一致：4 个操作类型 Tab 配置 */
const ADD_OP_TYPE_OPTIONS = [
  { v: 'move_in',  label: '移入',   icon: ArrowRight, cls: 'bg-emerald-100 text-emerald-700' },
  { v: 'move_out', label: '移出',   icon: ArrowLeft,  cls: 'bg-orange-100 text-orange-700' },
  { v: 'mark',     label: '打标记', icon: Stamp,      cls: 'bg-purple-100 text-purple-700' },
  { v: 'void',     label: '作废',   icon: Trash2,     cls: 'bg-gray-100 text-gray-700' },
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  seedSourceId: { type: String, required: true },
  seedSourceCode: { type: String, default: '' },
  unit: { type: String, default: '粒' },
  autoSelectLabelNumber: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'close'])

const loading = ref(false)
const searchText = ref('')
const labelPage = ref(1)
const selectedLabelId = ref(null)
const selectedLabelStatus = ref('')
const selectedIds = ref(new Set())
const labels = ref([])
const resumes = ref([])

const showAddResume = ref(false)
// V1.1 1:1：履历面板视图模式（时间线 / 表格切换）
const resumeViewMode = ref('timeline')
// V1.1 1:1：弹窗最大化状态（顶部 header 最大化按钮）
const isMaximized = ref(false)
/** 切换最大化（仅顶部 header 按钮触发，el-dialog 内部宽度/高度自适应） */
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}
// V1.1 1:1：4 Tab 切换 + 动态字段状态（替代 V2.0 原简化 resumeForm）
const addOpType = ref('move_in')
const addOpDate = ref(todayLocal())
const addAreaName = ref('')
const addMarkId = ref(2) // 默认关注
const addRemarks = ref('')
const quantityChange = ref('')
const reason = ref('')
const addPhotoBase64 = ref(null)
const addSubmitting = ref(false)
const photoInputRef = ref(null)

const showBatchGenerate = ref(false)
// V1.1 1:1：补充生成只暴露"数量 + 区域"2 个字段，start_date 由 todayLocal() 自动填
const generateForm = ref({ count: 10, areaName: '' })
const batchGenerating = ref(false)

const showBatchVoid = ref(false)
const voidForm = ref({ reason: '' })
const batchVoiding = ref(false)

const showExportModal = ref(false)
const exportScope = ref('filtered')
// V1.1 真实字段：labelNumber / status / quantity / createTime / moveInDate 等
const selectedExportFields = ref(['labelNumber', 'status', 'quantity', 'createTime'])
const exportFieldOptions = [
  { value: 'labelNumber', label: '标签编号' },
  { value: 'status', label: '状态' },
  { value: 'quantity', label: '数量' },
  { value: 'createTime', label: '创建时间' },
  { value: 'moveInDate', label: '移入日期' },
  { value: 'moveInAreaName', label: '所在区域' }
]

// V1.1 数据库真实状态：active / moved_out / voided
const stats = computed(() => ({
  total: labels.value.length,
  active: labels.value.filter(l => l.status === 'active').length,
  movedOut: labels.value.filter(l => l.status === 'moved_out').length,
  voided: labels.value.filter(l => l.status === 'voided').length
}))

const filteredLabels = computed(() => {
  if (!searchText.value) return labels.value
  return labels.value.filter(l => (l.labelNumber || '').toLowerCase().includes(searchText.value.toLowerCase()))
})

const pagedLabels = computed(() => {
  const start = (labelPage.value - 1) * 20
  return filteredLabels.value.slice(start, start + 20)
})

// V1.1 数据库真实状态：active / moved_out / voided（不是 pending/printed/used）
const statusLabel = (s) => ({ active: '正常', moved_out: '已移出', voided: '已作废' }[s] || s)
const statusTagType = (s) => ({ active: 'success', moved_out: 'info', voided: 'danger' }[s] || '')

// V1.1 真实 operation_type：move_in / move_out / void（mark 走 assign 接口不进 resume 表）
const resumeActionLabel = (a) => ({ move_in: '移入', move_out: '移出', mark: '打标记', void: '作废', create: '创建' }[a] || a)
const resumeType = (a) => ({ move_in: 'success', move_out: 'warning', mark: 'primary', void: 'danger', create: 'info' }[a] || '')
// 表格视图操作类型色块（V1.1 LabelResumePanel 1:1）
const resumeOpClass = (a) => (
  a === 'move_in' ? 'bg-emerald-100 text-emerald-700' :
  a === 'move_out' ? 'bg-orange-100 text-orange-700' :
  a === 'mark' ? 'bg-purple-100 text-purple-700' :
  'bg-red-100 text-red-700'
)

const labelRowClass = ({ row }) => {
  // V1.1 1:1：选中行绿色高亮（emerald-50）
  if (selectedLabelId.value === row.id) return '!bg-emerald-50'
  return ''
}

const loadLabels = async () => {
  loading.value = true
  try {
    // V1.1 一致：标签列表走 /plant-labels?seed_source_id=...
    const res = await enhancedApiClient.get(`/plant-labels?seed_source_id=${props.seedSourceId}&limit=200`)
    const list = Array.isArray(res) ? res : (res?.data || [])
    labels.value = list
    // 自动选中
    if (props.autoSelectLabelNumber) {
      const idx = labels.value.findIndex(l => l.labelNumber === props.autoSelectLabelNumber)
      if (idx >= 0) {
        labelPage.value = Math.floor(idx / 20) + 1
        nextTick(() => {
          selectedLabelId.value = labels.value[idx].id
          selectedLabelStatus.value = labels.value[idx].status
          loadResumes()
        })
      }
    }
  } catch (e) {
    console.error('[LabelManage] 加载标签失败:', e)
  } finally {
    loading.value = false
  }
}

const loadResumes = async () => {
  if (!selectedLabelId.value) return
  try {
    // V1.1 一致：履历端点 /plant-labels/:id/resumes
    const res = await enhancedApiClient.get(`/plant-labels/${selectedLabelId.value}/resumes`)
    resumes.value = res?.data || res?.items || []
  } catch (e) {
    console.error('[LabelManage] 加载履历失败:', e)
  }
}

const handleSelectLabel = (row) => {
  selectedLabelId.value = row.id
  selectedLabelStatus.value = row.status
  showAddResume.value = false
  loadResumes()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = new Set(rows.map(r => r.id))
  if (rows.length > 1) {
    showAddResume.value = false
  }
}

const clearSelection = () => {
  selectedIds.value.clear()
}

const handleAddResume = async () => {
  // V1.1 1:1：4 Tab 分支（move_in/move_out 走 resumes，mark 走 assign，void 走 resumes）
  const labelId = selectedLabelId.value
  if (!labelId) { ElMessage.warning('请先选择左侧标签'); return }
  if (addOpType.value !== 'mark' && addOpType.value !== 'void' && !addAreaName.value.trim()) {
    ElMessage.warning('请输入区域名称')
    return
  }
  addSubmitting.value = true
  try {
    // 操作人：从 userStore 推导（V1.1 风格）
    const userStore = useUserStore()
    const u = userStore.userInfo || userStore.currentUser || {}
    const operatorName = u.realName || u.username || 'system'

    // V1.1 一致：4 Tab 全部走 /plant-labels/:id/resumes 统一接口（V1.1 后端 plantLabelResumes.ts 接收 mark_id/name/color + operation_type='mark'）
    // 避免 /plant-labels/assign 端点路由注册冲突问题
    const markInfo = MARK_OPTIONS.find(m => m.id === addMarkId.value)
    const payload = {
      operation_type: addOpType.value,
      operation_date: addOpDate.value,
      operator_name: operatorName,
      remarks: addRemarks.value.trim() || null,
      image_base64: addPhotoBase64.value || null
    }
    // 移入/移出 需要 to_area_name（mark / void 不需要）
    if (addOpType.value !== 'mark' && addOpType.value !== 'void') {
      payload.to_area_name = addAreaName.value.trim()
    }
    // 标记需要 mark_id/name/color（V1.1 后端 resume 表字段）
    if (addOpType.value === 'mark') {
      payload.mark_id = addMarkId.value
      payload.mark_name = markInfo?.name || ''
      payload.mark_color = markInfo?.color || ''
    }
    // 数量变更（可选）+ 乐观锁 expected_quantity（非 mark Tab）
    if (addOpType.value !== 'mark' && quantityChange.value !== '' && quantityChange.value !== null) {
      payload.quantity_change = Number(quantityChange.value)
      if (selectedLabel.value?.quantity !== undefined) {
        payload.expected_quantity = selectedLabel.value.quantity
      }
    }
    // 原因（可选，非 mark Tab）
    if (addOpType.value !== 'mark' && reason.value.trim()) {
      payload.reason = reason.value.trim()
    }

    const res = await enhancedApiClient.post(`/plant-labels/${labelId}/resumes`, payload)
    if (res && res.success === false) {
      ElMessage.error('录入失败：' + (res.error || '未知错误'))
      return
    }

    ElMessage.success('履历已添加')
    closeAddResume()
    await loadResumes()
    await loadLabels()
  } catch (e) {
    console.error('[SeedSourceLabelManageModal] 新增履历失败:', e)
    ElMessage.error('网络错误：' + (e?.message || String(e)))
  } finally {
    addSubmitting.value = false
  }
}

const handleBatchGenerate = async () => {
  // V1.1 一致：前端校验 count
  const count = parseInt(generateForm.value.count, 10)
  if (!count || count < 1) {
    ElMessage.warning('请输入有效的生成数量')
    return
  }
  batchGenerating.value = true
  try {
    // V1.1 端点：POST /plant-labels/generate-batch（通过 seed_source_id 过滤种源）
    // V1.1 store 主动传 start_date=todayLocal()，对齐此行为
    const data = await enhancedApiClient.post('/plant-labels/generate-batch', {
      seed_source_id: props.seedSourceId,
      count,
      area_name: (generateForm.value.areaName || '').trim() || undefined,
      start_date: todayLocal()
    })
    if (data && typeof data === 'object' && 'labels' in data) {
      ElMessage.success(`已生成 ${data.totalPrinted || count} 个标签`)
      showBatchGenerate.value = false
      generateForm.value = { count: 10, areaName: '' }
      await loadLabels()
    } else {
      ElMessage.error('生成失败，请重试')
    }
  } catch (e) {
    console.error('[SeedSourceLabelManageModal] 补充生成失败:', e)
    ElMessage.error('生成失败：' + (e?.message || '网络错误'))
  } finally {
    batchGenerating.value = false
  }
}

/** V1.1 一致：当前选中的标签对象（用于显示标签编号 + 数量） */
const selectedLabel = computed(() => {
  if (!selectedLabelId.value) return null
  return labels.value.find(l => l.id === selectedLabelId.value) || null
})

/** V1.1 一致：Tab 切换时清空关联字段 */
const handleOpTypeChange = (t) => {
  addOpType.value = t
  addAreaName.value = ''
  if (t === 'mark') {
    quantityChange.value = ''
    reason.value = ''
    addPhotoBase64.value = null
  }
}

/** V1.1 一致：选择图片 → Base64 预览（限制 2MB） */
const handlePhotoChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 2MB')
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => { addPhotoBase64.value = ev.target?.result || null }
  reader.readAsDataURL(file)
  e.target.value = ''
}

/** V1.1 一致：关闭新增履历表单（清图 + 重置） */
const closeAddResume = () => {
  showAddResume.value = false
  addPhotoBase64.value = null
  addAreaName.value = ''
  addRemarks.value = ''
  quantityChange.value = ''
  reason.value = ''
}

const handleBatchVoid = async () => {
  if (!voidForm.value.reason) {
    ElMessage.warning('请填写作废原因')
    return
  }
  batchVoiding.value = true
  // 操作人从 userStore 推导
  const userStore = useUserStore()
  const u = userStore.userInfo || userStore.currentUser || {}
  const operatorName = u.realName || u.username || 'system'
  let success = 0, failed = 0
  for (const id of selectedIds.value) {
    try {
      // V1.1 一致：批量作废走 /plant-labels/:id/resumes，snake_case 字段
      await enhancedApiClient.post(`/plant-labels/${id}/resumes`, {
        operation_type: 'void',
        operation_date: todayLocal(),
        operator_name: operatorName,
        reason: voidForm.value.reason
      })
      success++
    } catch (e) {
      failed++
    }
  }
  batchVoiding.value = false
  showBatchVoid.value = false
  voidForm.value.reason = ''
  ElMessage.success(`作废完成：成功 ${success}，失败 ${failed}`)
  await loadLabels()
  if (selectedLabelId.value) await loadResumes()
}

const selectAllExportFields = () => {
  selectedExportFields.value = exportFieldOptions.map(f => f.value)
}
const deselectAllExportFields = () => {
  selectedExportFields.value = []
}

const handleConfirmExport = () => {
  let data
  if (exportScope.value === 'selected') {
    data = labels.value.filter(l => selectedIds.value.has(l.id))
  } else if (exportScope.value === 'filtered') {
    data = filteredLabels.value
  } else {
    data = labels.value
  }
  if (data.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const headers = selectedExportFields.value
  const rows = data.map(l => headers.map(h => {
    if (h === 'status') return statusLabel(l[h])
    return l[h] || ''
  }))
  // 带 BOM 的 HTML（保证 Excel 正确识别中文）
  const html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`
  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `种源标签_${props.seedSourceCode}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
  ElMessage.success('导出成功')
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    loadLabels()
  } else {
    selectedLabelId.value = null
    resumes.value = []
    selectedIds.value = new Set()
  }
})

onMounted(() => {
  if (props.visible) loadLabels()
})
</script>
