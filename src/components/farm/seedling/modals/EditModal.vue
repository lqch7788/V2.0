<!--
  编辑育苗弹窗（完全重写 - 1:1 对齐 V1.1 EditModal.tsx）
-->
<template>
  <SimpleModal
    :visible="visible"
    title="编辑育苗"
    width="900px"
    :show-footer="false"
    @close="$emit('close')"
  >

    <div class="space-y-4">
      <!-- 繁殖模式 banner -->
      <div class="col-span-2 mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span class="text-sm text-blue-700">繁殖模式：<strong>{{ formData.propagationMode === 'one_to_many' ? '1:多' : '1:1' }}</strong>（建档后锁定，不可修改）</span>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- 关联种源 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-900 mb-1">关联种源</label>
          <select v-model="formData.sourceId" @change="handleSourceChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option v-for="s in seedSources" :key="s.id" :value="s.id">{{ s.seedCode }} - {{ s.cropName }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
          <input :model-value="formData.sourceType || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
          <input :model-value="formData.supplierName || '请先选择种源'" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
        </div>

        <!-- 品种路径 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">品种路径</label>
          <div class="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded text-sm">
            <span class="text-gray-400">{{ formData.categoryName || '-' }}</span>
            <span class="text-gray-300">-</span>
            <span class="text-gray-700">{{ formData.typeName || '-' }}</span>
            <span class="text-gray-300">-</span>
            <span class="text-gray-700">{{ formData.varietyName || '-' }}</span>
            <span class="text-gray-300">-</span>
            <span class="text-gray-900 font-medium">{{ formData.subVarietyName || '-' }}</span>
          </div>
        </div>

        <!-- 育苗方式 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">育苗方式</label>
          <select v-model="formData.seedlingType" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option v-for="t in seedlingTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <!-- 温室场地 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">温室场地</label>
          <select v-model="formData.siteId" @change="handleSiteChange" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option v-for="s in sites" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <!-- 开始日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">开始日期</label>
          <input v-model="formData.startDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 预计结束日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">预计结束日期</label>
          <input v-model="formData.expectedEndDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 实际结束日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">实际结束日期</label>
          <input v-model="formData.endDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 目标成苗率 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">目标成苗率 (%)</label>
          <input v-model.number="formData.targetSurvivalRate" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 目标成苗数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">目标成苗数量</label>
          <input v-model.number="formData.targetSurvivalCount" type="number" min="0" placeholder="请输入目标成苗数量" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 负责人 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">负责人</label>
          <input v-model="formData.chargePerson" placeholder="请输入" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
        <!-- 单位 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">单位</label>
          <select v-model="formData.unit" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="株">株</option><option value="粒">粒</option><option value="颗">颗</option><option value="盆">盆</option>
          </select>
        </div>
        <!-- 品质等级 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">品质等级</label>
          <select v-model="formData.qualityGrade" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="">请选择</option>
            <option value="A级">A级</option><option value="B级">B级</option><option value="C级">C级</option>
          </select>
        </div>
        <!-- 是否结束 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">是否结束</label>
          <select :value="formData.isFinished ? 'yes' : 'no'" @change="formData.isFinished = $event.target.value === 'yes'" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm">
            <option value="no">否</option>
            <option value="yes">是</option>
          </select>
        </div>
        <!-- 育苗工时 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">育苗工时（小时）</label>
          <input v-model.number="formData.workHours" type="number" min="0" step="0.5" placeholder="请输入" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>

        <!-- 数量统计（自动累加，可手动纠错） — 对齐 V1.1 EditModal L487-539 -->
        <div class="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
          <div class="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 6-6"/></svg>
            <span class="text-sm font-semibold text-amber-900">数量统计（自动累加，可手动纠错）</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">母株累计损耗</label>
              <input v-model.number="formData.motherLossCount" type="number" min="0" title="从每日记录累加" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">小苗累计产出</label>
              <input v-model.number="formData.expandedPlantCount" type="number" min="0" title="从每日记录累加" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">小苗累计损耗</label>
              <input v-model.number="formData.seedlingLossCount" type="number" min="0" title="从每日记录累加" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">采收入库累计</label>
              <input v-model.number="formData.harvestStockedCount" type="number" min="0" title="从每日记录累加" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">补苗累计</label>
              <input v-model.number="formData.replantCount" type="number" min="0" title="从每日记录累加" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
          </div>
          <p class="text-xs text-gray-600 mt-2">
            母株池剩余 = {{ Math.max(0, (formData.motherPlantCount || 0) - (formData.motherLossCount || 0) + (formData.replantCount || 0)).toLocaleString() }} 株 | 小苗池剩余 = {{ Math.max(0, (formData.expandedPlantCount || 0) - (formData.seedlingLossCount || 0) - (formData.harvestStockedCount || 0)).toLocaleString() }} 株
          </p>
        </div>

        <!-- 备注 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-900 mb-1">备注</label>
          <textarea v-model="formData.remarks" rows="2" placeholder="请输入备注信息" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button type="button" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" @click="$emit('close')">取消</button>
        <button type="button" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </template>
  </SimpleModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SimpleModal from '@/components/common/SimpleModal.vue'
