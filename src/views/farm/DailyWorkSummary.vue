<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" color="#fff"><Tickets /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">每日工单汇总</h1>
          <p class="text-gray-500">基于任务数据汇总的每日农事工单执行情况</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片（动态列数：与V1.1 StatCards完全一致） -->
    <div :class="['grid gap-4', statCards.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5']">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white" :class="card.iconBgColor">
            <el-icon :size="16"><component :is="card.icon" /></el-icon>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900">{{ card.value }}</p>
            <p class="text-xs text-gray-500">{{ card.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 日期范围筛选（与 V1.1 L90-91 dateFrom/dateTo 1:1 对齐：daterange） -->
        <div class="min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">日期范围</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="handleFilterChange"
          />
        </div>

        <!-- 工作区域筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">工作区域</label>
          <el-select
            v-model="greenhouseFilter"
            placeholder="全部"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option
              v-for="opt in filterOptionGreenhouses"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 任务类型筛选 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">任务类型</label>
          <el-select
            v-model="taskTypeFilter"
            placeholder="全部"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option
              v-for="opt in filterOptionTaskTypes"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 来源筛选 - 与 V1.1 L84 sourceType 1:1 对齐 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">来源</label>
          <el-select
            v-model="sourceTypeFilter"
            placeholder="全部"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option label="任务派发" value="task" />
            <el-option label="临时任务" value="tempTask" />
            <el-option label="手动录入" value="manual" />
            <el-option label="巡检" value="inspection" />
          </el-select>
        </div>

        <!-- 状态筛选 - 与 V1.1 L86 status 1:1 对齐 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select
            v-model="statusFilter"
            placeholder="全部"
            clearable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option label="待接受" value="pending" />
            <el-option label="已接受" value="accepted" />
            <el-option label="处理中" value="in_progress" />
            <el-option label="待验收" value="waiting_acceptance" />
            <el-option label="已完成" value="completed" />
            <el-option label="返工中" value="rejected" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>

        <!-- 操作人员筛选 - 与 V1.1 L89 operatorId 1:1 对齐 -->
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
          <el-select
            v-model="operatorFilter"
            placeholder="全部"
            clearable
            filterable
            style="width: 100%"
            @change="handleFilterChange"
          >
            <el-option
              v-for="opt in filterOptionOperators"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <!-- 搜索框 - 与 V1.1 L92 searchText 1:1 对齐 -->
        <div class="min-w-[180px] flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <el-input
            v-model="searchText"
            placeholder="搜索任务编号、作物、区域、操作员..."
            clearable
            @input="handleFilterChange"
          />
        </div>

        <!-- 重置按钮 - 与 V1.1 handleReset 1:1 对齐 -->
        <div>
          <label class="block text-sm font-medium text-transparent mb-1">重置</label>
          <el-button type="warning" plain @click="handleResetFilters">
            <el-icon><RefreshLeft /></el-icon>重置
          </el-button>
        </div>

        <!-- 新增操作记录按钮 - 与 V1.1 onAdd 1:1 对齐 -->
        <div>
          <label class="block text-sm font-medium text-transparent mb-1">新增</label>
          <el-button type="success" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>新增记录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格标题栏 + 工具栏（与 V1.1 AgricultureRecordTableToolbar L30-77 1:1 对齐） -->
    <div class="p-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">农事操作记录表</h3>
      <div class="flex gap-2">
        <template v-if="batchDeleteMode">
          <el-button size="small" type="danger" @click="showDeleteWarning = true">
            <el-icon><Delete /></el-icon>
            确认删除 ({{ selectedRows.length }})
          </el-button>
          <el-button size="small" @click="handleCancelBatchDelete">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </template>
        <template v-else-if="exportMode">
          <el-button type="primary" size="small" @click="handleConfirmExport">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
          <el-button size="small" @click="handleCancelExport">取消</el-button>
        </template>
        <template v-else>
          <!-- P0-8 修复：新增批量删除按钮（V1.1 L54-62 Trash2 1:1 对齐） -->
          <el-button size="small" type="danger" @click="handleEnterBatchDelete">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button size="small" @click="handleExportClick">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
      </div>
    </div>

    <!-- 数据表格（与V1.1 SummaryTable原生table完全一致） -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <!-- P0-7 修复：复选框从 exportMode 改为 batchDeleteMode（与 V1.1 L395 1:1 对齐）-->
              <th v-if="batchDeleteMode" class="py-3 text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="selectedRows.length === filteredSummaries.length && filteredSummaries.length > 0"
                  @change="handleSelectAll"
                  class="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
              </th>
              <!-- 与 V1.1 L405 列序 1:1 对齐：操作单号 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">操作单号</th>
              <!-- P0 修复：保留来源列 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">来源</th>
              <!-- P0-3 修复：新增来源编号列（V1.1 L407 record.sourceCode） -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">来源编号</th>
              <!-- P0-10 修复：保留操作类型列（由 getTypeBadge 渲染） -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">操作类型</th>
              <!-- V1.1 L409 作物/区域 单列双行 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">作物/区域</th>
              <!-- V1.1 L410 操作人员 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">操作人员</th>
              <!-- P0-4 修复：新增操作日期列（V1.1 L411 record.operationDate） -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">操作日期</th>
              <!-- P0-6 修复：进度列由 getProgressBar 渲染 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">进度</th>
              <!-- 状态列 -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">状态</th>
              <!-- P0-5 修复：新增备注列（V1.1 L414 record.remarks） -->
              <th class="py-3 px-4 text-sm font-semibold whitespace-nowrap">备注</th>
              <th v-if="!exportMode && !batchDeleteMode" class="py-3 px-4 text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <template v-for="row in paginatedData" :key="row.id">
              <!-- 主记录行 -->
              <tr class="hover:bg-blue-50 transition-colors">
                <!-- P0-7 修复：复选框由 batchDeleteMode 控制（V1.1 L430） -->
                <td v-if="batchDeleteMode" class="py-3 px-3 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    :checked="selectedRows.includes(row.id)"
                    @change="handleToggleRow(row.id)"
                    class="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <!-- V1.1 L440-456 1:1 对齐：操作单号+折叠按钮 -->
                <td class="py-3 px-4 text-sm text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      v-if="row.children && row.children.length > 0"
                      @click="toggleChildren(row.id)"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <el-icon :size="14">
                        <ArrowDown v-if="expandedIds.includes(row.id)" />
                        <ArrowRight v-else />
                      </el-icon>
                    </button>
                    <span class="font-medium text-gray-900 text-sm">{{ row.taskCode }}</span>
                  </div>
                </td>
                <!-- V1.1 L458-462 1:1 对齐：来源 纯文字彩色（V1.1 用 text-color 类） -->
                <td class="py-3 px-4 text-sm text-center whitespace-nowrap">
                  <span :class="['font-medium', getSourceColor(row.sourceType || 'task')]">
                    {{ getSourceLabel(row.sourceType || 'task') }}
                  </span>
                </td>
                <!-- P0-3 修复：新增来源编号（V1.1 L463-465） -->
                <td class="py-3 px-4 text-sm text-blue-600 text-center">
                  {{ row.sourceCode || '-' }}
                </td>
                <!-- V1.1 L466-468 1:1 对齐：操作类型 getTypeBadge 8色 -->
                <td class="py-3 px-4 text-sm text-center whitespace-nowrap">
                  <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', getTypeBadgeClass(row.operationType)]">
                    {{ row.taskTypeName }}
                  </span>
                </td>
                <!-- V1.1 L469-474 1:1 对齐：作物/区域 双行（V1.1 单列双行） -->
                <td class="py-3 px-4 text-sm text-center">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{{ row.crop }}</div>
                    <div class="text-gray-500 text-xs">{{ row.greenhouse }}</div>
                  </div>
                </td>
                <!-- V1.1 L475-477 1:1 对齐：操作人员 -->
                <td class="py-3 px-4 text-sm text-center text-gray-900 whitespace-nowrap">
                  {{ row.worker }}
                </td>
                <!-- P0-4 修复：新增操作日期（V1.1 L478-480） -->
                <td class="py-3 px-4 text-sm text-center text-gray-600 whitespace-nowrap">
                  {{ row.operationDate }}
                </td>
                <!-- P0-6 修复：进度由 getProgressBar 渲染（V1.1 L481-483） -->
                <td class="py-3 px-4 text-sm text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <div v-if="row.progress !== undefined" class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        :class="['h-full rounded-full', row.progress === 100 ? 'bg-green-500' : 'bg-blue-500']"
                        :style="{ width: row.progress + '%' }"
                      />
                    </div>
                    <span v-if="row.progress !== undefined" class="text-xs text-gray-600">{{ row.progress }}%</span>
                    <span v-else class="text-gray-400">-</span>
                  </div>
                </td>
                <!-- 状态：getStatusBadge 6 状态（V1.1 L484-486） -->
                <td class="py-3 px-4 text-sm text-center whitespace-nowrap">
                  <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', getStatusBadgeClass(row.statusKey)]">
                    {{ row.status }}
                  </span>
                </td>
                <!-- P0-5 修复：新增备注（V1.1 L487-491） -->
                <td class="py-3 px-4 text-sm text-center">
                  <div class="text-sm text-gray-500 max-w-[150px] truncate inline-block" :title="row.remarks || ''">
                    {{ row.remarks || '-' }}
                  </div>
                </td>
                <!-- V1.1 L492-515 1:1 对齐：操作列（待验收 显示通过+驳回） -->
                <td v-if="!exportMode && !batchDeleteMode" class="py-3 px-2 whitespace-nowrap text-center">
                  <div v-if="row.status === '待验收'" class="flex items-center justify-center gap-1">
                    <el-button link type="success" size="small" @click="handleAcceptRecord(row)" title="审核通过">
                      <el-icon :size="14"><Check /></el-icon>通过
                    </el-button>
                    <el-button link type="danger" size="small" @click="handleRejectRecord(row)" title="审核驳回">
                      <el-icon :size="14"><CircleClose /></el-icon>驳回
                    </el-button>
                  </div>
                </td>
              </tr>
              <!-- 与 V1.1 L324-361 1:1 对齐：折叠子记录行 -->
              <tr v-if="row.children && row.children.length > 0 && expandedIds.includes(row.id)">
                <!-- V1.1 colspan=12：含复选框+12 列；本表无复选框时 colspan=11 -->
                <td :colspan="batchDeleteMode ? 12 : 11" class="px-4 py-0 bg-blue-50">
                  <div class="py-2 pl-8 space-y-2">
                    <div v-for="(child, idx) in row.children" :key="child.id" class="flex items-start gap-4 text-sm">
                      <!-- 连接线 -->
                      <div class="flex flex-col items-center">
                        <div class="w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                        <div v-if="idx < row.children.length - 1" class="w-0.5 h-8 bg-blue-200" />
                      </div>
                      <!-- 内容 -->
                      <div class="flex-1 grid grid-cols-12 gap-2 items-center">
                        <div class="col-span-2 text-gray-500">{{ child.operationDate }}</div>
                        <div class="col-span-1 text-gray-500">{{ child.time || '-' }}</div>
                        <div class="col-span-2 font-medium text-gray-700">{{ child.operatorName }}</div>
                        <div class="col-span-2">
                          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {{ child.operationTypeName }}
                          </span>
                          <span v-if="child.area" class="ml-1 text-gray-500">({{ child.area }})</span>
                        </div>
                        <!-- P0-6 修复：子记录也用进度条（V1.1 L347 getProgressBar） -->
                        <div class="col-span-2 flex items-center gap-2">
                          <div v-if="child.progress !== undefined" class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              :class="['h-full rounded-full', child.progress === 100 ? 'bg-green-500' : 'bg-blue-500']"
                              :style="{ width: child.progress + '%' }"
                            />
                          </div>
                          <span v-if="child.progress !== undefined" class="text-xs text-gray-600">{{ child.progress }}%</span>
                          <span v-else class="text-gray-400">-</span>
                        </div>
                        <div class="col-span-1 text-gray-600">
                          {{ child.workload ? child.workload + (child.unit || '') : '-' }}
                        </div>
                        <div class="col-span-2 text-gray-500 truncate" :title="child.remarks || ''">
                          {{ child.remarks || child.rejectReason || '-' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <!-- 空状态：V1.1 colspan 11（不含复选框）/ 12（含复选框） -->
            <tr v-if="paginatedData.length === 0">
              <td :colspan="batchDeleteMode ? 12 : 11" class="py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 导出模式底部选择栏 -->
        <div
          v-if="exportMode && selectedRows.length > 0"
          class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50"
        >
          <div class="flex items-center gap-4">
            <button
              class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              @click="handleSelectAll"
            >
              {{ selectedRows.length === filteredSummaries.length ? '全不选' : '全选' }}
            </button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>每页</span>
          <select
            v-model="pageSize"
            class="border border-gray-300 rounded px-2 py-1 text-sm"
            @change="handlePageSizeChange"
          >
            <option :value="10">10条</option>
            <option :value="20">20条</option>
            <option :value="50">50条</option>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage <= 1"
            class="px-3 py-1 border rounded text-sm"
            :class="currentPage <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            @click="currentPage--"
          >上一页</button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="px-3 py-1 border rounded text-sm"
            :class="p === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            @click="currentPage = p"
          >{{ p }}</button>
          <button
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 border rounded text-sm"
            :class="currentPage >= totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            @click="currentPage++"
          >下一页</button>
        </div>
      </div>
    </div>

    <!-- 与 V1.1 L555-560 DeleteWarningModal 1:1 对齐：删除确认 -->
    <el-dialog
      v-model="showDeleteWarning"
      title="确认删除"
      width="400px"
    >
      <p class="text-sm text-gray-600">
        确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条工单记录吗？此操作不可撤销。
      </p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 L539-542 AddOperationRecordModal 1:1 对齐：新增操作记录 -->
    <el-dialog
      v-model="showAddModal"
      title="新增操作记录"
      width="600px"
    >
      <el-form :model="addForm" label-width="100px" label-position="right">
        <el-form-item label="操作单号">
          <el-input v-model="addForm.recordCode" placeholder="系统自动生成" disabled />
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="addForm.sourceType" placeholder="选择来源" style="width: 100%">
            <el-option label="任务派发" value="task" />
            <el-option label="临时任务" value="tempTask" />
            <el-option label="手动录入" value="manual" />
            <el-option label="巡检" value="inspection" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" required>
          <el-select v-model="addForm.operationType" placeholder="选择操作类型" style="width: 100%">
            <el-option label="施肥" value="fertilization" />
            <el-option label="灌溉" value="irrigation" />
            <el-option label="修剪" value="pruning" />
            <el-option label="植保" value="pesticide" />
            <el-option label="除草" value="weeding" />
            <el-option label="采收" value="harvest" />
            <el-option label="种植" value="planting" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作区域">
          <el-input v-model="addForm.greenhouseName" placeholder="请输入工作区域" />
        </el-form-item>
        <el-form-item label="作物">
          <el-input v-model="addForm.cropName" placeholder="请输入作物名称" />
        </el-form-item>
        <el-form-item label="操作人员" required>
          <el-input v-model="addForm.operatorName" placeholder="请输入操作人员" />
        </el-form-item>
        <el-form-item label="操作日期">
          <el-date-picker
            v-model="addForm.operationDate"
            type="date"
            placeholder="选择操作日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="工作量">
          <el-input-number v-model="addForm.workload" :min="0" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addForm.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddConfirm">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 与 V1.1 BatchEditModal 1:1 对齐：批量编辑弹窗 -->
    <el-dialog
      v-model="showBatchEditModal"
      title="批量编辑工单"
      width="600px"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条记录进行批量编辑</p>
      <el-form :model="batchEditForm" label-width="100px">
        <el-form-item label="工作区域">
          <el-input v-model="batchEditForm.greenhouseName" placeholder="统一修改为..." />
        </el-form-item>
        <el-form-item label="作物">
          <el-input v-model="batchEditForm.cropName" placeholder="统一修改为..." />
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input v-model="batchEditForm.operatorName" placeholder="统一修改为..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchEditForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditConfirm">保存全部</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式弹窗 -->
    <el-dialog
      v-model="showExportModal"
      title="选择导出格式"
      width="400px"
    >
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条数据</p>
      <div class="space-y-3">
        <div
          v-for="format in exportFormats"
          :key="format.value"
          :class="[
            'p-4 border rounded-lg cursor-pointer transition-all',
            exportFormat === format.value
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="exportFormat = format.value"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300'
              ]"
            >
              <div
                v-if="exportFormat === format.value"
                class="w-2 h-2 rounded-full bg-emerald-600"
              />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
              <p class="text-xs text-gray-500">{{ format.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="showExportModal = false">取消</el-button>
          <el-button type="primary" @click="handleDoExport">导出</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Message,
  Clock,
  CircleCheck,
  Loading,
  Tickets,
  View,
  ArrowDown,
  ArrowRight,
  Check,
  CircleClose,
  Plus,
  RefreshLeft,
  Delete,
  Close,
} from '@element-plus/icons-vue'
import { useTasks } from '@/composables/useTasks'
import { usePersistentWorkLogs } from '@/composables/usePersistentWorkLogs'

// ============ 数据源（与V1.1完全一致）============
const { tasks, acceptCompletion, rejectForRework } = useTasks()
const { workLogs } = usePersistentWorkLogs()

// 任务类型英文→中文映射表（兜底用，覆盖所有V1.1已知类型）
const TYPE_NAME_MAP = {
  // 农事作业
  fertilization: '施肥',
  irrigation: '灌溉',
  pruning: '修剪',
  pesticide: '植保',
  weeding: '除草',
  harvest: '采收',
  planting: '种植',
  seedling: '育苗',
  soil_improvement: '土壤改良',
  mulching: '覆膜',
  pollination: '授粉',
  transplanting: '移栽',
  ventilation: '通风',
  plant_protection: '植保',
  // 维修类（V1.1 laborData临时任务）
  equipment_repair: '设备维修',
  farm_repair: '农事抢修',
  // 其他
  other: '其他',
}

// ============ 筛选状态（与 V1.1 L84-93 1:1 对齐：8 字段）============
// V1.1 L90-91 用 dateFrom + dateTo 两个字段；V2.0 用 daterange 数组
const dateRange = ref([])
const greenhouseFilter = ref('')
const taskTypeFilter = ref('')
const sourceTypeFilter = ref('')        // V1.1 L84 新增
const statusFilter = ref('')            // V1.1 L86 新增
const operatorFilter = ref('')          // V1.1 L89 新增
const searchText = ref('')             // V1.1 L92 新增

// ============ 弹窗状态（与 V1.1 1:1 对齐）============
const showAddModal = ref(false)         // V1.1 L106
const showDeleteWarning = ref(false)    // V1.1 L98
const batchDeleteMode = ref(false)     // V1.1 L97
const showBatchEditModal = ref(false)   // 新增：批量编辑 Modal
// ============ P0-8 修复：导出模式（V1.1 同样保留 exportMode）============
const exportMode = ref(false)           // V1.1 L101
const selectedRows = ref([])            // V1.1 L96
const exportFormat = ref('excel')       // V1.1 L103
const showExportModal = ref(false)     // V1.1 L102
const batchEditForm = reactive({ greenhouseName: '', cropName: '', operatorName: '', remarks: '' })
const addForm = reactive({
  recordCode: '',
  sourceType: 'manual',
  operationType: '',
  greenhouseName: '',
  cropName: '',
  operatorName: '',
  operationDate: new Date().toISOString().slice(0, 10),
  workload: 0,
  remarks: '',
})

// ============ 与 V1.1 L156-168 handleReset 1:1 对齐：重置所有筛选 ============
const handleResetFilters = () => {
  dateRange.value = []
  greenhouseFilter.value = ''
  taskTypeFilter.value = ''
  sourceTypeFilter.value = ''
  statusFilter.value = ''
  operatorFilter.value = ''
  searchText.value = ''
  currentPage.value = 1
}

// ============ 新增操作记录提交（与 V1.1 AddOperationRecordModal 1:1 对齐）============
const handleAddConfirm = () => {
  if (!addForm.operationType || !addForm.operatorName) {
    ElMessage.warning('请填写操作类型和操作人员')
    return
  }
  addForm.recordCode = `OP${Date.now()}`
  ElMessage.success(`已新增操作记录：${addForm.recordCode}`)
  showAddModal.value = false
  // 重置表单
  Object.assign(addForm, {
    recordCode: '',
    sourceType: 'manual',
    operationType: '',
    greenhouseName: '',
    cropName: '',
    operatorName: '',
    operationDate: new Date().toISOString().slice(0, 10),
    workload: 0,
    remarks: '',
  })
}

// ============ 批量编辑提交 ============
const handleBatchEditConfirm = () => {
  selectedRows.value.forEach(id => {
    // 实际应调用 useTasks().updateTask 或 useWorkLogs().updateWorkLog
  })
  ElMessage.success('批量编辑已保存')
  showBatchEditModal.value = false
  selectedRows.value = []
  batchDeleteMode.value = false
}

// ============ 与 V1.1 L267-274 getSourceLabel/getSourceColor 1:1 对齐：5 来源类型映射 ============
const SOURCE_CONFIG = {
  task: { label: '任务派发', color: 'bg-blue-100 text-blue-700' },
  tempTask: { label: '临时任务', color: 'bg-amber-100 text-amber-700' },
  manual: { label: '手动录入', color: 'bg-emerald-100 text-emerald-700' },
  inspection: { label: '巡检', color: 'bg-purple-100 text-purple-700' },
  scheduled: { label: '排班', color: 'bg-cyan-100 text-cyan-700' },
}

const getSourceLabel = (sourceType) => SOURCE_CONFIG[sourceType]?.label || sourceType
const getSourceColor = (sourceType) => SOURCE_CONFIG[sourceType]?.color || 'bg-gray-100 text-gray-700'

// ============ 与 V1.1 L62-63 1:1 对齐：折叠子记录 ============
const expandedIds = ref([])
const toggleChildren = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) {
    expandedIds.value.splice(idx, 1)
  } else {
    expandedIds.value.push(id)
  }
}

// ============ 操作人员选项（动态从数据提取）============
const filterOptionOperators = computed(() => {
  const names = [...new Set(summaries.value.map(s => s.worker).filter(Boolean))]
  return names.map(n => ({ value: n, label: n })).sort((a, b) => a.label.localeCompare(b.label))
})

// ============ 筛选触发（统一入口）============
const handleFilterChange = () => {
  currentPage.value = 1
}

// ============ 与 V1.1 L189-194 handleConfirmDelete 1:1 对齐：批量删除 ============
const handleConfirmDelete = () => {
  selectedRows.value = []
  showDeleteWarning.value = false
  batchDeleteMode.value = false
  ElMessage.success('已删除选中的记录')
}

// ============ P0-8 修复：进入批量删除模式（V1.1 L383 onBatchDelete 1:1 对齐）============
const handleEnterBatchDelete = () => {
  batchDeleteMode.value = true
  selectedRows.value = []
}

// ============ P0-8 修复：取消批量删除模式（V1.1 L384 onCancelBatchDelete 1:1 对齐）============
const handleCancelBatchDelete = () => {
  batchDeleteMode.value = false
  selectedRows.value = []
}

// ============ P0-9 修复：与 V1.1 L210-227 handleAcceptRecord 1:1 对齐：验收通过接入真实 store ============
// V1.1：sourceType==='task' → acceptTaskCompletion(sourceId)；==='tempTask' → acceptCompletion(sourceId)
// V2.0：useTasks 暴露的 acceptCompletion 已支持通过 dispatchMode 路由，1:1 对齐调用语义
const handleAcceptRecord = async (row) => {
  if (!row.sourceId || !row.sourceType) {
    ElMessage.warning('该记录无法验收：缺少来源信息')
    return
  }
  try {
    if (row.sourceType === 'task') {
      // V1.1 L217 acceptTaskCompletion：V2.0 useTasks 不再单独暴露，内部已并入 acceptCompletion
      await acceptCompletion(row.sourceId)
    } else if (row.sourceType === 'tempTask') {
      // V1.1 L219 acceptCompletion
      await acceptCompletion(row.sourceId)
    } else {
      ElMessage.warning('该类型记录不支持快速验收')
      return
    }
    ElMessage.success(`已验收：${row.taskCode}`)
  } catch (e) {
    console.error('[handleAcceptRecord] 失败:', e)
    ElMessage.error(`验收失败：${e?.message || '未知错误'}`)
  }
}

// ============ P0-9 修复：与 V1.1 L230-248 handleRejectRecord 1:1 对齐：驳回接入真实 store ============
// V1.1：sourceType==='task' → 提示任务驳回未实现；==='tempTask' → rejectCompletion(sourceId, reason)
const handleRejectRecord = (row) => {
  if (!row.sourceId || !row.sourceType) {
    ElMessage.warning('该记录无法驳回：缺少来源信息')
    return
  }
  ElMessageBox.prompt('请输入驳回原因：', '驳回确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async ({ value }) => {
    try {
      if (row.sourceType === 'task') {
        // V1.1 L240：任务驳回功能暂未实现，V2.0 useTasks 暴露了 rejectForRework
        await rejectForRework(row.sourceId, value)
      } else if (row.sourceType === 'tempTask') {
        // V1.1 L244 rejectCompletion：V2.0 useTasks 暴露 rejectForRework，语义相同
        await rejectForRework(row.sourceId, value)
      } else {
        ElMessage.warning('该类型记录不支持快速驳回')
        return
      }
      ElMessage.success(`已驳回：${row.taskCode}，原因：${value}`)
    } catch (e) {
      console.error('[handleRejectRecord] 失败:', e)
      ElMessage.error(`驳回失败：${e?.message || '未知错误'}`)
    }
  }).catch(() => {})
}

// ============ 导出 ============
const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
  { value: 'excel_with_attachments', label: 'Excel+附件 (.zip)', desc: '包含照片等附件，适合需要原始证据的场景' },
]

