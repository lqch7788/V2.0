<template>
  <div class="space-y-6">
    <!-- 页面头部 - 对应V1.1 PageHeader: shadow-none (无阴影) -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Package class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">仓库物料</h1>
            <p class="text-gray-500">仓库物料库存管理</p>
          </div>
        </div>
        <button
          v-if="lowStockCount > 0"
          class="h-8 px-3 rounded-md text-sm font-medium flex items-center gap-2"
          :class="showLowStock ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'"
          @click="handleLowStockClick"
        >
          <AlertTriangle class="w-4 h-4" />
          <span class="font-medium">库存不足</span>
          <span class="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">{{ lowStockCount }}</span>
        </button>
      </div>
    </div>

    <!-- 标签页 - 对应V1.1 TabSwitch: 物料入库在前，物料库存在后 -->
    <!-- V1.1 variant=default (emerald-600) / variant=outline (border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900) -->
    <div class="flex items-center gap-4">
      <div class="flex gap-2">
        <button
          class="h-8 px-3 rounded-md text-sm font-medium"
          :class="activeTab === 'inbound'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          @click="handleTabChange('inbound')"
        >物料入库</button>
        <button
          class="h-8 px-3 rounded-md text-sm font-medium"
          :class="activeTab === 'overview'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          @click="handleTabChange('overview')"
        >物料库存</button>
      </div>
      <div class="h-6 w-px bg-gray-500"></div>
      <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700" @click="$router.push('/code-rule')">编码规则 &gt;&gt;</button>
      <span class="text-sm font-bold text-gray-900">物料编码生成</span>
      <button
        class="h-8 w-8 rounded-md inline-flex items-center justify-center text-gray-600 hover:bg-gray-100"
        :title="codeGenExpanded ? '收起' : '展开'"
        @click="codeGenExpanded = !codeGenExpanded"
      >
        <ChevronDown v-if="codeGenExpanded" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- 库存总览 -->
    <template v-if="activeTab === 'overview'">
      <!-- 筛选器 - 对应V1.1 MaterialFilters 单行8列布局 -->
      <MaterialFilters
        :filters="toolbarFilters"
        :low-stock-count="lowStockCount"
        :category-config="categoryConfig"
        @filters-change="handleFiltersChange"
        @low-stock-click="handleLowStockClick"
      />

      <!-- ActionToolbar 批量操作工具栏 -->
      <ActionToolbar
        title="物料库存"
        :batch-edit-mode="batchEditMode"
        :delete-mode="deleteMode"
        :export-mode="exportMode"
        :selected-rows="selectedRows"
        :low-stock-count="lowStockCount"
        :filters="toolbarFilters"
        :show-low-stock-button="true"
        :can-create="true"
        @low-stock-toggle="handleToolbarLowStockToggle"
        @batch-edit="handleToolbarBatchEdit"
        @delete="handleToolbarDelete"
        @export="handleToolbarExport"
        @confirm-batch-edit="handleToolbarConfirmBatchEdit"
        @cancel-batch-edit="handleToolbarCancelBatchEdit"
        @confirm-delete="handleToolbarConfirmBatchDelete"
        @cancel-delete="handleToolbarCancelDelete"
        @confirm-export="handleToolbarConfirmExport"
        @cancel-export="handleToolbarCancelExport"
        @add="handleToolbarAdd"
      />

      <!-- 表格容器 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- 选择模式提示条 -->
        <div
          v-if="exportMode || batchEditMode || deleteMode"
          class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50"
        >
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </div>
        </div>

        <!-- 表格 - 对应V1.1: min-width 1500px, tableLayout: fixed -->
        <div class="overflow-auto max-h-[calc(100vh-280px)]">
          <table class="w-full" style="min-width: 1500px; table-layout: fixed;">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th
                  v-if="exportMode || batchEditMode || deleteMode"
                  class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap"
                >
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    class="rounded"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">物料编号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">物料名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-40 whitespace-nowrap">分类</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">规格型号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">条形码</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-16 whitespace-nowrap">单位</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">库存数量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">最低库存</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">最高库存</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">单价（元）</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">供应商</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">存放位置</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">批次号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">生产日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-24 whitespace-nowrap">有效期至</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-32 whitespace-nowrap">最后更新时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold w-20 whitespace-nowrap">数据状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="paginatedMaterials.length === 0">
                <td :colspan="(exportMode || batchEditMode || deleteMode) ? 18 : 17" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
              <tr
                v-for="row in paginatedMaterials"
                :key="row.id"
                class="hover:bg-blue-100 transition-colors"
              >
                <td v-if="exportMode || batchEditMode || deleteMode" class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedRows.some(s => s.id === row.id)"
                    class="rounded"
                    @change="toggleSelectRow(row)"
                  />
                </td>
                <!-- V1.1: 物料编号可点击 + truncate + title -->
                <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline truncate" :title="`${row.code}（点击查看详情）`" @click="handleView(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.name">{{ row.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.category">{{ row.category }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.specification">{{ row.specification || '-' }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600 truncate" :title="row.barcode">{{ row.barcode || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.unit">{{ row.unit }}</td>
                <td class="px-4 py-3 text-sm truncate">
                  <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : 'text-gray-900'" :title="`库存 ${row.quantity}（最低 ${row.minStock}）`">
                    {{ row.quantity }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="`最低 ${row.minStock}`">{{ row.minStock }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="`最高 ${row.maxStock}`">{{ row.maxStock }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.price">{{ (row.price || '').replace('元', '') }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.supplier">{{ row.supplier }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.location">{{ row.location }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.batchNo">{{ row.batchNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.productionDate">{{ row.productionDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.expiryDate">{{ row.expiryDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 truncate" :title="row.lastUpdateTime">{{ row.lastUpdateTime ? row.lastUpdateTime.slice(0, 10) : '' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': row.dataStatus === '启用',
                      'bg-red-100 text-red-700': row.dataStatus !== '启用'
                    }"
                    :title="row.dataStatus"
                  >
                    {{ row.dataStatus || '启用' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :page-size="pageSize"
            :page-size-options="[10, 20, 50]"
            :show-page-size="true"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </template>

    <!-- 物料入库 -->
    <template v-if="activeTab === 'inbound'">
      <!-- 编码规则生成器 - V1.1 真实代码: grid-cols-6 + "生成编码"列 col-span-3 (50% 宽度), 3个按钮全部在同一行 -->
      <div v-if="codeGenExpanded" class="bg-white rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <select
              v-model="codeGen.bigCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @change="handleCodeGenBigCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in bigCategoriesList" :key="cat.code" :value="cat.code">{{ cat.code }}-{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <select
              v-model="codeGen.midCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              :disabled="!codeGen.bigCategory"
              @change="handleCodeGenMidCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in codeGenMidCategories" :key="cat.code" :value="cat.code">{{ cat.code }}-{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <select
              v-model="codeGen.subCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              :disabled="!codeGen.midCategory"
              @change="handleCodeGenSubCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in codeGenSubCategories" :key="cat.code" :value="cat.code">{{ cat.code }}-{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              生成编码
              <span v-if="codeGenSuccess && !codeGenError" class="ml-2 text-sm text-green-600 font-normal">{{ codeGenSuccess }}</span>
              <span v-if="codeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ codeGenError }}</span>
            </label>
            <!-- V1.1 编码生成器: Input + 生成/复制/重置 4个元素全部在同一行, 3个按钮用 flex-1 均分空间保证文字不被挤压 -->
            <div class="flex gap-2 items-center w-full">
              <input
                v-model="codeGen.generatedCode"
                placeholder="点击生成"
                readonly
                class="w-32 h-9 px-3 border border-gray-200 rounded-md text-sm bg-gray-50 flex-shrink-0"
              />
              <!-- V1.1: 生成按钮 emerald-600 (default), flex-1 让按钮均分空间, 宽度足够"生成"文字不挤压 -->
              <button
                class="h-9 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap min-w-0"
                :disabled="!codeGen.subCategory"
                @click="handleCodeGen"
              >
                <Wand2 class="w-4 h-4" />生成
              </button>
              <!-- V1.1: 复制按钮 浅蓝边框白底 -->
              <button
                class="h-9 px-3 rounded-md text-sm font-medium border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap min-w-0"
                :disabled="!codeGen.generatedCode"
                @click="handleCopyCode"
              >
                <Copy class="w-4 h-4" />{{ copySuccess ? '已复制!' : '复制' }}
              </button>
              <!-- V1.1: 重置按钮 amber-500 (warning) -->
              <button
                class="h-9 px-3 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center justify-center gap-1 flex-1 whitespace-nowrap min-w-0"
                @click="handleResetCodeGen"
              >
                <RotateCcw class="w-4 h-4" />重置
              </button>
            </div>
          </div>
        </div>
        <!-- I/O 风险提示 - 警告文字在最下方 -->
        <div class="mt-2 text-xs text-amber-600 flex items-start gap-1">
          <span class="font-bold">⚠️</span>
          <span>部分大类（如 OP/IT/OT）编码含字母 I/O，与数字 1/0 形近。生成后请人工核对，避免抄录/扫描时误读。</span>
        </div>
      </div>

      <!-- 入库记录表格 - 对应V1.1 MaterialInboundTab -->
      <!-- 入库记录搜索栏 -->
      <div class="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div class="flex items-end gap-4">
          <div class="flex-1 grid grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
              <input v-model="inboundSearchCode" placeholder="搜索单号" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
              <input v-model="inboundSearchSupplier" placeholder="搜索供应商" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select v-model="inboundSearchStatus" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500">
                <option value="">全部</option>
                <option value="pending">待审核</option>
                <option value="completed">已完成</option>
                <option value="voided">已作废</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
              <input v-model="inboundSearchMaterialName" placeholder="搜索物料名称" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">物料编码</label>
              <input v-model="inboundSearchMaterialCode" placeholder="搜索物料编码" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div class="flex gap-2">
            <!-- V1.1: 重置按钮 variant=warning (amber-500) + RotateCw + RotateCcW 双图标 -->
            <button class="h-8 px-3 rounded-md text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleResetInboundSearch">
              <RefreshCw class="w-4 h-4" /><RotateCcw class="w-4 h-4" /> 重置
            </button>
            <!-- V1.1: 搜索按钮 default 颜色 (emerald-600) -->
            <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1">
              <Search class="w-4 h-4" /> 搜索
            </button>
          </div>
        </div>
      </div>

      <!-- 入库记录表格 - 对应V1.1 MaterialInboundTab 表格结构 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
            <template v-if="inboundEditMode || inboundDeleteMode || inboundExportMode">
              <div class="flex items-center gap-2 ml-4">
                <button class="text-emerald-600 hover:text-emerald-700 p-0 h-auto text-sm" @click="handleInboundSelectAll">
                  {{ isInboundAllSelected ? '全不选' : '全选' }}
                </button>
                <span class="text-sm text-gray-500">已选择 {{ inboundSelectedRows.length }} 项</span>
              </div>
            </template>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!inboundEditMode && !inboundDeleteMode && !inboundExportMode">
              <!-- V1.1 编辑按钮: Edit + Edit2 双图标, variant=blue (blue-600) -->
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="inboundEditMode = true">
                <Edit class="w-4 h-4" /><Edit2 class="w-4 h-4" />编辑
              </button>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="inboundDeleteMode = true">
                <Trash2 class="w-4 h-4" />删除
              </button>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="inboundExportMode = true">
                <Download class="w-4 h-4" />导出
              </button>
              <div class="w-px h-6 bg-gray-300 mx-1"></div>
              <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleAddInbound">
                <Plus class="w-4 h-4" />新增入库
              </button>
            </template>
            <template v-else>
              <template v-if="inboundEditMode">
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleInboundConfirmEdit">确认编辑{{ inboundSelectedRows.length > 0 ? ` (${inboundSelectedRows.length})` : '' }}</button>
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center gap-1" @click="handleInboundCancelSelection">取消</button>
              </template>
              <template v-if="inboundDeleteMode && !inboundEditMode">
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="handleInboundConfirmDelete">确认删除{{ inboundSelectedRows.length > 0 ? ` (${inboundSelectedRows.length})` : '' }}</button>
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center gap-1" @click="handleInboundCancelSelection">取消</button>
              </template>
              <template v-if="inboundExportMode && !inboundEditMode && !inboundDeleteMode">
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleInboundConfirmExport">确认导出{{ inboundSelectedRows.length > 0 ? ` (${inboundSelectedRows.length})` : '' }}</button>
                <button class="h-8 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 inline-flex items-center gap-1" @click="handleInboundCancelSelection">取消选择</button>
              </template>
            </template>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th v-if="inboundEditMode || inboundDeleteMode || inboundExportMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12"></th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-10"></th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库单号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作员</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料数量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <template v-for="record in filteredInboundRecords" :key="record.id">
                <tr class="hover:bg-blue-100 transition-colors">
                  <td v-if="inboundEditMode || inboundDeleteMode || inboundExportMode" class="px-4 py-3 whitespace-nowrap">
                    <span v-if="inboundDeleteMode && record.status !== 'pending'" class="text-gray-300 text-xs">—</span>
                    <input v-else type="checkbox" :checked="inboundSelectedRows.includes(record.id)" class="w-4 h-4 rounded border-gray-400" @change="handleInboundSelectRow(record.id)" />
                  </td>
                  <td class="px-4 py-3">
                    <button class="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100" @click="toggleInboundExpand(record.id)">
                      <ChevronDown v-if="inboundExpandedRows.has(record.id)" class="w-4 h-4 text-gray-500" />
                      <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800 underline whitespace-nowrap" @click="handleViewInbound(record)">{{ record.code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ record.inboundDate }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ record.supplier }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ record.operator }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ record.materials.length }} 种物料</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" :class="{
                      'bg-green-100 text-green-700': record.status === 'completed',
                      'bg-gray-100 text-gray-500': record.status === 'voided',
                      'bg-amber-100 text-amber-700': record.status === 'pending'
                    }">
                      {{ record.status === 'completed' ? '已完成' : record.status === 'voided' ? '已作废' : '待审核' }}
                    </span>
                  </td>
                </tr>
                <!-- 展开的物料明细子表 -->
                <tr v-if="inboundExpandedRows.has(record.id)">
                  <td :colspan="(inboundEditMode || inboundDeleteMode || inboundExportMode) ? 8 : 7" class="px-4 py-3 bg-gray-50">
                    <div class="text-sm">
                      <p class="font-medium text-gray-700 mb-2">物料明细：</p>
                      <div class="overflow-x-auto rounded border">
                        <table class="w-full bg-white">
                          <thead class="bg-gray-100">
                            <tr>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">物料编码</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">物料名称</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">分类</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">规格</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">条形码</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">单位</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">数量</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">单价</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">供应商</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">存放位置</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">批号</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">生产日期</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">有效期至</th>
                              <th class="px-2 py-2 text-left text-xs font-medium whitespace-nowrap">备注</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="m in record.materials" :key="m.id" class="border-t">
                              <td class="px-2 py-2 text-xs text-blue-600 whitespace-nowrap">{{ m.materialCode }}</td>
                              <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.materialName }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.category }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.specification }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.barcode }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.unit }}</td>
                              <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.quantity }}</td>
                              <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.price }}元</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.supplier }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.location }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.batchNo }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.productionDate }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.expiryDate }}</td>
                              <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.remarks }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- 入库记录分页 -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <Pagination
            :current-page="inboundPage"
            :total-pages="Math.ceil(filteredInboundRecords.length / inboundPageSize) || 1"
            :page-size="inboundPageSize"
            :page-size-options="[10, 20, 50]"
            :show-page-size="true"
            @page-change="(page) => inboundPage = page"
            @page-size-change="handleInboundPageSizeChange"
          />
        </div>
      </div>
    </template>

    <!-- ========== 新增入库弹窗 - 严格对齐 V1.1 InboundAddModal.tsx ========== -->
    <!-- V1.1: size="xxxl" (1350×700),showMaximize/drag/resize=true,标题"新增入库记录",emerald-50 信息卡(4字段)+ 15列物料明细表 -->
    <ElModal :model-value="showAddModal" title="新增入库记录" :width="1350" :height="700" :show-submit="false" :show-cancel="false" :show-maximize="true" :enable-drag="true" :enable-resize="true" @update:model-value="(v) => { if (!v) showAddModal = false }" @close="showAddModal = false">
      <div class="flex flex-col h-full">
        <!-- 1. 顶部信息卡 - 对应V1.1: emerald-50/200, 4列(入库单号+生成按钮/入库日期/供应商/操作员) -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-medium text-emerald-700 mb-1">入库单号</label>
              <div class="flex gap-1">
                <input
                  v-model="newInbound.orderCode"
                  type="text"
                  readonly
                  placeholder="点击生成"
                  class="flex-1 h-8 px-2 border border-gray-200 rounded text-sm font-mono bg-white"
                />
                <button
                  class="h-8 px-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
                  title="生成入库单号"
                  @click="generateOrderCode"
                >
                  <RefreshCw class="w-4 h-4" />
                </button>
              </div>
              <p v-if="codeError" class="text-xs text-red-500 mt-0.5">{{ codeError }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-emerald-700 mb-1">入库日期</label>
              <input
                v-model="newInbound.inboundDate"
                type="date"
                class="w-full h-8 px-2 border border-gray-200 rounded text-sm bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-emerald-700 mb-1">供应商</label>
              <input
                v-model="newInbound.supplier"
                type="text"
                placeholder="输入供应商"
                class="w-full h-8 px-2 border border-gray-200 rounded text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-emerald-700 mb-1">操作员</label>
              <input
                v-model="newInbound.operator"
                type="text"
                readonly
                class="w-full h-8 px-2 border border-gray-200 rounded text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- 2. 物料明细 - 对应V1.1: 标题(N种物料) + 添加物料按钮(blue) + 15列表格 -->
        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ addInboundMaterials.length }}种物料）</h4>
            <!-- V1.1 添加物料按钮: variant=blue (blue-600) -->
            <button class="h-7 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleAddInboundMaterial">
              <Plus class="w-3 h-3" />添加物料
            </button>
          </div>
          <div v-if="addInboundMaterials.length === 0" class="text-center py-8 text-sm text-gray-500 border border-gray-200 rounded-lg">
            暂无物料，请点击"添加物料"按钮添加
          </div>
          <div v-else class="flex-1 overflow-auto rounded-lg border border-gray-200">
            <table class="min-w-full text-xs" style="min-width: 1400px;">
              <thead>
                <tr>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">操作</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">物料编码</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">物料名称</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">分类</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">规格</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">条形码</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">单位</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">数量</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">单价</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">供应商</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">存放位置</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">批号</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">生产日期</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">有效期至</th>
                  <th class="px-2 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(m, idx) in addInboundMaterials" :key="idx">
                  <td class="px-2 py-1.5">
                    <button class="text-red-500 hover:bg-red-50 p-1 rounded inline-flex" @click="handleDeleteInboundMaterial(idx)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td class="px-1 py-1.5"><input v-model="m.materialCode" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.materialName" type="text" class="w-24 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.category" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.specification" type="text" class="w-16 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.barcode" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.unit" type="text" class="w-12 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model.number="m.quantity" type="number" min="0" class="w-16 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.price" type="text" class="w-16 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.supplier" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.location" type="text" class="w-16 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.batchNo" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.productionDate" type="date" class="h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.expiryDate" type="date" class="h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                  <td class="px-1 py-1.5"><input v-model="m.remarks" type="text" class="w-20 h-6 px-1 text-xs border border-gray-300 rounded" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- V1.1 footer: 取消(secondary) + 提交(default) -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="handleCloseModal">取消</el-button>
          <el-button type="primary" size="small" @click="handleSaveInbound">提交</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 物料详情弹窗 - 严格 1:1 对齐 V1.1 MaterialDetailModal.tsx ========== -->
    <!-- V1.1: UnifiedModal size="xl" (900×600),无自定义 footer,UnifiedModal 默认 showFooter=true 渲染默认取消按钮 -->
    <!-- V2.0: :show-submit="false"(无保存),:show-cancel="true"(单关闭按钮),cancel-text="关闭" -->
    <ElModal :model-value="showDetailModal" title="物料详情查看" :width="900" :height="600" :show-submit="false" :show-cancel="true" cancel-text="关闭" @update:model-value="(v) => { if (!v) showDetailModal = false }" @close="showDetailModal = false">
        <div v-if="selectedMaterial">
          <!-- 基本信息标题 - 对应V1.1: Package 5×5 emerald-600,在条形码上方 -->
          <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Package class="w-5 h-5 text-emerald-600" />
            基本信息
          </h4>

          <!-- 条形码标识 - 对应V1.1: emerald-50/200 -->
          <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs text-emerald-600 block font-medium">条形码</span>
                <span class="text-2xl font-mono font-bold text-emerald-700">{{ selectedMaterial.barcode }}</span>
              </div>
              <Barcode class="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <!-- 基本信息网格 - 对应V1.1: 4列,16 个字段 -->
          <div class="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span class="text-xs text-gray-500 block">物料编码</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.code }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">物料名称</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.name }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">物料分类</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.category }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">规格型号</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.specification }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">单位</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">当前库存</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.quantity }} {{ selectedMaterial.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最低库存</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.minStock }} {{ selectedMaterial.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最高库存</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.maxStock }} {{ selectedMaterial.unit }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">单价</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.price }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.supplier }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">存放位置</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.location }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">批次号</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.batchNo }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">生产日期</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.productionDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">有效期至</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.expiryDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">最后更新时间</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedMaterial.lastUpdateTime }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">数据状态</span>
              <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="selectedMaterial.dataStatus === '启用' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ selectedMaterial.dataStatus }}
              </span>
            </div>
          </div>

          <!-- 库存预警 - 对应V1.1: quantity < minStock 时显示 -->
          <div v-if="selectedMaterial.quantity < selectedMaterial.minStock" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div class="flex items-center gap-2">
              <span class="text-red-600 text-sm font-medium">⚠️ 库存预警</span>
            </div>
            <p class="text-red-600 text-sm mt-1">
              当前库存 ({{ selectedMaterial.quantity }}) 低于最低库存警戒线 ({{ selectedMaterial.minStock }})，请及时补充。
            </p>
          </div>
        </div>
    </ElModal>

    <!-- ========== 入库详情弹窗 - 严格对齐 V1.1 WarehouseInboundModals/DetailModal.tsx ========== -->
    <!-- V1.1: UnifiedModal size="xxl" (1080×650),showFooter=true 自定义关闭按钮,emerald-50 信息卡片 5列 + 物料统计 + 13列物料表格 -->
    <ElModal :model-value="showInboundDetailModal" title="入库记录详情" :width="1080" :height="650" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showInboundDetailModal = false }" @close="showInboundDetailModal = false">
      <div v-if="selectedInboundRecord">
        <!-- 基本信息卡片 - 对应V1.1: emerald-50/200,5列(入库单号/日期/供应商/操作员/状态) + 物料统计 -->
        <div class="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库单号</span>
              <span class="text-lg font-mono font-bold text-emerald-700">{{ selectedInboundRecord.code }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库日期</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.inboundDate }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.supplier }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">操作员</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.operator }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">状态</span>
              <span class="text-sm font-medium" :class="{
                'text-green-600': selectedInboundRecord.status === 'completed',
                'text-gray-500': selectedInboundRecord.status === 'voided',
                'text-amber-600': selectedInboundRecord.status !== 'completed' && selectedInboundRecord.status !== 'voided'
              }">
                {{ selectedInboundRecord.status === 'completed' ? '已完成' : (selectedInboundRecord.status === 'voided' ? '已作废' : '待审核') }}
              </span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-emerald-200">
            <span class="text-xs text-emerald-600">物料统计：</span>
            <span class="text-sm font-medium text-gray-900 ml-2">
              共 {{ selectedInboundRecord.materials?.length || 0 }} 种物料，合计 {{ totalInboundQuantity }} 件
            </span>
          </div>
        </div>

        <!-- 物料明细 - 对应V1.1: Package 5×5 + 13列表格(编码/名称/分类/规格/条码/单位/数量/单价/位置/批号/生产日期/有效期/备注) -->
        <div>
          <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Package class="w-5 h-5 text-emerald-600" />
            物料明细
          </h4>
          <div class="overflow-auto rounded-lg border border-gray-200 max-h-96">
            <table class="min-w-full text-xs">
              <thead>
                <tr>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">物料编码</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">物料名称</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">分类</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">规格</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">条形码</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">单位</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">数量</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">单价</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">供应商</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">存放位置</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">批号</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">生产日期</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">有效期至</th>
                  <th class="text-sm font-semibold text-gray-600 whitespace-nowrap px-3 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(m, idx) in (selectedInboundRecord.materials || [])" :key="idx" class="hover:bg-gray-50">
                  <td class="text-xs text-blue-600 font-medium whitespace-nowrap px-3 py-2">{{ m.materialCode || m.code || '-' }}</td>
                  <td class="text-xs text-gray-900 whitespace-nowrap px-3 py-2">{{ m.materialName || m.name || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.category || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.spec || m.specification || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.barcode || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.unit || '-' }}</td>
                  <td class="text-xs text-gray-900 whitespace-nowrap px-3 py-2">{{ m.quantity }}</td>
                  <td class="text-xs text-gray-900 whitespace-nowrap px-3 py-2">{{ m.price || m.unitPrice || 0 }}元</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.supplier || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.location || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.batchNo || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.productionDate || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.expiryDate || '-' }}</td>
                  <td class="text-xs text-gray-600 whitespace-nowrap px-3 py-2">{{ m.remark || m.remarks || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showInboundDetailModal = false">关闭</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 导出格式选择弹窗 ========== -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      :export-file-type="exportFormat"
      :selected-count="selectedRows.length"
      @update:export-file-type="(v) => exportFormat = v"
      @confirm="handleDoExport"
    />

    <!-- 物料编辑弹窗 - 子组件 -->
    <MaterialEditModal
      :material="selectedMaterial"
      :is-open="showEditModal"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />

    <!-- 物料新增弹窗 - 对应V1.1 MaterialCreateModal size=xxl(1080x650) -->
    <ElModal :model-value="showAddMaterialModal" title="新增物料" :width="1080" :height="650" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showAddMaterialModal = false }" @close="showAddMaterialModal = false">
      <div class="space-y-4 overflow-y-auto">
        <!-- 编码生成器 - 对应V1.1 WarehouseInboundCodeGen: bg-white -->
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-900 mb-1">大类</label>
              <select v-model="materialCodeGen.bigCategory" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" @change="materialCodeGen.midCategory = ''; materialCodeGen.subCategory = ''; materialCodeGen.generatedCode = ''">
                <option value="">请选择</option>
                <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.code }}-{{ b.name }}</option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-900 mb-1">中类</label>
              <select v-model="materialCodeGen.midCategory" :disabled="!materialCodeGen.bigCategory" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400" @change="materialCodeGen.subCategory = ''; materialCodeGen.generatedCode = ''">
                <option value="">请选择</option>
                <option v-for="m in materialMidOptions" :key="m.code" :value="m.code">{{ m.code }}-{{ m.name }}</option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-900 mb-1">小类</label>
              <select v-model="materialCodeGen.subCategory" :disabled="!materialCodeGen.midCategory" class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400" @change="materialCodeGen.generatedCode = ''">
                <option value="">请选择</option>
                <option v-for="s in materialSubOptions" :key="s.code" :value="s.code">{{ s.code }}-{{ s.name }}</option>
              </select>
            </div>
            <div class="col-span-3">
              <label class="block text-sm font-medium text-gray-900 mb-1">
                生成编码
                <span v-if="materialCodeGenSuccess && !materialCodeGenError" class="ml-2 text-sm text-green-600 font-normal">{{ materialCodeGenSuccess }}</span>
                <span v-if="materialCodeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ materialCodeGenError }}</span>
              </label>
              <div class="flex gap-2">
                <input :value="materialCodeGen.generatedCode" readonly placeholder="点击生成" class="w-40 h-10 px-3 border border-gray-400 rounded-lg text-sm bg-gray-50 shadow-inner" />
                <button class="h-10 px-4 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!materialCodeGen.subCategory" @click="handleGenerateMaterialCode">
                  <Wand2 class="w-4 h-4" />生成
                </button>
                <button class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!materialCodeGen.generatedCode" @click="handleCopyMaterialCode">
                  {{ materialCopySuccess ? '已复制!' : '复制' }}
                </button>
                <button class="h-10 px-4 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleResetMaterialCodeGen">
                  <RotateCcw class="w-4 h-4" />重置
                </button>
              </div>
            </div>
          </div>
          <!-- I/O风险提示 -->
          <div class="mt-2 text-xs text-amber-600 flex items-start gap-1">
            <span class="font-bold">⚠️</span>
            <span>部分大类（如 OP/IT/OT）编码含字母 I/O，与数字 1/0 形近。生成后请人工核对，避免抄录/扫描时误读。</span>
          </div>
        </div>

        <!-- 基本信息 - 对应V1.1: 2-col布局 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">物料编码 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.code" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="使用上方编码生成器自动生成，或手动输入" />
            <div v-if="hasIOChar(newMaterial.code)" class="mt-1 text-xs text-amber-600 flex items-start gap-1">
              <span class="font-bold">⚠️</span>
              <span>编码含字母 I/O，与数字 1/0 形近，建议核对或替换</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">物料名称 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.name" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：尿素 50kg/袋" />
          </div>
        </div>

        <!-- 分类 - 对应V1.1: 3-col布局 -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">大类 <span class="text-red-500">*</span></label>
            <select v-model="materialCodeGen.bigCategory" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" @change="materialCodeGen.midCategory = ''; materialCodeGen.subCategory = ''; materialCodeGen.generatedCode = ''">
              <option value="">请选择大类</option>
              <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">中类 <span class="text-red-500">*</span></label>
            <select v-model="materialCodeGen.midCategory" :disabled="!materialCodeGen.bigCategory" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400" @change="materialCodeGen.subCategory = ''; materialCodeGen.generatedCode = ''">
              <option value="">请选择中类</option>
              <option v-for="m in materialMidOptions" :key="m.code" :value="m.code">{{ m.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">小类 <span class="text-red-500">*</span></label>
            <select v-model="materialCodeGen.subCategory" :disabled="!materialCodeGen.midCategory" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner disabled:bg-gray-100 disabled:text-gray-400" @change="materialCodeGen.generatedCode = ''">
              <option value="">请选择小类</option>
              <option v-for="s in materialSubOptions" :key="s.code" :value="s.code">{{ s.name }}</option>
            </select>
          </div>
        </div>

        <!-- 规格 + 单位 - 对应V1.1: 2-col -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">规格型号 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.specification" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：50kg/袋" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">单位 <span class="text-red-500">*</span></label>
            <input v-model="newMaterial.unit" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：袋 / 瓶 / 箱 / 公斤" />
          </div>
        </div>

        <!-- 库存阈值 - 对应V1.1: 2-col -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">最低库存</label>
            <input v-model="minStockInput" type="number" min="0" step="0.01" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="0" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">最高库存</label>
            <input v-model="maxStockInput" type="number" min="0" step="0.01" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="0" />
          </div>
        </div>

        <!-- 价格 + 供应商 - 对应V1.1: 2-col -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">单价(元)</label>
            <input v-model="newMaterial.price" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：85.00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">供应商</label>
            <input v-model="newMaterial.supplier" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：中化化肥有限公司" />
          </div>
        </div>

        <!-- 存放位置 + 条码 - 对应V1.1: 2-col -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">存放位置</label>
            <input v-model="newMaterial.location" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="如：A区-01-01" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-1">条码</label>
            <input v-model="newMaterial.barcode" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner" placeholder="选填" />
          </div>
        </div>

        <!-- 数据状态 - 对应V1.1: Select下拉 -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">数据状态</label>
          <select v-model="newMaterial.dataStatus" class="w-full px-4 py-3 border border-gray-400 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-inner">
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="handleCancelAddMaterial">取消</el-button>
          <el-button type="primary" size="small" @click="handleSaveAddMaterial">保存</el-button>
        </div>
      </template>
    </ElModal>

    <!-- 物料删除确认弹窗 - 子组件 -->
    <MaterialDeleteConfirmModal
      :material="selectedMaterial"
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- 批量删除警告弹窗 - 子组件 -->
    <DeleteWarningDialog
      :is-open="showDeleteWarning"
      @close="showDeleteWarning = false"
      @confirm="handleToolbarConfirmDeleteWarning"
    />

    <!-- 批量删除确认弹窗 - 子组件 -->
    <BatchDeleteConfirmDialog
      :is-open="showBatchDeleteConfirm"
      :selected-materials="selectedRows"
      @close="showBatchDeleteConfirm = false"
      @confirm="handleConfirmBatchDelete"
    />

    <!-- ========== 入库记录编辑弹窗 - 严格对齐 V1.1 WarehouseInboundModals/EditModal.tsx ========== -->
    <!-- V1.1: UnifiedModal size="xl" (900×600),showFooter=true 自定义 footer,completed 显示申请作废,pending 显示保存 -->
    <ElModal :model-value="showInboundEditModal" title="编辑入库记录" :width="900" :height="600" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showInboundEditModal = false }" @close="showInboundEditModal = false">
      <div v-if="selectedInboundRecord" class="overflow-y-auto flex-1">
        <!-- 状态提示: completed 不可编辑,voided 已作废只读 -->
        <div v-if="selectedInboundRecord.status === 'completed'" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span class="text-sm text-amber-700">此记录已完成，物料明细不可编辑。如需修改请申请作废后重新录入。</span>
        </div>
        <div v-if="selectedInboundRecord.status === 'voided'" class="mb-4 p-3 bg-gray-100 border border-gray-400 rounded-lg flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span class="text-sm text-gray-600">此记录已作废，仅供查看，无法编辑。</span>
        </div>

        <!-- 基本信息 - 对应V1.1: bg-gray-50 + 5列(单号/日期/供应商/操作员/状态) -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span class="text-xs text-gray-500 block">入库单号</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.code }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">入库日期</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.inboundDate }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">供应商</span>
              <input v-if="selectedInboundRecord.status === 'pending'" v-model="inboundEditForm.supplier" type="text" placeholder="选择或输入供应商名称" list="edit-supplier-list" class="h-7 px-2 text-sm border border-gray-300 rounded w-full" />
              <span v-else class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.supplier }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">操作员</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedInboundRecord.operator }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">状态</span>
              <span class="text-sm font-medium" :class="{
                'text-amber-600': selectedInboundRecord.status === 'pending',
                'text-green-600': selectedInboundRecord.status === 'completed',
                'text-gray-500': selectedInboundRecord.status === 'voided'
              }">
                {{ selectedInboundRecord.status === 'pending' ? '待审核' : (selectedInboundRecord.status === 'completed' ? '已完成' : '已作废') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 物料明细 - 对应V1.1: 标题(N种物料) + 添加物料按钮 + 11列表格 -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ inboundEditForm.materials?.length || 0 }}种物料）</h4>
            <button v-if="selectedInboundRecord.status === 'pending'" class="h-7 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleAddInboundEditMaterial">
              <Plus class="w-3 h-3" />添加物料
            </button>
          </div>
          <div v-if="(inboundEditForm.materials?.length || 0) > 0" class="overflow-auto rounded-lg border border-gray-200 bg-white max-h-80">
            <table class="text-xs" style="min-width: 1200px;">
              <thead>
                <tr>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">操作</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">物料编码</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">物料名称</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">分类</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">规格</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">单位</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">数量</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">单价</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">批号</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">生产日期</th>
                  <th class="px-2 py-2 text-xs font-semibold text-blue-800 text-left whitespace-nowrap">有效期至</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(m, idx) in inboundEditForm.materials" :key="idx" class="hover:bg-gray-50">
                  <td class="px-2 py-1.5">
                    <button v-if="selectedInboundRecord.status === 'pending'" class="text-red-500 hover:bg-red-50 p-1 rounded inline-flex" @click="handleDeleteInboundEditMaterial(idx)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.materialCode" type="text" class="h-6 px-1 text-xs w-20 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-blue-600 font-medium">{{ m.materialCode || m.code }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.materialName" type="text" placeholder="搜索物料名称" class="h-6 px-1 text-xs w-32 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-900">{{ m.materialName || m.name }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.category" type="text" class="h-6 px-1 text-xs w-24 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.category || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.spec" type="text" class="h-6 px-1 text-xs w-20 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.spec || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.unit" type="text" class="h-6 px-1 text-xs w-12 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.unit }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model.number="m.quantity" type="number" min="0" class="h-6 px-1 text-xs w-16 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-900">{{ m.quantity }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.unitPrice" type="text" class="h-6 px-1 text-xs w-16 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-900">{{ m.unitPrice || m.price || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.batchNo" type="text" class="h-6 px-1 text-xs w-16 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.batchNo || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.productionDate" type="date" class="h-6 px-1 text-xs w-24 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.productionDate || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5">
                    <input v-if="selectedInboundRecord.status === 'pending'" v-model="m.expiryDate" type="date" class="h-6 px-1 text-xs w-24 border border-gray-300 rounded" />
                    <span v-else class="text-xs text-gray-600">{{ m.expiryDate || '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4 text-sm text-gray-500 border border-gray-200 rounded-lg">
            暂无物料明细
          </div>
        </div>
      </div>

      <!-- footer: completed→申请作废(warning), pending→保存(blue), 全部→关闭(secondary) -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <button v-if="selectedInboundRecord?.status === 'completed'" class="h-8 px-4 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="handleApplyVoid">
            <XCircle class="w-4 h-4" />申请作废
          </button>
          <button v-if="selectedInboundRecord?.status === 'pending'" class="h-8 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleSaveInboundEdit">
            <Save class="w-4 h-4" />保存
          </button>
          <el-button size="small" @click="showInboundEditModal = false">关闭</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 入库记录删除确认弹窗 ========== -->
    <DeleteWarningModal
      :is-open="showInboundDeleteModal"
      :selected-count="1"
      title="删除确认"
      :description="inboundDeleteDescription"
      @close="showInboundDeleteModal = false"
      @confirm="handleConfirmInboundDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Package, AlertTriangle, Download, Search, Plus, RefreshCw, Wand2, Copy, RotateCcw, ChevronDown, ChevronRight, Edit, Edit2, Trash2, Barcode, Save, XCircle } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { ElModal } from '@/components/ui'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { getMaterials, getInboundRecords } from '@/api/material/apiWarehouseMaterialService'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'
import { bigCategoriesList, categoryConfig } from '@/types/warehouseInbound.js'
import ActionToolbar from './components/ActionToolbar.vue'
import MaterialFilters from './components/MaterialFilters.vue'
import MaterialEditModal from './components/MaterialEditModal.vue'
import MaterialDeleteConfirmModal from './components/MaterialDeleteConfirmModal.vue'
import DeleteWarningDialog from './components/DeleteWarningDialog.vue'
import BatchDeleteConfirmDialog from './components/BatchDeleteConfirmDialog.vue'
import Pagination from '@/components/ui/Pagination/Pagination.vue'

// 大类选项（复用 @/types/warehouseInbound.js 中的 V1.1 完整配置）
const bigCategories = Object.entries(categoryConfig).map(([code, data]) => ({
  code,
  name: data.name
}))

// 单位选项 - 严格对齐 V1.1 AddInboundModal.tsx 第 211-218 行（8 个固定单位）
const unitOptions = ['袋', '箱', '台', '卷', '个', '把', '双', '套']

// Mock数据（仅用于API不可用时的fallback，与V1.1数据格式一致）
const mockWarehouseMaterials = ref([
  { id: 1, code: 'SP0201001', name: '商品有机肥', category: '肥料与土壤改良剂', specification: '50kg/袋', barcode: '6901234567890', unit: '袋', quantity: 150, minStock: 30, maxStock: 500, price: '45.00', supplier: '有机肥供应商A', location: 'A-01-01', batchNo: 'YC20260301', productionDate: '2026-03-01', expiryDate: '2027-03-01', lastUpdateTime: '2026-05-20', dataStatus: '启用' },
  { id: 2, code: 'SP0202001', name: '尿素', category: '肥料与土壤改良剂', specification: '50kg/袋', barcode: '6901234567891', unit: '袋', quantity: 80, minStock: 20, maxStock: 300, price: '85.00', supplier: '化肥供应商B', location: 'A-02-01', batchNo: 'HF20260315', productionDate: '2026-03-15', expiryDate: '2027-03-15', lastUpdateTime: '2026-05-18', dataStatus: '启用' },
  { id: 3, code: 'SP0301001', name: '吡虫啉', category: '农药与植保产品', specification: '100g/瓶', barcode: '6901234567892', unit: '瓶', quantity: 120, minStock: 20, maxStock: 400, price: '28.00', supplier: '农药供应商C', location: 'B-02-03', batchNo: 'NY20260220', productionDate: '2026-02-20', expiryDate: '2027-02-20', lastUpdateTime: '2026-05-15', dataStatus: '启用' },
  { id: 4, code: 'SP0302001', name: '多菌灵', category: '农药与植保产品', specification: '200g/袋', barcode: '6901234567893', unit: '袋', quantity: 15, minStock: 20, maxStock: 200, price: '35.00', supplier: '农药供应商C', location: 'C-03-01', batchNo: 'NY20260110', productionDate: '2026-01-10', expiryDate: '2027-01-10', lastUpdateTime: '2026-05-12', dataStatus: '启用' },
  { id: 5, code: 'SP0103001', name: '番茄种子', category: '种质资源', specification: '50g/袋', barcode: '6901234567894', unit: '袋', quantity: 60, minStock: 10, maxStock: 200, price: '120.00', supplier: '种子供应商D', location: 'A-02-01', batchNo: 'ZZ20260201', productionDate: '2026-02-01', expiryDate: '2027-02-01', lastUpdateTime: '2026-05-10', dataStatus: '启用' },
  { id: 6, code: 'OP0201001', name: '锄头', category: '工具与器械', specification: '标准型', barcode: '6901234567895', unit: '把', quantity: 35, minStock: 10, maxStock: 100, price: '42.00', supplier: '劳保供应商E', location: 'C-04-01', batchNo: 'LB20260228', productionDate: '2026-02-28', expiryDate: '2029-02-28', lastUpdateTime: '2026-05-08', dataStatus: '启用' },
  { id: 7, code: 'EQ0306001', name: '滴灌带', category: '农业机械', specification: '50m/卷', barcode: '6901234567896', unit: '卷', quantity: 200, minStock: 50, maxStock: 800, price: '38.00', supplier: '农机供应商F', location: 'C-05-01', batchNo: 'NJ20260210', productionDate: '2026-02-10', expiryDate: '2028-02-10', lastUpdateTime: '2026-05-06', dataStatus: '启用' },
])

const mockInboundRecords = ref([
  { id: 1, code: 'RK20260121-001', materialCode: 'SP0201001', materialName: '商品有机肥', quantity: 50, unit: '袋', supplier: '有机肥供应商A', inboundDate: '2026-01-21', operator: '张伟民', status: 'completed', materials: [{ materialCode: 'SP0201001', materialName: '商品有机肥', spec: '50kg/袋', unit: '袋', quantity: 50, unitPrice: 45, batchNo: 'YC20260301', productionDate: '2026-03-01', expiryDate: '2027-03-01', location: 'A-01-01', remark: '正常入库' }] },
  { id: 2, code: 'RK20260120-001', materialCode: 'SP0202001', materialName: '尿素', quantity: 100, unit: '袋', supplier: '化肥供应商B', inboundDate: '2026-01-20', operator: '李明轩', status: 'pending', materials: [{ materialCode: 'SP0202001', materialName: '尿素', spec: '50kg/袋', unit: '袋', quantity: 100, unitPrice: 85, batchNo: 'HF20260315', productionDate: '2026-03-15', expiryDate: '2027-03-15', location: 'A-02-01', remark: '待审核' }] },
])

// Store
const warehouseMaterialStore = useWarehouseMaterialStore()
const inboundStore = useInboundStore()

// 物料数据（从Store/API加载）
const warehouseMaterials = ref([])
const inboundRecordsData = ref([])
const loading = ref(false)

// 从Store/API加载数据
const loadMaterials = async () => {
  loading.value = true
  try {
    await warehouseMaterialStore.loadMaterials()
    const storeList = warehouseMaterialStore.materials || []
    if (storeList.length > 0) {
      warehouseMaterials.value = storeList
    } else {
      const data = await getMaterials()
      warehouseMaterials.value = Array.isArray(data) ? data : (data.data || [])
    }
  } catch (error) {
    console.error('加载物料数据失败:', error)
    ElMessage.error('加载物料数据失败')
  } finally {
    loading.value = false
  }
}

const loadInboundRecords = async () => {
  try {
    const data = await getInboundRecords()
    inboundRecordsData.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('加载入库记录失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadMaterials()
  loadInboundRecords()
})

// 状态
const activeTab = ref('inbound')
const codeGenExpanded = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const inboundPage = ref(1)
const inboundPageSize = ref(10)
const showLowStock = ref(false)
const exportMode = ref(false)
const selectedRows = ref([])
const exportFormat = ref('excel')
const showExportModal = ref(false)
const showAddModal = ref(false)
const codeError = ref('')
const nameError = ref('')
const copySuccess = ref(false)
// 编辑/删除弹窗状态
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showInboundEditModal = ref(false)
const showInboundDeleteModal = ref(false)
// 批量操作模式
const batchEditMode = ref(false)
const deleteMode = ref(false)
const showDeleteWarning = ref(false)
const showBatchDeleteConfirm = ref(false)

// 入库记录搜索和操作状态 - 对应V1.1 MaterialInboundTab
const inboundSearchCode = ref('')
const inboundSearchSupplier = ref('')
const inboundSearchStatus = ref('')
const inboundSearchMaterialName = ref('')
const inboundSearchMaterialCode = ref('')
const inboundExpandedRows = ref(new Set())
const inboundEditMode = ref(false)
const inboundDeleteMode = ref(false)
const inboundExportMode = ref(false)
const inboundSelectedRows = ref([])
const showInboundEditWarning = ref(false)

// 筛选状态
const filters = reactive({
  code: '',
  name: '',
  category: '全部',
  supplier: '',
  location: '',
  searchBigCategory: '',
  searchMidCategory: '',
  searchSubCategory: ''
})

const inboundRecords = computed(() => {
  return inboundRecordsData.value.length > 0 ? inboundRecordsData.value : mockInboundRecords.value
})

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 新增入库表单 - 对应V1.1 InboundAddModal
const newInbound = reactive({
  orderCode: '',
  inboundDate: new Date().toISOString().slice(0, 10),
  supplier: '',
  operator: '' // 默认当前登录用户名,通过弹窗打开时设置
})

// V1.1 InboundAddModal 物料明细数组 - 每条入库记录可包含多种物料
const addInboundMaterials = ref([])

// V1.1 handleAddMaterial: 添加新物料行
const handleAddInboundMaterial = () => {
  addInboundMaterials.value.push({
    id: Date.now() + Math.random(),
    materialCode: '',
    materialName: '',
    category: '',
    bigCategory: '',
    midCategory: '',
    subCategory: '',
    specification: '',
    barcode: '',
    unit: '袋',
    quantity: 0,
    price: '',
    supplier: newInbound.supplier || '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    remarks: ''
  })
}

// V1.1 handleDeleteMaterial: 删除物料行
const handleDeleteInboundMaterial = (idx) => {
  addInboundMaterials.value.splice(idx, 1)
}

// 计算属性
const filteredMaterials = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return source.filter(m => {
    if (filters.code && !m.code.includes(filters.code)) return false
    if (filters.name && !m.name.includes(filters.name)) return false
    if (filters.supplier && m.supplier !== filters.supplier) return false
    if (filters.location && m.location !== filters.location) return false
    if (filters.searchBigCategory && !m.code.startsWith(filters.searchBigCategory)) return false
    if (filters.searchMidCategory && !m.code.slice(2, 4).startsWith(filters.searchMidCategory)) return false
    if (filters.searchSubCategory && !m.code.slice(4, 6).startsWith(filters.searchSubCategory)) return false
    if (showLowStock.value && m.quantity >= m.minStock) return false
    return true
  })
})

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMaterials.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredMaterials.value.length / pageSize.value) || 1)

const lowStockCount = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return source.filter(m => m.quantity < m.minStock).length
})

