<template>
  <!--
    新建物料弹窗 - 严格对齐 V1.1 MaterialCreateModal.tsx
    - 容器: UnifiedModal (size=xxl: 1080×650) 即 ElModal 绿色渐变头+最大化+拖拽+resize
    - 编码生成器: WarehouseInboundCodeGen 白色背景 grid-cols-6 (大类1+中类1+小类1+生成编码3)
    - 字段布局: 编码+名称(2) → 大类/中类/小类(3) → 规格+单位(2) → 库存(2) → 单价+供应商(2) → 存放位置+条码(2) → 数据状态(1)
    - 没有"当前库存"、"批次号"、"生产日期"、"过期日期"字段（V1.1原版没有）
    - 单位: text input 而非 Select；数据状态: Select 下拉 而非 radio
  -->
  <ElModal
    :model-value="isOpen"
    title="新增物料"
    :width="1080"
    :height="650"
    :show-submit="false"
    :show-cancel="false"
    :close-on-click-modal="false"
    @update:model-value="(v) => { if (!v) handleCancel() }"
    @close="handleCancel"
  >
    <div class="space-y-4">
      <!-- 编码生成器 - 严格对齐 V1.1 WarehouseInboundCodeGen -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-6 gap-4">
          <!-- 大类 -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">大类</label>
            <select
              v-model="codeGen.bigCategory"
              class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
              @change="handleBigCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.code }}-{{ b.name }}</option>
            </select>
          </div>
          <!-- 中类: V1.1 WarehouseInboundCodeGen 显示 code-name -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">中类</label>
            <select
              v-model="codeGen.midCategory"
              :disabled="!codeGen.bigCategory"
              class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
              @change="handleMidCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="m in midOptions" :key="m.code" :value="m.code">{{ m.code }}-{{ m.name }}</option>
            </select>
          </div>
          <!-- 小类: V1.1 WarehouseInboundCodeGen 显示 code-name -->
          <div class="col-span-1">
            <label class="block text-sm font-medium text-gray-900 mb-1">小类</label>
            <select
              v-model="codeGen.subCategory"
              :disabled="!codeGen.midCategory"
              class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
              @change="handleSubCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="s in subOptions" :key="s.code" :value="s.code">{{ s.code }}-{{ s.name }}</option>
            </select>
          </div>
          <!-- 生成编码 -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-900 mb-1">
              生成编码
              <span v-if="codeGenSuccess && !codeGenError" class="ml-2 text-sm text-green-600 font-normal">{{ codeGenSuccess }}</span>
              <span v-else-if="codeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ codeGenError }}</span>
            </label>
            <div class="flex gap-2">
              <input :value="codeGen.generatedCode" readonly placeholder="点击生成" class="w-40 h-10 px-3 border border-gray-400 rounded-lg text-sm bg-gray-50 shadow-inner" />
              <button
                class="h-10 px-4 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!codeGen.subCategory"
                @click="handleGenerateCode"
              >
                <Wand2 class="w-4 h-4" />生成
              </button>
              <button
                class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!codeGen.generatedCode"
                @click="handleCopyCode"
              >
                {{ copySuccess ? '已复制!' : '复制' }}
              </button>
              <button
                class="h-10 px-4 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1"
                @click="handleResetCodeGen"
              >
                <RotateCcw class="w-4 h-4" />重置
              </button>
            </div>
          </div>
        </div>
        <!-- I/O 风险提示 - 严格对齐 V1.1 -->
        <div class="mt-2 text-xs text-amber-600 flex items-start gap-1">
          <span class="font-bold">⚠️</span>
          <span>部分大类（如 OP/IT/OT）编码含字母 I/O，与数字 1/0 形近。生成后请人工核对，避免抄录/扫描时误读。</span>
        </div>
      </div>

      <!-- 基本信息: 物料编码 + 物料名称 (2 列) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            物料编码 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newMaterial.code"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="使用上方编码生成器自动生成，或手动输入"
          />
          <div v-if="hasIOChar(newMaterial.code)" class="mt-1 text-xs text-amber-600 flex items-start gap-1">
            <span class="font-bold">⚠️</span>
            <span>编码含字母 I/O，与数字 1/0 形近，建议核对或替换</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            物料名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newMaterial.name"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：尿素 50kg/袋"
          />
        </div>
      </div>

      <!-- 分类: 大类 / 中类 / 小类 (3 列 Select) -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            大类 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="codeGen.bigCategory"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            @change="handleBigCategoryChange"
          >
            <option value="">请选择大类</option>
            <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            中类 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="codeGen.midCategory"
            :disabled="!codeGen.bigCategory"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
            @change="handleMidCategoryChange"
          >
            <option value="">请选择中类</option>
            <option v-for="m in midOptions" :key="m.code" :value="m.code">{{ m.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            小类 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="codeGen.subCategory"
            :disabled="!codeGen.midCategory"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400"
            @change="handleSubCategoryChange"
          >
            <option value="">请选择小类</option>
            <option v-for="s in subOptions" :key="s.code" :value="s.code">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <!-- 规格 + 单位 (2 列) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            规格型号 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newMaterial.specification"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：50kg/袋"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            单位 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newMaterial.unit"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：袋 / 瓶 / 箱 / 公斤"
          />
        </div>
      </div>

      <!-- 库存阈值: 最低库存 + 最高库存 (2 列) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">最低库存</label>
          <input
            v-model="minStockInput"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="0"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">最高库存</label>
          <input
            v-model="maxStockInput"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="0"
          />
        </div>
      </div>

      <!-- 单价 + 供应商 (2 列) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">单价(元)</label>
          <input
            v-model="newMaterial.price"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：85.00"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">供应商</label>
          <input
            v-model="newMaterial.supplier"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：中化化肥有限公司"
          />
        </div>
      </div>

      <!-- 存放位置 + 条码 (2 列) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">存放位置</label>
          <input
            v-model="newMaterial.location"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="如：A区-01-01"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">条码</label>
          <input
            v-model="newMaterial.barcode"
            class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
            placeholder="选填"
          />
        </div>
      </div>

      <!-- 数据状态 (Select 下拉) -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">数据状态</label>
        <select
          v-model="newMaterial.dataStatus"
          class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner"
        >
          <option value="启用">启用</option>
          <option value="停用">停用</option>
        </select>
      </div>
    </div>

    <template #footer>
      <el-button size="small" @click="handleCancel">取消</el-button>
      <el-button type="primary" size="small" :loading="submitting" @click="handleSave">
        {{ submitting ? '保存中…' : '保存' }}
      </el-button>
    </template>
  </ElModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Wand2, RotateCcw } from 'lucide-vue-next'
import { bigCategoriesList, categoryConfig } from '@/types/warehouseInbound.js'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'
import { ElModal } from '@/components/ui'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  /** 可选：URL deep link 预填物料名称 */
  prefillName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'success'])

