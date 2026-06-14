<template>
  <div class="space-y-6">
    <!-- ========== 1. 页面头部 ========== -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Package class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">物料入库</h1>
          <p class="text-gray-500">物料入库记录管理</p>
        </div>
      </div>
    </div>

    <!-- ========== 2. 编码规则生成器（可折叠） ========== -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 折叠头部 -->
      <div class="px-6 py-3 flex items-center gap-3 border-b border-gray-100">
        <button class="text-sm text-blue-600 hover:text-blue-800" @click="$router.push('/code-rule')">编码规则 &gt;&gt;</button>
        <div class="h-6 w-px bg-gray-300"></div>
        <span class="text-base font-bold text-blue-600">物料编码生成</span>
        <button class="p-1 hover:bg-gray-100 rounded" @click="codeGenExpanded = !codeGenExpanded">
          <ChevronDown v-if="codeGenExpanded" class="w-5 h-5 text-gray-600" />
          <ChevronRight v-else class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- 展开的生成面板 -->
      <div v-if="codeGenExpanded" class="p-6">
        <!-- 编码生成器 - V1.1: grid-cols-6 + "生成编码"列 col-span-3 (50% 宽), Input+3个按钮全部同一行 -->
        <div class="grid grid-cols-6 gap-4 mb-4">
          <!-- 大类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">大类</label>
            <select
              v-model="codeGen.bigCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
              @change="handleCodeGenBigCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in bigCategoriesList" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <!-- 中类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">中类</label>
            <select
              v-model="codeGen.midCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
              :disabled="!codeGen.bigCategory"
              @change="handleCodeGenMidCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in midCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <!-- 小类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类</label>
            <select
              v-model="codeGen.subCategory"
              class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
              :disabled="!codeGen.midCategory"
              @change="handleCodeGenSubCategoryChange"
            >
              <option value="">请选择</option>
              <option v-for="cat in subCategories" :key="cat.code" :value="cat.code">{{ cat.code }} - {{ cat.name }}</option>
            </select>
          </div>
          <!-- 生成编码 - V1.1 真实代码: col-span-3 占 50% 宽度, Input + 3个 size="sm" 按钮全部同一行 -->
          <div class="col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              生成编码
              <span v-if="codeGenSuccess && !codeGenError" class="ml-2 text-sm text-green-600 font-normal">{{ codeGenSuccess }}</span>
              <span v-if="codeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ codeGenError }}</span>
            </label>
            <!-- V1.1 真实代码: Input w-40 h-10 + 3 个 size="sm" (h-8 px-3 text-xs) 按钮, 全部在同一行 -->
            <div class="flex gap-2 items-center">
              <input
                v-model="codeGen.generatedCode"
                readonly
                placeholder="点击生成"
                class="w-40 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 flex-shrink-0"
              />
              <!-- V1.1: size="sm" Button = h-8 px-3 text-xs (不自定义) -->
              <button
                :disabled="!codeGen.subCategory"
                class="h-8 px-3 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                @click="handleGenerateCode"
              >
                <Wand2 class="w-4 h-4" />生成
              </button>
              <button
                :disabled="!codeGen.generatedCode"
                class="h-8 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                @click="handleCopyCode"
              >
                <Copy class="w-4 h-4" />{{ copySuccess ? '已复制!' : '复制' }}
              </button>
              <button
                class="h-8 px-3 rounded text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center justify-center gap-1 whitespace-nowrap"
                @click="handleResetCodeGen"
              >
                <RotateCcw class="w-4 h-4" />重置
              </button>
            </div>
          </div>
        </div>

        <!-- 错误/成功提示 -->
        <div v-if="codeGenError" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{{ codeGenError }}</div>
        <div v-if="codeGenSuccess && !codeGenError" class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">{{ codeGenSuccess }}</div>

        <!-- I/O 风险提示（与V1.1一致） -->
        <div class="mt-2 text-xs text-amber-600 flex items-start gap-1">
          <span class="font-bold">⚠️</span>
          <span>部分大类（如 OP/IT/OT）编码含字母 I/O，与数字 1/0 形近。生成后请人工核对，避免抄录/扫描时误读。</span>
        </div>
      </div>
    </div>

    <!-- ========== 3. 筛选栏 - 对应V1.1 MaterialInboundTab 5列 + 重置/搜索 ========== -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-4">
        <div class="flex-1 grid grid-cols-5 gap-4 min-w-0">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">入库单号</label>
            <input
              v-model="searchCode"
              placeholder="搜索单号"
              class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @keyup.enter="handleSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商</label>
            <input
              v-model="searchSupplier"
              placeholder="搜索供应商"
              class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @keyup.enter="handleSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              v-model="searchStatus"
              class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
              @change="handleSearch"
            >
              <option value="">全部</option>
              <option value="pending">待审核</option>
              <option value="completed">已完成</option>
              <option value="voided">已作废</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料名称</label>
            <input
              v-model="searchMaterialName"
              placeholder="搜索物料名称"
              class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @keyup.enter="handleSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物料编码</label>
            <input
              v-model="searchMaterialCode"
              placeholder="搜索物料编码"
              class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <!-- V1.1: 重置按钮 amber + RotateCcw 单图标 -->
          <button class="h-8 px-3 rounded text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 inline-flex items-center gap-1" @click="resetSearchFilters">
            <RotateCcw class="w-4 h-4" />重置
          </button>
          <!-- V1.1: 搜索按钮 default (emerald-600) -->
          <button class="h-8 px-3 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleSearch">
            <Search class="w-4 h-4" />搜索
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 4. 表格区域 ========== -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 表格顶部工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">物料入库记录</h3>
          <template v-if="hasActiveMode">
            <button class="text-sm text-blue-600 hover:text-blue-800" @click="handleSelectAll">
              {{ isAllSelected ? '全不选' : '全选' }}
            </button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </template>
        </div>

        <div class="flex items-center gap-2">
          <!-- 正常模式 - V1.1 ActionToolbar 顺序: 新增 → 编辑 → 删除 → 导出 -->
          <template v-if="!hasActiveMode">
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleAddRecord">
              <Plus class="w-4 h-4" />新增入库
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="enterEditMode">
              <Edit class="w-4 h-4" />编辑
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="enterDeleteMode">
              <Trash2 class="w-4 h-4" />删除
            </button>
            <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="enterExportMode">
              <Download class="w-4 h-4" />导出
            </button>
          </template>
          <!-- 模式按钮 -->
          <template v-else>
            <template v-if="editMode">
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1" @click="handleConfirmEdit">
                <Edit2 class="w-4 h-4" />确认编辑{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
              </button>
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="cancelSelection">
                <X class="w-4 h-4" />取消
              </button>
            </template>
            <template v-if="deleteMode">
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1" @click="handleConfirmDelete">
                <Trash2 class="w-4 h-4" />确认删除{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
              </button>
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="cancelSelection">
                <X class="w-4 h-4" />取消
              </button>
            </template>
            <template v-if="exportMode">
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" @click="handleConfirmExport">
                <Download class="w-4 h-4" />确认导出{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
              </button>
              <button class="h-8 px-3 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1" @click="cancelSelection">
                <X class="w-4 h-4" />取消选择
              </button>
            </template>
          </template>
        </div>
      </div>

      <!-- 表格主体 -->
      <div class="overflow-auto max-h-[calc(100vh-400px)]">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th v-if="hasActiveMode" class="px-4 py-3 text-left text-sm font-semibold w-14 whitespace-nowrap">
                <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-white" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold w-12 whitespace-nowrap"></th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库单号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">入库日期</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">供应商</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">操作员</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">物料数量</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-if="displayedRecords.length === 0">
              <td :colspan="hasActiveMode ? 8 : 7" class="px-4 py-8 text-center text-gray-500">暂无数据</td>
            </tr>
            <template v-for="row in displayedRecords" :key="row.id">
              <!-- 主数据行 -->
              <tr class="hover:bg-blue-100 transition-colors">
                <td v-if="hasActiveMode" class="px-4 py-3">
                  <template v-if="deleteMode && row.status !== 'pending'">
                    <span class="text-gray-300 text-xs">—</span>
                  </template>
                  <template v-else>
                    <input type="checkbox" :checked="selectedRows.includes(row.id)" @change="toggleInboundRow(row.id)" class="w-4 h-4 rounded border-gray-400" />
                  </template>
                </td>
                <td class="px-4 py-3">
                  <button class="p-1 hover:bg-gray-100 rounded" @click="toggleExpandRow(row.id)">
                    <ChevronDown v-if="expandedRows.has(row.id)" class="w-4 h-4 text-gray-500" />
                    <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                  </button>
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                  <button class="text-blue-600 hover:text-blue-800 underline" @click="handleViewRecord(row)">{{ row.code }}</button>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.inboundDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.supplier }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.operator }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ row.materials?.length || 0 }} 种物料</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                    'bg-green-100 text-green-700': row.status === 'completed',
                    'bg-gray-100 text-gray-700': row.status === 'voided',
                    'bg-amber-100 text-amber-700': row.status === 'pending'
                  }">
                    {{ getStatusText(row.status) }}
                  </span>
                </td>
              </tr>
              <!-- 展开行：物料明细 - V1.1 14列, 表头 bg-gray-100 -->
              <tr v-if="expandedRows.has(row.id)" :key="'exp-' + row.id" class="bg-gray-50">
                <td :colspan="hasActiveMode ? 8 : 7" class="p-4">
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
                        <tr v-if="!row.materials || row.materials.length === 0">
                          <td colspan="14" class="px-3 py-4 text-center text-sm text-gray-500">暂无物料明细</td>
                        </tr>
                        <tr v-for="m in (row.materials || [])" :key="m.id || m.code" class="border-t">
                          <td class="px-2 py-2 text-xs text-blue-600 whitespace-nowrap">{{ m.code }}</td>
                          <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.name }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.category || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.specification || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.barcode || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.unit }}</td>
                          <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.quantity }}</td>
                          <td class="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.price }}元</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.supplier || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.location || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.batchNo || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.productionDate || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.expiryDate || '-' }}</td>
                          <td class="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{{ m.remarks || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
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
          @page-change="(page) => { currentPage = page }"
          @page-size-change="(size) => { pageSize = size; currentPage = 1 }"
        />
      </div>
    </div>

    <!-- ========== 5. 查看详情弹窗 - V1.1 size="xxl" (1080×650) ========== -->
    <ElModal :model-value="showDetailModal" title="入库记录详情" :width="1080" :height="650" :show-footer="true" :show-submit="false" :show-cancel="false" :show-maximize="false" :enable-drag="false" :enable-resize="false" @update:model-value="(v) => { if (!v) showDetailModal = false }" @close="showDetailModal = false">
      <div v-if="detailRecord">
        <!-- 入库单信息卡片 -->
        <div class="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库单号</span>
              <span class="text-lg font-mono font-bold text-emerald-700">{{ detailRecord.code }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">入库日期</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.inboundDate || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">供应商</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.supplier || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">操作员</span>
              <span class="text-sm font-medium text-gray-900">{{ detailRecord.operator || '-' }}</span>
            </div>
            <div>
              <span class="text-xs text-emerald-600 block font-medium">状态</span>
              <span class="text-sm font-medium" :class="{
                'text-green-600': detailRecord.status === 'completed',
                'text-gray-500': detailRecord.status === 'voided',
                'text-amber-600': detailRecord.status === 'pending'
              }">
                {{ getStatusText(detailRecord.status) }}
              </span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-emerald-200">
            <span class="text-xs text-emerald-600">物料统计：</span>
            <span class="text-sm font-medium text-gray-900 ml-2">
              共 {{ detailRecord.materials?.length || 0 }} 种物料，合计 {{ detailRecord.materials?.reduce((sum, m) => sum + Number(m.quantity), 0) || 0 }} 件
            </span>
          </div>
        </div>

        <!-- 物料明细表 - V1.1: max-h-96 (不是 80), 表头无背景色 -->
        <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package class="w-5 h-5 text-emerald-600" />
          物料明细
        </h4>
        <div class="overflow-auto rounded-lg border border-gray-200 max-h-96">
          <table class="min-w-full text-xs">
            <thead>
              <tr>
                <th class="px-3 py-2 text-sm font-semibold text-gray-600 whitespace-nowrap text-left">物料编码</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">物料名称</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">分类</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">规格</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">条形码</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单位</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">数量</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">单价</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">供应商</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">存放位置</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">批号</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">生产日期</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">有效期至</th>
                <th class="px-3 py-2 text-left font-semibold whitespace-nowrap">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="m in (detailRecord.materials || [])" :key="m.id || m.code" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-xs text-blue-600 font-medium whitespace-nowrap">{{ m.code }}</td>
                <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.name }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.category || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.specification || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.barcode || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.unit }}</td>
                <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.quantity }}</td>
                <td class="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{{ m.price }}元</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.supplier || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.location || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.batchNo || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.productionDate || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.expiryDate || '-' }}</td>
                <td class="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{{ m.remarks || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showDetailModal = false">关闭</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 6. 新增入库弹窗 - V1.1 100% 重构子组件 InboundAddModal.vue ========== -->
    <InboundAddModal
      :is-open="showAddModal"
      :on-generate-code="generateOrderCode"
      @close="showAddModal = false"
      @save="handleSaveNewInbound"
    />

    <!-- ========== 7. 编辑入库弹窗 - V1.1 size="xl" (900×600) ========== -->
    <ElModal :model-value="showEditModal" title="编辑入库记录" :width="900" :height="600" :show-footer="true" :show-submit="false" :show-cancel="false" :show-maximize="false" :enable-drag="false" :enable-resize="false" @update:model-value="(v) => { if (!v) showEditModal = false }" @close="showEditModal = false">
      <div v-if="editRecord">
          <!-- 已完成状态警告 -->
          <div v-if="editRecord.status === 'completed'" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span class="text-sm text-amber-700">此记录已完成，物料明细不可编辑。如需修改请申请作废后重新录入。</span>
          </div>
          <!-- 已作废状态提示 -->
          <div v-if="editRecord.status === 'voided'" class="mb-4 p-3 bg-gray-100 border border-gray-400 rounded-lg flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span class="text-sm text-gray-600">此记录已作废，仅供查看，无法编辑。</span>
          </div>

          <!-- 入库单信息 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">入库单号</span>
                <span class="text-sm font-medium text-gray-900">{{ editRecord.code }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">入库日期</span>
                <span class="text-sm font-medium text-gray-900">{{ editRecord.inboundDate }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应商</span>
                <span class="text-sm font-medium text-gray-900">{{ editRecord.supplier }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">操作员</span>
                <span class="text-sm font-medium text-gray-900">{{ editRecord.operator }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">状态</span>
                <span class="text-sm font-medium" :class="{
                  'text-amber-600': editRecord.status === 'pending',
                  'text-green-600': editRecord.status === 'completed',
                  'text-gray-500': editRecord.status === 'voided'
                }">{{ getStatusText(editRecord.status) }}</span>
              </div>
            </div>
          </div>

          <!-- 物料明细 -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ editForm.materials.length }}种物料）</h4>
            <button v-if="editRecord.status === 'pending'" class="h-8 px-3 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700" @click="addEditMaterialRow">
              <Plus class="w-3 h-3 inline mr-1" />添加物料
            </button>
          </div>

          <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white max-h-80">
            <table class="text-xs" style="min-width: 1600px">
              <thead>
                <tr>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">操作</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">物料编码</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">物料名称</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">分类</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">规格</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">条形码</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">单位</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">数量</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">单价</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">批次号</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">存放位置</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">生产日期</th>
                  <th class="px-2 py-2 font-semibold text-blue-800 whitespace-nowrap">过期日期</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(m, idx) in editForm.materials" :key="m.id">
                  <td class="px-2 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <button class="text-red-500 hover:bg-red-50 p-1 rounded" @click="removeEditMaterialRow(idx)">
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </template>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.code" placeholder="编码" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-blue-600 font-medium">{{ m.code }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.name" placeholder="名称" class="w-32 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-900">{{ m.name }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.category" placeholder="分类" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.category || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.specification" placeholder="规格" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.specification || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.barcode" placeholder="条形码" class="w-24 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.barcode || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <select v-model="m.unit" class="w-14 h-6 px-1 border border-gray-200 rounded text-xs bg-white">
                        <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                      </select>
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.unit }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model.number="m.quantity" type="number" class="w-16 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-900">{{ m.quantity }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.price" placeholder="单价" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-900">{{ m.price }}元</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.batchNo" placeholder="批次号" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.batchNo || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.location" placeholder="位置" class="w-20 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.location || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.productionDate" type="date" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.productionDate || '-' }}</span>
                  </td>
                  <td class="px-1 py-1.5 whitespace-nowrap">
                    <template v-if="editRecord.status === 'pending'">
                      <input v-model="m.expiryDate" type="date" class="w-28 h-6 px-1 border border-gray-200 rounded text-xs" />
                    </template>
                    <span v-else class="text-xs text-gray-600">{{ m.expiryDate || '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button v-if="editRecord?.status === 'completed'" type="warning" size="small" @click="handleApplyVoid">申请作废</el-button>
          <el-button size="small" @click="showEditModal = false">关闭</el-button>
          <el-button v-if="editRecord?.status === 'pending'" type="primary" size="small" @click="handleSaveEdit">保存</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 8. 批量编辑弹窗 - V1.1 size="xxxl" (1350×700) ========== -->
    <ElModal :model-value="showBatchEditModal" title="批量编辑入库记录" :width="1350" :height="700" :show-footer="true" :show-submit="false" :show-cancel="false" :show-maximize="false" :enable-drag="false" :enable-resize="false" @update:model-value="(v) => { if (!v) showBatchEditModal = false }" @close="showBatchEditModal = false">
      <template #header-action>
        <span class="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded">已选择 {{ batchEditRecords.length }} 条</span>
      </template>

      <div>
          <p class="text-sm text-gray-500 mb-4">正在编辑 {{ batchEditRecords.length }} 条入库记录</p>

          <div class="grid gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">入库日期</label>
              <input
                v-model="batchEditFields.inboundDate"
                type="date"
                placeholder="如不修改请留空"
                class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">供应商</label>
              <input
                v-model="batchEditFields.supplier"
                placeholder="如不修改请留空"
                class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">操作员</label>
              <input
                v-model="batchEditFields.operator"
                placeholder="如不修改请留空"
                class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">状态</label>
              <select
                v-model="batchEditFields.status"
                class="w-full h-10 px-3 border border-gray-400 rounded-lg text-sm bg-white"
              >
                <option value="">如不修改请留空</option>
                <option value="completed">已完成</option>
                <option value="pending">待审核</option>
                <option value="voided">已作废</option>
              </select>
            </div>
          </div>
        </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showBatchEditModal = false">取消</el-button>
          <el-button type="primary" size="small" @click="handleBatchSave">保存</el-button>
        </div>
      </template>
    </ElModal>

    <!-- ========== 9. 删除确认弹窗 ========== -->
    <DeleteWarningModal v-model:is-open="showDeleteModal" :selected-count="deleteRecords.length" title="删除警告" @close="showDeleteModal = false" @confirm="handleConfirmDeleteExecute" />

    <!-- ========== 10. 导出弹窗 ========== -->
    <ExportFormatModal :visible="showExportModal" :export-file-type="exportFormat" :selected-count="exportRecords.length" @update:visible="(v) => { showExportModal = v; if (!v) exitExportMode() }" @confirm="handleDoExport" @update:export-file-type="(val) => exportFormat = val" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Package, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Download, RefreshCw, Settings, AlertTriangle, X, Wand2, Copy, RotateCcw, Edit, Edit2, Search, Check } from 'lucide-vue-next'
import { useInboundStore } from '@/stores/modules/inventory/useInboundStore'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
import { ElModal } from '@/components/ui'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import InboundAddModal from './components/InboundAddModal.vue'

// ==================== 常量配置（与V1.1一致） ====================

const unitOptions = ['袋', '箱', '个', '公斤', '升', '平方米', '吨', '包', '卷', '套', '台']

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', desc: '适用于数据分析和处理' },
  { value: 'csv', label: 'CSV (.csv)', desc: '适用于数据交换' }
]