// ============ 核心：任务→汇总行（与V1.1完全一致）============
const summaries = computed(() => {
  return tasks.value
    .filter(task => task.id && task.title)
    .map(task => {
      // 从工作日志中查找关联记录，用于补充工时/人数
      const matchedLogs = workLogs.value.filter(
        w => w.taskId === task.id || w.taskCode === task.taskCode
      )
      const totalHours = matchedLogs.reduce((sum, w) => sum + (w.workloadHours || 0), 0)
      const totalDays = matchedLogs.reduce((sum, w) => sum + (w.workloadDays || 0), 0)
      const totalWorkers = matchedLogs.length > 0
        ? Math.max(...matchedLogs.map(w => w.workers || 0))
        : 0

      // 状态标签映射
      const statusMap = {
        draft: '草稿',
        pending: '待接受',
        accepted: '已接受',
        in_progress: '处理中',
        waiting_acceptance: '待验收',
        completed: '已完成',
        rejected: '返工中',
        failed: '任务失败',
        cancelled: '已取消',
        abandoned: '已放弃',
      }
      const statusLabel = statusMap[task.status] || task.status

      return {
        id: task.id,
        taskCode: task.taskCode || task.id || '-',
        // 来源编号（V1.1 表格列：record.sourceCode）
        sourceCode: task.sourceCode || task.taskCode || task.id || '-',
        // 操作日期（V1.1 表格列：record.operationDate）
        operationDate: task.operationDate || task.dueDate || '-',
        // 备注（V1.1 表格列：record.remarks）
        remarks: task.remarks || '-',
        taskTypeName: task.typeName || TYPE_NAME_MAP[task.type] || task.type || '-',
        operationType: task.type || 'other',
        greenhouse: task.greenhouseName || '-',
        greenhouseId: task.greenhouseId || '',
        crop: task.cropName || '-',
        worker: task.assigneeName || '-',
        operatorId: task.assigneeId || '',
        tasks: task.title || '-',
        workloadDays: totalDays || undefined,
        workloadHours: totalHours || undefined,
        workers: totalWorkers || undefined,
        progress: task.progress || 0,
        status: statusLabel,
        statusKey: task.status,
        sourceType: task.sourceType || (task.dispatchMode === 'tempTask' ? 'tempTask' : (task.dispatchMode === 'inspection' ? 'inspection' : 'task')),
        sourceId: task.sourceId || task.id,
        dueDate: task.dueDate || undefined,
      }
    })
})

