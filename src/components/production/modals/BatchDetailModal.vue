<template>
  <ElModal
    v-model="visible"
    title="批次详情"
    size="xl"
    :show-submit="false"
    :show-cancel="false"
    @close="handleClose"
  >
    <div v-if="batch" class="space-y-4 modal-form-inputs">
      <!-- 标签页切换 -->
      <div class="flex border-b border-gray-200">
        <button
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'info'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = 'info'"
        >
          基本信息
        </button>
        <button
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1',
            activeTab === 'approvals'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = 'approvals'"
        >
          <FileCheck class="w-4 h-4" />
          审批记录
        </button>
        <button
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1',
            activeTab === 'relations'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = 'relations'"
        >
          <Link2 class="w-4 h-4" />
          关联记录
        </button>
      </div>

      <!-- 基本信息 Tab -->
      <template v-if="activeTab === 'info'">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">批次编号</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.batchCode }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">种植模式</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ plantingModeLabel || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">作物名称</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.cropName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">作物品种</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.variety }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">种植区域</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.greenhouseName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">种植面积</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.plantingArea }} {{ batch.plantingAreaUnit || 'm²' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">开始时间</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.startDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">预计结束时间</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.expectedHarvestDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">负责人</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.responsiblePerson }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">目标产量</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.targetYield }} {{ unitLabel }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">当前状态</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center">
              <span :class="`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${batchStatusColors[batch.batchStatus || 'draft']}`">
                {{ batchStatusLabels[batch.batchStatus || 'draft'] }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">发布人</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.publisher || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">初次发布时间</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.publishDate || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1 text-center">最后修改时间</label>
            <p class="h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center text-gray-700">{{ batch.lastModifyDate || '-' }}</p>
          </div>
        </div>

        <!-- Progress -->
        <div class="pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-3">生长进度</h4>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
              :style="{ width: `${stageProgress[batch.stage] || 0}%` }"
            />
          </div>
          <div class="flex justify-between mt-2">
            <span
              v-for="stage in stages"
              :key="stage.key"
              :class="[
                'text-xs',
                batch.stage === stage.key ? 'text-emerald-600 font-medium' : 'text-gray-500'
              ]"
            >
              {{ stage.label }}
            </span>
          </div>
        </div>
      </template>

      <!-- 审批记录 Tab（V1.1 风格） -->
      <template v-else-if="activeTab === 'approvals'">
        <div>
          <div v-if="loadingApprovals" class="text-center text-gray-500 py-4">加载中...</div>
          <div v-else-if="approvals.length === 0" class="text-center text-gray-400 py-4">暂无审批记录</div>
          <div v-else class="space-y-4">
            <div v-for="approval in approvals" :key="approval.id" class="bg-gray-50 rounded-lg p-4">
              <!-- 审批单概要 -->
              <div class="flex items-center gap-3 mb-3 text-sm flex-wrap">
                <span class="font-medium text-gray-700">{{ approval.title || approval.code }}</span>
                <span :class="getApprovalStatusClass(approval.status)" class="px-2 py-0.5 rounded text-xs">
                  {{ approvalStatusLabels[approval.status] || approval.status }}
                </span>
                <span class="text-gray-400">第{{ approval.currentStep }}/{{ approval.totalSteps }}步</span>
                <span class="text-gray-400">提交时间：{{ formatDateTime(approval.createdAt) }}</span>
              </div>
              <!-- 审批记录列表 -->
              <div v-if="approval.records && approval.records.length > 0" class="space-y-2 pl-4 border-l-2 border-gray-200">
                <div v-for="(record, idx) in approval.records" :key="record.id || idx" class="flex flex-wrap items-start gap-x-4 gap-y-1 text-sm">
                  <span class="text-gray-500 min-w-[140px]">{{ formatDateTime(record.actionTime) }}</span>
                  <span class="text-gray-700">{{ record.approverName }}</span>
                  <span :class="getActionTextClass(record.action)" class="font-medium">
                    {{ actionLabels[record.action] || record.action }}
                  </span>
                  <span v-if="record.comment" class="text-gray-500 w-full pl-32">理由：{{ record.comment }}</span>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 pl-4 border-l-2 border-gray-200">尚未有审批操作</div>
            </div>
          </div>
        </div>
      </template>

      <!-- 关联记录 Tab -->
      <template v-else>
        <div>
          <div v-if="loadingRelations" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            <span class="ml-3 text-gray-500">加载关联记录...</span>
          </div>
          <div v-else-if="relations.length === 0" class="text-center py-12 text-gray-500">
            <Link2 class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无关联记录</p>
            <p class="text-xs mt-1">该生产计划尚未关联种源、育苗、种植或采收记录</p>
          </div>
          <div v-else class="space-y-3">
            <div class="grid grid-cols-4 gap-3 mb-4">
              <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div class="flex items-center gap-2">
                  <Leaf class="w-4 h-4 text-amber-600" />
                  <span class="text-xs text-amber-700">种源</span>
                </div>
                <div class="text-xl font-bold text-amber-700 mt-1">
                  {{ relations.filter(r => r.type === 'seed_source').length }}
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                <div class="flex items-center gap-2">
                  <Sprout class="w-4 h-4 text-green-600" />
                  <span class="text-xs text-green-700">育苗</span>
                </div>
                <div class="text-xl font-bold text-green-700 mt-1">
                  {{ relations.filter(r => r.type === 'seedling').length }}
                </div>
              </div>
              <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div class="flex items-center gap-2">
                  <LayoutGrid class="w-4 h-4 text-blue-600" />
                  <span class="text-xs text-blue-700">种植</span>
                </div>
                <div class="text-xl font-bold text-blue-700 mt-1">
                  {{ relations.filter(r => r.type === 'planting').length }}
                </div>
              </div>
              <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div class="flex items-center gap-2">
                  <Package class="w-4 h-4 text-emerald-600" />
                  <span class="text-xs text-emerald-700">采收</span>
                </div>
                <div class="text-xl font-bold text-emerald-700 mt-1">
                  {{ relations.filter(r => r.type === 'harvest').length }}
                </div>
              </div>
            </div>

            <div class="space-y-2 max-h-80 overflow-y-auto">
              <div
                v-for="(relation, index) in relations"
                :key="`${relation.type}-${relation.businessId}-${index}`"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <component :is="getRelationIcon(relation.type)" class="w-4 h-4" :class="getRelationIconClass(relation.type)" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 truncate">
                      {{ getRelationTypeName(relation.type) }}
                    </span>
                    <span class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                      {{ relation.status }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    <span>编号: {{ relation.businessCode }}</span>
                    <span class="mx-2">|</span>
                    <span>数量: {{ relation.quantity }} {{ relation.unit }}</span>
                    <span class="mx-2">|</span>
                    <span>日期: {{ new Date(relation.relatedDate).toLocaleDateString('zh-CN') }}</span>
                  </div>
                </div>
                <span v-if="relation.instanceId" class="text-xs text-emerald-600 font-mono bg-emerald-50 px-2 py-1 rounded">
                  {{ relation.instanceId }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">关闭</button>
        <button v-if="onViewWorkOrders" class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="onViewWorkOrders">查看工单</button>
      </div>
    </template>
  </ElModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  Link2, Leaf, Sprout, LayoutGrid, Package, FileCheck
} from 'lucide-vue-next'
import { ElModal } from '@/components/ui'
import { batchStatusColors, batchStatusLabels, stageProgress, SEED_BREEDING_MODES, SEEDLING_MODES, PLANTING_MODES } from '../constants'
import { getProductionPlanRelations, getProductionPlanApprovals } from '@/services/productionPlanService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  batch: { type: Object, default: null },
  onViewWorkOrders: { type: Function, default: null },
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const activeTab = ref('info')
const relations = ref([])
const loadingRelations = ref(false)
// 审批记录（V1.1 风格）
const approvals = ref([])
const loadingApprovals = ref(false)

const stages = [
  { key: 'seedling', label: '苗期' },
  { key: 'vegetative', label: '生长期' },
  { key: 'flowering', label: '开花期' },
  { key: 'fruiting', label: '结果期' },
  { key: 'harvest', label: '采收期' },
]

// 审批操作类型中文映射
const actionLabels = {
  approve: '通过',
  reject: '拒绝',
  partially_approve: '部分通过',
  cancel: '撤销',
}

// 审批状态中文映射
const approvalStatusLabels = {
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已撤销',
  partially_approved: '部分通过',
}

// 种植模式中文映射
const allModes = [...SEED_BREEDING_MODES, ...SEEDLING_MODES, ...PLANTING_MODES]
const modeMap = Object.fromEntries(allModes.map(m => [m.value, m.label]))
const plantingModeLabel = computed(() => {
  if (!props.batch?.plantingMode) return ''
  return String(props.batch.plantingMode)
    .split(',')
    .map(v => modeMap[v.trim()] || v.trim())
    .filter(Boolean)
    .join('、')
})

// 单位中文映射
const unitLabels = {
  kg: '公斤',
  t: '吨',
  '株': '株',
  '粒': '粒',
  '袋': '袋',
  'm²': '平方米',
  '亩': '亩',
}
const unitLabel = computed(() => unitLabels[props.batch?.unit] || props.batch?.unit || '公斤')

// 格式化时间
function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getApprovalStatusClass(status) {
  if (status === 'approved') return 'bg-green-100 text-green-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

function getActionTextClass(action) {
  if (action === 'approve') return 'text-green-600'
  if (action === 'reject') return 'text-red-600'
  return 'text-gray-600'
}

watch(() => props.batch, async (batch) => {
  if (batch) {
    // 默认加载审批记录和关联记录（按需触发）
    if (activeTab.value === 'relations' && relations.value.length === 0) {
      await loadRelations()
    }
    if (activeTab.value === 'approvals' && approvals.value.length === 0) {
      await loadApprovals()
    }
  }
})

watch(activeTab, async (tab) => {
  if (!props.batch) return
  if (tab === 'relations' && relations.value.length === 0) {
    await loadRelations()
  } else if (tab === 'approvals' && approvals.value.length === 0) {
    await loadApprovals()
  }
})

async function loadRelations() {
  if (!props.batch) return
  loadingRelations.value = true
  try {
    const result = await getProductionPlanRelations(props.batch.id, props.batch.batchCode)
    relations.value = result.relations || []
  } catch (error) {
    console.error('加载关联记录失败:', error)
    relations.value = []
  } finally {
    loadingRelations.value = false
  }
}

async function loadApprovals() {
  if (!props.batch) return
  loadingApprovals.value = true
  try {
    const result = await getProductionPlanApprovals(props.batch.id)
    approvals.value = result || []
  } catch (error) {
    console.error('加载审批记录失败:', error)
    approvals.value = []
  } finally {
    loadingApprovals.value = false
  }
}

function getRelationIcon(type) {
  switch (type) {
    case 'seed_source': return Leaf
    case 'seedling': return Sprout
    case 'planting': return LayoutGrid
    case 'harvest': return Package
    default: return Link2
  }
}

function getRelationIconClass(type) {
  switch (type) {
    case 'seed_source': return 'text-amber-600'
    case 'seedling': return 'text-green-600'
    case 'planting': return 'text-blue-600'
    case 'harvest': return 'text-emerald-600'
    default: return 'text-gray-600'
  }
}

function getRelationTypeName(type) {
  switch (type) {
    case 'seed_source': return '种源'
    case 'seedling': return '育苗'
    case 'planting': return '种植'
    case 'harvest': return '采收'
    default: return '其他'
  }
}

function handleClose() {
  emit('close')
}
</script>
