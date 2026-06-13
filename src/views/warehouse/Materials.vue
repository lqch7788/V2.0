<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
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

    <!-- 标签页 -->
    <div class="flex gap-2">
      <button
        class="h-8 px-3 rounded-md text-sm font-medium"
        :class="activeTab === 'overview' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'"
        @click="handleTabChange('overview')"
      >物料库存</button>
      <button
        class="h-8 px-3 rounded-md text-sm font-medium"
        :class="activeTab === 'inbound' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'"
        @click="handleTabChange('inbound')"
      >物料入库</button>
    </div>

    <!-- 库存总览 -->
    <template v-if="activeTab === 'overview'">
      <!-- 筛选器 - 对应V1.1 MaterialsFilters 双行布局 -->
      <div class="bg-[#F2F6FA] rounded-xl p-4 shadow-sm">
        <!-- 第一行：简单筛选 -->
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <!-- 物料编号 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">物料编号:</label>
            <input
              v-model="filters.code"
              placeholder="输入编号"
              class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm"
              style="width: 128px"
              @input="handleFilterChange('code', filters.code)"
            />
          </div>
          <!-- 物料名称 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">物料名称:</label>
            <input
              v-model="filters.name"
              placeholder="输入名称"
              class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm"
              style="width: 128px"
              @input="handleFilterChange('name', filters.name)"
            />
          </div>
          <!-- 简单分类 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">简单分类:</label>
            <select
              v-model="filters.category"
              class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
              style="width: 112px"
              @change="handleFilterChange('category', filters.category)"
            >
              <option v-for="cat in simpleCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <!-- 供应商 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">供应商:</label>
            <select
              v-model="filters.supplier"
              class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
              style="width: 128px"
              @change="handleFilterChange('supplier', filters.supplier)"
            >
              <option value="">全部</option>
              <option v-for="supplier in uniqueSuppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
            </select>
          </div>
          <!-- 存放位置 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">存放位置:</label>
            <select
              v-model="filters.location"
              class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
              style="width: 112px"
              @change="handleFilterChange('location', filters.location)"
            >
              <option value="">全部</option>
              <option v-for="location in uniqueLocations" :key="location" :value="location">{{ location }}</option>
            </select>
          </div>
          <!-- 重置按钮 -->
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600" @click="handleReset">
            <RefreshCw class="w-4 h-4 inline mr-1" />重置
          </button>
        </div>

        <!-- 第二行：三级分类筛选 -->
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-sm text-gray-600 whitespace-nowrap">三级分类:</span>
          <!-- 大类 -->
          <select
            v-model="filters.searchBigCategory"
            class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
            style="width: 180px"
            @change="handleBigCategoryChange"
          >
            <option value="">全部大类</option>
            <option v-for="cat in bigCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
          <!-- 中类 -->
          <select
            v-model="filters.searchMidCategory"
            class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
            style="width: 180px"
            :disabled="!filters.searchBigCategory"
            @change="handleMidCategoryChange"
          >
            <option value="">全部中类</option>
            <option v-for="cat in midCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
          <!-- 小类 -->
          <select
            v-model="filters.searchSubCategory"
            class="px-3 py-1.5 border border-gray-400 rounded-lg text-sm bg-white"
            style="width: 180px"
            :disabled="!filters.searchMidCategory"
          >
            <option value="">全部小类</option>
            <option v-for="cat in subCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
          </select>
          <!-- 仅显示库存不足 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="showLowStock" @change="handleLowStockFilterChange" class="w-4 h-4 rounded border-gray-400 text-blue-600" />
            <span class="text-sm text-amber-600">仅显示库存不足</span>
          </label>
        </div>
      </div>

      <!-- ActionToolbar 批量操作工具栏 -->
      <ActionToolbar
        title="库存总览"
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

        <!-- 表格 -->
        <div class="overflow-auto max-h-[calc(100vh-280px)]">
          <table class="w-full">
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
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">分类</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">规格型号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">条形码</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单位</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">库存数量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最低库存</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">最高库存</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">单价(元)</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">存放位置</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">批次号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">生产日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">有效期至</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">数据状态</th>
                <th
                  v-if="!exportMode && !batchEditMode && !deleteMode"
                  class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                >操作</th>
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
                <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap" @click="handleView(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.category }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.specification || '-' }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600 whitespace-nowrap">{{ row.barcode || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.unit }}</td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span :class="row.quantity < row.minStock ? 'text-red-600 font-medium' : 'text-gray-900'">
                      {{ row.quantity }}
                    </span>
                    <AlertTriangle v-if="row.quantity < row.minStock" class="w-4 h-4 text-red-500" />
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.minStock }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.maxStock }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.price }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.supplier }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.location }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.batchNo || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.productionDate || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.expiryDate || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': row.dataStatus === '启用',
                      'bg-red-100 text-red-700': row.dataStatus !== '启用'
                    }"
                  >
                    {{ row.dataStatus || '启用' }}
                  </span>
                </td>
                <td v-if="!exportMode && !batchEditMode && !deleteMode" class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleView(row)">查看</button>
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleEdit(row)">编辑</button>
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-red-600 text-white hover:bg-red-700" @click="handleDelete(row)">删除</button>
                  </div>
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
      <!-- 编码规则生成器 -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-lg font-semibold text-gray-900">物料编码生成</h3>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            资材编码规则：大类(2位) + 中类(2位) + 小类(2位) + 序号(3位)
          </span>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <select
              v-model="codeGen.bigCategory"
              class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
              @change="handleCodeGenBigCategoryChange"
            >
              <option value="">请选择大类</option>
              <option v-for="cat in bigCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <select
              v-model="codeGen.midCategory"
              class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
              :disabled="!codeGen.bigCategory"
              @change="handleCodeGenMidCategoryChange"
            >
              <option value="">请选择中类</option>
              <option v-for="cat in codeGenMidCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <select
              v-model="codeGen.subCategory"
              class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white"
              :disabled="!codeGen.midCategory"
              @change="handleCodeGenSubCategoryChange"
            >
              <option value="">请选择小类</option>
              <option v-for="cat in codeGenSubCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">生成编码</label>
            <div class="flex gap-2">
              <input
                v-model="codeGen.generatedCode"
                placeholder="点击生成"
                readonly
                class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50"
              />
              <button
                class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!codeGen.subCategory"
                @click="handleCodeGen"
              >生成</button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-3">
          <button
            class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!codeGen.generatedCode"
            @click="handleVerifyCode"
          >
            <Search class="w-4 h-4 inline mr-1" />验证重码
          </button>
          <button
            class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!codeGen.generatedCode"
            @click="handleCopyCode"
          >
            <Download class="w-4 h-4 inline mr-1" />{{ copySuccess ? '已复制!' : '复制编码' }}
          </button>
          <span class="text-xs text-gray-500">生成的编码可复制后用于新增物料</span>
        </div>

        <!-- 提示信息 -->
        <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ codeGenError }}</p>
        </div>
        <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ codeGenSuccess }}</p>
        </div>
      </div>

      <!-- 入库记录表格 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
          <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700" @click="handleAddInbound">
            <Plus class="w-4 h-4 inline mr-1" />新增入库
          </button>
        </div>

        <div class="overflow-auto max-h-[calc(100vh-280px)]">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库单号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料编号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库数量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库日期</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作员</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="inboundRecords.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
              <tr v-for="row in inboundRecords" :key="row.id" class="hover:bg-blue-100 transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap" @click="handleViewInbound(row)">{{ row.code }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materialCode }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materialName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.quantity }}{{ row.unit }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.supplier }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.inboundDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="row.status === 'completed' ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'">
                    {{ row.status === 'completed' ? '已完成' : '待审核' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleViewInbound(row)">查看</button>
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700" @click="handleEditInbound(row)">编辑</button>
                    <button class="h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1 bg-red-600 text-white hover:bg-red-700" @click="handleDeleteInbound(row)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 入库记录分页 -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <Pagination
            :current-page="inboundPage"
            :total-pages="Math.ceil(inboundRecords.length / inboundPageSize) || 1"
            :page-size="inboundPageSize"
            :page-size-options="[10, 20, 50]"
            :show-page-size="true"
            @page-change="(page) => inboundPage = page"
            @page-size-change="handleInboundPageSizeChange"
          />
        </div>
      </div>
    </template>

    <!-- ========== 新增入库弹窗 ========== -->
    <ElModal :model-value="showAddModal" title="新增入库" :width="900" :height="650" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showAddModal = false }" @close="showAddModal = false">
          <!-- 入库单号 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
            <div class="flex gap-2 w-full">
              <input v-model="newInbound.orderCode" placeholder="点击自动生成" readonly class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" />
              <button class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="generateOrderCode">
                <RefreshCw class="w-4 h-4 inline mr-1" />自动生成
              </button>
            </div>
          </div>

          <!-- 物料编码 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">物料编码 <span class="text-red-500">*</span></label>
            <div class="flex gap-2 w-full">
              <input v-model="newInbound.materialCode" placeholder="请输入物料编码（可从上方编码生成器复制）" class="flex-1 px-3 py-2 border border-gray-400 rounded-lg text-sm" @blur="checkCodeDuplicate" />
              <button class="h-10 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="handleGenerateCodeInModal">生成编码</button>
            </div>
            <div class="text-xs text-gray-500 mt-1">提示：可在"物料编码生成"区域生成并验证编码后复制到此</div>
            <div v-if="codeError" class="text-xs text-red-500 mt-1">{{ codeError }}</div>
          </div>

          <!-- 物料名称 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">物料名称 <span class="text-red-500">*</span></label>
            <input v-model="newInbound.materialName" placeholder="请输入物料名称" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" @blur="checkNameDuplicate" />
            <div v-if="nameError" class="text-xs text-red-500 mt-1">{{ nameError }}</div>
          </div>

          <!-- 分类选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">分类选择</label>
            <div class="grid grid-cols-3 gap-4 w-full">
              <select v-model="newInbound.bigCategory" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" @change="handleModalBigCategoryChange">
                <option value="">请选择大类</option>
                <option v-for="cat in bigCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
              </select>
              <select v-model="newInbound.midCategory" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" :disabled="!newInbound.bigCategory" @change="handleModalMidCategoryChange">
                <option value="">请选择中类</option>
                <option v-for="cat in modalMidCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
              </select>
              <select v-model="newInbound.subCategory" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white" :disabled="!newInbound.midCategory">
                <option value="">请选择小类</option>
                <option v-for="cat in modalSubCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- 数量和单位 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">入库数量 <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-4 w-full">
              <input v-model.number="newInbound.quantity" type="number" placeholder="请输入数量" class="px-3 py-2 border border-gray-400 rounded-lg text-sm" />
              <select v-model="newInbound.unit" class="px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
                <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
              </select>
            </div>
          </div>

          <!-- 供应商 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <input v-model="newInbound.supplier" placeholder="请输入供应商" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
          </div>

          <!-- 入库日期和操作员 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库日期</label>
              <input v-model="newInbound.inboundDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作员</label>
              <input v-model="newInbound.operator" placeholder="请输入操作员" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
          </div>

          <!-- 备注 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="newInbound.remarks" :rows="3" placeholder="请输入备注" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm resize-none"></textarea>
          </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="handleCloseModal">取消</el-button>
          <el-button type="primary" size="small" :disabled="!isFormValid" @click="handleSaveInbound">保存</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 物料详情弹窗 ========== -->
    <ElModal :model-value="showDetailModal" title="物料详情" :width="700" :height="600" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showDetailModal = false }" @close="showDetailModal = false">
        <div v-if="selectedMaterial">
          <div class="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg overflow-hidden">
            <template v-for="(item, idx) in [
              { label: '物料编号', value: selectedMaterial.code },
              { label: '物料名称', value: selectedMaterial.name },
              { label: '分类', value: selectedMaterial.category },
              { label: '规格型号', value: selectedMaterial.specification || '-' },
              { label: '条形码', value: selectedMaterial.barcode || '-' },
              { label: '单位', value: selectedMaterial.unit },
              { label: '库存数量', value: selectedMaterial.quantity, cls: selectedMaterial.quantity < selectedMaterial.minStock ? 'text-red-600 font-bold' : '' },
              { label: '最低库存', value: selectedMaterial.minStock },
              { label: '最高库存', value: selectedMaterial.maxStock || '-' },
              { label: '单价', value: selectedMaterial.price },
              { label: '供应商', value: selectedMaterial.supplier },
              { label: '存放位置', value: selectedMaterial.location },
              { label: '批次号', value: selectedMaterial.batchNo || '-' },
              { label: '生产日期', value: selectedMaterial.productionDate || '-' },
              { label: '有效期至', value: selectedMaterial.expiryDate || '-' },
              { label: '最后更新时间', value: selectedMaterial.lastUpdateTime || '-' }
            ]" :key="idx">
              <div class="flex border-b border-gray-200 last:border-b-0">
              <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.label }}</span>
              <span class="px-3 py-2 text-sm text-gray-900 flex-1" :class="item.cls">{{ item.value }}</span>
              </div>
            </template>
            <!-- 数据状态 -->
            <div class="flex border-b border-gray-200 last:border-b-0">
              <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">数据状态</span>
              <span class="px-3 py-2 text-sm flex-1">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="selectedMaterial.dataStatus === '启用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                  {{ selectedMaterial.dataStatus || '启用' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showDetailModal = false">关闭</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 入库详情弹窗 ========== -->
    <ElModal :model-value="showInboundDetailModal" title="入库记录详情" :width="700" :height="600" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showInboundDetailModal = false }" @close="showInboundDetailModal = false">
          <div v-if="selectedInboundRecord" class="grid grid-cols-2 gap-4 border border-gray-200 rounded-lg overflow-hidden mb-4">
            <template v-for="(item, idx) in [
              { label: '入库单号', value: selectedInboundRecord.code },
              { label: '入库日期', value: selectedInboundRecord.inboundDate },
              { label: '物料编码', value: selectedInboundRecord.materialCode },
              { label: '物料名称', value: selectedInboundRecord.materialName },
              { label: '入库数量', value: selectedInboundRecord.quantity + (selectedInboundRecord.unit || '') },
              { label: '供应商', value: selectedInboundRecord.supplier },
              { label: '操作员', value: selectedInboundRecord.operator }
            ]" :key="idx">
              <div class="flex border-b border-gray-200 last:border-b-0">
              <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">{{ item.label }}</span>
              <span class="px-3 py-2 text-sm text-gray-900 flex-1">{{ item.value }}</span>
              </div>
            </template>
            <!-- 状态 -->
            <div class="flex border-b border-gray-200 last:border-b-0">
              <span class="w-32 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 shrink-0 border-r border-gray-200">状态</span>
              <span class="px-3 py-2 text-sm flex-1">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="selectedInboundRecord.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                  {{ selectedInboundRecord.status === 'completed' ? '已完成' : '待审核' }}
                </span>
              </span>
            </div>
          </div>

          <!-- 入库物料明细子表 -->
          <div v-if="selectedInboundRecord?.materials?.length > 0" class="mt-4">
            <h4 class="font-medium mb-2 text-sm">入库物料明细</h4>
            <div class="overflow-auto rounded-lg border border-gray-200">
              <table class="w-full">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料编码</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">物料名称</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">规格</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">单位</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">数量</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">批次号</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">生产日期</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">存放位置</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap">备注</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="selectedInboundRecord.materials.length === 0">
                    <td colspan="9" class="px-3 py-4 text-center text-xs text-gray-500">暂无数据</td>
                  </tr>
                  <tr v-for="(item, idx) in selectedInboundRecord.materials" :key="idx" class="hover:bg-blue-100 transition-colors">
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.materialCode }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.materialName }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.spec }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.unit }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.quantity }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.batchNo }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.productionDate }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.location }}</td>
                    <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ item.remark }}</td>
                  </tr>
                </tbody>
              </table>
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

    <!-- 物料新增弹窗 -->
    <ElModal :model-value="showAddMaterialModal" title="新增物料库存" :width="900" :height="650" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showAddMaterialModal = false }" @close="showAddMaterialModal = false">
          <!-- 编码生成器 - V1.1 MaterialCreateModal + WarehouseInboundCodeGen 对齐 -->
          <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                <Wand2 class="w-4 h-4" />物料编码生成器
              </h4>
              <button class="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1" @click="handleResetMaterialCodeGen">
                <RotateCcw class="w-3 h-3" />重置
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">大类 <span class="text-red-500">*</span></label>
                <select v-model="materialCodeGen.bigCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white">
                  <option value="">请选择大类</option>
                  <option v-for="b in bigCategoriesList" :key="b.code" :value="b.code">{{ b.code }}-{{ b.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">中类 <span class="text-red-500">*</span></label>
                <select v-model="materialCodeGen.midCategory" :disabled="!materialCodeGen.bigCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">请选择中类</option>
                  <option v-for="m in materialMidOptions" :key="m.code" :value="m.code">{{ m.code }}-{{ m.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">小类 <span class="text-red-500">*</span></label>
                <select v-model="materialCodeGen.subCategory" :disabled="!materialCodeGen.midCategory" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">请选择小类</option>
                  <option v-for="s in materialSubOptions" :key="s.code" :value="s.code">{{ s.code }}-{{ s.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input :value="materialCodeGen.generatedCode" readonly placeholder="点击生成" class="w-40 h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono bg-gray-50" />
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1" :disabled="!materialCodeGen.subCategory" @click="handleGenerateMaterialCode">
                <Wand2 class="w-4 h-4" />生成
              </button>
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1" :disabled="!materialCodeGen.generatedCode" @click="handleCopyMaterialCode">
                <Copy class="w-4 h-4" />{{ materialCopySuccess ? '已复制!' : '复制' }}
              </button>
              <span v-if="materialCodeGenError" class="text-xs text-red-600 font-medium">{{ materialCodeGenError }}</span>
              <span v-else-if="materialCodeGenSuccess" class="text-xs text-green-600 font-medium">{{ materialCodeGenSuccess }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">物料编码 <span class="text-red-500">*</span></label>
              <input v-model="newMaterial.code" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono" placeholder="如：SP0201001" />
              <div v-if="hasIOChar(newMaterial.code)" class="mt-1 text-xs text-amber-600 flex items-start gap-1">
                <span class="font-bold">⚠️</span>
                <span>编码含字母 I/O，与数字 1/0 形近，建议核对或替换</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">物料名称 <span class="text-red-500">*</span></label>
              <input v-model="newMaterial.name" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="请输入物料名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类 <span class="text-red-500">*</span></label>
              <input v-model="newMaterial.category" readonly class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-gray-50" placeholder="选择上方分类后自动填充" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">规格型号 <span class="text-red-500">*</span></label>
              <input v-model="newMaterial.specification" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：50kg/袋" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">条形码</label>
              <input v-model="newMaterial.barcode" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm font-mono" placeholder="13位数字" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
              <select v-model="newMaterial.unit" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="">请选择单位</option>
                <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">当前库存</label>
              <input v-model.number="newMaterial.quantity" type="number" min="0" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最低库存限值</label>
              <input v-model="minStockInput" type="number" min="0" step="0.01" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最高库存限值</label>
              <input v-model="maxStockInput" type="number" min="0" step="0.01" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
              <div v-if="minStockInput && maxStockInput && parseFloat(minStockInput) > parseFloat(maxStockInput) && parseFloat(maxStockInput) > 0" class="mt-1 text-xs text-red-600 flex items-start gap-1">
                <span class="font-bold">⚠️</span>
                <span>最低库存不能高于最高库存</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">单价</label>
              <input v-model="newMaterial.price" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：45.00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
              <input v-model="newMaterial.supplier" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="供应商名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">存放位置</label>
              <input v-model="newMaterial.location" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" placeholder="如：A-01-01" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">批次号</label>
              <input v-model="newMaterial.batchNo" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">生产日期</label>
              <input v-model="newMaterial.productionDate" type="date" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
              <input v-model="newMaterial.expiryDate" type="date" class="w-full h-8 px-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数据状态</label>
              <div class="flex items-center gap-4 py-1">
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="newMaterial.dataStatus" value="启用" class="w-4 h-4 text-blue-600 border-gray-400" />
                  <span class="text-sm text-gray-700">启用</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" v-model="newMaterial.dataStatus" value="停用" class="w-4 h-4 text-blue-600 border-gray-400" />
                  <span class="text-sm text-gray-700">停用</span>
                </label>
              </div>
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

    <!-- ========== 入库记录编辑弹窗 ========== -->
    <ElModal :model-value="showInboundEditModal" title="编辑入库记录" :width="900" :height="650" :show-submit="false" :show-cancel="false" @update:model-value="(v) => { if (!v) showInboundEditModal = false }" @close="showInboundEditModal = false">
      <div v-if="selectedInboundRecord">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
            <input :value="inboundEditForm.code" readonly class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-gray-50" />
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">入库日期</label>
              <input v-model="inboundEditForm.inboundDate" type="date" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select v-model="inboundEditForm.status" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white">
                <option value="pending">待审核</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
              <input v-model="inboundEditForm.supplier" placeholder="请输入供应商" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">操作员</label>
              <input v-model="inboundEditForm.operator" placeholder="请输入操作员" class="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm" />
            </div>
          </div>

          <!-- 入库物料明细子表 -->
          <div class="mb-2 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-700">入库物料明细</h4>
            <span class="text-xs text-gray-500">共 {{ inboundEditForm.materials?.length || 0 }} 条</span>
          </div>
          <div v-if="(inboundEditForm.materials?.length || 0) > 0" class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="text-xs w-full">
              <thead class="bg-blue-600 text-white">
                <tr>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料编码</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">数量</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">单价</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">批次号</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">生产日期</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">货位</th>
                  <th class="px-2 py-2 text-left font-semibold whitespace-nowrap">备注</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(m, idx) in inboundEditForm.materials" :key="idx" class="hover:bg-blue-50">
                  <td class="px-1 py-1"><input v-model="m.materialCode" class="w-20 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.materialName" class="w-20 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.spec" class="w-16 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.unit" class="w-12 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model.number="m.quantity" type="number" min="0" class="w-16 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model.number="m.unitPrice" type="number" min="0" step="0.01" class="w-16 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.batchNo" class="w-16 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.productionDate" type="date" class="w-24 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.location" class="w-16 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                  <td class="px-1 py-1"><input v-model="m.remark" class="w-20 h-6 px-1 border border-gray-300 rounded text-xs" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4 text-sm text-gray-500 border border-gray-200 rounded-lg">
            暂无物料明细
          </div>
        </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showInboundEditModal = false">取消</el-button>
          <el-button type="primary" size="small" @click="handleSaveInboundEdit">保存</el-button>
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
import { Package, AlertTriangle, Download, Search, Plus, RefreshCw, Wand2, Copy, RotateCcw } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { ElModal } from '@/components/ui'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { getMaterials, getInboundRecords } from '@/api/material/apiWarehouseMaterialService'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'
import { bigCategoriesList, categoryConfig } from '@/types/warehouseInbound.js'
import ActionToolbar from './components/ActionToolbar.vue'
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

// 简单分类选项（对应V1.1 SIMPLE_CATEGORIES）
const simpleCategories = ['全部', '种子种苗', '肥料', '农药', '农膜']

// 简单分类→分类名称映射（对应V1.1 categoryMap）
const categoryFilterMap = {
  '种子种苗': '种质资源',
  '肥料': '肥料与土壤改良剂',
  '农药': '农药与植保产品',
  '农膜': '设施农业系统',
}

// 单位选项
const unitOptions = ['袋', '箱', '个', '公斤', '升', '平方米']

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
const activeTab = ref('overview')
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

// 编码生成器状态
const codeGen = reactive({
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  generatedCode: ''
})
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 新增入库表单
const newInbound = reactive({
  orderCode: '',
  bigCategory: '',
  midCategory: '',
  subCategory: '',
  materialCode: '',
  materialName: '',
  quantity: '',
  unit: '袋',
  supplier: '',
  inboundDate: '',
  operator: '',
  remarks: ''
})

// 计算属性
const filteredMaterials = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return source.filter(m => {
    if (filters.code && !m.code.includes(filters.code)) return false
    if (filters.name && !m.name.includes(filters.name)) return false
    if (filters.category && filters.category !== '全部') {
      const mappedCategory = categoryFilterMap[filters.category] || filters.category
      if (!m.category.includes(mappedCategory)) return false
    }
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

const uniqueSuppliers = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return [...new Set(source.map(m => m.supplier))]
})

const uniqueLocations = computed(() => {
  const source = warehouseMaterials.value.length > 0 ? warehouseMaterials.value : mockWarehouseMaterials.value
  return [...new Set(source.map(m => m.location))]
})

const inboundRecords = computed(() => {
  return inboundRecordsData.value.length > 0 ? inboundRecordsData.value : mockInboundRecords.value
})

const isFormValid = computed(() => {
  return !codeError.value && !nameError.value && newInbound.materialCode && newInbound.materialName && newInbound.quantity
})

// 分类选项计算
const midCategories = computed(() => {
  if (!filters.searchBigCategory) return []
  const bigCat = categoryConfig[filters.searchBigCategory]
  if (!bigCat) return []
  return Object.entries((bigCat).categories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

const subCategories = computed(() => {
  if (!filters.searchBigCategory || !filters.searchMidCategory) return []
  const bigCat = categoryConfig[filters.searchBigCategory]
  if (!bigCat) return []
  const midCat = (bigCat).categories[filters.searchMidCategory]
  if (!midCat) return []
  return Object.entries(midCat.subCategories).map(([code, data]) => ({
    code,
    name: data.name
  }))
})

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

// 新增入库相关方法
const handleAddInbound = () => {
  showAddModal.value = true
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