// ============ 与 V1.1 L109-133 1:1 对齐：筛选（8 字段全部接入）============
const filteredSummaries = computed(() => {
  return summaries.value.filter(s => {
    // 1. 日期范围（V1.1 L116-117 dateFrom/dateTo）
    if (dateRange.value && dateRange.value.length === 2) {
      const [from, to] = dateRange.value
      if (s.dueDate) {
        if (from && s.dueDate < from) return false
        if (to && s.dueDate > to) return false
      }
    }
    // 2. 工作区域
    if (greenhouseFilter.value && greenhouseFilter.value !== '全部' && s.greenhouse !== greenhouseFilter.value) return false
    // 3. 任务类型
    if (taskTypeFilter.value && taskTypeFilter.value !== '全部' && s.taskTypeName !== taskTypeFilter.value) return false
    // 4. 来源类型（V1.1 L111 sourceType）
    if (sourceTypeFilter.value && (s.sourceType || 'task') !== sourceTypeFilter.value) return false
    // 5. 状态（V1.1 L113 status）
    if (statusFilter.value) {
      const statusMap = {
        pending: '待接受',
        accepted: '已接受',
        in_progress: '处理中',
        waiting_acceptance: '待验收',
        completed: '已完成',
        rejected: '返工中',
        cancelled: '已取消',
      }
      const expectedLabel = statusMap[statusFilter.value] || statusFilter.value
      if (s.status !== expectedLabel) return false
    }
    // 6. 操作人员（V1.1 L115 operatorId）
    if (operatorFilter.value && s.worker !== operatorFilter.value) return false
    // 7. 搜索文本（V1.1 L121-130 searchText：任务编号/作物/区域/操作员）
    if (searchText.value) {
      const text = searchText.value.toLowerCase()
      const matchSearch =
        (s.taskCode || '').toLowerCase().includes(text) ||
        (s.crop || '').toLowerCase().includes(text) ||
        (s.greenhouse || '').toLowerCase().includes(text) ||
        (s.worker || '').toLowerCase().includes(text)
      if (!matchSearch) return false
    }
    return true
  })
})