// 与V1.1完全一致的7大类分类配置
const bigCategoriesList = [
  { code: 'SP', name: '生产投入类' },
  { code: 'EQ', name: '设施与装备类' },
  { code: 'OP', name: '作业支持类' },
  { code: 'PH', name: '采后处理与流通类' },
  { code: 'IT', name: '数字化与管理类' },
  { code: 'EC', name: '能源与通用耗材' },
  { code: 'OT', name: '其他类' }
]

// 与V1.1完全一致的3级分类配置映射
const categoryConfig = {
  'SP': {
    name: '生产投入类',
    categories: {
      '01': { name: '种质资源', subCategories: { '01': { name: '粮食作物种子', prefix: 'SP0101' }, '02': { name: '经济作物种子', prefix: 'SP0102' }, '03': { name: '蔬菜种子', prefix: 'SP0103' }, '04': { name: '蔬菜种苗', prefix: 'SP0104' }, '05': { name: '水果苗木种苗', prefix: 'SP0105' }, '06': { name: '水果苗木种子', prefix: 'SP0106' }, '07': { name: '花卉与观赏植物', prefix: 'SP0107' }, '08': { name: '食用菌菌种', prefix: 'SP0108' }, '99': { name: '其他种质资源', prefix: 'SP0199' } } },
      '02': { name: '肥料与土壤改良剂', subCategories: { '01': { name: '有机肥', prefix: 'SP0201' }, '02': { name: '化学肥料', prefix: 'SP0202' }, '03': { name: '水溶肥', prefix: 'SP0203' }, '04': { name: '叶面肥', prefix: 'SP0204' }, '05': { name: '微生物菌剂', prefix: 'SP0205' }, '06': { name: '土壤调理剂', prefix: 'SP0206' }, '07': { name: '育苗基质', prefix: 'SP0207' }, '99': { name: '其他类型', prefix: 'SP0299' } } },
      '03': { name: '农药与植保产品', subCategories: { '01': { name: '杀虫剂', prefix: 'SP0301' }, '02': { name: '杀菌剂', prefix: 'SP0302' }, '03': { name: '杀螨剂', prefix: 'SP0303' }, '04': { name: '除草剂', prefix: 'SP0304' }, '05': { name: '植物生长调节剂', prefix: 'SP0305' }, '06': { name: '物理防控用品', prefix: 'SP0306' }, '07': { name: '生物农药', prefix: 'SP0307' }, '99': { name: '其他类型', prefix: 'SP0399' } } }
    }
  },
  'EQ': {
    name: '设施与装备类',
    categories: {
      '01': { name: '农业机械', subCategories: { '01': { name: '耕作机械', prefix: 'EQ0101' }, '02': { name: '播种/移栽设备', prefix: 'EQ0102' }, '03': { name: '植保机械', prefix: 'EQ0103' }, '04': { name: '收获机械', prefix: 'EQ0104' }, '05': { name: '初加工设备', prefix: 'EQ0105' }, '99': { name: '其他相关机械', prefix: 'EQ0199' } } },
      '02': { name: '设施农业系统', subCategories: { '01': { name: '骨架结构材料', prefix: 'EQ0201' }, '02': { name: '覆盖材料', prefix: 'EQ0202' }, '03': { name: '通风降温设备', prefix: 'EQ0203' }, '04': { name: '加温设备', prefix: 'EQ0204' }, '05': { name: '补光系统', prefix: 'EQ0205' }, '06': { name: '自动化控制设备', prefix: 'EQ0206' }, '99': { name: '其他相关设施设备', prefix: 'EQ0299' } } },
      '03': { name: '灌溉与水肥系统', subCategories: { '01': { name: '水源与泵站', prefix: 'EQ0301' }, '02': { name: '水肥一体机', prefix: 'EQ0302' }, '03': { name: '输水管网', prefix: 'EQ0303' }, '04': { name: '过滤系统', prefix: 'EQ0304' }, '05': { name: '施肥装置', prefix: 'EQ0305' }, '06': { name: '灌溉终端', prefix: 'EQ0306' }, '99': { name: '其他相关灌溉系统设备', prefix: 'EQ0399' } } }
    }
  },
  'OP': {
    name: '作业支持类',
    categories: {
      '01': { name: '劳保与防护用品', subCategories: { '01': { name: '手部防护', prefix: 'OP0101' }, '02': { name: '足部防护', prefix: 'OP0102' }, '03': { name: '身体防护', prefix: 'OP0103' }, '04': { name: '呼吸/眼部防护', prefix: 'OP0104' }, '05': { name: '防晒防暑用品', prefix: 'OP0105' }, '99': { name: '其他劳保防护类', prefix: 'OP0199' } } },
      '02': { name: '日常劳动工具', subCategories: { '01': { name: '手动农具', prefix: 'OP0201' }, '02': { name: '修剪工具', prefix: 'OP0202' }, '03': { name: '小型电动工具', prefix: 'OP0203' }, '04': { name: '清洁工具', prefix: 'OP0204' }, '05': { name: '小型运输车', prefix: 'OP0205' }, '99': { name: '其他劳动工具', prefix: 'OP0299' } } },
      '03': { name: '标识与记录用品', subCategories: { '01': { name: '田间标牌/标签', prefix: 'OP0301' }, '02': { name: '记录本、记号笔', prefix: 'OP0302' }, '03': { name: '二维码/RFID标签', prefix: 'OP0303' }, '99': { name: '其他标识记录用品', prefix: 'OP0399' } } }
    }
  },
  'PH': {
    name: '采后处理与流通类',
    categories: {
      '01': { name: '采收容器', subCategories: { '01': { name: '塑料周转箱', prefix: 'PH0101' }, '02': { name: '采摘篮/筐', prefix: 'PH0102' }, '03': { name: '吨袋/编织袋', prefix: 'PH0103' }, '04': { name: '包装材料', prefix: 'PH0104' }, '05': { name: '纸箱', prefix: 'PH0105' }, '06': { name: '泡沫网套/隔板', prefix: 'PH0106' }, '07': { name: '胶带、封口耗材', prefix: 'PH0107' }, '08': { name: '商品标签/追溯标签', prefix: 'PH0108' }, '99': { name: '其他采收材料', prefix: 'PH0199' } } },
      '02': { name: '冷链与仓储设备', subCategories: { '01': { name: '预冷库/冷藏库', prefix: 'PH0201' }, '02': { name: '冷藏运输设备', prefix: 'PH0202' }, '03': { name: '保温箱、冰袋', prefix: 'PH0203' }, '99': { name: '其他', prefix: 'PH0299' } } }
    }
  },
  'IT': {
    name: '数字化与管理类',
    categories: {
      '01': { name: '监测设备', subCategories: { '01': { name: '空气/土壤/光照等传感器', prefix: 'IT0101' }, '02': { name: '手持检测类设备', prefix: 'IT0102' }, '03': { name: '气象站', prefix: 'IT0103' }, '04': { name: '虫情测报灯', prefix: 'IT0104' }, '05': { name: '视频监控设备', prefix: 'IT0105' }, '99': { name: '其他检测相关设备', prefix: 'IT0199' } } },
      '02': { name: '控制设备', subCategories: { '01': { name: '环境参数感知设备', prefix: 'IT0201' }, '02': { name: '执行控制设备', prefix: 'IT0202' }, '03': { name: '人机交互与本地操作设备', prefix: 'IT0203' }, '04': { name: '通信与联网设备', prefix: 'IT0204' }, '05': { name: '电源与辅助控制设备', prefix: 'IT0205' }, '99': { name: '其他相关控制设备', prefix: 'IT0299' } } },
      '03': { name: '软件与服务', subCategories: { '01': { name: 'ERP模块许可', prefix: 'IT0301' }, '02': { name: '温室大棚控制系统web', prefix: 'IT0302' }, '03': { name: '温室大棚控制系统小程序', prefix: 'IT0303' }, '04': { name: '数据分析服务', prefix: 'IT0304' }, '05': { name: '产品检测服务', prefix: 'IT0305' }, '99': { name: '其他软件与服务', prefix: 'IT0399' } } }
    }
  },
  'EC': {
    name: '能源与通用耗材',
    categories: {
      '01': { name: '能源类', subCategories: { '01': { name: '柴油/汽油', prefix: 'EC0101' }, '02': { name: '电力', prefix: 'EC0102' }, '03': { name: '太阳能板及配件', prefix: 'EC0103' }, '99': { name: '其他能源类', prefix: 'EC0199' } } },
      '02': { name: '通用耗材', subCategories: { '01': { name: '电线、电缆', prefix: 'EC0201' }, '02': { name: '扎带、螺丝、密封胶', prefix: 'EC0202' }, '03': { name: '电池', prefix: 'EC0203' }, '04': { name: '润滑油、润滑脂', prefix: 'EC0204' }, '99': { name: '其他耗材', prefix: 'EC0299' } } }
    }
  },
  'OT': {
    name: '其他类',
    categories: {
      '01': { name: '未分类资材', subCategories: { '01': { name: '其他未分类资材', prefix: 'OT0101' } } }
    }
  }
}

