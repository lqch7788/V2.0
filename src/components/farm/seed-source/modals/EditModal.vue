<!--
  种源编辑弹窗（V1.1 1:1 迁移版）
  V1.1源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\EditModal.tsx

  V1.1 关键逻辑：
  1. 使用 el-dialog + v-dialog-draggable（对齐 V1.1 UnifiedModal 的可拖拽行为）
  2. 必填校验：other 必填 remarks；external_purchase 必填 supplierId；cropCode 必填
  3. status 改为实时计算（不传 status 字段给后端）
  4. 数量只读（累计值由入库/调拨动作累加）
  5. 种源类型→供应商类型级联过滤（seed/seedling/... → SP；other → 全部）
  6. 字段顺序：批号→作物→类型→来源→供应商→日期→数量+单位→单价→图片→备注
-->
<template>
  <el-dialog
    :model-value="visible"
    title="编辑种源"
    width="1170px"
    height="600px"
    top="5vh"
    :close-on-click-modal="true"
    :draggable="true"
    v-dialog-draggable="'edit-seed-source'"
    v-dialog-resizable
    v-dialog-maximizable
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义绿色渐变 header 1:1 对齐 V1.1 UnifiedModal 默认 header -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">编辑种源</h3>
        <button
          type="button"
          class="text-white hover:bg-emerald-500 rounded p-1 transition-colors"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="20" />
        </button>
      </div>
    </template>

    <el-form :model="form" label-width="110px" ref="formRef">
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <!-- 种源批号 - 只读显示（V1.1 L252-260） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">种源批号</label>
          <el-input
            :model-value="record?.seedCode || ''"
            readonly
            class="bg-gray-50 font-mono"
          />
        </div>

        <!-- 作物选择 - V1.1 CropCodeSelector（4级联动） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            <span class="text-red-500">*</span> 作物选择
          </label>
          <CropCodeSelector
            :model-value="form.cropCode"
            @update:model-value="(val) => { form.cropCode = val }"
            @change="handleCropCodeChange"
            placeholder="搜索或选择作物品种..."
            :show-full-path="true"
          />
          <!-- 显示选中作物的详细信息 -->
          <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div class="text-emerald-700">
              {{ selectedCrop.categoryName }} &gt; {{ selectedCrop.typeName }} &gt; {{ selectedCrop.varietyName }}
              <span v-if="selectedCrop.subVariety1Name"> &gt; {{ selectedCrop.subVariety1Name }}</span>
            </div>
          </div>
        </div>

        <!-- 种源类型（V1.1 L286-308） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">种源类型</label>
          <el-select v-model="form.sourceType" placeholder="选择种源类型" class="w-full" @change="handleSourceTypeChange">
            <el-option label="种子" value="seed" />
            <el-option label="种苗/实生苗" value="seedling" />
            <el-option label="扦插苗" value="cutting" />
            <el-option label="嫁接苗" value="grafting" />
            <el-option label="组培苗" value="tissue_culture" />
            <el-option label="分株苗" value="split" />
            <el-option label="种球/球根" value="bulb" />
            <el-option label="其他" value="other" />
          </el-select>
          <!-- 选择"其他"时显示补充说明输入框 -->
          <div v-if="form.sourceType === 'other'" class="mt-2">
            <el-input
              v-model="form.remarks"
              type="text"
              placeholder="请输入其他种源类型的详细说明"
              class="remarks-other"
            />
            <p class="mt-1 text-xs text-red-500">必填：选择"其他"时必须填写详细说明</p>
          </div>
        </div>

        <!-- 来源途径（V1.1 L311-323） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">来源途径</label>
          <el-select v-model="form.sourceOrigin" placeholder="选择来源途径" class="w-full">
            <el-option label="外部采购" value="external_purchase" />
            <el-option label="自产" value="self_produced" />
            <el-option label="其他" value="other" />
          </el-select>
          <p v-if="form.sourceOrigin === 'other'" class="mt-1 text-xs text-gray-400">请在备注中说明具体来源</p>
        </div>

        <!-- 供应商（V1.1 L326-359） - 外部采购时必填，其他来源可选 -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            <span v-if="form.sourceOrigin === 'external_purchase'" class="text-red-500">*</span>
            {{ form.sourceOrigin === 'external_purchase' ? '供应商' : '供应商（可选）' }}
          </label>
          <el-select
            v-model="form.supplierId"
            placeholder="请选择"
            class="w-full"
            filterable
            @change="handleSupplierChange"
          >
            <el-option
              v-for="item in filteredSuppliers"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
            <!-- 内部自留时：显示占位项 -->
            <el-option
              v-if="form.sourceOrigin !== 'external_purchase'"
              value="__none__"
              label="内部自留/无需填写"
            />
            <template #empty>
              <div v-if="form.sourceOrigin === 'external_purchase'" class="px-4 py-2 text-gray-500 text-sm">
                当前种源类型下无匹配供应商，请切换种源类型
              </div>
              <div v-else class="px-4 py-2 text-gray-500 text-sm">
                内部自留/无需填写
              </div>
            </template>
          </el-select>
        </div>

        <!-- 采购/入库日期 - 根据来源途径动态显示标签（V1.1 L362-370） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            {{ form.sourceOrigin === 'external_purchase' ? '采购日期' : '入库日期' }}
          </label>
          <el-date-picker
            v-model="form.purchaseDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 2026-07-01 P0-4：登记数量改为只读（累计值由入库/调拨动作累加）（V1.1 L373-389） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">登记数量（累计）</label>
          <div class="grid grid-cols-2 gap-2">
            <div class="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 flex items-center">
              {{ formatNumber(record?.quantity) }}
            </div>
            <el-select v-model="form.unit" placeholder="单位" class="w-full">
              <el-option label="粒" value="粒" />
              <el-option label="株" value="株" />
              <el-option label="kg" value="kg" />
              <el-option label="g" value="g" />
              <el-option label="袋" value="袋" />
            </el-select>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ⚠️ 累计数量由入库/调拨操作累加，不可直接修改。如需调整，请用"调拨入库"或"商品种源入库"。
          </div>
        </div>

        <!-- 单价（V1.1 L391-399） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">单价（元）</label>
          <el-input-number
            v-model="form.unitPrice"
            :min="0"
            class="w-full"
            style="width: 100%"
          />
        </div>

        <!-- 图片上传 - 占两列（V1.1 L401-454） -->
        <div class="col-span-2">
          <label class="text-gray-900 text-sm font-medium">图片上传</label>
          <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 hover:border-emerald-500 transition-colors">
            <!-- 已上传的图片预览 -->
            <div v-if="form.pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
              <div
                v-for="(pic, index) in form.pictures"
                :key="index"
                class="relative group"
              >
                <img
                  :src="pic"
                  :alt="`预览${index + 1}`"
                  class="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  @click="handleRemovePicture(index)"
                  class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  aria-label="删除图片"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>
            <!-- 上传按钮 -->
            <label class="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 rounded-lg py-4">
              <el-icon :size="32" class="text-gray-400 mb-2"><Upload /></el-icon>
              <span class="text-sm text-gray-500">点击上传图片</span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
        </div>

        <!-- 备注 - 占两列（V1.1 L456-466） -->
        <div class="col-span-2">
          <label class="text-gray-900 text-sm font-medium">备注</label>
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            :class="{ 'remarks-other-textarea': form.sourceType === 'other' }"
          />
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Upload } from '@element-plus/icons-vue'
import { X } from 'lucide-vue-next'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { enhancedApiClient } from '@/lib/apiClient'
import CropCodeSelector from '@/components/farm/common/CropCodeSelector.vue'

