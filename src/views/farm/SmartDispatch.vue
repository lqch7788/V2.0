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
                <el-option value="all" label="全部来源" />
                <el-option value="farm" label="农事任务" />
                <el-option value="tempTask" label="临时任务" />
                <el-option value="inspection" label="巡查问题" />
              </el-select>
            </div>
          </div>
          <div class="p-3 max-h-96 overflow-y-auto space-y-2">
            <div v-for="task in filteredTaskPool" :key="task.id"
              @click="selectedTask = task"
              :class="['p-3 rounded-lg border cursor-pointer transition-colors', selectedTask?.id === task.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50']">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</span>
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
                  <span v-for="(reason, i) in rec.positiveReasons" :key="'p'+i" class="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{{ reason }}</span>
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

    <!-- 批量操作栏 -->
    <div v-if="selectedTasks.size > 0" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-4 z-50">
      <span class="text-sm text-gray-700">
        已选择 <span class="font-bold text-blue-600">{{ selectedTasks.size }}</span> 个任务
      </span>
      <div class="flex items-center gap-2">
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

const filteredTaskPool = computed(() => {
  if (sourceFilter.value === 'all') return mockTasks
  const sourceMap = { farm: '农事任务', tempTask: '临时任务', inspection: '巡查问题' }
  return mockTasks.filter(t => t.sourceLabel === sourceMap[sourceFilter.value])
})

const currentRecommendations = computed(() => {
  if (!selectedTask.value) return []
  return workerList.map((w, i) => ({
    workerId: w.id,
    workerName: w.name,
    workZone: w.workZone,
    currentLoad: w.currentLoad,
    matchScore: [95, 88, 82, 75, 70, 65][i] || 60,
    confidenceLevel: i === 0 ? 'high' : i < 3 ? 'medium' : 'low',
    isAvailable: w.currentLoad < 80,
    positiveReasons: getMockReasons(w.name, selectedTask.value),
  })).sort((a, b) => b.matchScore - a.matchScore)
})

// ============================================
// 方法
// ============================================
const getMockReasons = (workerName, task) => {
  const reasons = []
  if (workerName === '张三') reasons.push('番茄种植经验丰富', '1号温室常驻人员', '当前负荷低(40%)')
  else if (workerName === '李四') reasons.push('施肥作业专长', '距离2号温室最近')
  else if (workerName === '王五') reasons.push('植保技能认证', '紧急任务处理经验丰富')
  else reasons.push('综合技能匹配', '历史完成率良好')
  return reasons
}

const showResult = (result) => {
  dispatchResult.value = result
  setTimeout(() => { dispatchResult.value = null }, 3000)
}

const handleSourceFilter = () => {}

const handleAccept = (task) => {
  if (task.recommendedWorker) {
    showResult({ success: true, message: `任务"${task.title}"已派发给 ${task.recommendedWorker}` })
  }
}

const handleAcceptOptimization = (task) => {
  showResult({ success: true, message: `已接受优化建议，任务已更新` })
}

const handleDispatch = (rec) => {
  showResult({ success: true, message: `已派发给 ${rec.workerName}` })
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
</script>