const toolbarFilters = computed(() => ({
  ...filters,
  showLowStock: showLowStock.value
}))

// 编码生成器状态

// 入库记录搜索过滤 - 对应V1.1 MaterialInboundTab
const filteredInboundRecords = computed(() => {
  return inboundRecords.value.filter(record => {
    if (inboundSearchCode.value && !record.code.toLowerCase().includes(inboundSearchCode.value.toLowerCase())) return false
    if (inboundSearchSupplier.value && !record.supplier.toLowerCase().includes(inboundSearchSupplier.value.toLowerCase())) return false
    if (inboundSearchStatus.value && record.status !== inboundSearchStatus.value) return false
    if (inboundSearchMaterialName.value || inboundSearchMaterialCode.value) {
      const hasMatch = record.materials.some(m => {
        const nameMatch = !inboundSearchMaterialName.value || (m.materialName && m.materialName.toLowerCase().includes(inboundSearchMaterialName.value.toLowerCase()))
        const codeMatch = !inboundSearchMaterialCode.value || (m.materialCode && m.materialCode.toLowerCase().includes(inboundSearchMaterialCode.value.toLowerCase()))
        return nameMatch && codeMatch
      })
      if (!hasMatch) return false
    }
    return true
  })
})

const isInboundAllSelected = computed(() => {
  if (inboundDeleteMode.value) {
    const pendingRecords = filteredInboundRecords.value.filter(r => r.status === 'pending')
    return pendingRecords.length > 0 && pendingRecords.every(r => inboundSelectedRows.value.includes(r.id))
  }
  return filteredInboundRecords.value.length > 0 && inboundSelectedRows.value.length === filteredInboundRecords.value.length
})