import { useSeedlingStore } from '@/stores/modules/seedling'
import { useSeedSourceStore } from '@/stores/modules/seedSource'

const props = defineProps({
  visible: Boolean,
  record: Object,
  cropVarietyOptions: { type: Array, default: () => [] },
  seedlingTypes: { type: Array, default: () => [] },
  sites: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()
const submitting = ref(false)
const seedSources = ref([])

const formData = ref({
  sourceId: '', sourceCode: '', sourceType: '', supplierName: '',
  selectedCropCode: '', cropName: '', cropVariety: '',
  categoryName: '', typeName: '', varietyName: '', subVarietyName: '',
  seedlingType: '', siteId: '', siteName: '',
  startDate: '', expectedEndDate: '', endDate: '',
  initialCount: 0, survivalCount: 0, plantedCount: 0,
  calculateMode: 'single', motherPlantCount: 0, propagationMultiple: 1,
  customMultiple: 0, theoreticalYield: 0, targetSurvivalRate: 90,
  targetSurvivalCount: 0, remarks: '', qualityGrade: '',
  isFinished: false, chargePerson: '', planType: 'routine',
  productionPlanId: '', workHours: 0, propagationMode: 'one_to_one',
  unit: '株', motherLossCount: 0, expandedPlantCount: 0,
  seedlingLossCount: 0, harvestStockedCount: 0, replantCount: 0
})

// 监听 record 变化填充表单
watch(() => props.record, (record) => {
  if (record) {
    formData.value = {
      sourceId: record.sourceId || '',
      sourceCode: record.sourceCode || '',
      selectedCropCode: record.cropCode || '',
      cropName: record.cropName || '',
      cropVariety: record.cropVariety || '',
      cropCode: record.cropCode || '',
      categoryName: record.categoryName || '',
      typeName: record.typeName || '',
      varietyName: record.varietyName || '',
      subVarietyName: record.subVarietyName || '',
      seedlingType: record.seedlingType || '',
      siteId: record.siteId || '',
      siteName: record.siteName || '',
      startDate: record.startDate || '',
      expectedEndDate: record.expectedEndDate || '',
      endDate: record.endDate || '',
      initialCount: record.initialCount || 0,
      survivalCount: record.survivalCount || 0,
      plantedCount: record.plantedCount || 0,
      remarks: record.remarks || '',
      qualityGrade: record.qualityGrade || '',
      isFinished: record.isFinished || false,
      chargePerson: record.chargePerson || '',
      targetSurvivalCount: record.targetSurvivalCount || 0,
      workHours: record.workHours || 0,
      propagationMode: record.propagationMode || 'one_to_one',
      unit: record.unit || '株',
      motherLossCount: record.motherLossCount || 0,
      expandedPlantCount: record.expandedPlantCount || 0,
      seedlingLossCount: record.seedlingLossCount || 0,
      harvestStockedCount: record.harvestStockedCount || 0,
      replantCount: record.replantCount || 0
    }
  }
}, { immediate: true, deep: true })

const handleSourceChange = () => {
  const source = seedSources.value.find(s => s.id === formData.value.sourceId)
  if (source) {
    formData.value.sourceCode = source.seedCode || ''
    formData.value.cropName = source.cropName || ''
    formData.value.cropVariety = source.cropVariety || ''
    formData.value.cropCode = source.cropCode || ''
  }
}

const handleSiteChange = () => {
  const site = props.sites.find(s => s.value === formData.value.siteId)
  formData.value.siteName = site?.label || ''
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const initialCount = formData.value.initialCount
    const survivalCount = formData.value.survivalCount
    const survivalRate = initialCount > 0 ? Math.round((survivalCount / initialCount) * 100) : 0
    const lossCount = initialCount - survivalCount
    const lossRate = initialCount > 0 ? Math.round((lossCount / initialCount) * 100) : 0

    await seedlingStore.updateItem(props.record.id, {
      source_id: formData.value.sourceId,
      source_name: formData.value.sourceCode,
      crop_name: formData.value.cropName,
      crop_variety: formData.value.cropVariety,
      crop_code: formData.value.cropCode,
      seedling_type: formData.value.seedlingType,
      greenhouse_name: formData.value.siteName,
      area_name: formData.value.siteId,
      seedling_date: formData.value.startDate,
      expected_finish_date: formData.value.expectedEndDate,
      end_date: formData.value.endDate || undefined,
      seedling_quantity: formData.value.initialCount,
      survival_quantity: formData.value.survivalCount,
      planted_quantity: formData.value.plantedCount,
      survival_rate: survivalRate,
      loss_quantity: lossCount,
      loss_rate: lossRate,
      remarks: formData.value.remarks,
      quality_grade: formData.value.qualityGrade,
      is_finished: formData.value.isFinished,
      charge_person: formData.value.chargePerson || undefined,
      target_survival_count: formData.value.targetSurvivalCount || undefined,
      work_hours: formData.value.workHours || undefined
    })

    ElMessage.success('更新成功')
    emit('success')
  } catch (error) {
    console.error('[EditModal] error:', error)
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}

// 加载种源
watch(() => props.visible, async (val) => {
  if (val) {
    await seedSourceStore.loadItems()
    seedSources.value = seedSourceStore.items
  }
})
</script>
