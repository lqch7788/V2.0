<template>
  <!-- 指标创建/编辑弹窗组件 - V1.1原生div样式 -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="handleClose">
    <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 头部 - V1.1绿色渐变标题栏 -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center justify-between">
        <h3 class="font-semibold flex items-center gap-2">
          <el-icon v-if="isEdit" :size="20"><Edit /></el-icon>
          <el-icon v-else :size="20"><Plus /></el-icon>
          {{ isEdit ? '编辑指标' : '新增指标' }}
        </h3>
        <el-button
          variant="text"
          :icon="Close"
          @click="handleClose"
          class="text-white/80 hover:text-white"
        />
      </div>

      <!-- 表单内容 -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div class="space-y-4">
          <!-- 指标编码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              指标编码 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="formData.code"
              placeholder="系统自动生成"
              disabled
            />
          </div>

          <!-- 指标名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              指标名称 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="formData.name"
              placeholder="请输入指标名称"
            />
          </div>

          <!-- 类别 + 单位 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类别</label>
              <el-select v-model="formData.category" placeholder="请选择类别" class="w-full">
                <el-option
                  v-for="cat in categories"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <el-input v-model="formData.unit" placeholder="如: %, 元, kg" />
            </div>
          </div>

          <!-- 目标值 + 实际值 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">目标值</label>
              <el-input-number v-model="formData.target" :min="0" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实际值</label>
              <el-input-number v-model="formData.actual" :min="0" class="w-full" />
            </div>
          </div>

          <!-- 数据采集方式 + 权重 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数据采集方式</label>
              <el-select v-model="formData.source" placeholder="请选择采集方式" class="w-full">
                <el-option label="自动采集" value="自动采集" />
                <el-option label="人工录入" value="人工录入" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">权重</label>
              <el-input-number v-model="formData.weight" :min="0" :max="100" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 - V1.1样式 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
        <el-button size="small" @click="handleClose">取消</el-button>
        <el-button size="small" type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Edit, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { indicatorCategories } from '@/data/indicatorsData'

const props = defineProps({
  isOpen: Boolean,
  indicator: Object
})

const emit = defineEmits(['close', 'save'])

// 是否编辑模式
const isEdit = computed(() => !!props.indicator)

// 类别选项（排除"全部"）
const categories = indicatorCategories.filter(c => c !== '全部')

// 表单数据
const formData = ref({
  code: '',
  name: '',
  category: '生产指标',
  unit: '',
  target: 0,
  actual: 0,
  source: '自动采集',
  warning: 0,
  weight: 0,
  frequency: '月度'
})

// 监听弹窗打开，初始化表单数据
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.indicator) {
      // 编辑模式
      formData.value = {
        code: props.indicator.code || '',
        name: props.indicator.name || '',
        category: props.indicator.category || '生产指标',
        unit: props.indicator.unit || '',
        target: props.indicator.target || 0,
        actual: props.indicator.actual || 0,
        source: props.indicator.source || '自动采集',
        warning: props.indicator.warning || 0,
        weight: props.indicator.weight || 0,
        frequency: props.indicator.frequency || '月度'
      }
    } else {
      // 新增模式
      formData.value = {
        code: '',
        name: '',
        category: '生产指标',
        unit: '',
        target: 0,
        actual: 0,
        source: '自动采集',
        warning: 0,
        weight: 0,
        frequency: '月度'
      }
    }
  }
})

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = () => {
  if (!formData.value.name || !formData.value.name.trim()) {
    ElMessage.warning('请输入指标名称')
    return
  }
  emit('save', formData.value)
}
</script>

<style scoped>
/* 使用V1.1原生div弹窗样式，头部使用emerald绿色渐变 */
</style>
