<template>
  <div class="space-y-4 p-6">
    <!-- 页面标题 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
          <el-icon :size="24" class="text-white"><Calendar /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">排班调度</h1>
          <p class="text-gray-500">员工排班管理与调班申请</p>
        </div>
      </div>
    </div>

    <!-- 快捷操作栏 -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <!-- 左侧操作 -->
        <div class="flex items-center gap-2">
          <el-button :type="displayMode === 'calendar' ? 'primary' : ''" size="small" @click="displayMode = 'calendar'">
            <el-icon><Calendar /></el-icon>
            日历视图
          </el-button>
          <el-button :type="displayMode === 'table' ? 'primary' : ''" size="small" @click="displayMode = 'table'">
            <el-icon><List /></el-icon>
            表格视图
          </el-button>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
          <el-button size="small" class="!bg-purple-600 !border-purple-600 !text-white hover:!bg-purple-700" @click="showSwapModal = true">
            <el-icon><User /></el-icon>
            调班申请
          </el-button>
          <el-button size="small" class="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700" @click="showShiftEditor = true">
            <el-icon><Setting /></el-icon>
            班次设置
          </el-button>
          <!-- 表格视图下的批量操作按钮 -->
          <template v-if="displayMode === 'table'">
            <el-button size="small" @click="handleBatchExportClick">
              <el-icon><Download /></el-icon>
              {{ exportMode ? '确认导出' : '批量导出' }}
            </el-button>
            <el-button size="small" @click="handleBatchEditClick">
              <el-icon><Edit /></el-icon>
              {{ batchEditMode ? '确认编辑' : '批量编辑' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleBatchDeleteClick">
              <el-icon><Delete /></el-icon>
              {{ batchDeleteMode ? '确认删除' : '批量删除' }}
            </el-button>
          </template>
          <el-button type="primary" size="small" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>
            新增排班
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-blue-600"><Calendar /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">今日排班</p>
            <p class="text-lg font-bold text-gray-800">{{ store.todayCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-green-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">本周已执行</p>
            <p class="text-lg font-bold text-gray-800">{{ store.executedCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-amber-600"><User /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">待调班申请</p>
            <p class="text-lg font-bold text-gray-800">{{ store.pendingSwapCount }}</p>
          </div>
        </div>
      </div>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <el-icon :size="16" class="text-purple-600"><List /></el-icon>
          </div>
          <div>
            <p class="text-xs text-gray-500">本月排班总数</p>
            <p class="text-lg font-bold text-gray-800">{{ store.monthCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 日历/表格视图 -->
      <div class="col-span-2">
        <!-- 日历视图 - 与 V1.1 ScheduleCalendar.tsx 1:1 对齐：月/周/日 3 视图 + 上下今天导航 -->
        <div v-if="displayMode === 'calendar'" class="space-y-4">
          <!-- 日历工具栏（V1.1 L338-394）：上一天/今天/下一天 + 月/周/日 切换 -->
          <div class="flex items-center justify-between bg-white rounded-lg shadow p-3">
            <div class="flex items-center gap-2">
              <el-button text @click="handleCalendarPrev">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button size="small" type="primary" plain @click="handleCalendarToday">今天</el-button>
              <el-button text @click="handleCalendarNext">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <span class="ml-4 text-lg font-semibold text-gray-800">
                {{ currentYear }}年{{ currentMonth }}月
              </span>
            </div>
            <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <el-button
                :type="viewMode === 'month' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'month'"
              >月</el-button>
              <el-button
                :type="viewMode === 'week' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'week'"
              >周</el-button>
              <el-button
                :type="viewMode === 'day' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'day'"
              >日</el-button>
            </div>
          </div>

          <!-- 月视图（V1.1 renderMonthView L112-183） -->
          <div v-if="viewMode === 'month'" class="bg-white rounded-lg shadow overflow-hidden">
            <el-calendar v-model="calendarDate">
              <template #date-cell="{ data }">
                <div class="relative" @click="handleCalendarDateClick(data.day)">
                  <div :class="['text-center py-1', data.isSelected ? 'bg-blue-500 text-white rounded' : '']">
                    {{ data.day.split('-').slice(2).join('-') }}
                  </div>
                  <div v-if="getScheduleCountForDate(data.day) > 0" class="absolute bottom-0 left-0 right-0 text-center">
                    <span class="text-xs text-blue-600">{{ getScheduleCountForDate(data.day) }}人</span>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>

          <!-- 周视图（V1.1 renderWeekView L186-272）：7 天横排 + 当日排班详情 -->
          <div v-else-if="viewMode === 'week'" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="grid grid-cols-7 bg-gray-50 border-b">
              <div v-for="day in weekDays" :key="day.date"
                :class="['py-3 text-center cursor-pointer transition-colors',
                  selectedDay === day.date ? 'bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-100']"
                @click="selectedDay = day.date">
                <div :class="['text-xs mb-1', selectedDay === day.date ? 'text-white/80' : 'text-gray-500']">{{ day.weekday }}</div>
                <div :class="['text-lg font-medium w-8 h-8 mx-auto flex items-center justify-center rounded-full',
                  isToday(day.date) ? 'bg-red-500 text-white' : selectedDay === day.date ? 'text-white' : 'text-gray-700']">
                  {{ day.day }}
                </div>
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-800 mb-3">{{ formatWeekdayTitle(selectedDay) }}</h3>
              <div v-if="getSchedulesForDate(selectedDay).length === 0" class="text-gray-400 text-center py-8">暂无排班</div>
              <div v-else class="space-y-2">
                <div v-for="schedule in getSchedulesForDate(selectedDay)" :key="schedule.id"
                  @click="handleView(schedule)"
                  :class="['flex items-center justify-between p-3 rounded-lg border cursor-pointer',
                    schedule.status === '已取消' ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50',
                    schedule.status === '已执行' ? 'border-green-200' : 'border-gray-200']">
                  <div class="flex items-center gap-3">
                    <div :class="['w-2 h-2 rounded-full', getShiftColor(schedule.shift)]" />
                    <div>
                      <div class="font-medium text-gray-800">{{ getStaffName(schedule) }}</div>
                      <div class="text-sm text-gray-500">{{ getWorkZone(schedule) }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-700">{{ schedule.shift }}</div>
                    <div class="text-sm text-gray-500">{{ getShiftTime(schedule.shift) }}</div>
                  </div>
                  <span :class="['px-2 py-1 rounded text-xs', getStatusClass(schedule.status)]">
                    {{ schedule.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 日视图（V1.1 renderDayView L275-333）：单日排班卡片 -->
          <div v-else-if="viewMode === 'day'" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="p-4 border-b">
              <h3 class="text-xl font-medium text-gray-800">{{ formatDayTitle(selectedDay) }}</h3>
            </div>
            <div class="p-4">
              <div v-if="getSchedulesForDate(selectedDay).length === 0" class="text-gray-400 text-center py-12">暂无排班</div>
              <div v-else class="space-y-3">
                <div v-for="schedule in getSchedulesForDate(selectedDay)" :key="schedule.id"
                  @click="handleView(schedule)"
                  :class="['p-4 rounded-lg border cursor-pointer',
                    schedule.status === '已取消' ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50',
                    schedule.status === '已执行' ? 'border-green-200' : 'border-gray-200']">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div :class="['w-3 h-3 rounded', getShiftColor(schedule.shift)]" />
                      <span class="font-medium text-gray-800">{{ getStaffName(schedule) }}</span>
                      <span class="text-gray-400">|</span>
                      <span class="text-gray-600">{{ getWorkZone(schedule) }}</span>
                    </div>
                    <span :class="['px-3 py-1 rounded-full text-sm', getStatusClass(schedule.status)]">
                      {{ schedule.status }}
                    </span>
                  </div>
                  <div class="mt-2 flex items-center gap-6 text-sm text-gray-500">
                    <span>班次: {{ schedule.shift }}</span>
                    <span>时间: {{ getShiftTime(schedule.shift) }}</span>
                    <span v-if="schedule.checkIn">签到: {{ schedule.checkIn }}</span>
                    <span v-if="schedule.checkOut">签退: {{ schedule.checkOut }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-else class="bg-white rounded-lg shadow">
          <!-- 表格工具栏：搜索 + 筛选（V1.1 ScheduleTable L260-363 1:1 对齐） -->
          <div class="p-4 space-y-3 border-b">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2 flex-1">
                <el-input
                  v-model="searchTerm"
                  placeholder="搜索员工、区域、日期..."
                  size="small"
                  clearable
                  style="max-width: 320px"
                  @input="pagination.currentPage = 1"
                />
              </div>
              <div class="text-sm text-gray-500">
                共 {{ filteredSchedules.length }} 条记录
              </div>
            </div>
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">日期:</span>
                <el-date-picker
                  v-model="dateRange.start"
                  type="date"
                  size="small"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 140px"
                  @change="pagination.currentPage = 1"
                />
                <span class="text-gray-400">至</span>
                <el-date-picker
                  v-model="dateRange.end"
                  type="date"
                  size="small"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 140px"
                  @change="pagination.currentPage = 1"
                />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">班次:</span>
                <el-select v-model="shiftFilter" size="small" style="width: 120px" @change="pagination.currentPage = 1">
                  <el-option label="全部" value="all" />
                  <el-option v-for="c in store.shiftConfigs" :key="c.name" :label="c.name" :value="c.name" />
                </el-select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">状态:</span>
                <el-select v-model="statusFilter" size="small" style="width: 120px" @change="pagination.currentPage = 1">
                  <el-option label="全部" value="all" />
                  <el-option label="已排班" value="已排班" />
                  <el-option label="已执行" value="已执行" />
                  <el-option label="已取消" value="已取消" />
                </el-select>
              </div>
            </div>
          </div>

          <el-table
            :data="filteredSchedules.slice((pagination.currentPage - 1) * pagination.pageSize, (pagination.currentPage - 1) * pagination.pageSize + pagination.pageSize)"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              v-if="exportMode || batchEditMode || batchDeleteMode"
              type="selection"
              width="50"
            />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="staffName" label="员工" width="100" />
            <el-table-column prop="shift" label="班次" width="100">
              <template #default="{ row }">
                <el-tag :type="getShiftType(row.shift)" size="small">{{ row.shift }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="workZone" label="工作区域" width="120" />
            <el-table-column prop="startTime" label="开始时间" width="100" />
            <el-table-column prop="endTime" label="结束时间" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="checkIn" label="签到时间" width="120" />
            <el-table-column prop="checkOut" label="签退时间" width="120" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
                <el-button link type="danger" size="small" @click="handleCancel(row)" v-if="row.status === '已排班'">取消</el-button>
                <el-button link type="warning" size="small" @click="handleEditSingle(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 批量操作提示栏 -->
          <div v-if="batchEditMode || batchDeleteMode || exportMode" class="bg-white px-4 py-3 border-t flex items-center justify-between">
            <div class="text-sm text-gray-600">
              已选择 <strong class="text-emerald-600">{{ selectedRows.length }}</strong> 项
              <template v-if="batchEditMode">（点击批量编辑进入编辑模式）</template>
              <template v-if="batchDeleteMode">（确认删除选中的记录）</template>
            </div>
            <el-button size="small" @click="handleCancelBatch">取消</el-button>
          </div>

          <!-- 分页 -->
          <div class="flex justify-end p-4">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filteredSchedules.length"
              layout="total, sizes, prev, pager, next"
            />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="space-y-4">
        <!-- 排班详情 -->
        <div v-if="selectedSchedule" class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-gray-800 mb-3">排班详情</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">员工:</span>
              <span class="font-medium text-gray-800">{{ selectedSchedule.staffName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">日期:</span>
              <span class="text-gray-800">{{ selectedSchedule.date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">班次:</span>
              <span class="font-medium text-gray-800">{{ selectedSchedule.shift }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">工作区:</span>
              <span class="text-gray-800">{{ selectedSchedule.workZone }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">状态:</span>
              <span :class="[
                'px-2 py-0.5 rounded text-xs',
                selectedSchedule.status === '已排班' ? 'bg-blue-100 text-blue-700' : '',
                selectedSchedule.status === '已执行' ? 'bg-green-100 text-green-700' : '',
                selectedSchedule.status === '已取消' ? 'bg-gray-100 text-gray-600' : '',
              ]">{{ selectedSchedule.status }}</span>
            </div>
            <div v-if="selectedSchedule.checkIn" class="flex justify-between">
              <span class="text-gray-500">签到:</span>
              <span class="text-green-600">{{ selectedSchedule.checkIn }}</span>
            </div>
            <div v-if="selectedSchedule.checkOut" class="flex justify-between">
              <span class="text-gray-500">签退:</span>
              <span class="text-red-600">{{ selectedSchedule.checkOut }}</span>
            </div>
          </div>
          <el-button
            v-if="selectedSchedule.status === '已排班'"
            size="small"
            class="w-full mt-4 !border-red-200 !text-red-600 hover:!bg-red-50"
            @click="handleCancel(selectedSchedule)"
          >
            取消排班
          </el-button>
        </div>

        <!-- 调班申请列表 -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-gray-800">调班申请</h3>
            <span class="text-xs text-gray-500">{{ store.pendingSwapCount }} 待处理</span>
          </div>
          <div class="space-y-3">
            <div v-for="request in store.swapRequests.slice(0, 5)" :key="request.id" class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-800">{{ request.requesterName }}</span>
                <el-tag :type="getSwapStatusType(request.status)" size="small">{{ request.status }}</el-tag>
              </div>
              <p class="text-xs text-gray-500">{{ request.originalDate }} → {{ request.targetDate }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ request.reason }}</p>
              <div v-if="request.status === '待审批'" class="flex gap-2 mt-2">
                <el-button size="small" type="success" @click="handleSwapApprove(request)">同意</el-button>
                <el-button size="small" type="danger" @click="handleSwapReject(request)">拒绝</el-button>
              </div>
            </div>
            <div v-if="store.swapRequests.length === 0" class="text-center text-gray-400 py-4">
              暂无调班申请
            </div>
          </div>
        </div>

        <!-- 班次图例 -->
        <div class="bg-white rounded-lg shadow p-4">
          <h3 class="font-medium text-gray-800 mb-3">班次图例</h3>
          <div class="space-y-2">
            <div v-for="config in store.shiftConfigs" :key="config.name" class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded', config.color]" />
              <span class="text-sm text-gray-600">{{ config.name }}</span>
              <span class="text-xs text-gray-400 ml-auto">{{ config.startTime }}-{{ config.endTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 新增排班弹窗 -->
    <el-dialog v-model="showAddModal" title="新增排班" width="500px">
      <el-form :model="newSchedule" label-width="80px">
        <el-form-item label="员工">
          <el-select v-model="newSchedule.staffId" placeholder="选择员工" class="w-full">
            <el-option v-for="staff in store.staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="newSchedule.date" type="date" placeholder="选择日期" class="w-full" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="newSchedule.shift" placeholder="选择班次" class="w-full">
            <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作区域">
          <el-input v-model="newSchedule.workZone" placeholder="输入工作区域" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddSchedule">确定</el-button>
      </template>
    </el-dialog>

    <!-- 单条编辑弹窗 -->
    <el-dialog v-model="showEditModal" title="编辑排班" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="班次">
          <el-select v-model="editForm.shift" placeholder="选择班次" class="w-full">
            <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作区域">
          <el-input v-model="editForm.workZone" placeholder="输入工作区域" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="showBatchEditModal" title="批量编辑排班" width="600px">
      <p class="text-sm text-gray-500 mb-4">已选择 {{ selectedRows.length }} 条记录，可逐条编辑</p>
      <div class="space-y-4">
        <div v-for="id in selectedRows" :key="id" class="p-3 bg-gray-50 rounded-lg">
          <template v-for="record in store.schedules.filter(s => s.id === id)" :key="record.id">
            <p class="text-sm font-medium text-gray-800 mb-2">{{ record.staffName }} - {{ record.date }}</p>
            <div class="flex gap-2">
              <el-select v-model="batchEditForms[id].shift" size="small" style="width: 120px">
                <el-option v-for="config in store.shiftConfigs" :key="config.name" :label="config.name" :value="config.name" />
              </el-select>
              <el-input v-model="batchEditForms[id].workZone" size="small" placeholder="工作区域" style="width: 150px" />
            </div>
          </template>
        </div>
      </div>
      <template #footer>
        <el-button @click="showBatchEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchEdit">保存全部</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteWarning" title="确认删除" width="400px">
      <p class="text-sm text-gray-600">确定要删除选中的 <strong class="text-red-600">{{ selectedRows.length }}</strong> 条排班记录吗？此操作不可撤销。</p>
      <template #footer>
        <el-button @click="showDeleteWarning = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- 导出格式选择弹窗 -->
    <el-dialog v-model="showExportModal" title="选择导出格式" width="400px">
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
            <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', exportFormat === format.value ? 'border-emerald-600' : 'border-gray-300']">
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
        <el-button type="primary" @click="handleDoExport">导出</el-button>
      </template>
    </el-dialog>

    <!-- 调班申请弹窗 - 与 V1.1 SwapRequestModal.tsx L75-172 1:1 对齐：6 字段完整表单 + 深度输入框 -->
    <el-dialog v-model="showSwapModal" title="调班申请" width="500px">
      <div class="space-y-4">
        <!-- 申请人（V1.1 L78-94） -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">申请人</label>
          <el-select
            v-model="swapForm.requesterId"
            placeholder="选择申请人"
            class="w-full"
            @change="handleSwapRequesterChange"
          >
            <el-option
              v-for="staff in store.staffList"
              :key="staff.id"
              :label="`${staff.name} - ${staff.workZone || ''}`"
              :value="staff.id"
            />
          </el-select>
        </div>
        <!-- 原排班日期（V1.1 L96-114） -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">原排班日期</label>
          <el-date-picker
            v-model="swapForm.originalDate"
            type="date"
            class="w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择原排班日期"
          />
        </div>
        <!-- 调班对象（V1.1 L116-133）：过滤掉申请人本人 -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">调班对象</label>
          <el-select
            v-model="swapForm.targetId"
            placeholder="选择调班对象"
            class="w-full"
            @change="handleSwapTargetChange"
          >
            <el-option
              v-for="staff in store.staffList.filter(s => s.id !== swapForm.requesterId)"
              :key="staff.id"
              :label="`${staff.name} - ${staff.workZone || ''}`"
              :value="staff.id"
            />
          </el-select>
        </div>
        <!-- 目标日期（V1.1 L135-153） -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">目标日期</label>
          <el-date-picker
            v-model="swapForm.targetDate"
            type="date"
            class="w-full"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择目标日期"
          />
        </div>
        <!-- 调班原因（V1.1 L155-170） -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">调班原因</label>
          <el-input
            v-model="swapForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调班原因..."
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showSwapModal = false">取消</el-button>
        <el-button type="primary" @click="handleSwapSubmit">
          <el-icon><Promotion /></el-icon>提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 班次设置弹窗 - 与 V1.1 ShiftEditor.tsx L52-181 1:1 对齐：颜色 8 色选择 + 编辑模式 -->
    <el-dialog v-model="showShiftEditor" title="班次设置" width="600px">
      <div class="space-y-4">
        <div
          v-for="config in store.shiftConfigs"
          :key="config.name"
          :class="['p-4 rounded-lg border-2 transition-all',
            editingShiftName === config.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400']"
        >
          <template v-if="editingShiftName === config.name">
            <!-- 编辑模式：时间设置 + 颜色选择 8 色（V1.1 L66-146） -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="['w-4 h-4 rounded', tempShiftConfig.color]" />
                  <span class="font-medium text-gray-800">{{ config.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <el-button size="small" @click="handleShiftEditCancel">
                    <el-icon><Close /></el-icon>取消
                  </el-button>
                  <el-button size="small" type="primary" @click="handleShiftEditSave">
                    <el-icon><Check /></el-icon>保存
                  </el-button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">开始时间</label>
                  <el-time-select v-model="tempShiftConfig.startTime" style="width: 100%" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">结束时间</label>
                  <el-time-select v-model="tempShiftConfig.endTime" style="width: 100%" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">颜色</label>
                <div class="flex gap-2 flex-wrap">
                  <div
                    v-for="color in SHIFT_COLORS"
                    :key="color.name"
                    :class="['w-8 h-8 rounded-full cursor-pointer flex items-center justify-center',
                      tempShiftConfig.color === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : '']"
                    :style="{ backgroundColor: color.value }"
                    @click="tempShiftConfig.color = color.name"
                  >
                    <el-icon v-if="tempShiftConfig.color === color.name" class="text-white"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- 显示模式：颜色 + 时间 + 编辑按钮（V1.1 L148-170） -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div :class="['w-4 h-4 rounded', config.color]" />
                <div>
                  <div class="font-medium text-gray-800">{{ config.name }}</div>
                  <div class="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <el-icon><Clock /></el-icon>
                    {{ config.startTime }} - {{ config.endTime }}
                  </div>
                </div>
              </div>
              <el-button size="small" type="primary" plain @click="handleShiftEditStart(config)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
            </div>
          </template>
        </div>
      </div>
      <div class="mt-4 p-3 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-500">提示：班次设置将影响所有排班记录的颜色和时间显示。修改班次时间不会影响已执行的签到记录。</p>
      </div>
      <template #footer>
        <el-button @click="showShiftEditor = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Calendar, List, User, Setting, Plus, Clock, ArrowLeft, ArrowRight, ArrowRight as Promotion, Download, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useScheduleStore } from '@/stores/modules/schedule'

const store = useScheduleStore()

// 显示模式
const displayMode = ref('calendar')
const calendarDate = ref(new Date())

// ============ 与 V1.1 SchedulePage L61 viewMode 1:1 对齐：月/周/日 视图 ============
const viewMode = ref('month')  // 'month' | 'week' | 'day'
const selectedDay = ref(new Date().toISOString().slice(0, 10))

// ============ 与 V1.1 ShiftEditor L25-26 1:1 对齐：班次编辑模式 ============
const editingShiftName = ref(null)
const tempShiftConfig = reactive({ startTime: '', endTime: '', color: '' })
// 与 V1.1 ShiftEditor L13-22 1:1 对齐：颜色 8 色
const SHIFT_COLORS = [
  { name: 'bg-amber-500', value: '#f59e0b' },
  { name: 'bg-blue-500', value: '#3b82f6' },
  { name: 'bg-indigo-600', value: '#4f46e5' },
  { name: 'bg-green-500', value: '#10b981' },
  { name: 'bg-purple-500', value: '#a855f7' },
  { name: 'bg-pink-500', value: '#ec4899' },
  { name: 'bg-red-500', value: '#ef4444' },
  { name: 'bg-teal-500', value: '#14b8a6' },
]

// ============ 表格视图：搜索 + 筛选（V1.1 ScheduleTable L87-128 1:1 对齐） ============
const searchTerm = ref('')
const shiftFilter = ref('all')
const statusFilter = ref('all')
const dateRange = ref({
  start: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10) })(),
  end: (() => { const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10) })(),
})

// ============ 表格筛选后的数据（V1.1 L109-128 1:1 对齐） ============
const filteredSchedules = computed(() => {
  return store.schedules.filter(record => {
    const matchSearch = !searchTerm.value ||
      (record.staffName || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (record.workZone || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (record.date || '').includes(searchTerm.value)
    const matchShift = shiftFilter.value === 'all' || record.shift === shiftFilter.value
    const matchStatus = statusFilter.value === 'all' || record.status === statusFilter.value
    const matchDate = record.date >= dateRange.value.start && record.date <= dateRange.value.end
    return matchSearch && matchShift && matchStatus && matchDate
  })
})

const currentYear = computed(() => calendarDate.value.getFullYear())
const currentMonth = computed(() => calendarDate.value.getMonth() + 1)

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showSwapModal = ref(false)
const showShiftEditor = ref(false)
const showBatchEditModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)

// 分页
const pagination = reactive({ currentPage: 1, pageSize: 10 })

// 批量操作
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const batchEditForms = reactive({})
const exportFormat = ref('excel')

const exportFormats = [
  { value: 'excel', label: 'Excel (.xls)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.doc)', desc: '适用于文档编辑和分享' },
]

// 新排班表单
const newSchedule = reactive({ staffId: '', date: '', shift: '早班', workZone: '' })

// 编辑表单
const showEditId = ref('')
const editForm = reactive({ shift: '早班', workZone: '' })

// 调班表单
const swapForm = reactive({ requesterId: '', requesterName: '', targetId: '', targetName: '', originalDate: '', targetDate: '', reason: '' })

// 选中的排班
const selectedSchedule = ref(null)

// 分页后的排班
const paginatedSchedules = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return store.schedules.slice(start, end)
})

// 获取日期的排班数量
const getScheduleCountForDate = (date) => {
  return store.schedules.filter(s => s.date === date).length
}

const getShiftType = (shift) => ({ '早班': '', '中班': 'warning', '晚班': 'danger', '全天': 'success', '弹性': 'info' }[shift] || '')
const getStatusType = (status) => ({ '已排班': 'info', '已执行': 'success', '已取消': 'warning' }[status] || 'info')
const getSwapStatusType = (status) => ({ '待审批': 'warning', '已同意': 'success', '已拒绝': 'danger' }[status] || 'info')

const prevMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value - 2, 1) }
const nextMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value, 1) }

const handleCalendarDateClick = (day) => { selectedSchedule.value = store.schedules.find(s => s.date === day) || null }

// ============ 与 V1.1 ScheduleCalendar L76-104 1:1 对齐：上一天/今天/下一天 ============
const handleCalendarPrev = () => {
  if (viewMode.value === 'day') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() - 1)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else if (viewMode.value === 'week') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() - 7)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else {
    prevMonth()
  }
}

const handleCalendarNext = () => {
  if (viewMode.value === 'day') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() + 1)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else if (viewMode.value === 'week') {
    const d = new Date(selectedDay.value)
    d.setDate(d.getDate() + 7)
    selectedDay.value = d.toISOString().slice(0, 10)
  } else {
    nextMonth()
  }
}

const handleCalendarToday = () => {
  const today = new Date().toISOString().slice(0, 10)
  selectedDay.value = today
  calendarDate.value = new Date(today)
}

// ============ 与 V1.1 ScheduleCalendar L45-59 1:1 对齐：辅助函数 ============
const isToday = (dateStr) => {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr === today
}

const getSchedulesForDate = (dateStr) => {
  return store.schedules.filter(s => s.date === dateStr)
}

const getShiftColor = (shift) => {
  const config = store.shiftConfigs.find(c => c.name === shift)
  return config?.color || 'bg-gray-500'
}

const getShiftTime = (shift) => {
  const config = store.shiftConfigs.find(c => c.name === shift)
  return config ? `${config.startTime} - ${config.endTime}` : '-'
}

const getStatusClass = (status) => ({
  '已排班': 'bg-blue-100 text-blue-700',
  '已执行': 'bg-green-100 text-green-700',
  '已取消': 'bg-gray-100 text-gray-600',
}[status] || 'bg-gray-100 text-gray-700')

// ============ 周视图 7 天数据（V1.1 L186-272 1:1 对齐） ============
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const weekDays = computed(() => {
  const base = new Date(selectedDay.value)
  // 把基准日对齐到本周一
  const dayOfWeek = base.getDay() === 0 ? 7 : base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - (dayOfWeek - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    return { date: dateStr, day: d.getDate(), weekday: WEEKDAYS[i] }
  })
})

const formatWeekdayTitle = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[(d.getDay() === 0 ? 7 : d.getDay()) - 1]}`
}

const formatDayTitle = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[(d.getDay() === 0 ? 7 : d.getDay()) - 1]}`
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(s => s.id)
}

// 批量操作按钮
const handleBatchExportClick = () => {
  if (exportMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要导出的数据'); return }
    showExportModal.value = true
  } else {
    exportMode.value = true
    batchEditMode.value = false
    batchDeleteMode.value = false
    selectedRows.value = []
  }
}

const handleBatchEditClick = () => {
  if (batchEditMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要编辑的记录'); return }
    // 初始化编辑表单
    selectedRows.value.forEach(id => {
      const record = store.schedules.find(s => s.id === id)
      if (record) {
        batchEditForms[id] = { shift: record.shift, workZone: record.workZone }
      }
    })
    showBatchEditModal.value = true
  } else {
    batchEditMode.value = true
    batchDeleteMode.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

const handleBatchDeleteClick = () => {
  if (batchDeleteMode.value) {
    if (selectedRows.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
    showDeleteWarning.value = true
  } else {
    batchDeleteMode.value = true
    batchEditMode.value = false
    exportMode.value = false
    selectedRows.value = []
  }
}

const handleCancelBatch = () => {
  batchEditMode.value = false
  batchDeleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 确认批量编辑
const handleConfirmBatchEdit = () => {
  selectedRows.value.forEach(id => {
    const form = batchEditForms[id]
    if (form) {
      store.updateSchedule(id, { shift: form.shift, workZone: form.workZone })
    }
  })
  ElMessage.success('批量编辑已保存')
  showBatchEditModal.value = false
  handleCancelBatch()
}

// 确认删除
const handleConfirmDelete = () => {
  selectedRows.value.forEach(id => store.deleteSchedule(id))
  ElMessage.success(`已删除 ${selectedRows.value.length} 条记录`)
  showDeleteWarning.value = false
  handleCancelBatch()
}

// 真实导出实现
const handleDoExport = () => {
  const selectedData = store.schedules.filter(s => selectedRows.value.includes(s.id))
  const headers = ['日期', '员工', '班次', '工作区域', '开始时间', '结束时间', '状态', '签到时间', '签退时间']

  const exportData = selectedData.map(row => {
    const shiftConfig = store.shiftConfigs.find(c => c.name === row.shift)
    return {
      '日期': row.date,
      '员工': row.staffName || '-',
      '班次': row.shift,
      '工作区域': row.workZone || '-',
      '开始时间': shiftConfig?.startTime || '',
      '结束时间': shiftConfig?.endTime || '',
      '状态': row.status,
      '签到时间': row.checkIn || '-',
      '签退时间': row.checkOut || '-',
    }
  })

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const bom = '﻿'
    content = bom + headers.join(',') + '\n' + exportData.map(row =>
      headers.map(h => `"${(row[h] || '')}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `排班记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success(`已导出 ${selectedRows.value.length} 条数据为 ${extension.toUpperCase()} 格式`)
  showExportModal.value = false
  handleCancelBatch()
}

// 查看详情
const handleView = (row) => { selectedSchedule.value = row }

// 取消排班
const handleCancel = (row) => {
  ElMessageBox.confirm(`确定要取消 ${row.staffName} 的排班吗？`, '取消确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    store.cancelSchedule(row.id)
    ElMessage.success('已取消排班')
  }).catch(() => {})
}

// 单条编辑
const handleEditSingle = (row) => {
  showEditId.value = row.id
  editForm.shift = row.shift
  editForm.workZone = row.workZone
  showEditModal.value = true
}

const handleSaveEdit = () => {
  store.updateSchedule(showEditId.value, { shift: editForm.shift, workZone: editForm.workZone })
  ElMessage.success('编辑已保存')
  showEditModal.value = false
}

// 新增排班
const handleAddSchedule = () => {
  if (!newSchedule.staffId || !newSchedule.date) { ElMessage.warning('请选择员工和日期'); return }
  const staff = store.staffList.find(s => s.id === newSchedule.staffId)
  if (staff) {
    const shiftConfig = store.shiftConfigs.find(c => c.name === newSchedule.shift)
    store.addSchedule({
      staffId: newSchedule.staffId,
      staffName: staff.name,
      date: newSchedule.date,
      shift: newSchedule.shift,
      workZone: newSchedule.workZone || staff.workZone,
      startTime: shiftConfig?.startTime || '',
      endTime: shiftConfig?.endTime || '',
    })
    ElMessage.success('排班添加成功')
    showAddModal.value = false
    Object.assign(newSchedule, { staffId: '', date: '', shift: '早班', workZone: '' })
  }
}

// 调班申请 - 与 V1.1 SwapRequestModal L62-73 1:1 对齐：完整验证
const handleSwapSubmit = () => {
  if (!swapForm.requesterId || !swapForm.targetId || !swapForm.originalDate || !swapForm.targetDate) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (swapForm.requesterId === swapForm.targetId) {
    ElMessage.warning('不能与自己调班')
    return
  }
  const requester = store.staffList.find(s => s.id === swapForm.requesterId)
  const target = store.staffList.find(s => s.id === swapForm.targetId)
  store.submitSwapRequest({
    requesterId: swapForm.requesterId,
    requesterName: requester?.name || swapForm.requesterName,
    targetId: swapForm.targetId,
    targetName: target?.name || swapForm.targetName,
    originalDate: swapForm.originalDate,
    targetDate: swapForm.targetDate,
    reason: swapForm.reason,
  })
  ElMessage.success('调班申请已提交')
  showSwapModal.value = false
  // 与 V1.1 L114 1:1 对齐：重置表单
  Object.assign(swapForm, { requesterId: '', requesterName: '', targetId: '', targetName: '', originalDate: '', targetDate: '', reason: '' })
}

const handleSwapApprove = (request) => { store.handleSwapRequest(request.id, '已同意'); ElMessage.success('已同意调班申请') }
const handleSwapReject = (request) => { store.handleSwapRequest(request.id, '已拒绝'); ElMessage.success('已拒绝调班申请') }

const handleSaveShift = () => {
  ElMessage.success('班次设置已保存')
  showShiftEditor.value = false
}

// ============ 与 V1.1 ShiftEditor L29-50 1:1 对齐：班次编辑 ============
const handleShiftEditStart = (config) => {
  editingShiftName.value = config.name
  tempShiftConfig.startTime = config.startTime
  tempShiftConfig.endTime = config.endTime
  tempShiftConfig.color = config.color
}

const handleShiftEditSave = () => {
  if (editingShiftName.value && tempShiftConfig.startTime && tempShiftConfig.endTime) {
    const idx = store.shiftConfigs.findIndex(c => c.name === editingShiftName.value)
    if (idx !== -1) {
      store.shiftConfigs[idx] = { ...store.shiftConfigs[idx], ...tempShiftConfig }
      ElMessage.success(`${editingShiftName.value}已更新`)
    }
    editingShiftName.value = null
  } else {
    ElMessage.warning('请填写完整时间')
  }
}

const handleShiftEditCancel = () => {
  editingShiftName.value = null
}

// ============ 与 V1.1 SwapRequestModal L39-59 1:1 对齐：员工选择联动姓名 ============
const handleSwapRequesterChange = (staffId) => {
  const staff = store.staffList.find(s => s.id === staffId)
  if (staff) {
    swapForm.requesterName = staff.name
  }
}

const handleSwapTargetChange = (staffId) => {
  const staff = store.staffList.find(s => s.id === staffId)
  if (staff) {
    swapForm.targetName = staff.name
  }
}

// 初始化种子数据
onMounted(() => {
  store.initSeedData()
})

// ============ 与 V1.1 L16-32 1:1 对齐：数据兼容工具 ============
// 规范化排班记录（兼容 snake_case 和 camelCase）
function normalizeRecord(record) {
  return {
    ...record,
    staffName: record.staffName || record.staff_name || '',
    workZone: record.workZone || record.work_zone || '',
  }
}

// 获取规范的员工名称
function getStaffName(record) {
  return record.staffName || record.staff_name || '-'
}

// 获取规范的工作区域
function getWorkZone(record) {
  return record.workZone || record.work_zone || '-'
}
</script>
