<template>
  <div class="space-y-6">
    <!-- 页面标题卡片 - 对齐V1.1 InventoryFilter/InventoryTable 风格（rounded-xl shadow-sm） -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Package class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">作物库存</h1>
          <p class="text-gray-500">管理采收入库产品的库存状态、出入库与全链路追溯</p>
        </div>
      </div>
    </div>

    <!-- 预警信息面板 - 对齐V1.1 InventoryStats 4 卡（grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-red-600" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900 tabular-nums">{{ alerts.total }}</div>
            <div class="text-xs text-gray-500">预警总数</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock class="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900 tabular-nums">{{ alerts.storageTime }}</div>
            <div class="text-xs text-gray-500">存储时间预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingDown class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900 tabular-nums">{{ alerts.lowStock }}</div>
            <div class="text-xs text-gray-500">库存不足预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900 tabular-nums">{{ alerts.highStock }}</div>
            <div class="text-xs text-gray-500">库存过多预警</div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Info class="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div class="text-xl font-bold text-gray-900 tabular-nums">{{ alerts.expiration }}</div>
            <div class="text-xs text-gray-500">保质期预警</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 - 对齐V1.1 InventoryFilter (bg-white rounded-xl p-4 shadow-sm border border-gray-100) -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex flex-wrap items-end gap-4">
        <!-- 搜索框 - 对齐V1.1 (pl-10 左侧Search icon) -->
        <div class="flex-1 min-w-[200px]">
          <label class="text-gray-700 text-sm font-medium block mb-1">关键词搜索</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="filters.searchText"
              type="text"
              placeholder="搜索产品编码、作物名称、批次号..."
              class="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              @input="handleSearchInput"
            />
          </div>
        </div>

        <!-- 仓库筛选 -->
        <div class="w-40">
          <label class="text-gray-700 text-sm font-medium block mb-1">仓库</label>
          <select
            v-model="filters.warehouseId"
            class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            @change="handleSearch"
          >
            <option value="">全部仓库</option>
            <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>

        <!-- 作物类型筛选 -->
        <div class="w-32">
          <label class="text-gray-700 text-sm font-medium block mb-1">作物</label>
          <select
            v-model="filters.cropName"
            class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            @change="handleSearch"
          >
            <option value="">全部作物</option>
            <option v-for="name in cropNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>

        <!-- 品质等级筛选 -->
        <div class="w-28">
          <label class="text-gray-700 text-sm font-medium block mb-1">等级</label>
          <select
            v-model="filters.grade"
            class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            @change="handleSearch"
          >
            <option value="">全部等级</option>
            <option value="A">A级</option>
            <option value="B">B级</option>
            <option value="C">C级</option>
          </select>
        </div>

        <!-- 状态筛选 -->
        <div class="w-32">
          <label class="text-gray-700 text-sm font-medium block mb-1">状态</label>
          <select
            v-model="filters.status"
            class="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
            @change="handleSearch"
          >
            <option value="">全部状态</option>
            <option value="in_stock">正常</option>
            <option value="low_stock">库存不足</option>
            <option value="expired">已过期</option>
            <option value="out_of_stock">缺货</option>
          </select>
        </div>

        <!-- 重置 + 刷新按钮（对齐V1.1 InventoryFilter 末尾） -->
        <button
          class="h-10 px-3 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1"
          @click="handleReset"
        >
          <RefreshCw class="w-4 h-4" />重置
        </button>
      </div>
    </div>

    <!-- 工具栏（对齐V1.1 ActionToolbar 风格） -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">作物库存汇总表</h2>
      <div class="flex gap-2">
        <!-- 默认模式：新增、库存不足、编辑、删除、导出 -->
        <template v-if="!batchEditMode && !deleteMode && !exportMode">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1" @click="handleAdd">
            <Plus class="w-4 h-4" />新增
          </button>
          <button
            class="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-1"
            :class="filters.showLowStock ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'"
            @click="handleLowStockToggle"
          >
            <span v-if="lowStockCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{{ lowStockCount }}</span>
            库存不足
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1" @click="handleBatchEdit">
            <Edit class="w-4 h-4" />编辑
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1" @click="handleDelete">
            <Trash2 class="w-4 h-4" />删除
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1" @click="handleExport">
            <Download class="w-4 h-4" />导出
          </button>
        </template>
        <!-- 编辑模式 -->
        <template v-else-if="batchEditMode">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleConfirmBatchEdit">
            确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleCancelSelection">取消</button>
        </template>
        <!-- 删除模式 -->
        <template v-else-if="deleteMode">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="showDeleteWarning = true">
            确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleCancelSelection">取消</button>
        </template>
        <!-- 导出模式 -->
        <template v-else-if="exportMode">
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1" @click="showExportModal = true">
            <Download class="w-4 h-4" />确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
          </button>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="handleCancelSelection">取消选择</button>
        </template>
      </div>
    </div>

    <!-- 数据表格 - 对齐V1.1 InventoryTable (bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 选择操作栏 -->
      <div v-if="exportMode || batchEditMode || deleteMode" class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-4">
          <button class="text-sm text-blue-600 hover:text-blue-800 hover:underline" @click="handleSelectAll">
            {{ isAllSelected ? '全不选' : '全选' }}
          </button>
          <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="overflow-auto max-h-[calc(100vh-420px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="w-4 h-4 rounded border-white"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">实例ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物编码</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">作物信息</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">品质</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">采收区域</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">种植模式</th>
              <th class="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap">数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单位</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">仓库</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">来源</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="displayedData.length === 0">
              <td :colspan="exportMode || batchEditMode || deleteMode ? 15 : 14" class="px-4 py-8 text-center text-gray-500">
                <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>暂无库存数据</p>
              </td>
            </tr>
            <tr v-for="item in displayedData" :key="item.id" class="hover:bg-emerald-50 transition-colors">
              <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedRows.includes(item.id)"
                  class="w-4 h-4 rounded border-gray-400"
                  @change="toggleRow(item.id)"
                />
              </td>
              <td class="px-4 py-3 text-sm font-mono whitespace-nowrap">
                <button
                  type="button"
                  @click="handleViewDetail(item)"
                  class="text-blue-600 hover:text-blue-800 hover:underline font-mono"
                  title="点击查看详情"
                >
                  {{ item.instanceId || item.id }}
                </button>
              </td>
              <td class="px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                {{ generateCropCode(item.cropName, item.variety) || item.productCode }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">成品</span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900 truncate max-w-xs">{{ item.cropName || '-' }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs" :title="item.variety">{{ item.variety || '-' }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getGradeBadgeClass(item.grade)">{{ item.grade }}级</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs" :title="item.greenhouseName">
                {{ item.greenhouseName || '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ item.plantingMode || '-' }}
              </td>
              <td class="px-4 py-3 text-sm font-medium text-right text-emerald-600 whitespace-nowrap">
                {{ item.quantity }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ item.unit || '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-xs" :title="item.warehouseName">
                {{ item.warehouseName || '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getAlertBadgeClass(item.status)">
                  {{ getAlertStatusText(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getStockStatusBadgeClass(item.status)">
                  {{ getStockStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {{ item.storageDate ? new Date(item.storageDate).toLocaleDateString('zh-CN') : '-' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <button
                    v-if="canOutbound(item)"
                    class="text-red-600 hover:text-red-800 text-sm p-1 inline-flex items-center gap-1"
                    @click="handleOutbound(item)"
                    title="出库"
                  >
                    <ArrowUpCircle class="w-4 h-4" />出库
                  </button>
                  <button
                    class="text-blue-600 hover:text-blue-800 text-sm p-1 inline-flex items-center gap-1"
                    @click="handleEditItem(item)"
                  >
                    <Edit class="w-4 h-4" />编辑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 - 对齐V1.1 (border-t border-gray-100) -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div class="text-sm text-gray-500">共 {{ filteredData.length }} 条记录</div>
        <div class="flex items-center gap-2">
          <select
            v-model="pageSize"
            class="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
            @change="currentPage = 1"
          >
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
          </select>
          <button
            class="h-8 px-3 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >上一页</button>
          <span class="text-sm text-gray-600">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button
            class="h-8 px-3 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >下一页</button>
        </div>
      </div>
    </div>

    <!-- 产品详情弹窗 - 对齐V1.1 InventoryDetailModal (3 Tab: 基本信息/操作历史/上下游追溯) -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showDetailModal = false">
      <div class="bg-white rounded-xl w-full max-w-5xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <!-- Header - V1.1 风格：bg-emerald-600（纯色非渐变）+ 类型图标 + 状态徽章 + 关闭按钮 -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-emerald-600">
          <div class="flex items-center gap-3 text-white">
            <Package class="w-5 h-5 text-white" />
            <div>
              <h3 class="text-lg font-semibold flex items-center gap-2">
                成品库存详情
                <span :class="getStockStatusBadgeClass(selectedInventory?.status)">
                  {{ getStockStatusLabel(selectedInventory?.status) }}
                </span>
              </h3>
              <p class="text-sm text-emerald-100 font-mono mt-0.5">实例ID: {{ selectedInventory?.instanceId || selectedInventory?.id }}</p>
            </div>
          </div>
          <button
            @click="showDetailModal = false"
            class="text-white hover:bg-emerald-700 rounded p-1"
            title="关闭"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Tabs - 对齐V1.1 3 Tab (border-b border-gray-200 px-4 bg-gray-50) -->
        <div class="border-b border-gray-200 px-4 flex items-center gap-1 bg-gray-50">
          <button
            class="px-4 py-3 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors"
            :class="detailTab === 'basic'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-600 border-transparent hover:text-emerald-600'"
            @click="detailTab = 'basic'"
          >
            <Info class="w-4 h-4" />基本信息
          </button>
          <button
            class="px-4 py-3 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors"
            :class="detailTab === 'history'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-600 border-transparent hover:text-emerald-600'"
            @click="detailTab = 'history'"
          >
            <History class="w-4 h-4" />操作历史
            <span v-if="getOperationHistoryCount(selectedInventory) > 0" class="px-1.5 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">{{ getOperationHistoryCount(selectedInventory) }}</span>
          </button>
          <button
            class="px-4 py-3 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors"
            :class="detailTab === 'trace'
              ? 'text-emerald-600 border-emerald-600 bg-white'
              : 'text-gray-600 border-transparent hover:text-emerald-600'"
            @click="detailTab = 'trace'"
          >
            <GitBranch class="w-4 h-4" />上下游追溯
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 基本信息 Tab - 对齐V1.1 5 分组 -->
          <div v-if="detailTab === 'basic' && selectedInventory" class="space-y-4">
            <!-- 基础信息 -->
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 class="text-sm font-semibold text-blue-700 mb-3 border-b border-blue-300 pb-1.5">基础信息</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">实例ID</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5 break-all">{{ selectedInventory.instanceId || selectedInventory.id }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">业务ID</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5 break-all">{{ selectedInventory.productCode || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">业务类型</span>
                  <span class="text-sm text-gray-900 mt-0.5">
                    <span class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">采收入库</span>
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">状态</span>
                  <span class="text-sm text-gray-900 mt-0.5">
                    <span :class="getStockStatusBadgeClass(selectedInventory.status)">{{ getStockStatusLabel(selectedInventory.status) }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 品种信息 -->
            <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 class="text-sm font-semibold text-emerald-700 mb-3 border-b border-emerald-300 pb-1.5">品种信息</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">库存类型</span>
                  <span class="text-sm text-gray-900 mt-0.5 flex items-center gap-1">
                    <Package class="w-4 h-4 text-emerald-600" />成品
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">作物名称</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.cropName || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">作物编码</span>
                  <span class="text-sm text-emerald-600 font-mono mt-0.5">{{ generateCropCode(selectedInventory.cropName, selectedInventory.variety) || selectedInventory.productCode || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">品种</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.variety || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">种植模式</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.plantingMode || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">采收区域</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.greenhouseName || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">品质等级</span>
                  <span class="text-sm text-gray-900 mt-0.5">
                    <span :class="getGradeBadgeClass(selectedInventory.grade)">{{ selectedInventory.grade }}级</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 数量信息 -->
            <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 class="text-sm font-semibold text-amber-700 mb-3 border-b border-amber-300 pb-1.5">数量信息</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">当前数量</span>
                  <span class="text-lg font-mono font-semibold text-emerald-600 mt-0.5">{{ selectedInventory.quantity }} {{ selectedInventory.unit }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">存储时间</span>
                  <span class="text-sm text-blue-600 font-mono mt-0.5">{{ getStorageDays(selectedInventory.storageDate) }} 天</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">剩余保质期</span>
                  <span :class="getRemainingDaysClass(selectedInventory.expirationDate)" class="mt-0.5">
                    {{ getRemainingDays(selectedInventory.expirationDate) }}
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">库存下限</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5">{{ selectedInventory.alertSettings?.minStock }} {{ selectedInventory.unit }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">库存上限</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5">{{ selectedInventory.alertSettings?.maxStock }} {{ selectedInventory.unit }}</span>
                </div>
              </div>
            </div>

            <!-- 来源信息 -->
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 class="text-sm font-semibold text-purple-700 mb-3 border-b border-purple-300 pb-1.5">来源信息</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">入库来源</span>
                  <span class="mt-0.5">
                    <span class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">采收入库</span>
                  </span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">入库日期</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.storageDate ? new Date(selectedInventory.storageDate).toLocaleDateString('zh-CN') : '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">采收日期</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.harvestDate ? new Date(selectedInventory.harvestDate).toLocaleDateString('zh-CN') : '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">批次号</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5">{{ selectedInventory.batchCode || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">过期日期</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.expirationDate ? new Date(selectedInventory.expirationDate).toLocaleDateString('zh-CN') : '-' }}</span>
                </div>
              </div>
            </div>

            <!-- 仓库与备注 -->
            <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 class="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-300 pb-1.5">仓库与备注</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">仓库</span>
                  <span class="text-sm text-gray-900 mt-0.5">{{ selectedInventory.warehouseName || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">存放位置</span>
                  <span class="text-sm text-gray-900 font-mono mt-0.5">{{ selectedInventory.storageLocation || '-' }}</span>
                </div>
                <div class="flex flex-col md:col-span-3">
                  <span class="text-xs text-gray-500">备注</span>
                  <span class="text-sm text-gray-600 mt-0.5">{{ selectedInventory.remarks || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作历史 Tab - 对齐V1.1 HistoryTab 样式（左侧类型徽章 + 右侧详情） -->
          <div v-else-if="detailTab === 'history' && selectedInventory" class="space-y-2">
            <div class="text-xs text-gray-500 mb-2">共 {{ getOperationHistoryCount(selectedInventory) }} 条操作记录（按时间倒序）</div>
            <div v-if="(selectedInventory.inboundRecords?.length || 0) > 0">
              <div v-for="record in selectedInventory.inboundRecords" :key="record.id" class="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm">
                <div class="flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium text-emerald-600 bg-emerald-50 border-emerald-200">
                  <TrendingUp class="w-3.5 h-3.5" />入库
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-500">数量:</span>
                    <span class="font-mono font-semibold text-emerald-600">+{{ record.quantity }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span>操作人: {{ record.operatorName || '-' }}</span>
                    <span>·</span>
                    <span>{{ record.operateDate ? new Date(record.operateDate).toLocaleString('zh-CN') : '-' }}</span>
                  </div>
                  <div v-if="record.remarks" class="text-xs text-gray-600 mt-1 italic">备注: {{ record.remarks }}</div>
                </div>
              </div>
            </div>
            <div v-if="(selectedInventory.outboundRecords?.length || 0) > 0">
              <div v-for="record in selectedInventory.outboundRecords" :key="record.id" class="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm">
                <div class="flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium text-red-600 bg-red-50 border-red-200">
                  <TrendingDown class="w-3.5 h-3.5" />出库
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-500">数量:</span>
                    <span class="font-mono font-semibold text-red-600">-{{ record.quantity }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span>操作人: {{ record.operatorName || '-' }}</span>
                    <span>·</span>
                    <span>{{ record.operateDate ? new Date(record.operateDate).toLocaleString('zh-CN') : '-' }}</span>
                  </div>
                  <div v-if="record.remarks" class="text-xs text-gray-600 mt-1 italic">备注: {{ record.remarks }}</div>
                </div>
              </div>
            </div>
            <div v-if="getOperationHistoryCount(selectedInventory) === 0" class="text-center py-8 text-gray-500">
              <History class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无操作历史</p>
            </div>
          </div>

          <!-- 上下游追溯 Tab - 对齐V1.1 TraceTab 2 列 -->
          <div v-else-if="detailTab === 'trace' && selectedInventory" class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <GitBranch class="w-4 h-4 rotate-180" />
                上游来源 (1)
              </h4>
              <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-center gap-2 mb-1">
                  <Package class="w-4 h-4 text-emerald-600" />
                  <span class="text-sm font-medium">{{ selectedInventory.cropName }}</span>
                </div>
                <div class="text-xs text-gray-500 font-mono">{{ selectedInventory.batchCode || '-' }}</div>
                <div class="text-xs text-gray-600 mt-1">数量: {{ selectedInventory.quantity }} · 入库: {{ selectedInventory.storageDate }}</div>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <GitBranch class="w-4 h-4" />
                下游去向 ({{ selectedInventory.outboundRecords?.length || 0 }})
              </h4>
              <div v-if="(selectedInventory.outboundRecords?.length || 0) === 0" class="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                无下游去向（未被任何后续业务使用）
              </div>
              <div v-else class="space-y-2">
                <div v-for="record in selectedInventory.outboundRecords" :key="record.id" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex items-center gap-2 mb-1">
                    <Package class="w-4 h-4 text-emerald-600" />
                    <span class="text-sm font-medium">{{ record.operatorName || '-' }}</span>
                  </div>
                  <div class="text-xs text-gray-500 font-mono">{{ record.id }}</div>
                  <div class="text-xs text-gray-600 mt-1">出库: {{ record.quantity }} · 日期: {{ record.operateDate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteWarning" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showDeleteWarning = false">
      <div class="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden" @click.stop>
        <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">确认删除</h3>
          <button @click="showDeleteWarning = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6">
          <p class="text-gray-600">
            确定要删除选中的 <strong>{{ selectedRows.length }}</strong> 条产品库存记录吗？
          </p>
          <p class="text-red-500 text-sm mt-2">此操作不可恢复，请谨慎操作。</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showDeleteWarning = false">取消</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="handleConfirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 导出格式弹窗 -->
    <div v-if="showExportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showExportModal = false">
      <div class="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden" @click.stop>
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between">
          <h3 class="text-lg font-semibold">导出格式</h3>
          <button @click="showExportModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-gray-600">
            已选择 <strong>{{ selectedRows.length > 0 ? selectedRows.length : filteredData.length }}</strong> 条记录
          </p>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer p-3 border rounded-lg" :class="exportFormat === 'xlsx' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'">
              <input type="radio" v-model="exportFormat" value="xlsx" class="w-4 h-4 text-emerald-600 border-gray-400" />
              <span class="text-sm font-medium text-gray-900">Excel格式 (.xlsx)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer p-3 border rounded-lg" :class="exportFormat === 'csv' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'">
              <input type="radio" v-model="exportFormat" value="csv" class="w-4 h-4 text-emerald-600 border-gray-400" />
              <span class="text-sm font-medium text-gray-900">CSV格式 (.csv)</span>
            </label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showExportModal = false">取消</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleDoExport">确定导出</button>
        </div>
      </div>
    </div>

    <!-- 新增库存弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showAddModal = false">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop>
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between flex-shrink-0">
          <h3 class="text-lg font-semibold">新增库存</h3>
          <button @click="showAddModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作物名称 <span class="text-red-500">*</span></label>
              <input v-model="newInventory.cropName" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：草莓、番茄、黄瓜" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品种 <span class="text-red-500">*</span></label>
              <input v-model="newInventory.variety" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：红颜、千禧果" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质等级</label>
              <select v-model="newInventory.grade" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="A">A级</option>
                <option value="B">B级</option>
                <option value="C">C级</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质评定</label>
              <select v-model="newInventory.quality" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="average">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数量 <span class="text-red-500">*</span></label>
              <input v-model.number="newInventory.quantity" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <select v-model="newInventory.unit" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="公斤">公斤</option>
                <option value="kg">kg</option>
                <option value="个">个</option>
                <option value="株">株</option>
                <option value="粒">粒</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">仓库 <span class="text-red-500">*</span></label>
              <select v-model="newInventory.warehouseId" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="">请选择</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
              <input v-model="newInventory.storageLocation" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：A区-01-01" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库日期</label>
              <input v-model="newInventory.storageDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">采收日期</label>
              <input v-model="newInventory.harvestDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
              <input v-model="newInventory.batchCode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="系统自动生成" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">保质期(天)</label>
              <input v-model.number="newInventory.alertSettings.expirationDays" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
              <input v-model.number="newInventory.alertSettings.minStock" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最高库存</label>
              <input v-model.number="newInventory.alertSettings.maxStock" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
              <input v-model="newInventory.expirationDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">种植区域</label>
              <input v-model="newInventory.greenhouseName" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：日光温室1号" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">种植模式</label>
              <input v-model="newInventory.plantingMode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作人</label>
              <input v-model="newInventory.operator" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="默认为系统管理员" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea v-model="newInventory.remarks" :rows="2" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none" placeholder="可选填写备注信息"></textarea>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showAddModal = false">取消</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSaveAdd">保存</button>
        </div>
      </div>
    </div>

    <!-- 编辑库存弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop>
        <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between flex-shrink-0">
          <h3 class="text-lg font-semibold">编辑库存</h3>
          <button @click="showEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作物名称 <span class="text-red-500">*</span></label>
              <input v-model="editingInventory.cropName" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：草莓、番茄、黄瓜" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品种 <span class="text-red-500">*</span></label>
              <input v-model="editingInventory.variety" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：红颜、千禧果" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质等级</label>
              <select v-model="editingInventory.grade" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="A">A级</option>
                <option value="B">B级</option>
                <option value="C">C级</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质评定</label>
              <select v-model="editingInventory.quality" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="average">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数量 <span class="text-red-500">*</span></label>
              <input v-model.number="editingInventory.quantity" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <select v-model="editingInventory.unit" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="公斤">公斤</option>
                <option value="kg">kg</option>
                <option value="个">个</option>
                <option value="株">株</option>
                <option value="粒">粒</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">仓库 <span class="text-red-500">*</span></label>
              <select v-model="editingInventory.warehouseId" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="">请选择</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
              <input v-model="editingInventory.storageLocation" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：A区-01-01" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库日期</label>
              <input v-model="editingInventory.storageDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">采收日期</label>
              <input v-model="editingInventory.harvestDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
              <input v-model="editingInventory.batchCode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="系统自动生成" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">保质期(天)</label>
              <input v-model.number="editingInventory.alertSettings.expirationDays" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
              <input v-model.number="editingInventory.alertSettings.minStock" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最高库存</label>
              <input v-model.number="editingInventory.alertSettings.maxStock" type="number" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
              <input v-model="editingInventory.expirationDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">种植区域</label>
              <input v-model="editingInventory.greenhouseName" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="如：日光温室1号" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">种植模式</label>
              <input v-model="editingInventory.plantingMode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="请输入" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作人</label>
              <input v-model="editingInventory.operator" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="默认为系统管理员" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea v-model="editingInventory.remarks" :rows="2" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none" placeholder="可选填写备注信息"></textarea>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showEditModal = false">取消</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleSaveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 批量编辑弹窗 -->
    <div v-if="showBatchEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showBatchEditModal = false">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" @click.stop>
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between flex-shrink-0">
          <h3 class="text-lg font-semibold">
            批量编辑 ({{ batchEditIndex + 1 }}/{{ batchEditData.length }})
          </h3>
          <button @click="showBatchEditModal = false" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1" v-if="batchEditData.length > 0">
          <!-- 导航 -->
          <div class="flex items-center justify-between mb-4">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50" :disabled="batchEditIndex === 0" @click="handleBatchEditPrev">上一条</button>
            <span class="text-sm text-gray-500">{{ batchEditIndex + 1 }} / {{ batchEditData.length }}</span>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50" :disabled="batchEditIndex >= batchEditData.length - 1" @click="handleBatchEditNext">下一条</button>
          </div>
          <!-- 当前编辑项 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
              <input v-model="batchEditData[batchEditIndex].cropName" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
              <input v-model="batchEditData[batchEditIndex].variety" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质等级</label>
              <select v-model="batchEditData[batchEditIndex].grade" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="A">A级</option>
                <option value="B">B级</option>
                <option value="C">C级</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">品质</label>
              <select v-model="batchEditData[batchEditIndex].quality" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="good">优质</option>
                <option value="normal">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
              <input v-model.number="batchEditData[batchEditIndex].quantity" type="number" min="0" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <select v-model="batchEditData[batchEditIndex].unit" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="kg">kg</option>
                <option value="个">个</option>
                <option value="箱">箱</option>
                <option value="株">株</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
              <input v-model="batchEditData[batchEditIndex].storageLocation" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
              <input v-model="batchEditData[batchEditIndex].batchCode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">保质期</label>
              <input v-model="batchEditData[batchEditIndex].expirationDate" type="date" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" />
            </div>
          </div>
        </div>
        <!-- 底部操作 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between flex-shrink-0">
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700" @click="handleBatchEditSaveCurrent">保存当前</button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleBatchEditSaveAll">全部保存</button>
          </div>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="showBatchEditModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 出库弹窗（对齐 V1.1 OutboundModal.tsx：库存摘要 + 出库表单） -->
    <div v-if="showOutboundModal && selectedOutboundStock" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closeOutboundModal">
      <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <ArrowUpCircle class="w-5 h-5 text-white" />
            <h3 class="text-lg font-semibold">库存出库</h3>
          </div>
          <button @click="closeOutboundModal" class="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <!-- 库存信息摘要 -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 class="text-sm font-semibold text-blue-700 mb-3 border-b border-blue-300 pb-1.5">库存信息</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">实例ID</span>
                <span class="text-sm text-gray-900 font-mono mt-0.5 break-all">{{ selectedOutboundStock.instanceId || selectedOutboundStock.id }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">作物</span>
                <span class="text-sm text-gray-900 mt-0.5">{{ selectedOutboundStock.cropName || '-' }} / {{ selectedOutboundStock.variety || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">当前库存</span>
                <span class="text-sm font-mono font-semibold text-emerald-600 mt-0.5">{{ selectedOutboundStock.quantity }} {{ selectedOutboundStock.unit }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">可用量</span>
                <span class="text-sm font-mono font-semibold text-blue-600 mt-0.5">{{ availableQuantity }} {{ selectedOutboundStock.unit }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">已冻结</span>
                <span class="text-sm font-mono text-amber-600 mt-0.5">{{ selectedOutboundStock.frozenQuantity || 0 }} {{ selectedOutboundStock.unit }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">入库日期</span>
                <span class="text-sm text-gray-900 mt-0.5">{{ selectedOutboundStock.storageDate ? new Date(selectedOutboundStock.storageDate).toLocaleDateString('zh-CN') : '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 出库表单 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">出库数量 <span class="text-red-500">*</span></label>
              <input v-model.number="outboundForm.quantity" type="number" min="0" :max="availableQuantity" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" :placeholder="`最大 ${availableQuantity} ${selectedOutboundStock.unit}`" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">业务类型 <span class="text-red-500">*</span></label>
              <select v-model="outboundForm.businessType" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="sale">销售</option>
                <option value="transfer">调拨出库</option>
                <option value="damage">报损</option>
                <option value="internal">内部种植</option>
                <option value="gift">赠送</option>
                <option value="return">退库</option>
                <option value="adjust">调整</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">业务单号（可选）</label>
              <input v-model="outboundForm.businessCode" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm" placeholder="关联订单号/调拨单号等" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea v-model="outboundForm.remarks" :rows="2" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none" placeholder="可选填写备注信息"></textarea>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200" @click="closeOutboundModal">取消</button>
          <button class="h-8 px-4 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700" @click="submitOutbound">确认出库</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  Package, Search, RefreshCw, Plus, Edit, Trash2, Download, X, Info, History, GitBranch, Clock, AlertTriangle, TrendingUp, TrendingDown, ArrowUpCircle
} from 'lucide-vue-next'
import {
  getInventoryList,
  createInventory,
  updateInventory,
  deleteInventory,
  deleteInventoryBatch,
  outbound
} from '@/api/inventory/apiInventoryService'
import { useCropInventoryStore } from '@/stores/modules/inventory/useCropInventoryStore'
import { useCropVarietyStore } from '@/stores/modules/cropVariety'

// 初始化Store
const cropInventoryStore = useCropInventoryStore()
const { inventoryData, alerts } = storeToRefs(cropInventoryStore)

// 仓库数据
const warehouses = ref([
  { id: 'W001', name: '主仓库' },
  { id: 'W002', name: '副仓库' },
])

// 库存数据类型
const produceInventory = {
  id: '',
  instanceId: '',
  stockType: 'product',
  productCode: '',
  cropName: '',
  variety: '',
  grade: 'A',
  quality: 'good',
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
  remarks: '',
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

/**
 * 将API响应数据映射为本地库存格式
 * @param {Object} apiData - API返回的库存数据
 * @returns {Object} 本地格式的库存数据
 */
function mapApiToLocal(apiData) {
  return {
    id: apiData.instance_id || apiData.id || '',
    instanceId: apiData.instance_id || '',
    stockType: apiData.stock_type || 'product',
    productCode: apiData.business_id || '',
    cropName: apiData.crop_name || '',
    variety: apiData.variety_name || '',
    grade: apiData.grade || 'A',
    quality: apiData.quality || 'good',
    quantity: apiData.current_quantity || 0,
    unit: apiData.unit || 'kg',
    warehouseId: apiData.warehouse_id || '',
    warehouseName: apiData.warehouse_name || '',
    storageLocation: apiData.storage_location || '',
    harvestDate: apiData.harvest_date || '',
    storageDate: apiData.inbound_date || '',
    expirationDate: apiData.expiration_date || '',
    batchCode: apiData.batch_code || '',
    greenhouseName: apiData.greenhouse_name || '',
    plantingMode: apiData.planting_mode || '',
    remarks: apiData.remarks || '',
    alertSettings: {
      enableStorageTimeAlert: apiData.alert_settings?.enable_storage_time_alert || false,
      storageTimeThreshold: apiData.alert_settings?.storage_time_threshold || 0,
      enableQuantityAlert: apiData.alert_settings?.enable_quantity_alert || false,
      minQuantityThreshold: apiData.alert_settings?.min_quantity_threshold || 0,
      maxQuantityThreshold: apiData.alert_settings?.max_quantity_threshold || 0,
      minStock: apiData.alert_settings?.min_stock || 0,
      maxStock: apiData.alert_settings?.max_stock || 0,
      expirationDays: apiData.alert_settings?.expiration_days || 0,
    },
    inboundRecords: apiData.inbound_records || [],
    outboundRecords: apiData.outbound_records || [],
    status: apiData.status || 'in_stock',
  }
}

/**
 * 将本地库存数据映射为API请求格式
 * @param {Object} localData - 本地格式的库存数据
 * @returns {Object} API格式的请求数据
 */
function mapLocalToApi(localData) {
  return {
    crop_name: localData.cropName,
    variety_name: localData.variety,
    grade: localData.grade,
    current_quantity: localData.quantity,
    unit: localData.unit,
    warehouse_id: localData.warehouseId,
    storage_location: localData.storageLocation,
    batch_code: localData.batchCode,
    expiration_date: localData.expirationDate,
    alert_settings: {
      enable_storage_time_alert: localData.alertSettings?.enableStorageTimeAlert || false,
      storage_time_threshold: localData.alertSettings?.storageTimeThreshold || 0,
      enable_quantity_alert: localData.alertSettings?.enableQuantityAlert || false,
      min_quantity_threshold: localData.alertSettings?.minQuantityThreshold || 0,
      max_quantity_threshold: localData.alertSettings?.maxQuantityThreshold || 0,
      min_stock: localData.alertSettings?.minStock || 0,
      max_stock: localData.alertSettings?.maxStock || 0,
      expiration_days: localData.alertSettings?.expirationDays || 0,
    },
  }
}

// 加载库存数据（委托给Store）
async function loadInventoryData() {
  await cropInventoryStore.loadInventoryData()
}

// 页面加载时获取数据
onMounted(() => {
  loadInventoryData()
})

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
const showAlertEdit = ref(false)
const showDeleteWarning = ref(false)
const showExportModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBatchEditModal = ref(false)
const selectedInventory = ref(null)
const exportFormat = ref('xlsx')
// 出库弹窗状态（修复：脚本中已使用但缺少 ref 定义）
const showOutboundModal = ref(false)
const selectedOutboundStock = ref(null)
const outboundForm = reactive({
  quantity: '',
  businessType: 'other',
  businessCode: '',
  remarks: '',
})

// 编辑中的库存记录
const editingInventory = reactive({
  id: '',
  instanceId: '',
  stockType: 'product',
  productCode: '',
  cropName: '',
  variety: '',
  grade: 'A',
  quality: 'good',
  quantity: 0,
  unit: 'kg',
  warehouseId: '',
  warehouseName: '',
  storageLocation: '',
  storageDate: '',
  harvestDate: '',
  batchCode: '',
  expirationDate: '',
  greenhouseName: '',
  plantingMode: '',
  remarks: '',
  operator: '',
  alertSettings: {
    expirationDays: 30,
    minStock: 0,
    maxStock: 0,
  },
})

const newInventory = reactive({
  stockType: 'product',
  cropName: '',
  variety: '',
  productCode: '',
  grade: 'A',
  quality: 'good',
  quantity: 0,
  unit: 'kg',
  warehouseId: '',
  storageLocation: '',
  storageDate: new Date().toISOString().split('T')[0],
  harvestDate: new Date().toISOString().split('T')[0],
  batchCode: '',
  expirationDate: '',
  greenhouseName: '',
  plantingMode: '',
  remarks: '',
  operator: '系统管理员',
  alertSettings: {
    expirationDays: 30,
    minStock: 0,
    maxStock: 0,
  },
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

// 生成作物编码 - 从品种数据库获取编码
function generateCropCode(cropName, variety) {
  try {
    const varietyStore = useCropVarietyStore()
    const allVarieties = varietyStore.allItems || []
    if (allVarieties.length === 0) return ''

    // 精确匹配
    let match = allVarieties.find(v =>
      (v.subVariety1Name || v.sub_variety1_name) === variety &&
      (v.varietyName || v.variety_name) === cropName
    )
    // 模糊匹配
    if (!match) {
      match = allVarieties.find(v =>
        (v.varietyName || v.variety_name) === cropName ||
        (v.subVariety1Name || v.sub_variety1_name) === variety
      )
    }
    // 最宽泛匹配
    if (!match) {
      match = allVarieties.find(v =>
        (v.cropName || v.crop_name) === cropName ||
        (v.varietyName || v.variety_name)?.includes(cropName)
      )
    }
    if (match) {
      const code = match.varietyCode || match.variety_code || match.code || ''
      const seq = Math.floor(Math.random() * 999) + 1
      return code ? `${code}${String(seq).padStart(4, '0')}` : ''
    }
  } catch (e) {
    // 降级到简单生成
  }
  // fallback
  const prefix = cropName ? cropName.substring(0, 2).toUpperCase() : 'OT'
  return `${prefix}${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`
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

// 获取库存状态徽章样式（V1.1 InventoryTable getStockStatusBadgeClass 对齐）
function getStockStatusBadgeClass(status) {
  const config = {
    in_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700',
    low_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
    expired: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700',
    out_of_stock: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700',
    reserved: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
  }
  return config[status] || config.in_stock
}

// 获取库存状态文本
function getStockStatusLabel(status) {
  const config = {
    in_stock: '在库',
    low_stock: '低库存',
    expired: '已过期',
    out_of_stock: '缺货',
    reserved: '预占用',
  }
  return config[status] || '在库'
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

// 批量编辑索引和编辑数据
const batchEditIndex = ref(0)
const batchEditData = ref([])

// 确认批量编辑 - 逐条切换编辑
function handleConfirmBatchEdit() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要批量编辑的记录')
    return
  }
  // 获取所有选中的记录
  batchEditData.value = inventoryData.value
    .filter(item => selectedRows.value.includes(item.id))
    .map(item => ({ ...item }))
  batchEditIndex.value = 0
  batchEditMode.value = false
  showBatchEditModal.value = true
}

// 批量编辑：上一条
function handleBatchEditPrev() {
  if (batchEditIndex.value > 0) {
    batchEditIndex.value--
  }
}

// 批量编辑：下一条
function handleBatchEditNext() {
  if (batchEditIndex.value < batchEditData.value.length - 1) {
    batchEditIndex.value++
  }
}

// 批量编辑：保存当前条
async function handleBatchEditSaveCurrent() {
  const item = batchEditData.value[batchEditIndex.value]
  if (!item) return
  try {
    const apiData = {
      crop_name: item.cropName,
      variety_name: item.variety,
      grade: item.grade,
      quality: item.quality,
      current_quantity: item.quantity,
      unit: item.unit,
      warehouse_id: item.warehouseId,
      storage_location: item.storageLocation,
      batch_code: item.batchCode,
      expiration_date: item.expirationDate,
    }
    await updateInventory(item.id, apiData)
    ElMessage.success(`已保存 (${batchEditIndex.value + 1}/${batchEditData.value.length})`)
  } catch (error) {
    console.error('批量编辑保存失败:', error)
    ElMessage.error('批量编辑保存失败')
  }
}

// 批量编辑：全部保存
async function handleBatchEditSaveAll() {
  for (let i = 0; i < batchEditData.value.length; i++) {
    const item = batchEditData.value[i]
    try {
      const apiData = {
        crop_name: item.cropName,
        variety_name: item.variety,
        grade: item.grade,
        quality: item.quality,
        current_quantity: item.quantity,
        unit: item.unit,
        warehouse_id: item.warehouseId,
        storage_location: item.storageLocation,
        batch_code: item.batchCode,
        expiration_date: item.expirationDate,
      }
      await updateInventory(item.id, apiData)
    } catch (error) {
      console.error(`批量编辑保存失败 (第${i + 1}条):`, error)
    }
  }
  ElMessage.success('批量编辑全部保存完成')
  showBatchEditModal.value = false
  await loadInventoryData()
}

// 确认删除
async function handleConfirmDelete() {
  try {
    // 获取选中行的 instanceId
    const idsToDelete = selectedRows.value.length > 0
      ? selectedRows.value
      : []

    if (idsToDelete.length === 0) {
      ElMessage.warning('请选择要删除的记录')
      return
    }

    // 调用批量删除API
    await deleteInventoryBatch(idsToDelete)
    ElMessage.success('删除成功')

    // 关闭弹窗并重置选择
    showDeleteWarning.value = false
    deleteMode.value = false
    selectedRows.value = []

    // 重新加载数据
    await loadInventoryData()
  } catch (error) {
    console.error('删除库存失败:', error)
    ElMessage.error('删除库存失败')
  }
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

// 保存预警设置
async function handleSaveAlertSettings() {
  if (!selectedInventory.value) return
  try {
    const apiData = {
      alert_settings: {
        enable_storage_time_alert: selectedInventory.value.alertSettings?.enableStorageTimeAlert || false,
        storage_time_threshold: selectedInventory.value.alertSettings?.storageTimeThreshold || 0,
        enable_quantity_alert: selectedInventory.value.alertSettings?.enableQuantityAlert || false,
        min_quantity_threshold: selectedInventory.value.alertSettings?.minQuantityThreshold || 0,
        max_quantity_threshold: selectedInventory.value.alertSettings?.maxQuantityThreshold || 0,
        min_stock: selectedInventory.value.alertSettings?.minStock || 0,
        max_stock: selectedInventory.value.alertSettings?.maxStock || 0,
        expiration_days: selectedInventory.value.alertSettings?.expirationDays || 0,
      }
    }
    await updateInventory(selectedInventory.value.id, apiData)
    ElMessage.success('预警设置保存成功')
    showAlertEdit.value = false
  } catch (error) {
    console.error('保存预警设置失败:', error)
    ElMessage.error('保存预警设置失败')
  }
}

// 新增
function handleAdd() {
  showAddModal.value = true
}

// 保存新增
async function handleSaveAdd() {
  if (!newInventory.cropName || !newInventory.variety) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    const apiData = {
      stock_type: newInventory.stockType || 'product',
      business_type: 'harvest',
      crop_name: newInventory.cropName,
      variety_name: newInventory.variety,
      grade: newInventory.grade,
      quality: newInventory.quality,
      current_quantity: newInventory.quantity,
      unit: newInventory.unit,
      warehouse_id: newInventory.warehouseId,
      storage_location: newInventory.storageLocation,
      inbound_date: newInventory.storageDate,
      harvest_date: newInventory.harvestDate,
      batch_code: newInventory.batchCode,
      expiration_date: newInventory.expirationDate,
      greenhouse_name: newInventory.greenhouseName,
      planting_mode: newInventory.plantingMode,
      remarks: newInventory.remarks,
      alert_settings: {
        expiration_days: newInventory.alertSettings.expirationDays || 0,
        min_stock: newInventory.alertSettings.minStock || 0,
        max_stock: newInventory.alertSettings.maxStock || 0,
      },
    }

    await createInventory(apiData)
    ElMessage.success('新增成功')

    // 关闭弹窗并重置表单
    showAddModal.value = false
    newInventory.stockType = 'product'
    newInventory.cropName = ''
    newInventory.variety = ''
    newInventory.productCode = ''
    newInventory.grade = 'A'
    newInventory.quality = 'good'
    newInventory.quantity = 0
    newInventory.unit = 'kg'
    newInventory.warehouseId = ''
    newInventory.storageLocation = ''
    newInventory.storageDate = new Date().toISOString().split('T')[0]
    newInventory.harvestDate = new Date().toISOString().split('T')[0]
    newInventory.batchCode = ''
    newInventory.expirationDate = ''
    newInventory.greenhouseName = ''
    newInventory.plantingMode = ''
    newInventory.remarks = ''
    newInventory.operator = '系统管理员'
    newInventory.alertSettings = {
      expirationDays: 30,
      minStock: 0,
      maxStock: 0,
    }

    // 重新加载数据
    await loadInventoryData()
  } catch (error) {
    console.error('新增库存失败:', error)
    ElMessage.error('新增库存失败')
  }
}

// 判断库存是否可出库（V1.1 规则：库存中/低库存）
function canOutbound(item) {
  const status = item.status || item.stockStatus
  return status === 'in_stock' || status === 'low_stock' || status === '库存中' || status === '低库存'
}

// 出库操作（V1.1 对齐）
function handleOutbound(item) {
  if (!canOutbound(item)) {
    ElMessage.warning('只有库存中或低库存状态的物品可以出库')
    return
  }
  selectedOutboundStock.value = item
  // 重置表单
  outboundForm.quantity = ''
  outboundForm.businessType = 'other'
  outboundForm.businessCode = ''
  outboundForm.remarks = ''
  showOutboundModal.value = true
}

// 关闭出库弹窗
function closeOutboundModal() {
  showOutboundModal.value = false
  selectedOutboundStock.value = null
}

// 计算可用数量
const availableQuantity = computed(() => {
  if (!selectedOutboundStock.value) return 0
  const current = Number(selectedOutboundStock.value.quantity ?? 0)
  const frozen = Number(selectedOutboundStock.value.frozenQuantity ?? 0)
  return Math.max(0, current - frozen)
})

// 提交出库
async function submitOutbound() {
  const stock = selectedOutboundStock.value
  if (!stock) {
    ElMessage.warning('请选择要出库的库存')
    return
  }
  const qty = Number(outboundForm.quantity)
  if (!qty || qty <= 0) {
    ElMessage.warning('请输入有效的出库数量')
    return
  }
  if (qty > availableQuantity.value) {
    ElMessage.warning(`出库数量不能超过可用量（${availableQuantity.value}）`)
    return
  }
  try {
    // 调用后端出库 API：与 V1.1 OutboundModal.tsx 一致
    await outbound({
      instance_id: stock.instanceId || stock.id,
      quantity: qty,
      business_type: outboundForm.businessType,
      business_code: outboundForm.businessCode || '',
      remarks: outboundForm.remarks || '',
    })
    ElMessage.success('出库成功')
    closeOutboundModal()
    await loadInventoryData()
  } catch (error) {
    console.error('出库失败:', error)
    ElMessage.error('出库失败：' + (error?.message || '未知错误'))
  }
}

// 编辑库存记录
function handleEditItem(item) {
  // 填充编辑表单
  editingInventory.id = item.id
  editingInventory.instanceId = item.instanceId || item.id
  editingInventory.stockType = item.stockType || 'product'
  editingInventory.productCode = item.productCode || ''
  editingInventory.cropName = item.cropName
  editingInventory.variety = item.variety
  editingInventory.grade = item.grade
  editingInventory.quality = item.quality || 'good'
  editingInventory.quantity = item.quantity
  editingInventory.unit = item.unit
  editingInventory.warehouseId = item.warehouseId
  editingInventory.warehouseName = item.warehouseName
  editingInventory.storageLocation = item.storageLocation
  editingInventory.storageDate = item.storageDate || ''
  editingInventory.harvestDate = item.harvestDate || ''
  editingInventory.batchCode = item.batchCode
  editingInventory.expirationDate = item.expirationDate
  editingInventory.greenhouseName = item.greenhouseName || ''
  editingInventory.plantingMode = item.plantingMode || ''
  editingInventory.remarks = item.remarks || ''
  editingInventory.operator = item.inboundRecords && item.inboundRecords.length > 0
    ? item.inboundRecords[item.inboundRecords.length - 1].operator || ''
    : ''
  editingInventory.alertSettings = {
    expirationDays: item.alertSettings?.expirationDays || 0,
    minStock: item.alertSettings?.minStock || 0,
    maxStock: item.alertSettings?.maxStock || 0,
  }
  showEditModal.value = true
}

// 保存编辑
async function handleSaveEdit() {
  if (!editingInventory.instanceId) {
    ElMessage.warning('缺少库存记录ID')
    return
  }

  if (!editingInventory.cropName || !editingInventory.variety) {
    ElMessage.warning('请填写必填项')
    return
  }

  try {
    const apiData = {
      crop_name: editingInventory.cropName,
      variety_name: editingInventory.variety,
      grade: editingInventory.grade,
      quality: editingInventory.quality,
      current_quantity: editingInventory.quantity,
      unit: editingInventory.unit,
      warehouse_id: editingInventory.warehouseId,
      storage_location: editingInventory.storageLocation,
      inbound_date: editingInventory.storageDate,
      harvest_date: editingInventory.harvestDate,
      batch_code: editingInventory.batchCode,
      expiration_date: editingInventory.expirationDate,
      greenhouse_name: editingInventory.greenhouseName,
      planting_mode: editingInventory.plantingMode,
      remarks: editingInventory.remarks,
      alert_settings: {
        expiration_days: editingInventory.alertSettings.expirationDays || 0,
        min_stock: editingInventory.alertSettings.minStock || 0,
        max_stock: editingInventory.alertSettings.maxStock || 0,
      },
    }

    await updateInventory(editingInventory.instanceId, apiData)
    ElMessage.success('编辑成功')

    // 关闭弹窗
    showEditModal.value = false

    // 重新加载数据
    await loadInventoryData()
  } catch (error) {
    console.error('编辑库存失败:', error)
    ElMessage.error('编辑库存失败')
  }
}
</script>

<style scoped>
/* V1.1 样式保持一致 */
</style>
