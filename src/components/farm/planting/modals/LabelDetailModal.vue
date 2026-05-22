<template>
  <!-- 标签详情弹窗 - 纯div结构 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" @click.self="onClose">
    <div class="bg-white rounded-xl w-full max-w-5xl shadow-xl max-h-[85vh] flex flex-col">
      <!-- 标题栏 - 渐变背景 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-xl">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
          <el-icon style="color: white;"><PriceTag /></el-icon>
          标签管理详情
        </h3>
        <el-icon style="color: white; cursor: pointer;" @click="onClose"><Close /></el-icon>
      </div>

      <!-- 搜索框 -->
      <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <el-input v-model="searchText" placeholder="搜索二维码ID..." clearable class="w-64">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Tabs内容区域 -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 标签页导航 -->
        <div class="flex gap-4 mb-4 border-b border-gray-200">
          <button
            @click="activeTab = 'labels'"
            :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'labels' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          >
            标签列表
          </button>
          <button
            @click="activeTab = 'resume'"
            :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === 'resume' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
          >
            标签履历
          </button>
        </div>

        <!-- 标签列表 -->
        <div v-show="activeTab === 'labels'">
          <el-table :data="filteredLabels" style="width: 100%" max-height="400">
            <el-table-column prop="labelNumber" label="二维码ID" width="180">
              <template #default="{ row }">
                <span class="font-mono text-sm">{{ row.labelNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="moveInAreaName" label="移入位置" width="120" />
            <el-table-column prop="moveInDate" label="移入日期" width="120" />
            <el-table-column prop="moveOutAreaName" label="移出位置" width="120" />
            <el-table-column prop="moveOutDate" label="移出日期" width="120" />
            <el-table-column prop="markName" label="标记状态">
              <template #default="{ row }">
                <el-tag v-if="row.markName" :type="getMarkType(row.markColor)" size="small">
                  {{ row.markName }}
                </el-tag>
                <span v-else class="text-gray-400 text-sm">未标记</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="filteredLabels.length === 0" class="text-center text-gray-400 py-8">
            暂无标签数据
          </div>
        </div>

        <!-- 标签履历 -->
        <div v-show="activeTab === 'resume'">
          <div v-if="!selectedLabel" class="text-center text-gray-400 py-12">
            <el-icon size="48" class="mb-3"><PriceTag /></el-icon>
            <p>请先在"标签列表"中选中一个标签，查看其履历</p>
          </div>
          <div v-else>
            <!-- 选中的标签信息 -->
            <div class="mb-4 p-3 bg-emerald-50 rounded-lg flex items-center gap-2">
              <span class="text-sm font-medium text-emerald-700">标签: {{ selectedLabel.labelNumber }}</span>
              <el-tag v-if="selectedLabel.markName" :type="getMarkType(selectedLabel.markColor)" size="small">
                {{ selectedLabel.markName }}
              </el-tag>
            </div>

            <!-- 履历列表 -->
            <div v-if="labelResumes.length === 0" class="text-center text-gray-400 py-8">
              <p>该标签暂无履历记录</p>
            </div>
            <el-timeline v-else>
              <el-timeline-item v-for="resume in labelResumes" :key="resume.id" :timestamp="resume.operationDate" placement="top">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-1">
                    <el-tag :type="getOperationType(resume.operationType)" size="small">
                      {{ getOperationLabel(resume.operationType) }}
                    </el-tag>
                  </div>
                  <div class="text-sm text-gray-600">
                    <span v-if="resume.fromAreaName">从 {{ resume.fromAreaName }}</span>
                    <span v-if="resume.fromAreaName && resume.toAreaName"> -> </span>
                    <span v-if="resume.toAreaName">到 {{ resume.toAreaName }}</span>
                  </div>
                  <div v-if="resume.operatorName" class="text-xs text-gray-400 mt-1">操作人: {{ resume.operatorName }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end flex-shrink-0">
        <el-button @click="onClose">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PriceTag, Close, Search } from '@element-plus/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  labels: {
    type: Array,
    default: () => []
  },
  resumeMap: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const searchText = ref('')
const activeTab = ref('labels')
const selectedLabelId = ref(null)

// 过滤标签
const filteredLabels = computed(() => {
  if (!searchText.value) return props.labels
  return props.labels.filter(l => l.labelNumber.toLowerCase().includes(searchText.value.toLowerCase()))
})

// 选中的标签
const selectedLabel = computed(() => {
  if (!selectedLabelId.value) return null
  return props.labels.find(l => l.id === selectedLabelId.value)
})

// 选中标签的履历
const labelResumes = computed(() => {
  if (!selectedLabelId.value) return []
  return props.resumeMap[selectedLabelId.value] || []
})

// 监听打开状态
watch(() => props.isOpen, (val) => {
  if (val) {
    searchText.value = ''
    activeTab.value = 'labels'
    selectedLabelId.value = null
  }
})

// 获取标记颜色对应的Tag类型
const getMarkType = (color) => {
  const map = {
    red: 'danger',
    yellow: 'warning',
    blue: 'primary',
    green: 'success'
  }
  return map[color] || 'info'
}

// 获取操作类型标签
const getOperationType = (type) => {
  const map = {
    move_in: 'success',
    move_out: 'warning',
    mark: 'primary'
  }
  return map[type] || 'info'
}

// 获取操作类型标签文字
const getOperationLabel = (type) => {
  const map = {
    move_in: '移入',
    move_out: '移出',
    mark: '标记'
  }
  return map[type] || type
}

// 选择标签
const handleSelectLabel = (label) => {
  selectedLabelId.value = label.id
}

const onClose = () => {
  emit('close')
}
</script>
