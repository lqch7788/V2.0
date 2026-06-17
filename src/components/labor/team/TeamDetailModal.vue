<template>
  <el-dialog
    :model-value="open"
    :title="team ? `班组详情 - ${team.name}` : '班组详情'"
    width="500px"
    @update:model-value="$emit('close')"
  >
    <div v-if="team" class="space-y-3">
      <!-- 班长 -->
      <div class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block">班长</label>
        <p class="font-medium text-gray-900 mt-1">{{ team.leaderName || '未设置' }}</p>
      </div>

      <!-- 成员数量 -->
      <div class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block">成员数量</label>
        <p class="font-medium text-gray-900 mt-1">{{ team.memberCount || 0 }} 人</p>
      </div>

      <!-- 成员ID列表 -->
      <div class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block mb-2">成员列表</label>
        <div class="space-y-2">
          <template v-if="team.memberIds && team.memberIds.length > 0">
            <div v-for="memberId in team.memberIds" :key="memberId" class="flex items-center justify-between p-2 bg-white rounded">
              <span class="text-sm text-gray-900">{{ getMemberName(memberId) }}</span>
              <el-tag size="small" type="info">组员</el-tag>
            </div>
          </template>
          <p v-else class="text-gray-400 text-sm">暂无成员</p>
        </div>
      </div>

      <!-- 作业区域 -->
      <div v-if="team.workZone" class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block">作业区域</label>
        <p class="font-medium text-gray-900 mt-1">{{ team.workZone }}</p>
      </div>

      <!-- 班组描述 -->
      <div v-if="team.description" class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block">班组描述</label>
        <p class="font-medium text-gray-900 mt-1">{{ team.description }}</p>
      </div>

      <!-- 技能标签 -->
      <div class="p-3 bg-gray-50 rounded-lg">
        <label class="text-xs text-gray-500 block mb-2">技能标签</label>
        <div class="flex flex-wrap gap-2">
          <span class="text-gray-400 text-sm">待定（需关联工人技能数据）</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { useTeamStore } from '@/stores/modules/team'

defineProps({
  open: { type: Boolean, default: false },
  team: { type: Object, default: null },
})

defineEmits(['close'])

// 与V1.1 L48 getWorkerName 1:1 对齐：从 store 获取真实姓名
const store = useTeamStore()
function getMemberName(id) {
  return store.getWorkerName(id)
}
</script>
