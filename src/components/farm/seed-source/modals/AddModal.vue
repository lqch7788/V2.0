<template>
  <!-- 纯div自定义弹窗 -->
  <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: white;">新增种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <el-form :model="form" label-width="100px" ref="formRef">
          <!-- 入库方式选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">入库方式</label>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="opt in propagationOptions"
                :key="opt.value"
                @click="handlePropagationTypeChange(opt.value)"
                :class="[
                  'p-3 border-2 cursor-pointer rounded-lg text-left',
                  form.propagationType === opt.value
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                ]"
              >
                <div class="flex items-center gap-1.5 mb-0.5">
                  <el-icon :size="16" :class="form.propagationType === opt.value ? 'text-emerald-600' : 'text-gray-500'">
                    <component :is="opt.icon" />
                  </el-icon>
                  <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ opt.desc }}</div>
              </div>
            </div>
          </div>

          <!-- 种源批号 -->
          <el-form-item label="种源批号">
            <div class="flex gap-2 w-full">
              <el-input v-model="form.seedCode" placeholder="点击生成按钮获取批号" readonly class="flex-1" />
              <el-button type="primary" @click="handleGenerateSeedCode">
                <el-icon><Refresh /></el-icon>
                生成
              </el-button>
            </div>
            <span class="text-xs text-gray-400 mt-1">格式：ZZ + 年月日(8位) + "-" + 流水号(3位)</span>
          </el-form-item>

          <!-- 作物选择 -->
          <el-form-item label="作物选择" required>
            <el-select v-model="form.cropCategory" placeholder="请选择作物类别" class="w-full mb-2" @change="handleCropCategoryChange">
              <el-option v-for="item in cropCategories" :key="item" :label="item" :value="item" />
            </el-select>
            <el-input v-model="form.cropName" placeholder="请输入作物名称" />
          </el-form-item>

          <!-- 种源类型 -->
          <el-form-item label="种源类型">
            <el-select v-model="form.sourceType" placeholder="请选择" class="w-full">
              <el-option label="种子" value="seed" />
              <el-option label="种苗/实生苗" value="seedling" />
              <el-option label="扦插苗" value="cutting" />
              <el-option label="嫁接苗" value="grafting" />
              <el-option label="组培苗" value="tissue_culture" />
              <el-option label="分株苗" value="split" />
              <el-option label="种球/球根" value="bulb" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <!-- 来源途径 -->
          <el-form-item label="来源途径">
            <el-select v-model="form.sourceOrigin" placeholder="请选择" class="w-full">
              <el-option label="外部采购" value="external_purchase" />
              <el-option label="自产" value="self_produced" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <!-- 供应商（外购时必填） -->
          <el-form-item :label="form.sourceOrigin === 'external_purchase' ? '供应商 *' : '供应商'">
            <el-select v-model="form.supplierId" placeholder="请选择供应商" class="w-full" filterable>
              <el-option v-for="item in suppliers" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <!-- 采购/入库日期 -->
          <el-form-item :label="form.sourceOrigin === 'external_purchase' ? '采购日期' : '入库日期'">
            <el-date-picker
              v-model="form.purchaseDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>

          <!-- 登记数量 -->
          <el-form-item label="登记数量">
            <div class="flex gap-2 w-full">
              <el-input-number v-model="form.quantity" :min="0" class="flex-1" />
              <el-select v-model="form.unit" placeholder="单位" class="w-32">
                <el-option label="粒" value="粒" />
                <el-option label="株" value="株" />
                <el-option label="kg" value="kg" />
                <el-option label="g" value="g" />
                <el-option label="袋" value="袋" />
              </el-select>
            </div>
          </el-form-item>

          <!-- 单价 -->
          <el-form-item label="单价（元）">
            <el-input-number v-model="form.unitPrice" :min="0" :precision="2" class="w-full" />
          </el-form-item>

          <!-- 关联生产计划（仅育种计划类型显示） -->
          <el-form-item v-if="form.propagationType === 'breeding'" label="关联生产计划">
            <el-select v-model="form.productionPlanId" placeholder="不关联" clearable class="w-full">
              <el-option v-for="item in productionPlans" :key="item.id" :label="item.batchCode" :value="item.id" />
            </el-select>
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="图片上传">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full">
              <div v-if="form.pictures && form.pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
                <div v-for="(pic, index) in form.pictures" :key="index" class="relative group">
                  <img :src="pic" alt="" class="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <el-button
                    link
                    type="danger"
                    size="small"
                    class="absolute -top-2 -right-2"
                    @click="removePicture(index)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                multiple
                @change="handlePictureChange"
              >
                <el-button type="default">
                  <el-icon><Upload /></el-icon>
                  点击上传图片
                </el-button>
              </el-upload>
            </div>
          </el-form-item>

          <!-- 备注 -->
          <el-form-item label="备注">
            <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Refresh, Upload, ShoppingCart, Promotion, Sunny, Collection } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)

