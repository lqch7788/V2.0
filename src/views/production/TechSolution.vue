<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <FileCode class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">技术方案列表</h1>
          <p class="text-gray-500">种植技术方案的管理与发布</p>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">方案编号</label>
          <input
            v-model="code"
            :class="inputClass"
            placeholder="请输入方案编号"
          />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">作物</label>
          <el-select v-model="cropFilter" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="番茄" value="番茄" />
            <el-option label="黄瓜" value="黄瓜" />
            <el-option label="草莓" value="草莓" />
            <el-option label="辣椒" value="辣椒" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">编制人</label>
          <input
            v-model="author"
            :class="inputClass"
            placeholder="请输入编制人"
          />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <el-select v-model="status" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="已发布" value="已发布" />
            <el-option label="草稿" value="草稿" />
            <el-option label="审核中" value="审核中" />
          </el-select>
        </div>
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            v-model="startDate"
            type="date"
            :class="inputClass"
          />
        </div>
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input
            v-model="endDate"
            type="date"
            :class="inputClass"
          />
        </div>
        <div class="flex gap-2">
          <button :class="btnDefault" @click="handleSearch">
            <Search class="w-4 h-4" />
            搜索
          </button>
          <button :class="btnDefault" @click="handleReset">
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">技术方案列表</h3>
        <div v-if="exportMode || batchEditMode || batchDeleteMode" class="flex gap-2">
          <template v-if="batchEditMode">
            <button :class="btnBlue" @click="openBatchEdit">
              <Edit class="w-4 h-4" />
              编辑
            </button>
            <button :class="btnSecondary" @click="batchEditMode = false; selectedRows = []">
              取消
            </button>
          </template>
          <template v-if="batchDeleteMode">
            <button :class="btnDestructive" @click="handleDeleteClick" :disabled="selectedRows.length === 0">
              <Delete class="w-4 h-4" />
              删除
            </button>
            <button :class="btnSecondary" @click="batchDeleteMode = false; selectedRows = []">
              取消
            </button>
          </template>
          <template v-if="exportMode">
            <button :class="btnDefault" @click="showExportModal = true">
              <Download class="w-4 h-4" />
              确认导出
            </button>
            <button :class="btnSecondary" @click="handleCancelExport">
              取消
            </button>
          </template>
        </div>
        <div v-else class="flex gap-2">
          <button v-if="canCreate" :class="btnDefault" @click="handleOpenCreateModal">
            <Plus class="w-4 h-4" />
            新增
          </button>
          <button v-if="canEdit" :class="btnBlue" @click="batchEditMode = true; selectedRows = []">
            <Edit class="w-4 h-4" />
            编辑
          </button>
          <button v-if="canDelete" :class="btnDestructive" @click="batchDeleteMode = true; selectedRows = []">
            <Delete class="w-4 h-4" />
            删除
          </button>
          <button v-if="canExport" :class="btnDefault" @click="handleExportClick">
            <Download class="w-4 h-4" />
            导出
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="selectedRows.length === filteredTechSolutions.length && filteredTechSolutions.length > 0"
                  @change="handleSelectAll"
                  class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">关联生产计划批次</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案标题</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物品种</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植模式</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">适用范围</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">版本</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">编制人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">创建日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最后提交时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审核人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">审批状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案是否有效</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">方案详情文件</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr
              v-for="tech in paginatedTechSolutions"
              :key="tech.id"
              class="hover:bg-blue-100 transition-colors"
            >
              <td v-if="exportMode || batchEditMode || batchDeleteMode" class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedRows.includes(tech.id)"
                  @change="handleSelectRow(tech.id)"
                  class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">
                <button :class="btnGhost + ' text-blue-600 hover:text-blue-800 text-xs'" @click="handleViewClick(tech)">{{ tech.code }}</button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ tech.relatedBatchCode || '-' }}</td>
              <td class="px-4 py-3 text-sm font-medium text-green-700 whitespace-nowrap">
                <button :class="btnGhost + ' text-green-700 hover:text-green-900 text-xs'" @click="handleTitleClick(tech)">{{ tech.title }}</button>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.crop }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.plantingMode }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.stage }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.version }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.author }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.createDate }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.lastSubmitTime ? tech.lastSubmitTime.slice(0, 10) : '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ tech.approver }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.approveStatus === '已审批' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                  {{ tech.approveStatus }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.statusClass === 'normal' ? 'bg-green-100 text-green-700' : tech.statusClass === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                  {{ tech.status }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium', tech.isValid === '作废' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
                  {{ tech.isValid || '有效' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <button v-if="tech.planDetailFileName" :class="btnGhost + ' text-blue-600 hover:text-blue-800 text-sm'" :title="'点击下载方案详情'" @click="downloadPlanDetail(tech)">
                  {{ tech.planDetailFileName }}
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <template v-if="tech.isValid !== '作废'">
                    <button :class="btnGhost + ' text-blue-600 hover:text-blue-800 p-1'" title="编辑" @click="handleEditClick(tech)">
                      <Edit class="w-4 h-4" />
                    </button>
                    <button :class="btnGhost + ' text-red-600 hover:text-red-800 p-1'" title="删除" @click="setSelectedRows([tech.id]); showDeleteModal = true">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </template>
                  <button v-else :class="btnGhost + ' text-red-600 hover:text-red-800 p-1'" title="删除" @click="setSelectedRows([tech.id]); showDeleteModal = true">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="exportMode" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div class="flex items-center gap-4">
            <button :class="btnGhost" @click="handleSelectAll">
              {{ selectedRows.length === techSolutions.length ? '全不选' : '全选' }}
            </button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">每页</span>
        <el-select v-model="pageSize" @change="currentPage = 1" class="w-20">
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <span class="text-sm text-gray-500">条</span>
      </div>
      <div class="flex items-center gap-1">
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = 1" :disabled="currentPage === 1">
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
          <button
            v-if="typeof page === 'number'"
            :class="['min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors', currentPage === page ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 text-gray-400">{{ page }}</span>
        </template>
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage >= totalPages">
          <ChevronRight class="w-4 h-4" />
        </button>
        <button :class="btnGhost + ' h-9 w-9'" @click="currentPage = totalPages" :disabled="currentPage >= totalPages">
          <ChevronsRight class="w-4 h-4" />
        </button>
        <span class="text-sm text-gray-500 ml-2">共 {{ totalPages }} 页</span>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="viewModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="viewModalOpen = false"></div>
      <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 700px; max-height: 90vh;">
        <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
          <h3 class="text-lg font-semibold text-white">方案详情</h3>
          <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="viewModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedTech" class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">方案编号</label>
                <p class="text-gray-900 font-medium">{{ selectedTech.code }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">版本</label>
                <p class="text-gray-900">{{ selectedTech.version }}</p>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">方案标题</label>
              <p class="text-gray-900 font-medium">{{ selectedTech.title }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">作物品种</label>
                <p class="text-gray-900">{{ selectedTech.crop }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">种植模式</label>
                <p class="text-gray-900">{{ selectedTech.plantingMode }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">适用范围</label>
                <p class="text-gray-900">{{ selectedTech.stage }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">编制人</label>
                <p class="text-gray-900">{{ selectedTech.author }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">创建日期</label>
                <p class="text-gray-900">{{ selectedTech.createDate }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">审核人</label>
                <p class="text-gray-900">{{ selectedTech.approver }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">审批状态</label>
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1', selectedTech.approveStatus === '已审批' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                  {{ selectedTech.approveStatus }}
                </span>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">状态</label>
                <span :class="['inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1', selectedTech.statusClass === 'normal' ? 'bg-green-100 text-green-700' : selectedTech.statusClass === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700']">
                  {{ selectedTech.status }}
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">审批人</label>
                <p class="text-gray-900">{{ selectedTech.approver }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">审批日期</label>
                <p class="text-gray-900">{{ selectedTech.approvalDate }}</p>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">方案内容</label>
              <div class="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed">{{ selectedTech.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="editModalOpen = false"></div>
      <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 700px; max-height: 90vh;">
        <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
          <h3 class="text-lg font-semibold text-white">编辑方案</h3>
          <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="editModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedTech" class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">方案编号</label>
                <input :value="selectedTech.code" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">版本</label>
                <input v-model="editForm.version" :class="inputClass" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案标题</label>
              <input v-model="editForm.title" :class="inputClass" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">作物品种</label>
                <el-select v-model="editForm.crop" class="w-full">
                  <el-option label="番茄" value="番茄" />
                  <el-option label="黄瓜" value="黄瓜" />
                  <el-option label="草莓" value="草莓" />
                  <el-option label="辣椒" value="辣椒" />
                </el-select>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">种植模式</label>
                <el-select v-model="editForm.plantingMode" class="w-full">
                  <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
                </el-select>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">适用范围</label>
              <input v-model="editForm.stage" :class="inputClass" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">编制人</label>
                <input :value="selectedTech.author" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">创建日期</label>
                <input :value="selectedTech.createDate" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">最后提交时间</label>
                <input :value="editForm.lastSubmitTime || new Date().toISOString().split('T')[0]" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">方案是否有效</label>
                <el-select v-model="editForm.isValid" class="w-full">
                  <el-option label="有效" value="有效" />
                  <el-option label="作废" value="作废" />
                </el-select>
                <p v-if="editForm.isValid === '作废'" class="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ 选择"作废"后方案将无法使用，提交后将进入审核流程
                </p>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案内容</label>
              <textarea v-model="editForm.content" rows="6" :class="inputClass + ' resize-y'"></textarea>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button :class="btnSecondary" @click="editModalOpen = false">取消</button>
          <button :class="btnDefault" @click="handleEditSubmit">保存</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="createModalOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="createModalOpen = false"></div>
      <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 1350px; max-height: 90vh;">
        <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
          <h3 class="text-lg font-semibold text-white">新增方案</h3>
          <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="createModalOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">方案编号</label>
                <div class="flex gap-2">
                  <input v-model="newPlanForm.code" :class="inputClass" placeholder="请输入方案编号" />
                  <button :class="btnDefault + ' flex-shrink-0'" @click="newPlanForm.code = generateCode()">生成</button>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">版本</label>
                <input v-model="newPlanForm.version" :class="inputClass" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案标题 <span class="text-red-500">*</span></label>
              <input v-model="newPlanForm.title" :class="inputClass" placeholder="请输入方案标题" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">作物品种 <span class="text-red-500">*</span></label>
                <CropCodeSelector
                  v-model="newPlanForm.cropCode"
                  @change="handleCropChange"
                  placeholder="搜索或选择作物品种..."
                  size="md"
                  showFullPath
                />
                <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div class="text-emerald-700 flex items-center gap-1">
                    <Leaf class="w-3 h-3 flex-shrink-0" />
                    {{ selectedCrop.categoryName }} > {{ selectedCrop.typeName }} > {{ selectedCrop.varietyName }}
                    <span v-if="selectedCrop.subVariety1Name"> > {{ selectedCrop.subVariety1Name }}</span>
                  </div>
                  <div class="text-emerald-600 mt-0.5">
                    编码：{{ selectedCrop.cropCode }}
                  </div>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">作物编码</label>
                <input v-model="newPlanForm.cropCode" placeholder="自动获取" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">种植模式</label>
                <el-select v-model="newPlanForm.plantingMode" class="w-full">
                  <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
                </el-select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">关联生产批次号</label>
                <el-select v-model="newPlanForm.relatedBatchCode" class="w-full" placeholder="请选择">
                  <el-option label="ZZB2026-001 - 番茄种植批次" value="ZZB2026-001" />
                  <el-option label="ZZB2026-002 - 黄瓜种植批次" value="ZZB2026-002" />
                  <el-option label="ZZB2026-003 - 草莓种植批次" value="ZZB2026-003" />
                  <el-option label="YMB2026-001 - 番茄育苗批次" value="YMB2026-001" />
                  <el-option label="YMB2026-002 - 黄瓜育苗批次" value="YMB2026-002" />
                  <el-option label="JZB2026-001 - 番茄种源批次" value="JZB2026-001" />
                  <el-option label="JZB2026-002 - 黄瓜种源批次" value="JZB2026-002" />
                </el-select>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">适用范围</label>
              <input v-model="newPlanForm.stage" :class="inputClass" placeholder="请输入适用范围" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">编制人</label>
                <el-select v-model="newPlanForm.author" class="w-full">
                  <el-option v-for="op in operatorOptions" :key="op.value" :label="op.label" :value="op.value" />
                </el-select>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">创建日期</label>
                <input :value="new Date().toISOString().split('T')[0]" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium text-gray-700">审核人</label>
                <input value="Susan" disabled :class="inputClass + ' bg-gray-50'" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700">方案详细</label>
              <div class="flex items-center gap-2">
                <button :class="btnBlue" @click="handleCreateFileUpload">
                  <Upload class="w-3 h-3" />
                  导入文件
                </button>
                <span class="text-xs text-gray-500">支持 .txt, .md, .docx 格式文件</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button :class="btnSecondary" @click="handleCreateSubmit('draft')">存为草稿</button>
          <button :class="btnDefault" @click="handleCreateSubmit('submit')">提交审批</button>
        </div>
      </div>
    </div>

    <!-- Delete Warning Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-96 shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">删除警告</h3>
        </div>
        <div class="text-sm text-gray-600 space-y-2 mb-6">
          <p>确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 个项目吗？</p>
          <p>此操作 <strong class="text-red-600">无法恢复</strong>，删除后数据将永久丢失。</p>
        </div>
        <div class="flex gap-3">
          <button :class="btnSecondary + ' flex-1'" @click="showDeleteModal = false">取消</button>
          <button :class="btnDestructive + ' flex-1'" @click="handleDeleteConfirm">确认</button>
        </div>
      </div>
    </div>

    <!-- Batch Edit Modal -->
    <div v-if="showBatchEditModal" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="cancelBatchEdit"></div>
      <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 1080px; max-height: 90vh;">
        <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
          <h3 class="text-lg font-semibold text-white">批量编辑技术方案</h3>
          <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="cancelBatchEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
          <div class="space-y-4">
            <!-- Info Banner -->
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-sm text-blue-800">
                已选择 <strong>{{ selectedRows.length }}</strong> 个技术方案进行批量编辑，
                已编辑 <strong>{{ editedTechCodes.length }}</strong> 个
              </p>
            </div>
            <!-- Batch Selector -->
            <div class="flex items-center gap-4 mb-3">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">选择技术方案编号</label>
                <el-select v-model="selectedTechCode" class="w-full" placeholder="请选择方案编号">
                  <el-option
                    v-for="tech in techSolutions.filter(t => selectedRows.includes(t.id))"
                    :key="tech.id"
                    :label="`${tech.code} - ${tech.title} ${editedTechCodes.includes(tech.code) ? '✅ 已编辑' : ''}`"
                    :value="tech.code"
                  />
                </el-select>
              </div>
            </div>
            <!-- Edit Form -->
            <div v-if="selectedTechCode && techSolutions.find(t => t.code === selectedTechCode)" class="grid grid-cols-4 gap-3">
              <template v-for="currentTech in [techSolutions.find(t => t.code === selectedTechCode)]" :key="currentTech.id">
                <!-- 方案编号 - 不可编辑 -->
                <div class="bg-gray-100 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">方案编号</div>
                  <div class="text-sm font-medium text-gray-900">{{ currentTech.code }}</div>
                </div>
                <!-- 版本 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">版本</div>
                  <input
                    :value="editedTechs[selectedTechCode]?.version ?? currentTech.version"
                    @input="handleInputEdit(selectedTechCode, 'version', $event)"
                    :class="inputClass + ' h-7 py-0 text-xs'"
                  />
                </div>
                <!-- 方案标题 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2 col-span-2">
                  <div class="text-xs text-gray-500 mb-1">方案标题</div>
                  <input
                    :value="editedTechs[selectedTechCode]?.title ?? currentTech.title"
                    @input="handleInputEdit(selectedTechCode, 'title', $event)"
                    :class="inputClass + ' h-7 py-0 text-xs'"
                  />
                </div>
                <!-- 作物品种 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">作物品种</div>
                  <el-select
                    :model-value="editedTechs[selectedTechCode]?.crop ?? currentTech.crop"
                    @update:model-value="updateEditedField(selectedTechCode, 'crop', $event)"
                    class="w-full"
                  >
                    <el-option label="番茄" value="番茄" />
                    <el-option label="黄瓜" value="黄瓜" />
                    <el-option label="草莓" value="草莓" />
                    <el-option label="辣椒" value="辣椒" />
                  </el-select>
                </div>
                <!-- 种植模式 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">种植模式</div>
                  <el-select
                    :model-value="editedTechs[selectedTechCode]?.plantingMode ?? currentTech.plantingMode"
                    @update:model-value="updateEditedField(selectedTechCode, 'plantingMode', $event)"
                    class="w-full"
                  >
                    <el-option v-for="mode in plantingModes" :key="mode" :label="mode" :value="mode" />
                  </el-select>
                </div>
                <!-- 适用范围 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">适用范围</div>
                  <input
                    :value="editedTechs[selectedTechCode]?.stage ?? currentTech.stage"
                    @input="handleInputEdit(selectedTechCode, 'stage', $event)"
                    :class="inputClass + ' h-7 py-0 text-xs'"
                  />
                </div>
                <!-- 编制人 - 不可编辑 -->
                <div class="bg-gray-100 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">编制人</div>
                  <div class="text-sm text-gray-700">{{ currentTech.author }}</div>
                </div>
                <!-- 创建日期 - 不可编辑 -->
                <div class="bg-gray-100 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">创建日期</div>
                  <div class="text-sm text-gray-700">{{ currentTech.createDate }}</div>
                </div>
                <!-- 审核人 - 不可编辑 -->
                <div class="bg-gray-100 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">审核人</div>
                  <div class="text-sm text-gray-700">{{ currentTech.approver }}</div>
                </div>
                <!-- 审批状态 - 不可编辑 -->
                <div class="bg-gray-100 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">审批状态</div>
                  <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', currentTech.approveStatus === '已审批' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700']">
                    {{ currentTech.approveStatus }}
                  </span>
                </div>
                <!-- 状态 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2">
                  <div class="text-xs text-gray-500 mb-1">状态</div>
                  <el-select
                    :model-value="editedTechs[selectedTechCode]?.status ?? currentTech.status"
                    @update:model-value="updateEditedField(selectedTechCode, 'status', $event)"
                    class="w-full"
                  >
                    <el-option label="已发布" value="已发布" />
                    <el-option label="审核中" value="审核中" />
                    <el-option label="草稿" value="草稿" />
                  </el-select>
                </div>
                <!-- 方案详情文件 - 可编辑 -->
                <div class="bg-gray-50 rounded-lg p-2 col-span-4">
                  <div class="text-xs text-gray-500 mb-1">方案详情文件</div>
                  <div class="flex items-center gap-4">
                    <template v-if="(editedTechs[selectedTechCode]?.planDetailFileName ?? currentTech.planDetailFileName)">
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-700">{{ editedTechs[selectedTechCode]?.planDetailFileName ?? currentTech.planDetailFileName }}</span>
                        <button :class="btnBlue" @click="handleBatchFileUpload(selectedTechCode)">
                          <Upload class="w-3 h-3" />
                          重新上传
                        </button>
                        <span class="text-xs text-gray-500">支持 .md, .docx, .txt 格式</span>
                      </div>
                    </template>
                    <button v-else :class="btnDefault" @click="handleBatchFileUpload(selectedTechCode)">
                      <Upload class="w-3 h-3" />
                      上传方案文件
                    </button>
                  </div>
                </div>
              </template>
            </div>
            <!-- Footer Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button :class="btnSecondary" @click="cancelBatchEdit">取消</button>
              <button :class="btnDefault" @click="saveBatchEdit">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Format Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="showExportModal = false"></div>
      <div class="bg-white rounded-xl shadow-xl flex flex-col fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="width: 500px; max-height: 90vh;">
        <div class="modal-header flex items-center justify-between px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 flex-shrink-0 rounded-t-xl cursor-default select-none">
          <h3 class="text-lg font-semibold text-white">选择导出格式</h3>
          <button class="text-white hover:bg-emerald-500 rounded-lg p-1" @click="showExportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col">
          <div class="space-y-4">
            <p class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 条数据</p>
            <div class="space-y-3">
              <div
                v-for="format in exportFormats"
                :key="format.value"
                @click="exportFormat = format.value"
                :class="['flex items-center p-4 border rounded-lg cursor-pointer transition-all', exportFormat === format.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', exportFormat === format.value ? 'border-emerald-500' : 'border-gray-300']">
                  <div v-if="exportFormat === format.value" class="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ format.label }}</p>
                  <p class="text-xs text-gray-500">{{ format.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button :class="btnSecondary" @click="showExportModal = false">取消</button>
          <button :class="btnDefault" @click="handleConfirmExport">导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTechSolutionStore } from '@/stores/modules/techSolution'
import { enhancedApiClient } from '@/lib/apiClient'
import { showAlert } from '@/lib/dialogService'
import { FileCode, Plus, Search, Download, Edit, Trash2, Delete, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, Leaf } from 'lucide-vue-next'
import CropCodeSelector from '@/components/crop/CropCodeSelector.vue'

// ==================== 样式常量 ====================
const btnBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
const btnDefault = `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700 h-8 rounded-md px-3 text-xs`
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 rounded-md px-3 text-xs`
const btnDestructive = `${btnBase} bg-red-600 text-white hover:bg-red-700 h-8 rounded-md px-3 text-xs`
const btnBlue = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 h-8 rounded-md px-3 text-xs`
const btnGhost = `${btnBase} hover:bg-gray-100 hover:text-gray-900`

const inputClass = 'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
const selectClass = 'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none'

// ==================== 常量 ====================
const plantingModes = ['水培', '土培', '基质培', '雾培']

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' },
  { value: 'word', label: 'Word (.docx)', desc: '适用于文档编辑和分享' },
]

// ==================== 权限 ====================
const canCreate = true
const canEdit = true
const canDelete = true
const canExport = true

// ==================== Store ====================
const techSolutionStore = useTechSolutionStore()
const { solutions: techSolutions, isLoading } = storeToRefs(techSolutionStore)
const { fetchSolutions, addSolution, updateSolution, deleteSolutions } = techSolutionStore

// ==================== 过滤器 ====================
const code = ref('')
const cropFilter = ref('全部')
const author = ref('')
const status = ref('全部')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// ==================== 操作人员选项 ====================
const operatorOptions = ref<{ value: string; label: string }[]>([])

async function loadOperators() {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch('/api/dictionary/dictionaries?category=operator', { headers })
    let options: { value: string; label: string }[] = []
    if (response.ok) {
      const rawData = await response.json()
      let data: any[] = []
      if (Array.isArray(rawData)) data = rawData
      else if (Array.isArray(rawData?.data)) data = rawData.data
      else if (Array.isArray(rawData?.result)) data = rawData.result
      options = data.map((d: any) => ({
        value: d.dict_label || d.name,
        label: d.dict_label || d.name,
      }))
    }
    if (options.length === 0) {
      options = [
        { value: '陆启闯', label: '陆启闯' },
        { value: '郭靖', label: '郭靖' },
        { value: '黄蓉', label: '黄蓉' },
        { value: '张无忌', label: '张无忌' }
      ]
    }
    operatorOptions.value = options
  } catch (error) {
    console.error('加载操作人员失败:', error)
    operatorOptions.value = [
      { value: '陆启闯', label: '陆启闯' },
      { value: '郭靖', label: '郭靖' },
      { value: '黄蓉', label: '黄蓉' },
      { value: '张无忌', label: '张无忌' }
    ]
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadOperators()
  fetchSolutions()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchSolutions()
  }
}

// ==================== 计算属性 ====================
const filteredTechSolutions = computed(() => {
  return techSolutions.value.filter((tech: any) => {
    if (code.value && !tech.code.toLowerCase().includes(code.value.toLowerCase())) return false
    if (cropFilter.value && cropFilter.value !== '全部' && tech.crop !== cropFilter.value) return false
    if (author.value && !tech.author.toLowerCase().includes(author.value.toLowerCase())) return false
    if (status.value && status.value !== '全部' && tech.status !== status.value) return false
    if (startDate.value && tech.createDate < startDate.value) return false
    if (endDate.value && tech.createDate > endDate.value) return false
    return true
  })
})

const paginatedTechSolutions = computed(() => {
  return filteredTechSolutions.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTechSolutions.value.length / pageSize.value) || 1
})

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pages: (number | string)[] = []
  const showEllipsis = total > 7
  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
  }
  return pages
})

// ==================== 搜索/重置 ====================
const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  code.value = ''
  cropFilter.value = '全部'
  author.value = ''
  status.value = '全部'
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
}

// ==================== Modal State ====================
const viewModalOpen = ref(false)
const editModalOpen = ref(false)
const createModalOpen = ref(false)
const exportMode = ref(false)
const batchEditMode = ref(false)
const batchDeleteMode = ref(false)
const showDeleteModal = ref(false)
const showBatchEditModal = ref(false)
const selectedRows = ref<(string | number)[]>([])
const exportFormat = ref('excel')
const showExportModal = ref(false)
const selectedTech = ref<any>(null)
const editForm = ref({
  title: '',
  crop: '',
  plantingMode: '',
  stage: '',
  version: '',
  content: '',
  isValid: '有效',
  lastSubmitTime: '',
})

const editedTechCodes = ref<string[]>([])
const editedTechs = ref<Record<string, any>>({})
const selectedTechCode = ref('')

const newPlanForm = ref({
  code: '',
  title: '',
  crop: '',
  cropCode: '',
  plantingMode: '水培',
  stage: '',
  author: localStorage.getItem('username') || '陆启闯',
  version: 'V1.0',
  content: '',
  planDetailFileName: '',
  relatedBatchCode: '',
})

const selectedCrop = ref<any>(null)

const handleCropChange = (code: string, varietyInfo: any) => {
  if (varietyInfo) {
    selectedCrop.value = varietyInfo
    newPlanForm.value.crop = varietyInfo.subVariety1Name || varietyInfo.varietyName
    newPlanForm.value.cropCode = varietyInfo.cropCode
  } else {
    selectedCrop.value = null
    newPlanForm.value.crop = ''
    newPlanForm.value.cropCode = ''
  }
}

// ==================== 辅助函数 ====================
const generateCode = () => {
  return `T${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

const setSelectedRows = (rows: (string | number)[]) => {
  selectedRows.value = rows
}

const handleTitleClick = (tech: any) => {
  selectedTech.value = tech
  viewModalOpen.value = true
}

const handleViewClick = (tech: any) => {
  selectedTech.value = tech
  viewModalOpen.value = true
}

const handleEditClick = (tech: any) => {
  if (tech.isValid === '作废') {
    showAlert('该方案已作废，无法编辑')
    return
  }
  selectedTech.value = tech
  editForm.value = {
    title: tech.title,
    crop: tech.crop,
    plantingMode: tech.plantingMode,
    stage: tech.stage,
    version: tech.version,
    content: tech.content,
    isValid: tech.isValid || '有效',
    lastSubmitTime: new Date().toISOString().split('T')[0],
  }
  editModalOpen.value = true
}

const handleEditSubmit = async () => {
  if (!selectedTech.value) return
  const updateData = {
    solutionTitle: editForm.value.title,
    cropName: editForm.value.crop,
    plantingMode: editForm.value.plantingMode,
    stage: editForm.value.stage,
    version: editForm.value.version,
    content: editForm.value.content,
    relatedBatchCode: selectedTech.value.relatedBatchCode || '',
    planDetailFileName: selectedTech.value.planDetailFileName || '',
    priority: selectedTech.value.priority || 'normal',
    remarks: '',
    isValid: editForm.value.isValid,
    lastSubmitTime: editForm.value.lastSubmitTime || new Date().toISOString().split('T')[0],
  }
  try {
    await updateSolution(selectedTech.value.id, updateData)
    editModalOpen.value = false
  } catch (error) {
    console.error('更新技术方案失败:', error)
    await showAlert('更新失败，请重试')
  }
}

const handleCreateSubmit = async (submitMode: 'draft' | 'submit') => {
  const today = new Date().toISOString().split('T')[0]
  const techSolutionData = {
    solutionTitle: newPlanForm.value.title,
    cropName: newPlanForm.value.crop,
    cropCode: newPlanForm.value.cropCode,
    plantingMode: newPlanForm.value.plantingMode,
    stage: newPlanForm.value.stage,
    version: newPlanForm.value.version || 'V1.0',
    content: newPlanForm.value.content,
    author: newPlanForm.value.author || localStorage.getItem('username') || '陆启闯',
    authorId: localStorage.getItem('userId') || '',
    relatedBatchCode: newPlanForm.value.relatedBatchCode || '',
    planDetailFileName: newPlanForm.value.planDetailFileName || '',
    priority: 'normal',
    batchStatus: submitMode === 'draft' ? 'draft' : 'pending',
  }
  try {
    const result = await addSolution(techSolutionData)
    if (submitMode === 'submit') {
      const approvalData = {
        id: `AP${Date.now()}`,
        type: 'tech_solution',
        typeName: '技术方案',
        title: `技术方案审批：${newPlanForm.value.title}`,
        description: `作物：${newPlanForm.value.crop}\n种植模式：${newPlanForm.value.plantingMode}\n适用范围：${newPlanForm.value.stage}`,
        applicantId: localStorage.getItem('userId') || '',
        applicantName: localStorage.getItem('username') || '陆启闯',
        applicantDepartment: localStorage.getItem('department') || '',
        applyDate: today,
        status: 'pending',
        priority: 'normal',
        businessLink: {
          type: 'tech_solution',
          requestId: result.id,
          requestCode: result.code,
          solutionTitle: newPlanForm.value.title,
          cropName: newPlanForm.value.crop,
          plantingMode: newPlanForm.value.plantingMode,
          stage: newPlanForm.value.stage,
          version: newPlanForm.value.version || 'V1.0',
        },
      }
      await enhancedApiClient.post('/approvals', approvalData)
    }
    createModalOpen.value = false
    newPlanForm.value = {
      code: '',
      title: '',
      crop: '',
      cropCode: '',
      plantingMode: '水培',
      stage: '',
      author: localStorage.getItem('username') || '陆启闯',
      version: 'V1.0',
      content: '',
      planDetailFileName: '',
      relatedBatchCode: '',
    }
  } catch (error) {
    console.error('创建技术方案失败:', error)
    await showAlert('创建技术方案失败，请重试')
  }
}

const handleExportClick = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleSelectAll = () => {
  if (selectedRows.value.length === techSolutions.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = techSolutions.value.map((t: any) => t.id)
  }
}

const handleSelectRow = (id: string | number) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要导出的数据')
    return
  }
  handleDoExport()
}

const handleDoExport = async () => {
  const selectedData = techSolutions.value.filter((t: any) => selectedRows.value.includes(t.id))
  const headers = ['方案编号', '关联生产计划批次', '方案标题', '作物品种', '种植模式', '适用范围', '版本', '编制人', '创建日期', '最后提交时间', '审核人', '审批状态', '状态', '方案是否有效']
  const exportData = selectedData.map((row: any) => ({
    '方案编号': row.code,
    '关联生产计划批次': row.relatedBatchCode || '-',
    '方案标题': row.title,
    '作物品种': row.crop,
    '种植模式': row.plantingMode,
    '适用范围': row.stage,
    '版本': row.version,
    '编制人': row.author,
    '创建日期': row.createDate,
    '最后提交时间': row.lastSubmitTime ? row.lastSubmitTime.slice(0, 10) : '-',
    '审核人': row.approver,
    '审批状态': row.approveStatus,
    '状态': row.status,
    '方案是否有效': row.isValid || '有效'
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    content = headers.join(',') + '\n' + exportData.map((row: any) =>
      headers.map((h: string) => `"${row[h as keyof typeof row] || ''}"`).join(',')
    ).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map((h: string) => `<th>${h}</th>`).join('')}${exportData.map((row: any) => `<tr>${headers.map((h: string) => `<td>${row[h as keyof typeof row] || ''}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-word;charset=utf-8'
    extension = 'doc'
  }

  const fileName = `技术方案_${new Date().toISOString().slice(0, 10)}.${extension}`

  try {
    if ((window as any).showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: exportFormat.value.toUpperCase() + ' Files',
          accept: { [mimeType]: ['.' + extension] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
    } else {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  exportMode.value = false
  selectedRows.value = []
  showExportModal.value = false
}

const handleCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

const handleDeleteClick = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要删除的数据')
    return
  }
  showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
  const selectedIds = techSolutions.value
    .filter((t: any) => selectedRows.value.includes(t.id))
    .map((t: any) => t.id)
  try {
    await deleteSolutions(selectedIds)
  } catch (error) {
    console.error('删除技术方案失败:', error)
    await showAlert('删除失败，请重试')
  }
  showDeleteModal.value = false
  batchDeleteMode.value = false
  selectedRows.value = []
}

const handleOpenCreateModal = () => {
  newPlanForm.value = {
    code: generateCode(),
    title: '',
    crop: '',
    cropCode: '',
    plantingMode: '水培',
    stage: '',
    author: localStorage.getItem('username') || '陆启闯',
    version: 'V1.0',
    content: '',
    planDetailFileName: '',
    relatedBatchCode: '',
  }
  selectedCrop.value = null
  createModalOpen.value = true
}

const openBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    showAlert('请先选择要编辑的数据')
    return
  }
  const selectedTechsData = techSolutions.value.filter((t: any) => selectedRows.value.includes(t.id))
  if (selectedTechsData.length > 0) {
    selectedTechCode.value = selectedTechsData[0].code
  }
  editedTechCodes.value = []
  editedTechs.value = {}
  showBatchEditModal.value = true
}

const saveBatchEdit = async () => {
  try {
    for (const tech of techSolutions.value) {
      const edited = editedTechs.value[tech.code]
      if (edited) {
        await updateSolution(tech.id, {
          solutionTitle: edited.title ?? tech.title,
          cropName: edited.crop ?? tech.crop,
          plantingMode: edited.plantingMode ?? tech.plantingMode,
          stage: edited.stage ?? tech.stage,
          version: edited.version ?? tech.version,
          content: edited.content ?? tech.content,
          relatedBatchCode: tech.relatedBatchCode || '',
          planDetailFileName: tech.planDetailFileName || '',
          priority: tech.priority || 'normal',
          remarks: '',
        })
      }
    }
    const savedCount = editedTechCodes.value.length
    showBatchEditModal.value = false
    batchEditMode.value = false
    selectedRows.value = []
    editedTechCodes.value = []
    editedTechs.value = {}
    await showAlert(`已保存 ${savedCount} 个技术方案的修改`)
  } catch (error) {
    console.error('批量保存失败:', error)
    await showAlert('保存失败，请重试')
  }
}

const cancelBatchEdit = () => {
  showBatchEditModal.value = false
  batchEditMode.value = false
  selectedRows.value = []
  editedTechCodes.value = []
  editedTechs.value = {}
}

const updateEditedField = (code: string, field: string, value: any) => {
  editedTechs.value = {
    ...editedTechs.value,
    [code]: { ...editedTechs.value[code], [field]: value },
  }
  if (!editedTechCodes.value.includes(code)) {
    editedTechCodes.value = [...editedTechCodes.value, code]
  }
}

const handleInputEdit = (code: string, field: string, event: Event) => {
  const target = event.target as HTMLInputElement
  updateEditedField(code, field, target.value)
}

const handleSelectEdit = (code: string, field: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  updateEditedField(code, field, target.value)
}

const onCreateCropChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  newPlanForm.value.crop = target.value
  // 简化作物编码映射
  const cropCodeMap: Record<string, string> = {
    '番茄': 'PD030100400',
    '黄瓜': 'PD020100100',
    '草莓': 'FR010100100',
    '辣椒': 'PD030400700',
  }
  newPlanForm.value.cropCode = cropCodeMap[target.value] || ''
}

const handleCreateFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.docx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        newPlanForm.value.content = event.target?.result as string
        newPlanForm.value.planDetailFileName = file.name
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const handleBatchFileUpload = (code: string) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.docx,.txt'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      updateEditedField(code, 'planDetailFileName', file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        updateEditedField(code, 'content', event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const downloadPlanDetail = (tech: any) => {
  const fileName = tech.planDetailFileName
  const isDocx = fileName.endsWith('.docx')
  const content = `# ${tech.title}\n\n方案编号：${tech.code}\n作物品种：${tech.crop}\n种植模式：${tech.plantingMode}\n适用范围：${tech.stage}\n版本：${tech.version}\n编制人：${tech.author}\n创建日期：${tech.createDate}\n\n---方案内容---\n${tech.content}`
  const blob = new Blob([content], {
    type: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/markdown'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