const isFormValid = computed(() => {
  return !codeError.value && !nameError.value && newInbound.materialCode && newInbound.materialName && newInbound.quantity
})

// 编码生成器中类选项
const codeGenMidCategories = computed(() => {
  if (!codeGen.bigCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  return Object.entries((bigCat).categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const codeGenSubCategories = computed(() => {
  if (!codeGen.bigCategory || !codeGen.midCategory) return []
  const bigCat = categoryConfig[codeGen.bigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[codeGen.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

const modalMidCategories = computed(() => codeGenMidCategories.value)
const modalSubCategories = computed(() => {
  if (!newInbound.bigCategory || !newInbound.midCategory) return []
  const bigCat = categoryConfig[newInbound.bigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[newInbound.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name,
    prefix: data.prefix
  }))
})

// 方法
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
}

const handleLowStockClick = () => {
  showLowStock.value = !showLowStock.value
  currentPage.value = 1
}

// 对应V1.1 handleFiltersChange - 筛选条件变更
const handleFiltersChange = (newFilters) => {
  Object.assign(filters, newFilters)
  if (newFilters.showLowStock !== undefined) {
    showLowStock.value = newFilters.showLowStock
  }
  currentPage.value = 1
}

const handleLowStockFilterChange = () => {
  currentPage.value = 1
}

const handleFilterChange = (field, value) => {
  (filters)[field] = value
  currentPage.value = 1
}

const handleBigCategoryChange = () => {
  filters.searchMidCategory = ''
  filters.searchSubCategory = ''
}

const handleMidCategoryChange = () => {
  filters.searchSubCategory = ''
}

const handleReset = () => {
  filters.code = ''
  filters.name = ''
  filters.category = '全部'
  filters.supplier = ''
  filters.location = ''
  filters.searchBigCategory = ''
  filters.searchMidCategory = ''
  filters.searchSubCategory = ''
  showLowStock.value = false
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleInboundPageSizeChange = (size) => {
  inboundPageSize.value = size
  inboundPage.value = 1
}

// 全选当前页
const isAllSelected = computed(() => {
  return paginatedMaterials.value.length > 0 &&
    paginatedMaterials.value.every(row => selectedRows.value.some(s => s.id === row.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const pageIds = new Set(paginatedMaterials.value.map(r => r.id))
    selectedRows.value = selectedRows.value.filter(s => !pageIds.has(s.id))
  } else {
    const currentIds = new Set(selectedRows.value.map(s => s.id))
    const newRows = paginatedMaterials.value.filter(r => !currentIds.has(r.id))
    selectedRows.value = [...selectedRows.value, ...newRows]
  }
}

const toggleSelectRow = (row) => {
  const idx = selectedRows.value.findIndex(s => s.id === row.id)
  if (idx !== -1) {
    selectedRows.value = selectedRows.value.filter(s => s.id !== row.id)
  } else {
    selectedRows.value = [...selectedRows.value, row]
  }
}

const handleDoExport = () => {
  const dataToExport = selectedRows.value.length > 0
    ? selectedRows.value
    : filteredMaterials.value

  const headers = ['物料编号', '物料名称', '分类', '单位', '库存数量', '最低库存', '单价', '供应商', '存放位置']
  const exportData = dataToExport.map(m => ({
    '物料编号': m.code,
    '物料名称': m.name,
    '分类': m.category,
    '单位': m.unit,
    '库存数量': m.quantity,
    '最低库存': m.minStock,
    '单价': m.price,
    '供应商': m.supplier,
    '存放位置': m.location
  }))

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => `"${(row)[h]}"`).join(','))
    ].join('\n')
    const BOM = '﻿'
    content = BOM + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料库存</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map(h => `<td>${(row)[h]}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料库存_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exportMode.value = false
  selectedRows.value = []
  ElMessage.success('导出成功')
}

// 编码生成器方法
const handleCodeGenBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
}

const handleCodeGenMidCategoryChange = () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
}

const handleCodeGenSubCategoryChange = () => {
  codeGen.generatedCode = ''
}

const handleCodeGen = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请先选择大类、中类、小类'
    return
  }

  const subCat = codeGenSubCategories.value.find(s => s.code === codeGen.subCategory)
  if (!subCat) return

  const prefix = (subCat).prefix
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const existingCodes = source
    .filter(m => m.code.startsWith(prefix))
    .map(m => parseInt(m.code.slice(-3)))

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  codeGen.generatedCode = prefix + newSeq
  codeGenSuccess.value = '编码已生成！'
}

const handleVerifyCode = () => {
  if (!codeGen.generatedCode) {
    codeGenError.value = '请先生成编码'
    return
  }

  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.code === codeGen.generatedCode)
  if (exists) {
    codeGenError.value = '警告：该编码已在库存中存在！'
    codeGenSuccess.value = ''
  } else {
    codeGenError.value = ''
    codeGenSuccess.value = '验证通过：该编码可以使用！'
  }
}

const handleCopyCode = () => {
  if (!codeGen.generatedCode) return
  navigator.clipboard.writeText(codeGen.generatedCode)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

const handleResetCodeGen = () => {
  codeGen.bigCategory = ''
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

// 新增入库相关方法
const handleAddInbound = () => {
  showAddModal.value = true
}

// 入库记录展开/折叠 - 对应V1.1 toggleExpandRow
const toggleInboundExpand = (id) => {
  const newSet = new Set(inboundExpandedRows.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  inboundExpandedRows.value = newSet
}

// 入库记录全选 - 对应V1.1 handleSelectAll
const handleInboundSelectAll = () => {
  if (inboundDeleteMode.value) {
    const pendingIds = filteredInboundRecords.value.filter(r => r.status === 'pending').map(r => r.id)
    const allPendingSelected = pendingIds.every(id => inboundSelectedRows.value.includes(id))
    if (allPendingSelected) {
      inboundSelectedRows.value = inboundSelectedRows.value.filter(id => !pendingIds.includes(id))
    } else {
      inboundSelectedRows.value = [...inboundSelectedRows.value.filter(id => !pendingIds.includes(id)), ...pendingIds]
    }
  } else {
    if (inboundSelectedRows.value.length === filteredInboundRecords.value.length) {
      inboundSelectedRows.value = []
    } else {
      inboundSelectedRows.value = filteredInboundRecords.value.map(r => r.id)
    }
  }
}

// 入库记录单选 - 对应V1.1 handleSelectRow
const handleInboundSelectRow = (id) => {
  if (inboundSelectedRows.value.includes(id)) {
    inboundSelectedRows.value = inboundSelectedRows.value.filter(r => r !== id)
  } else {
    inboundSelectedRows.value = [...inboundSelectedRows.value, id]
  }
}

// 入库记录取消选择 - 对应V1.1 handleCancelSelection
const handleInboundCancelSelection = () => {
  inboundEditMode.value = false
  inboundDeleteMode.value = false
  inboundExportMode.value = false
  inboundSelectedRows.value = []
}

// 入库记录确认编辑 - 对应V1.1 handleConfirmEdit
const handleInboundConfirmEdit = () => {
  if (inboundSelectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  showInboundEditWarning.value = true
}

// 入库记录确认删除 - 对应V1.1 handleConfirmDelete
const handleInboundConfirmDelete = () => {
  if (inboundSelectedRows.value.length > 0) {
    const selectedRecords = inboundRecords.value.filter(r => inboundSelectedRows.value.includes(r.id))
    if (selectedRecords.length > 0) {
      const idsToDelete = selectedRecords.map(r => r.id)
      inboundRecordsData.value = inboundRecordsData.value.filter(r => !idsToDelete.includes(r.id))
      ElMessage.success('已删除选中入库记录')
    }
  }
  handleInboundCancelSelection()
}

// 入库记录确认导出 - 对应V1.1 handleConfirmExport
const handleInboundConfirmExport = () => {
  ElMessage.info('入库记录导出功能')
  handleInboundCancelSelection()
}

// 入库搜索重置
const handleResetInboundSearch = () => {
  inboundSearchCode.value = ''
  inboundSearchSupplier.value = ''
  inboundSearchStatus.value = ''
  inboundSearchMaterialName.value = ''
  inboundSearchMaterialCode.value = ''
}

const generateOrderCode = () => {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const sourceRecords = inboundRecords.value.length > 0 ? inboundRecords.value : mockInboundRecords.value
  const todayRecords = sourceRecords.filter(r => r.code.startsWith(`RK${dateStr}`))
  let maxSeq = 0
  if (todayRecords.length > 0) {
    const sequences = todayRecords.map(r => parseInt(r.code.split('-')[1] || '0'))
    maxSeq = Math.max(...sequences)
  }
  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  newInbound.orderCode = `RK${dateStr}-${newSeq}`
}

const handleGenerateCodeInModal = () => {
  if (!newInbound.bigCategory || !newInbound.midCategory || !newInbound.subCategory) {
    codeError.value = '请先选择大类、中类、小类'
    return
  }

  const subCat = modalSubCategories.value.find(s => s.code === newInbound.subCategory)
  if (!subCat) return

  const prefix = (subCat).prefix
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const existingCodes = source
    .filter(m => m.code.startsWith(prefix))
    .map(m => parseInt(m.code.slice(-3)))

  let maxSeq = 0
  if (existingCodes.length > 0) {
    maxSeq = Math.max(...existingCodes)
  }

  const newSeq = (maxSeq + 1).toString().padStart(3, '0')
  newInbound.materialCode = prefix + newSeq
  checkCodeDuplicate()
}

const handleModalBigCategoryChange = () => {
  newInbound.midCategory = ''
  newInbound.subCategory = ''
  newInbound.materialCode = ''
}

const handleModalMidCategoryChange = () => {
  newInbound.subCategory = ''
  newInbound.materialCode = ''
}

const checkCodeDuplicate = () => {
  if (!newInbound.materialCode) return
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.code === newInbound.materialCode)
  if (exists) {
    codeError.value = '该物料编码已存在，请重新选择分类'
  } else {
    codeError.value = ''
  }
}

const checkNameDuplicate = () => {
  if (!newInbound.materialName) return
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  const exists = source.some(m => m.name === newInbound.materialName)
  if (exists) {
    nameError.value = '该物料名称已存在'
  } else {
    nameError.value = ''
  }
}

const handleSaveInbound = async () => {
  if (codeError.value || nameError.value) return
  if (!newInbound.materialCode || !newInbound.materialName || !newInbound.quantity) return

  try {
    await inboundStore.addItem({
      code: newInbound.orderCode || `RK${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(inboundRecordsData.value.length + 1).padStart(3,'0')}`,
      materialCode: newInbound.materialCode,
      materialName: newInbound.materialName,
      quantity: Number(newInbound.quantity),
      unit: newInbound.unit,
      supplier: newInbound.supplier,
      inboundDate: newInbound.inboundDate || new Date().toISOString().slice(0, 10),
      operator: newInbound.operator,
      status: 'pending',
      materials: [{
        materialCode: newInbound.materialCode,
        materialName: newInbound.materialName,
        spec: '',
        unit: newInbound.unit,
        quantity: Number(newInbound.quantity),
        unitPrice: 0,
        batchNo: '',
        location: '',
        remark: newInbound.remarks || ''
      }]
    })
    showAddModal.value = false
    resetNewInbound()
    await loadInboundRecords()
    ElMessage.success('入库记录保存成功')
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

const handleCloseModal = () => {
  showAddModal.value = false
  resetNewInbound()
}

const resetNewInbound = () => {
  newInbound.orderCode = ''
  newInbound.bigCategory = ''
  newInbound.midCategory = ''
  newInbound.subCategory = ''
  newInbound.materialCode = ''
  newInbound.materialName = ''
  newInbound.quantity = ''
  newInbound.unit = '袋'
  newInbound.supplier = ''
  newInbound.inboundDate = ''
  newInbound.operator = ''
  newInbound.remarks = ''
  codeError.value = ''
  nameError.value = ''
}

const showDetailModal = ref(false)
const showInboundDetailModal = ref(false)
const showAddMaterialModal = ref(false)
const selectedMaterial = ref(null)
const selectedInboundRecord = ref(null)

const handleView = (row) => {
  selectedMaterial.value = row
  showDetailModal.value = true
}

const handleViewInbound = (row) => {
  selectedInboundRecord.value = row
  showInboundDetailModal.value = true
}

// ========== 新增物料 ==========

function createEmptyMaterial() {
  return {
    id: null,
    code: '',
    name: '',
    category: '',
    specification: '',
    barcode: '',
    unit: '袋',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    price: '',
    supplier: '',
    location: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    lastUpdateTime: new Date().toISOString().slice(0, 10),
    dataStatus: '启用'
  }
}

const newMaterial = reactive(createEmptyMaterial())

// 编码生成器状态 - V1.1 MaterialCreateModal 对齐
const materialCodeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const materialCodeGenError = ref('')
const materialCodeGenSuccess = ref('')
const materialCopySuccess = ref(false)
const minStockInput = ref('0')
const maxStockInput = ref('0')

// 中类/小类级联选项
const materialMidOptions = computed(() => {
  if (!materialCodeGen.bigCategory) return []
  const bigCat = categoryConfig[materialCodeGen.bigCategory]
  if (!bigCat) return []
  return Object.entries(bigCat.categories).map(([code, data]) => ({ code, name: data.name }))
})
const materialSubOptions = computed(() => {
  if (!materialCodeGen.bigCategory || !materialCodeGen.midCategory) return []
  const bigCat = categoryConfig[materialCodeGen.bigCategory]
  if (!bigCat) return []
  const midCat = bigCat.categories[materialCodeGen.midCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({ code, name: data.name }))
})

// 检测编码含 I/O 字符
const hasIOChar = (code) => /[IO]/.test(code || '')

// 监听分类级联变化 → 自动同步到 newMaterial.category
watch(() => [materialCodeGen.bigCategory, materialCodeGen.midCategory, materialCodeGen.subCategory], () => {
  const bigName = materialCodeGen.bigCategory
    ? (bigCategoriesList.find(b => b.code === materialCodeGen.bigCategory)?.name || '')
    : ''
  const midName = materialCodeGen.bigCategory && materialCodeGen.midCategory
    ? (categoryConfig[materialCodeGen.bigCategory]?.categories?.[materialCodeGen.midCategory]?.name || '')
    : ''
  const subName = materialCodeGen.bigCategory && materialCodeGen.midCategory && materialCodeGen.subCategory
    ? (categoryConfig[materialCodeGen.bigCategory]?.categories?.[materialCodeGen.midCategory]?.subCategories?.[materialCodeGen.subCategory]?.name || '')
    : ''
  newMaterial.category = [bigName, midName, subName].filter(Boolean).join('-')
})

// 监听生成的编码 → 同步到表单（用户可手动覆盖）
watch(() => materialCodeGen.generatedCode, (val) => {
  if (val) newMaterial.code = val
})

// 监听阈值输入 → 同步到 newMaterial
watch(minStockInput, (val) => {
  const num = parseFloat(val)
  newMaterial.minStock = isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100)
})
watch(maxStockInput, (val) => {
  const num = parseFloat(val)
  newMaterial.maxStock = isNaN(num) ? 0 : Math.max(0, Math.round(num * 100) / 100)
})

// 编码生成（按 max+1 算法，对齐 V1.1 warehouseInbound.utils.generateNextMaterialCode）
const handleGenerateMaterialCode = () => {
  if (!materialCodeGen.bigCategory || !materialCodeGen.midCategory || !materialCodeGen.subCategory) {
    materialCodeGenError.value = '请选择完整的分类'
    materialCodeGenSuccess.value = ''
    return
  }
  const baseCode = `${materialCodeGen.bigCategory}${materialCodeGen.midCategory}${materialCodeGen.subCategory}`
  const existingCodes = warehouseMaterials.value
    .map(m => m.code)
    .filter(c => typeof c === 'string' && c.startsWith(baseCode))
  let maxSeq = 0
  for (const code of existingCodes) {
    const seq = parseInt(code.slice(baseCode.length), 10)
    if (!isNaN(seq) && seq > maxSeq && seq < 1000) maxSeq = seq
  }
  const nextSeq = maxSeq + 1
  if (nextSeq > 999) {
    materialCodeGenError.value = '该分类编码已达上限 999'
    materialCodeGenSuccess.value = ''
    return
  }
  const newCode = `${baseCode}${String(nextSeq).padStart(3, '0')}`
  materialCodeGen.generatedCode = newCode
  materialCodeGenSuccess.value = `生成成功: ${newCode}`
  materialCodeGenError.value = ''
}

const handleCopyMaterialCode = async () => {
  if (!materialCodeGen.generatedCode) return
  try {
    await navigator.clipboard.writeText(materialCodeGen.generatedCode)
    materialCopySuccess.value = true
    setTimeout(() => { materialCopySuccess.value = false }, 2000)
  } catch {
    // 旧浏览器 fallback
    const ta = document.createElement('textarea')
    ta.value = materialCodeGen.generatedCode
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    materialCopySuccess.value = true
    setTimeout(() => { materialCopySuccess.value = false }, 2000)
  }
}

const handleResetMaterialCodeGen = () => {
  materialCodeGen.bigCategory = ''
  materialCodeGen.midCategory = ''
  materialCodeGen.subCategory = ''
  materialCodeGen.generatedCode = ''
  materialCodeGenError.value = ''
  materialCodeGenSuccess.value = ''
  materialCopySuccess.value = false
}

const handleToolbarAdd = () => {
  Object.assign(newMaterial, createEmptyMaterial())
  // 重置编码生成器
  handleResetMaterialCodeGen()
  // 重置阈值输入
  minStockInput.value = '0'
  maxStockInput.value = '0'
  showAddMaterialModal.value = true
}

const handleSaveAddMaterial = async () => {
  // 必填校验 - V1.1 validate() 对齐
  if (!newMaterial.code.trim()) {
    ElMessage.warning('请填写物料编码（可用上方编码生成器自动生成）')
    return
  }
  if (!newMaterial.name.trim()) {
    ElMessage.warning('请填写物料名称')
    return
  }
  if (!newMaterial.category) {
    ElMessage.warning('请选择完整分类（大类/中类/小类）')
    return
  }
  if (!newMaterial.specification.trim()) {
    ElMessage.warning('请填写规格型号')
    return
  }
  if (!newMaterial.unit.trim()) {
    ElMessage.warning('请填写单位')
    return
  }
  if (newMaterial.minStock < 0 || newMaterial.maxStock < 0) {
    ElMessage.warning('库存阈值不能为负')
    return
  }
  if (newMaterial.maxStock > 0 && newMaterial.minStock > newMaterial.maxStock) {
    ElMessage.warning('最低库存不能高于最高库存')
    return
  }
  try {
    const data = await getMaterials()
    const list = Array.isArray(data) ? data : (data.data || [])
    const newId = Math.max(0, ...list.map(m => m.id)) + 1
    warehouseMaterials.value = [...warehouseMaterials.value, { ...newMaterial, id: newId }]
    showAddMaterialModal.value = false
    ElMessage.success(`物料 ${newMaterial.code} 创建成功`)
  } catch (error) {
    ElMessage.error('新增失败: ' + (error.message || '未知错误'))
  }
}

const handleCancelAddMaterial = () => {
  showAddMaterialModal.value = false
}

// ========== 批量操作工具栏回调 ==========

const handleToolbarLowStockToggle = () => {
  showLowStock.value = !showLowStock.value
  currentPage.value = 1
}

const handleToolbarBatchEdit = () => {
  batchEditMode.value = true
  selectedRows.value = []
}

const handleToolbarCancelBatchEdit = () => {
  batchEditMode.value = false
  selectedRows.value = []
}

const handleToolbarConfirmBatchEdit = () => {
  if (selectedRows.value.length === 1) {
    selectedMaterial.value = selectedRows.value[0]
    showEditModal.value = true
  } else if (selectedRows.value.length > 1) {
    ElMessage.warning('批量编辑功能暂不支持，请逐条编辑')
  }
  batchEditMode.value = false
  selectedRows.value = []
}

const handleToolbarDelete = () => {
  showDeleteWarning.value = true
}

const handleToolbarConfirmDeleteWarning = () => {
  showDeleteWarning.value = false
  deleteMode.value = true
  selectedRows.value = []
}

const handleToolbarCancelDelete = () => {
  deleteMode.value = false
  selectedRows.value = []
}

const handleToolbarConfirmBatchDelete = () => {
  showBatchDeleteConfirm.value = true
}

const handleConfirmBatchDelete = () => {
  const ids = selectedRows.value.map(r => r.id)
  warehouseMaterials.value = warehouseMaterials.value.filter(m => !ids.includes(m.id))
  showBatchDeleteConfirm.value = false
  deleteMode.value = false
  selectedRows.value = []
  ElMessage.success('批量删除成功')
}

const handleToolbarExport = () => {
  exportMode.value = true
  selectedRows.value = []
}

const handleToolbarConfirmExport = () => {
  showExportModal.value = true
}

const handleToolbarCancelExport = () => {
  exportMode.value = false
  selectedRows.value = []
}

// ========== 物料编辑/删除（单条） ==========

const handleEdit = (material) => {
  selectedMaterial.value = material
  showEditModal.value = true
}

const handleDelete = (material) => {
  selectedMaterial.value = material
  showDeleteModal.value = true
}

const handleConfirmDelete = () => {
  if (selectedMaterial.value) {
    warehouseMaterials.value = warehouseMaterials.value.filter(m => m.id !== selectedMaterial.value.id)
    ElMessage.success('物料已删除')
  }
  showDeleteModal.value = false
  selectedMaterial.value = null
}

const handleSaveEdit = (material) => {
  warehouseMaterials.value = warehouseMaterials.value.map(m => m.id === material.id ? material : m)
  showEditModal.value = false
  selectedMaterial.value = null
  ElMessage.success('物料信息已更新')
}

// ========== 入库记录编辑/删除 ==========

const inboundEditForm = reactive({
  id: null,
  code: '',
  inboundDate: '',
  supplier: '',
  operator: '',
  status: '',
  materials: []
})

// 入库详情弹窗: 物料总数量统计 - 对应V1.1 DetailModal.tsx totalQuantity
const totalInboundQuantity = computed(() => {
  if (!selectedInboundRecord.value?.materials) return 0
  return selectedInboundRecord.value.materials.reduce((sum, m) => sum + Number(m.quantity || 0), 0)
})

// 入库编辑弹窗: 添加物料 - 对应V1.1 EditModal.tsx handleAddMaterial
const handleAddInboundEditMaterial = () => {
  inboundEditForm.materials.push({
    materialCode: '',
    materialName: '',
    category: '',
    spec: '',
    unit: '袋',
    quantity: 0,
    unitPrice: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    location: '',
    remark: ''
  })
}

// 入库编辑弹窗: 删除物料 - 对应V1.1 EditModal.tsx handleDeleteMaterial
const handleDeleteInboundEditMaterial = (idx) => {
  inboundEditForm.materials.splice(idx, 1)
}

// 入库编辑弹窗: 申请作废 - 对应V1.1 EditModal.tsx showAlert('申请作废功能待实现')
const handleApplyVoid = () => {
  ElMessage.warning('申请作废功能待实现')
}

const handleEditInbound = (row) => {
  selectedInboundRecord.value = row
  inboundEditForm.id = row.id
  inboundEditForm.code = row.code
  inboundEditForm.inboundDate = row.inboundDate
  inboundEditForm.supplier = row.supplier
  inboundEditForm.operator = row.operator
  inboundEditForm.status = row.status
  // 深拷贝 materials 数组避免直接修改原数据
  inboundEditForm.materials = (row.materials || []).map(m => ({ ...m }))
  showInboundEditModal.value = true
}

const handleSaveInboundEdit = async () => {
  if (selectedInboundRecord.value) {
    const idx = inboundRecordsData.value.findIndex(r => r.id === selectedInboundRecord.value.id)
    if (idx !== -1) {
      inboundRecordsData.value[idx] = {
        ...inboundRecordsData.value[idx],
        inboundDate: inboundEditForm.inboundDate,
        supplier: inboundEditForm.supplier,
        operator: inboundEditForm.operator,
        status: inboundEditForm.status,
        materials: inboundEditForm.materials.map(m => ({ ...m }))
      }
    }
    ElMessage.success('入库记录已更新')
    // 重新从后端加载以保证数据一致
    await loadInboundRecords()
  }
  showInboundEditModal.value = false
  selectedInboundRecord.value = null
}

const handleDeleteInbound = (row) => {
  selectedInboundRecord.value = row
  showInboundDeleteModal.value = true
}

// 入库删除确认弹窗描述（计算属性，避免模板内字符串转义问题）
const inboundDeleteDescription = computed(() => {
  const code = selectedInboundRecord.value?.code || ''
  return `确定要删除入库记录 <strong>${code}</strong> 吗？<p class='text-red-500 mt-2'>此操作不可撤销！</p>`
})

const handleConfirmInboundDelete = () => {
  if (selectedInboundRecord.value) {
    inboundRecordsData.value = inboundRecordsData.value.filter(r => r.id !== selectedInboundRecord.value.id)
    ElMessage.success('入库记录已删除')
  }
  showInboundDeleteModal.value = false
  selectedInboundRecord.value = null
}
</script>
