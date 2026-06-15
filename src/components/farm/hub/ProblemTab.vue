<template>
  <!--
    问题管理 Tab - V1.1 ProblemTab.tsx 1:1 迁移
    V1.1 行号参考: src/components/farm/hub/ProblemTab.tsx (1427 行)
    关键 V1.1 实现: 5-store 集成 + 7 状态机 + AI 推荐 + 多执行人分派
  -->
  <div class="space-y-6">
    <!-- ========== 标签页切换 (V1.1 line 1108-1142) ========== -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex border-b border-gray-200 px-4">
        <el-button
          :class="[
            'px-4 py-3 text-sm font-medium flex items-center gap-3 border-b-2 transition-colors rounded-none',
            activeSubTab === 'problems'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
          @click="activeSubTab = 'problems'"
        >
          <el-icon><WarningFilled /></el-icon>
          <span>问题列表</span>
          <span class="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">{{ totalCount }}</span>
        </el-button>
        <el-button
          :class="[
            'px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors rounded-none',
            activeSubTab === 'tasks'
              ? 'border-orange-500 text-orange-600 bg-orange-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
          @click="activeSubTab = 'tasks'"
        >
          <el-icon><List /></el-icon>
          关联任务
          <span class="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">{{ linkedTasks.length }}</span>
        </el-button>
      </div>
    </div>

    <!-- ========== 问题列表标签页 (V1.1 line 1145-1274) ========== -->
    <div v-if="activeSubTab === 'problems'" class="space-y-4">
      <!-- 筛选工具栏 -->
      <ProblemFilterToolbar
        :time-filter="timeFilter"
        :date-range="dateRange"
        :status-filter="statusFilter"
        :severity-filter="severityFilter"
        :source-module-filter="sourceModuleFilter"
        :export-mode="exportMode"
        :batch-delete-mode="batchDeleteMode"
        :batch-dispatch-mode="batchDispatchMode"
        :selected-rows-length="selectedRows.length"
        :selected-problems-length="selectedProblems.length"
        @time-filter-change="(v) => (timeFilter = v)"
        @date-range-change="(v) => Object.assign(dateRange, v)"
        @status-filter-change="(v) => (statusFilter = v)"
        @severity-filter-change="(v) => (severityFilter = v)"
        @source-module-change="(v) => (sourceModuleFilter = v)"
        @cancel-export="cancelExport"
        @cancel-batch-delete="cancelBatchDelete"
        @cancel-batch-dispatch="cancelBatchDispatch"
        @confirm-dispatch="openBatchDispatchModal"
        @confirm-export="showExportModal = true"
        @confirm-delete="showDeleteWarning = true"
      />

      <!-- 问题管理列表标题 (V1.1 line 1181-1230) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-semibold text-gray-900">问题管理列表</h3>
            <div v-if="displayStats" class="flex items-center gap-2 text-sm">
              <span class="text-gray-500">共</span>
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded">{{ displayStats.total }}</span>
              <span class="text-gray-500">条</span>
              <span class="text-red-600">| 待处理 {{ displayStats.pending }}</span>
              <span class="text-blue-600">| 处理中 {{ displayStats.processing }}</span>
              <span class="text-green-600">| 已处理 {{ displayStats.resolved }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-button type="primary" size="small" @click="openCreateModal">
              <el-icon><Plus /></el-icon>
              新建
            </el-button>
            <el-button type="warning" size="small" @click="enterBatchDispatch">
              <el-icon><Promotion /></el-icon>
              批量分派
            </el-button>
            <el-button size="small" @click="enterExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>

        <!-- 问题表格 (V1.1 ProblemTable.tsx + 1:1 像素对齐 V1.1 line 110-243) -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold w-12">
                  <input v-if="showCheckbox && filteredProblems.length > 0"
                    type="checkbox" :checked="isAllSelected"
                    @change="batchDispatchMode ? onBatchSelectAll() : onToggleSelectAll()"
                    class="w-4 h-4 rounded border-white/30 bg-white/20" />
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold">编号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">来源</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">问题描述</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">严重程度</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">处理人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="filteredProblems.length === 0">
                <td colspan="8" class="px-4 py-12 text-center text-gray-400">暂无问题数据</td>
              </tr>
              <tr v-for="problem in filteredProblems" :key="problem.id"
                class="hover:bg-blue-50 transition-colors">
                <!-- 复选框 -->
                <td class="px-4 py-3">
                  <template v-if="batchDispatchMode">
                    <input v-if="getStatusCN(problem.status) === '待处理' && !problem.sourceTaskId"
                      type="checkbox" :checked="selectedProblems.includes(problem.id)"
                      @change="onToggleSelect(problem.id)" class="w-4 h-4 rounded" />
                  </template>
                  <template v-else-if="batchDeleteMode || exportMode">
                    <input type="checkbox" :checked="selectedRows.includes(problem.id)"
                      @change="onToggleSelect(problem.id)" class="w-4 h-4 rounded" />
                  </template>
                </td>

                <!-- 编号 -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <el-button link type="primary" size="small" @click="openDetailModal(problem)" title="点击查看详情">
                    {{ problem.problemCode || problem.id }}
                  </el-button>
                </td>

                <!-- 来源 -->
                <td class="px-4 py-3 text-sm">
                  <SourceCell :problem="problem" />
                </td>

                <!-- 问题描述 -->
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
                  {{ problem.issueText }}
                </td>

                <!-- 严重程度 -->
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getSeverityStyle(problem.issueSeverity)">
                    {{ problem.issueSeverity }}
                  </span>
                </td>

                <!-- 状态 -->
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getStatusStyle(problem.status)">
                    {{ getStatusCN(problem.status) }}
                  </span>
                </td>

                <!-- 处理人 -->
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ problem.handler || problem.handlerName || problem.assigneeName || '-' }}
                </td>

                <!-- 操作 - V1.1 line 204-236: 状态相关按钮 -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 flex-wrap">
                    <el-button v-if="getStatusCN(problem.status) === '待处理' && !problem.sourceTaskId"
                      type="warning" size="small" @click="openDispatchModal(problem)" class="h-6">
                      分派
                    </el-button>
                    <el-button v-if="getStatusCN(problem.status) === '处理中'"
                      type="primary" size="small" @click="openDetailModal(problem)" class="h-6">
                      <el-icon><View /></el-icon>详情
                    </el-button>
                    <el-button v-if="getStatusCN(problem.status) === '待验收'"
                      size="small" @click="openDetailModal(problem)" class="h-6">
                      <el-icon><CircleCheck /></el-icon>验收
                    </el-button>
                    <el-button v-if="problem.reworkCount >= 2"
                      type="danger" size="small" @click="openReassignDialog(problem)" class="h-6">
                      退分派
                    </el-button>
                    <el-button v-if="canEdit(problem)"
                      size="small" link type="primary" @click="openEditProblem(problem)">
                      编辑
                    </el-button>
                    <el-button v-if="canDelete(problem)"
                      size="small" link type="danger" @click="deleteSingleProblem(problem)">
                      删除
                    </el-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AI 推荐面板 (V1.1 line 1249-1272) -->
      <div v-if="pendingProblems.length > 0 && !batchDispatchMode"
        class="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <span class="text-lg">&#129302;</span>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-purple-700 mb-2">AI智能推荐</h4>
            <p class="text-sm text-gray-600 mb-3">
              系统检测到 <span class="font-medium text-purple-600">{{ pendingProblems.length }}</span> 个待分派问题，AI已自动分析最优执行人匹配方案
            </p>
            <div class="flex gap-2">
              <el-button size="small" @click="enterBatchDispatch">
                <el-icon><View /></el-icon>查看AI推荐
              </el-button>
              <el-button size="small" @click="enterBatchDispatch">
                <el-icon><UserFilled /></el-icon>手动选择执行人
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 关联任务标签页 (V1.1 line 1277-1390) ========== -->
    <div v-if="activeSubTab === 'tasks'" class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <el-icon :size="20" class="text-blue-600 mt-0.5"><List /></el-icon>
          <div>
            <div class="text-sm font-medium text-blue-800">关联任务说明</div>
            <div class="text-sm text-blue-600 mt-1">
              这些任务是由问题分派创建的。完成任务后，问题状态会自动更新为"已处理"。
              请前往 <span class="font-medium">任务中心</span> 或 <span class="font-medium">任务工单管理</span> 页面完成任务。
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold">任务编号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">任务标题</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">温室</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">执行人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">截止日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">优先级</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">来源问题</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="linkedTasks.length === 0">
                <td colspan="8" class="px-4 py-12 text-center text-gray-400">暂无分派任务</td>
              </tr>
              <tr v-for="task in linkedTasks" :key="task.id"
                class="hover:bg-emerald-50 transition-colors">
                <td class="px-4 py-3 text-sm font-mono text-gray-600">
                  {{ task.taskCode || task.id }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-800 max-w-[200px] truncate">
                  {{ task.title }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ task.greenhouseName }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ task.assigneeName }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {{ task.dueDate }}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="getTaskStatusClass(task.status)">
                    {{ getTaskStatusLabel(task.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span v-if="getProblemById(task.sourceProblemId)" class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusStyle(getProblemById(task.sourceProblemId).status)">
                    {{ getStatusCN(getProblemById(task.sourceProblemId).status) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========== 分派弹窗 (V1.1 line 610-928) ========== -->
    <el-dialog
      v-model="dispatchModal.isOpen"
      :title="dispatchModal.batchMode ? '批量分派问题' : '分派问题'"
      width="760px"
      destroy-on-close
      @close="handleCloseDispatch"
    >
      <div class="space-y-4">
        <!-- 问题信息 -->
        <div v-if="dispatchModal.problem" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-sm text-slate-500 mb-1 font-medium">问题描述</div>
          <div class="text-base font-semibold text-indigo-700 mb-3">
            {{ dispatchModal.problem.issueText }}
          </div>
          <div class="flex gap-4 text-sm">
            <span class="text-slate-600">
              <span class="font-medium">温室：</span>
              <span class="text-emerald-600 font-medium">{{ dispatchModal.problem.greenhouseName }}</span>
            </span>
            <span class="text-slate-600">
              <span class="font-medium">严重程度：</span>
              <span :class="getSeverityTextClass(dispatchModal.problem.issueSeverity)">
                {{ dispatchModal.problem.issueSeverity }}
              </span>
            </span>
          </div>
        </div>

        <!-- 批量模式提示 -->
        <div v-if="dispatchModal.batchMode" class="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
          <div class="text-base text-orange-800 font-medium">
            选中了 {{ selectedProblems.length }} 个问题，将分派给同一执行人
          </div>
        </div>

        <!-- 执行人选择 (V1.1 line 682-790) -->
        <div>
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon class="text-blue-500"><UserFilled /></el-icon>
            选择执行人
          </div>

          <!-- 分派模式切换 -->
          <div class="flex gap-2 mb-3">
            <el-button
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium',
                dispatchMode === 'ai_assisted'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600',
              ]"
              @click="dispatchMode = 'ai_assisted'"
            >
              <el-icon><MagicStick /></el-icon>
              AI推荐（默认）
            </el-button>
            <el-button
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium',
                dispatchMode === 'manual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600',
              ]"
              @click="dispatchMode = 'manual'"
            >
              <el-icon><UserFilled /></el-icon>
              手动选择
            </el-button>
          </div>

          <!-- AI 推荐面板 -->
          <div v-if="dispatchMode === 'ai_assisted' && !dispatchModal.batchMode && dispatchModal.problem"
            class="border-2 border-purple-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <AIRecommendationPanel
              v-if="aiRecommendations.length > 0"
              :task-info="getProblemTaskInfo(dispatchModal.problem)"
              :recommendations="aiRecommendations"
              :selected-worker-id="selectedWorkers[0]?.id"
              @select="onAIRecommendSelect"
              @manual="dispatchMode = 'manual'"
            />
            <div v-else class="p-6 text-center text-gray-400 text-sm">
              暂无可用的 AI 推荐，请切换到手动选择
            </div>
          </div>

          <!-- 手动模式 - 多选 -->
          <div v-if="dispatchMode === 'manual' || (dispatchModal.batchMode && dispatchMode === 'ai_assisted')"
            class="border-2 border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <div v-if="workerList.length === 0" class="p-6 text-center text-gray-400 text-sm">
              暂无可用执行人
            </div>
            <label v-for="worker in workerList" :key="worker.id"
              :class="[
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0',
                isWorkerSelected(worker.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent',
              ]">
              <el-checkbox
                :model-value="isWorkerSelected(worker.id)"
                @change="(checked) => toggleWorkerSelect(worker, checked)"
              />
              <div class="flex-1 min-w-0">
                <span class="font-medium text-gray-900">{{ worker.name }}</span>
                <span class="text-sm text-gray-500">（{{ worker.position || '员工' }}）</span>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <span v-for="tag in (worker.skillTags || []).slice(0, 2)" :key="tag"
                  class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {{ tag }}
                </span>
              </div>
            </label>
          </div>

          <div v-if="selectedWorkers.length > 0" class="mt-2 text-sm text-emerald-600 font-medium">
            已选择 {{ selectedWorkers.length }} 人：{{ selectedWorkers.map((w) => w.name).join('、') }}
          </div>
        </div>

        <!-- 优先级选择 (V1.1 line 792-830) -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span class="w-5 h-5 text-center text-red-500 font-bold">!</span>
            选择优先级
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button v-for="opt in priorityOptions" :key="opt.value"
              :class="[
                'px-4 py-3 rounded-lg border-2 font-medium transition-all flex flex-col items-start min-w-[100px]',
                selectedPriority === opt.value ? `${opt.bg} ${opt.border} ${opt.text} shadow-sm` : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="selectedPriority = opt.value">
              <span class="font-semibold">{{ opt.label }}</span>
              <span class="text-xs opacity-80">{{ opt.desc }}</span>
            </el-button>
          </div>
          <div v-if="dispatchModal.problem" class="mt-2 text-sm text-slate-500">
            问题严重程度：<span :class="getSeverityTextClass(dispatchModal.problem.issueSeverity)">
              {{ dispatchModal.problem.issueSeverity }}
            </span>
            <span v-if="selectedPriority !== mapSeverityToPriority(dispatchModal.problem.issueSeverity)" class="ml-2 text-blue-600">
              （已调整为：{{ selectedPriority === 'high' ? '高' : selectedPriority === 'low' ? '低' : '中' }}优先级）
            </span>
          </div>
        </div>

        <!-- 期望完成时间 (V1.1 line 832-885) -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon class="text-amber-500"><Clock /></el-icon>
            期望完成时间
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button v-for="opt in completionOptions" :key="opt.value"
              :class="[
                'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                expectedCompletion === opt.value && !customDueDate ? `${opt.bg} ${opt.border} ${opt.text}` : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="selectCompletionTime(opt.value)">
              {{ opt.label }}
            </el-button>
            <el-button
              :class="[
                'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                expectedCompletion === 'custom' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="expectedCompletion = 'custom'">
              自定义
            </el-button>
            <el-date-picker v-if="expectedCompletion === 'custom'" v-model="customDueDate"
              type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
          </div>
          <div v-if="expectedCompletion !== 'custom'" class="mt-2 text-sm text-slate-500">
            预计完成日期：<span class="font-medium text-violet-600">{{ calculateDueDate() }}</span>
          </div>
        </div>

        <!-- 必填反馈要求 (V1.1 line 887-925) -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon class="text-emerald-500"><Camera /></el-icon>
            必填反馈要求
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label v-for="item in feedbackOptions" :key="item.key"
              :class="[
                'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all',
                requiredFeedback.includes(item.key) ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-200',
              ]">
              <el-checkbox
                :model-value="requiredFeedback.includes(item.key)"
                @change="(checked) => toggleFeedback(item.key, checked)"
                class="sr-only"
              />
              <span class="text-lg">{{ item.icon }}</span>
              <span :class="['text-sm font-medium', requiredFeedback.includes(item.key) ? 'text-emerald-700' : 'text-gray-600']">
                {{ item.label }}
              </span>
              <el-icon v-if="requiredFeedback.includes(item.key)" class="text-emerald-500 ml-auto">
                <CircleCheck />
              </el-icon>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseDispatch">取消</el-button>
        <el-button type="primary" :disabled="selectedWorkers.length === 0" @click="handleDispatchSubmit">
          确认分派
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 详情弹窗 (V1.1 line 931-1097) ========== -->
    <el-dialog
      v-model="detailModal.isOpen"
      width="750px"
      destroy-on-close
      @close="detailModal = { isOpen: false, problem: null }"
    >
      <template #header>
        <div class="bg-gradient-to-r from-emerald-600 to-teal-500 -mx-6 -mt-6 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <el-icon :size="20" class="text-white"><WarningFilled /></el-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">问题详情</h3>
              <p class="text-sm text-white/80 font-mono">{{ detailModal.problem?.problemCode || detailModal.problem?.id }}</p>
            </div>
          </div>
        </div>
      </template>

      <div v-if="detailModal.problem" class="space-y-4 -mx-6 px-6">
        <!-- 来源 -->
        <SourceBadge :problem="detailModal.problem" />

        <!-- 问题描述 - 红色背景 (V1.1 line 968-991) -->
        <div class="bg-red-50 rounded-lg p-4 border border-red-100">
          <h4 class="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
            <el-icon><Document /></el-icon>
            问题描述
          </h4>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-sm">!</span>
            </div>
            <div class="flex-1">
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                :class="getSeverityStyle(detailModal.problem.issueSeverity)">
                {{ detailModal.problem.issueSeverity }}
              </span>
              <p class="text-sm text-gray-800 leading-relaxed">{{ detailModal.problem.issueText }}</p>
            </div>
          </div>
        </div>

        <!-- 基本信息 - 蓝色背景 (V1.1 line 993-1025) -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
            <el-icon><Document /></el-icon>
            基本信息
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="info in basicInfoFields" :key="info.label" class="bg-white rounded-lg p-3">
              <div class="text-xs text-blue-600 mb-1">{{ info.label }}</div>
              <div class="text-sm font-semibold text-gray-900">{{ info.value }}</div>
            </div>
          </div>
        </div>

        <!-- 处理信息 - 橙色背景 (V1.1 line 1027-1070) -->
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <h4 class="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
            <el-icon><Document /></el-icon>
            处理信息
          </h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">当前状态</div>
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusStyle(detailModal.problem.status)">
                {{ getStatusCN(detailModal.problem.status) }}
              </span>
            </div>
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">处理人</div>
              <div class="text-sm font-semibold text-gray-900">{{ detailModal.problem.handler || '-' }}</div>
            </div>
            <div v-if="detailModal.problem.handleDate" class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">处理日期</div>
              <div class="text-sm font-semibold text-gray-900">{{ detailModal.problem.handleDate }}</div>
            </div>
            <div v-if="detailModal.problem.expectedCompletion" class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">期望完成</div>
              <div class="text-sm font-semibold text-gray-900">{{ detailModal.problem.expectedCompletion }}</div>
            </div>
            <div v-if="detailModal.problem.handleResult" class="col-span-2 bg-green-50 rounded-lg p-3">
              <div class="text-xs text-green-600 mb-1">处理结果</div>
              <div class="text-sm font-semibold text-gray-900">{{ detailModal.problem.handleResult }}</div>
            </div>
            <div v-if="detailModal.problem.reworkCount > 0" class="col-span-2 bg-red-50 rounded-lg p-3">
              <div class="text-xs text-red-600 mb-1">返工次数</div>
              <div class="text-sm font-semibold text-red-700">
                {{ detailModal.problem.reworkCount }} 次
                <span v-if="detailModal.problem.reworkCount >= 2" class="ml-2 text-xs text-red-500">
                  ⚠ 已达上限，建议退分派
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 流转记录 (V1.1 line 1072-1082) -->
        <div class="bg-slate-100 rounded-lg p-4 border border-slate-200">
          <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon><Document /></el-icon>
            流转记录
          </h4>
          <div v-if="(detailModal.problem.flowRecords || []).length === 0" class="text-sm text-gray-400">
            暂无流转记录
          </div>
          <div v-else class="space-y-2">
            <div v-for="record in detailModal.problem.flowRecords" :key="record.id" class="flex gap-3 text-xs">
              <span class="text-gray-400 whitespace-nowrap">{{ formatActionTime(record.actionTime) }}</span>
              <span class="font-medium text-gray-700">{{ record.operatorName }}</span>
              <span class="text-gray-500">{{ getActionLabel(record.action) }}</span>
              <span v-if="record.comment" class="text-gray-400">- {{ record.comment }}</span>
            </div>
          </div>
        </div>

        <!-- 详情弹窗内的快速操作 -->
        <div v-if="canAccept(detailModal.problem) || canSubmitFeedback(detailModal.problem) || canApprove(detailModal.problem) || canRejectAcceptance(detailModal.problem)"
          class="bg-white border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3">快速操作</h4>
          <div class="flex flex-wrap gap-2">
            <el-button v-if="canAccept(detailModal.problem)" type="primary" size="small" @click="handleAcceptProblem(detailModal.problem)">
              接单
            </el-button>
            <el-button v-if="canSubmitFeedback(detailModal.problem)" type="success" size="small" @click="openFeedbackDialog(detailModal.problem)">
              提交反馈
            </el-button>
            <el-button v-if="canApprove(detailModal.problem)" type="success" size="small" @click="handleApproveCompletion(detailModal.problem)">
              验收通过
            </el-button>
            <el-button v-if="canRejectAcceptance(detailModal.problem)" type="warning" size="small" @click="openRejectAcceptanceDialog(detailModal.problem)">
              验收返工
            </el-button>
            <el-button v-if="canReject(detailModal.problem)" type="danger" size="small" @click="openRejectDialog(detailModal.problem)">
              拒绝接单
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailModal = { isOpen: false, problem: null }">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ========== 新建/编辑问题弹窗 (V1.1 line 451-510) ========== -->
    <el-dialog
      v-model="showCreateModal"
      :title="editingProblem ? '编辑问题' : '新建问题'"
      width="560px"
      destroy-on-close
      @close="handleCreateClose"
    >
      <el-form ref="createFormRef" :model="createForm" label-width="100px">
        <el-form-item label="温室区域" required>
          <el-select v-model="createForm.greenhouseId" placeholder="请选择温室区域" style="width: 100%" filterable>
            <el-option v-for="g in availableGreenhouses" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物名称" required>
          <el-input v-model="createForm.cropName" placeholder="请输入作物名称" />
        </el-form-item>
        <el-form-item label="巡查人员" required>
          <el-input v-model="createForm.inspectorName" placeholder="请输入巡查人员" />
        </el-form-item>
        <el-form-item label="巡查日期" required>
          <el-date-picker v-model="createForm.checkDate" type="date" placeholder="请选择巡查日期"
            style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input v-model="createForm.issueText" type="textarea" :rows="3" placeholder="请输入问题描述" />
        </el-form-item>
        <el-form-item label="严重程度" required>
          <el-select v-model="createForm.issueSeverity" placeholder="请选择严重程度" style="width: 100%">
            <el-option v-for="s in severityOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCreateClose">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateSubmit">
          {{ editingProblem ? '保存修改' : '确认创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 提交反馈弹窗 (V1.1 useProblemDispatch line 395-428) ========== -->
    <el-dialog v-model="feedbackDialog.isOpen" title="提交处理反馈" width="500px" destroy-on-close>
      <el-form :model="feedbackForm" label-width="100px">
        <el-form-item label="处理结果" required>
          <el-input v-model="feedbackForm.resultText" type="textarea" :rows="3" placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="实际工作量">
          <el-input-number v-model="feedbackForm.actualWorkload" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackDialog.isOpen = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFeedback">提交</el-button>
      </template>
    </el-dialog>

    <!-- ========== 拒绝接单弹窗 (V1.1 useProblemDispatch line 361-392) ========== -->
    <el-dialog v-model="rejectDialog.isOpen" title="拒绝接单" width="480px" destroy-on-close>
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialog.isOpen = false">取消</el-button>
        <el-button type="danger" @click="handleRejectProblem">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- ========== 验收返工弹窗 (V1.1 useProblemDispatch line 497-542) ========== -->
    <el-dialog v-model="reworkDialog.isOpen" title="验收返工" width="480px" destroy-on-close>
      <el-form :model="reworkForm" label-width="80px">
        <el-form-item label="返工原因" required>
          <el-input v-model="reworkForm.reason" type="textarea" :rows="3" placeholder="请输入返工原因" />
        </el-form-item>
        <el-form-item v-if="reworkForm.willReassign" label="退分派提示">
          <el-alert type="warning" :closable="false">
            已达返工上限（2次），将自动退回重新分派
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reworkDialog.isOpen = false">取消</el-button>
        <el-button type="warning" @click="handleRejectAcceptance">确认返工</el-button>
      </template>
    </el-dialog>

    <!-- ========== 删除警告弹窗 ========== -->
    <el-dialog v-model="showDeleteWarning" title="删除确认" width="420px" destroy-on-close>
      <p class="text-sm text-gray-600">
        确定要删除选中的 <span class="font-medium text-red-600">{{ selectedRows.length }}</span> 个问题吗？此操作不可撤销。
      </p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteConfirm">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- ========== 导出格式弹窗 ========== -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="420px" destroy-on-close>
      <el-radio-group v-model="exportFormatModel" class="flex flex-col gap-3 w-full">
        <el-radio value="excel" border>Excel 文件 (.xls)</el-radio>
        <el-radio value="csv" border>CSV 文件 (.csv)</el-radio>
        <el-radio value="word" border>Word 文件 (.doc)</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="showExportModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 问题管理 Tab - V1.1 ProblemTab.tsx 1:1 迁移
 * V1.1 关键集成:
 *   - useProblemStore (V1.1 line 75-81): 问题数据 CRUD
 *   - useProblemDispatch (V1.1 line 82-84): 状态机 dispatch/accept/reject/submit/approve/rejectAcceptance
 *   - useComprehensiveDispatch (V1.1 line 85-87): AI 推荐
 *   - useTasks (V1.1 line 86-87): 关联任务 sourceProblemId
 *   - useUserStore (V1.1 line 88-96): 用户列表
 *
 * V1.1 状态机 7 状态 (V1.1 useProblemDispatch.ts):
 *   pending → in_progress → waiting_acceptance → completed
 *   waiting_acceptance → reject_acceptance (reworkCount++)
 *   reworkCount >= 2 → 退分派重分
 */
import { ref, reactive, computed, onMounted } from 'vue'
import {
  WarningFilled, List, Plus, Promotion, Download, MagicStick,
  UserFilled, Clock, Camera, CircleCheck, View, Document,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ========== 5 Store 集成 (V1.1 line 75-90) ==========
import { useProblemStore } from '@/stores/modules/problem'
import { useUserStore } from '@/stores/modules/user'
import { useFarmTaskStore } from '@/stores/modules/farmTask'
import { useWorkerStore } from '@/stores/modules/worker' // V2.0 实际存在，提供 workerList
import { useInspectionStore } from '@/stores/modules/inspectionData' // 巡查问题联动（V1.1 useProblemStore.getBySource('inspection')）

// 组件依赖
import ProblemFilterToolbar from '@/components/farm/problemDispatch/components/ProblemFilterToolbar.vue'
import SourceCell from '@/components/farm/problemDispatch/components/SourceCell.vue'
import SourceBadge from '@/components/farm/problemDispatch/components/SourceBadge.vue'
// AIRecommendationPanel 在 V2.0 中可能不存在（命名差异：DispatchRecommend）
// 使用 defineAsyncComponent 安全包装，组件缺失时不阻塞页面渲染
import { defineAsyncComponent } from 'vue'
const AIRecommendationPanel = defineAsyncComponent({
  loader: () => import('@/components/labor/dispatch/DispatchRecommend.vue').catch(() => ({ default: { template: '<div></div>' } })),
  delay: 0,
  timeout: 3000,
})

// ========== Props & Emits ==========
const props = defineProps({
  onProblemDispatched: { type: Function, default: null },
  externalTasks: { type: Array, default: () => [] },
  stats: { type: Object, default: null },
})
const emit = defineEmits(['problem-dispatched'])

// ========== Store 实例 ==========
const problemStore = useProblemStore()
const userStore = useUserStore()
const taskStore = useFarmTaskStore()

// V1.1 useDispatchStore 提供 workerList；V2.0 中为 useWorkerStore
let workerStore = null
try { workerStore = useWorkerStore() } catch (e) { workerStore = null }

// 巡查问题联动 store（用于 getBySource('inspection')）
let inspectionStore = null
try { inspectionStore = useInspectionStore() } catch (e) { inspectionStore = null }

// ========== 常量 (V1.1 line 38-53) ==========
const STATUS_CN_MAP = {
  pending: '待处理',
  in_progress: '处理中',
  waiting_acceptance: '待验收',
  completed: '已处理',
}

// 7 状态机 (V1.1 useProblemDispatch.ts + reworkCount 退分派)
const ALL_STATUSES = ['pending', 'in_progress', 'waiting_acceptance', 'completed', 'rejected', 'rework', 'closed']

// 反馈选项 (V1.1 line 29-36)
const FEEDBACK_OPTIONS = [
  { key: 'workload_confirm', label: '工作量确认', icon: '\u{23F0}' },
  { key: 'gps', label: '位置打卡', icon: '\u{1F4CC}' },
  { key: 'photo_before', label: '作业前照片', icon: '\u{1F4F7}' },
  { key: 'photo_after', label: '作业后照片', icon: '\u{1F4F8}' },
  { key: 'material', label: '物资扫码', icon: '\u{1F4E6}' },
  { key: 'voice', label: '语音备注', icon: '\u{1F3A4}' },
]

const SEVERITY_OPTIONS = ['轻微', '中等', '严重']

// 严重程度→优先级映射 (V1.1 line 256-260)
const SEVERITY_TO_PRIORITY = { '严重': 'high', '中等': 'medium', '轻微': 'low' }

// 问题类型→任务类型映射 (V1.1 line 238-253)
const PROBLEM_TYPE_MAPPING = [
  { keywords: ['虫', '蚝'], type: 'spraying', typeName: '病虫防治' },
  { keywords: ['病', '斑', '灰鸿'], type: 'spraying', typeName: '病害处理' },
  { keywords: ['水', '旱'], type: 'irrigation', typeName: '灌溉处理' },
  { keywords: ['肥'], type: 'fertilization', typeName: '施肥处理' },
]

// ========== 状态 ==========
const activeSubTab = ref('problems')

// 筛选 (V1.1 line 108-113)
const statusFilter = ref('all')
const severityFilter = ref('all')
const sourceModuleFilter = ref('all')
const timeFilter = ref('all')
const dateRange = reactive({ start: '', end: '' })

// 批量操作 (V1.1 line 115-120)
const batchDeleteMode = ref(false)
const batchDispatchMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const selectedProblems = ref([])

// 弹窗
const showCreateModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const createLoading = ref(false)
const editingProblem = ref(null) // null 表示新建，否则是编辑

// 分派弹窗 (V1.1 line 140-158)
const dispatchModal = reactive({ isOpen: false, problem: null, batchMode: false })
const dispatchMode = ref('ai_assisted') // 'ai_assisted' | 'manual'
const selectedWorkers = ref([]) // [{ id, name }]
const selectedPriority = ref('medium')
const expectedCompletion = ref('3days')
const customDueDate = ref('')
const requiredFeedback = ref(['workload_confirm'])
const aiRecommendations = ref([])

// 详情弹窗
const detailModal = reactive({ isOpen: false, problem: null })

// 反馈弹窗 (V1.1 useProblemDispatch line 395-428)
const feedbackDialog = reactive({ isOpen: false, problem: null })
const feedbackForm = reactive({ resultText: '', actualWorkload: 0 })

// 拒绝接单弹窗
const rejectDialog = reactive({ isOpen: false, problem: null })
const rejectForm = reactive({ reason: '' })

// 验收返工弹窗
const reworkDialog = reactive({ isOpen: false, problem: null })
const reworkForm = reactive({ reason: '', willReassign: false })

// 新建/编辑表单
const createFormRef = ref(null)
const createForm = reactive({
  greenhouseId: '',
  greenhouseName: '',
  cropName: '',
  inspectorId: 'U001',
  inspectorName: '系统管理员',
  checkDate: new Date().toISOString().slice(0, 10),
  checkTime: new Date().toTimeString().slice(0, 5),
  issueText: '',
  issueSeverity: '中等',
})

// 导出
const exportFormatModel = ref('excel')

// ========== 计算属性 (V1.1 line 175-235) ==========
const allProblems = computed(() => problemStore.problems || [])

// V1.1 line 128-134: 内部统计 (与表格相同数据源)
const pendingProblems = computed(() => allProblems.value.filter((p) => getStatusCN(p.status) === '待处理' && !p.sourceTaskId))
const dispatchedProblems = computed(() => allProblems.value.filter((p) => getStatusCN(p.status) === '处理中' || getStatusCN(p.status) === '待验收'))
const handledProblems = computed(() => allProblems.value.filter((p) => getStatusCN(p.status) === '已处理'))
const totalCount = computed(() => allProblems.value.length)

const displayStats = computed(() => ({
  total: pendingProblems.value.length + dispatchedProblems.value.length + handledProblems.value.length,
  pending: pendingProblems.value.length,
  processing: dispatchedProblems.value.length,
  resolved: handledProblems.value.length,
}))

// 关联任务 (V1.1 line 1101-1104)
const linkedTasks = computed(() => {
  const allTasks = props.externalTasks && props.externalTasks.length > 0
    ? props.externalTasks
    : (taskStore.tasks || [])
  return allTasks.filter((t) => t.sourceProblemId)
})

// 筛选后 (V1.1 line 175-235)
const filteredProblems = computed(() => {
  let list
  switch (statusFilter.value) {
    case 'pending': list = pendingProblems.value; break
    case 'dispatched': list = dispatchedProblems.value; break
    case 'handled': list = handledProblems.value; break
    default: list = [...pendingProblems.value, ...dispatchedProblems.value, ...handledProblems.value]
  }
  if (severityFilter.value !== 'all') list = list.filter((p) => p.issueSeverity === severityFilter.value)
  if (sourceModuleFilter.value !== 'all') list = list.filter((p) => p.sourceModule === sourceModuleFilter.value)
  if (timeFilter.value !== 'all') {
    const now = new Date()
    let startDate = null
    let endDate = null
    if (timeFilter.value === 'week') {
      const day = now.getDay() || 7
      startDate = new Date(now)
      startDate.setDate(now.getDate() - day + 1)
    } else if (timeFilter.value === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (timeFilter.value === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    } else if (timeFilter.value === 'custom' && dateRange.start) {
      startDate = new Date(dateRange.start)
      if (dateRange.end) {
        endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
      }
    }
    if (startDate) {
      list = list.filter((p) => {
        const checkDate = new Date(p.checkDate)
        if (endDate) return checkDate >= startDate && checkDate <= endDate
        return checkDate >= startDate
      })
    }
  }
  return list
})

// 工人列表 (V1.1 useProblemDispatch.ts line 551-569)
const workerList = computed(() => {
  // 优先: useWorkerStore (V2.0 实际 store)
  if (workerStore && Array.isArray(workerStore.workers) && workerStore.workers.length > 0) {
    return workerStore.workers.map((w) => ({
      id: w.id || w.workerId,
      name: w.name,
      position: w.position || w.workerType || '员工',
      skillTags: w.skillTags || w.skills || [],
    }))
  }
  // 降级: 从 userStore.users 中提取可用执行人
  if (Array.isArray(userStore.users) && userStore.users.length > 0) {
    return userStore.users.map((u) => ({
      id: u.id || u.userId,
      name: u.name || u.username,
      position: u.position || u.role || '员工',
      skillTags: u.skillTags || [],
    }))
  }
  return []
})

// 可用温室列表（降级方案）
const availableGreenhouses = computed(() => {
  // 从已存在的问题中提取（如果有）
  const seen = new Set()
  const fromProblems = allProblems.value
    .filter((p) => p.greenhouseId && p.greenhouseName)
    .map((p) => ({ id: p.greenhouseId, name: p.greenhouseName }))
    .filter((g) => {
      if (seen.has(g.id)) return false
      seen.add(g.id)
      return true
    })
  if (fromProblems.length > 0) return fromProblems
  // 默认选项
  return [
    { id: 'G001', name: '1号温室' },
    { id: 'G002', name: '2号温室' },
    { id: 'G003', name: '3号温室' },
  ]
})

// 基本信息字段（详情弹窗）
const basicInfoFields = computed(() => {
  const p = detailModal.problem
  if (!p) return []
  return [
    { label: '温室区域', value: p.greenhouseName || '-' },
    { label: '作物名称', value: p.cropName || '-' },
    { label: '巡查人员', value: p.inspectorName || '-' },
    { label: '巡查时间', value: `${p.checkDate || ''} ${p.checkTime || ''}` },
    { label: '天气', value: p.weather || '-' },
    { label: '温湿度', value: `${p.temperature || 0}°C / ${p.humidity || 0}%` },
  ]
})

// 复选框显示控制
const showCheckbox = computed(() => batchDeleteMode.value || exportMode.value || batchDispatchMode.value)
const isAllSelected = computed(() => {
  if (batchDispatchMode.value) {
    return selectedProblems.value.length === pendingProblems.value.length && pendingProblems.value.length > 0
  }
  return selectedRows.value.length === filteredProblems.value.length && filteredProblems.value.length > 0
})

// 优先级/时间/反馈选项
const priorityOptions = [
  { value: 'high', label: '高', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', desc: '需立即处理' },
  { value: 'medium', label: '中', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', desc: '按时处理' },
  { value: 'low', label: '低', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', desc: '可稍后处理' },
]
const completionOptions = [
  { value: 'today', label: '今天', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { value: 'tomorrow', label: '明天', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { value: '3days', label: '3天内', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { value: 'week', label: '本周', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
]
const severityOptions = SEVERITY_OPTIONS
const feedbackOptions = FEEDBACK_OPTIONS

// ========== 辅助函数 ==========
function getStatusCN(status) { return STATUS_CN_MAP[status] || status }

function getSourceLabel(sourceModule) {
  const map = { inspection: '巡查', manual: '手动', equipment: '设备', infrastructure: '设施' }
  return map[sourceModule] || sourceModule || '未知'
}
function getSeverityStyle(severity) {
  if (severity === '严重') return 'bg-red-100 text-red-700'
  if (severity === '中等') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}
function getStatusStyle(status) {
  const cn = getStatusCN(status)
  switch (cn) {
    case '已处理': return 'bg-green-100 text-green-700'
    case '处理中': return 'bg-amber-100 text-amber-700'
    case '待验收': return 'bg-purple-100 text-purple-700'
    case '待处理': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
function getSeverityTextClass(severity) {
  if (severity === '严重') return 'text-red-600 font-semibold'
  if (severity === '中等') return 'text-amber-600 font-semibold'
  return 'text-blue-600 font-semibold'
}
function getPriorityClass(priority) {
  if (priority === 'urgent' || priority === 'high') return 'bg-red-100 text-red-700'
  if (priority === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-700'
}
function getPriorityLabel(priority) {
  if (priority === 'urgent' || priority === 'high') return '高'
  if (priority === 'medium') return '中'
  if (priority === 'low') return '低'
  return '普通'
}
function getTaskStatusClass(status) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'in_progress') return 'bg-blue-100 text-blue-700'
  if (status === 'cancelled') return 'bg-gray-100 text-gray-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-700'
}
function getTaskStatusLabel(status) {
  if (status === 'pending') return '待执行'
  if (status === 'in_progress') return '进行中'
  if (status === 'completed') return '已完成'
  if (status === 'cancelled') return '已取消'
  if (status === 'not_started') return '未开始'
  if (status === 'paused') return '已暂停'
  return status || '未知'
}
function getActionLabel(action) {
  const map = {
    report: '上报问题', dispatch: '分派任务', accept: '接单', reject: '拒绝',
    submit: '提交反馈', approve: '验收通过', reject_acceptance: '验收返工',
    complete: '完成', start: '开始处理', progress: '进度更新', comment: '评论',
  }
  return map[action] || action
}
function formatActionTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function getProblemById(id) {
  return allProblems.value.find((p) => p.id === id)
}

// ========== 业务规则: 状态机权限 (V1.1 useProblemDispatch.ts) ==========
function canEdit(problem) {
  return problem && (getStatusCN(problem.status) === '待处理') && !problem.sourceTaskId
}
function canDelete(problem) {
  return problem && (getStatusCN(problem.status) === '待处理') && !problem.sourceTaskId
}
function canAccept(problem) {
  return problem && getStatusCN(problem.status) === '处理中'
}
function canSubmitFeedback(problem) {
  return problem && getStatusCN(problem.status) === '处理中' && problem.sourceTaskId
}
function canApprove(problem) {
  return problem && getStatusCN(problem.status) === '待验收'
}
function canRejectAcceptance(problem) {
  return problem && getStatusCN(problem.status) === '待验收'
}
function canReject(problem) {
  return problem && getStatusCN(problem.status) === '处理中' && problem.sourceTaskId
}

// 严重程度→默认优先级
function mapSeverityToPriority(severity) {
  return SEVERITY_TO_PRIORITY[severity] || 'medium'
}

// ========== AI 推荐 (V1.1 line 263-306) ==========
function getProblemType(issueText) {
  const text = issueText || ''
  for (const mapping of PROBLEM_TYPE_MAPPING) {
    if (mapping.keywords.some((kw) => text.includes(kw))) {
      return { type: mapping.type, typeName: mapping.typeName }
    }
  }
  return { type: 'scouting', typeName: '问题处理' }
}

function getProblemTaskInfo(problem) {
  if (!problem) return null
  const issueText = problem.issueText || ''
  const typeInfo = getProblemType(issueText)
  return {
    id: `inspection-${problem.id}`,
    source: 'inspection',
    sourceId: String(problem.id),
    taskCode: `PD-${problem.id}`,
    title: `【问题处理】${issueText.slice(0, 30)}`,
    type: typeInfo.type,
    typeName: typeInfo.typeName,
    priority: SEVERITY_TO_PRIORITY[problem.issueSeverity] || 'normal',
    workZone: problem.greenhouseName || '',
    greenhouse: problem.greenhouseName || '',
    cropName: problem.cropName || '',
    batchId: problem.batchId,
    batchCode: problem.batchCode,
    requiredSkills: [],
    estimatedHours: 2,
    dueDate: '',
    description: issueText,
    createdAt: new Date().toISOString(),
  }
}

// 简化版 AI 推荐计算（无 useComprehensiveDispatch 时的降级方案）
function computeAIRecommendations(problem, top = 5) {
  if (!problem || workerList.value.length === 0) return []
  const isPestOrDisease = ['虫', '病', '蚝', '斑', '灰鸿'].some((k) => (problem.issueText || '').includes(k))
  return workerList.value.slice(0, top).map((w, idx) => {
    const baseScore = 90 - idx * 5
    const skillBonus = isPestOrDisease && (w.skillTags || []).some((t) => ['植保', '病虫害', '农药配制'].includes(t)) ? 10 : 0
    return {
      workerId: w.id,
      name: w.name,
      position: w.position,
      skills: w.skillTags || [],
      score: baseScore + skillBonus,
      skillMatchRate: 0.6 + (idx % 3) * 0.1,
    }
  })
}

function onAIRecommendSelect(workerId) {
  const worker = workerList.value.find((w) => w.id === workerId)
  if (worker) selectedWorkers.value = [{ id: worker.id, name: worker.name }]
}

// ========== 多选工人操作 ==========
function isWorkerSelected(workerId) {
  return selectedWorkers.value.some((w) => w.id === workerId)
}
function toggleWorkerSelect(worker, checked) {
  if (checked) {
    if (!isWorkerSelected(worker.id)) selectedWorkers.value.push({ id: worker.id, name: worker.name })
  } else {
    selectedWorkers.value = selectedWorkers.value.filter((w) => w.id !== worker.id)
  }
}
function toggleFeedback(key, checked) {
  if (checked) {
    if (!requiredFeedback.value.includes(key)) requiredFeedback.value.push(key)
  } else {
    requiredFeedback.value = requiredFeedback.value.filter((f) => f !== key)
  }
}

// ========== 时间/日期 ==========
function selectCompletionTime(value) {
  expectedCompletion.value = value
  customDueDate.value = ''
}
function calculateDueDate() {
  const today = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)
  switch (expectedCompletion.value) {
    case 'today': return fmt(today)
    case 'tomorrow': { const d = new Date(today); d.setDate(d.getDate() + 1); return fmt(d) }
    case '3days': { const d = new Date(today); d.setDate(d.getDate() + 3); return fmt(d) }
    case 'week': { const d = new Date(today); d.setDate(d.getDate() + 7); return fmt(d) }
    case 'custom': return customDueDate.value
    default: { const d = new Date(today); d.setDate(d.getDate() + 3); return fmt(d) }
  }
}

// ========== 复选框操作 (V1.1 line 400-436) ==========
function onToggleSelect(id) {
  const arr = batchDispatchMode.value ? selectedProblems.value : selectedRows.value
  if (arr.includes(id)) {
    const idx = arr.indexOf(id)
    arr.splice(idx, 1)
  } else {
    arr.push(id)
  }
}
function onToggleSelectAll() {
  if (selectedRows.value.length === filteredProblems.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredProblems.value.map((p) => p.id)
  }
}
function onBatchSelectAll() {
  if (selectedProblems.value.length === pendingProblems.value.length) {
    selectedProblems.value = []
  } else {
    selectedProblems.value = pendingProblems.value.map((p) => p.id)
  }
}

// ========== 弹窗操作 ==========
function openDispatchModal(problem) {
  dispatchModal.isOpen = true
  dispatchModal.problem = problem
  dispatchModal.batchMode = false
  dispatchMode.value = 'ai_assisted'
  selectedWorkers.value = []
  // 计算 AI 推荐
  aiRecommendations.value = computeAIRecommendations(problem)
  // 严重程度→默认优先级
  if (problem) selectedPriority.value = mapSeverityToPriority(problem.issueSeverity)
}
function openBatchDispatchModal() {
  dispatchModal.isOpen = true
  dispatchModal.problem = null
  dispatchModal.batchMode = true
  dispatchMode.value = 'manual'
  selectedWorkers.value = []
  selectedProblems.value = pendingProblems.value.map((p) => p.id)
}
function handleCloseDispatch() {
  dispatchModal.isOpen = false
  dispatchModal.problem = null
  dispatchModal.batchMode = false
  selectedWorkers.value = []
  dispatchMode.value = 'ai_assisted'
  requiredFeedback.value = ['workload_confirm']
  expectedCompletion.value = '3days'
  customDueDate.value = ''
  aiRecommendations.value = []
}

// ========== 分派提交 (V1.1 line 339-398) ==========
async function handleDispatchSubmit() {
  if (selectedWorkers.value.length === 0) {
    ElMessage.warning('请选择至少一个执行人')
    return
  }
  if (dispatchModal.batchMode) {
    // 批量分派
    const dueDate = calculateDueDate()
    let successCount = 0
    for (const problemId of selectedProblems.value) {
      const problem = allProblems.value.find((p) => p.id === problemId)
      if (!problem) continue
      const ok = await dispatchOneProblem(problem, selectedWorkers.value, dueDate)
      if (ok) successCount++
    }
    ElMessage.success(`批量分派完成：${successCount}/${selectedProblems.value.length}`)
  } else if (dispatchModal.problem) {
    // 单个分派
    const ok = await dispatchOneProblem(dispatchModal.problem, selectedWorkers.value, calculateDueDate())
    if (ok) ElMessage.success('分派完成')
  }
  handleCloseDispatch()
  batchDispatchMode.value = false
  selectedProblems.value = []
  props.onProblemDispatched?.()
  emit('problem-dispatched')
}

// 分派单个问题 (V1.1 useProblemDispatch line 195-287)
async function dispatchOneProblem(problem, workers, dueDate) {
  if (!problem || !workers || workers.length === 0) return false
  const dispatcherId = userStore.userInfo?.id || 'U001'
  const dispatcherName = userStore.userInfo?.name || '系统管理员'
  const issueText = problem.issueText || problem.description || problem.title || ''
  const severity = problem.issueSeverity || '中等'
  const typeInfo = getProblemType(issueText)

  // 为每个 worker 创建任务
  const createdTaskIds = []
  for (const worker of workers) {
    try {
      const task = await taskStore.createTask?.({
        title: `【问题处理】${issueText.slice(0, 30)}`,
        type: typeInfo.type,
        typeName: typeInfo.typeName,
        priority: selectedPriority.value,
        status: 'pending',
        batchId: problem.batchId || '',
        batchCode: problem.batchCode || '',
        greenhouseId: problem.greenhouseId || '',
        greenhouseName: problem.greenhouseName || '',
        assigneeId: worker.id,
        assigneeName: worker.name,
        assignerId: dispatcherId,
        assignerName: dispatcherName,
        dueDate,
        description: `问题描述：${issueText}\n严重程度：${severity}\n巡查时间：${problem.checkDate || ''} ${problem.checkTime || ''}\n温室：${problem.greenhouseName || ''}\n作物：${problem.cropName || ''}`,
        actualWorkload: 0,
        sourceProblemId: problem.id,
        requiredFeedback: [...requiredFeedback.value],
        dispatchMode: 'problem',
      })
      if (task && task.id) createdTaskIds.push(task.id)
    } catch (e) {
      console.warn('[ProblemTab] 创建任务失败:', e)
    }
  }

  // 流转记录
  const newFlowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId: dispatcherId,
    operatorName: dispatcherName,
    action: 'dispatch',
    fromStatus: getStatusCN(problem.status) || '待处理',
    toStatus: '处理中',
    comment: `分派给 ${workers.map((w) => w.name).join('、')} 处理`,
    actionTime: new Date().toISOString(),
  }
  const flowRecords = [...(problem.flowRecords || []), newFlowRecord]

  // 更新问题状态
  await problemStore.updateProblem(problem.id, {
    status: 'in_progress',
    handler: workers.map((w) => w.name).join('、'),
    sourceTaskId: createdTaskIds[0] || problem.sourceTaskId || null,
    expectedCompletion: dueDate,
    flowRecords,
  })
  return true
}

// ========== 详情弹窗 ==========
function openDetailModal(problem) {
  detailModal.isOpen = true
  detailModal.problem = problem
}

// ========== 工作流操作 (V1.1 useProblemDispatch 全部状态机方法) ==========
// 接单 (V1.1 line 332-358)
async function handleAcceptProblem(problem) {
  if (!problem) return
  const operatorId = userStore.userInfo?.id || 'U001'
  const operatorName = userStore.userInfo?.name || '系统管理员'
  const flowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId, operatorName,
    action: 'accept',
    fromStatus: getStatusCN(problem.status),
    toStatus: getStatusCN(problem.status),
    comment: '已接单，开始处理',
    actionTime: new Date().toISOString(),
  }
  await problemStore.updateProblem(problem.id, {
    acceptedBy: operatorName,
    acceptedTime: new Date().toISOString(),
    flowRecords: [...(problem.flowRecords || []), flowRecord],
  })
  ElMessage.success('已接单')
  // 刷新详情
  const updated = problemStore.problems.find((p) => p.id === problem.id)
  if (updated) detailModal.problem = updated
}

// 拒绝接单 (V1.1 line 361-392)
function openRejectDialog(problem) {
  rejectDialog.isOpen = true
  rejectDialog.problem = problem
  rejectForm.reason = ''
}
async function handleRejectProblem() {
  if (!rejectDialog.problem || !rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  const problem = rejectDialog.problem
  const operatorId = userStore.userInfo?.id || 'U001'
  const operatorName = userStore.userInfo?.name || '系统管理员'
  const flowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId, operatorName,
    action: 'reject',
    fromStatus: getStatusCN(problem.status),
    toStatus: '待处理',
    comment: `拒绝原因：${rejectForm.reason}`,
    actionTime: new Date().toISOString(),
  }
  await problemStore.updateProblem(problem.id, {
    status: 'pending',
    rejectedBy: operatorName,
    rejectedReason: rejectForm.reason,
    rejectedTime: new Date().toISOString(),
    handler: '',
    sourceTaskId: '',
    flowRecords: [...(problem.flowRecords || []), flowRecord],
  })
  ElMessage.success('已拒绝接单')
  rejectDialog.isOpen = false
  const updated = problemStore.problems.find((p) => p.id === problem.id)
  if (updated) detailModal.problem = updated
}

// 提交反馈 (V1.1 line 395-428)
function openFeedbackDialog(problem) {
  feedbackDialog.isOpen = true
  feedbackDialog.problem = problem
  feedbackForm.resultText = ''
  feedbackForm.actualWorkload = 0
}
async function handleSubmitFeedback() {
  if (!feedbackDialog.problem || !feedbackForm.resultText.trim()) {
    ElMessage.warning('请输入处理结果')
    return
  }
  const problem = feedbackDialog.problem
  const operatorId = userStore.userInfo?.id || 'U001'
  const operatorName = userStore.userInfo?.name || '系统管理员'
  const flowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId, operatorName,
    action: 'submit',
    fromStatus: getStatusCN(problem.status),
    toStatus: '待验收',
    comment: feedbackForm.resultText,
    actionTime: new Date().toISOString(),
  }
  await problemStore.updateProblem(problem.id, {
    status: 'waiting_acceptance',
    handleResult: feedbackForm.resultText,
    handleDate: new Date().toISOString().slice(0, 10),
    flowRecords: [...(problem.flowRecords || []), flowRecord],
  })
  ElMessage.success('已提交反馈，等待验收')
  feedbackDialog.isOpen = false
  const updated = problemStore.problems.find((p) => p.id === problem.id)
  if (updated) detailModal.problem = updated
}

// 验收通过 (V1.1 line 462-494)
async function handleApproveCompletion(problem) {
  if (!problem) return
  const operatorId = userStore.userInfo?.id || 'U001'
  const operatorName = userStore.userInfo?.name || '系统管理员'
  const flowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId, operatorName,
    action: 'approve',
    fromStatus: getStatusCN(problem.status),
    toStatus: '已处理',
    comment: '验收通过，问题关闭',
    actionTime: new Date().toISOString(),
  }
  await problemStore.updateProblem(problem.id, {
    status: 'completed',
    completionTime: new Date().toISOString(),
    flowRecords: [...(problem.flowRecords || []), flowRecord],
  })
  // 同步关闭关联任务
  if (problem.sourceTaskId && taskStore.updateTaskStatus) {
    await taskStore.updateTaskStatus(problem.sourceTaskId, 'completed')
  }
  ElMessage.success('验收通过，问题已关闭')
  const updated = problemStore.problems.find((p) => p.id === problem.id)
  if (updated) detailModal.problem = updated
}

// 验收返工 (V1.1 line 497-542)
function openRejectAcceptanceDialog(problem) {
  reworkDialog.isOpen = true
  reworkDialog.problem = problem
  reworkForm.reason = ''
  // 预判是否触发退分派
  const newCount = (problem.reworkCount || 0) + 1
  reworkForm.willReassign = newCount >= 2
}
async function handleRejectAcceptance() {
  if (!reworkDialog.problem || !reworkForm.reason.trim()) {
    ElMessage.warning('请输入返工原因')
    return
  }
  const problem = reworkDialog.problem
  const operatorId = userStore.userInfo?.id || 'U001'
  const operatorName = userStore.userInfo?.name || '系统管理员'
  const newReworkCount = (problem.reworkCount || 0) + 1
  const shouldReassign = newReworkCount >= 2

  const flowRecord = {
    id: `FR-${Date.now()}`,
    problemId: problem.id,
    operatorId, operatorName,
    action: 'reject_acceptance',
    fromStatus: getStatusCN(problem.status),
    toStatus: shouldReassign ? '待处理' : getStatusCN(problem.status),
    comment: `返工原因：${reworkForm.reason}${shouldReassign ? '【已超限，退回重新分派】' : ''}`,
    actionTime: new Date().toISOString(),
  }

  if (shouldReassign) {
    await problemStore.updateProblem(problem.id, {
      status: 'pending',
      handler: '',
      sourceTaskId: '',
      reworkCount: newReworkCount,
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })
    if (problem.sourceTaskId && taskStore.updateTaskStatus) {
      await taskStore.updateTaskStatus(problem.sourceTaskId, 'rejected')
    }
    ElMessage.warning(`已返工 ${newReworkCount} 次，自动退分派重分`)
  } else {
    await problemStore.updateProblem(problem.id, {
      reworkCount: newReworkCount,
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })
    if (problem.sourceTaskId && taskStore.updateTaskStatus) {
      await taskStore.updateTaskStatus(problem.sourceTaskId, 'in_progress')
    }
    ElMessage.success(`已返工 ${newReworkCount} 次`)
  }
  reworkDialog.isOpen = false
  const updated = problemStore.problems.find((p) => p.id === problem.id)
  if (updated) detailModal.problem = updated
}

// 退分派重分
function openReassignDialog(problem) {
  if (!problem) return
  ElMessageBox.confirm(
    `该问题已返工 ${problem.reworkCount || 0} 次，确认退分派重分？`,
    '退分派确认',
    { confirmButtonText: '确认退分派', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    const operatorId = userStore.userInfo?.id || 'U001'
    const operatorName = userStore.userInfo?.name || '系统管理员'
    const flowRecord = {
      id: `FR-${Date.now()}`,
      problemId: problem.id,
      operatorId, operatorName,
      action: 'reject_acceptance',
      fromStatus: getStatusCN(problem.status),
      toStatus: '待处理',
      comment: '已超返工上限，退回重新分派',
      actionTime: new Date().toISOString(),
    }
    await problemStore.updateProblem(problem.id, {
      status: 'pending',
      handler: '',
      sourceTaskId: '',
      flowRecords: [...(problem.flowRecords || []), flowRecord],
    })
    if (problem.sourceTaskId && taskStore.updateTaskStatus) {
      await taskStore.updateTaskStatus(problem.sourceTaskId, 'rejected')
    }
    ElMessage.success('已退分派，请重新分派')
    // 自动打开分派弹窗
    const updated = problemStore.problems.find((p) => p.id === problem.id)
    if (updated) openDispatchModal(updated)
  }).catch(() => {})
}

// ========== 批量操作 ==========
function handleTableSelectionChange(rows) {
  selectedRows.value = rows.map((r) => r.id)
}
function enterBatchDispatch() {
  batchDispatchMode.value = true
  selectedProblems.value = []
  statusFilter.value = 'pending'
}
function enterExport() {
  exportMode.value = true
  selectedRows.value = []
}
function cancelExport() { exportMode.value = false; selectedRows.value = [] }
function cancelBatchDelete() { batchDeleteMode.value = false; selectedRows.value = [] }
function cancelBatchDispatch() { batchDispatchMode.value = false; selectedProblems.value = [] }

// ========== 新建/编辑问题 (V1.1 line 451-510) ==========
function openCreateModal() {
  editingProblem.value = null
  Object.assign(createForm, {
    greenhouseId: '', greenhouseName: '', cropName: '',
    inspectorId: userStore.userInfo?.id || 'U001',
    inspectorName: userStore.userInfo?.name || '系统管理员',
    checkDate: new Date().toISOString().slice(0, 10),
    checkTime: new Date().toTimeString().slice(0, 5),
    issueText: '',
    issueSeverity: '中等',
  })
  showCreateModal.value = true
}

function openEditProblem(problem) {
  if (!problem) return
  editingProblem.value = problem
  Object.assign(createForm, {
    greenhouseId: problem.greenhouseId || '',
    greenhouseName: problem.greenhouseName || '',
    cropName: problem.cropName || '',
    inspectorId: problem.inspectorId || 'U001',
    inspectorName: problem.inspectorName || '系统管理员',
    checkDate: problem.checkDate || new Date().toISOString().slice(0, 10),
    checkTime: problem.checkTime || new Date().toTimeString().slice(0, 5),
    issueText: problem.issueText || '',
    issueSeverity: problem.issueSeverity || '中等',
  })
  showCreateModal.value = true
}

function handleCreateClose() {
  showCreateModal.value = false
  editingProblem.value = null
  Object.assign(createForm, {
    greenhouseId: '', greenhouseName: '', cropName: '',
    inspectorId: 'U001', inspectorName: '系统管理员',
    checkDate: new Date().toISOString().slice(0, 10),
    checkTime: new Date().toTimeString().slice(0, 5),
    issueText: '', issueSeverity: '中等',
  })
}

async function handleCreateSubmit() {
  if (!createForm.greenhouseId || !createForm.cropName || !createForm.issueText) {
    ElMessage.warning('请填写必填项')
    return
  }
  createLoading.value = true
  try {
    const gh = availableGreenhouses.value.find((g) => g.id === createForm.greenhouseId)
    const flowRecords = [{
      id: `FR-${Date.now()}`,
      operatorName: createForm.inspectorName,
      action: 'report',
      actionTime: new Date().toISOString(),
    }]

    if (editingProblem.value) {
      // 编辑模式
      const newFlowRecord = {
        id: `FR-${Date.now()}`,
        operatorName: userStore.userInfo?.name || '系统管理员',
        action: 'comment',
        comment: '编辑问题',
        actionTime: new Date().toISOString(),
      }
      await problemStore.updateProblem(editingProblem.value.id, {
        greenhouseId: createForm.greenhouseId,
        greenhouseName: gh?.name || createForm.greenhouseName,
        cropName: createForm.cropName,
        inspectorName: createForm.inspectorName,
        checkDate: createForm.checkDate,
        checkTime: createForm.checkTime,
        issueText: createForm.issueText,
        issueSeverity: createForm.issueSeverity,
        flowRecords: [...(editingProblem.value.flowRecords || []), newFlowRecord],
      })
      ElMessage.success('问题修改成功')
    } else {
      // 新建模式
      const problemCode = `PD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-3)}`
      const newProblem = {
        problemCode,
        greenhouseId: createForm.greenhouseId,
        greenhouseName: gh?.name || createForm.greenhouseName,
        cropName: createForm.cropName,
        inspectorId: createForm.inspectorId,
        inspectorName: createForm.inspectorName,
        checkDate: createForm.checkDate,
        checkTime: createForm.checkTime,
        weather: '晴',
        temperature: 25,
        humidity: 60,
        cropStatus: '正常',
        issueText: createForm.issueText,
        issueSeverity: createForm.issueSeverity,
        status: 'pending',
        sourceModule: 'manual',
        sourceTaskId: null,
        handler: '',
        flowRecords,
      }
      await problemStore.createProblem(newProblem)
      ElMessage.success('问题创建成功')
    }
    handleCreateClose()
    props.onProblemDispatched?.()
    emit('problem-dispatched')
  } catch (e) {
    console.warn('[ProblemTab] 保存问题失败:', e)
    ElMessage.error('保存失败')
  } finally {
    createLoading.value = false
  }
}

// 单个删除
async function deleteSingleProblem(problem) {
  try {
    await ElMessageBox.confirm(
      `确定要删除问题 "${problem.problemCode || problem.id}" 吗？`,
      '删除确认',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch { return }
  await problemStore.deleteProblem(problem.id)
  ElMessage.success('删除成功')
}

// ========== 删除 ==========
async function handleDeleteConfirm() {
  const idsToDelete = [...selectedRows.value]
  if (idsToDelete.length === 0) {
    ElMessage.warning('请先选择要删除的问题')
    return
  }
  await problemStore.deleteProblems(idsToDelete)
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
  ElMessage.success(`已删除 ${idsToDelete.length} 个问题`)
}

// ========== 导出 (V1.1 line 530-607) ==========
function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的问题')
    return
  }
  const selectedData = allProblems.value.filter((p) => selectedRows.value.includes(p.id))
  const headers = ['问题编号', '温室', '作物', '问题描述', '严重程度', '状态', '处理人', '巡查日期', '巡查时间']
  const mapRow = (row) => ({
    '问题编号': row.problemCode || row.id,
    '温室': row.greenhouseName,
    '作物': row.cropName,
    '问题描述': row.issueText,
    '严重程度': row.issueSeverity,
    '状态': getStatusCN(row.status),
    '处理人': row.handler || row.handlerName || row.assigneeName || '-',
    '巡查日期': row.checkDate,
    '巡查时间': row.checkTime,
  })

  let content
  const filename = `问题分派_${new Date().toISOString().slice(0, 10)}`
  if (exportFormatModel.value === 'csv') {
    content = headers.join(',') + '\n' + selectedData.map((r) =>
      headers.map((h) => `"${mapRow(r)[h] || ''}"`).join(',')
    ).join('\n')
    downloadFile(content, filename + '.csv', 'text/csv')
  } else if (exportFormatModel.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${selectedData.map((r) => `<tr>${headers.map((h) => `<td>${mapRow(r)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    downloadFile(content, filename + '.xls', 'application/vnd.ms-excel')
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map((h) => `<th>${h}</th>`).join('')}${selectedData.map((r) => `<tr>${headers.map((h) => `<td>${mapRow(r)[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    downloadFile(content, filename + '.doc', 'application/vnd.ms-word')
  }
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出完成')
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob(['﻿' + content], { type: mimeType + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ========== 巡查问题联动 (V1.1 useProblemStore getBySource) ==========
function getInspectionProblems() {
  if (!inspectionStore) return []
  // 尝试 inspectionStore.problems 或 inspectionStore.records
  const list = inspectionStore.problems || inspectionStore.records || []
  return list.filter((p) => p.sourceModule === 'inspection' || p.inspectionId)
}

// ========== 初始化 (V1.1 line 78-96) ==========
onMounted(async () => {
  // 1. 加载问题列表
  problemStore.fetchProblems()
  // 2. 加载用户列表（如果为空）
  if (!userStore.users || userStore.users.length === 0) {
    userStore.loadUsers()
  }
  // 3. 加载任务列表
  if (taskStore.fetchTasks) {
    taskStore.fetchTasks()
  }
  // 4. 加载工人列表（如果 store 存在）
  if (workerStore && workerStore.loadWorkers) {
    workerStore.loadWorkers()
  }
})
</script>

<style scoped>
/* 弹窗头部覆盖样式 - 与 V1.1 line 939-959 头部样式 1:1 对齐 */
:deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
}
</style>
