<!--
  技能档案页面（V1.1 风格）
  对标 V1.1 src/components/labor/skill/SkillPage.tsx
-->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">技能列表</h2>
        <el-button type="primary" @click="showForm = true">
          <el-icon><Plus /></el-icon>新增技能
        </el-button>
      </div>
      <SkillTable :data="skills" />
    </div>
    <SkillFormModal v-model="showForm" />
    <SkillMatch />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import SkillTable from './SkillTable.vue'
import SkillFormModal from './SkillFormModal.vue'
import SkillMatch from './SkillMatch.vue'

const showForm = ref(false)

const skills = ref([
  { code: 'SK001', name: '番茄种植', category: 'planting', level: 4, description: '精通番茄种植' },
  { code: 'SK002', name: '生菜种植', category: 'planting', level: 3, description: '熟悉生菜种植' },
  { code: 'SK003', name: '施肥管理', category: 'fertilizer', level: 5, description: '精通施肥' },
  { code: 'SK004', name: '采收管理', category: 'harvest', level: 4, description: '熟练采收' },
])
</script>