// ==================== Store ====================

const inboundStore = useInboundStore()
const warehouseMaterialStore = useWarehouseMaterialStore()

// 物料搜索下拉状态
const materialSearchKeyword = ref('')
const materialSearchIndex = ref(-1) // 当前正在搜索的物料行索引
const materialSearchResults = ref([])
const materialSearchShow = ref(false)
const materialSearchHighlight = ref(0)

// 点击外部关闭搜索下拉
const closeMaterialSearch = () => {
  materialSearchShow.value = false
  materialSearchIndex.value = -1
}

// 监听全局点击关闭下拉
const onDocumentClick = (e) => {
  const target = e.target
  if (target && target.closest && target.closest('.material-search-dropdown')) return
  if (target && target.closest && target.closest('[data-material-search-trigger]')) return
  closeMaterialSearch()
}

// ==================== 状态定义 ====================

// 编码生成器
const codeGenExpanded = ref(false)
const codeGen = reactive({ bigCategory: '', midCategory: '', subCategory: '', generatedCode: '' })
const codeGenError = ref('')
const codeGenSuccess = ref('')
const copySuccess = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索筛选
const searchCode = ref('')
const searchSupplier = ref('')
const searchStatus = ref('')
const searchMaterialName = ref('')
const searchMaterialCode = ref('')

