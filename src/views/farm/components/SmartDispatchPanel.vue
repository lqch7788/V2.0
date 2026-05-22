<template>
  <div class="space-y-4">
    <!-- 页面标题 - 智能派工建议 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <el-icon :size="20" class="text-white"><MagicStick /></el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">智能派工建议</h2>
          <p class="text-xs text-gray-500">基于技能、位置、负荷的智能推荐算法</p>
        </div>
      </div>
    </div>

    <!-- 决策因素说明 -->
    <div class="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="20" class="text-emerald-600"><MagicStick /></el-icon>
        <span class="font-semibold text-gray-900">派工决策因素与权重</span>
      </div>
      <div class="grid grid-cols-5 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-600">30%</div>
          <div class="text-xs text-gray-600 mt-1">技能匹配度</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">25%</div>
          <div class="text-xs text-gray-600 mt-1">地理位置</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-amber-600">20%</div>
          <div class="text-xs text-gray-600 mt-1">当前负荷</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">15%</div>
          <div class="text-xs text-gray-600 mt-1">历史表现</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">10%</div>
          <div class="text-xs text-gray-600 mt-1">紧急程度</div>
        </div>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 左侧：待派工任务列表 -->
      <div class="space-y-3">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">待派工任务</h3>
          </div>
          <div class="p-2 max-h-96 overflow-y-auto">
            <div
              v-for="task in dispatchTasks"
              :key="task.id"
              :class="[
                'p-3 mb-2 rounded-lg border-2 cursor-pointer transition-all',
                selectedTask?.id === task.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
              @click="selectTask(task)"
            >
              <div class="flex items-center justify-between mb-2">
                <el-tag :type="getPriorityType(task.priority)" size="small">
                  {{ task.priority }}
                </el-tag>
                <span class="text-xs text-gray-400">{{ task.taskCode }}</span>
              </div>
              <div class="font-medium text-gray-900 text-sm mb-1">{{ task.taskName }}</div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <el-icon><Location /></el-icon>
                  {{ task.workZone }}
                </span>
                <span class="flex items-center gap-1">
                  <el-icon><Clock /></el-icon>
                  {{ task.estimatedHours }}h
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <el-tag
                  v-for="skill in task.requiredSkills.slice(0, 3)"
                  :key="skill"
                  size="small"
                  type="info"
                >
                  {{ skill }}
                </el-tag>
                <el-tag v-if="task.requiredSkills.length > 3" size="small" type="info">
                  +{{ task.requiredSkills.length - 3 }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：推荐结果 -->
      <div class="space-y-3">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">智能推荐</h3>
            <p v-if="selectedTask" class="text-xs text-gray-500 mt-1">
              为 <span class="font-medium">{{ selectedTask.taskName }}</span> 推荐的员工
            </p>
          </div>
          <div class="p-3 max-h-96 overflow-y-auto">
            <div v-if="!selectedTask" class="flex flex-col items-center justify-center py-12 text-gray-500">
              <el-icon :size="48" class="text-gray-300 mb-3"><CircleCheck /></el-icon>
              <p>请选择左侧任务</p>
              <p class="text-xs text-gray-400 mt-1">系统将自动生成推荐</p>
            </div>
            <div v-else-if="recommendations.length > 0" class="space-y-3">
              <div
                v-for="(worker, index) in recommendations"
                :key="worker.id"
                :class="[
                  'p-3 rounded-lg border-2 cursor-pointer transition-all',
                  index === 0
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <el-avatar :size="32" :style="{ backgroundColor: getAvatarColor(index) }">
                      {{ worker.name.charAt(0) }}
                    </el-avatar>
                    <div>
                      <div class="font-medium text-gray-900">{{ worker.name }}</div>
                      <div class="text-xs text-gray-500">{{ worker.role }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-emerald-600">{{ worker.matchScore }}分</div>
                    <div class="text-xs text-gray-400">匹配度</div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1 mt-2">
                  <el-tag
                    v-for="skill in worker.skills.slice(0, 3)"
                    :key="skill"
                    size="small"
                    type="success"
                  >
                    {{ skill }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：任务详情与推荐理由 -->
      <div class="space-y-3">
        <!-- 任务详情 -->
        <div v-if="selectedTask" class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">任务详情</h3>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">任务编号</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.taskCode }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">任务名称</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.taskName }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">任务类型</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.taskType }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">优先级</span>
              <el-tag :type="getPriorityType(selectedTask.priority)" size="small">
                {{ selectedTask.priority }}
              </el-tag>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">工作区域</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.workZone }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">预计工时</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.estimatedHours }}小时</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">截止日期</span>
              <span class="text-gray-900 font-medium">{{ selectedTask.dueDate }}</span>
            </div>
            <div v-if="selectedTask.description">
              <span class="text-sm text-gray-500">任务描述</span>
              <p class="text-sm text-gray-900 mt-1">{{ selectedTask.description }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">所需技能</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <el-tag
                  v-for="skill in selectedTask.requiredSkills"
                  :key="skill"
                  size="small"
                  type="primary"
                >
                  {{ skill }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐理由说明 -->
        <div v-if="recommendations.length > 0" class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">推荐理由说明</h3>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-start gap-2">
              <el-icon :size="20" class="text-emerald-500 mt-0.5"><CircleCheck /></el-icon>
              <div>
                <div class="font-medium text-gray-900">技能匹配度 (30%)</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  根据任务所需技能与员工持有技能的匹配程度计算，匹配度越高分数越高
                </div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <el-icon :size="20" class="text-blue-500 mt-0.5"><Location /></el-icon>
              <div>
                <div class="font-medium text-gray-900">地理位置 (25%)</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  根据员工当前位置与任务工作区域的距离计算，距离越近分数越高
                </div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <el-icon :size="20" class="text-amber-500 mt-0.5"><Clock /></el-icon>
              <div>
                <div class="font-medium text-gray-900">当前负荷 (20%)</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  根据员工当前任务负荷情况计算，负荷越低分数越高
                </div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <el-icon :size="20" class="text-purple-500 mt-0.5"><Star /></el-icon>
              <div>
                <div class="font-medium text-gray-900">历史表现 (15%)</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  根据员工近30天的任务完成情况、考勤记录等综合评分
                </div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <el-icon :size="20" class="text-red-500 mt-0.5"><Warning /></el-icon>
              <div>
                <div class="font-medium text-gray-900">紧急程度 (10%)</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  根据任务优先级计算，紧急任务会优先分配给效率高的员工
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MagicStick, Location, Clock, CircleCheck, Star, Warning } from '@element-plus/icons-vue'

// 待派工任务列表
const dispatchTasks = ref([
  {
    id: '1',
    taskCode: 'TT202401001',
    taskName: '紧急病虫害防治',
    taskType: '植保',
    priority: '紧急',
    workZone: '1号大棚',
    estimatedHours: 4,
    dueDate: '2024-01-20',
    description: '发现番茄叶霉病，需要紧急处理',
    requiredSkills: ['植保', '病虫害识别', '喷药操作']
  },
  {
    id: '2',
    taskCode: 'NS202401002',
    taskName: '番茄施肥作业',
    taskType: '施肥',
    priority: '高',
    workZone: '2号大棚',
    estimatedHours: 6,
    dueDate: '2024-01-22',
    description: '按计划进行番茄生长期施肥',
    requiredSkills: ['施肥', '农具操作']
  },
  {
    id: '3',
    taskCode: 'NS202401003',
    taskName: '黄瓜浇水任务',
    taskType: '灌溉',
    priority: '中',
    workZone: '3号大棚',
    estimatedHours: 2,
    dueDate: '2024-01-21',
    description: '近期降雨不足，需要临时补水',
    requiredSkills: ['灌溉']
  }
])

// 选中的任务
const selectedTask = ref(null)

// 推荐结果
const recommendations = computed(() => {
  if (!selectedTask.value) return []

  // 模拟推荐算法返回的结果
  return [
    { id: '1', name: '张三', role: '农技师', skills: ['植保', '施肥', '灌溉'], matchScore: 95 },
    { id: '2', name: '李四', role: '技术员', skills: ['植保', '修剪'], matchScore: 82 },
    { id: '3', name: '王五', role: '工人', skills: ['施肥', '灌溉'], matchScore: 75 },
    { id: '4', name: '赵六', role: '工人', skills: ['除草', '灌溉'], matchScore: 68 }
  ]
})

// 选择任务
const selectTask = (task) => {
  selectedTask.value = task
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    '紧急': 'danger',
    '高': 'warning',
    '中': 'primary',
    '低': 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取头像颜色
const getAvatarColor = (index) => {
  const colors = ['#67C23A', '#409EFF', '#E6A23C', '#909399']
  return colors[index % colors.length]
}
</script>
