<template>
  <div>
    <!-- 工具栏 -->
    <div class="flex items-center gap-3 mb-3 flex-wrap">
      <div class="relative flex-1 min-w-[180px] max-w-[240px]">
        <el-input
          v-model="searchTerm"
          placeholder="搜索种植季/作物..."
          clearable
          @clear="currentPage = 1"
          @input="currentPage = 1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-select v-model="facilityFilter" placeholder="全部设施" clearable @change="currentPage = 1" class="w-36">
        <el-option label="全部设施" value="" />
        <el-option v-for="g in facilityOptions" :key="g.oid" :label="g.name" :value="g.oid" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable @change="currentPage = 1" class="w-36">
        <el-option label="全部状态" value="" />
        <el-option v-for="opt in statusOptions" :key="opt.dictCode" :label="opt.dictLabel" :value="opt.dictCode" />
      </el-select>
      <!-- 切换活跃/全部 -->
      <el-button
        :type="showOnlyActive ? 'primary' : 'default'"
        size="small"
        @click="showOnlyActive = !showOnlyActive; currentPage = 1"
      >
        <el-icon><Sugar /></el-icon>
        {{ showOnlyActive ? '种植中' : '全部历史' }}
      </el-button>
      <el-button type="primary" size="small" @click="handleOpenCreate">
        <el-icon><Plus /></el-icon>新增种植季
      </el-button>
    </div>

    <!-- 表格 -->
    <div v-loading="loading">
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">种植季编码</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">所属设施</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">作物品种</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">开始日期</th>
              <th class="py-3 px-4 text-left font-medium whitespace-nowrap">结束日期</th>
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">状态</th>
              <th class="py-3 px-4 text-right font-medium whitespace-nowrap">产量(kg)</th>
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">品质</th>
              <th class="py-3 px-4 text-center font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300 bg-white">
            <tr v-if="paginated.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-gray-400">
                <el-icon class="mx-auto mb-2" :size="32"><Sugar /></el-icon>
                <div>暂无种植记录</div>
              </td>
            </tr>
            <tr
              v-for="r in paginated"
              :key="r.oid"
              class="hover:bg-blue-100 transition-colors"
            >
              <td class="py-3 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap">{{ r.seasonCode }}</td>
              <td class="py-3 px-4 whitespace-nowrap">{{ r.facilityName || '-' }}</td>
              <td class="py-3 px-4 whitespace-nowrap">
                {{ r.cropName }}{{ r.varietyName ? ' · ' + r.varietyName : '' }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap">{{ r.startDate || '-' }}</td>
              <td class="py-3 px-4 whitespace-nowrap">{{ r.endDate || '-' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <el-tag
                  :type="getStatusType(r.status)"
                  size="small"
                >
                  {{ getStatusLabel(r.status) }}
                </el-tag>
              </td>
              <td class="py-3 px-4 text-right whitespace-nowrap">{{ r.yieldAmount ?? '-' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">{{ r.qualityGrade || '-' }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <el-button
                    v-if="r.status === 'planting'"
                    link
                    @click="handleOpenEnd(r)"
                    class="text-green-500 hover:text-green-600"
                    title="结束种植季"
                  >
                    <el-icon><Timer /></el-icon>
                  </el-button>
                  <el-button link @click="handleOpenEdit(r)" class="text-blue-500 hover:text-blue-600" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button link @click="handleDeleteConfirm(r)" class="text-red-500 hover:text-red-600" title="删除">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="filtered.length > 0" class="flex items-center justify-between mt-3 px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filtered.length }} 条</div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="PAGE_SIZE"
          :page-sizes="[10, 20, 50]"
          :total="filtered.length"
          layout="sizes, prev, pager, next"
          @size-change="currentPage = 1"
        />
      </div>
    </div>

    <!-- 创建弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新增种植季" width="500px" :close-on-click-modal="false">
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-600 mb-1">选择设施 <span class="text-red-500">*</span></label>
          <el-select v-model="createForm.facility_oid" placeholder="请选择设施" class="w-full">
            <el-option label="请选择设施" value="" />
            <el-option v-for="g in facilityOptions" :key="g.oid" :label="g.name" :value="g.oid" />
          </el-select>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">作物名称 <span class="text-red-500">*</span></label>
          <el-input v-model="createForm.crop_name" placeholder="作物名称" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">品种名称</label>
          <el-input v-model="createForm.variety_name" placeholder="品种名称" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">开始日期</label>
          <el-date-picker
            v-model="createForm.start_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">备注</label>
          <el-input v-model="createForm.notes" type="textarea" :rows="2" placeholder="备注" />
        </div>
        <p class="text-xs text-gray-400">种植季编码将自动生成（格式：2026S001）</p>
      </div>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCreate">创建种植季</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑种植记录" width="500px" :close-on-click-modal="false">
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-600 mb-1">作物名称</label>
          <el-input v-model="editForm.crop_name" placeholder="作物名称" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">品种名称</label>
          <el-input v-model="editForm.variety_name" placeholder="品种名称" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">开始日期</label>
          <el-date-picker
            v-model="editForm.start_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">备注</label>
          <el-input v-model="editForm.notes" type="textarea" :rows="2" placeholder="备注" />
        </div>
      </div>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 结束种植季弹窗 -->
    <el-dialog v-model="endDialogVisible" title="结束种植季" width="500px" :close-on-click-modal="false">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          结束种植季「<span class="font-semibold text-blue-600">{{ currentRecord?.seasonCode }}</span>」
        </p>
        <div>
          <label class="block text-xs text-gray-600 mb-1">结束日期 <span class="text-red-500">*</span></label>
          <el-date-picker
            v-model="endForm.end_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">产量</label>
            <el-input-number v-model="endForm.yield_amount" :min="0" class="w-full" />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">单位</label>
            <el-select v-model="endForm.yield_unit" class="w-full">
              <el-option label="千克" value="kg" />
              <el-option label="吨" value="ton" />
              <el-option label="斤" value="jin" />
            </el-select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">品质等级</label>
          <el-select v-model="endForm.quality_grade" placeholder="请选择" class="w-full">
            <el-option label="请选择" value="" />
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
          </el-select>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">备注</label>
          <el-input v-model="endForm.notes" type="textarea" :rows="2" placeholder="备注" />
        </div>
      </div>
      <template #footer>
        <el-button @click="endDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEndSeason">确认结束</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <p class="text-sm text-gray-500">
        确定要删除种植季「<span class="font-medium text-gray-700">{{ deleteRecord?.seasonCode }}</span>」吗？
      </p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, Sugar, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePlantingRecordStore, useGreenhouseStore } from '@/stores'

const PAGE_SIZE = 10

// Stores
const plantingRecordStore = usePlantingRecordStore()
const greenhouseStore = useGreenhouseStore()

// 状态
const records = ref([])
const greenhouses = ref([])
const loading = ref(false)
const searchTerm = ref('')
const facilityFilter = ref('')
const statusFilter = ref('')
const showOnlyActive = ref(true)
const currentPage = ref(1)

// 弹窗状态
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const endDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const currentRecord = ref(null)
const deleteRecord = ref(null)

// 状态选项
const statusOptions = [
  { dictCode: 'planting', dictLabel: '种植中' },
  { dictCode: 'harvested', dictLabel: '已采收' },
  { dictCode: 'fallow', dictLabel: '休耕中' },
  { dictCode: 'cancelled', dictLabel: '已取消' }
]

// 表单数据
const createForm = ref({
  facility_oid: '',
  crop_name: '',
  variety_name: '',
  start_date: '',
  notes: ''
})

const editForm = ref({
  crop_name: '',
  variety_name: '',
  start_date: '',
  notes: ''
})

const endForm = ref({
  end_date: '',
  yield_amount: 0,
  yield_unit: 'kg',
  quality_grade: '',
  notes: ''
})

// 设施选项（只显示活跃的）
const facilityOptions = computed(() => {
  return greenhouses.value.filter(g => g.status === 'active')
})

// 筛选后的数据
const filtered = computed(() => {
  return records.value.filter(r => {
    const matchSearch = !searchTerm.value ||
      (r.seasonCode || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (r.cropName || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (r.varietyName || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchFacility = !facilityFilter.value || r.facilityOid === facilityFilter.value
    const matchStatus = !statusFilter.value || r.status === statusFilter.value
    const matchActive = !showOnlyActive.value || r.status === 'planting'
    return matchSearch && matchFacility && matchStatus && (showOnlyActive.value ? matchActive : true)
  })
})

// 分页后的数据
const paginated = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

// 获取状态标签
const getStatusLabel = (status) => {
  const found = statusOptions.find(s => s.dictCode === status)
  return found ? found.dictLabel : status
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'planting': return 'primary'
    case 'harvested': return 'success'
    case 'fallow': return 'warning'
    default: return 'info'
  }
}

// 获取设施名称
const getFacilityName = (oid) => {
  return greenhouses.value.find(g => g.oid === oid)?.name || oid
}

// 加载数据
const loadData = async () => {
  loading.value = true
  await Promise.all([
    plantingRecordStore.loadRecords(),
    greenhouseStore.loadGreenhouses()
  ])
  records.value = plantingRecordStore.records
  greenhouses.value = greenhouseStore.greenhouses
  loading.value = false
}

// 打开创建弹窗
const handleOpenCreate = () => {
  currentRecord.value = null
  createForm.value = {
    facility_oid: '',
    crop_name: '',
    variety_name: '',
    start_date: new Date().toISOString().slice(0, 10),
    notes: ''
  }
  createDialogVisible.value = true
}

// 保存创建
const handleSaveCreate = async () => {
  if (!createForm.value.facility_oid || !createForm.value.crop_name) {
    ElMessage.warning('请选择设施和填写作物名称')
    return
  }
  try {
    const facility = greenhouses.value.find(g => g.oid === createForm.value.facility_oid)
    await plantingRecordStore.addRecord({
      ...createForm.value,
      facilityName: facility?.name || ''
    })
    createDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('创建失败')
  }
}

// 打开编辑弹窗
const handleOpenEdit = (r) => {
  currentRecord.value = r
  editForm.value = {
    crop_name: r.cropName,
    variety_name: r.varietyName,
    start_date: r.startDate?.slice(0, 10) || '',
    notes: r.notes || ''
  }
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!currentRecord.value) return
  try {
    await plantingRecordStore.editRecord(currentRecord.value.oid, editForm.value)
    editDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('更新失败')
  }
}

// 打开结束种植季弹窗
const handleOpenEnd = (r) => {
  currentRecord.value = r
  endForm.value = {
    end_date: new Date().toISOString().slice(0, 10),
    yield_amount: 0,
    yield_unit: 'kg',
    quality_grade: '',
    notes: ''
  }
  endDialogVisible.value = true
}

// 结束种植季
const handleEndSeason = async () => {
  if (!currentRecord.value || !endForm.value.end_date) {
    ElMessage.warning('请填写结束日期')
    return
  }
  try {
    await plantingRecordStore.endSeason(currentRecord.value.oid, endForm.value)
    ElMessage.success('结束种植季成功')
    endDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('结束种植季失败')
  }
}

// 删除确认
const handleDeleteConfirm = (r) => {
  deleteRecord.value = r
  deleteDialogVisible.value = true
}

// 删除
const handleDelete = async () => {
  if (!deleteRecord.value) return
  try {
    await plantingRecordStore.removeRecord(deleteRecord.value.oid)
    deleteDialogVisible.value = false
    await loadData()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>
