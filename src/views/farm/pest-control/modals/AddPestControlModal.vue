<!--
  新增病虫害防治记录弹窗（对齐 V1.1 AddPestControlModal.tsx L1-1224 简化版）
  字段：sprayTime / operatorName / cropName / greenhouseName /
       targetPests[] / pesticidePool[] / fertilizerPool[] / description
  POST 提交：camelCase → snake_case
-->
<template>
  <el-dialog :model-value="visible" title="新增防治记录" width="900px" :close-on-click-modal="false" @update:model-value="(v) => v ? null : handleClose()" @close="handleClose">
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <!-- 基本信息 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">基本信息</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">记录编号</label>
            <div class="flex gap-2">
              <el-input v-model="formData.recordCode" placeholder="点击生成" />
              <el-button type="primary" plain @click="handleGenerateCode">生成</el-button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">防治日期 <span class="text-red-500">*</span></label>
            <el-date-picker v-model="formData.sprayTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" class="w-full" placeholder="选择日期时间" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">操作人</label>
            <el-input v-model="formData.operatorName" placeholder="操作员姓名" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">作物名称 <span class="text-red-500">*</span></label>
            <el-input v-model="formData.cropName" placeholder="作物名称（可多个，逗号分隔）" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">防治区域</label>
            <el-input v-model="formData.greenhouseName" placeholder="温室 / 大棚 / 地块" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">施用方法</label>
            <el-select v-model="formData.applicationMethod" class="w-full" clearable placeholder="选择方法">
              <el-option label="喷雾" value="spray" />
              <el-option label="喷粉" value="dust" />
              <el-option label="灌根" value="soil_drench" />
              <el-option label="熏蒸" value="fumigation" />
              <el-option label="拌种" value="seed_treatment" />
              <el-option label="滴灌" value="irrigation" />
              <el-option label="毒饵" value="bait" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- 目标病虫害 -->
      <section>
        <h4 class="text-sm font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200">目标病虫害</h4>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="(t, i) in targetPestList"
            :key="i"
            :class="['flex items-center gap-1 px-3 py-1.5 rounded border cursor-pointer text-sm transition-colors',
              formData.targetPest.includes(t.name)
                ? 'bg-amber-50 border-amber-500 text-amber-700 font-medium'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400']"
          >
            <input type="checkbox" class="w-3.5 h-3.5" :checked="formData.targetPest.includes(t.name)" @change="toggleTargetPest(t.name, $event.target.checked)" />
            {{ t.name }}
          </label>
        </div>
      </section>

      <!-- 药剂池 -->
      <section>
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-900">药剂池（至少 1 项）</h4>
          <el-button type="primary" plain size="small" @click="addPesticide">+ 添加药剂</el-button>
        </div>
        <div v-for="(p, idx) in formData.pesticideList" :key="idx" class="border border-gray-200 rounded p-3 mb-2">
          <div class="grid grid-cols-4 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">药剂名称</label>
              <el-select v-model="p.pesticideId" filterable clearable class="w-full" placeholder="选择药剂" @change="handlePesticideSelect(idx, $event)">
                <el-option v-for="opt in pesticides" :key="opt.id" :label="opt.pesticideName" :value="opt.id" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">类型</label>
              <el-input :model-value="(p.pesticideTypes || []).join('/')" placeholder="杀虫剂/杀菌剂" readonly />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">含量/规格</label>
              <el-input v-model="p.specContent" placeholder="含量规格" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">生产厂家</label>
              <el-input v-model="p.manufacturer" placeholder="厂家" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">用药量</label>
              <el-input-number v-model="p.dosage" :min="0" :precision="2" class="!w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
              <el-input v-model="p.unit" placeholder="g/ml/L" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">稀释比例</label>
              <el-input v-model="p.dilutionRatio" placeholder="如 1:1000" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">施用方法</label>
              <el-select v-model="p.applicationMethod" class="w-full" clearable placeholder="选择方法">
                <el-option label="喷雾" value="spray" /><el-option label="喷粉" value="dust" />
                <el-option label="灌根" value="soil_drench" /><el-option label="熏蒸" value="fumigation" />
                <el-option label="拌种" value="seed_treatment" /><el-option label="滴灌" value="irrigation" />
                <el-option label="毒饵" value="bait" />
              </el-select>
            </div>
            <div class="flex items-end justify-end">
              <el-button type="danger" link size="small" @click="formData.pesticideList.splice(idx, 1)">删除</el-button>
            </div>
          </div>
          <div class="mt-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">备注</label>
            <el-input v-model="p.remarks" placeholder="选填" size="small" />
          </div>
        </div>
      </section>

      <!-- 肥料池（叶面肥） -->
      <section>
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
          <h4 class="text-sm font-semibold text-gray-900">叶面肥联用（可选）</h4>
          <div class="flex items-center gap-2">
            <el-checkbox v-model="formData.useLeafFertilizer">是否联用</el-checkbox>
            <el-button v-if="formData.useLeafFertilizer" type="primary" plain size="small" @click="addFertilizer">+ 添加肥料</el-button>
          </div>
        </div>
        <template v-if="formData.useLeafFertilizer">
        <div v-for="(f, idx) in formData.leafFertilizerList" :key="idx" class="border border-gray-200 rounded p-3 mb-2">
          <div class="grid grid-cols-4 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">肥料名称</label>
              <el-input v-model="f.fertilizerName" placeholder="肥料名称" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">用量</label>
              <el-input-number v-model="f.dosage" :min="0" :precision="2" class="!w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">单位</label>
              <el-input v-model="f.unit" placeholder="g/ml/L" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">稀释</label>
              <el-input v-model="f.dilutionRatio" placeholder="1:1000" />
            </div>
          </div>
          <div class="flex justify-end mt-1">
            <el-button type="danger" link size="small" @click="formData.leafFertilizerList.splice(idx, 1)">删除</el-button>
          </div>
        </div>
        </template>
      </section>

      <!-- 备注 -->
      <section>
        <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="可选" />
      </section>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePestControlStore } from '@/stores/modules/pestControl'
