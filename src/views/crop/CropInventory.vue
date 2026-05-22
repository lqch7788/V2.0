<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" style="color: white;"><Goods /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">作物库存</h1>
            <p class="text-gray-500">管理采收入库产品的库存状态和预警设置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警信息面板 -->
    <div class="grid grid-cols-5 gap-3">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <el-icon style="color: #dc2626;"><WarningFilled /></el-icon>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alerts.total }}</div>
            <div class="text-xs text-gray-500">预警总数</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <el-icon style="color: #d97706;"><Clock /></el-icon>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alerts.storageTime }}</div>
            <div class="text-xs text-gray-500">存储时间预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <el-icon style="color: #2563eb;"><Bottom /></el-icon>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alerts.lowStock }}</div>
            <div class="text-xs text-gray-500">库存不足预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <el-icon style="color: #9333ea;"><Top /></el-icon>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alerts.highStock }}</div>
            <div class="text-xs text-gray-500">库存过多预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <el-icon style="color: #ea580c;"><InfoFilled /></el-icon>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-900">{{ alerts.expiration }}</div>
            <div class="text-xs text-gray-500">保质期预警</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="bg-white rounded-xl shadow-none border border-gray-100 p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- 搜索框 -->
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <el-input
              v-model="filters.searchText"
              placeholder="搜索产品编码、作物名称、批次号..."
              clearable
              @input="handleSearchInput"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 搜索和重置按钮 -->
        <div class="flex gap-2">
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        <!-- 仓库筛选 -->
        <div class="w-40">
          <el-select v-model="filters.warehouseId" placeholder="全部仓库" clearable @change="handleSearch">
            <el-option label="全部仓库" value="" />
            <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </div>

        <!-- 作物类型筛选 -->
        <div class="w-32">
          <el-select v-model="filters.cropName" placeholder="全部作物" clearable @change="handleSearch">
            <el-option label="全部作物" value="" />
            <el-option v-for="name in cropNames" :key="name" :label="name" :value="name" />
          </el-select>
        </div>

        <!-- 品质等级筛选 -->
        <div class="w-28">
          <el-select v-model="filters.grade" placeholder="全部等级" clearable @change="handleSearch">
            <el-option label="全部等级" value="" />
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
          </el-select>
        </div>

        <!-- 状态筛选 -->
        <div class="w-32">
          <el-select v-model="filters.status" placeholder="全部状态" clearable @change="handleSearch">
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="in_stock" />
            <el-option label="库存不足" value="low_stock" />
            <el-option label="已过期" value="expired" />
            <el-option label="缺货" value="out_of_stock" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">作物库存汇总表</h2>
      <div class="flex gap-2">
        <!-- 默认模式：新增、库存不足、编辑、删除、导出 -->
        <template v-if="!batchEditMode && !deleteMode && !exportMode">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
          <el-button :type="filters.showLowStock ? 'warning' : 'default'" @click="handleLowStockToggle">
            <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-1">{{ lowStockCount }}</span>
            库存不足
          </el-button>
          <el-button type="primary" @click="handleBatchEdit">
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete">
            删除
          </el-button>
          <el-button type="default" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
        <!-- 编辑模式 -->
        <template v-else-if="batchEditMode">
          <el-button type="primary" @click="handleConfirmBatchEdit">
            确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button @click="handleCancelSelection">
            取消
          </el-button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="deleteMode">
          <el-button type="danger" @click="showDeleteWarning = true">
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button @click="handleCancelSelection">
            取消
          </el-button>
        </template>
        <!-- 导出模式 -->
        <template v-else-if="exportMode">
          <el-button type="primary" @click="showExportModal = true">
            <el-icon><Download /></el-icon>
            确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </el-button>
          <el-button @click="handleCancelSelection">
            取消选择
          </el-button>
        </template>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-xl shadow-none overflow-hidden" style="max-height: calc(100vh - 420px); display: flex; flex-direction: column;">
      <!-- 选择操作栏 -->
      <div v-if="exportMode || batchEditMode || deleteMode" class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center gap-4">
          <el-button link type="primary" @click="handleSelectAll">
            {{ isAllSelected ? '全不选' : '全选' }}
          </el-button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 表格容器 -->
      <div style="overflow-x: auto; overflow-y: auto; flex: 1;">
        <table class="w-full" style="min-width: 1400px; table-layout: fixed;">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <el-checkbox v-model="isAllSelected" @change="handleSelectAll" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-36">作物编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">作物品种</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">品种路径</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-16">等级</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">库存数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">库存限值</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-28">存放位置</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-28">入库时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">保质期(天)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-28">过期时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-20">存储时间</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">预警状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">操作人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="displayedData.length === 0">
              <td :colspan="exportMode || batchEditMode || deleteMode ? 16 : 15" class="px-4 py-12 text-center text-gray-500">
                <el-icon :size="48" class="mx-auto mb-3 text-gray-300"><Goods /></el-icon>
                <p>暂无数据</p>
              </td>
            </tr>
            <tr v-for="item in displayedData" :key="item.id" class="hover:bg-blue-50 transition-colors">
              <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 whitespace-nowrap">
                <el-checkbox v-model="selectedRows" :value="item.id" @change="handleSelectRow(item.id)" />
              </td>
              <td
                class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap"
                @click="handleViewDetail(item)"
              >
                {{ generateCropCode(item.cropName, item.variety) || item.productCode }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.cropName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.variety }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getGradeBadgeClass(item.grade)">{{ item.grade }}级</span>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                <span :class="getQuantityClass(item)">
                  {{ item.quantity }} {{ item.unit }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ item.alertSettings.minStock }} ~ {{ item.alertSettings.maxStock }} {{ item.unit }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.warehouseName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">{{ item.storageLocation }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.storageDate }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.alertSettings.expirationDays }} 天</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ item.expirationDate }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getStorageDays(item.storageDate) }} 天</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getAlertBadgeClass(item.status)">
                  {{ getAlertStatusText(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ item.inboundRecords && item.inboundRecords.length > 0 ? item.inboundRecords[item.inboundRecords.length - 1].operator : '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <div class="text-sm text-gray-500">
          共 {{ filteredData.length }} 条记录，第 {{ currentPage }}/{{ totalPages }} 页
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 产品详情弹窗 - 纯div自定义 -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDetailModal = false"></div>
      <!-- 弹窗内容 -->
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 900px; max-height: 90vh; overflow-y: auto;">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><View /></el-icon>
            <h3 class="text-lg font-semibold text-white">产品库存详情</h3>
          </div>
          <el-button circle text @click="showDetailModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <!-- 身体 -->
        <div class="p-6 space-y-6" v-if="selectedInventory">
          <!-- 基本信息卡片 -->
          <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div class="grid grid-cols-4 gap-4">
              <div>
                <span class="text-xs text-emerald-600 block font-medium">作物编码</span>
                <span class="text-lg font-mono font-bold text-emerald-700">{{ generateCropCode(selectedInventory.cropName, selectedInventory.variety) || selectedInventory.productCode }}</span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">作物名称</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedInventory.cropName }}</span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">品种</span>
                <span class="text-sm font-medium text-gray-900">{{ selectedInventory.variety }}</span>
              </div>
              <div>
                <span class="text-xs text-emerald-600 block font-medium">品质等级</span>
                <span :class="getGradeBadgeClass(selectedInventory.grade)">{{ selectedInventory.grade }}级</span>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="grid grid-cols-2 gap-6">
            <!-- 左列 -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">库存信息</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">当前库存</span>
                    <span class="text-sm text-gray-900 font-medium">{{ selectedInventory.quantity }} {{ selectedInventory.unit }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">存储时间</span>
                    <span class="text-sm text-gray-900">{{ getStorageDays(selectedInventory.storageDate) }} 天</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">剩余保质期</span>
                    <span :class="getRemainingDaysClass(selectedInventory.expirationDate)">
                      {{ getRemainingDays(selectedInventory.expirationDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">仓库信息</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">仓库</span>
                    <span class="text-sm text-gray-900">{{ selectedInventory.warehouseName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">存放位置</span>
                    <span class="text-sm text-gray-900 font-mono">{{ selectedInventory.storageLocation }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右列 -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">批次追溯</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">生产计划批次号</span>
                    <span class="text-sm text-gray-900 font-mono">{{ selectedInventory.batchCode }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">种植区域</span>
                    <span class="text-sm text-gray-900">{{ selectedInventory.greenhouseName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">种植模式</span>
                    <span class="text-sm text-gray-900">{{ selectedInventory.plantingMode }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">预警设置</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">存储时间预警</span>
                    <span class="text-sm text-gray-900">
                      {{ selectedInventory.alertSettings.enableStorageTimeAlert ? `>${selectedInventory.alertSettings.storageTimeThreshold}天` : '未启用' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">库存量预警</span>
                    <span class="text-sm text-gray-900">
                      {{ selectedInventory.alertSettings.enableQuantityAlert
                        ? `${selectedInventory.alertSettings.minQuantityThreshold}-${selectedInventory.alertSettings.maxQuantityThreshold}${selectedInventory.unit}`
                        : '未启用' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 入库记录 -->
          <div v-if="selectedInventory.inboundRecords && selectedInventory.inboundRecords.length > 0">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">入库记录</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 border-b border-gray-200">
                    <th class="text-left pb-2">日期</th>
                    <th class="text-left pb-2">数量</th>
                    <th class="text-left pb-2">操作员</th>
                    <th class="text-left pb-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in selectedInventory.inboundRecords" :key="record.id" class="border-b border-gray-100 last:border-0">
                    <td class="py-2 text-gray-900">{{ record.operateDate }}</td>
                    <td class="py-2 text-emerald-600 font-medium">+{{ record.quantity }}</td>
                    <td class="py-2 text-gray-900">{{ record.operatorName }}</td>
                    <td class="py-2 text-gray-500">{{ record.remarks || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 出库记录 -->
          <div v-if="selectedInventory.outboundRecords && selectedInventory.outboundRecords.length > 0">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">出库记录</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-xs text-gray-500 border-b border-gray-200">
                    <th class="text-left pb-2">日期</th>
                    <th class="text-left pb-2">数量</th>
                    <th class="text-left pb-2">操作员</th>
                    <th class="text-left pb-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in selectedInventory.outboundRecords" :key="record.id" class="border-b border-gray-100 last:border-0">
                    <td class="py-2 text-gray-900">{{ record.operateDate }}</td>
                    <td class="py-2 text-red-600 font-medium">-{{ record.quantity }}</td>
                    <td class="py-2 text-gray-900">{{ record.operatorName }}</td>
                    <td class="py-2 text-gray-500">{{ record.remarks || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- 底部 -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <el-button @click="showDetailModal = false">关闭</el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 - 纯div自定义 -->
    <div v-if="showDeleteWarning" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDeleteWarning = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 400px;">
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><WarningFilled /></el-icon>
            <h3 class="text-lg font-semibold text-white">确认删除</h3>
          </div>
          <el-button circle text @click="showDeleteWarning = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-6">
          <p class="text-gray-600">
            确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 条产品库存记录吗？
          </p>
          <p class="text-red-500 text-sm mt-2">此操作不可恢复，请谨慎操作。</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <el-button @click="showDeleteWarning = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmDelete">确认删除</el-button>
        </div>
      </div>
    </div>

    <!-- 导出格式弹窗 - 纯div自定义 -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showExportModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 400px;">
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><Download /></el-icon>
            <h3 class="text-lg font-semibold text-white">导出格式</h3>
          </div>
          <el-button circle text @click="showExportModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-gray-600">
            已选择 <strong>{{ selectedRows.length > 0 ? selectedRows.length : filteredData.length }}</strong> 条记录
          </p>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <el-radio v-model="exportFormat" value="xlsx">Excel格式 (.xlsx)</el-radio>
            </label>
            <label class="flex items-center gap-2">
              <el-radio v-model="exportFormat" value="csv">CSV格式 (.csv)</el-radio>
            </label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <el-button @click="showExportModal = false">取消</el-button>
          <el-button type="primary" @click="handleDoExport">确定导出</el-button>
        </div>
      </div>
    </div>

    <!-- 新增库存弹窗 - 纯div自定义 -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showAddModal = false"></div>
      <div class="relative bg-white rounded-lg shadow-xl" style="width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div class="flex items-center gap-2">
            <el-icon :size="20" style="color: white;"><Plus /></el-icon>
            <h3 class="text-lg font-semibold text-white">新增库存</h3>
          </div>
          <el-button circle text @click="showAddModal = false">
            <el-icon :size="18" style="color: white;"><Close /></el-icon>
          </el-button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
              <el-input v-model="newInventory.cropName" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
              <el-input v-model="newInventory.variety" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质等级</label>
              <el-select v-model="newInventory.grade" placeholder="请选择">
                <el-option label="A级" value="A" />
                <el-option label="B级" value="B" />
                <el-option label="C级" value="C" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
              <el-input v-model.number="newInventory.quantity" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <el-input v-model="newInventory.unit" placeholder="如：kg、个" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">仓库</label>
              <el-select v-model="newInventory.warehouseId" placeholder="请选择">
                <el-option v-for="w in warehouses" :key="w.id" :label="w.name" :value="w.id" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
              <el-input v-model="newInventory.storageLocation" placeholder="如：A-01" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
              <el-input v-model="newInventory.batchCode" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">保质期(天)</label>
              <el-input v-model.number="newInventory.alertSettings.expirationDays" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
              <el-input v-model.number="newInventory.alertSettings.minStock" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最高库存</label>
              <el-input v-model.number="newInventory.alertSettings.maxStock" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
              <el-date-picker
                v-model="newInventory.expirationDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <el-button @click="showAddModal = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAdd">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Goods, Warning, Search, Refresh, Plus, Download, Close, View,
  WarningFilled, Clock, Bottom, Top, InfoFilled
} from '@element-plus/icons-vue'

// 仓库数据
const warehouses = ref([
  { id: 'W001', name: '主仓库' },
  { id: 'W002', name: '副仓库' },
])

// 库存数据类型
const produceInventory = {
  id: '',
  productCode: '',
  cropName: '',
  variety: '',
  grade: 'A',
  quantity: 0,
  unit: 'kg',
  warehouseId: '',
  warehouseName: '',
  storageLocation: '',
  harvestDate: '',
  storageDate: '',
  expirationDate: '',
  batchCode: '',
  greenhouseName: '',
  plantingMode: '',
  alertSettings: {
    enableStorageTimeAlert: false,
    storageTimeThreshold: 0,
    enableQuantityAlert: false,
    minQuantityThreshold: 0,
    maxQuantityThreshold: 0,
    minStock: 0,
    maxStock: 0,
    expirationDays: 0,
  },
  inboundRecords: [],
  outboundRecords: [],
  status: 'in_stock',
}

// 模拟库存数据
const inventoryData = ref([
  {
    id: 'PI001',
    productCode: 'CP20260501001',
    cropName: '番茄',
    variety: '红果番茄',
    grade: 'A',
    quantity: 150,
    unit: 'kg',
    warehouseId: 'W001',
    warehouseName: '主仓库',
    storageLocation: 'A-01',
    harvestDate: '2026-04-15',
    storageDate: '2026-04-16',
    expirationDate: '2026-05-16',
    batchCode: 'PC20260415',
    greenhouseName: '1号大棚',
    plantingMode: '标准种植',
    alertSettings: {
      enableStorageTimeAlert: true,
      storageTimeThreshold: 30,
      enableQuantityAlert: true,
      minQuantityThreshold: 50,
      maxQuantityThreshold: 200,
      minStock: 50,
      maxStock: 200,
      expirationDays: 30,
    },
    inboundRecords: [
      { id: 1, quantity: 150, operatorName: '张三', operateDate: '2026-04-16', remarks: '' },
    ],
    outboundRecords: [],
    status: 'in_stock',
  },
  {
    id: 'PI002',
    productCode: 'CP20260502001',
    cropName: '草莓',
    variety: '红颜',
    grade: 'A',
    quantity: 30,
    unit: 'kg',
    warehouseId: 'W001',
    warehouseName: '主仓库',
    storageLocation: 'A-02',
    harvestDate: '2026-04-20',
    storageDate: '2026-04-21',
    expirationDate: '2026-04-28',
    batchCode: 'PC20260420',
    greenhouseName: '2号大棚',
    plantingMode: '有机种植',
    alertSettings: {
      enableStorageTimeAlert: true,
      storageTimeThreshold: 7,
      enableQuantityAlert: true,
      minQuantityThreshold: 50,
      maxQuantityThreshold: 150,
      minStock: 50,
      maxStock: 150,
      expirationDays: 7,
    },
    inboundRecords: [
      { id: 2, quantity: 80, operatorName: '李四', operateDate: '2026-04-21', remarks: '' },
    ],
    outboundRecords: [
      { id: 1, quantity: 50, operatorName: '王五', operateDate: '2026-04-25', remarks: '销售出库' },
    ],
    status: 'low_stock',
  },
  {
    id: 'PI003',
    productCode: 'CP20260503001',
    cropName: '黄瓜',
    variety: '水果黄瓜',
    grade: 'B',
    quantity: 200,
    unit: 'kg',
    warehouseId: 'W002',
    warehouseName: '副仓库',
    storageLocation: 'B-01',
    harvestDate: '2026-04-10',
    storageDate: '2026-04-11',
    expirationDate: '2026-04-25',
    batchCode: 'PC20260410',
    greenhouseName: '3号大棚',
    plantingMode: '标准种植',
    alertSettings: {
      enableStorageTimeAlert: false,
      storageTimeThreshold: 0,
      enableQuantityAlert: true,
      minQuantityThreshold: 100,
      maxQuantityThreshold: 300,
      minStock: 100,
      maxStock: 300,
      expirationDays: 14,
    },
    inboundRecords: [
      { id: 3, quantity: 200, operatorName: '赵六', operateDate: '2026-04-11', remarks: '' },
    ],
    outboundRecords: [],
    status: 'expired',
  },
])

// 状态
const filters = reactive({
  searchText: '',
  warehouseId: '',
  cropName: '',
  grade: '',
  status: '',
  showLowStock: false,
})

const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const showDetailModal = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const showAddModal = ref(false)
const selectedInventory = ref(null)
const exportFormat = ref('xlsx')

const newInventory = reactive({
  cropName: '',
  variety: '',
  grade: 'A',
  quantity: 0,
  unit: 'kg',
  warehouseId: '',
  storageLocation: '',
  batchCode: '',
  expirationDate: '',
  alertSettings: {
    expirationDays: 30,
    minStock: 0,
    maxStock: 0,
  },
})

// 计算预警统计
const alerts = computed(() => {
  const today = new Date()
  let storageTime = 0
  let lowStock = 0
  let highStock = 0
  let expiration = 0

  inventoryData.value.forEach(item => {
    const storageDays = getStorageDays(item.storageDate)
    const remainingDays = getRemainingDaysValue(item.expirationDate)

    if (item.alertSettings.enableStorageTimeAlert && storageDays > item.alertSettings.storageTimeThreshold) {
      storageTime++
    }
    if (item.alertSettings.enableQuantityAlert && item.quantity < item.alertSettings.minQuantityThreshold) {
      lowStock++
    }
    if (item.alertSettings.enableQuantityAlert && item.quantity > item.alertSettings.maxQuantityThreshold) {
      highStock++
    }
    if (remainingDays < 0) {
      expiration++
    } else if (remainingDays < 7) {
      expiration++
    }
  })

  return {
    total: storageTime + lowStock + highStock + expiration,
    storageTime,
    lowStock,
    highStock,
    expiration,
  }
})

// 低库存数量
const lowStockCount = computed(() => {
  return inventoryData.value.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length
})

// 获取唯一的作物名称列表
const cropNames = computed(() => {
  const names = [...new Set(inventoryData.value.map(item => item.cropName))]
  return names
})

// 筛选后的数据
const filteredData = computed(() => {
  return inventoryData.value.filter(item => {
    // 搜索过滤
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase()
      const cropCode = generateCropCode(item.cropName, item.variety) || ''
      if (
        !cropCode.toLowerCase().includes(search) &&
        !item.productCode.toLowerCase().includes(search) &&
        !item.cropName.toLowerCase().includes(search) &&
        !item.batchCode.toLowerCase().includes(search)
      ) {
        return false
      }
    }

    // 仓库过滤
    if (filters.warehouseId && item.warehouseId !== filters.warehouseId) {
      return false
    }

    // 作物名称过滤
    if (filters.cropName && item.cropName !== filters.cropName) {
      return false
    }

    // 品质等级过滤
    if (filters.grade && item.grade !== filters.grade) {
      return false
    }

    // 状态过滤
    if (filters.status && item.status !== filters.status) {
      return false
    }

    // 库存不足过滤
    if (filters.showLowStock && item.status !== 'low_stock' && item.status !== 'out_of_stock') {
      return false
    }

    return true
  })
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value) || 1)

// 分页数据
const displayedData = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value
  const endIdx = Math.min(startIdx + pageSize.value, filteredData.value.length)
  return filteredData.value.slice(startIdx, endIdx)
})

// 是否全选
const isAllSelected = computed(() => {
  return filteredData.value.length > 0 && selectedRows.value.length === filteredData.value.length
})

// 生成作物编码
function generateCropCode(cropName, variety) {
  const varietyMap = {
    '番茄': { code: 'TO', varieties: { '红果番茄': '01', '粉果番茄': '02' } },
    '草莓': { code: 'ST', varieties: { '红颜': '01', '章姬': '02' } },
    '黄瓜': { code: 'CU', varieties: { '水果黄瓜': '01', '刺黄瓜': '02' } },
  }

  const varietyInfo = varietyMap[cropName]
  if (!varietyInfo) return ''

  const subCode = varietyInfo.varieties[variety] || '00'
  const seq = Math.floor(Math.random() * 999) + 1
  return `${varietyInfo.code}${subCode}${String(seq).padStart(3, '0')}`
}

// 获取存储天数
function getStorageDays(storageDate) {
  return Math.floor((new Date().getTime() - new Date(storageDate).getTime()) / (1000 * 60 * 60 * 24))
}

// 获取剩余保质期天数
function getRemainingDaysValue(expirationDate) {
  return Math.floor((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}

// 获取剩余保质期文本
function getRemainingDays(expirationDate) {
  const days = getRemainingDaysValue(expirationDate)
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  return `${days} 天`
}

// 获取剩余保质期样式
function getRemainingDaysClass(expirationDate) {
  const days = getRemainingDaysValue(expirationDate)
  if (days < 0) return 'text-sm font-medium text-red-600'
  if (days < 7) return 'text-sm font-medium text-amber-600'
  return 'text-sm font-medium text-emerald-600'
}

// 获取数量样式
function getQuantityClass(item) {
  if (item.status === 'low_stock' || item.status === 'out_of_stock') {
    return 'font-medium text-red-600'
  }
  return 'text-gray-900'
}

// 获取等级徽章样式
function getGradeBadgeClass(grade) {
  const config = {
    A: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700',
    B: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
    C: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
  }
  return config[grade] || config.A
}

// 获取预警徽章样式
function getAlertBadgeClass(status) {
  const config = {
    in_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 bg-emerald-100 text-emerald-700',
    low_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 bg-blue-100 text-blue-700',
    expired: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 bg-red-100 text-red-700',
    out_of_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1 bg-gray-100 text-gray-700',
  }
  return config[status] || config.in_stock
}

// 获取预警状态文本
function getAlertStatusText(status) {
  const config = {
    in_stock: '正常',
    low_stock: '库存不足',
    expired: '已过期',
    out_of_stock: '缺货',
  }
  return config[status] || '正常'
}

// 搜索输入处理
function handleSearchInput() {
  currentPage.value = 1
}

// 搜索
function handleSearch() {
  currentPage.value = 1
}

// 重置
function handleReset() {
  filters.searchText = ''
  filters.warehouseId = ''
  filters.cropName = ''
  filters.grade = ''
  filters.status = ''
  filters.showLowStock = false
  currentPage.value = 1
}

// 低库存切换
function handleLowStockToggle() {
  filters.showLowStock = !filters.showLowStock
  currentPage.value = 1
}

// 批量编辑
function handleBatchEdit() {
  selectedRows.value = []
  batchEditMode.value = true
}

// 删除
function handleDelete() {
  deleteMode.value = true
  selectedRows.value = []
}

// 导出
function handleExport() {
  exportMode.value = true
  selectedRows.value = []
}

// 全选
function handleSelectAll() {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = filteredData.value.map(item => item.id)
  }
}

// 选择行
function handleSelectRow(id) {
  // el-checkbox 自动处理
}

// 取消选择
function handleCancelSelection() {
  batchEditMode.value = false
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 确认批量编辑
function handleConfirmBatchEdit() {
  if (selectedRows.value.length > 0) {
    ElMessage.info(`已选择 ${selectedRows.value.length} 条记录进行编辑`)
  }
  batchEditMode.value = false
}

// 确认删除
function handleConfirmDelete() {
  inventoryData.value = inventoryData.value.filter(item => !selectedRows.value.includes(item.id))
  showDeleteWarning.value = false
  deleteMode.value = false
  selectedRows.value = []
  ElMessage.success('删除成功')
}

// 导出处理
function handleDoExport() {
  const selectedData = filteredData.value.filter(item => selectedRows.value.includes(item.id))
  const exportData = selectedData.length > 0 ? selectedData : filteredData.value
  ElMessage.success(`已选择导出 ${exportData.length} 条记录（${exportFormat.value.toUpperCase()}格式）`)
  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
}

// 查看详情
function handleViewDetail(item) {
  selectedInventory.value = item
  showDetailModal.value = true
}

// 新增
function handleAdd() {
  showAddModal.value = true
}

// 保存新增
function handleSaveAdd() {
  if (!newInventory.cropName || !newInventory.variety) {
    ElMessage.warning('请填写必填项')
    return
  }

  const newRecord = {
    id: `PI${String(inventoryData.value.length + 1).padStart(3, '0')}`,
    productCode: `CP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(inventoryData.value.length + 1).padStart(3, '0')}`,
    ...newInventory,
    warehouseName: warehouses.value.find(w => w.id === newInventory.warehouseId)?.name || '',
    storageDate: new Date().toISOString().slice(0, 10),
    harvestDate: new Date().toISOString().slice(0, 10),
    greenhouseName: '',
    plantingMode: '',
    inboundRecords: [],
    outboundRecords: [],
    status: 'in_stock',
  }

  inventoryData.value.unshift(newRecord)
  showAddModal.value = false

  // 重置表单
  newInventory.cropName = ''
  newInventory.variety = ''
  newInventory.grade = 'A'
  newInventory.quantity = 0
  newInventory.unit = 'kg'
  newInventory.warehouseId = ''
  newInventory.storageLocation = ''
  newInventory.batchCode = ''
  newInventory.expirationDate = ''
  newInventory.alertSettings = {
    expirationDays: 30,
    minStock: 0,
    maxStock: 0,
  }

  ElMessage.success('新增成功')
}
</script>

<style scoped>
/* V1.1 样式保持一致 */
</style>
