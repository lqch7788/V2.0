<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <el-icon :size="20" class="text-white"><Cpu /></el-icon>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">智能派工</h1>
            <p class="text-xs text-gray-500">AI综合评分 · 多源任务整合</p>
          </div>
        </div>
        <el-button type="primary" @click="showConfigPanel = true">
          <el-icon><MagicStick /></el-icon>
          配置中心
        </el-button>
      </div>
    </div>

    <!-- 监控仪表板 -->
    <div class="grid grid-cols-4 gap-3">
      <div v-for="metric in metricsData" :key="metric.label" class="bg-white rounded-lg p-3 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500">{{ metric.label }}</p>
            <p :class="['text-lg font-bold', metric.color]">{{ metric.value }}</p>
          </div>
          <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', metric.bgColor]">
            <el-icon :size="18" :class="metric.iconColor"><component :is="metric.icon" /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 决策因素说明 -->
    <div class="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="20" class="text-emerald-600"><MagicStick /></el-icon>
        <span class="font-semibold text-gray-900">派工决策因素与权重</span>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <div v-for="item in dispatchWeights" :key="item.label" class="text-center">
          <div :class="['text-lg font-bold', item.color]">{{ item.value }}</div>
          <div class="text-xs text-gray-600 mt-0.5">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 预测任务面板 -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="18" class="text-purple-600"><TrendCharts /></el-icon>
        <span class="font-semibold text-gray-900">预测与预警</span>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div v-for="alert in predictedAlerts" :key="alert.title" :class="['p-3 rounded-lg border', alert.bgColor]">
          <div class="flex items-center gap-2 mb-1">
            <el-icon :size="16" :class="alert.iconColor"><WarningFilled /></el-icon>
            <span :class="['text-sm font-medium', alert.textColor]">{{ alert.title }}</span>
          </div>
          <p class="text-xs text-gray-600">{{ alert.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-3">
      <div v-for="stat in confirmStatsData" :key="stat.label" class="bg-white rounded-lg px-3 py-2 border border-gray-200">
        <div class="flex items-center gap-2">
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm', stat.bg]">
            {{ stat.emoji }}
          </div>
          <div class="flex-1">
            <div class="text-xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务分组列表 -->
    <div class="space-y-4">
      <!-- AI已推荐 - 表格显示 -->
      <div v-if="recommendedTasks.length > 0" class="space-y-2">
        <h3 class="text-sm font-bold text-gray-900">
          AI已推荐 <span class="ml-1 text-xs font-normal text-gray-400">({{ recommendedTasks.length }})</span>
        </h3>
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold">选择</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">来源</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">任务编号</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">任务标题</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">类型</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">位置</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">优先级</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">AI推荐人</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">置信度</th>
                <th class="px-3 py-2 text-left text-xs font-semibold">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-for="task in recommendedTasks" :key="task.id"
                @click="selectedTask = task"
                :class="['cursor-pointer transition-colors', selectedTask?.id === task.id ? 'bg-blue-50' : 'hover:bg-gray-50']">
                <td class="px-3 py-2">
                  <span :class="['w-5 h-5 rounded flex items-center justify-center text-xs', selectedTask?.id === task.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600']">
                    {{ selectedTask?.id === task.id ? '✓' : '' }}
                  </span>
                </td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ task.sourceLabel }}</td>
                <td class="px-3 py-2 text-xs text-gray-500 font-mono">{{ task.taskCode || '-' }}</td>
                <td class="px-3 py-2 text-sm font-medium text-gray-900 max-w-xs truncate">{{ task.title }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ task.typeName }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ task.workZone || task.greenhouse || '-' }}</td>
                <td class="px-3 py-2">
                  <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', priorityColors[task.priority] || priorityColors.normal]">
                    {{ priorityLabel(task.priority) }}
                  </span>
                </td>
                <td class="px-3 py-2 text-sm font-medium text-emerald-700">{{ task.recommendedWorker || '-' }}</td>
                <td class="px-3 py-2 text-xs text-emerald-600">{{ task.confidenceScore ? task.confidenceScore + '%' : '-' }}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center gap-1">
                    <el-button size="small" type="success" :disabled="!task.recommendedWorker" @click.stop="handleAccept(task)">接受</el-button>
                    <el-button size="small" @click.stop="selectedTask = task; showReplaceModal = true">更换</el-button>
                    <el-button size="small" @click.stop="selectedTask = task; showDelayModal = true">延后</el-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 其他任务组 - 卡片显示 -->
      <div v-for="group in otherTaskGroups" :key="group.title">
        <div v-if="group.tasks.length > 0" class="space-y-3">
          <button @click="group.expanded = !group.expanded"
            class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ group.icon }}</span>
              <span class="font-medium text-gray-900">{{ group.title }}</span>
              <span class="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">{{ group.tasks.length }}</span>
            </div>
            <el-icon :size="20" class="text-gray-500 transition-transform" :class="{ 'rotate-180': group.expanded }"><ArrowDown /></el-icon>
          </button>
          <div v-show="group.expanded" class="grid grid-cols-2 gap-4">
            <div v-for="task in group.tasks" :key="task.id"
              @click="selectedTask = task"
              :class="['bg-white rounded-lg border-2 transition-all cursor-pointer', selectedTask?.id === task.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400']">
              <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span :class="['w-5 h-5 rounded flex items-center justify-center text-xs', selectedTask?.id === task.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600']">
                    {{ selectedTask?.id === task.id ? '✓' : '' }}
                  </span>
                  <span class="text-xs text-gray-500">{{ task.sourceLabel }}</span>
                </div>
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', statusColors[task.dispatchStatus]?.bg, statusColors[task.dispatchStatus]?.text]">
                  {{ statusColors[task.dispatchStatus]?.label }}
                </span>
              </div>
              <div class="p-4">
                <h4 class="font-medium text-gray-900 mb-2 line-clamp-1">{{ task.title }}</h4>
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
                  <span>{{ task.typeName }}</span>
                  <span>|</span>
                  <span>{{ task.workZone || task.greenhouse || '-' }}</span>
                  <span>|</span>
                  <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', priorityColors[task.priority] || priorityColors.normal]">
                    {{ priorityLabel(task.priority) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <el-button v-if="task.dispatchStatus === 'optimization'" size="small" type="success" @click.stop="handleAcceptOptimization(task)">接受优化</el-button>
                  <el-button v-else size="small" type="success" :disabled="!task.recommendedWorker" @click.stop="handleAccept(task)">接受</el-button>
                  <el-button size="small" @click.stop="selectedTask = task; showReplaceModal = true">更换</el-button>
                  <el-button size="small" @click.stop="selectedTask = task; showDelayModal = true">延后</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 物料设备状态面板 -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center gap-2 mb-3">
        <el-icon :size="18" class="text-amber-600"><Goods /></el-icon>
        <span class="font-semibold text-gray-900">物料设备状态</span>
      </div>
      <div class="grid grid-cols-4 gap-3">
        <div v-for="item in materialStats" :key="item.label" class="bg-gray-50 rounded-lg p-3 text-center">
          <div :class="['text-xl font-bold', item.color]">{{ item.value }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 派发结果提示 -->
    <div v-if="dispatchResult" :class="['p-3 rounded-lg flex items-center gap-2', dispatchResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
      <el-icon :size="20"><CircleCheck v-if="dispatchResult.success" /><CircleClose v-else /></el-icon>
      {{ dispatchResult.message }}
    </div>

    <!-- 四栏布局：任务池 → 推荐 → 详情+因子 → 环境 -->
    <div class="grid grid-cols-4 gap-4">
      <!-- 左侧：任务池 -->
      <div class="col-span-1">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">任务池</h3>
            <div class="mt-2">
              <el-select v-model="sourceFilter" size="small" style="width: 100%" @change="handleSourceFilter">
                <el-option label="全部来源" value="all" />
                <el-option label="任务派发" value="task" />
                <el-option label="临时任务" value="tempTask" />
                <el-option label="巡检" value="inspection" />
                <el-option label="人工分配" value="manual" />
              </el-select>
            </div>
          </div>
          <div class="p-3 max-h-96 overflow-y-auto space-y-2">
            <!-- P8 U1 - 任务池顶部全选 -->
            <div v-if="filteredTaskPool.length > 0" class="flex items-center justify-between pb-1 border-b border-gray-100">
              <span class="text-xs text-gray-500">共 {{ filteredTaskPool.length }} 个</span>
              <el-button size="small" link @click="handleSelectAll">
                {{ isAllSelected ? '取消全选' : '全选' }}
              </el-button>
            </div>
            <div v-for="task in filteredTaskPool" :key="task.id"
              @click="selectedTask = task"
              :class="['p-3 rounded-lg border cursor-pointer transition-colors', selectedTask?.id === task.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50']">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <!-- P14 I4 - 任务池多选 checkbox -->
                  <input type="checkbox" :checked="selectedTasks.has(task.id)" @change="toggleTaskSelection(task, $event)"
                    @click.stop class="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</span>
                </div>
                <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', priorityColors[task.priority] || priorityColors.normal]">
                  {{ priorityLabel(task.priority) }}
                </span>
              </div>
              <div class="text-xs text-gray-500">{{ task.typeName }} · {{ task.workZone || task.greenhouse }}</div>
            </div>
            <div v-if="filteredTaskPool.length === 0" class="text-center py-8 text-gray-400">暂无任务</div>
          </div>
        </div>
      </div>

      <!-- 中左：AI推荐 -->
      <div class="col-span-1">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">智能推荐</h3>
            <p v-if="selectedTask" class="text-xs text-gray-500 mt-1">为 <span class="font-medium">{{ selectedTask.title }}</span> 推荐的员工</p>
          </div>
          <div class="p-3 max-h-96 overflow-y-auto">
            <div v-if="!selectedTask" class="flex flex-col items-center justify-center py-12 text-gray-500">
              <el-icon :size="48" class="text-gray-300 mb-3"><CircleCheck /></el-icon>
              <p>请选择左侧任务</p>
              <p class="text-xs text-gray-400 mt-1">系统将自动生成推荐</p>
            </div>
            <!-- P15 S1 - AI 推荐加载状态（V1.1 isLoadingAI + spinner 1:1） -->
            <div v-else-if="isLoadingAI" class="flex items-center justify-center py-8 text-gray-500">
              <div class="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
              <span class="ml-3 text-sm">正在分析最优执行人...</span>
            </div>
            <div v-else class="space-y-2">
              <div v-for="(rec, index) in currentRecommendations" :key="rec.workerId"
                :class="['p-3 rounded-lg border-2 transition-all', index === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400']">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', index === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600']">
                      {{ index + 1 }}
                    </span>
                    <span class="font-medium text-gray-900">{{ rec.workerName }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span :class="['px-1.5 py-0.5 rounded text-xs font-medium', rec.confidenceLevel === 'high' ? 'bg-green-100 text-green-700' : rec.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600']">
                      {{ rec.confidenceLevel === 'high' ? '高' : rec.confidenceLevel === 'medium' ? '中' : '低' }}置信
                    </span>
                    <span class="text-sm font-bold text-emerald-600">{{ rec.matchScore }}分</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>{{ rec.workZone }}</span>
                  <span>负荷{{ rec.currentLoad }}%</span>
                </div>
                <div class="flex flex-wrap gap-1 mb-2">
                  <!-- P5 I1 - 推荐理由双向显示（正/负） -->
                  <span v-for="(reason, i) in rec.positiveReasons" :key="'p'+i" class="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{{ reason }}</span>
                  <span v-for="(reason, i) in rec.negativeReasons" :key="'n'+i" class="px-1.5 py-0.5 rounded text-xs bg-red-50 text-red-700 border border-red-200">{{ reason }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <el-button size="small" type="success" :disabled="!rec.isAvailable" @click="handleDispatch(rec)">派发</el-button>
                  <el-button size="small" @click="selectedTask = task; showDelayModal = true">延后</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中右：任务详情 + 推荐理由 -->
      <div class="col-span-1 space-y-3">
        <div v-if="selectedTask" class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">任务详情</h3>
          </div>
          <div class="p-4 space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-gray-500">任务编号</span><span class="text-gray-900 font-medium">{{ selectedTask.taskCode || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">任务标题</span><span class="text-gray-900 font-medium">{{ selectedTask.title }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">任务类型</span><span class="text-gray-900">{{ selectedTask.typeName }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">优先级</span>
              <span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', priorityColors[selectedTask.priority] || priorityColors.normal]">
                {{ priorityLabel(selectedTask.priority) }}
              </span>
            </div>
            <div class="flex justify-between"><span class="text-gray-500">工作区域</span><span class="text-gray-900">{{ selectedTask.workZone || selectedTask.greenhouse }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">预计工时</span><span class="text-gray-900">{{ selectedTask.estimatedHours || 2 }}小时</span></div>
            <div v-if="selectedTask.batchCode" class="flex justify-between"><span class="text-gray-500">关联批次</span><span class="text-gray-900">{{ selectedTask.batchCode }}</span></div>
          </div>
        </div>

        <!-- 推荐理由说明 -->
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">推荐理由说明</h3>
          </div>
          <div class="p-4 space-y-3">
            <div v-for="factor in factorDescriptions" :key="factor.label" class="flex items-start gap-2">
              <el-icon :size="20" :class="[factor.iconColor, 'flex-shrink-0']"><component :is="factor.icon" /></el-icon>
              <div>
                <div class="font-medium text-gray-900 text-sm">{{ factor.label }} ({{ factor.weight }})</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ factor.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- P11 S1/D3 - 任务进度时间轴（V1.1 TaskProgressTimeline 1:1） -->
        <div v-if="selectedTask" class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">任务进度</h3>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              <div v-for="(step, i) in taskProgressSteps" :key="i" class="flex items-start gap-2">
                <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  step.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500']">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 pb-2 border-l-2 border-gray-100 pl-3 -ml-3" :class="{'border-transparent': i === taskProgressSteps.length - 1}">
                  <div :class="['text-sm font-medium', step.done ? 'text-gray-900' : 'text-gray-400']">
                    {{ step.label }}
                  </div>
                  <div v-if="step.time" class="text-xs text-gray-500 mt-0.5">{{ step.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最右侧：环境面板 -->
      <div class="col-span-1">
        <div class="bg-white rounded-lg border border-gray-200">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">环境信息</h3>
          </div>
          <div class="p-4 space-y-4">
            <!-- 今日天气 -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">今日天气</h4>
              <div class="bg-blue-50 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-700">{{ todayWeather.condition }}</span>
                  <span class="text-2xl font-bold text-blue-600">{{ todayWeather.temp }}°C</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <span>湿度: {{ todayWeather.humidity }}%</span>
                  <span>风速: {{ todayWeather.windSpeed }}</span>
                </div>
                <div v-if="todayWeather.recommendation" class="mt-2 text-xs text-emerald-600 bg-emerald-50 rounded p-2">
                  建议: {{ todayWeather.recommendation }}
                </div>
              </div>
            </div>

            <!-- 传感器状态 -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">传感器状态</h4>
              <div class="space-y-2">
                <div v-for="sensor in sensors" :key="sensor.name" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ sensor.name }}</span>
                  <span :class="sensor.status === 'normal' ? 'text-emerald-600' : 'text-red-600'">
                    {{ sensor.value }}{{ sensor.unit }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 预警信息 -->
            <div v-if="alerts.length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-2">预警信息</h4>
              <div class="space-y-1">
                <div v-for="(alert, i) in alerts" :key="i" :class="['text-xs p-2 rounded', alert.level === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600']">
                  {{ alert.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 弹窗 ===== -->

    <!-- 延后弹窗 -->
    <el-dialog v-model="showDelayModal" title="延后派发" width="360px">
      <p class="text-sm text-gray-600 mb-4">将任务延后派发</p>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">延后天数</label>
        <div class="flex gap-2">
          <button v-for="day in 7" :key="day" @click="delayDays = day"
            :class="['w-10 h-10 rounded-lg text-sm font-medium transition-colors', delayDays === day ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
            {{ day }}
          </button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDelayModal = false">取消</el-button>
        <el-button type="warning" @click="handleDelayConfirm">确认延后</el-button>
      </template>
    </el-dialog>

    <!-- 拆分弹窗 -->
    <el-dialog v-model="showSplitModal" title="拆分任务" width="420px">
      <p class="text-sm text-gray-600 mb-4">选择多个执行人来分担任务</p>
      <div class="mb-4 space-y-2 max-h-60 overflow-y-auto">
        <label v-for="worker in workerList" :key="worker.id"
          :class="['flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors', selectedWorkersForSplit.includes(worker.id) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100']">
          <input type="checkbox" :checked="selectedWorkersForSplit.includes(worker.id)"
            @change="toggleSplitWorker(worker.id)" class="w-4 h-4 text-blue-600 rounded" />
          <div class="flex-1"><div class="font-medium text-gray-900">{{ worker.name }}</div></div>
        </label>
      </div>
      <template #footer>
        <el-button @click="showSplitModal = false">取消</el-button>
        <el-button type="primary" :disabled="selectedWorkersForSplit.length === 0" @click="handleSplitConfirm">
          确认拆分 ({{ selectedWorkersForSplit.length }})
        </el-button>
      </template>
    </el-dialog>

    <!-- 更换执行人弹窗 -->
    <el-dialog v-model="showReplaceModal" title="更换执行人" width="420px">
      <p class="text-sm text-gray-600 mb-4">为 <span class="font-medium">{{ selectedTask?.title }}</span> 选择新的执行人</p>
      <div class="mb-4 space-y-2 max-h-60 overflow-y-auto">
        <label v-for="worker in workerList" :key="worker.id"
          :class="['flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors', selectedReplacement?.id === worker.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100']">
          <input type="radio" :checked="selectedReplacement?.id === worker.id"
            @change="selectedReplacement = worker" class="w-4 h-4 text-blue-600" />
          <div class="flex-1"><div class="font-medium text-gray-900">{{ worker.name }}</div></div>
        </label>
      </div>
      <template #footer>
        <el-button @click="showReplaceModal = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedReplacement" @click="handleReplaceConfirm">确认更换</el-button>
      </template>
    </el-dialog>

    <!-- 配置中心弹窗 -->
    <el-dialog v-model="showConfigPanel" title="派工配置中心" width="700px" top="5vh">
      <div class="space-y-4">
        <div v-for="config in configItems" :key="config.key" class="flex items-center justify-between py-2 border-b border-gray-100">
          <div>
            <div class="font-medium text-gray-900">{{ config.label }}</div>
            <div class="text-xs text-gray-500">{{ config.desc }}</div>
          </div>
          <el-slider v-model="configWeights[config.key]" :min="0" :max="100" style="width: 200px" show-input />
        </div>
      </div>
      <template #footer>
        <el-button @click="showConfigPanel = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 CreateTaskModal.tsx 11 字段 1:1 对齐：创建任务 -->
    <el-dialog
      v-model="showCreateTaskModal"
      title="新建农事任务"
      width="700px"
    >
      <el-form :model="createTaskForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="任务编号">
              <el-input v-model="createTaskForm.taskId" placeholder="系统自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="任务类型" required>
              <el-select v-model="createTaskForm.types" placeholder="选择任务类型" style="width: 100%">
                <el-option label="施肥" value="fertilization" />
                <el-option label="灌溉" value="irrigation" />
                <el-option label="修剪" value="pruning" />
                <el-option label="植保" value="pesticide" />
                <el-option label="采收" value="harvest" />
                <el-option label="种植" value="planting" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="温室/大田" required>
              <el-input v-model="createTaskForm.field" placeholder="选择温室或大田" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="作物" required>
              <el-input v-model="createTaskForm.crop" placeholder="选择作物" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行人" required>
              <el-input v-model="createTaskForm.assignee" placeholder="选择执行人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先级" required>
              <el-select v-model="createTaskForm.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="计划开始" required>
              <el-date-picker
                v-model="createTaskForm.planStart"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划结束" required>
              <el-date-picker
                v-model="createTaskForm.planEnd"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计天数">
              <el-input-number v-model="createTaskForm.estimatedDays" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="预计小时">
          <el-input-number v-model="createTaskForm.estimatedHours" :min="0" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任务备注">
          <el-input v-model="createTaskForm.areaRemarks" type="textarea" :rows="2" placeholder="任务备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateTaskModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTaskConfirm">创建任务</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 DeleteWarningModal.tsx 1:1 对齐：删除确认 -->
    <el-dialog v-model="showDeleteWarning" title="确认删除" width="400px">
      <p class="text-sm text-gray-600">
        确定要删除选中的 <strong class="text-red-600">{{ selectedTasks.size }}</strong> 个任务吗？此操作不可撤销。
      </p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteConfirm">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 ExportFormatModal.tsx 1:1 对齐：导出格式选择 -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="400px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedTasks.size }} 个任务</p>
      <div class="space-y-3">
        <div
          v-for="format in dispatchExportFormats"
          :key="format.value"
          :class="[
            'p-4 border rounded-lg cursor-pointer transition-all',
            exportFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="exportFormat = format.value"
        >
          <div class="flex items-center">
            <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300']">
              <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
              <p class="text-xs text-gray-500">{{ format.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleExportConfirm">确认导出</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 VerifyTaskModal.tsx 1:1 对齐：任务验收 -->
    <el-dialog v-model="showVerifyModal" title="任务验收" width="500px">
      <p class="text-sm text-gray-600 mb-4">
        您即将验收：<strong>{{ selectedTask?.title || '' }}</strong>
      </p>
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="验收结果" required>
          <el-radio-group v-model="verifyForm.result">
            <el-radio value="pass">验收通过</el-radio>
            <el-radio value="reject">验收驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收意见">
          <el-input v-model="verifyForm.comments" type="textarea" :rows="3" placeholder="验收意见..." />
        </el-form-item>
        <el-form-item label="工作量">
          <el-input-number v-model="verifyForm.workload" :min="0" :step="0.5" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVerifyModal = false">取消</el-button>
        <el-button type="primary" @click="handleVerifyConfirm">确认验收</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 WithdrawCancelModal.tsx 1:1 对齐：撤回/取消 -->
    <el-dialog v-model="showWithdrawModal" title="撤回/取消任务" width="500px">
      <p class="text-sm text-gray-600 mb-4">
        您即将{{ withdrawForm.action === 'withdraw' ? '撤回' : '取消' }}：<strong>{{ selectedTask?.title || '' }}</strong>
      </p>
      <el-form :model="withdrawForm" label-width="100px">
        <el-form-item label="操作类型" required>
          <el-radio-group v-model="withdrawForm.action">
            <el-radio value="withdraw">撤回（任务回到草稿）</el-radio>
            <el-radio value="cancel">取消（任务作废）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作原因" required>
          <el-input v-model="withdrawForm.reason" type="textarea" :rows="2" placeholder="请输入原因..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWithdrawModal = false">取消</el-button>
        <el-button type="warning" @click="handleWithdrawConfirm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 OvertimeHandleModal.tsx 1:1 对齐：超时处理 -->
    <el-dialog v-model="showOvertimeModal" title="超时处理" width="500px">
      <p class="text-sm text-gray-600 mb-4">
        处理超时任务：<strong>{{ selectedTask?.title || '' }}</strong>
      </p>
      <el-form :model="overtimeForm" label-width="100px">
        <el-form-item label="处理方式" required>
          <el-radio-group v-model="overtimeForm.action">
            <el-radio value="extend">延长时限</el-radio>
            <el-radio value="reassign">重新派发</el-radio>
            <el-radio value="cancel">取消任务</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="overtimeForm.action === 'extend'" label="延长小时数">
          <el-input-number v-model="overtimeForm.extendHours" :min="0" :max="24" style="width: 100%" />
        </el-form-item>
        <el-form-item label="处理说明" required>
          <el-input v-model="overtimeForm.reason" type="textarea" :rows="2" placeholder="请输入处理说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOvertimeModal = false">取消</el-button>
        <el-button type="warning" @click="handleOvertimeConfirm">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 批量操作栏 -->
    <div v-if="selectedTasks.size > 0" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-4 z-50">
      <span class="text-sm text-gray-700">
        已选择 <span class="font-bold text-blue-600">{{ selectedTasks.size }}</span> 个任务
      </span>
      <div class="flex items-center gap-2">
        <el-button size="small" @click="handleSelectAll">
          {{ isAllSelected ? '取消全选' : '全选' }}
        </el-button>
        <el-button size="small" @click="showExportModal = true">导出</el-button>
        <el-button size="small" type="danger" @click="showDeleteWarning = true">删除</el-button>
        <el-button type="success" @click="handleBatchConfirm">
          批量确认派发
        </el-button>
        <el-button @click="selectedTasks = new Set()">取消选择</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Cpu, MagicStick, TrendCharts, WarningFilled, Goods,
  CircleCheck, CircleClose, ArrowDown, Check, Medal,
  MapLocation, Lightning, Clock, Timer, Location, List, Promotion
} from '@element-plus/icons-vue'

// ============================================
// 常量
// ============================================
const dispatchWeights = [
  { label: '技能匹配度', value: '30%', color: 'text-emerald-600' },
  { label: '地理位置', value: '20%', color: 'text-blue-600' },
  { label: '当前负荷', value: '20%', color: 'text-amber-600' },
  { label: '历史表现', value: '15%', color: 'text-purple-600' },
  { label: '紧急程度', value: '10%', color: 'text-red-600' },
  { label: '批次熟悉', value: '3%', color: 'text-pink-600' },
  { label: '周期适配', value: '2%', color: 'text-cyan-600' },
]

const priorityColors = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-700',
}

const statusColors = {
  pending_ai: { bg: 'bg-gray-100', text: 'text-gray-700', label: '待AI推荐' },
  recommended: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'AI已推荐' },
  predicted: { bg: 'bg-purple-100', text: 'text-purple-700', label: '预测任务' },
  optimization: { bg: 'bg-amber-100', text: 'text-amber-700', label: '优化建议' },
}

const priorityLabel = (p) => p === 'urgent' ? '紧急' : p === 'high' ? '高' : p === 'normal' ? '中' : '低'

const factorDescriptions = [
  { label: '技能匹配度', weight: '30%', icon: Medal, iconColor: 'text-emerald-500', desc: '根据任务所需技能与员工持有技能的匹配程度计算' },
  { label: '地理位置', weight: '20%', icon: MapLocation, iconColor: 'text-blue-500', desc: '根据员工当前位置与任务工作区域的距离计算' },
  { label: '当前负荷', weight: '20%', icon: Lightning, iconColor: 'text-amber-500', desc: '根据员工当前任务负荷情况计算，负荷越低分数越高' },
  { label: '历史表现', weight: '15%', icon: MagicStick, iconColor: 'text-purple-500', desc: '根据员工近30天的任务完成情况综合评分' },
  { label: '紧急程度', weight: '10%', icon: WarningFilled, iconColor: 'text-red-500', desc: '根据任务优先级计算，紧急任务优先分配给效率高的员工' },
]

// P11 D3 - 任务进度时间轴（V1.1 TaskProgressTimeline 1:1）
const taskProgressSteps = computed(() => {
  if (!selectedTask.value) return []
  const t = selectedTask.value
  const steps = [
    { label: '任务创建', done: true, time: t.taskCode ? '已生成' : '-' },
    { label: 'AI推荐生成', done: ['recommended', 'optimization', 'dispatched'].includes(t.dispatchStatus), time: t.recommendedWorker ? `推荐 ${t.recommendedWorker}` : '待生成' },
    { label: '执行人确认', done: t.dispatchStatus === 'dispatched' || !!t.dispatchedAt, time: t.dispatchedAt ? new Date(t.dispatchedAt).toLocaleString('zh-CN') : '待确认' },
    { label: '执行中', done: false, time: '执行中' },
    { label: '验收完成', done: false, time: '待验收' },
  ]
  return steps
})

// ============================================
// 模拟数据
// ============================================
const todayWeather = { condition: '晴转多云', temp: 26, humidity: 65, windSpeed: '3-4级', recommendation: '适宜户外农事作业' }

const sensors = [
  { name: '1号温室温度', value: 24.5, unit: '°C', status: 'normal' },
  { name: '1号温室湿度', value: 72, unit: '%', status: 'normal' },
  { name: '2号温室温度', value: 26.1, unit: '°C', status: 'normal' },
  { name: '土壤pH值', value: 6.8, unit: '', status: 'normal' },
  { name: 'CO2浓度', value: 420, unit: 'ppm', status: 'normal' },
]

const alerts = [
  { level: 'warning', message: '3号温室温度偏高(30.2°C)，建议开启通风' },
]

const predictedAlerts = [
  { title: '逾期任务', desc: '3个任务即将逾期，需尽快处理', bgColor: 'bg-red-50 border-red-200', iconColor: 'text-red-500', textColor: 'text-red-700' },
  { title: '病虫害预警', desc: '1号温室番茄有白粉虱风险', bgColor: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-500', textColor: 'text-amber-700' },
  { title: '预测任务', desc: '未来3天预计新增12个农事任务', bgColor: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-500', textColor: 'text-blue-700' },
]

const metricsData = [
  { label: '任务池总量', value: 48, color: 'text-blue-600', bgColor: 'bg-blue-50', icon: List, iconColor: 'text-blue-500' },
  { label: '已推荐', value: 23, color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CircleCheck, iconColor: 'text-emerald-500' },
  { label: '已派发', value: 15, color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Promotion, iconColor: 'text-purple-500' },
  { label: '完成率', value: '68%', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: TrendCharts, iconColor: 'text-orange-500' },
]

const materialStats = [
  { label: '物料库存充足率', value: '85%', color: 'text-emerald-600' },
  { label: '设备可用率', value: '92%', color: 'text-blue-600' },
  { label: '设备预警', value: '2台', color: 'text-red-600' },
  { label: '待采购物资', value: '5项', color: 'text-amber-600' },
]

const confirmStatsData = [
  { label: '待AI推荐', value: 12, bg: 'bg-gray-500', emoji: '⏳' },
  { label: 'AI已推荐', value: 18, bg: 'bg-emerald-500', emoji: '✅' },
  { label: '预测任务', value: 8, bg: 'bg-purple-500', emoji: '🔮' },
  { label: '优化建议', value: 5, bg: 'bg-amber-500', emoji: '💡' },
]

// 模拟任务数据
const mockTasks = [
  { id: 't1', taskCode: 'NT2026052601', title: '1号温室番茄灌溉作业', typeName: '灌溉', workZone: '1号温室', priority: 'high', sourceLabel: '农事任务', recommendedWorker: '张三', confidenceScore: 92, dispatchStatus: 'recommended', estimatedHours: 2 },
  { id: 't2', taskCode: 'NT2026052602', title: '2号温室黄瓜施肥作业', typeName: '施肥', workZone: '2号温室', priority: 'normal', sourceLabel: '农事任务', recommendedWorker: '李四', confidenceScore: 88, dispatchStatus: 'recommended', estimatedHours: 1.5 },
  { id: 't3', taskCode: 'NT2026052603', title: '3号温室辣椒植保喷洒', typeName: '植保', workZone: '3号温室', priority: 'urgent', sourceLabel: '巡查问题', recommendedWorker: '王五', confidenceScore: 85, dispatchStatus: 'recommended', estimatedHours: 3 },
  { id: 't4', taskCode: 'LS2026052601', title: '4号温室排水沟清理', typeName: '临时任务', workZone: '4号温室', priority: 'normal', sourceLabel: '临时任务', recommendedWorker: '', confidenceScore: 0, dispatchStatus: 'pending_ai', estimatedHours: 1 },
  { id: 't5', taskCode: 'LS2026052602', title: '6号温室补光设备检修', typeName: '临时任务', workZone: '6号温室', priority: 'low', sourceLabel: '临时任务', recommendedWorker: '', confidenceScore: 0, dispatchStatus: 'pending_ai', estimatedHours: 0.5 },
  { id: 't6', taskCode: 'YC2026052601', title: '5号温室未来3天灌溉预测', typeName: '灌溉', workZone: '5号温室', priority: 'normal', sourceLabel: '预测任务', recommendedWorker: '', confidenceScore: 0, dispatchStatus: 'predicted', estimatedHours: 2 },
  { id: 't7', taskCode: 'NT2026052604', title: '1号温室番茄采收(优化)', typeName: '采收', workZone: '1号温室', priority: 'high', sourceLabel: '农事任务', recommendedWorker: '赵六', confidenceScore: 78, dispatchStatus: 'optimization', estimatedHours: 4 },
]

const workerList = [
  { id: 'w1', name: '张三', workZone: '1号温室', currentLoad: 40 },
  { id: 'w2', name: '李四', workZone: '2号温室', currentLoad: 60 },
  { id: 'w3', name: '王五', workZone: '3号温室', currentLoad: 85 },
  { id: 'w4', name: '赵六', workZone: '4号温室', currentLoad: 50 },
  { id: 'w5', name: '钱七', workZone: '5号温室', currentLoad: 30 },
  { id: 'w6', name: '孙八', workZone: '6号温室', currentLoad: 70 },
]

// ============================================
// 主状态
// ============================================
const selectedTask = ref(null)
const selectedTasks = ref(new Set())
const sourceFilter = ref('all')
const dispatchResult = ref(null)
const showDelayModal = ref(false)
const delayDays = ref(1)
const showSplitModal = ref(false)
const selectedWorkersForSplit = ref([])
const showReplaceModal = ref(false)
const selectedReplacement = ref(null)
const showConfigPanel = ref(false)

// ============ 与 V1.1 taskDispatch 6 modal 1:1 对齐：6 个新 modal state ============
const showCreateTaskModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const showVerifyModal = ref(false)
const showWithdrawModal = ref(false)
const showOvertimeModal = ref(false)

const createTaskForm = reactive({
  taskId: '',
  types: '',
  typeRemarks: '',
  field: '',
  crop: '',
  cropRemarks: '',
  areaRemarks: '',
  assignee: '',
  planStart: '',
  planEnd: '',
  priority: 'medium',
  estimatedDays: 0,
  estimatedHours: 0,
})
const verifyForm = reactive({ result: 'pass', comments: '', workload: 0 })
const withdrawForm = reactive({ action: 'withdraw', reason: '' })
const overtimeForm = reactive({ action: 'extend', extendHours: 0, reason: '' })
const exportFormat = ref('excel')
const dispatchExportFormats = [
  { value: 'excel', label: 'Excel (.xls)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.doc)', desc: '适用于文档编辑和分享' },
]
const configWeights = reactive({
  skill: 30, location: 20, load: 20, performance: 15, urgency: 10, batchFamiliarity: 3, cycleAdaptation: 2,
})

const configItems = [
  { key: 'skill', label: '技能匹配度', desc: '根据员工技能标签与任务所需技能的匹配程度计算' },
  { key: 'location', label: '地理位置', desc: '基于员工当前位置与任务工作区域之间的距离评分' },
  { key: 'load', label: '当前负荷', desc: '考虑员工当前待处理任务数量与工作强度' },
  { key: 'performance', label: '历史表现', desc: '近30天任务完成率、完成质量和时效性综合评分' },
  { key: 'urgency', label: '紧急程度', desc: '任务优先级和截止时间对派工的影响程度' },
  { key: 'batchFamiliarity', label: '批次熟悉度', desc: '员工对相关作物批次的历史操作经验' },
  { key: 'cycleAdaptation', label: '周期适配', desc: '员工作息周期与任务时间窗口的适配程度' },
]

// ============================================
// 计算属性
// ============================================
const recommendedTasks = computed(() => mockTasks.filter(t => t.dispatchStatus === 'recommended'))

const otherTaskGroups = reactive([
  { title: '待AI推荐', icon: '⏳', expanded: true, get tasks() { return mockTasks.filter(t => t.dispatchStatus === 'pending_ai') } },
  { title: '预测任务', icon: '🔮', expanded: true, get tasks() { return mockTasks.filter(t => t.dispatchStatus === 'predicted') } },
  { title: '优化建议', icon: '💡', expanded: true, get tasks() { return mockTasks.filter(t => t.dispatchStatus === 'optimization') } },
])

// 来源筛选（V1.1 FilterToolbar 来源部分 1:1）
const sourceMap = {
  task: '农事任务',
  tempTask: '临时任务',
  inspection: '巡查问题',
  manual: '人工分配',
}
const filteredTaskPool = computed(() => {
  if (sourceFilter.value === 'all') return mockTasks
  return mockTasks.filter(t => t.sourceLabel === sourceMap[sourceFilter.value])
})

// AI 推荐加载状态（P15 S1）
const isLoadingAI = ref(false)

// 5 因子权重（P3 B2 - 与 V1.1 useComprehensiveDispatch 一致）
const factorWeights = reactive({
  skill: 0.30,        // 技能匹配度
  location: 0.20,     // 地理位置
  load: 0.20,         // 当前负荷
  performance: 0.15,  // 历史表现
  urgency: 0.10,      // 紧急程度
  batchFamiliarity: 0.03, // 批次熟悉
  cycleAdaptation: 0.02,  // 周期适配
})

// 5 因子加权计算推荐分数（P3 B2 - 修复硬编码 [95,88,82,...]）
const calcMatchScore = (worker, task) => {
  // 技能匹配度：员工区域与任务区域是否一致
  const skillScore = worker.workZone === task.workZone ? 100 : 60
  // 地理位置：同上
  const locationScore = worker.workZone === task.workZone ? 100 : 70
  // 当前负荷：越低越高
  const loadScore = Math.max(0, 100 - worker.currentLoad)
  // 历史表现：模拟值（基于 currentLoad 反推）
  const perfScore = Math.max(50, 100 - worker.currentLoad * 0.5)
  // 紧急程度：urgent 任务优先给负荷低的人
  const urgencyBonus = task.priority === 'urgent' ? (100 - worker.currentLoad) * 0.3 : 0
  // 批次熟悉度（mock 固定）
  const batchScore = 75
  // 周期适配（mock 固定）
  const cycleScore = 80

  return Math.round(
    skillScore * factorWeights.skill +
    locationScore * factorWeights.location +
    loadScore * factorWeights.load +
    perfScore * factorWeights.performance +
    (perfScore + urgencyBonus) * factorWeights.urgency +
    batchScore * factorWeights.batchFamiliarity +
    cycleScore * factorWeights.cycleAdaptation
  )
}

// 推荐理由智能生成（P4 B2 - 基于因子计算）
const buildReasons = (worker, task, scores) => {
  const positive = []
  const negative = []
  if (worker.workZone === task.workZone) {
    positive.push(`${task.workZone}常驻人员`)
  } else {
    negative.push('非该区域常驻')
  }
  if (worker.currentLoad < 50) {
    positive.push(`当前负荷低(${worker.currentLoad}%)`)
  } else if (worker.currentLoad >= 80) {
    negative.push(`当前负荷高(${worker.currentLoad}%)`)
  }
  if (task.priority === 'urgent' && worker.currentLoad < 60) {
    positive.push('适合紧急任务')
  }
  if (worker.currentLoad >= 80) {
    negative.push('不建议承接新任务')
  }
  if (positive.length === 0) positive.push('综合技能匹配')
  return { positive, negative }
}

const currentRecommendations = computed(() => {
  if (!selectedTask.value) return []
  const task = selectedTask.value
  return workerList.map((w) => {
    const matchScore = calcMatchScore(w, task)
    const { positive, negative } = buildReasons(w, task, matchScore)
    return {
      workerId: w.id,
      workerName: w.name,
      workZone: w.workZone,
      currentLoad: w.currentLoad,
      matchScore,
      confidenceLevel: matchScore >= 85 ? 'high' : matchScore >= 70 ? 'medium' : 'low',
      isAvailable: w.currentLoad < 80,
      positiveReasons: positive,
      negativeReasons: negative,
    }
  }).sort((a, b) => b.matchScore - a.matchScore)
})

// 全选/反选（P8 U1 - 批量栏联动）
const isAllSelected = computed(() => {
  const pool = filteredTaskPool.value
  if (pool.length === 0) return false
  return pool.every(t => selectedTasks.value.has(t.id))
})

// ============================================
// 方法
// ============================================
const showResult = (result) => {
  dispatchResult.value = result
  setTimeout(() => { dispatchResult.value = null }, 3000)
}

// P9 I1 - 来源筛选触发模拟 AI 重新计算（带 loading）
const handleSourceFilter = async () => {
  isLoadingAI.value = true
  await new Promise(r => setTimeout(r, 300))
  isLoadingAI.value = false
  showResult({ success: true, message: `已筛选来源：${sourceMap[sourceFilter.value] || '全部'}` })
}

// 全选/反选（P8 U1）
const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedTasks.value = new Set()
  } else {
    selectedTasks.value = new Set(filteredTaskPool.value.map(t => t.id))
  }
}

// 切换单个任务选择（P14 I4 - 行/卡片选中状态联动）
const toggleTaskSelection = (task, event) => {
  event?.stopPropagation()
  const newSet = new Set(selectedTasks.value)
  if (newSet.has(task.id)) {
    newSet.delete(task.id)
  } else {
    newSet.add(task.id)
  }
  selectedTasks.value = newSet
}

// P1 B1 - 接受 AI 推荐（真正改状态）
const handleAccept = (task) => {
  if (!task.recommendedWorker) {
    showResult({ success: false, message: '该任务尚无 AI 推荐人，请先获取推荐' })
    return
  }
  // 改状态：recommended → dispatched
  const t = mockTasks.find(x => x.id === task.id)
  if (t) {
    t.dispatchStatus = 'dispatched'
    t.dispatchedAt = new Date().toISOString()
  }
  showResult({ success: true, message: `任务"${task.title}"已派发给 ${task.recommendedWorker}` })
  selectedTasks.value.delete(task.id)
  selectedTasks.value = new Set(selectedTasks.value)
}

// P13 B1 - 接受优化建议（真正改状态）
const handleAcceptOptimization = (task) => {
  const t = mockTasks.find(x => x.id === task.id)
  if (t) {
    t.dispatchStatus = 'dispatched'
    t.dispatchedAt = new Date().toISOString()
  }
  showResult({ success: true, message: `已接受优化建议，任务"${task.title}"已派发` })
  selectedTasks.value.delete(task.id)
  selectedTasks.value = new Set(selectedTasks.value)
}

// P2 B1/D2 - 派发推荐（真正更新状态 + 写回 recommendedWorker）
const handleDispatch = (rec) => {
  if (!selectedTask.value) return
  const task = selectedTask.value
  const t = mockTasks.find(x => x.id === task.id)
  if (t) {
    t.recommendedWorker = rec.workerName
    t.confidenceScore = rec.matchScore
    t.dispatchStatus = 'dispatched'
    t.dispatchedAt = new Date().toISOString()
  }
  showResult({ success: true, message: `已将"${task.title}"派发给 ${rec.workerName}（置信度 ${rec.matchScore}分）` })
  selectedTask.value = null
}

const handleDelayConfirm = () => {
  showResult({ success: true, message: `任务已延后 ${delayDays.value} 天` })
  showDelayModal.value = false
  delayDays.value = 1
}

const handleSplitConfirm = () => {
  const names = workerList.filter(w => selectedWorkersForSplit.value.includes(w.id)).map(w => w.name).join('、')
  showResult({ success: true, message: `已拆分为 ${selectedWorkersForSplit.value.length} 个子任务，派发给：${names}` })
  showSplitModal.value = false
  selectedWorkersForSplit.value = []
}

const handleReplaceConfirm = () => {
  if (selectedReplacement.value) {
    showResult({ success: true, message: `已更换执行人为 ${selectedReplacement.value.name}` })
  }
  showReplaceModal.value = false
  selectedReplacement.value = null
}

const toggleSplitWorker = (id) => {
  const idx = selectedWorkersForSplit.value.indexOf(id)
  if (idx >= 0) {
    selectedWorkersForSplit.value = selectedWorkersForSplit.value.filter(wid => wid !== id)
  } else {
    selectedWorkersForSplit.value = [...selectedWorkersForSplit.value, id]
  }
}

const handleSaveConfig = () => {
  ElMessage.success('配置已保存')
  showConfigPanel.value = false
}

const handleBatchConfirm = () => {
  showResult({ success: true, message: `已批量派发 ${selectedTasks.value.size} 个任务` })
  selectedTasks.value = new Set()
}

// ============ 与 V1.1 taskDispatch 6 modal 1:1 对齐：6 个新 modal handler ============
const handleCreateTaskConfirm = () => {
  if (!createTaskForm.types || !createTaskForm.field || !createTaskForm.assignee || !createTaskForm.planStart || !createTaskForm.planEnd) {
    ElMessage.warning('请填写必填项：任务类型、温室/大田、执行人、计划时间')
    return
  }
  // P10 B1 - 与 V1.1 taskCode 格式对齐：NT + yyyyMMdd + 序号
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const seq = String(mockTasks.length + 1).padStart(2, '0')
  createTaskForm.taskId = `NT${ymd}${seq}`
  ElMessage.success(`任务创建成功：${createTaskForm.taskId}`)
  showCreateTaskModal.value = false
  Object.assign(createTaskForm, {
    taskId: '', types: '', typeRemarks: '', field: '', crop: '',
    cropRemarks: '', areaRemarks: '', assignee: '', planStart: '', planEnd: '',
    priority: 'medium', estimatedDays: 0, estimatedHours: 0,
  })
}

const handleDeleteConfirm = () => {
  const count = selectedTasks.value.size
  selectedTasks.value.forEach(id => {
    // 实际应调 store.removeTask(id)
  })
  ElMessage.success(`已删除 ${count} 个任务`)
  selectedTasks.value = new Set()
  showDeleteWarning.value = false
}

const handleExportConfirm = () => {
  const count = selectedTasks.value.size
  // P6 D1 - 修复导出字段名（与 mockTasks 实际字段对齐）
  const headers = ['任务编号', '任务标题', '任务类型', '工作区域', 'AI推荐人', '置信度', '优先级', '状态', '派发时间']
  const csv = headers.join(',') + '\n' + Array.from(selectedTasks.value).map(id => {
    const t = mockTasks.find(x => x.id === id)
    if (!t) return ''
    return `"${t.taskCode || ''}","${t.title || ''}","${t.typeName || ''}","${t.workZone || t.greenhouse || ''}","${t.recommendedWorker || ''}","${t.confidenceScore || 0}","${priorityLabel(t.priority)}","${statusColors[t.dispatchStatus]?.label || t.dispatchStatus || ''}","${t.dispatchedAt || ''}"`
  }).join('\n')
  const bom = '﻿'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const ext = exportFormat.value === 'excel' ? 'xls' : exportFormat.value === 'word' ? 'doc' : 'csv'
  a.download = `任务派发记录_${new Date().toISOString().slice(0, 10)}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${count} 个任务为 ${exportFormat.value.toUpperCase()} 格式`)
  showExportModal.value = false
  selectedTasks.value = new Set()
}

const handleVerifyConfirm = () => {
  if (!verifyForm.comments) {
    ElMessage.warning('请填写验收意见')
    return
  }
  const resultText = verifyForm.result === 'pass' ? '通过' : '驳回'
  ElMessage.success(`任务验收${resultText}：${selectedTask.value?.title || ''}`)
  showVerifyModal.value = false
  Object.assign(verifyForm, { result: 'pass', comments: '', workload: 0 })
}

const handleWithdrawConfirm = () => {
  if (!withdrawForm.reason) {
    ElMessage.warning('请填写操作原因')
    return
  }
  const actionText = withdrawForm.action === 'withdraw' ? '撤回' : '取消'
  ElMessage.success(`任务已${actionText}：${selectedTask.value?.title || ''}，原因：${withdrawForm.reason}`)
  showWithdrawModal.value = false
  Object.assign(withdrawForm, { action: 'withdraw', reason: '' })
}

const handleOvertimeConfirm = () => {
  if (!overtimeForm.reason) {
    ElMessage.warning('请填写处理说明')
    return
  }
  const actionText = { extend: '延长', reassign: '重新派发', cancel: '取消' }[overtimeForm.action] || '处理'
  ElMessage.success(`任务超时已${actionText}：${selectedTask.value?.title || ''}`)
  showOvertimeModal.value = false
  Object.assign(overtimeForm, { action: 'extend', extendHours: 0, reason: '' })
}
</script>
