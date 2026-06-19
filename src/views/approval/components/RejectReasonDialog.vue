<!--
  MaterialApproval 拒绝原因弹窗子组件
  从 MaterialApproval.vue 拆分（保持 1:1 模板和样式）
-->
<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('update:modelValue', false)">
    <div class="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <!-- 弹窗头部 -->
      <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
        <h3 class="text-lg font-semibold">拒绝审批</h3>
        <button @click="$emit('update:modelValue', false)" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <div v-if="item" class="p-6">
        <p class="text-sm text-gray-600 mb-2">
          确定要拒绝「<span class="font-medium text-gray-900">{{ item.title }}</span>」吗？
        </p>
        <p class="text-xs text-gray-500 mb-4">拒绝后，申请人可以在领料页面修改料单后重新提交审批</p>
        <div class="mb-4">
          <label class="text-xs text-gray-700 block mb-1">拒绝原因（必填）</label>
          <textarea
            :value="reason"
            @input="$emit('update:reason', $event.target.value)"
            rows="3"
            placeholder="请输入拒绝原因.."
            class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <!-- 弹窗底部 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="$emit('update:modelValue', false)">
          <X class="w-4 h-4 inline mr-1" />取消
        </button>
        <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="$emit('confirm')">确认拒绝</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
  reason: { type: String, default: '' }
})

defineEmits(['update:modelValue', 'update:reason', 'confirm'])
</script>
