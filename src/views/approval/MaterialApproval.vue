<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <el-icon :size="24" class="text-white"><Box /></el-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">物料审批</h1>
          <p class="text-gray-500">领料、退料、采购审批流程管理</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - V1.1: bg-[#F2F6FA] -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <el-icon :size="20" class="text-blue-600"><Document /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-xs text-gray-500">总申请数</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <el-icon :size="20" class="text-amber-600"><Clock /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            <!-- P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L181） -->
            <p class="text-xs text-gray-500">待审批</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <el-icon :size="20" class="text-emerald-600"><CircleCheck /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            <p class="text-xs text-gray-500">已通过</p>
          </div>
        </div>
      </div>
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <el-icon :size="20" class="text-red-600"><CircleClose /></el-icon>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            <p class="text-xs text-gray-500">已拒绝</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl p-1 inline-flex shadow-sm">
      <el-button
        v-for="tab in tabs"
        :key="tab.key"
        :type="activeTab === tab.key ? 'primary' : ''"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors', activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100']"
        @click="handleTabChange(tab.key)"
      >
        <el-icon :size="16"><component :is="tab.icon" /></el-icon>
        {{ tab.label }}
      </el-button>
    </div>

    <!-- 筛选区域-->
    <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-8 gap-3 items-end">
        <!-- 领料单号 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">领料单号</label>
          <el-input v-model="searchTerm" placeholder="单号..." clearable />
        </div>

        <!-- 申领人-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">申领人</label>
          <el-input v-model="searchApplicant" placeholder="申请人.." clearable />
        </div>

        <!-- 部门 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">部门</label>
          <!-- P0-MA-003: 部门下拉硬编码 - 审计标记 V1.1 为 free-form，但实际 V1.1 MaterialApprovalFilters.tsx L80-91 也用 Select 硬编码 4 个固定值（生产部/技术部/后勤部/设备部）。V1.1 与 V2.0 行为一致，无需修改。FALSE POSITIVE -->
          <el-select v-model="searchDepartment" placeholder="全部" class="w-full">
            <el-option label="全部" value="全部" />
            <el-option label="生产部" value="生产部" />
            <el-option label="技术部" value="技术部" />
            <el-option label="后勤部" value="后勤部" />
            <el-option label="设备部" value="设备部" />
          </el-select>
        </div>

        <!-- 生产批次-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">生产批次号</label>
          <el-input v-model="searchBatchCode" placeholder="批次号.." clearable />
        </div>

        <!-- 开始日期-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">开始日期</label>
          <el-date-picker
            v-model="searchDateStart"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 结束日期 -->
        <div>
          <label class="text-xs text-gray-700 block mb-1">结束日期</label>
          <el-date-picker
            v-model="searchDateEnd"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 状态-->
        <div>
          <label class="text-xs text-gray-700 block mb-1">状态</label>
          <el-select v-model="statusFilter" placeholder="全部" class="w-full">
            <el-option label="全部" value="全部" />
            <!-- P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L89-91） -->
            <el-option label="待审批" value="待审批" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
          </el-select>
        </div>

        <!-- 按钮区域 -->
        <div class="flex gap-2">
          <el-button type="primary" class="flex-1">搜索</el-button>
          <el-button @click="handleReset" class="flex-1">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表格标题行-->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ currentTabLabel }}</h3>
        <!-- 批量操作按钮 -->
        <div class="flex items-center gap-2">
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-emerald-500 text-white cursor-not-allowed opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            ]"
            size="small"
            @click="handleBatchApprove"
          >
            <el-icon class="mr-1"><CircleCheck /></el-icon>
            批量通过
          </el-button>
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
            ]"
            size="small"
            @click="handleBatchReject"
          >
            <el-icon class="mr-1"><CircleClose /></el-icon>
            批量拒绝
          </el-button>
          <el-button
            :disabled="selectedIds.size === 0"
            :class="[
              selectedIds.size === 0
                ? 'bg-blue-500 text-white cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            ]"
            size="small"
            @click="handleExport"
          >
            <el-icon class="mr-1"><Download /></el-icon>
            批量导出
          </el-button>
        </div>
      </div>

      <!-- 表格内容 -->
      <el-table
        v-loading="loading"
        :data="paginatedData"
        row-class-name="hover:bg-blue-50"
        :expand-row-keys="hasSpecialTable(activeTab) ? expandedRows : []"
        row-key="id"
        class="w-full"
        @expand-change="hasSpecialTable(activeTab) && handleExpandChange($event)"
      >
        <!-- 领料审批表格 -->
        <template v-if="activeTab === 'material'">
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                text
                @click="handleToggleSelect(row.id)"
              >
                <el-icon :size="16" :class="selectedIds.has(row.id) ? 'text-emerald-600' : 'text-gray-400'">
                  <component :is="selectedIds.has(row.id) ? 'Check' : 'CirclePlus'" />
                </el-icon>
              </el-button>
              <span v-else class="w-4 h-4 block"></span>
            </template>
          </el-table-column>
          <el-table-column type="expand" width="50">
            <template #default="props">
              <div class="p-4 bg-gray-50">
                <div class="font-medium text-blue-800 mb-2">物料明细</div>
                <el-table :data="props.row.materials" size="small" class="mb-3">
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="materialName" label="物料名称" />
                  <el-table-column prop="spec" label="规格" />
                  <el-table-column prop="unit" label="单位" width="80" />
                  <el-table-column prop="requestedQuantity" label="申领数量" width="100" />
                  <el-table-column prop="stockQuantity" label="当前库存" width="100" />
                  <el-table-column prop="unitPrice" label="单价(元)" width="100">
                    <template #default="scope">
                      {{ scope.row.unitPrice != null ? scope.row.unitPrice.toFixed(2) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="小计(元)" width="100">
                    <template #default="scope">
                      {{ scope.row.unitPrice != null ? (scope.row.requestedQuantity * scope.row.unitPrice).toFixed(2) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="warehousePosition" label="仓库货位" />
                  <el-table-column prop="remark" label="备注" />
                </el-table>
                <div v-if="props.row.description" class="text-gray-600 mt-3">
                  <span class="font-medium">申请说明：</span>{{ props.row.description }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="领料单号" width="150">
            <template #default="scope">
              <el-link type="primary" :underline="false" class="font-medium">{{ scope.row.code }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="applyDate" label="申请日期" width="120" />
          <el-table-column prop="applicantName" label="申请人" width="100" />
          <el-table-column prop="applicantDepartment" label="部门" width="100" />
          <el-table-column prop="warehouseLocation" label="库存地点" width="120" />
          <el-table-column label="物料种类" width="100">
            <template #default="scope">
              {{ scope.row.materials?.length > 0 ? `${scope.row.materials.length}种` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="plantArea" label="种植区域/用地" width="120" />
          <el-table-column label="审核人" width="100">
            <template #default="scope">
              {{ scope.row.approvers?.[0]?.userName || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="batchCode" label="生产计划批次号" width="150" />
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="备注" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="success"
                  size="small"
                  @click="handleApprove(scope.row)"
                  title="通过"
                >
                  <el-icon><CircleCheck /></el-icon>
                </el-button>
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="danger"
                  size="small"
                  @click="handleRejectClick(scope.row)"
                  title="拒绝"
                >
                  <el-icon><CircleClose /></el-icon>
                </el-button>
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleViewDetail(scope.row)"
                  title="查看详情"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </template>

        <!-- 退料审批表-->
        <template v-else-if="activeTab === 'return'">
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                text
                @click="handleToggleSelect(row.id)"
              >
                <el-icon :size="16" :class="selectedIds.has(row.id) ? 'text-emerald-600' : 'text-gray-400'">
                  <component :is="selectedIds.has(row.id) ? 'Check' : 'CirclePlus'" />
                </el-icon>
              </el-button>
              <span v-else class="w-4 h-4 block"></span>
            </template>
          </el-table-column>
          <el-table-column type="expand" width="50">
            <template #default="props">
              <div class="p-4 bg-gray-50">
                <div class="font-medium text-blue-800 mb-2">退料物料明细</div>
                <el-table :data="props.row.materials" size="small" class="mb-3">
                  <el-table-column prop="sourceApplicationCode" label="来源领料单号" width="140" />
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="category" label="物料分类" />
                  <el-table-column prop="materialName" label="物料名称" />
                  <el-table-column prop="spec" label="规格" />
                  <el-table-column prop="unit" label="单位" width="80" />
                  <el-table-column label="退料数量" width="100">
                    <template #default="scope">
                      {{ scope.row.returnQuantity || scope.row.requestedQuantity || 0 }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="unitPrice" label="单价(元)" width="100">
                    <template #default="scope">
                      {{ scope.row.unitPrice != null ? scope.row.unitPrice.toFixed(2) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="小计(元)" width="100">
                    <template #default="scope">
                      {{ scope.row.unitPrice != null ? ((scope.row.returnQuantity || scope.row.requestedQuantity || 0) * scope.row.unitPrice).toFixed(2) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="warehousePosition" label="仓库货位" />
                  <el-table-column prop="reason" label="退料原因" />
                </el-table>
                <div v-if="props.row.description" class="text-gray-600 mt-3">
                  <span class="font-medium">退料说明：</span>{{ props.row.description }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="退料单号" width="150">
            <template #default="scope">
              <el-link type="primary" :underline="false" class="font-medium">{{ scope.row.code }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="applyDate" label="退料日期" width="120" />
          <el-table-column label="退料类型" width="100">
            <template #default="scope">
              {{ getReturnType(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="applicantName" label="申请人" width="100" />
          <el-table-column prop="applicantDepartment" label="退料部门" width="100" />
          <el-table-column prop="warehouseLocation" label="仓库位置" width="120" />
          <el-table-column label="审批状态" width="120">
            <template #default="scope">
              <el-tag :type="getReturnStatusTagType(scope.row.status)" size="small">
                {{ getReturnStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核人" width="100">
            <template #default="scope">
              {{ scope.row.approvers?.[0]?.userName || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="备注" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="success"
                  size="small"
                  @click="handleApprove(scope.row)"
                  title="通过"
                >
                  <el-icon><CircleCheck /></el-icon>
                </el-button>
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="danger"
                  size="small"
                  @click="handleRejectClick(scope.row)"
                  title="拒绝"
                >
                  <el-icon><CircleClose /></el-icon>
                </el-button>
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleViewDetail(scope.row)"
                  title="查看详情"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </template>

        <!-- 采购审批表格 - P0-MA-001: 'purchase' Tab 已从 tabs 移除（V2.0 自我创造），此块为死代码
             TODO-P0-EX-MA: 列待确认 - 采购审批专属表格是否需要在 ProductionApproval 中复用？
             若需要，可迁移到 ProductionApproval.vue。-->
        <!--
        <template v-else-if="activeTab === 'purchase'">
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                text
                @click="handleToggleSelect(row.id)"
              >
                <el-icon :size="16" :class="selectedIds.has(row.id) ? 'text-emerald-600' : 'text-gray-400'">
                  <component :is="selectedIds.has(row.id) ? 'Check' : 'CirclePlus'" />
                </el-icon>
              </el-button>
              <span v-else class="w-4 h-4 block"></span>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="计划编号" width="150" />
          <el-table-column prop="title" label="计划名称" />
          <el-table-column label="类型" width="100">
            <template #default="scope">
              {{ scope.row.businessLink?.items?.[0]?.materialName ? '物资' : '生产物资' }}
            </template>
          </el-table-column>
          <el-table-column prop="applicantName" label="申请人" width="100" />
          <el-table-column prop="applyDate" label="申请日期" width="120" />
          <el-table-column prop="amount" label="总金额" width="120">
            <template #default="scope">
              <span class="font-medium">{{ scope.row.amount || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="供应商" width="120">
            <template #default="scope">
              {{ scope.row.businessLink?.items?.[0]?.supplier || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="交货日期" width="120">
            <template #default="scope">
              {{ scope.row.businessLink?.expectedDeliveryDate || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80">
            <template #default="scope">
              <el-tag
                :type="scope.row.priority === 'urgent' ? 'danger' : scope.row.priority === 'high' ? 'warning' : scope.row.priority === 'normal' ? 'primary' : 'info'"
                size="small"
              >
                {{ scope.row.priority === 'urgent' ? '紧急' : scope.row.priority === 'high' ? '高' : scope.row.priority === 'normal' ? '普通' : '低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="success"
                  size="small"
                  @click="handleApprove(scope.row)"
                  title="通过"
                >
                  <el-icon><CircleCheck /></el-icon>
                </el-button>
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="danger"
                  size="small"
                  @click="handleRejectClick(scope.row)"
                  title="拒绝"
                >
                  <el-icon><CircleClose /></el-icon>
                </el-button>
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleViewDetail(scope.row)"
                  title="查看详情"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </template>
        -->

        <!-- 通用表格（物料入库库存调拨/种源入库/育苗计划/种植计划/订单管理/补录审批-->
        <template v-else>
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                text
                @click="handleToggleSelect(row.id)"
              >
                <el-icon :size="16" :class="selectedIds.has(row.id) ? 'text-emerald-600' : 'text-gray-400'">
                  <component :is="selectedIds.has(row.id) ? 'Check' : 'CirclePlus'" />
                </el-icon>
              </el-button>
              <span v-else class="w-4 h-4 block"></span>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="审批单号" width="150">
            <template #default="scope">
              <el-link type="primary" :underline="false" class="font-medium">{{ scope.row.code }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="150" />
          <el-table-column prop="applicantName" label="申请人" width="100" />
          <el-table-column prop="applicantDepartment" label="部门" width="100" />
          <el-table-column prop="applyDate" label="申请时间" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="success"
                  size="small"
                  @click="handleApprove(scope.row)"
                  title="通过"
                >
                  <el-icon><CircleCheck /></el-icon>
                </el-button>
                <el-button
                  v-if="scope.row.status === 'pending' && canApprove"
                  text
                  type="danger"
                  size="small"
                  @click="handleRejectClick(scope.row)"
                  title="拒绝"
                >
                  <el-icon><CircleClose /></el-icon>
                </el-button>
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleViewDetail(scope.row)"
                  title="查看详情"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 空状态-->
      <div v-if="filteredData.length === 0" class="p-12 text-center text-gray-500">
        <el-icon :size="48" class="text-gray-300 mb-3"><Clipboard /></el-icon>
        <p>暂无审批记录</p>
        <p class="text-sm text-gray-400 mt-2">在领料退料采购页面提交申请后，这里将显示审批列表</p>
      </div>

      <!-- 分页 -->
      <div v-if="filteredData.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">
          共{{ filteredData.length }} 条记录，第{{ currentPage }}/{{ totalPages || 1 }}页
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailModal.show"
      :title="`${activeTab === 'return' ? '退料单' : '领料单'}详情`"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="detailModal.item" class="space-y-6">
        <!-- 基本信息 -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label class="text-xs text-gray-500 block">单号</label>
            <p class="font-mono font-semibold text-gray-900">{{ detailModal.item.code }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">申请日期</label>
            <p class="font-semibold text-gray-900">{{ detailModal.item.applyDate }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">状态</label>
            <el-tag :type="getStatusTagType(detailModal.item.status)" size="small">
              {{ getStatusText(detailModal.item.status) }}
            </el-tag>
            <p v-if="detailModal.item.status === 'rejected' && detailModal.item.records && detailModal.item.records.length > 0" class="text-xs text-red-600 mt-1">
              拒绝原因：{{ detailModal.item.records[detailModal.item.records.length - 1]?.comment || '-' }}
            </p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">申请人</label>
            <p class="font-semibold text-gray-900">{{ detailModal.item.applicantName }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">部门</label>
            <p class="font-semibold text-gray-900">{{ detailModal.item.applicantDepartment }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block">审核人</label>
            <p class="font-semibold text-gray-900">{{ detailModal.item.approvers?.[0]?.userName || '-' }}</p>
          </div>
          <template v-if="activeTab === 'material' && detailModal.item.businessLink">
            <div>
              <label class="text-xs text-gray-500 block">库存地点</label>
              <p class="font-semibold text-gray-900">{{ detailModal.item.businessLink?.warehouseLocation || '-' }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">生产计划批次号</label>
              <p class="font-semibold text-gray-900">{{ detailModal.item.businessLink?.batchCode || '-' }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">物料种类</label>
              <p class="font-semibold text-gray-900">
                {{ detailModal.item.materials?.length > 0 ? `${detailModal.item.materials.length}种` : '-' }}
              </p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block">种植区域/用地</label>
              <p class="font-semibold text-gray-900">{{ detailModal.item.businessLink?.plantArea || '-' }}</p>
            </div>
          </template>
        </div>

        <!-- 描述/说明 -->
        <div v-if="detailModal.item.description" class="mb-6">
          <label class="text-xs text-gray-500 block mb-1">申请说明</label>
          <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{{ detailModal.item.description }}</p>
        </div>

        <!-- 物料明细 -->
        <div class="mb-6">
          <label class="text-xs text-gray-500 block mb-2">
            {{ activeTab === 'return' ? '退料单' : '领料单' }}物料明细
          </label>
          <el-table v-if="detailModal.item.materials?.length > 0" :data="detailModal.item.materials" size="small">
            <el-table-column prop="materialCode" label="物料编码" width="120">
              <template #default="scope">
                <span class="text-blue-700 font-mono">{{ scope.row.materialCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="materialName" label="物料名称">
              <template #default="scope">
                <span class="text-blue-700">{{ scope.row.materialName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="物料分类" width="120">
              <template #default="scope">
                {{ getCategoryByCode(scope.row.materialCode) }}
              </template>
            </el-table-column>
            <el-table-column prop="spec" label="规格" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column label="数量" width="80">
              <template #default="scope">
                {{ scope.row.requestedQuantity || scope.row.returnQuantity }}
              </template>
            </el-table-column>
            <el-table-column prop="approvedQuantity" label="已批数量" width="80">
              <template #default="scope">
                {{ scope.row.approvedQuantity || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">暂无物料明细</div>
        </div>

        <!-- 审批记录 -->
        <div v-if="detailModal.item.records && detailModal.item.records.length > 0" class="mb-6">
          <label class="text-xs text-gray-500 block mb-2">审批记录</label>
          <div class="space-y-2">
            <div v-for="(r, idx) in detailModal.item.records" :key="idx" class="bg-gray-50 rounded-lg p-3 text-sm">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-700">{{ r.approverName }}</span>
                <el-tag
                  :type="r.action === 'approve' ? 'success' : r.action === 'reject' ? 'danger' : 'info'"
                  size="small"
                >
                  {{ r.action === 'approve' ? '通过' : r.action === 'reject' ? '拒绝' : '部分通过' }}
                </el-tag>
              </div>
              <p v-if="r.comment" class="text-gray-600 mt-1">原因：{{ r.comment }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ r.actionTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="detailModal.show = false">关闭</el-button>
          <template v-if="detailModal.item?.status === 'pending'">
            <el-button type="primary" @click="handleApprove(detailModal.item)">通过</el-button>
            <el-button type="danger" @click="handleRejectClick(detailModal.item)">拒绝</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝原因弹窗 -->
    <el-dialog
      v-model="rejectModal.show"
      title="拒绝审批"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="rejectModal.item">
        <p class="text-sm text-gray-600 mb-2">
          确定要拒绝「<span class="font-medium text-gray-900">{{ rejectModal.item.title }}</span>」吗？
        </p>
        <p class="text-xs text-gray-500 mb-4">拒绝后，申请人可以在领料页面修改料单后重新提交审批</p>
        <div class="mb-4">
          <label class="text-xs text-gray-700 block mb-1">拒绝原因（必填）</label>
          <el-input
            v-model="rejectModal.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因.."
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="rejectModal.show = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmReject">确认拒绝</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  Box,
  DocumentCopy,
  Clock,
  CircleCheck,
  CircleClose,
  RefreshRight,
  View,
  RefreshLeft,
  ShoppingCart,
  Goods,
  Crop,
  Document,
  Tickets,
  EditPen,
  Orange,
  Download,
  Check,
  CirclePlus,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApprovalStore } from '@/stores/modules/approval'
import { storeToRefs } from 'pinia'

// 审批Store
const approvalStore = useApprovalStore()
const { approvals } = storeToRefs(approvalStore)

// 审批类型常量（与V1.1对齐
const ApprovalType = {
  MATERIAL_REQUEST: 'material_request',
  RETURN_MATERIAL: 'return_material',
  PURCHASE_REQUEST: 'purchase_request',
  MATERIAL_INBOUND: 'material_inbound',
  MATERIAL_TRANSFER: 'material_transfer',
  SEED_SOURCE_INBOUND: 'seed_source_inbound',
  SEEDLING_PLAN: 'seedling_plan',
  PLANTING_PLAN: 'planting_plan',
  ORDER_CREATE: 'order_create',
  ORDER_CHANGE: 'order_change',
  SEED_SOURCE_SUPPLEMENTARY: 'seed_source_supplementary',
  SEEDLING_SUPPLEMENTARY: 'seedling_supplementary',
  CROP_STORAGE_SUPPLEMENTARY: 'crop_storage_supplementary',
}

// Tab配置：与V1.1 useMaterialApproval hook L64-71 完全对齐 6 Tab
// 修复 P0-MA-001：恢复 V1.1 6 Tab 配置（V2.0 多了 4 个：采购审批/育苗计划/种植计划/订单管理）
// 备注：以下 4 个 Tab 为 V2.0 P0-EX 自我创造，**不直接删除**（避免破坏 V1.1 数据流与生产依赖），
// 用注释保留，TODO 待确认。后续专项整改时再决定去留。
// TODO-P0-EX-MA: 列待确认 - 采购审批/育苗计划/种植计划/订单管理 是否保留？
//   - 采购审批: 实际归 ProductionApproval 处理（Purchase Tab 已在生产审批页）
//   - 育苗计划/种植计划/订单管理: 实际归其他业务页（Production/Order），非本页面职责
//   结论: 应全部移除，迁移到对应业务页或 ProductionApproval
const tabs = [
  { key: 'material', label: '领料审批', icon: Document, types: [ApprovalType.MATERIAL_REQUEST] },
  { key: 'return', label: '退料审批', icon: RefreshLeft, types: [ApprovalType.RETURN_MATERIAL] },
  // TODO-P0-EX-MA: { key: 'purchase', label: '采购审批', icon: ShoppingCart, types: [ApprovalType.PURCHASE_REQUEST] },  // 列待确认
  { key: 'material_inbound', label: '物料入库', icon: Goods, types: [ApprovalType.MATERIAL_INBOUND] },
  { key: 'material_transfer', label: '库存调拨', icon: RefreshRight, types: [ApprovalType.MATERIAL_TRANSFER] },
  { key: 'seed_inbound', label: '种源入库', icon: Box, types: [ApprovalType.SEED_SOURCE_INBOUND] },
  // TODO-P0-EX-MA: { key: 'seedling', label: '育苗计划', icon: Orange, types: [ApprovalType.SEEDLING_PLAN] },  // 列待确认
  // TODO-P0-EX-MA: { key: 'planting', label: '种植计划', icon: Crop, types: [ApprovalType.PLANTING_PLAN] },  // 列待确认
  // TODO-P0-EX-MA: { key: 'order', label: '订单管理', icon: Tickets, types: [ApprovalType.ORDER_CREATE, ApprovalType.ORDER_CHANGE] },  // 列待确认
  { key: 'supplementary', label: '补录审批', icon: EditPen, types: [ApprovalType.SEED_SOURCE_SUPPLEMENTARY, ApprovalType.SEEDLING_SUPPLEMENTARY, ApprovalType.CROP_STORAGE_SUPPLEMENTARY] },
]

// 仅前2个Tab有专用表格列（领料/退料，专用列名/扩展明细）
// P0-MA-001: 'purchase' 已在 tabs 中移除（V2.0 自我创造，详见 tabs 配置 TODO）
const hasSpecialTable = (tab) => ['material', 'return'].includes(tab)

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
})

// 筛选状态
const activeTab = ref('material')
const searchTerm = ref('')
const statusFilter = ref('全部')
const searchApplicant = ref('')
const searchBatchCode = ref('')
const searchDepartment = ref('全部')
const searchDateStart = ref('')
const searchDateEnd = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = 10

// 展开行状态
const expandedRows = ref([])

// 详情弹窗状态
const detailModal = reactive({
  show: false,
  item: null,
})

// 拒绝原因弹窗状态
const rejectModal = reactive({
  show: false,
  item: null,
  reason: '',
})

// 权限
const canApprove = true
const loading = ref(false)

// 批量选择
const selectedIds = ref(new Set())

// 切换选择
const handleToggleSelect = (id) => {
  const newSelected = new Set(selectedIds.value)
  if (newSelected.has(id)) {
    newSelected.delete(id)
  } else {
    newSelected.add(id)
  }
  selectedIds.value = newSelected
}

// 更新统计数据
const updateStats = () => {
  stats.total = getCurrentData.value.length
  stats.pending = getCurrentData.value.filter(d => d.status === 'pending').length
  stats.approved = getCurrentData.value.filter(d => d.status === 'approved').length
  stats.rejected = getCurrentData.value.filter(d => d.status === 'rejected').length
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量通过 ${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success',
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchApprove(ids)
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批通过成功')
  } catch {}
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedIds.value.size === 0) return
  try {
    await ElMessageBox.confirm(`确定要批量拒绝${selectedIds.value.size} 项审批吗？`, '批量审核确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const ids = Array.from(selectedIds.value)
    await approvalStore.batchReject(ids, '批量拒绝')
    await approvalStore.fetchApprovals()
    selectedIds.value = new Set()
    updateStats()
    ElMessage.success('批量审批拒绝成功')
  } catch {}
}

// 批量导出
const handleExport = () => {
  if (selectedIds.value.size === 0) return
  const selectedData = paginatedData.value.filter(d => selectedIds.value.has(d.id))
  const exportData = selectedData.map(d => ({
    单号: d.code,
    标题: d.title,
    申请人: d.applicantName,
    部门: d.applicantDepartment,
    申请时间: d.applyDate,
    状态: getStatusText(d.status),
  }))
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `物料审批_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 当前Tab标签
const currentTabLabel = computed(() => {
  return tabs.find(t => t.key === activeTab.value)?.label || ''
})

// 根据Tab类型筛选数据
const getCurrentData = computed(() => {
  const currentTab = tabs.find(t => t.key === activeTab.value)
  if (!currentTab || !currentTab.types) return []
  return approvals.value.filter(a => currentTab.types.includes(a.type))
})

// 筛选数据
const filteredData = computed(() => {
  return getCurrentData.value.filter(item => {
    const matchSearch =
      item.title?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.applicantName?.includes(searchTerm.value) ||
      item.code?.includes(searchTerm.value)
    const matchStatus =
      statusFilter.value === '全部' ||
      // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L89-91）
      (statusFilter.value === '待审批' && item.status === 'pending') ||
      (statusFilter.value === '已通过' && item.status === 'approved') ||
      (statusFilter.value === '已拒绝' && item.status === 'rejected')
    const matchApplicant = !searchApplicant.value || item.applicantName?.includes(searchApplicant.value)
    const matchBatchCode = !searchBatchCode.value || item.businessLink?.batchCode?.toLowerCase().includes(searchBatchCode.value.toLowerCase())
    const matchDepartment = searchDepartment.value === '全部' || item.applicantDepartment === searchDepartment.value
    let matchDate = true
    if (searchDateStart.value && item.applyDate) {
      matchDate = matchDate && item.applyDate >= searchDateStart.value
    }
    if (searchDateEnd.value && item.applyDate) {
      matchDate = matchDate && item.applyDate <= searchDateEnd.value
    }
    return matchSearch && matchStatus && matchApplicant && matchBatchCode && matchDepartment && matchDate
  })
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

// Tab切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  expandedRows.value = []
  selectedIds.value = new Set()
  updateStats()
}

// 展开行
const handleExpandChange = (row) => {
  const idx = expandedRows.value.indexOf(row.id)
  if (idx > -1) {
    expandedRows.value.splice(idx, 1)
  } else {
    expandedRows.value.push(row.id)
  }
}

// 重置筛选
const handleReset = () => {
  searchTerm.value = ''
  searchApplicant.value = ''
  searchDepartment.value = '全部'
  searchBatchCode.value = ''
  searchDateStart.value = ''
  searchDateEnd.value = ''
  statusFilter.value = '全部'
  currentPage.value = 1
}

// 查看详情
const handleViewDetail = (item) => {
  detailModal.item = item
  detailModal.show = true
}

// 拒绝点击
const handleRejectClick = (item) => {
  rejectModal.item = item
  rejectModal.reason = ''
  rejectModal.show = true
}

// 确认拒绝
const handleConfirmReject = async () => {
  if (!rejectModal.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  const item = rejectModal.item
  if (item) {
    // ✅ 修复 P0: 检查 reject 返回值，false 时显示错误
    const success = await approvalStore.reject(item.id, rejectModal.reason)
    if (!success) {
      ElMessage.error(approvalStore.error || '审批拒绝失败')
      return
    }
    await approvalStore.fetchApprovals()
    ElMessage.success('已拒绝该申请')
  }
  rejectModal.show = false
  detailModal.show = false
}

// 通过审批
const handleApprove = async (item) => {
  try {
    await ElMessageBox.confirm(`确定要通过「${item.title}」吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // ✅ 修复 P0: 检查 approve 返回值，false 时不显示"已通过"提示
    const success = await approvalStore.approve(item.id)
    if (!success) {
      ElMessage.error(approvalStore.error || '审批通过失败')
      return
    }
    await approvalStore.fetchApprovals()
    ElMessage.success('已通过该申请')
    detailModal.show = false
  } catch (err) {
    // 用户取消
  }
}

// 物料分类辅助函数
const getCategoryByCode = (code) => {
  const prefix = code.substring(0, 2)
  const categoryMap = {
    'SP': '种质资源',
    'EQ': '农业机械',
    'OP': '劳保与防护用品',
    'PH': '采收容器',
    'IT': '监测设备',
  }
  if (prefix === 'SP') {
    const subPrefix = code.substring(2, 4)
    if (subPrefix === '02') return '肥料与土壤改良剂'
    if (subPrefix === '03') return '农药与植保产品'
    if (subPrefix === '01') return '种质资源'
  }
  return categoryMap[prefix] || '其他'
}

// 状态显示
const getStatusText = (status) => {
  const statusMap = {
    approved: '已通过',
    rejected: '已拒绝',
    // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L199-200）
    pending: '待审批',
    cancelled: '已取消',
    draft: '草稿',
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
    cancelled: 'info',
    draft: 'info',
  }
  return typeMap[status] || 'info'
}

// 退料状态显示
const getReturnStatusText = (status) => {
  const statusMap = {
    approved: '已完成',
    rejected: '已驳回',
    // P0-MA-002: "待审核" → "待审批"（V1.1 useMaterialApproval hook L216）
    pending: '待审批',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getReturnStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
    cancelled: 'info',
  }
  return typeMap[status] || 'info'
}

// 退料类型映射
const getReturnType = (item) => {
  if (item.businessLink?.warehouseLocation) return '生产退料'
  if (item.description?.includes('品质退料')) return '品质退料'
  if (item.description?.includes('试制退料')) return '试制退料'
  return '生产退料'
}

// 监听分页变化
watch(currentPage, () => {
  expandedRows.value = []
})

// 初始加载 - 从API加载数据
onMounted(async () => {
  await approvalStore.fetchApprovals()
  updateStats()
})
</script>