import { usePestDiseaseDictStore } from '@/stores/modules/pestDiseaseDict'
import { usePesticideLibraryStore } from '@/stores/modules/pesticideLibrary'
import { currentTimeLocal } from '@/lib/dateUtils'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'success'])

const pestStore = usePestControlStore()
const diseaseStore = usePestDiseaseDictStore()
const pesticideStore = usePesticideLibraryStore()

const submitting = ref(false)
const pesticides = ref([])
const targetPestList = ref([])

const INITIAL_FORM = () => ({
  recordCode: '',
  sprayTime: currentTimeLocal(),
  operatorName: localStorage.getItem('username') || '管理员',
  cropName: '',
  greenhouseName: '',
  applicationMethod: '',
  targetPest: [],
  pesticideList: [{
    pesticideId: '', pesticideName: '', pesticideTypes: [],
    specId: '', specContent: '', formulation: '', manufacturer: '', brandName: '',
    dosage: 0, unit: '', dilutionRatio: '', applicationMethod: '', remarks: ''
  }],
  useLeafFertilizer: false,
  leafFertilizerList: [],
  description: ''
})

const formData = ref(INITIAL_FORM())

watch(() => props.visible, async (val) => {
  if (val) {
    formData.value = INITIAL_FORM()
    // 加载字典数据
    if (diseaseStore.items.length === 0) await diseaseStore.loadData()
    targetPestList.value = diseaseStore.items
    if (pesticideStore.items.length === 0) await pesticideStore.fetchItems()
    pesticides.value = pesticideStore.items
    handleGenerateCode()
  }
})

const handleGenerateCode = async () => {
  formData.value.recordCode = await pestStore.generateCode()
}

const toggleTargetPest = (name, checked) => {
  if (checked) {
    if (!formData.value.targetPest.includes(name)) formData.value.targetPest.push(name)
  } else {
    formData.value.targetPest = formData.value.targetPest.filter(t => t !== name)
  }
}

const addPesticide = () => {
  formData.value.pesticideList.push({
    pesticideId: '', pesticideName: '', pesticideTypes: [],
    specId: '', specContent: '', formulation: '', manufacturer: '', brandName: '',
    dosage: 0, unit: '', dilutionRatio: '', applicationMethod: '', remarks: ''
  })
}