const warehouseMaterialStore = useWarehouseMaterialStore()

// 弹窗状态
const submitting = ref(false)

// 新建物料表单 - 字段严格对齐 V1.1 MaterialCreateModal.tsx form 状态
function createEmptyMaterial() {
  return {
    code: '',
    name: '',
    category: '',
    bigCategory: '',
    midCategory: '',
    subCategory: '',
    specification: '',
    unit: '',
    minStock: 0,
    maxStock: 0,
    price: '',
    supplier: '',
    location: '',
    barcode: '',
    dataStatus: '启用'
  }
}

const newMaterial = reactive(createEmptyMaterial())

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')
const copySuccess = ref(false)
const minStockInput = ref('0')
const maxStockInput = ref('0')

// 中类/小类级联选项
const midOptions = computed(() => {
  if (!codeGen.bigCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  return Object.entries(bigCat.categories).map(([code, data]) => ({ code, name: data.name }))
})
const subOptions = computed(() => {
  if (!codeGen.bigCategory || !codeGen.midCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  const midCat = bigCat.categories[codeGen.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({ code, name: data.name }))
})

// 检测 I/O 字符
const hasIOChar = (code) => /[IO]/.test(code || '')

// 大类变化处理 - 级联清空中类、小类、编码
const handleBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}
const handleMidCategoryChange = () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}
const handleSubCategoryChange = () => {
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

// 监听弹窗打开 → 重置表单
watch(() => props.isOpen, (open) => {
  if (open) {
    Object.assign(newMaterial, createEmptyMaterial())
    if (props.prefillName) newMaterial.name = props.prefillName
    handleResetCodeGen()
    minStockInput.value = '0'
    maxStockInput.value = '0'
  }
})

// 监听分类级联 → 自动同步分类名称到 form.category
watch(() => [codeGen.bigCategory, codeGen.midCategory, codeGen.subCategory], () => {
  const bigName = codeGen.bigCategory
    ? (bigCategoriesList.find(b => b.code === codeGen.bigCategory)?.name || '')
    : ''
  const midName = codeGen.bigCategory && codeGen.midCategory
    ? (categoryConfig[codeGen.bigCategory]?.categories?.[codeGen.midCategory]?.name || '')
    : ''
  const subName = codeGen.bigCategory && codeGen.midCategory && codeGen.subCategory
    ? (categoryConfig[codeGen.bigCategory]?.categories?.[codeGen.midCategory]?.subCategories?.[codeGen.subCategory]?.name || '')
    : ''
  newMaterial.bigCategory = codeGen.bigCategory
  newMaterial.midCategory = codeGen.midCategory
  newMaterial.subCategory = codeGen.subCategory
  newMaterial.category = [bigName, midName, subName].filter(Boolean).join('-')
})

// 监听生成编码 → 同步到物料编码
watch(() => codeGen.generatedCode, (val) => {
  if (val) newMaterial.code = val
})

// 监听阈值输入
watch(minStockInput, (val) => {
  const num = parseFloat(val)
  newMaterial.minStock = isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100)
})
watch(maxStockInput, (val) => {
  const num = parseFloat(val)
  newMaterial.maxStock = isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100)
})