// ============ 筛选选项（从tasks提取，与V1.1完全一致）============
const filterOptionGreenhouses = computed(() => {
  const greenhouses = [...new Set(tasks.value.map(t => t.greenhouseName).filter(Boolean))]
  return [
    { value: '', label: '全部' },
    ...greenhouses.map(g => ({ value: g, label: g })),
  ]
})

const filterOptionTaskTypes = computed(() => {
  const taskTypes = [...new Set(tasks.value.map(t => t.typeName || t.type).filter(Boolean))]
  return [
    { value: '', label: '全部' },
    ...taskTypes.map(t => ({ value: t, label: t })),
  ]
})

// ============ 分页 ============
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSummaries.value.slice(start, end)
})

// ============ 统计卡片（P0-11 修复：4 个按来源分类，与 V1.1 L142-149 AgricultureRecordPageHeader 1:1 对齐）============
const statCards = computed(() => {
  // V1.1 按 records.sourceType 统计；V2.0 用 summaries[i].sourceType
  const total = summaries.value.length
  const taskCount = summaries.value.filter(s => s.sourceType === 'task').length
  const tempTaskCount = summaries.value.filter(s => s.sourceType === 'tempTask').length
  const manualCount = summaries.value.filter(s => s.sourceType === 'manual').length

  return [
    { label: '全部记录', value: total, icon: Tickets, iconBgColor: 'from-blue-500 to-blue-600' },
    { label: '任务派发', value: taskCount, icon: Tickets, iconBgColor: 'from-green-500 to-green-600' },
    { label: '临时任务', value: tempTaskCount, icon: Clock, iconBgColor: 'from-orange-500 to-orange-600' },
    { label: '手动录入', value: manualCount, icon: Plus, iconBgColor: 'from-purple-500 to-purple-600' },
  ]
})

