<template>
  <!--
    新建物料弹窗 - V1.1 MaterialCreateModal.tsx 对齐
    提供完整的编码生成器（3级级联+生成+复制+重置）+ 必填校验 + I/O 警告
  -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleCancel">
    <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop>
      <!-- 头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between flex-shrink-0">
        <h3 class="text-lg font-semibold">新增物料</h3>
        <button @click="handleCancel" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <!-- 内容区 -->
      <div class="p-6 overflow-y-auto flex-1">
        <!-- 编码生成器（V1.1 WarehouseInboundCodeGen 对齐） -->
        <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <Wand2 class="w-4 h-4" />物料编码生成器
            </h4>
            <button class="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1" @click="handleResetCodeGen">
              <RotateCcw class="w-3 h-3" />重置
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">大类 <span class="text-red-500">*</span></label>
              <select v-model="codeGen.bigCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="">请选择大类</option>
                <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.code }}-{{ b.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">中类 <span class="text-red-500">*</span></label>
              <select v-model="codeGen.midCategory" :disabled="!codeGen.bigCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
                <option value="">请选择中类</option>
                <option v-for="m in midOptions" :key="m.code" :value="m.code">{{ m.code }}-{{ m.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">小类 <span class="text-red-500">*</span></label>
              <select v-model="codeGen.subCategory" :disabled="!codeGen.midCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
                <option value="">请选择小类</option>
                <option v-for="s in subOptions" :key="s.code" :value="s.code">{{ s.code }}-{{ s.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input :value="codeGen.generatedCode" readonly placeholder="点击生成" class="w-40 h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono bg-gray-50" />
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1" :disabled="!codeGen.subCategory" @click="handleGenerateCode">
              <Wand2 class="w-4 h-4" />生成
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1" :disabled="!codeGen.generatedCode" @click="handleCopyCode">
              <Copy class="w-4 h-4" />{{ copySuccess ? '已复制!' : '复制' }}
            </button>
            <span v-if="codeGenError" class="text-xs text-red-600 font-medium">{{ codeGenError }}</span>
            <span v-else-if="codeGenSuccess" class="text-xs text-green-600 font-medium">{{ codeGenSuccess }}</span>
          </div>
        </div>

        <!-- 表单字段 -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料编码 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.code" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono" placeholder="如：SP0201001" />
            <div v-if="hasIOChar(newMaterial.code)" class="mt-1 text-xs text-amber-600 flex items-start gap-1">
              <span class="font-bold">⚠️</span>
              <span>编码含字母 I/O，与数字 1/0 形近，建议核对或替换</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料名称 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.name" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：尿素 50kg/袋" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.category" readonly class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-gray-50" placeholder="选择上方分类后自动填充" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">规格型号 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.specification" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：50kg/袋" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">条形码</label>
            <input v-model="newMaterial.barcode" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono" placeholder="13位数字" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单位 <span class="text-red-500">*</span></label>
            <select v-model="newMaterial.unit" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white">
              <option value="">请选择单位</option>
              <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">当前库存</label>
            <input v-model.number="newMaterial.quantity" type="number" min="0" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">最低库存限值</label>
            <input v-model="minStockInput" type="number" min="0" step="0.01" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">最高库存限值</label>
            <input v-model="maxStockInput" type="number" min="0" step="0.01" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            <div v-if="minStockInput && maxStockInput && parseFloat(minStockInput) > parseFloat(maxStockInput) && parseFloat(maxStockInput) > 0" class="mt-1 text-xs text-red-600 flex items-start gap-1">
              <span class="font-bold">⚠️</span>
              <span>最低库存不能高于最高库存</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">单价（元）</label>
            <input v-model="newMaterial.price" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：45.00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <input v-model="newMaterial.supplier" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="供应商名称" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
            <input v-model="newMaterial.location" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：A-01-01" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
            <input v-model="newMaterial.batchNo" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生产日期</label>
            <input v-model="newMaterial.productionDate" type="date" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
            <input v-model="newMaterial.expiryDate" type="date" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">数据状态</label>
            <div class="flex items-center gap-4 py-1">
              <label class="flex items-center gap-2">
                <input type="radio" v-model="newMaterial.dataStatus" value="启用" class="w-4 h-4 text-blue-600 border-gray-400" />
                <span class="text-sm text-gray-700">启用</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="newMaterial.dataStatus" value="停用" class="w-4 h-4 text-blue-600 border-gray-400" />
                <span class="text-sm text-gray-700">停用</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200" @click="handleCancel">取消</button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" :disabled="submitting" @click="handleSave">
          {{ submitting ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Wand2, Copy, RotateCcw } from 'lucide-vue-next'
import { bigCategoriesList, categoryConfig } from '@/types/warehouseInbound.js'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  /** 可选：URL deep link 预填物料名称 */
  prefillName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'success'])

const warehouseMaterialStore = useWarehouseMaterialStore()

// 弹窗状态
const submitting = ref(false)

// 单位选项
const unitOptions = ['袋', '箱', '个', '瓶', '台', '卷', '把', '双', '公斤', '升', '平方米']

// 新建物料表单
function createEmptyMaterial() {
  return {
    id: null,
    code: '',
    name: '',
    category: '',
    specification: '',
    barcode: '',
    unit: '',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    price: '',
    supplier: '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    lastUpdateTime: new Date().toISOString().slice(0, 10),
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

// 监听分类级联 → 自动同步分类
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

// 生成编码（按 max+1 算法，匹配 V1.1 generateNextMaterialCode）
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
    // 旧浏览器 fallback
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

const handleSave = async () => {
  // V1.1 validate() 7 项必填校验
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
    // 调用 store 写入（store 内部会调 API + loadMaterials 刷新）
    const result = await warehouseMaterialStore.addMaterial({ ...newMaterial })
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