// 生成编码（按 max+1 算法，匹配 V1.1 handleCodeGen）
const handleGenerateCode = () => {
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请选择完整的分类'
    codeGenSuccess.value = ''
    return
  }
  const baseCode = `${codeGen.bigCategory}${codeGen.midCategory}${codeGen.subCategory}`
  const existingCodes = (warehouseMaterialStore.materials || [])
    .map(m => m.code)
    .filter(c => typeof c === 'string' && c.startsWith(baseCode))
  let maxSeq = 0
  for (const code of existingCodes) {
    const seq = parseInt(code.slice(baseCode.length), 10)
    if (!isNaN(seq) && seq > maxSeq && seq < 1000) maxSeq = seq
  }
  const nextSeq = maxSeq + 1
  if (nextSeq > 999) {
    codeGenError.value = '该分类编码已达上限 999'
    codeGenSuccess.value = ''
    return
  }
  const newCode = `${baseCode}${String(nextSeq).padStart(3, '0')}`
  codeGen.generatedCode = newCode
  codeGenSuccess.value = `生成成功: ${newCode}`
  codeGenError.value = ''
}

const handleCopyCode = async () => {
  if (!codeGen.generatedCode) return
  try {
    await navigator.clipboard.writeText(codeGen.generatedCode)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = codeGen.generatedCode
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  }
}

const handleResetCodeGen = () => {
  codeGen.bigCategory = ''
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
  copySuccess.value = false
}

const handleCancel = () => {
  emit('close')
}

// V1.1 validate() 7 项必填校验
const handleSave = async () => {
  if (!newMaterial.code.trim()) {
    ElMessage.warning('请填写物料编码（可用上方编码生成器自动生成）')
    return
  }
  if (!newMaterial.name.trim()) {
    ElMessage.warning('请填写物料名称')
    return
  }
  if (!newMaterial.category) {
    ElMessage.warning('请选择完整分类（大类/中类/小类）')
    return
  }
  if (!newMaterial.specification.trim()) {
    ElMessage.warning('请填写规格型号')
    return
  }
  if (!newMaterial.unit.trim()) {
    ElMessage.warning('请填写单位')
    return
  }
  if (newMaterial.minStock < 0 || newMaterial.maxStock < 0) {
    ElMessage.warning('库存阈值不能为负')
    return
  }
  if (newMaterial.maxStock > 0 && newMaterial.minStock > newMaterial.maxStock) {
    ElMessage.warning('最低库存不能高于最高库存')
    return
  }

  submitting.value = true
  try {
    // payload 严格对齐 V1.1: quantity=0(新建库存为0)、batchNo/productionDate/expiryDate 留空（V1.1新增物料时也是空）
    const payload = {
      code: newMaterial.code.trim(),
      name: newMaterial.name.trim(),
      category: newMaterial.category,
      specification: newMaterial.specification.trim(),
      unit: newMaterial.unit.trim(),
      quantity: 0,
      minStock: newMaterial.minStock,
      maxStock: newMaterial.maxStock,
      price: newMaterial.price.trim() || '0',
      supplier: newMaterial.supplier.trim(),
      location: newMaterial.location.trim(),
      barcode: newMaterial.barcode.trim(),
      batchNo: '',
      productionDate: '',
      expiryDate: '',
      lastUpdateTime: new Date().toISOString(),
      dataStatus: newMaterial.dataStatus
    }
    const result = await warehouseMaterialStore.addMaterial(payload)
    const displayCode = result?.code || newMaterial.code.trim()
    ElMessage.success(`物料 ${displayCode} 创建成功`)
    emit('success', result)
    emit('close')
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>