const handlePesticideSelect = (idx, id) => {
  const p = pesticides.value.find(x => x.id === id)
  if (p) {
    formData.value.pesticideList[idx].pesticideName = p.pesticideName
    // V1.1 PesticidePoolItem 用 pesticideTypes[] 数组（非 controlType 字符串）
    formData.value.pesticideList[idx].pesticideTypes = Array.isArray(p.pesticideTypes) ? p.pesticideTypes : (p.controlType ? [p.controlType] : [])
    formData.value.pesticideList[idx].pesticideCode = p.pesticideCode || ''
    // 自动用规格默认值
    formData.value.pesticideList[idx].specContent = p.specContent || ''
    formData.value.pesticideList[idx].manufacturer = p.manufacturer || ''
    formData.value.pesticideList[idx].dosage = p.suggestedDosage ?? 0
    formData.value.pesticideList[idx].unit = p.dosageUnit || ''
    formData.value.pesticideList[idx].dilutionRatio = p.suggestedRatio || ''
  }
}

const addFertilizer = () => {
  formData.value.leafFertilizerList.push({ fertilizerName: '', dosage: 0, unit: '', dilutionRatio: '' })
}

const handleSubmit = async () => {
  if (!formData.value.sprayTime) { ElMessage.warning('请选择防治日期'); return }
  if (!formData.value.cropName) { ElMessage.warning('请填写作物名称'); return }
  if (formData.value.pesticideList.length === 0) { ElMessage.warning('请至少添加 1 个药剂'); return }

  submitting.value = true
  try {
    // V1.1 对齐：合并所有药剂的 pesticideTypes 数组去重
    const allPesticideTypes = [...new Set(
      formData.value.pesticideList.flatMap(p => p.pesticideTypes || []).filter(Boolean)
    )]
    // 取第一个药剂作为记录级兼容字段
    const first = formData.value.pesticideList[0]
    // 序列化 pesticideList 为 JSON
    const pesticideListJson = JSON.stringify(
      formData.value.pesticideList.map(it => ({
        name: it.pesticideName,
        pesticideId: it.pesticideId,
        pesticideCode: it.pesticideCode,
        specId: it.specId,
        specContent: it.specContent,
        formulation: it.formulation,
        manufacturer: it.manufacturer,
        brandName: it.brandName,
        pesticideTypes: it.pesticideTypes || [],
        dosage: it.dosage,
        unit: it.unit,
        ratio: it.dilutionRatio,
        applicationMethod: it.applicationMethod,
        remarks: it.remarks
      }))
    )

    const payload = {
      ...formData.value,
      pesticideList: pesticideListJson,
      pesticideType: allPesticideTypes,
      // V1.1 兼容字段（取池中第一个药剂，覆盖 formData 中的同名字段）
      pesticideName: first?.pesticideName,
      dosage: first?.dosage ? Number(first.dosage) : undefined,
      dosageUnit: first?.unit,
      dilutionRatio: first?.dilutionRatio,
      applicationMethod: first?.applicationMethod,
      // targetPest 序列化为 JSON 数组
      targetPest: formData.value.targetPest.length > 0 ? JSON.stringify(formData.value.targetPest) : undefined,
      // 肥料池序列化为 JSON
      useLeafFertilizer: formData.value.leafFertilizerList.length > 0 ? 'yes' : 'no',
      leafFertilizerList: formData.value.leafFertilizerList.length > 0 ? JSON.stringify(formData.value.leafFertilizerList) : null,
      leafFertilizerName: formData.value.leafFertilizerList[0]?.fertilizerName,
      leafFertilizerDosage: formData.value.leafFertilizerList[0]?.dosage ? Number(formData.value.leafFertilizerList[0].dosage) : undefined,
      leafFertilizerUnit: formData.value.leafFertilizerList[0]?.unit,
      // 兼容空列表字段
      bioAgentList: JSON.stringify([]),
      equipmentList: JSON.stringify([])
    }
    delete payload.pesticideList_raw  // 清理 V2.0 临时字段
    await pestStore.addItem(payload)
    ElMessage.success('新增防治记录成功')
    emit('success')
    handleClose()
  } catch (err) {
    ElMessage.error('新增失败：' + (err.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  formData.value = INITIAL_FORM()
  emit('close')
}
</script>