// 选择与模式
const selectedRows = ref([])
const editMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)

// 弹窗
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBatchEditModal = ref(false)
const showDeleteModal = ref(false)
const showExportModal = ref(false)

// 记录选中
const detailRecord = ref(null)
const editRecord = ref(null)
const deleteRecords = ref([])
const exportRecords = ref([])
const batchEditRecords = ref([])
const batchEditFields = reactive({ inboundDate: '', supplier: '', operator: '', status: '' })

// 新增表单
const addForm = reactive({
  code: '', inboundDate: '', supplier: '', operator: '',
  materials: []
})
const addFormRef = ref()

// 编辑表单
const editForm = reactive({
  id: 0, code: '', inboundDate: '', supplier: '', operator: '', status: 'pending',
  materials: []
})

// 弹窗内编码生成器
const showModalCodeGen = ref(false)
const modalCodeGenIndex = ref(-1)
const modalCodeGen = reactive({ bigCategory: '', midCategory: '', subCategory: '' })

// 导出格式
const exportFormat = ref('excel')

// V1.1 风格的物料库存数据（与 V1.1 WarehouseMaterialsPage.tsx 行 33-47 完全一致）
// 用于入库弹窗的物料名称搜索下拉，作为 store 加载失败时的 fallback
const mockWarehouseMaterials = [
  { id: 1, code: 'SP0101001', name: '水稻种子', category: '种质资源-粮食作物种子', unit: '袋', quantity: 200, minStock: 50, maxStock: 500, price: '30元', supplier: '金种子业公司', location: 'A区-01', specification: '25kg/袋', barcode: '6932456789012', batchNo: 'PC20260301', productionDate: '2026-01-15', expiryDate: '2027-01-15', lastUpdateTime: '2026-03-20 10:30:00', dataStatus: '启用' },
  { id: 2, code: 'SP0102001', name: '棉花种子', category: '种质资源-经济作物种子', unit: '袋', quantity: 80, minStock: 30, maxStock: 200, price: '25元', supplier: '丰收种业', location: 'A区-02', specification: '20kg/袋', barcode: '6932456789013', batchNo: 'PC20260220', productionDate: '2026-02-01', expiryDate: '2027-02-01', lastUpdateTime: '2026-03-19 14:20:00', dataStatus: '启用' },
  { id: 3, code: 'SP0103001', name: '番茄种子', category: '种质资源-蔬菜种子', unit: '袋', quantity: 100, minStock: 50, maxStock: 300, price: '25元', supplier: '鑫源农资公司', location: 'A区-03', specification: '10g/袋', barcode: '6932456789014', batchNo: 'PC20260305', productionDate: '2026-02-20', expiryDate: '2026-08-20', lastUpdateTime: '2026-03-18 09:15:00', dataStatus: '启用' },
  { id: 4, code: 'SP0201001', name: '商品有机肥', category: '肥料与土壤改良剂-有机肥', unit: '袋', quantity: 50, minStock: 100, maxStock: 400, price: '45元', supplier: '丰达化肥厂', location: 'B区-01', specification: '40kg/袋', barcode: '6932456789015', batchNo: 'PC20260110', productionDate: '2026-01-10', expiryDate: '2026-07-10', lastUpdateTime: '2026-03-20 08:00:00', dataStatus: '启用' },
  { id: 5, code: 'SP0202001', name: '尿素', category: '肥料与土壤改良剂-化学肥料', unit: '袋', quantity: 150, minStock: 50, maxStock: 500, price: '80元', supplier: '丰达化肥厂', location: 'B区-02', specification: '50kg/袋', barcode: '6932456789016', batchNo: 'PC20260228', productionDate: '2026-02-28', expiryDate: '2028-02-28', lastUpdateTime: '2026-03-17 16:45:00', dataStatus: '启用' },
  { id: 6, code: 'SP0301001', name: '吡虫啉', category: '农药与植保产品-杀虫剂', unit: '箱', quantity: 30, minStock: 20, maxStock: 100, price: '120元', supplier: '绿叶农业用品店', location: 'C区-01', specification: '100g/瓶', barcode: '6932456789017', batchNo: 'PC20251215', productionDate: '2025-12-15', expiryDate: '2027-12-15', lastUpdateTime: '2026-03-16 11:30:00', dataStatus: '启用' },
  { id: 7, code: 'SP0302001', name: '多菌灵', category: '农药与植保产品-杀菌剂', unit: '箱', quantity: 20, minStock: 20, maxStock: 80, price: '150元', supplier: '绿叶农业用品店', location: 'C区-02', specification: '200g/瓶', barcode: '6932456789018', batchNo: 'PC20251120', productionDate: '2025-11-20', expiryDate: '2027-11-20', lastUpdateTime: '2026-03-15 13:20:00', dataStatus: '启用' },
  { id: 8, code: 'EQ0103001', name: '电动喷雾机', category: '农业机械-植保机械', unit: '台', quantity: 10, minStock: 5, maxStock: 30, price: '280元', supplier: '农机设备公司', location: 'D区-01', specification: '3W-16L', barcode: '6932456789019', batchNo: 'EQ20260301', productionDate: '2026-02-15', expiryDate: '2031-02-15', lastUpdateTime: '2026-03-14 10:00:00', dataStatus: '启用' },
  { id: 9, code: 'EQ0306001', name: '滴灌带', category: '灌溉与水肥系统-灌溉终端', unit: '卷', quantity: 500, minStock: 200, maxStock: 1000, price: '25元', supplier: '节水灌溉设备厂', location: 'E区-01', specification: 'D16-2.0L/h', barcode: '6932456789020', batchNo: 'EQ20260125', productionDate: '2026-01-25', expiryDate: '2031-01-25', lastUpdateTime: '2026-03-13 15:30:00', dataStatus: '启用' },
  { id: 10, code: 'OP0102001', name: '劳保胶靴', category: '劳保与防护用品-足部防护', unit: '双', quantity: 40, minStock: 20, maxStock: 100, price: '35元', supplier: '劳保用品商店', location: 'F区-01', specification: '39-43码', barcode: '6932456789021', batchNo: 'OP20260201', productionDate: '2026-02-01', expiryDate: '2028-02-01', lastUpdateTime: '2026-03-12 09:45:00', dataStatus: '启用' },
  { id: 11, code: 'OP0201001', name: '锄头', category: '日常劳动工具-手动农具', unit: '把', quantity: 25, minStock: 10, maxStock: 80, price: '18元', supplier: '五金工具店', location: 'F区-02', specification: '1.2kg', barcode: '6932456789022', batchNo: 'OP20260115', productionDate: '2026-01-15', expiryDate: '2031-01-15', lastUpdateTime: '2026-03-11 14:00:00', dataStatus: '启用' },
  { id: 12, code: 'PH0104001', name: '塑料袋', category: '采收容器-包装材料', unit: '卷', quantity: 200, minStock: 100, maxStock: 500, price: '15元', supplier: '包装材料公司', location: 'G区-01', specification: '50cm*80cm', barcode: '6932456789023', batchNo: 'PH20260210', productionDate: '2026-02-10', expiryDate: '2027-02-10', lastUpdateTime: '2026-03-10 16:20:00', dataStatus: '启用' }
]