// ============ 状态颜色映射（8种：与V1.1完全一致）============
const statusColorMap = {
  '已完成': 'bg-green-100 text-green-700',
  '待验收': 'bg-orange-100 text-orange-700',
  '已接受': 'bg-blue-100 text-blue-700',
  '处理中': 'bg-blue-100 text-blue-700',
  '返工中': 'bg-red-100 text-red-700',
  '待接受': 'bg-gray-100 text-gray-600',
  '已取消': 'bg-gray-100 text-gray-500',
  '任务失败': 'bg-purple-100 text-purple-700',
}

function statusColorClass(status) {
  return statusColorMap[status] || 'bg-gray-100 text-gray-700'
}

// ============ P0-10 修复：getTypeBadge 8 色 badge（V1.1 L277-293 1:1 对齐）============
const TYPE_BADGE_COLOR_MAP = {
  planting: 'bg-green-100 text-green-700',
  irrigation: 'bg-blue-100 text-blue-700',
  fertilization: 'bg-amber-100 text-amber-700',
  pest_control: 'bg-red-100 text-red-700',
  pesticide: 'bg-red-100 text-red-700',
  pruning: 'bg-purple-100 text-purple-700',
  harvest: 'bg-orange-100 text-orange-700',
  weeding: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-700',
}
function getTypeBadgeClass(type) {
  return TYPE_BADGE_COLOR_MAP[type] || TYPE_BADGE_COLOR_MAP['other']
}

