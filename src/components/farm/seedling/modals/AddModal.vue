<template>
  <el-dialog
    :model-value="visible"
    title="新增育苗"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px" ref="formRef">
      <el-form-item label="育苗批号" required>
        <el-input v-model="form.seedlingCode" placeholder="系统自动生成" disabled />
      </el-form-item>
      <el-form-item label="关联种源" required>
        <el-select v-model="form.sourceId" placeholder="请选择" class="w-full" @change="handleSourceChange">
          <el-option v-for="item in seedSources" :key="item.id" :label="`${item.seedCode} - ${item.cropName}`" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="作物名称">
        <el-input v-model="form.cropName" disabled />
      </el-form-item>
      <el-form-item label="作物品种">
        <el-input v-model="form.cropVariety" disabled />
      </el-form-item>
      <el-form-item label="育苗方式" required>
        <el-select v-model="form.seedlingType" placeholder="请选择" class="w-full">
          <el-option v-for="item in seedlingTypes" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="场地" required>
        <el-select v-model="form.siteName" placeholder="请选择" class="w-full">
          <el-option v-for="item in sites" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期" required>
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="预计结束日期">
        <el-date-picker
          v-model="form.expectedEndDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="初始数量" required>
        <el-input-number v-model="form.initialCount" :min="0" class="w-full" />
      </el-form-item>
      <el-form-item label="目标成苗率">
        <el-input-number v-model="form.targetSurvivalRate" :min="0" :max="100" :precision="1" class="w-full" />
      </el-form-item>
      <el-form-item label="负责人">
        <el-input v-model="form.chargePerson" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useSeedlingStore, useSeedSourceStore } from '@/stores'

const props = defineProps({})

const emit = defineEmits(['update:visible', 'success'])

const seedlingStore = useSeedlingStore()
const seedSourceStore = useSeedSourceStore()

const formRef = ref()
const submitting = ref(false)
const seedSources = ref([])
const form = ref({
  seedlingCode: '',
  sourceId: '',
  sourceCode: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  seedlingType: '',
  siteId: '',
  siteName: '',
  startDate: '',
  expectedEndDate: '',
  initialCount,
  survivalCount,
  plantedCount,
  survivalRate,
  lossCount,
  lossRate,
  isFinished,
  status: 'in_progress',
  dailyRecords: [],
  pictures: [],
  qualityGrade: '',
  printCount,
  remarks: '',
  createBy: '管理员'
})

const seedlingTypes = ['穴盘育苗', '嫁接育苗', '组培育苗', '直播育苗']
const sites = ['1号大棚', '2号大棚', '3号大棚', '露天场地']

onMounted(async () => {
  await seedSourceStore.loadItems()
  seedSources.value = seedSourceStore.items
})

const handleSourceChange = (sourceId) => {
  const source = seedSources.value.find(s => s.id === sourceId)
  if (source) {
    form.value.sourceCode = source.seedCode
    form.value.cropName = source.cropName
    form.value.cropVariety = source.cropVariety
    form.value.cropCode = source.cropCode
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!form.value.sourceId || !form.value.seedlingType || !form.value.siteName || !form.value.startDate) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    // 计算成苗率
    if (form.value.initialCount && form.value.initialCount > 0) {
      form.value.survivalRate = Math.round((form.value.survivalCount || 0) / form.value.initialCount * 100)
      form.value.lossRate = 100 - form.value.survivalRate
    }

    await seedlingStore.addItem(form.value)
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