// 物料搜索数据源：优先 store 实际数据，fallback 到 V1.1 风格 mock
const materialSearchDataSource = computed(() => {
  const storeData = warehouseMaterialStore.materials || []
  if (storeData.length > 0) return storeData
  return mockWarehouseMaterials
})

// ==================== 计算属性 ====================

// 激活模式判断
const hasActiveMode = computed(() => editMode.value || deleteMode.value || exportMode.value)

// 筛选后的记录
const filteredRecords = computed(() => {
  let records = inboundStore.inboundRecords || []
  if (searchCode.value) {
    const kw = searchCode.value.toLowerCase()
    records = records.filter(r => r.code && r.code.toLowerCase().includes(kw))
  }
  if (searchSupplier.value) {
    const kw = searchSupplier.value.toLowerCase()
    records = records.filter(r => r.supplier && r.supplier.toLowerCase().includes(kw))
  }
  if (searchStatus.value) {
    records = records.filter(r => r.status === searchStatus.value)
  }
  if (searchMaterialName.value || searchMaterialCode.value) {
    const nameKw = (searchMaterialName.value || '').toLowerCase()
    const codeKw = (searchMaterialCode.value || '').toLowerCase()
    records = records.filter(r => {
      const materials = r.materials || []
      return materials.some(m => {
        const nameMatch = !nameKw || (m.name && m.name.toLowerCase().includes(nameKw))
        const codeMatch = !codeKw || (m.code && m.code.toLowerCase().includes(codeKw))
        return nameMatch && codeMatch
      })
    })
  }
  return records
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value) || 1)