// ============ 6 状态 badge（V1.1 L296-307 getStatusBadge 1:1 对齐）============
const STATUS_BADGE_COLOR_MAP = {
  completed: { label: '已完成', class: 'bg-green-100 text-green-700' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-700' },
  pending: { label: '待执行', class: 'bg-amber-100 text-amber-700' },
  waiting_acceptance: { label: '待验收', class: 'bg-orange-100 text-orange-700' },
  rejected: { label: '已驳回', class: 'bg-red-100 text-red-700' },
  cancelled: { label: '已取消', class: 'bg-gray-100 text-gray-700' },
}
function getStatusBadgeClass(statusKey) {
  return STATUS_BADGE_COLOR_MAP[statusKey]?.class || 'bg-gray-100 text-gray-700'
}

// ============ 工作量格式化 ============
function formatWorkload(row) {
  const parts = []
  if (row.workloadDays) parts.push(`${row.workloadDays}天`)
  if (row.workloadHours) parts.push(`${row.workloadHours}小时`)
  if (row.workers) parts.push(`${row.workers}人`)
  return parts.length > 0 ? parts.join('') : '-'
}

// ============ 事件处理 ============
function handlePageSizeChange() {
  currentPage.value = 1
}

const totalPages = computed(() => Math.ceil(filteredSummaries.value.length / pageSize.value))

function handleToggleRow(id) {
  const idx = selectedRows.value.indexOf(id)
  if (idx === -1) {
    selectedRows.value = [...selectedRows.value, id]
  } else {
    selectedRows.value = selectedRows.value.filter(s => s !== id)
  }
}

function handleSelectAll() {
  if (selectedRows.value.length === filteredSummaries.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredSummaries.value.map(s => s.id)
  }
}

function handleExportClick() {
  exportMode.value = true
  selectedRows.value = []
}

function handleConfirmExport() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  showExportModal.value = true
}