// 繁殖途径选项
const propagationOptions = [
  { value: 'external', label: '外购入库', desc: '从供应商采购入库', icon: ShoppingCart },
  { value: 'breeding', label: '育种计划产出', desc: '育种计划产出的种子', icon: Promotion },
  { value: 'seed_saving', label: '种植留种', desc: '从种植作物上留种', icon: Sunny },
  { value: 'asexual', label: '无性繁殖', desc: '扦插/嫁接/分株/组培', icon: Collection }
]

// 静态数据
const cropCategories = ['蔬菜类', '茄果类', '瓜类', '叶菜类', '豆类', '根茎类', '水果类', '花卉类']

const suppliers = ref([
  { id: 'S001', name: '寿光种业', code: 'SGZY', contact: '张经理', mobilePhone: '13800001001' },
  { id: 'S002', name: '农科院种业', code: 'NKKY', contact: '李经理', mobilePhone: '13800001002' },
  { id: 'S003', name: '山东蔬菜研究所', code: 'SSSC', contact: '王经理', mobilePhone: '13800001003' }
])

const productionPlans = ref([
  { id: 'PP001', batchCode: 'ZY20260101001', batchStatus: 'in_progress', planType: 'seed_breeding' }
])

// 表单数据
const form = ref({
  propagationType: 'external',
  seedCode: '',
  sourceType: 'seed',
  sourceOrigin: 'external_purchase',
  cropCategory: '',
  typeName: '',
  varietyName: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  supplierId: '',
  supplierName: '',
  purchaseDate: '',
  quantity: 0,
  unit: '粒',
  unitPrice: 0,
  pictures: [],
  remarks: '',
  createBy: '管理员',
  productionPlanId: '',
  productionPlanCode: '',
  status: 'sufficient',
  traceabilityCode: '',
  printCount: 0
})

// 监听 visible 变化
watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  form.value = {
    propagationType: 'external',
    seedCode: '',
    sourceType: 'seed',
    sourceOrigin: 'external_purchase',
    cropCategory: '',
    typeName: '',
    varietyName: '',
    cropName: '',
    cropVariety: '',
    cropCode: '',
    supplierId: '',
    supplierName: '',
    purchaseDate: '',
    quantity: 0,
    unit: '粒',
    unitPrice: 0,
    pictures: [],
    remarks: '',
    createBy: '管理员',
    productionPlanId: '',
    productionPlanCode: '',
    status: 'sufficient',
    traceabilityCode: '',
    printCount: 0
  }
}

// 繁殖途径变化
const handlePropagationTypeChange = (value) => {
  form.value.propagationType = value
  form.value.sourceOrigin = value === 'external' ? 'external_purchase' : 'self_produced'
}

// 作物类别变化
const handleCropCategoryChange = () => {
  form.value.cropName = ''
}

// 生成种源批号
const handleGenerateSeedCode = () => {
  const dateStr = form.value.purchaseDate
    ? form.value.purchaseDate.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  form.value.seedCode = `ZZ${dateStr}-${randomNum}`
}

// 移除图片
const removePicture = (index) => {
  form.value.pictures.splice(index, 1)
}

// 图片变化
const handlePictureChange = (uploadFile) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target && e.target.result) {
      form.value.pictures.push(e.target.result)
    }
  }
  reader.readAsDataURL(uploadFile.raw)
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.seedCode) {
    ElMessage.warning('请先生成种源批号')
    return
  }
  if (!form.value.cropCategory || !form.value.cropName) {
    ElMessage.warning('请选择作物')
    return
  }
  if (form.value.sourceOrigin === 'external_purchase' && !form.value.supplierId) {
    ElMessage.warning('请选择供应商')
    return
  }

  submitting.value = true
  try {
    // 计算总金额
    const totalAmount = (form.value.quantity || 0) * (form.value.unitPrice || 0)
    const initialCount = form.value.quantity || 0
    const availableCount = initialCount

    // 判断库存状态
    let status = 'sufficient'
    if (availableCount === 0) {
      status = 'depleted'
    } else if (availableCount < initialCount * 0.2) {
      status = 'low'
    }

    // 获取供应商名称
    const supplier = suppliers.value.find(s => s.id === form.value.supplierId)
    const supplierName = supplier?.name || ''

    // 关联生产计划批次号
    if (form.value.productionPlanId) {
      const plan = productionPlans.value.find(p => p.id === form.value.productionPlanId)
      form.value.productionPlanCode = plan?.batchCode || ''
    }

    await seedSourceStore.addItem({
      ...form.value,
      supplierName,
      totalAmount,
      initialCount,
      availableCount,
      status
    })
    ElMessage.success('创建成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>
