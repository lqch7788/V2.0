<!--
  派遣推荐组件
  对标 V1.1 src/components/labor/dispatch/DispatchRecommend.tsx
-->
<template>
  <div class="bg-white rounded-xl p-4 shadow-sm">
    <h3 class="font-semibold mb-3 flex items-center gap-2">
      <el-icon :size="18" color="#059669"><MagicStick /></el-icon>
      智能派遣推荐
    </h3>
    <p v-if="!recommendations?.length" class="text-sm text-gray-500">暂无推荐</p>
    <div v-else class="space-y-2">
      <div
        v-for="(rec, idx) in recommendations"
        :key="idx"
        class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
        :class="idx === 0 ? 'bg-emerald-50 border border-emerald-200' : 'border border-gray-200'"
        @click="$emit('select', rec)"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon :size="18" color="#059669"><User /></el-icon>
          </div>
          <div>
            <div class="font-medium text-sm">
              {{ rec.workerName }}
              <el-tag v-if="idx === 0" type="success" size="small" class="ml-2">最佳</el-tag>
            </div>
            <div class="text-xs text-gray-500">{{ rec.position }} · 评分 {{ rec.score }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">推荐度</div>
          <el-progress :percentage="rec.score" :stroke-width="6" :show-text="false" class="!w-24" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagicStick, User } from '@element-plus/icons-vue'

defineProps({
  recommendations: { type: Array, default: () => [] },
})

defineEmits(['select'])
</script>