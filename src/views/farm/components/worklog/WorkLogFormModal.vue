<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑日志' : '新建日志'"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="overflow-y-auto max-h-[60vh]">
      <div class="grid grid-cols-2 gap-4">
        <!-- 日志编号 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">日志编号</label>
          <el-input v-model="form.code" placeholder="自动生成" />
        </div>

        <!-- 日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="!w-full"
          />
        </div>

        <!-- 工人姓名 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">工人姓名</label>
          <el-input v-model="form.worker" placeholder="请输入姓名" />
        </div>

        <!-- 天气 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">天气</label>
          <el-select v-model="form.weather" class="!w-full">
            <el-option label="晴" value="晴" />
            <el-option label="多云" value="多云" />
            <el-option label="阴" value="阴" />
            <el-option label="雨" value="雨" />
          </el-select>
        </div>

        <!-- 温度 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">温度</label>
          <el-input v-model="form.temperature" placeholder="如：25°C" />
        </div>

        <!-- 作物 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">作物</label>
          <el-input v-model="form.crop" placeholder="请输入作物名称" />
        </div>

        <!-- 大棚 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">大棚</label>
          <el-select v-model="form.greenhouse" class="!w-full">
            <el-option v-for="n in 4" :key="n" :label="`${n}号棚`" :value="`${n}号棚`" />
          </el-select>
        </div>

        <!-- 生长状况 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">生长状况</label>
          <el-select v-model="form.growthStatus" class="!w-full">
            <el-option label="良好" value="良好" />
            <el-option label="一般" value="一般" />
          </el-select>
        </div>

        <!-- 工作内容 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">工作内容</label>
          <el-input
            v-model="form.tasks"
            type="textarea"
            :rows="3"
            placeholder="请输入工作内容"
          />
        </div>

        <!-- 问题描述 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">问题描述</label>
          <el-input
            v-model="form.problems"
            type="textarea"
            :rows="2"
            placeholder="请输入问题描述"
          />
        </div>

        <!-- 处理措施 -->
        <div class="col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">处理措施</label>
          <el-input
            v-model="form.solutions"
            type="textarea"
            :rows="2"
            placeholder="请输入处理措施"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  log: { type: Object, default: null },
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => props.log !== null && props.log !== undefined)

const visible = computed({
  get: () => props.open,
  set: (val) => { if (!val) emit('close') }
})

const defaultForm = () => ({
  code: `WL${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  worker: '',
  weather: '晴',
  temperature: '',
  crop: '',
  greenhouse: '',
  growthStatus: '良好',
  tasks: '',
  problems: '',
  solutions: '',
})

const form = reactive(defaultForm())

/** 弹窗打开时初始化表单数据 */
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.log) {
      Object.assign(form, { ...props.log })
    } else {
      Object.assign(form, defaultForm())
    }
  }
})

function handleSubmit() {
  emit('save', { ...form })
}

function handleClose() {
  emit('close')
}
</script>
