<template>
  <el-dialog
    v-model="visible"
    width="800px"
    :show-close="false"
    align-center
    append-to-body
    class="batch-detail-dialog"
  >
    <template #header>
      <div class="px-6 py-4 flex items-center justify-between" style="background:#059669">
        <h3 class="text-lg font-semibold text-white">批次详情</h3>
        <button class="text-white hover:bg-emerald-500 w-9 h-9 rounded-lg flex items-center justify-center transition-colors" @click="handleClose">
          <X class="w-5 h-5" />
        </button>
      </div>
    </template>

    <div v-if="batch" class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
      <!-- 标签页切换 -->
      <div class="flex border-b border-gray-200 mb-4">
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

      <template v-if="activeTab === 'info'">
        <!-- 3列布局 -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-xs text-gray-600 block mb-1">批次编号</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.batchCode }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">种植模式</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.plantingMode }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">作物名称</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.cropName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">作物品种</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.variety }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">种植区域</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.greenhouseName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">种植面积</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.plantingArea }} m²</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">开始时间</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.startDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">预计结束时间</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.expectedHarvestDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">负责人</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.responsiblePerson }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">目标产量</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.targetYield }} kg</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">当前状态</label>
            <p class="mt-1">
              <span :class="`inline-block px-3 py-2 rounded-lg text-sm font-medium ${batchStatusColors[batch.batchStatus || 'draft']}`">
                {{ batchStatusLabels[batch.batchStatus || 'draft'] }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">发布人</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.publisher || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">初次发布时间</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.publishDate || '-' }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-600 block mb-1">最后修改时间</label>
            <p class="text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{{ batch.lastModifyDate || '-' }}</p>
          </div>
        </div>

        <!-- Progress -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="font-medium text-gray-800 mb-3">生长进度</h4>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
              :style="{ width: `${stageProgress[batch.stage]}%` }"
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

      <template v-else>
        <!-- 关联记录标签页 -->
        <div class="py-4">
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
            <!-- 统计汇总 -->
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

            <!-- 关联记录列表 -->
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
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleClose">关闭</button>
        <button v-if="onViewWorkOrders" class="h-8 px-3 rounded-md text-xs inline-flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700" @click="onViewWorkOrders">查看工单</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  X, Link2, Leaf, Sprout, LayoutGrid, Package
} from 'lucide-vue-next'
import { batchStatusColors, batchStatusLabels, stageProgress } from '../constants'
import { getProductionPlanRelations } from '@/services/productionPlanService'

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

const stages = [
  { key: 'seedling', label: '苗期' },
  { key: 'vegetative', label: '生长期' },
  { key: 'flowering', label: '开花期' },
  { key: 'fruiting', label: '结果期' },
  { key: 'harvest', label: '采收期' },
]

watch(() => props.batch, async (batch) => {
  if (batch && activeTab.value === 'relations') {
    await loadRelations()
  }
})

watch(activeTab, async (tab) => {
  if (tab === 'relations' && props.batch) {
    await loadRelations()
  }
})

async function loadRelations() {
  if (!props.batch) return
  loadingRelations.value = true
  try {
    const result = await getProductionPlanRelations(props.batch.id, props.batch.batchCode)
    relations.value = result.relations
  } catch (error) {
    console.error('加载关联记录失败:', error)
    relations.value = []
  } finally {
    loadingRelations.value = false
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

<style scoped>
.batch-detail-dialog :deep(.el-dialog__header) {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}
.batch-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}
.batch-detail-dialog :deep(.el-dialog__footer) {
  padding: 0;
}
</style>
