<template>
  <el-dialog
    :model-value="isOpen"
    :title="alert?.title || '预警详情'"
    width="550px"
    @close="onClose"
  >
    <div class="space-y-4">
      <!-- 预警等级 -->
      <div class="flex items-center gap-2">
        <el-tag :type="getLevelType(alert?.level)">
          <el-icon class="mr-1"><component :is="getLevelIcon(alert?.level)" /></el-icon>
          {{ getLevelName(alert?.level) }}
        </el-tag>
      </div>

      <!-- 预警类型 -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-500">预警类型：</span>
        <span class="font-medium">{{ alert?.alertTypeName }}</span>
      </div>

      <!-- 预警内容 -->
      <div>
        <p class="text-sm text-gray-500 mb-1">预警内容</p>
        <p class="bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">{{ alert?.content }}</p>
      </div>

      <!-- 关联信息 -->
      <template v-if="alert?.staffName || alert?.department">
        <div class="grid grid-cols-2 gap-4">
          <div v-if="alert?.department" class="flex items-center gap-2 text-sm">
            <el-icon class="text-gray-400"><OfficeBuilding /></el-icon>
            <span class="text-gray-500">部门：</span>
            <span class="font-medium">{{ alert?.department }}</span>
          </div>
          <div v-if="alert?.staffName" class="flex items-center gap-2 text-sm">
            <el-icon class="text-gray-400"><User /></el-icon>
            <span class="text-gray-500">人员：</span>
            <span class="font-medium">{{ alert?.staffName }}</span>
            <span v-if="alert?.staffId" class="text-gray-400">({{ alert?.staffId }})</span>
          </div>
        </div>
      </template>

      <!-- 时间信息 -->
      <div class="flex items-center gap-2 text-sm">
        <el-icon class="text-gray-400"><Clock /></el-icon>
        <span class="text-gray-500">创建时间：</span>
        <span class="font-medium">{{ alert?.createTime }}</span>
      </div>

      <!-- 处理状态 -->
      <div class="flex items-center gap-2 text-sm">
        <template v-if="alert?.status === 'pending'">
          <el-icon class="text-orange-500"><Clock /></el-icon>
          <span class="text-orange-600">待处理</span>
        </template>
        <template v-else>
          <el-icon class="text-green-500"><CircleCheck /></el-icon>
          <span class="text-green-600">已处理</span>
          <span v-if="alert?.handleTime" class="text-gray-500 ml-2">处理时间：{{ alert?.handleTime }}</span>
          <span v-if="alert?.handler" class="text-gray-500 ml-2">处理人：{{ alert?.handler }}</span>
        </template>
      </div>

      <!-- 已处理备注 -->
      <div v-if="alert?.remarks">
        <p class="text-sm text-gray-500 mb-1">处理备注</p>
        <p class="bg-green-50 p-3 rounded-lg text-sm leading-relaxed text-green-800">
          {{ alert?.remarks }}
        </p>
      </div>

      <!-- 处理备注输入（仅待处理状态显示） -->
      <div v-if="alert?.status === 'pending'" class="space-y-2">
        <span class="text-sm text-gray-500">处理备注</span>
        <el-input
          v-model="remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入处理备注..."
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="onClose">
          {{ alert?.status === 'pending' ? '稍后处理' : '关闭' }}
        </el-button>
        <el-button
          v-if="alert?.status === 'pending'"
          type="primary"
          @click="handleSubmit"
          :disabled="!remarks.trim()"
        >
          标记已处理
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Clock, CircleCheck, User, OfficeBuilding, WarningFilled, WarnTriangleFilled, CircleClose } from '@element-plus/icons-vue'

// AlertLevel: 'warning' | 'danger' | 'critical'

const props = defineProps({
  visible: Boolean,
  alert: Object,
  users: Array,
  onClose: Function
})

const remarks = ref('')

// 预警等级名称映射
const AlertLevelNames = {
  warning: '一般提醒',
  danger: '需要注意',
  critical: '紧急处理',
}

const getLevelName = (level) => {
  return level ? AlertLevelNames[level] || level : ''
}

const getLevelIcon = (level) => {
  switch (level) {
    case 'warning': return WarningFilled
    case 'danger': return WarnTriangleFilled
    case 'critical': return CircleClose
    default: return WarningFilled
  }
}

const getLevelType = (level) => {
  switch (level) {
    case 'warning': return 'warning'
    case 'danger': return 'warning'
    case 'critical': return 'danger'
    default: return 'info'
  }
}

const handleSubmit = () => {
  if (remarks.value.trim() && props.alert) {
    props.onHandle(props.alert.id, remarks.value.trim())
    remarks.value = ''
    props.onClose()
  }
}
</script>