// 总条数
const paginationTotal = computed(() => filteredRecords.value.length)

// 当前页显示
const displayedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

// 选中的记录
const selectedRecords = computed(() => {
  const allRecords = inboundStore.inboundRecords || []
  return allRecords.filter(r => selectedRows.value.includes(r.id))
})

// 全选判断
const isAllSelected = computed(() => {
  if (deleteMode.value) {
    const pendingRecords = displayedRecords.value.filter(r => r.status === 'pending')
    return pendingRecords.length > 0 && pendingRecords.every(r => selectedRows.value.includes(r.id))
  }
  return displayedRecords.value.length > 0 && selectedRows.value.length === displayedRecords.value.length
})

// 编码生成器中类选项
const midCategories = computed(() => {
  if (!codeGen.bigCategory) return []
  const big = categoryConfig[codeGen.bigCategory]
  if (!big) return []
  return Object.entries(big.categories).map(([code, data]) => ({ code, name: data.name }))
})

// 编码生成器小类选项
const subCategories = computed(() => {
  if (!codeGen.bigCategory || !codeGen.midCategory) return []
  const big = categoryConfig[codeGen.bigCategory]
  if (!big) return []
  const mid = big.categories[codeGen.midCategory]
  if (!mid) return []
  return Object.entries(mid.subCategories).map(([code, data]) => ({ code, name: data.name, prefix: data.prefix }))
})

// 弹窗内编码中类
const modalMidCategories = computed(() => {
  if (!modalCodeGen.bigCategory) return []
  const big = categoryConfig[modalCodeGen.bigCategory]
  if (!big) return []
  return Object.entries(big.categories).map(([code, data]) => ({ code, name: data.name }))
})

// 弹窗内编码小类
const modalSubCategories = computed(() => {
  if (!modalCodeGen.bigCategory || !modalCodeGen.midCategory) return []
  const big = categoryConfig[modalCodeGen.bigCategory]
  if (!big) return []
  const mid = big.categories[modalCodeGen.midCategory]
  if (!mid) return []
  return Object.entries(mid.subCategories).map(([code, data]) => ({ code, name: data.name, prefix: data.prefix }))
})

// ==================== 状态工具函数 ====================

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'voided': return '已作废'
    case 'pending':
    default: return '待审核'
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'voided': return 'info'
    case 'pending':
    default: return 'warning'
  }
}

// ==================== 编码生成器 ====================

