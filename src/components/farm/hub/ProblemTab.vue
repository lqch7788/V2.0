<template>
  <!-- 问题管理Tab - 从V1.1 ProblemTab.tsx 1:1迁移，完整业务逻辑 -->
  <div class="space-y-6">
    <!-- 标签页切换 -->
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

    <!-- 问题列表标签页 -->
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
        @time-filter-change="timeFilter = $event"
        @date-range-change="dateRange = $event"
        @status-filter-change="statusFilter = $event"
        @severity-filter-change="severityFilter = $event"
        @source-module-change="sourceModuleFilter = $event"
        @cancel-export="cancelExport"
        @cancel-batch-delete="cancelBatchDelete"
        @cancel-batch-dispatch="cancelBatchDispatch"
        @confirm-dispatch="openBatchDispatchModal"
        @confirm-export="showExportModal = true"
        @confirm-delete="showDeleteWarning = true"
      />

      <!-- 问题管理列表标题 -->
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

        <!-- 问题表格 -->
        <el-table
          :data="filteredProblems"
          stripe
          size="default"
          style="width: 100%"
          :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
          @selection-change="handleTableSelectionChange"
        >
          <el-table-column
            v-if="batchDeleteMode || batchDispatchMode || exportMode"
            type="selection"
            width="50"
          />
          <el-table-column prop="id" label="问题编号" width="100" />
          <el-table-column label="来源" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getSourceTypeTag(row.sourceModule)">
                {{ getSourceLabel(row.sourceModule) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="greenhouseName" label="温室" width="120" show-overflow-tooltip />
          <el-table-column prop="cropName" label="作物" width="80" align="center" />
          <el-table-column label="问题描述" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-tag
                  :type="getSeverityTag(row.issueSeverity)"
                  size="small"
                  effect="dark"
                >
                  {{ row.issueSeverity }}
                </el-tag>
                <span class="text-sm text-gray-700 truncate">{{ row.issueText }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getProblemStatusTag(row.status)" size="small" effect="plain">
                {{ getStatusCN(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="inspectorName" label="巡查人员" width="100" align="center" />
          <el-table-column label="巡查日期" width="120" align="center">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.checkDate }} {{ row.checkTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-1">
                <el-button link type="primary" size="small" @click="openDetailModal(row)">
                  详情
                </el-button>
                <el-button
                  v-if="getStatusCN(row.status) === '待处理' && !row.sourceTaskId"
                  link type="warning" size="small"
                  @click="openDispatchModal(row)"
                >
                  分派
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- AI推荐面板 -->
      <div v-if="pendingProblems.length > 0 && !batchDispatchMode" class="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
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
              <el-button size="small" @click="enterBatchDispatch">查看AI推荐</el-button>
              <el-button size="small" @click="enterBatchDispatch">手动选择执行人</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关联任务标签页 -->
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

      <!-- 关联任务列表 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <el-table :data="linkedTasks" stripe size="default" style="width: 100%">
          <el-table-column prop="taskCode" label="任务编号" width="150" />
          <el-table-column prop="title" label="任务标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="greenhouseName" label="温室" width="120" />
          <el-table-column prop="assigneeName" label="执行人" width="100" align="center" />
          <el-table-column prop="dueDate" label="截止日期" width="120" align="center" />
          <el-table-column label="优先级" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="getPriorityTag(row.priority)" size="small" effect="plain">
                {{ row.priority === 'high' || row.priority === 'urgent' ? '高' : row.priority === 'medium' ? '中' : '普通' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTaskStatusTag(row.status)" size="small" effect="plain">
                {{ row.status === 'pending' ? '待执行' : row.status === 'in_progress' ? '进行中' : row.status === 'completed' ? '已完成' : row.status === 'cancelled' ? '已取消' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="linkedTasks.length === 0" class="text-center py-12 text-gray-400">
          暂无分派任务
        </div>
      </div>
    </div>

    <!-- ========== 分派弹窗 ========== -->
    <el-dialog
      v-model="dispatchModal.isOpen"
      :title="dispatchModal.batchMode ? '批量分派问题' : '分派问题'"
      width="700px"
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

        <!-- 分派模式切换 -->
        <div class="flex gap-2">
          <el-button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium',
              dispatchAssignMode === 'ai_assisted'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600',
            ]"
            @click="dispatchAssignMode = 'ai_assisted'"
          >
            <el-icon><MagicStick /></el-icon>
            AI推荐（默认）
          </el-button>
          <el-button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium',
              dispatchAssignMode === 'manual'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600',
            ]"
            @click="dispatchAssignMode = 'manual'"
          >
            <el-icon><UserFilled /></el-icon>
            手动选择
          </el-button>
        </div>

        <!-- 手动选择执行人列表（多选） -->
        <div class="border-2 border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          <div v-if="mockWorkerList.length === 0" class="p-6 text-center text-gray-400 text-sm">
            暂无可用执行人
          </div>
          <label
            v-for="worker in mockWorkerList"
            :key="worker.id"
            :class="[
              'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0',
              isWorkerSelected(worker.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent',
            ]"
          >
            <el-checkbox
              :model-value="isWorkerSelected(worker.id)"
              @change="(checked) => toggleWorkerSelect(worker, checked)"
            />
            <div class="flex-1 min-w-0">
              <span class="font-medium text-gray-900">{{ worker.name }}</span>
              <span class="text-sm text-gray-500">（{{ worker.position }}）</span>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <span
                v-for="tag in (worker.skillTags || []).slice(0, 2)"
                :key="tag"
                class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </label>
        </div>

        <!-- 已选择执行人提示 -->
        <div v-if="selectedWorkers.length > 0" class="text-sm text-emerald-600 font-medium">
          已选择 {{ selectedWorkers.length }} 人：{{ selectedWorkers.map(w => w.name).join('、') }}
        </div>

        <!-- 优先级选择 -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span class="w-5 h-5 text-center text-red-500 font-bold">!</span>
            选择优先级
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="opt in priorityOptions"
              :key="opt.value"
              :class="[
                'px-4 py-3 rounded-lg border-2 font-medium transition-all flex flex-col items-start min-w-[100px]',
                selectedPriority === opt.value ? `${opt.bg} ${opt.border} ${opt.text} shadow-sm` : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="selectedPriority = opt.value"
            >
              <span class="font-semibold">{{ opt.label }}</span>
              <span class="text-xs opacity-80">{{ opt.desc }}</span>
            </el-button>
          </div>
        </div>

        <!-- 期望完成时间 -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon class="text-amber-500"><Clock /></el-icon>
            期望完成时间
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="opt in completionOptions"
              :key="opt.value"
              :class="[
                'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                expectedCompletion === opt.value && !customDueDate
                  ? `${opt.bg} ${opt.border} ${opt.text}`
                  : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="selectCompletionTime(opt.value)"
            >
              {{ opt.label }}
            </el-button>
            <el-button
              :class="[
                'px-4 py-2 rounded-lg border-2 font-medium transition-colors',
                expectedCompletion === 'custom'
                  ? 'bg-violet-50 border-violet-200 text-violet-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600',
              ]"
              @click="expectedCompletion = 'custom'"
            >
              自定义
            </el-button>
            <el-date-picker
              v-if="expectedCompletion === 'custom'"
              v-model="customDueDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div v-if="expectedCompletion !== 'custom'" class="mt-2 text-sm text-slate-500">
            预计完成日期：<span class="font-medium text-violet-600">{{ calculateDueDate() }}</span>
          </div>
        </div>

        <!-- 必填反馈要求 -->
        <div class="border-t border-gray-200 pt-4">
          <div class="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <el-icon class="text-emerald-500"><Camera /></el-icon>
            必填反馈要求
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label
              v-for="item in feedbackOptions"
              :key="item.key"
              :class="[
                'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all',
                requiredFeedback.includes(item.key)
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-200',
              ]"
            >
              <el-checkbox
                :model-value="requiredFeedback.includes(item.key)"
                @change="(checked) => toggleFeedback(item.key, checked)"
                class="sr-only"
              />
              <span class="text-lg">{{ item.icon }}</span>
              <span :class="['text-sm font-medium', requiredFeedback.includes(item.key) ? 'text-emerald-700' : 'text-gray-600']">
                {{ item.label }}
              </span>
              <el-icon v-if="requiredFeedback.includes(item.key)" class="text-emerald-500 ml-auto"><CircleCheck /></el-icon>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseDispatch">取消</el-button>
        <el-button type="primary" :disabled="selectedWorkers.length === 0" @click="handleDispatch">
          确认分派
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 详情弹窗 ========== -->
    <el-dialog
      v-model="detailModal.isOpen"
      title="问题详情"
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
              <p class="text-sm text-white/80 font-mono">{{ detailModal.problem?.problemCode }}</p>
            </div>
          </div>
        </div>
      </template>

      <div v-if="detailModal.problem" class="space-y-4 -mx-6 px-6">
        <!-- 来源标签 -->
        <SourceBadge :problem="detailModal.problem" />

        <!-- 问题描述 - 红色背景 -->
        <div class="bg-red-50 rounded-lg p-4 border border-red-100">
          <h4 class="text-sm font-bold text-red-700 mb-3">问题描述</h4>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-sm">!</span>
            </div>
            <div class="flex-1">
              <el-tag
                :type="getSeverityTag(detailModal.problem.issueSeverity)"
                size="small"
                effect="dark"
                class="mb-2"
              >
                {{ detailModal.problem.issueSeverity }}
              </el-tag>
              <p class="text-sm text-gray-800 leading-relaxed">{{ detailModal.problem.issueText }}</p>
            </div>
          </div>
        </div>

        <!-- 基本信息 - 蓝色背景 -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 class="text-sm font-bold text-blue-700 mb-3">基本信息</h4>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="info in basicInfoFields" :key="info.label" class="bg-white rounded-lg p-3">
              <div class="text-xs text-blue-600 mb-1">{{ info.label }}</div>
              <div class="text-sm font-semibold text-gray-900">{{ info.value }}</div>
            </div>
          </div>
        </div>

        <!-- 处理信息 - 橙色背景 -->
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <h4 class="text-sm font-bold text-orange-700 mb-3">处理信息</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">当前状态</div>
              <el-tag :type="getProblemStatusTag(detailModal.problem.status)" size="small" effect="plain">
                {{ detailModal.problem.status }}
              </el-tag>
            </div>
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-orange-600 mb-1">处理人</div>
              <div class="text-sm font-semibold text-gray-900">{{ detailModal.problem.handler || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 流转记录 -->
        <div class="bg-slate-100 rounded-lg p-4 border border-slate-200">
          <h4 class="text-sm font-bold text-slate-700 mb-3">流转记录</h4>
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
      </div>
      <template #footer>
        <el-button @click="detailModal = { isOpen: false, problem: null }">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ========== 新建问题弹窗 ========== -->
    <el-dialog v-model="showCreateModal" title="新建问题" width="560px" destroy-on-close @close="handleCreateClose">
      <el-form ref="createFormRef" :model="createForm" label-width="100px">
        <el-form-item label="温室区域" required>
          <el-select v-model="createForm.greenhouseId" placeholder="请选择温室区域" style="width: 100%" filterable>
            <el-option v-for="g in mockGreenhouses" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物名称" required>
          <el-input v-model="createForm.cropName" placeholder="请输入作物名称" />
        </el-form-item>
        <el-form-item label="巡查人员" required>
          <el-input v-model="createForm.inspectorName" placeholder="请输入巡查人员" />
        </el-form-item>
        <el-form-item label="巡查日期" required>
          <el-date-picker v-model="createForm.checkDate" type="date" placeholder="请选择巡查日期" style="width: 100%" value-format="YYYY-MM-DD" />
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
        <el-button type="primary" :loading="createLoading" @click="handleCreateSubmit">确认创建</el-button>
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
 * 问题管理Tab - 从V1.1 ProblemTab.tsx 1:1迁移
 * 完整功能：问题列表/关联任务双标签页，筛选、分派、详情、新建、删除、导出
 */
import { ref, reactive, computed, onMounted } from 'vue'
import {
  WarningFilled, List, Plus, Promotion, Download, MagicStick,
  UserFilled, Clock, Camera, CircleCheck,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProblemStore } from '@/stores/modules/problem'

// ========== Props ==========
const props = defineProps({
  onProblemDispatched: { type: Function, default: null },
  externalTasks: { type: Array, default: () => [] },
  stats: { type: Object, default: null },
})

const emit = defineEmits(['problem-dispatched'])

// ========== 常量（与V1.1完全一致） ==========
const STATUS_CN_MAP = {
  pending: '待处理',
  in_progress: '处理中',
  waiting_acceptance: '待验收',
  completed: '已处理',
}

const FEEDBACK_OPTIONS = [
  { key: 'workload_confirm', label: '工作量确认', icon: '⏰' },
  { key: 'gps', label: '位置打卡', icon: '📌' },
  { key: 'photo_before', label: '作业前照片', icon: '📷' },
  { key: 'photo_after', label: '作业后照片', icon: '📸' },
  { key: 'material', label: '物资扫码', icon: '📦' },
  { key: 'voice', label: '语音备注', icon: '🎤' },
]

const SEVERITY_OPTIONS = ['轻微', '中等', '严重']

const SEVERITY_TO_PRIORITY = { '严重': 'urgent', '中等': 'high', '轻微': 'normal' }

// ========== 模拟数据 ==========
const mockGreenhouses = [
  { id: 'G001', name: '1号温室' },
  { id: 'G002', name: '2号温室' },
  { id: 'G003', name: '3号温室' },
]

const mockWorkerList = [
  { id: 'W001', name: '张三', position: '农艺师', skillTags: ['植保', '病虫害'] },
  { id: 'W002', name: '李四', position: '技术员', skillTags: ['灌溉', '施肥'] },
  { id: 'W003', name: '王五', position: '农技员', skillTags: ['病虫害', '修剪'] },
  { id: 'W004', name: '赵六', position: '管理员', skillTags: ['管理'] },
]


// ========== Store ==========
const problemStore = useProblemStore()

// ========== 核心状态 ==========
const activeSubTab = ref('problems')
const allProblems = computed(() => problemStore.problems)

// 筛选状态
const statusFilter = ref('all')
const severityFilter = ref('all')
const sourceModuleFilter = ref('all')
const timeFilter = ref('all')
const dateRange = reactive({ start: '', end: '' })

// 批量操作
const batchDeleteMode = ref(false)
const batchDispatchMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const selectedProblems = ref([])

// 弹窗状态
const showCreateModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const createLoading = ref(false)

// 分派弹窗
const dispatchModal = reactive({
  isOpen: false,
  problem: null,
  batchMode: false,
})
const dispatchAssignMode = ref('ai_assisted')
const selectedWorkers = ref([])
const selectedPriority = ref('medium')
const expectedCompletion = ref('3days')
const customDueDate = ref('')

// 详情弹窗
const detailModal = reactive({
  isOpen: false,
  problem: null,
})

// 新建表单
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

// ========== 计算属性 ==========
const pendingProblems = computed(() =>
  allProblems.value.filter(p => getStatusCN(p.status) === '待处理')
)
const dispatchedProblems = computed(() =>
  allProblems.value.filter(p => getStatusCN(p.status) === '处理中' || getStatusCN(p.status) === '待验收')
)
const handledProblems = computed(() =>
  allProblems.value.filter(p => getStatusCN(p.status) === '已处理')
)
const totalCount = computed(() => allProblems.value.length)

const displayStats = computed(() => ({
  total: allProblems.value.length,
  pending: pendingProblems.value.length,
  processing: dispatchedProblems.value.length,
  resolved: handledProblems.value.length,
}))

// 筛选后的问题列表
const filteredProblems = computed(() => {
  let list = []
  switch (statusFilter.value) {
    case 'pending': list = pendingProblems.value; break
    case 'dispatched': list = dispatchedProblems.value; break
    case 'handled': list = handledProblems.value; break
    default: list = allProblems.value
  }
  if (severityFilter.value !== 'all') {
    list = list.filter(p => p.issueSeverity === severityFilter.value)
  }
  if (sourceModuleFilter.value !== 'all') {
    list = list.filter(p => p.sourceModule === sourceModuleFilter.value)
  }
  if (timeFilter.value !== 'all') {
    const now = new Date()
    let startDate = null
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
    }
    if (startDate) {
      list = list.filter(p => new Date(p.checkDate) >= startDate)
    }
  }
  return list
})

// 关联任务（来自externalTasks prop或空列表）
const linkedTasks = computed(() => {
  return (props.externalTasks || []).filter(t => t.sourceProblemId)
})

// ========== 辅助函数 ==========
function getStatusCN(status) { return STATUS_CN_MAP[status] || status }
function getSourceLabel(sourceModule) {
  const map = { inspection: '巡查', manual: '手动', equipment: '设备', infrastructure: '设施' }
  return map[sourceModule] || sourceModule || '未知'
}
function getSourceTypeTag(sourceModule) {
  const map = { inspection: '', manual: 'info', equipment: 'warning', infrastructure: 'info' }
  return map[sourceModule] || 'info'
}
function getSeverityTag(severity) {
  if (severity === '严重') return 'danger'
  if (severity === '中等') return 'warning'
  return 'info'
}
function getProblemStatusTag(status) {
  if (status === '已处理' || status === 'completed') return 'success'
  if (status === '处理中' || status === 'in_progress') return 'warning'
  if (status === '待验收' || status === 'waiting_acceptance') return ''
  return 'info'
}
function getSeverityTextClass(severity) {
  if (severity === '严重') return 'text-red-600 font-semibold'
  if (severity === '中等') return 'text-amber-600 font-semibold'
  return 'text-blue-600 font-semibold'
}
function getPriorityTag(priority) {
  if (priority === 'urgent' || priority === 'high') return 'danger'
  if (priority === 'medium') return 'warning'
  return 'info'
}
function getTaskStatusTag(status) {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'warning'
  if (status === 'pending') return ''
  if (status === 'cancelled') return 'danger'
  return 'info'
}
function getActionLabel(action) {
  const map = { report: '上报问题', dispatch: '分派任务', accept: '接单', reject: '拒绝', submit: '提交反馈', approve: '验收通过', reject_acceptance: '验收返工' }
  return map[action] || action
}
function formatActionTime(time) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 优先级选项
const priorityOptions = [
  { value: 'high', label: '高', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', desc: '需立即处理' },
  { value: 'medium', label: '中', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', desc: '按时处理' },
  { value: 'low', label: '低', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', desc: '可稍后处理' },
]

// 完成时间选项
const completionOptions = [
  { value: 'today', label: '今天', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { value: 'tomorrow', label: '明天', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { value: '3days', label: '3天内', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { value: 'week', label: '本周', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
]

// 反馈选项
const feedbackOptions = FEEDBACK_OPTIONS
const requiredFeedback = ref(['workload_confirm'])

// ========== 操作函数 ==========
function isWorkerSelected(workerId) {
  return selectedWorkers.value.some(w => w.id === workerId)
}

function toggleWorkerSelect(worker, checked) {
  if (checked) {
    selectedWorkers.value.push({ id: worker.id, name: worker.name })
  } else {
    selectedWorkers.value = selectedWorkers.value.filter(w => w.id !== worker.id)
  }
}

function toggleFeedback(key, checked) {
  if (checked) {
    requiredFeedback.value.push(key)
  } else {
    requiredFeedback.value = requiredFeedback.value.filter(f => f !== key)
  }
}

function selectCompletionTime(value) {
  expectedCompletion.value = value
  customDueDate.value = ''
}

function calculateDueDate() {
  const today = new Date()
  switch (expectedCompletion.value) {
    case 'today': return today.toISOString().slice(0, 10)
    case 'tomorrow': { const d = new Date(today); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }
    case '3days': { const d = new Date(today); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10) }
    case 'week': { const d = new Date(today); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) }
    default: { const d = new Date(today); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10) }
  }
}

// 基本信息字段（用于详情弹窗）
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

// ========== 弹窗操作 ==========
function openDispatchModal(problem) {
  dispatchModal.isOpen = true
  dispatchModal.problem = problem
  dispatchModal.batchMode = false
  dispatchAssignMode.value = 'ai_assisted'
  selectedWorkers.value = []
}

function openBatchDispatchModal() {
  dispatchModal.isOpen = true
  dispatchModal.problem = null
  dispatchModal.batchMode = true
  dispatchAssignMode.value = 'manual'
  selectedWorkers.value = []
  selectedProblems.value = pendingProblems.value.map(p => p.id)
}

function handleCloseDispatch() {
  dispatchModal.isOpen = false
  dispatchModal.problem = null
  dispatchModal.batchMode = false
  selectedWorkers.value = []
  dispatchAssignMode.value = 'ai_assisted'
}

async function handleDispatch() {
  if (selectedWorkers.value.length === 0) return
  const dueDate = calculateDueDate()

  if (dispatchModal.batchMode) {
    for (const problemId of selectedProblems.value) {
      const problem = allProblems.value.find(p => p.id === problemId)
      if (problem) {
        const newFlowRecords = [...(problem.flowRecords || []), {
          id: `FR-${Date.now()}`,
          operatorName: '系统管理员',
          action: 'dispatch',
          actionTime: new Date().toISOString(),
        }]
        await problemStore.updateProblem(problem.id, {
          status: 'in_progress',
          handler: selectedWorkers.value.map(w => w.name).join('、'),
          expectedCompletion: dueDate,
          flowRecords: newFlowRecords,
        })
      }
    }
  } else if (dispatchModal.problem) {
    const problem = allProblems.value.find(p => p.id === dispatchModal.problem.id)
    if (problem) {
      const newFlowRecords = [...(problem.flowRecords || []), {
        id: `FR-${Date.now()}`,
        operatorName: '系统管理员',
        action: 'dispatch',
        actionTime: new Date().toISOString(),
      }]
      await problemStore.updateProblem(problem.id, {
        status: 'in_progress',
        handler: selectedWorkers.value.map(w => w.name).join('、'),
        expectedCompletion: dueDate,
        flowRecords: newFlowRecords,
      })
    }
  }

  handleCloseDispatch()
  batchDispatchMode.value = false
  selectedProblems.value = []
  ElMessage.success('分派完成')
  props.onProblemDispatched?.()
  emit('problem-dispatched')
}

function openDetailModal(problem) {
  detailModal.isOpen = true
  detailModal.problem = problem
}

// ========== 批量操作 ==========
function handleTableSelectionChange(rows) {
  selectedRows.value = rows.map(r => r.id)
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

// ========== 新建问题 ==========
function openCreateModal() {
  showCreateModal.value = true
}

function handleCreateClose() {
  showCreateModal.value = false
  Object.assign(createForm, {
    greenhouseId: '', greenhouseName: '', cropName: '',
    inspectorName: '系统管理员', checkDate: new Date().toISOString().slice(0, 10),
    checkTime: new Date().toTimeString().slice(0, 5), issueText: '', issueSeverity: '中等',
  })
}

async function handleCreateSubmit() {
  if (!createForm.greenhouseId || !createForm.cropName || !createForm.issueText) {
    ElMessage.warning('请填写必填项')
    return
  }
  const gh = mockGreenhouses.find(g => g.id === createForm.greenhouseId)
  const newProblem = {
    problemCode: `PD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-3)}`,
    greenhouseId: createForm.greenhouseId,
    greenhouseName: gh?.name || '',
    cropName: createForm.cropName,
    inspectorName: createForm.inspectorName,
    inspectorId: createForm.inspectorId,
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
    flowRecords: JSON.stringify([{
      id: `FR-${Date.now()}`,
      operatorName: createForm.inspectorName,
      action: 'report',
      actionTime: new Date().toISOString(),
    }]),
  }
  await problemStore.createProblem(newProblem)
  handleCreateClose()
  ElMessage.success('问题创建成功')
}

// ========== 删除 ==========
async function handleDeleteConfirm() {
  const idsToDelete = new Set(selectedRows.value)
  await problemStore.deleteProblems([...idsToDelete])
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
  ElMessage.success('删除完成')
}

// ========== 导出 ==========
function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的问题')
    return
  }
  const selectedData = allProblems.value.filter(p => selectedRows.value.includes(p.id))
  const headers = ['问题编号', '温室', '作物', '问题描述', '严重程度', '状态', '处理人', '巡查日期']
  let content = ''
  let filename = `问题分派_${new Date().toISOString().slice(0, 10)}`

  if (exportFormatModel.value === 'csv') {
    content = headers.join(',') + '\n' + selectedData.map(row =>
      headers.map(h => `"${({ '问题编号': row.id, '温室': row.greenhouseName, '作物': row.cropName, '问题描述': row.issueText, '严重程度': row.issueSeverity, '状态': row.status, '处理人': row.handler || '-', '巡查日期': row.checkDate })[h] || ''}"`).join(',')
    ).join('\n')
    downloadFile(content, filename + '.csv', 'text/csv')
  } else if (exportFormatModel.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${selectedData.map(row => `<tr>${headers.map(h => `<td>${({ '问题编号': row.id, '温室': row.greenhouseName, '作物': row.cropName, '问题描述': row.issueText, '严重程度': row.issueSeverity, '状态': row.status, '处理人': row.handler || '-', '巡查日期': row.checkDate })[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    downloadFile(content, filename + '.xls', 'application/vnd.ms-excel')
  } else {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${selectedData.map(row => `<tr>${headers.map(h => `<td>${({ '问题编号': row.id, '温室': row.greenhouseName, '作物': row.cropName, '问题描述': row.issueText, '严重程度': row.issueSeverity, '状态': row.status, '处理人': row.handler || '-', '巡查日期': row.checkDate })[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
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

// ========== 初始化 ==========
onMounted(() => {
  problemStore.fetchProblems()
})
</script>

<style scoped>
/* 弹窗头部覆盖样式 */
:deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}
</style>
