<!--
  @file 种植移入/移出操作弹窗 - 1:1 翻译自 V1.1 PlantingMoveModal.tsx
  @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\modals\PlantingMoveModal.tsx
  @description 管理植株在不同区域之间的移动
  @note 兼容现有 PlantingPage.vue 的 prop-callback 调用约定 (:on-close, :on-submit)，
        同时也 emit Vue idiom 事件 (close, submit) 供后续迁移
-->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-xl w-full max-w-lg shadow-xl">
      <!-- 标题栏（1:1 V1.1 橙色渐变）-->
      <div
        class="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-t-xl"
      >
        <h3 class="text-lg font-semibold text-white">移入/移出操作</h3>
        <el-button text class="!text-white hover:!bg-orange-700" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 业务规则提示 - 已采收植株不能移动（1:1 V1.1） -->
      <div
        v-if="isHarvested"
        class="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
      >
        <el-icon class="flex-shrink-0"><WarningFilled /></el-icon>
        <span>已采收植株不能移动，请先取消采收状态</span>
      </div>

      <!-- 表单内容 -->
      <div class="p-4 space-y-4">
        <!-- 操作类型 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">操作类型 *</label>
          <el-select
            v-model="form.operationType"
            class="w-full"
            :disabled="isHarvested"
          >
            <el-option label="移入" value="move_in" />
            <el-option label="移出" value="move_out" />
          </el-select>
        </div>

        <!-- 标签编号 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">标签编号 *</label>
          <el-input
            v-model="form.labelNumber"
            placeholder="请输入或扫描标签二维码ID"
            :disabled="isHarvested"
          />
        </div>

        <!-- 目标区域 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">
            {{ form.operationType === 'move_in' ? '移入目标区域' : '移出目标区域' }} *
          </label>
          <el-select
            v-model="form.targetArea"
            placeholder="选择区域"
            class="w-full"
            :disabled="isHarvested"
          >
            <el-option
              v-for="area in areaOptions"
              :key="area.value"
              :label="area.label"
              :value="area.value"
            />
          </el-select>
        </div>

        <!-- 操作日期 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">操作日期</label>
          <el-date-picker
            v-model="form.operationDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="选择日期"
            class="w-full"
            :disabled="isHarvested"
          />
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">备注</label>
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="备注信息（可选）"
            :disabled="isHarvested"
          />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="isHarvested" @click="handleSubmit">
          提交
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @file MoveModal.vue
 * @description 种植移入/移出操作弹窗 - 1:1 翻译自 V1.1 PlantingMoveModal.tsx
 *              管理植株在不同区域之间的移动；已采收植株禁止移动
 * @see V1.1: D:\TMcrop\yuanxingtu\V1.1\src\components\farm\planting\modals\PlantingMoveModal.tsx
 */
import { ref, watch } from 'vue'
import { Close, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ==================== JSDoc 类型定义 ====================

/**
 * 移入/移出表单数据（1:1 V1.1 MoveFormData）
 * @typedef {Object} MoveFormData
 * @property {'move_in'|'move_out'} operationType  操作类型
 * @property {string} labelNumber                  标签编号
 * @property {string} targetArea                   目标区域
 * @property {string} operationDate                操作日期 (YYYY-MM-DD)
 * @property {string} remarks                      备注
 */

/**
 * 区域选项
 * @typedef {Object} AreaOption
 * @property {string} value
 * @property {string} label
 */

// ==================== Props (完整定义，匹配 V1.1 + PlantingPage.vue 现有用法) ====================

const props = defineProps({
  /** 弹窗显示状态 */
  isOpen: {
    type: Boolean,
    default: false,
  },
  /** 可选区域列表 */
  areaOptions: {
    type: Array,
    default: () => [],
  },
  /** 编辑模式下的初始数据（可选） */
  initialData: {
    type: Object,
    default: null,
  },
  /** 是否已采收（已采收植株不能移动） */
  isHarvested: {
    type: Boolean,
    default: false,
  },
  /** 关闭回调（V1.1 prop callback 模式） */
  onClose: {
    type: Function,
    default: null,
  },
  /** 提交回调 (data: MoveFormData) => void（V1.1 prop callback 模式） */
  onSubmit: {
    type: Function,
    default: null,
  },
})

// ==================== Emits ====================

/**
 * @event close 关闭弹窗
 * @event submit (data: MoveFormData) 提交表单数据
 */
const emit = defineEmits(['close', 'submit'])

// ==================== 默认表单（1:1 V1.1 defaultForm） ====================

/**
 * 返回一份新的默认表单（每次调用都新生成 operationDate）
 * @returns {MoveFormData}
 */
function makeDefaultForm() {
  return {
    operationType: 'move_in',
    labelNumber: '',
    targetArea: '',
    operationDate: new Date().toISOString().split('T')[0],
    remarks: '',
  }
}

// ==================== 表单状态（1:1 V1.1 useState） ====================

/** @type {import('vue').Ref<MoveFormData>} */
const form = ref(makeDefaultForm())

// ==================== 弹窗打开时重置（1:1 V1.1 useEffect） ====================

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      // V1.1: setForm(initialData ? { ...defaultForm, ...initialData } : { ...defaultForm })
      form.value = props.initialData
        ? { ...makeDefaultForm(), ...props.initialData }
        : makeDefaultForm()
    }
  },
)

// ==================== 提交（1:1 V1.1 handleSubmit） ====================

async function handleSubmit() {
  // V1.1: !form.labelNumber.trim() → '请输入标签编号'
  if (!form.value.labelNumber.trim()) {
    ElMessage.warning('请输入标签编号')
    return
  }
  // V1.1: !form.targetArea → '请选择目标区域'
  if (!form.value.targetArea) {
    ElMessage.warning('请选择目标区域')
    return
  }

  // V1.1: await onSubmit(form)
  const payload = { ...form.value }
  if (typeof props.onSubmit === 'function') {
    await props.onSubmit(payload)
  }
  emit('submit', payload)
  handleClose()
}

// ==================== 关闭（同时支持 onClose prop 和 close emit） ====================

function handleClose() {
  if (typeof props.onClose === 'function') {
    props.onClose()
  }
  emit('close')
}
</script>