/** 种源类型 → 供应商类型 级联映射（V1.1 L27-36） */
const SOURCE_TYPE_TO_SUPPLIER_TYPE = {
  seed: 'SP',
  seedling: 'SP',
  cutting: 'SP',
  grafting: 'SP',
  tissue_culture: 'SP',
  split: 'SP',
  bulb: 'SP',
  other: null
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: {
    type: Object,
    default: () => ({})
  },
  // V1.1 L34：父组件传入供应商列表（可为空，内部兜底加载）
  suppliers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()

// 当前用户（操作人，V1.1 L51 useAuthStore.currentUser 等价于 V2.0 useUserStore().userInfo）
const currentUser = computed(() => {
  const u = userStore.userInfo
  if (u) {
    return {
      id: u.id || u.oid,
      name: u.realName || u.username || '',
      department: u.department || u.orgOid || '生产部',
    }
  }
  if (userStore.users && userStore.users.length > 0) {
    const first = userStore.users[0]
    return {
      id: first.id || first.oid,
      name: first.realName || first.name || first.username || '',
      department: first.department || first.orgOid || '生产部',
    }
  }
  return null
})

const formRef = ref()
const submitting = ref(false)

// 选中作物信息
const selectedCrop = ref(null)

// 供应商列表（V1.1 传入 props，这里需要单独加载）
const supplierList = ref([])

/** 过滤后的供应商（V1.1 L117-125）：根据种源类型级联过滤 */
const filteredSuppliers = computed(() => {
  const targetType = SOURCE_TYPE_TO_SUPPLIER_TYPE[form.value.sourceType]
  if (!targetType) {
    // null = 展示全部（V1.1 L119）
    return supplierList.value
  }
  // 过滤 supplierType === targetType（V1.1 L121-124）
  return supplierList.value.filter(s => s.supplierType === targetType)
})

// 表单初始值（V1.1 L54-94 buildFormData）
const buildInitialForm = (record) => ({
  sourceType: record?.sourceType || '',
  sourceOrigin: record?.sourceOrigin || '',
  cropCategory: record?.cropCategory || '',
  typeName: record?.typeName || '',
  varietyName: record?.varietyName || '',
  cropName: record?.cropName || '',
  cropVariety: record?.cropVariety || '',
  cropCode: record?.cropCode || '',
  supplierId: record?.supplierId || '',
  supplierName: record?.supplierName || '',
  purchaseDate: record?.purchaseDate || '',
  // quantity 是累计值，编辑时不可改
  unit: record?.unit || '',
  unitPrice: record?.unitPrice ?? 0,
  pictures: parsePictures(record?.pictures),
  remarks: record?.remarks || '',
  // 繁殖途径字段（V1.1 L86-103 P2 #9 修复）
  propagationType: record?.propagationType,
  propagationStatus: record?.propagationStatus,
  propagationMethod: record?.propagationMethod || '',
  parentMaleId: record?.parentMaleId || '',
  parentMaleCode: record?.parentMaleCode || '',
  parentFemaleId: record?.parentFemaleId || '',
  parentFemaleCode: record?.parentFemaleCode || '',
  motherPlantId: record?.motherPlantId || '',
  motherPlantCode: record?.motherPlantCode || '',
  linkedPlantingId: record?.linkedPlantingId || '',
  linkedPlantingCode: record?.linkedPlantingCode || '',
  propagationStartDate: record?.propagationStartDate || '',
  expectedHarvestDate: record?.expectedHarvestDate || '',
  actualHarvestDate: record?.actualHarvestDate || '',
  breedingLocation: record?.breedingLocation || '',
  targetTraits: record?.targetTraits || '',
  generation: record?.generation || ''
})

/** 解析 pictures 字段（V1.1 L77-83） */
const parsePictures = (raw) => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

const form = ref(buildInitialForm(null))

/** 数字本地化（V1.1 L377: toLocaleString） */
const formatNumber = (n) => {
  if (n == null) return 0
  return Number(n).toLocaleString()
}

// ===== 加载供应商列表（V1.1 service 风格：URLSearchParams + camelCase 字段 supplierName）=====
const loadSuppliers = async () => {
  try {
    // V1.1 L107-116：使用 URLSearchParams 拼接 page/limit（pageSize → limit 兼容）
    const params = new URLSearchParams({ page: '1', limit: '1000' })
    const res = await enhancedApiClient.get(`/suppliers?${params.toString()}`)
    // V1.1 后端返回 { success, data: [...] }，camelCase 中间件转换后字段是 supplierName
    const list = res?.data || res?.list || []
    supplierList.value = list.map(item => ({
      value: String(item.id),
      label: item.supplierName || item.name,
      supplierType: item.supplierType || item.type
    }))
  } catch (e) {
    console.error('[EditModal] 供应商加载失败:', e)
    ElMessage.error('供应商加载失败：' + (e instanceof Error ? e.message : '未知错误'))
    supplierList.value = []
  }
}

// ===== 事件处理 =====

/** 处理作物编码选择（V1.1 L142-157） */
const handleCropCodeChange = (code, varietyInfo) => {
  if (varietyInfo) {
    selectedCrop.value = varietyInfo
    form.value.cropCategory = varietyInfo.categoryName
    form.value.typeName = varietyInfo.typeName
    form.value.varietyName = varietyInfo.varietyName
    form.value.cropName = varietyInfo.detailVarietyCode && varietyInfo.detailVarietyCode !== '00'
      ? varietyInfo.varietyName
      : (varietyInfo.subVariety1Name || varietyInfo.varietyName)
    form.value.cropVariety = varietyInfo.subVariety1Name || ''
  } else {
    selectedCrop.value = null
  }
}

/** 处理种源类型变化 - 清空不匹配的供应商（V1.1 L128-139） */
const handleSourceTypeChange = () => {
  if (form.value.supplierId) {
    const targetType = SOURCE_TYPE_TO_SUPPLIER_TYPE[form.value.sourceType]
    if (targetType) {
      const currentSupplier = supplierList.value.find(s => s.value === form.value.supplierId)
      if (currentSupplier && currentSupplier.supplierType !== targetType) {
        form.value.supplierId = ''
        form.value.supplierName = ''
      }
    }
  }
}

/** 处理供应商变化（V1.1 L339） */
const handleSupplierChange = (val) => {
  if (val === '__none__') {
    form.value.supplierId = ''
    form.value.supplierName = ''
    return
  }
  const supplier = supplierList.value.find(s => s.value === val)
  form.value.supplierName = supplier?.label || ''
}

/** 移除已上传图片（V1.1 L419） */
const handleRemovePicture = (index) => {
  form.value.pictures = form.value.pictures.filter((_, i) => i !== index)
}

/** 处理文件上传（V1.1 L437-450） */
const handleFileChange = (e) => {
  const files = e.target.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        form.value.pictures = [...form.value.pictures, result]
      }
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

// ===== 生命周期 =====

// 监听 visible + record 变化（V1.1 L109-114）
watch(
  [() => props.visible, () => props.record?.id],
  ([val]) => {
    if (val && props.record) {
      form.value = buildInitialForm(props.record)
      // 重置 selectedCrop（由 CropCodeSelector 内部处理 selectedVariety）
      selectedCrop.value = null
      // 加载供应商
      loadSuppliers()
    }
  },
  { immediate: false }
)

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  // V1.1 L150-160 + P0-EDIT-013 nullable record 保护
  if (!props.record?.id) {
    ElMessage.error('记录不存在，无法保存')
    return
  }
  // 校验：选择"其他"时备注必填（V1.1 L161-164）
  if (form.value.sourceType === 'other' && !form.value.remarks.trim()) {
    ElMessage.warning('选择"其他"种源类型时，备注为必填项，请输入详细说明')
    return
  }
  // 外部采购时供应商必填（V1.1 L157-160）
  if (form.value.sourceOrigin === 'external_purchase' && !form.value.supplierId) {
    ElMessage.warning('请选择供应商')
    return
  }
  // V1.1 不阻断作物必填（仅显示红星，不强制）

  submitting.value = true
  try {
    // 获取供应商名称（V1.1 L172-173）
    const supplier = supplierList.value.find(s => s.value === form.value.supplierId)
    const supplierName = supplier?.label || form.value.supplierName

    // V1.1 L188-227：调用 store.updateItem
    await seedSourceStore.updateItem(String(props.record.id), {
      sourceType: form.value.sourceType,
      sourceOrigin: form.value.sourceOrigin,
      cropCategory: form.value.cropCategory,
      typeName: form.value.typeName,
      varietyName: form.value.varietyName,
      cropName: form.value.cropName,
      cropVariety: form.value.cropVariety,
      cropCode: form.value.cropCode,
      supplierId: form.value.supplierId,
      supplierName,
      purchaseDate: form.value.purchaseDate,
      // quantity 不传（累计值由入库/调拨动作累加，V1.1 L201-202）
      unit: form.value.unit,
      unitPrice: form.value.unitPrice,
      // 总金额 = 单价 × 累计入库量（不随编辑变，V1.1 L203）
      totalAmount: form.value.unitPrice * (props.record?.quantity || 0),
      pictures: form.value.pictures,
      remarks: form.value.remarks,
      // 2026-07-01 P0-6：传 updateBy 让后端记录操作人（V1.1 L207）
      updateBy: currentUser.value?.realName || currentUser.value?.username || 'system',
      // status 字段已废弃（2026-06-04，V1.1 L208）— 不传
      // 繁殖字段（V1.1 L209-226 P2 #9 修复）
      propagationType: form.value.propagationType,
      propagationStatus: form.value.propagationStatus,
      propagationMethod: form.value.propagationMethod,
      parentMaleId: form.value.parentMaleId,
      parentMaleCode: form.value.parentMaleCode,
      parentFemaleId: form.value.parentFemaleId,
      parentFemaleCode: form.value.parentFemaleCode,
      motherPlantId: form.value.motherPlantId,
      motherPlantCode: form.value.motherPlantCode,
      linkedPlantingId: form.value.linkedPlantingId,
      linkedPlantingCode: form.value.linkedPlantingCode,
      propagationStartDate: form.value.propagationStartDate,
      expectedHarvestDate: form.value.expectedHarvestDate,
      actualHarvestDate: form.value.actualHarvestDate,
      breedingLocation: form.value.breedingLocation,
      targetTraits: form.value.targetTraits,
      generation: form.value.generation
    })

    // V1.1 L227-228：成功不显示 toast，直接关闭弹窗 + 刷新
    emit('success')
    handleClose()
  } catch (err) {
    // V1.1 L220-223：失败 console.error + alert 弹窗
    console.error('[EditModal] 更新种源失败:', err)
    ElMessage.error(err instanceof Error ? err.message : '更新失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* other 种源类型时的红色边框（V1.1 L301 border-red-300） */
.remarks-other :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #fca5a5 inset;
}
.remarks-other-textarea :deep(.el-textarea__inner) {
  border-color: #fca5a5;
}
</style>