const handleCodeGenBigCategoryChange = () => {
  codeGen.midCategory = ''
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleCodeGenMidCategoryChange = () => {
  codeGen.subCategory = ''
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleCodeGenSubCategoryChange = () => {
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleGenerateCode = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory || !codeGen.subCategory) {
    codeGenError.value = '请选择完整的分类'
    return
  }
  const baseCode = `${codeGen.bigCategory}${codeGen.midCategory}${codeGen.subCategory}`
  // P0修复: V1.1 max+1 自增编码（避免 Math.random() 重复）
  const existingCodes = (inboundStore.inboundRecords || []).flatMap(r =>
    (r.materials || []).map(m => m.code || m.materialCode || '')
  ).filter(c => c.startsWith(baseCode))
  let maxSeq = 0
  existingCodes.forEach(c => {
    const suffix = c.slice(baseCode.length)
    const num = parseInt(suffix, 10)
    if (!isNaN(num) && num > maxSeq) maxSeq = num
  })
  const seq = maxSeq + 1
  codeGen.generatedCode = `${baseCode}${String(seq).padStart(3, '0')}`
  codeGenSuccess.value = `生成成功: ${codeGen.generatedCode}`
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

// ==================== 筛选 ====================

const handleSearch = () => {
  currentPage.value = 1
}

const resetSearchFilters = () => {
  searchCode.value = ''
  searchSupplier.value = ''
  searchStatus.value = ''
  searchMaterialName.value = ''
  searchMaterialCode.value = ''
  currentPage.value = 1
}

// ==================== 分页 ====================

const handlePageSizeChange = () => {
  currentPage.value = 1
}

// ==================== 选择与模式 ====================

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(row => row.id)
}

// 展开行状态
const expandedRows = ref(new Set())

/** 展开/折叠行 */
const toggleExpandRow = (id) => {
  const newSet = new Set(expandedRows.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  expandedRows.value = newSet
}

/** 单行选中切换 */
const toggleInboundRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const handleSelectAll = () => {
  if (deleteMode.value) {
    const pendingIds = displayedRecords.value.filter(r => r.status === 'pending').map(r => r.id)
    const allSelected = pendingIds.every(id => selectedRows.value.includes(id))
    if (allSelected) {
      selectedRows.value = selectedRows.value.filter(id => !pendingIds.includes(id))
    } else {
      const existing = selectedRows.value.filter(id => !pendingIds.includes(id))
      selectedRows.value = [...existing, ...pendingIds]
    }
  } else {
    if (selectedRows.value.length === displayedRecords.value.length) {
      selectedRows.value = []
    } else {
      selectedRows.value = displayedRecords.value.map(r => r.id)
    }
  }
}

const enterEditMode = () => {
  editMode.value = true
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const enterDeleteMode = () => {
  deleteMode.value = true
  editMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const enterExportMode = () => {
  exportMode.value = true
  editMode.value = false
  deleteMode.value = false
  selectedRows.value = []
}

const cancelSelection = () => {
  editMode.value = false
  deleteMode.value = false
  exportMode.value = false
  selectedRows.value = []
}

const exitExportMode = () => {
  exportMode.value = false
  selectedRows.value = []
}

// ==================== 查看/编辑记录 ====================

const handleViewRecord = (record) => {
  detailRecord.value = record
  showDetailModal.value = true
}

const handleEditRecord = (record) => {
  editRecord.value = record
  editForm.id = record.id
  editForm.code = record.code
  editForm.inboundDate = record.inboundDate || ''
  editForm.supplier = record.supplier || ''
  editForm.operator = record.operator || ''
  editForm.status = record.status || 'pending'
  editForm.materials = (record.materials || []).map(m => ({ ...m }))
  showEditModal.value = true
}

// ==================== 新增入库 ====================

const handleAddRecord = () => {
  resetAddForm()
  showAddModal.value = true
}

const resetAddForm = () => {
  addForm.code = ''
  addForm.inboundDate = ''
  addForm.supplier = ''
  addForm.operator = ''
  addForm.materials = []
}

// 生成入库单号 RKYYYYMMDD-NNNN
const generateOrderCode = () => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const prefix = `RK${dateStr}-`
  const records = inboundStore.inboundRecords || []
  let maxSeq = 0
  records.forEach(r => {
    if (r.code && r.code.startsWith(prefix)) {
      const seq = parseInt(r.code.replace(prefix, ''), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })
  const newSeq = maxSeq + 1
  addForm.code = newSeq > 9999 ? `${prefix}ERR` : `${prefix}${String(newSeq).padStart(4, '0')}`
}

const createEmptyMaterial = () => ({
  id: Date.now(),
  code: '', name: '', category: '', bigCategory: '', midCategory: '', subCategory: '',
  specification: '', barcode: '', unit: '袋', quantity: 0, price: '',
  location: '', batchNo: '', productionDate: '', expiryDate: '', remarks: ''
})

const addMaterialRow = () => {
  addForm.materials.push(createEmptyMaterial())
}

const removeMaterialRow = (index) => {
  addForm.materials.splice(index, 1)
}

const addEditMaterialRow = () => {
  editForm.materials.push(createEmptyMaterial())
}

const removeEditMaterialRow = (index) => {
  editForm.materials.splice(index, 1)
}

// 弹窗内编码生成
const openAddMaterialCodeGen = (index) => {
  modalCodeGenIndex.value = index
  modalCodeGen.bigCategory = ''
  modalCodeGen.midCategory = ''
  modalCodeGen.subCategory = ''
  showModalCodeGen.value = true
}

const handleModalCodeGenBigChange = () => {
  modalCodeGen.midCategory = ''
  modalCodeGen.subCategory = ''
}

const handleModalCodeGenMidChange = () => {
  modalCodeGen.subCategory = ''
}

const generateModalCode = () => {
  if (!modalCodeGen.bigCategory || !modalCodeGen.midCategory || !modalCodeGen.subCategory) return
  const baseCode = `${modalCodeGen.bigCategory}${modalCodeGen.midCategory}${modalCodeGen.subCategory}`
  // P0修复: V1.1 max+1 自增编码（避免 Math.random() 重复）
  const existingCodes = (inboundStore.inboundRecords || []).flatMap(r =>
    (r.materials || []).map(m => m.code || m.materialCode || '')
  ).filter(c => c.startsWith(baseCode))
  let maxSeq = 0
  existingCodes.forEach(c => {
    const suffix = c.slice(baseCode.length)
    const num = parseInt(suffix, 10)
    if (!isNaN(num) && num > maxSeq) maxSeq = num
  })
  const seq = maxSeq + 1
  const code = `${baseCode}${String(seq).padStart(3, '0')}`
  if (modalCodeGenIndex.value >= 0 && modalCodeGenIndex.value < addForm.materials.length) {
    addForm.materials[modalCodeGenIndex.value].code = code
  }
  showModalCodeGen.value = false
}

const handleSaveNewInbound = async () => {
  if (!addForm.code) {
    ElMessage.warning('请先生成入库单号')
    return
  }
  try {
    await inboundStore.addInbound({
      code: addForm.code,
      inboundDate: addForm.inboundDate,
      supplier: addForm.supplier,
      operator: addForm.operator,
      status: 'pending',
      materials: addForm.materials.map(m => {
        const { id, ...rest } = m
        return rest
      })
    })
    ElMessage.success('新增入库成功')
    showAddModal.value = false
    resetAddForm()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('新增入库失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 编辑保存 ====================

const handleApplyVoid = () => {
  ElMessage.info('作废申请已提交')
}

const handleSaveEdit = async () => {
  try {
    await inboundStore.editInbound(editForm.id, {
      code: editForm.code,
      inboundDate: editForm.inboundDate,
      supplier: editForm.supplier,
      operator: editForm.operator,
      status: editForm.status,
      materials: editForm.materials.map(m => {
        const { id, ...rest } = m
        return rest
      })
    })
    ElMessage.success('编辑保存成功')
    showEditModal.value = false
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('编辑保存失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 确认编辑（批量） ====================

const handleConfirmEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的记录')
    return
  }
  batchEditRecords.value = selectedRecords.value
  batchEditFields.inboundDate = ''
  batchEditFields.supplier = ''
  batchEditFields.operator = ''
  batchEditFields.status = ''
  showBatchEditModal.value = true
}

const handleBatchSave = async () => {
  const updates = {}
  if (batchEditFields.inboundDate) updates.inboundDate = batchEditFields.inboundDate
  if (batchEditFields.supplier) updates.supplier = batchEditFields.supplier
  if (batchEditFields.operator) updates.operator = batchEditFields.operator
  if (batchEditFields.status) updates.status = batchEditFields.status

  if (Object.keys(updates).length === 0) {
    ElMessage.warning('请至少填写一项要修改的字段')
    return
  }

  try {
    for (const record of batchEditRecords.value) {
      const updated = { ...record, ...updates }
      await inboundStore.editInbound(record.id, {
        code: updated.code,
        inboundDate: updated.inboundDate,
        supplier: updated.supplier,
        operator: updated.operator,
        status: updated.status,
        materials: (updated.materials || []).map(m => {
          const { id, ...rest } = m
          return rest
        })
      })
    }
    ElMessage.success(`批量编辑成功，已更新 ${batchEditRecords.value.length} 条记录`)
    showBatchEditModal.value = false
    cancelSelection()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('批量编辑失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 删除 ====================

// 行内"删除"按钮 → 设置待删记录并打开确认弹窗（V1.1 handleDeleteRecord 对齐）
const handleDeleteRecordClick = (record) => {
  if (record.status !== 'pending') {
    ElMessage.warning('仅"待审核"状态的入库记录可删除')
    return
  }
  deleteRecords.value = [record]
  showDeleteModal.value = true
}

// 点击"确认删除"按钮 → 设置待删记录并打开确认弹窗
const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  deleteRecords.value = selectedRecords.value
  showDeleteModal.value = true
}

// 在删除确认弹窗中点击"确认删除" → 执行实际删除
const handleConfirmDeleteExecute = async () => {
  if (deleteRecords.value.length === 0) return
  try {
    const ids = deleteRecords.value.map(r => r.id)
    await inboundStore.removeMaterials(ids)
    ElMessage.success(`已删除 ${deleteRecords.value.length} 条记录`)
    showDeleteModal.value = false
    cancelSelection()
    await inboundStore.loadInboundRecords()
  } catch (err) {
    ElMessage.error('删除失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 导出 ====================

// 点击"确认导出"按钮 → 设置导出记录并打开导出格式选择弹窗
const handleConfirmExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的记录')
    return
  }
  exportRecords.value = selectedRecords.value
  showExportModal.value = true
}

// 在导出弹窗中点击"导出" → 执行实际导出
const handleDoExport = () => {
  const dataToExport = exportRecords.value

  if (dataToExport.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  // 展平导出：每条物料一行（与V1.1一致：入库单信息仅首行显示）
  const headers = ['入库单号', '入库日期', '供应商', '操作员', '状态', '序号', '物料编码', '物料名称', '分类', '规格', '条形码', '单位', '数量', '单价', '批次号', '生产日期', '有效期至', '存放位置', '备注']
  const rows = []
  dataToExport.forEach(r => {
    const materials = r.materials || []
    const materialCount = materials.length
    if (materials.length === 0) {
      rows.push({
        '入库单号': r.code, '入库日期': r.inboundDate || '', '供应商': r.supplier || '',
        '操作员': r.operator || '', '状态': getStatusText(r.status), '序号': '',
        '物料编码': '', '物料名称': '', '分类': '', '规格': '', '条形码': '', '单位': '', '数量': '', '单价': '',
        '批次号': '', '生产日期': '', '有效期至': '', '存放位置': '', '备注': ''
      })
    } else {
      materials.forEach((m, index) => {
        rows.push({
          '入库单号': index === 0 ? r.code : '', '入库日期': index === 0 ? (r.inboundDate || '') : '',
          '供应商': index === 0 ? (r.supplier || '') : '', '操作员': index === 0 ? (r.operator || '') : '',
          '状态': index === 0 ? getStatusText(r.status) : '', '序号': `${index + 1}/${materialCount}`,
          '物料编码': m.code || '', '物料名称': m.name || '', '分类': m.category || '',
          '规格': m.specification || '', '条形码': m.barcode || '', '单位': m.unit || '', '数量': m.quantity ?? '',
          '单价': m.price || '', '批次号': m.batchNo || '', '生产日期': m.productionDate || '',
          '有效期至': m.expiryDate || '', '存放位置': m.location || '', '备注': m.remarks || ''
        })
      })
    }
  })

  let content = ''
  let mimeType = ''
  let extension = ''

  if (exportFormat.value === 'csv') {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${(row[h] !== undefined ? row[h] : '')}"`).join(','))
    ].join('\n')
    content = '﻿' + csvContent
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${headers.map(h => `<td>${(row[h] !== undefined ? row[h] : '')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xls'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>物料入库记录</title></head><body><table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr style="background-color:#f0f0f0">${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(row => `<tr>${headers.map(h => `<td>${(row[h] !== undefined ? row[h] : '')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'doc'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `物料入库记录_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // ExportFormatModal 会自动关闭并触发 exitExportMode
  ElMessage.success('导出成功')
}

// ==================== 初始化 ====================

onMounted(async () => {
  await inboundStore.loadInboundRecords()
  // 加载物料列表（用于入库弹窗的物料名称搜索下拉）
  try {
    await warehouseMaterialStore.loadMaterials()
  } catch (err) {
    console.warn('[WarehouseInbound] 物料列表加载失败', err)
  }
  // 绑定全局点击关闭搜索下拉
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

/**
 * 物料搜索下拉相关函数
 */
// 打开搜索下拉（聚焦 input 时）
const openMaterialSearch = (idx) => {
  materialSearchIndex.value = idx
  materialSearchKeyword.value = addForm.materials[idx]?.name || ''
  filterMaterialSearchResults()
  materialSearchShow.value = true
  materialSearchHighlight.value = 0
}

// 输入时过滤
const filterMaterialSearchResults = () => {
  const kw = (materialSearchKeyword.value || '').trim().toLowerCase()
  // 使用 computed 数据源（自动 fallback 到 V1.1 风格 mock 数据）
  const all = materialSearchDataSource.value || []
  if (!kw) {
    // 关键字为空，显示前 20 条
    materialSearchResults.value = all.slice(0, 20)
    return
  }
  // 关键字非空，按 name / code 模糊匹配
  materialSearchResults.value = all.filter(m => {
    const name = (m.name || '').toLowerCase()
    const code = (m.code || '').toLowerCase()
    return name.includes(kw) || code.includes(kw)
  }).slice(0, 20)
}

const onMaterialSearchInput = () => {
  if (materialSearchIndex.value < 0) return
  filterMaterialSearchResults()
  materialSearchShow.value = true
  materialSearchHighlight.value = 0
}

// 键盘导航（↑↓ Enter Esc）
const onMaterialSearchKeydown = (e) => {
  if (!materialSearchShow.value) return
  const max = materialSearchResults.value.length
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    materialSearchHighlight.value = (materialSearchHighlight.value + 1) % Math.max(max, 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    materialSearchHighlight.value = (materialSearchHighlight.value - 1 + max) % Math.max(max, 1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = materialSearchResults.value[materialSearchHighlight.value]
    if (item) selectMaterialForRow(item)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeMaterialSearch()
  }
}

// 选择物料后自动填充所有相关字段
const selectMaterialForRow = (material) => {
  const idx = materialSearchIndex.value
  if (idx < 0 || !addForm.materials[idx]) return
  const row = addForm.materials[idx]
  // 关联字段（V1.1 行为：选择后自动填充所有基础信息）
  row.code = material.code || ''
  row.name = material.name || ''
  row.category = material.category || ''
  row.specification = material.specification || ''
  row.barcode = material.barcode || ''
  row.unit = material.unit || '袋'
  row.price = material.price || ''
  row.supplier = material.supplier || ''
  row.location = material.location || ''
  row._fromSearch = true // 标记已从搜索选择（用于其他字段联动）
  // 关闭下拉
  closeMaterialSearch()
}
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  min-height: 38px;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #10b981 inset !important;
}
:deep(.el-select__wrapper) {
  padding: 0 11px !important;
  box-shadow: 0 0 0 1px #9ca3af inset !important;
  border-radius: 0.5rem !important;
  min-height: 38px;
  background: #fff;
}
</style>