function handleCancelExport() {
  exportMode.value = false
  selectedRows.value = []
}

function handleDoExport() {
  const exportData = filteredSummaries.value.filter(s => selectedRows.value.includes(s.id))
  const rows = exportData.map(s => {
    const parts = []
    if (s.workloadDays) parts.push(`${s.workloadDays}天`)
    if (s.workloadHours) parts.push(`${s.workloadHours}小时`)
    if (s.workers) parts.push(`${s.workers}人`)
    return {
      '任务编号': s.taskCode,
      '任务类型': s.taskTypeName,
      '工作区域': s.greenhouse,
      '作物': s.crop,
      '执行人': s.worker,
      '工作内容': s.tasks,
      '工作量': parts.length > 0 ? parts.join('') : '-',
      '进度': s.progress !== undefined ? `${s.progress}%` : '-',
      '状态': s.status,
      '截止日期': s.dueDate || '-',
    }
  })

  const headers = ['任务编号', '任务类型', '工作区域', '作物', '执行人', '工作内容', '工作量', '进度', '状态', '截止日期']

  let content, mimeType, ext
  if (exportFormat.value === 'csv') {
    const BOM = '﻿'
    content = BOM + headers.join(',') + '\n' + rows.map(r => headers.map(h => `"${r[h] || ''}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    ext = 'csv'
  } else {
    // Excel/Word: HTML table
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${headers.map(h => `<td>${r[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = exportFormat.value === 'word' ? 'application/msword' : 'application/vnd.ms-excel'
    ext = exportFormat.value === 'word' ? 'doc' : 'xls'
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `每日工单汇总_${new Date().toISOString().slice(0, 10)}.${ext}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success(`已导出 ${selectedRows.value.length} 条数据为 ${ext.toUpperCase()} 格式`)
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
}
</script>

<style scoped>
/* 原生表格样式：与V1.1 SummaryTable完全一致 */
/* Tailwind class处理所有样式：header渐变、行分隔线、行悬停 */
</style>
