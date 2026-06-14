<template>
  <div class="space-y-6">
    <!-- 页头 - 与V1.1 PageHeader.tsx一致：Truck图标，无副标题 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Truck :size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">供应商管理</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- 编码规则按钮 + 编码生成器 -->
    <div class="flex items-center gap-4">
      <div class="h-6 w-px bg-gray-500"></div>
      <button @click="handleShowCodeRule" :class="btnSecondary">编码规则 &gt;&gt;</button>
      <span class="text-base font-bold text-blue-600">供应商编码生成</span>
      <button @click="codeGenExpanded = !codeGenExpanded" class="p-1 hover:bg-gray-100 rounded" :title="codeGenExpanded ? '收起' : '展开'">
        <ChevronDown v-if="!codeGenExpanded" :size="20" class="text-gray-600" />
        <ChevronUp v-else :size="20" class="text-gray-600" />
      </button>
    </div>

    <!-- 编码生成器（可折叠） - V1.1 6列网格布局：所有控件同一行 -->
    <div v-if="codeGenExpanded" class="bg-white rounded-xl p-4 shadow-sm">
      <div class="grid grid-cols-6 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商大类</label>
          <select v-model="codeGen.bigCategory" @change="handleCodeGenBigChange" class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
            <option value="">请选择</option>
            <option v-for="cat in categoryOptions" :key="cat.code" :value="cat.code">{{ cat.code }}-{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商中类</label>
          <select v-model="codeGen.midCategory" :disabled="!codeGen.bigCategory" @change="handleCodeGenMidChange" class="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">请选择</option>
            <option v-for="cat in codeGenMidCats" :key="cat.code" :value="cat.code">{{ cat.code }}-{{ cat.name }}</option>
          </select>
        </div>
        <div class="col-span-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            生成编码
            <span v-if="codeGenSuccess && !codeGenError" class="ml-2 text-sm text-green-600 font-normal">{{ codeGenSuccess }}</span>
            <span v-if="codeGenError" class="ml-2 text-sm text-red-600 font-normal">{{ codeGenError }}</span>
          </label>
          <div class="flex gap-2">
            <input v-model="codeGen.generatedCode" placeholder="点击生成" readonly class="w-40 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50" />
            <button :disabled="!codeGen.midCategory" @click="handleGenerateCode" :class="[btnDefault, 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed']">
              <Wand2 :size="14" /> 生成
            </button>
            <button :disabled="!codeGen.generatedCode" @click="handleCopyCode" :class="[btnBlue, 'disabled:bg-gray-300 disabled:cursor-not-allowed']">
              <ClipboardCopy :size="14" />{{ copySuccess ? '已复制!' : '复制' }}
            </button>
            <button @click="handleResetCodeGen" :class="btnWarning">
              <RotateCcw :size="14" /> 重置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选 - 与V1.1 SupplierFilters一致 -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex items-end gap-4">
        <div class="flex-1 grid grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商名称</label>
            <input v-model="filters.name" placeholder="输入名称搜索" @input="handleFilterChange('name', filters.name)" @keyup.enter="currentPage = 1" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">所属组织</label>
            <select v-model="filters.organization" @change="handleFilterChange('organization', filters.organization)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option value="全部">全部</option>
              <option value="宁波帮帮忙公司">宁波帮帮忙公司</option>
              <option value="成都帮帮您公司">成都帮帮您公司</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商类型</label>
            <select v-model="filters.type" @change="handleFilterChange('type', filters.type)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option value="全部">全部类型</option>
              <option v-for="cat in categoryOptions" :key="cat.code" :value="cat.code">{{ getSupplierTypeName(cat.code) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商属性</label>
            <select v-model="filters.supplierAttribute" @change="handleFilterChange('supplierAttribute', filters.supplierAttribute)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option v-for="opt in supplierAttributeFilterOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">供应商状态</label>
            <select v-model="filters.status" @change="handleFilterChange('status', filters.status)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500">
              <option value="全部">全部</option>
              <option value="合作中">合作中</option>
              <option value="暂停">暂停</option>
              <option value="终止">终止</option>
            </select>
          </div>
        </div>
        <div class="flex items-end gap-2">
          <button @click="showMore = !showMore" :class="btnSecondary">
            {{ showMore ? '收起' : '更多' }}
            <ChevronUp v-if="showMore" :size="14" />
            <ChevronDown v-else :size="14" />
          </button>
          <button @click="handleResetFilters" :class="btnWarning">
            <RotateCcw :size="14" /> 重置
          </button>
        </div>
      </div>

      <!-- 更多筛选 -->
      <div v-if="showMore" class="mt-3 grid grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
          <input v-model="filters.contact" placeholder="输入联系人搜索" @input="handleFilterChange('contact', filters.contact)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">省份</label>
          <input v-model="filters.province" placeholder="省份" @input="handleFilterChange('province', filters.province)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">城市</label>
          <input v-model="filters.city" placeholder="城市" @input="handleFilterChange('city', filters.city)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">区县</label>
          <input v-model="filters.district" placeholder="区县" @input="handleFilterChange('district', filters.district)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">供应商编号</label>
          <input v-model="filters.code" placeholder="输入编号搜索" @input="handleFilterChange('code', filters.code)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
        </div>
      </div>
    </div>

    <!-- 表格区域 - 与V1.1 SupplierTable一致 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- 工具栏 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">供应商列表</h3>
          <template v-if="hasActiveMode">
            <button @click="handleSelectAll" class="text-sm text-blue-600 hover:text-blue-800">
              {{ isAllSelected ? '全不选' : '全选' }}
            </button>
            <span class="text-sm text-gray-500">已选择 {{ selectedRows.length }} 项</span>
          </template>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="!hasActiveMode">
            <button @click="handleAdd" :class="btnDefault">
              <Plus :size="14" /> 新增
            </button>
            <button @click="enterBatchEditMode" :class="btnBlue">
              <Edit2 :size="14" /> 编辑
            </button>
            <button @click="enterDeleteMode" :class="btnDestructive">
              <Trash2 :size="14" /> 删除
            </button>
            <button @click="enterExportMode" :class="btnDefault">
              <Download :size="14" /> 导出
            </button>
          </template>
          <template v-else>
            <template v-if="batchEditMode">
              <button @click="handleConfirmBatchEdit" :class="btnWarning">
                <Edit2 :size="14" /> 确认编辑{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </button>
              <button @click="cancelBatchEdit" :class="btnSecondary">取消</button>
            </template>
            <template v-if="deleteMode">
              <button @click="handleConfirmDelete" :class="btnDestructive">
                <Trash2 :size="14" /> 确认删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </button>
              <button @click="cancelDelete" :class="btnSecondary">取消</button>
            </template>
            <template v-if="exportMode">
              <button @click="handleConfirmExport" :class="btnDefault">
                <Download :size="14" /> 确认导出{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
              </button>
              <button @click="cancelExport" :class="btnSecondary">取消选择</button>
            </template>
          </template>
        </div>
      </div>

      <!-- DATA TABLE - V1.1 SupplierTable.tsx 12 columns -->
      <div class="overflow-x-auto">
        <table class="w-full" style="min-width: 1400px; table-layout: fixed;">
          <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th v-if="hasActiveMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-12">
                <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll" class="w-4 h-4 rounded border-gray-400 text-emerald-600" />
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">供应商编号</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-40">供应商名称</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">供应类型</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">供应商属性</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">联系人</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-28">移动电话</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">所属组织</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-20">状态</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">所在地区</th>
              <th class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-24">创建时间</th>
              <th v-if="!hasActiveMode" class="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap w-32">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-for="supplier in paginatedSuppliers" :key="supplier.id" class="hover:bg-blue-100 transition-colors">
              <td v-if="hasActiveMode" class="px-4 py-3">
                <input type="checkbox" :checked="selectedRows.includes(supplier.id)" @change="() => handleSelectRow(supplier.id)" class="w-4 h-4 rounded border-gray-400" />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline whitespace-nowrap" @click="handleView(supplier)">
                {{ supplier.code }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">{{ supplier.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ getSupplierTypeName(supplier.supplierType) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.supplierAttribute }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.contact }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.mobilePhone }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.organization }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': supplier.status === '合作中',
                  'bg-yellow-100 text-yellow-700': supplier.status === '暂停',
                  'bg-red-100 text-red-700': supplier.status === '终止'
                }">{{ supplier.status }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.province }} {{ supplier.city }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ supplier.createDate }}</td>
              <td v-if="!hasActiveMode" class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <button @click="handleView(supplier)" title="查看" class="text-gray-500 hover:text-blue-600 p-1">
                    <Eye :size="16" />
                  </button>
                  <button @click="handleEdit(supplier)" title="编辑" class="text-gray-500 hover:text-blue-600 p-1">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="handleDeleteSingle(supplier)" title="删除" class="text-gray-500 hover:text-red-600 p-1">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedSuppliers.length === 0">
              <td :colspan="hasActiveMode ? 12 : 11" class="px-4 py-12 text-center text-sm text-gray-400">
                暂无供应商数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="px-4 py-3 border-t border-gray-100">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          :page-size-options="[10, 20, 50]"
          :show-page-size="true"
          @page-change="(p) => { currentPage = p }"
          @page-size-change="(s) => { pageSize = s; currentPage = 1 }"
        />
      </div>
    </div>

    <!-- ========== 弹窗 ========== -->

    <!-- 查看详情弹窗 - ElModal，与V1.1 SupplierDetailModal一致：分组展示 -->
    <ElModal
      v-model="showDetailModal"
      title="供应商详情"
      :width="700"
      :height="600"
      :show-footer="true"
      :show-submit="false"
      :show-cancel="false"
    >
      <div class="overflow-y-auto space-y-4 text-sm">
        <!-- 基本信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">供应商编号</span>
                <span class="text-sm font-medium text-gray-900">{{ detailSupplier?.code }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应商名称</span>
                <span class="text-sm font-medium text-gray-900">{{ detailSupplier?.name }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应类型</span>
                <span class="text-sm text-gray-700">{{ detailSupplier ? getSupplierTypeName(detailSupplier.supplierType) : '' }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应商属性</span>
                <span class="text-sm text-gray-700">{{ detailSupplier?.supplierAttribute }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">所属组织</span>
                <span class="text-sm text-gray-700">{{ detailSupplier?.organization }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">状态</span>
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': detailSupplier?.status === '合作中',
                  'bg-yellow-100 text-yellow-700': detailSupplier?.status === '暂停',
                  'bg-red-100 text-red-700': detailSupplier?.status === '终止'
                }">{{ detailSupplier?.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">联系方式</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">联系人</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.contact }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">移动电话</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.mobilePhone }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">工作电话</span>
                <span class="text-sm text-gray-700">{{ detailSupplier?.workPhone || '-' }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">传真</span>
                <span class="text-sm text-gray-700">{{ detailSupplier?.fax || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 地址信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">地址信息</h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span class="text-xs text-gray-500 block">国家/地区</span>
              <span class="text-sm text-gray-900">{{ detailSupplier?.country }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">省份</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.province }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">城市</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.city }}</span>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">详细地址</span>
              <span class="text-sm text-gray-900">{{ detailSupplier?.address }}</span>
            </div>
          </div>
        </div>

        <!-- 银行信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">银行信息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">开户行</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.bankName || '-' }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">银行卡号</span>
                <span class="text-sm text-gray-900">{{ detailSupplier?.bankCardNumber || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">其他信息</h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span class="text-xs text-gray-500 block">创建时间</span>
              <span class="text-sm text-gray-900">{{ detailSupplier?.createDate }}</span>
            </div>
            <div v-if="detailSupplier?.remarks">
              <span class="text-xs text-gray-500 block">备注</span>
              <span class="text-sm text-gray-700">{{ detailSupplier.remarks }}</span>
            </div>
            <div v-if="detailSupplier?.lastEditBy">
              <span class="text-xs text-gray-500 block">最后编辑人</span>
              <span class="text-sm text-gray-700">{{ detailSupplier.lastEditBy }}</span>
            </div>
            <div v-if="detailSupplier?.lastEditTime">
              <span class="text-xs text-gray-500 block">最后编辑时间</span>
              <span class="text-sm text-gray-700">{{ detailSupplier.lastEditTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showDetailModal = false">关闭</el-button>
        </div>
      </template>
    </ElModal>

    <!-- 新增/编辑弹窗 - ElModal，与V1.1 SupplierAddModal/SupplierEditModal一致 -->
    <ElModal
      v-model="showFormModal"
      :title="isEdit ? '编辑供应商' : '新增供应商'"
      :width="900"
      :height="650"
      :show-footer="true"
      :show-submit="false"
      :show-cancel="false"
      @close="resetForm()"
    >
      <!-- 基本信息区域 - 浅绿背景 -->
      <div class="p-4 bg-emerald-50 border-b border-gray-200 -mx-4 -mt-4">
        <div class="grid grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商编号</label>
            <input v-model="form.code" :disabled="isEdit" placeholder="手动输入或使用编码生成器" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商名称 *</label>
            <input v-model="form.name" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应类型 *</label>
            <select v-model="form.supplierType" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择类型</option>
              <option v-for="cat in categoryOptions" :key="cat.code" :value="cat.code">{{ getSupplierTypeName(cat.code) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商属性 *</label>
            <select v-model="form.supplierAttribute" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择属性</option>
              <option v-for="opt in supplierAttributeOptions" :key="opt.code || opt.name" :value="opt.name">{{ opt.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">所属组织 *</label>
            <select v-model="form.organization" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="">请选择组织</option>
              <option value="宁波帮帮忙公司">宁波帮帮忙公司</option>
              <option value="成都帮帮您公司">成都帮帮您公司</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">联系人 *</label>
            <input v-model="form.contact" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">移动电话 *</label>
            <input v-model="form.mobilePhone" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">状态</label>
            <select v-model="form.status" class="w-full h-9 px-3 border border-gray-200 rounded text-sm bg-white">
              <option value="合作中">合作中</option>
              <option value="暂停">暂停</option>
              <option value="终止">终止</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 详细信息区域 - 白色 -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">工作电话</label>
            <input v-model="form.workPhone" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">传真</label>
            <input v-model="form.fax" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">国家</label>
            <input v-model="form.country" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">省/市/区</label>
            <!-- V1.1 Cascader 区域级联 (4级懒加载: 省份→城市→区县) -->
            <Cascader
              :options="regionProvincesOptions"
              :lazy="true"
              :max-level="4"
              :load-children="handleLoadRegionChildren"
              :change="handleRegionChange"
              :value-nodes="regionPathNodes.length > 0 ? regionPathNodes : undefined"
              placeholder="请选择省/市/区"
              class="w-full"
            />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">详细地址</label>
            <input v-model="form.address" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">开户行</label>
            <input v-model="form.bankName" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">银行卡号</label>
            <input v-model="form.bankCardNumber" class="w-full h-9 px-3 border border-gray-200 rounded text-sm font-mono" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">创建时间</label>
            <input type="date" v-model="form.createDate" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最后编辑人</label>
            <input v-model="form.lastEditBy" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">最后编辑时间</label>
            <input v-model="form.lastEditTime" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="form.remarks" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded text-sm"></textarea>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showFormModal = false; resetForm()">取消</el-button>
          <el-button type="primary" size="small" @click="handleSave">{{ isEdit ? '保存' : '提交' }}</el-button>
        </div>
      </template>
    </ElModal>

    <!-- 批量编辑弹窗 - ElModal，与V1.1 SupplierBatchEditModal完全一致：逐条编辑+累积保存 -->
    <ElModal
      v-model="showBatchEditModal"
      title="批量编辑供应商"
      :width="900"
      :height="650"
      :show-footer="true"
      :show-submit="false"
      :show-cancel="false"
      @close="handleBatchEditModalClose()"
    >
      <!-- 提示信息栏 -->
      <div class="px-4 py-3 bg-blue-50 border-b border-blue-100 -mx-4 -mt-4">
        <p class="text-sm text-blue-800">已选择 <strong>{{ batchEditSuppliers.length }}</strong> 个供应商进行批量编辑，已编辑 <strong>{{ batchEditedCount }}</strong> 个</p>
      </div>
      <!-- 供应商选择 -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">当前编辑：</label>
        <select :value="currentBatchSupplierId ? String(currentBatchSupplierId) : ''" @change="(e) => handleBatchSupplierSelect(e.target.value)" class="flex-1 h-9 px-3 border border-gray-200 rounded text-sm">
          <option v-for="s in batchEditSuppliers" :key="s.id" :value="String(s.id)">{{ s.code }} — {{ s.name }}{{ batchEditedSuppliers[s.id] ? ' ✅' : '' }}</option>
        </select>
        <button @click="handleBatchPrev" :disabled="currentBatchEditIndex === 0" class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft :size="18" />
        </button>
        <span class="text-sm text-gray-500 whitespace-nowrap">{{ currentBatchEditIndex + 1 }} / {{ batchEditSuppliers.length }}</span>
        <button @click="handleBatchNext" :disabled="currentBatchEditIndex >= batchEditSuppliers.length - 1" class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight :size="18" />
        </button>
      </div>
      <!-- 只读标识信息 -->
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div class="grid grid-cols-4 gap-3">
          <div><label class="block text-xs text-gray-500 mb-1">供应商编号</label><div class="text-sm font-medium text-gray-900">{{ currentBatchSupplier?.code || '-' }}</div></div>
          <div><label class="block text-xs text-gray-500 mb-1">供应商名称</label><div class="text-sm font-medium text-gray-900">{{ currentBatchSupplier?.name || '-' }}</div></div>
          <div><label class="block text-xs text-gray-500 mb-1">创建时间</label><div class="text-sm text-gray-600">{{ currentBatchSupplier?.createDate || '-' }}</div></div>
          <div><label class="block text-xs text-gray-500 mb-1">原始状态</label><span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="{
            'bg-green-100 text-green-700': currentBatchSupplier?.status === '合作中',
            'bg-yellow-100 text-yellow-700': currentBatchSupplier?.status === '暂停',
            'bg-red-100 text-red-700': currentBatchSupplier?.status === '终止'
          }">{{ currentBatchSupplier?.status || '-' }}</span></div>
        </div>
      </div>
      <!-- 可编辑字段 -->
      <div class="flex-1 overflow-y-auto p-4">
        <h4 class="text-sm font-semibold text-emerald-700 mb-3 pb-1 border-b border-emerald-200">基本信息</h4>
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应类型</label>
            <select :value="getBatchValue('supplierType')" @change="(e) => handleBatchFieldChange('supplierType', e.target.value)" class="w-full h-9 px-3 border border-gray-200 rounded text-sm">
              <option value="">不修改</option>
              <option v-for="cat in categoryOptions" :key="cat.code" :value="cat.code">{{ getSupplierTypeName(cat.code) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">供应商属性</label>
            <select :value="getBatchValue('supplierAttribute')" @change="(e) => handleBatchFieldChange('supplierAttribute', e.target.value)" class="w-full h-9 px-3 border border-gray-200 rounded text-sm">
              <option value="">不修改</option>
              <option v-for="opt in supplierAttributeOptions" :key="opt.code || opt.name" :value="opt.name">{{ opt.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">所属组织</label>
            <select :value="getBatchValue('organization')" @change="(e) => handleBatchFieldChange('organization', e.target.value)" class="w-full h-9 px-3 border border-gray-200 rounded text-sm">
              <option value="">不修改</option>
              <option value="宁波帮帮忙公司">宁波帮帮忙公司</option>
              <option value="成都帮帮您公司">成都帮帮您公司</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">状态</label>
            <select :value="getBatchValue('status')" @change="(e) => handleBatchFieldChange('status', e.target.value)" class="w-full h-9 px-3 border border-gray-200 rounded text-sm">
              <option value="">不修改</option>
              <option value="合作中">合作中</option>
              <option value="暂停">暂停</option>
              <option value="终止">终止</option>
            </select>
          </div>
        </div>

        <!-- 联系信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">联系信息</h4>
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">联系人</label>
            <input :value="getBatchValue('contact')" @input="(e) => handleBatchFieldChange('contact', e.target.value)" :placeholder="currentBatchSupplier?.contact || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">移动电话</label>
            <input :value="getBatchValue('mobilePhone')" @input="(e) => handleBatchFieldChange('mobilePhone', e.target.value)" :placeholder="currentBatchSupplier?.mobilePhone || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">工作电话</label>
            <input :value="getBatchValue('workPhone')" @input="(e) => handleBatchFieldChange('workPhone', e.target.value)" :placeholder="currentBatchSupplier?.workPhone || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">传真</label>
            <input :value="getBatchValue('fax')" @input="(e) => handleBatchFieldChange('fax', e.target.value)" :placeholder="currentBatchSupplier?.fax || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
        </div>

        <!-- 地区信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">地区信息</h4>
        <div class="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">国家</label>
            <input :value="getBatchValue('country')" @input="(e) => handleBatchFieldChange('country', e.target.value)" :placeholder="currentBatchSupplier?.country || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">省份</label>
            <input :value="getBatchValue('province')" @input="(e) => handleBatchFieldChange('province', e.target.value)" :placeholder="currentBatchSupplier?.province || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">城市</label>
            <input :value="getBatchValue('city')" @input="(e) => handleBatchFieldChange('city', e.target.value)" :placeholder="currentBatchSupplier?.city || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">区县</label>
            <input :value="getBatchValue('district')" @input="(e) => handleBatchFieldChange('district', e.target.value)" :placeholder="currentBatchSupplier?.district || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-1">详细地址</label>
          <input :value="getBatchValue('address')" @input="(e) => handleBatchFieldChange('address', e.target.value)" :placeholder="currentBatchSupplier?.address || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
        </div>

        <!-- 财务信息 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">财务信息</h4>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">开户行</label>
            <input :value="getBatchValue('bankName')" @input="(e) => handleBatchFieldChange('bankName', e.target.value)" :placeholder="currentBatchSupplier?.bankName || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">银行卡号</label>
            <input :value="getBatchValue('bankCardNumber')" @input="(e) => handleBatchFieldChange('bankCardNumber', e.target.value)" :placeholder="currentBatchSupplier?.bankCardNumber || '未填写'" class="w-full h-9 px-3 border border-gray-200 rounded text-sm font-mono" />
          </div>
        </div>

        <!-- 备注 -->
        <h4 class="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-400">备注</h4>
        <div>
          <textarea :value="getBatchValue('remarks')" @input="(e) => handleBatchFieldChange('remarks', e.target.value)" rows="2" :placeholder="currentBatchSupplier?.remarks || '未填写'" class="w-full px-3 py-2 border border-gray-200 rounded text-sm"></textarea>
        </div>
      </div>
      <!-- 底部操作按钮 -->
      <template #footer>
        <div class="flex justify-between gap-3 w-full">
          <el-button size="small" @click="showBatchEditModal = false; handleBatchEditModalClose()">取消</el-button>
          <div class="flex items-center gap-3">
            <el-button size="small" :disabled="!currentBatchSupplierId" @click="handleBatchNext">
              确认 {{ currentBatchEditIndex + 1 < batchEditSuppliers.length ? '(下一个)' : '(已最后一个)' }}
            </el-button>
            <el-button type="primary" size="small" @click="handleSaveAllBatch">
              保存全部 ({{ batchEditedCount }} 个)
            </el-button>
          </div>
        </div>
      </template>
    </ElModal>

    <!-- 导出格式选择弹窗 - 统一使用 ExportFormatModal -->
    <ExportFormatModal
      v-model:visible="showExportModal"
      v-model:export-file-type="exportFormat"
      :selected-count="exportRecords.length > 0 ? exportRecords.length : filteredSuppliers.length"
      @confirm="handleDoExport"
    />

    <!-- 单行删除警告弹窗 - 统一使用 DeleteWarningModal -->
    <DeleteWarningModal
      v-model:is-open="showDeleteWarning"
      :selected-count="1"
      title="确认删除"
      :description="singleDeleteTarget ? `确定要删除供应商 <strong>${singleDeleteTarget.name}</strong> 吗？此操作 <span style='color:#dc2626'>无法恢复</span>，删除后数据将永久丢失。` : ''"
      @confirm="handleConfirmSingleDelete"
    />

    <!-- 批量删除确认弹窗 - 统一使用 DeleteWarningModal -->
    <DeleteWarningModal
      v-model:is-open="showDeleteModal"
      :selected-count="deleteSupplierIds.length"
      title="批量删除确认"
      :description="deleteSupplierIds.length > 0 ? `确定要删除选中的 <strong>${deleteSupplierIds.length}</strong> 个供应商吗？<br/><br/><strong>选中供应商：</strong>${deleteSupplierNames}<br/><br/><span style='color:#dc2626'>此操作不可撤销！请谨慎操作。</span>` : ''"
      @confirm="handleDoDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, Plus, Edit2, Trash2, Download, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Send, AlertTriangle, RotateCcw, ClipboardCopy, Wand2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import Pagination from '@/components/ui/Pagination/Pagination.vue'
import { ElModal } from '@/components/ui'
import DeleteWarningModal from '@/components/common/DeleteWarningModal.vue'
import ExportFormatModal from '@/components/common/ExportFormatModal.vue'
import { useSupplierStore } from '@/stores/modules/inventory/useSupplierStore'
import { useDictionaryStore } from '@/stores/modules/dictionary'
import { useSupplierCodeRuleStore } from '@/stores/modules/supplierCodeRule'
import { useRegionStore } from '@/stores/modules/useRegionStore'
import { Cascader } from '@/components/ui'
import { validateMobilePhone, validateWorkPhone, validateFax, validateBankCard, validateCode, runValidations } from '@/utils/validators'
// 与订单管理共享按钮样式常量
import { btnDefault, btnSecondary, btnDestructive, btnBlue, btnWarning } from '@/views/production/constants/buttonStyles'

// ==================== 常量（与V1.1 data.ts完全一致） ====================

// 11大类供应商分类（V1.1 data.ts）
const supplierCategories = [
  { code: 'SP', name: '种子与种苗类', midCategories: [
    { code: '01', name: '粮食作物种子' }, { code: '02', name: '经济作物种子' }, { code: '03', name: '蔬菜种子/种苗' },
    { code: '04', name: '水果苗木' }, { code: '05', name: '花卉与观赏植物' }, { code: '06', name: '食用菌/药用菌菌种' }, { code: '99', name: '其他种质资源' }
  ]},
  { code: 'FE', name: '肥料与土壤改良类', midCategories: [
    { code: '01', name: '有机肥' }, { code: '02', name: '化学肥料' }, { code: '03', name: '微生物菌剂/生物刺激素' },
    { code: '04', name: '土壤调理剂' }, { code: '05', name: '育苗基质' }, { code: '99', name: '其他肥料类' }
  ]},
  { code: 'PP', name: '农药与植保产品类', midCategories: [
    { code: '01', name: '杀虫剂' }, { code: '02', name: '杀菌剂' }, { code: '03', name: '除草剂' },
    { code: '04', name: '植物生长调节剂' }, { code: '05', name: '绿色防控产品' }, { code: '06', name: '生物农药' }, { code: '99', name: '其他植保产品' }
  ]},
  { code: 'EQ', name: '农业机械与设备类', midCategories: [
    { code: '01', name: '耕作与动力机械' }, { code: '02', name: '播种/移栽设备' }, { code: '03', name: '植保机械' },
    { code: '04', name: '收获与采收机械' }, { code: '05', name: '初加工与分选设备' }, { code: '99', name: '其他农机设备' }
  ]},
  { code: 'FA', name: '设施农业资材类', midCategories: [
    { code: '01', name: '温室/大棚骨架材料' }, { code: '02', name: '覆盖材料' }, { code: '03', name: '通风降温设备' },
    { code: '04', name: '加温设备' }, { code: '05', name: '补光系统' }, { code: '06', name: '智能环控系统' }, { code: '99', name: '其他设施农业资材' }
  ]},
  { code: 'IR', name: '灌溉与水肥一体化类', midCategories: [
    { code: '01', name: '水泵与水源设备' }, { code: '02', name: '输水管网' }, { code: '03', name: '过滤系统' },
    { code: '04', name: '施肥装置' }, { code: '05', name: '灌溉终端' }, { code: '99', name: '其他灌溉设备' }
  ]},
  { code: 'OP', name: '日常劳保与劳动工具类', midCategories: [
    { code: '01', name: '劳动防护用品' }, { code: '02', name: '日常手动工具' }, { code: '03', name: '小型电动工具' },
    { code: '04', name: '清洁与卫生用品' }, { code: '99', name: '其他作业支持用品' }
  ]},
  { code: 'PH', name: '仓储与物流资材类', midCategories: [
    { code: '01', name: '采收容器' }, { code: '02', name: '农产品包装材料' }, { code: '03', name: '冷链设备' },
    { code: '04', name: '装卸与仓储设备' }, { code: '99', name: '其他采后处理' }
  ]},
  { code: 'TS', name: '检测与技术服务类', midCategories: [
    { code: '01', name: '土壤/水质检测服务' }, { code: '02', name: '农残快检设备与试剂' }, { code: '03', name: '农业物联网设备' },
    { code: '04', name: '数字农业软件服务' }, { code: '05', name: '农业技术咨询与培训' }, { code: '99', name: '其他技术服务' }
  ]},
  { code: 'UT', name: '能源与辅助耗材类', midCategories: [
    { code: '01', name: '燃油/润滑油' }, { code: '02', name: '电力与新能源' }, { code: '03', name: '通用工业耗材' }, { code: '99', name: '其他能源与耗材' }
  ]},
  { code: 'OT', name: '其他综合类', midCategories: [
    { code: '01', name: '其他未分类供应商' }
  ]}
]

// 从分类数据查询类型中文名（与V1.1 getSupplierTypeName一致）
const getSupplierTypeName = (code) => {
  const cat = supplierCategories.find(c => c.code === code)
  return cat ? cat.name : (code || '')
}

// 编码生成器使用的分类选项（优先使用Store数据，回退到本地常量）
const categoryOptions = computed(() => {
  const storeCats = supplierCodeRuleStore.categories
  return storeCats && storeCats.length > 0 ? storeCats : supplierCategories
})

// ==================== Store ====================

const router = useRouter()
const supplierStore = useSupplierStore()
const dictionaryStore = useDictionaryStore()
const supplierCodeRuleStore = useSupplierCodeRuleStore()
const regionStore = useRegionStore()

// ==================== 字典数据 ====================

// 供应商属性选项（从字典加载，与V1.1一致）
const supplierAttributeOptions = computed(() => {
  const attrs = dictionaryStore.dictionaries.filter(
    d => d.category === 'supplier_attribute' && d.status === 'active'
  )
  if (attrs.length === 0) {
    // 字典为空时使用硬编码回退
    return [
      { code: '企业', name: '企业' },
      { code: '个体户', name: '个体户' },
      { code: '事业单位', name: '事业单位' }
    ]
  }
  return attrs
})

// 筛选器用的属性选项（包含"全部"）
const supplierAttributeFilterOptions = computed(() => {
  return ['全部', ...supplierAttributeOptions.value.map(a => a.name)]
})

// ==================== 状态 ====================

const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])
const batchEditMode = ref(false)
const deleteMode = ref(false)
const exportMode = ref(false)
const exportFormat = ref('excel')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showBatchEditModal = ref(false)
const showExportModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteWarning = ref(false)  // 单行删除警告弹窗（与V1.1 DeleteWarningDialog一致）
const isEdit = ref(false)
const showMore = ref(false)
const codeGenExpanded = ref(false)
const copySuccess = ref(false)
const detailSupplier = ref(null)
const exportRecords = ref([])
const batchEditSuppliers = ref([])
const deleteSupplierIds = ref([])
const tableRef = ref()

// 批量编辑状态（逐条编辑+累积保存，与V1.1一致）
const batchEditedSuppliers = ref({})
const currentBatchEditIndex = ref(0)

// 编码生成器
const codeGen = reactive({ bigCategory: '', midCategory: '', generatedCode: '' })
const codeGenError = ref('')
const codeGenSuccess = ref('')

// 筛选 - 与V1.1 SupplierFiltersState一致
const filters = reactive({
  code: '', name: '', contact: '',
  type: '全部', status: '全部', supplierAttribute: '全部', organization: '全部',
  province: '', city: '', district: ''
})

// 表单
const form = reactive({
  id: 0, code: '', organization: '宁波帮帮忙公司', name: '',
  supplierType: 'SP', supplierAttribute: '企业', contact: '', mobilePhone: '',
  workPhone: '', fax: '', country: '中国', province: '', city: '', district: '',
  address: '', status: '合作中', bankName: '', bankCardNumber: '',
  createDate: '', remarks: '',
  lastEditBy: '', lastEditTime: ''
})
const formRef = ref()

// ==================== 计算属性 ====================

// V1.1 区域级联选择 (4级懒加载: 省份→城市→区县)
// 跟踪级联选择路径节点
const regionPathNodes = ref([])
const regionProvincesOptions = computed(() => {
  return (regionStore.provinces || []).map(n => ({
    label: n.name,
    value: String(n.id),
    id: n.id
  }))
})

// 懒加载回调
const handleLoadRegionChildren = async (parentId) => {
  const children = await regionStore.getChildren(parentId)
  return (children || []).map(n => ({
    label: n.name,
    value: String(n.id),
    id: n.id
  }))
}

// 级联选择变化回调 (V1.1 handleRegionChange)
const handleRegionChange = (nodes) => {
  regionPathNodes.value = nodes
  const province = nodes[0]?.label || ''
  const city = nodes.slice(1).map(n => n.label).join(' ')
  form.province = province
  form.city = city
}

// 加载省份列表
regionStore.fetchProvinces()

const hasActiveMode = computed(() => batchEditMode.value || deleteMode.value || exportMode.value)

const filteredSuppliers = computed(() => {
  let list = supplierStore.suppliers || []
  if (filters.code) {
    const kw = filters.code.toLowerCase()
    list = list.filter(s => s.code && s.code.toLowerCase().includes(kw))
  }
  if (filters.name) {
    const kw = filters.name.toLowerCase()
    list = list.filter(s => s.name && s.name.toLowerCase().includes(kw))
  }
  if (filters.contact) {
    const kw = filters.contact.toLowerCase()
    list = list.filter(s => s.contact && s.contact.toLowerCase().includes(kw))
  }
  if (filters.type !== '全部') {
    list = list.filter(s => s.supplierType === filters.type)
  }
  if (filters.status !== '全部') {
    list = list.filter(s => s.status === filters.status)
  }
  if (filters.supplierAttribute !== '全部') {
    list = list.filter(s => s.supplierAttribute === filters.supplierAttribute)
  }
  if (filters.organization !== '全部') {
    list = list.filter(s => s.organization === filters.organization)
  }
  if (filters.province) {
    const kw = filters.province.toLowerCase()
    list = list.filter(s => s.province && s.province.toLowerCase().includes(kw))
  }
  if (filters.city) {
    const kw = filters.city.toLowerCase()
    list = list.filter(s => s.city && s.city.toLowerCase().includes(kw))
  }
  if (filters.district) {
    const kw = filters.district.toLowerCase()
    list = list.filter(s => s.district && s.district.toLowerCase().includes(kw))
  }
  return list
})

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSuppliers.value.slice(start, start + pageSize.value)
})

const paginationTotal = computed(() => filteredSuppliers.value.length)
const totalPages = computed(() => Math.ceil(paginationTotal.value / pageSize.value) || 1)

const isAllSelected = computed(() => {
  if (deleteMode.value) {
    const editable = paginatedSuppliers.value.filter(s => s.status !== '终止')
    return editable.length > 0 && editable.every(s => selectedRows.value.includes(s.id))
  }
  return paginatedSuppliers.value.length > 0 && selectedRows.value.length === paginatedSuppliers.value.length
})

const codeGenMidCats = computed(() => {
  if (!codeGen.bigCategory) return []
  const big = supplierCategories.find(c => c.code === codeGen.bigCategory)
  return big ? big.midCategories : []
})

// 批量编辑相关计算属性
const currentBatchSupplierId = computed(() => batchEditSuppliers.value[currentBatchEditIndex.value]?.id)
const currentBatchSupplier = computed(() => batchEditSuppliers.value[currentBatchEditIndex.value])
const batchEditedCount = computed(() => Object.keys(batchEditedSuppliers.value).length)

// 删除确认显示的供应商名称
const deleteSupplierNames = computed(() => {
  const selected = (supplierStore.suppliers || []).filter(s => deleteSupplierIds.value.includes(s.id))
  const names = selected.slice(0, 5).map(s => s.name).join('、')
  return selected.length > 5 ? `${names} 等${selected.length}个` : names
})

// ==================== 筛选 ====================

const handleFilterChange = (key, value) => {
  filters[key] = value
  currentPage.value = 1
}

const handleResetFilters = () => {
  filters.code = ''
  filters.name = ''
  filters.contact = ''
  filters.type = '全部'
  filters.status = '全部'
  filters.supplierAttribute = '全部'
  filters.organization = '全部'
  filters.province = ''
  filters.city = ''
  filters.district = ''
  currentPage.value = 1
}

// ==================== 选择与模式 ====================

const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map(row => row.id)
}

const handleSelectAll = () => {
  if (deleteMode.value) {
    const editable = paginatedSuppliers.value.filter(s => s.status !== '终止')
    const editableIds = editable.map(s => s.id)
    const allSelected = editableIds.every(id => selectedRows.value.includes(id))
    if (allSelected) {
      selectedRows.value = selectedRows.value.filter(id => !editableIds.includes(id))
    } else {
      selectedRows.value = [...selectedRows.value.filter(id => !editableIds.includes(id)), ...editableIds]
    }
  } else {
    if (paginatedSuppliers.value.every(s => selectedRows.value.includes(s.id))) {
      selectedRows.value = []
    } else {
      selectedRows.value = paginatedSuppliers.value.map(s => s.id)
    }
  }
}

// 行复选框切换（与V1.1模式一致）
const handleSelectRow = (id) => {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(rid => rid !== id)
  } else {
    selectedRows.value = [...selectedRows.value, id]
  }
}

const enterBatchEditMode = () => { batchEditMode.value = true; deleteMode.value = false; exportMode.value = false; selectedRows.value = [] }
const enterDeleteMode = () => { deleteMode.value = true; batchEditMode.value = false; exportMode.value = false; selectedRows.value = [] }
const enterExportMode = () => { exportMode.value = true; batchEditMode.value = false; deleteMode.value = false; selectedRows.value = [] }

const cancelBatchEdit = () => { batchEditMode.value = false; showBatchEditModal.value = false; selectedRows.value = []; batchEditedSuppliers.value = {}; currentBatchEditIndex.value = 0 }
const cancelDelete = () => { deleteMode.value = false; showDeleteModal.value = false; selectedRows.value = [] }
const cancelExport = () => { exportMode.value = false; selectedRows.value = [] }
const exitExportMode = () => { exportMode.value = false; selectedRows.value = [] }

// ==================== 编码生成器 ====================

const handleCodeGenBigChange = () => { codeGen.midCategory = ''; codeGen.generatedCode = ''; codeGenError.value = ''; codeGenSuccess.value = '' }
const handleCodeGenMidChange = () => { codeGen.generatedCode = ''; codeGenError.value = ''; codeGenSuccess.value = '' }

const handleGenerateCode = () => {
  codeGenError.value = ''
  codeGenSuccess.value = ''
  if (!codeGen.bigCategory || !codeGen.midCategory) {
    codeGenError.value = '请选择供应商大类和供应商中类'
    return
  }
  const seq = String(Math.floor(Math.random() * 99) + 1).padStart(3, '0')
  codeGen.generatedCode = `SU_${codeGen.bigCategory}${codeGen.midCategory}${seq}`
  codeGenSuccess.value = '编码生成成功！'
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
  codeGen.generatedCode = ''
  codeGenError.value = ''
  codeGenSuccess.value = ''
}

const handleShowCodeRule = () => { router.push('/supplier-code-rule') }

// ==================== 表格操作 ====================

const handleView = (row) => { detailSupplier.value = row; showDetailModal.value = true }

// 单行删除：先显示警告弹窗（与V1.1 DeleteWarningDialog一致）
const singleDeleteTarget = ref(null)

const handleDeleteSingle = (row) => {
  singleDeleteTarget.value = row
  showDeleteWarning.value = true
}

const handleConfirmSingleDelete = () => {
  if (singleDeleteTarget.value) {
    selectedRows.value = [singleDeleteTarget.value.id]
    deleteSupplierIds.value = [singleDeleteTarget.value.id]
    showDeleteWarning.value = false
    handleDoDelete()
    singleDeleteTarget.value = null
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  form.createDate = new Date().toISOString().slice(0, 10)
  if (codeGen.generatedCode) form.code = codeGen.generatedCode
  showFormModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.code = row.code
  form.organization = row.organization
  form.name = row.name
  form.supplierType = row.supplierType
  form.supplierAttribute = row.supplierAttribute
  form.contact = row.contact
  form.mobilePhone = row.mobilePhone
  form.workPhone = row.workPhone || ''
  form.fax = row.fax || ''
  form.country = row.country
  form.province = row.province
  form.city = row.city
  form.district = row.district || ''
  form.address = row.address
  form.status = row.status
  form.bankName = row.bankName || ''
  form.bankCardNumber = row.bankCardNumber || ''
  form.createDate = row.createDate
  form.remarks = row.remarks || ''
  form.lastEditBy = row.lastEditBy || ''
  form.lastEditTime = row.lastEditTime || ''
  showFormModal.value = true
}

const handleSave = async () => {
  if (!form.name) {
    ElMessage.warning('请输入供应商名称')
    return
  }
  if (!form.code) {
    ElMessage.warning('请输入供应商编号')
    return
  }

  // 格式验证（与V1.1 SupplierAddModal 第191-197行一致）
  const errors = runValidations([
    { field: 'mobilePhone', valid: validateMobilePhone(form.mobilePhone), message: '手机号格式不正确，应为1开头的11位数字' },
    { field: 'workPhone', valid: validateWorkPhone(form.workPhone), message: '工作电话格式不正确，应为区号-号码格式（如：0571-88886666）' },
    { field: 'fax', valid: validateFax(form.fax), message: '传真格式不正确' },
    { field: 'bankCardNumber', valid: validateBankCard(form.bankCardNumber), message: '银行卡号格式不正确，应为15位或17-18位数字' },
    { field: 'code', valid: validateCode(form.code), message: '标识码只能包含字母、数字、下划线和连字符' },
  ])
  if (errors.length > 0) {
    ElMessage.warning('请检查以下字段：\n' + errors.map(e => e.message).join('\n'))
    return
  }

  try {
    if (isEdit.value) {
      const { id, ...data } = form
      await supplierStore.editSupplier(id, data)
      ElMessage.success('编辑成功')
    } else {
      const { id, ...data } = form
      await supplierStore.addSupplier(data)
      ElMessage.success('新增成功')
    }
    showFormModal.value = false
    await supplierStore.loadSuppliers()
  } catch (err) {
    ElMessage.error('操作失败: ' + (err.message || '未知错误'))
  }
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.organization = '宁波帮帮忙公司'
  form.name = ''
  form.supplierType = 'SP'
  form.supplierAttribute = '企业'
  form.contact = ''
  form.mobilePhone = ''
  form.workPhone = ''
  form.fax = ''
  form.country = '中国'
  form.province = ''
  form.city = ''
  form.district = ''
  form.address = ''
  form.status = '合作中'
  form.bankName = ''
  form.bankCardNumber = ''
  form.createDate = ''
  form.remarks = ''
  form.lastEditBy = ''
  form.lastEditTime = ''
}

// ==================== 批量编辑 - 与V1.1 SupplierBatchEditModal一致 ====================

const handleConfirmBatchEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的供应商')
    return
  }
  batchEditSuppliers.value = (supplierStore.suppliers || []).filter(s => selectedRows.value.includes(s.id))
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
  showBatchEditModal.value = true
}

const getBatchValue = (field) => {
  const id = currentBatchSupplierId.value
  if (!id) return ''
  if (batchEditedSuppliers.value[id]?.[field] !== undefined) return batchEditedSuppliers.value[id][field]
  if (currentBatchSupplier.value) return currentBatchSupplier.value[field] || ''
  return ''
}

const handleBatchFieldChange = (field, value) => {
  const id = currentBatchSupplierId.value
  if (!id) return
  batchEditedSuppliers.value = {
    ...batchEditedSuppliers.value,
    [id]: { ...(batchEditedSuppliers.value[id] || {}), [field]: value }
  }
}

const handleBatchSupplierSelect = (val) => {
  const id = Number(val)
  const idx = batchEditSuppliers.value.findIndex(s => s.id === id)
  if (idx >= 0) currentBatchEditIndex.value = idx
}

const handleBatchNext = () => {
  if (currentBatchEditIndex.value < batchEditSuppliers.value.length - 1) {
    currentBatchEditIndex.value++
  }
}

const handleBatchPrev = () => {
  if (currentBatchEditIndex.value > 0) {
    currentBatchEditIndex.value--
  }
}

const handleBatchEditModalClose = () => {
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
}

const handleSaveAllBatch = async () => {
  const entries = Object.entries(batchEditedSuppliers.value)
  if (entries.length === 0) {
    ElMessage.warning('没有需要保存的修改')
    return
  }
  let successCount = 0
  for (const [idStr, updates] of entries) {
    try {
      await supplierStore.editSupplier(Number(idStr), updates)
      successCount++
    } catch {
      // 继续处理其他条目
    }
  }
  await supplierStore.loadSuppliers()
  batchEditedSuppliers.value = {}
  currentBatchEditIndex.value = 0
  selectedRows.value = []
  batchEditMode.value = false
  showBatchEditModal.value = false
  if (successCount < entries.length) {
    ElMessage.warning(`批量编辑完成：成功 ${successCount}/${entries.length} 项`)
  } else {
    ElMessage.success(`批量编辑成功，已更新 ${successCount} 个供应商`)
  }
}

// ==================== 删除 ====================

const handleConfirmDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的供应商')
    return
  }
  deleteSupplierIds.value = [...selectedRows.value]
  showDeleteModal.value = true
}

const handleDoDelete = async () => {
  if (deleteSupplierIds.value.length === 0) return
  try {
    await supplierStore.removeSuppliersBatch(deleteSupplierIds.value)
    ElMessage.success(`已删除 ${deleteSupplierIds.value.length} 个供应商`)
    showDeleteModal.value = false
    deleteMode.value = false
    selectedRows.value = []
    await supplierStore.loadSuppliers()
  } catch (err) {
    ElMessage.error('删除失败: ' + (err.message || '未知错误'))
  }
}

// ==================== 导出 - 与V1.1 SupplierManagementPage一致 ====================

const handleConfirmExport = () => {
  if (selectedRows.value.length > 0) {
    exportRecords.value = (supplierStore.suppliers || []).filter(s => selectedRows.value.includes(s.id))
  } else {
    exportRecords.value = filteredSuppliers.value
  }
  showExportModal.value = true
}

const handleDoExport = () => {
  const dataToExport = exportRecords.value.length > 0 ? exportRecords.value : filteredSuppliers.value
  if (dataToExport.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  const headers = ['供应商编号', '所属组织', '供应商名称', '供应物资类型', '供应商属性', '联系人', '移动电话', '工作电话', '传真号码', '国家', '省份', '城市', '详细地址', '状态', '开户行', '银行卡号', '创建时间', '备注']
  const exportData = dataToExport.map(s => ({
    '供应商编号': s.code,
    '所属组织': s.organization,
    '供应商名称': s.name,
    '供应物资类型': getSupplierTypeName(s.supplierType),
    '供应商属性': s.supplierAttribute,
    '联系人': s.contact,
    '移动电话': s.mobilePhone,
    '工作电话': s.workPhone || '',
    '传真号码': s.fax || '',
    '国家': s.country,
    '省份': s.province,
    '城市': s.city,
    '详细地址': s.address,
    '状态': s.status,
    '开户行': s.bankName || '',
    '银行卡号': s.bankCardNumber || '',
    '创建时间': s.createDate,
    '备注': s.remarks || ''
  }))

  let content = ''
  let mimeType = ''
  let extension = ''
  const bankCardIndex = headers.indexOf('银行卡号')

  if (exportFormat.value === 'csv') {
    content = '﻿' + headers.join(',') + '\n' + exportData.map(row => headers.map(h => `"${(row[h] || '')}"`).join(',')).join('\n')
    mimeType = 'text/csv;charset=utf-8'
    extension = 'csv'
  } else if (exportFormat.value === 'excel') {
    content = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${exportData.map(row => `<tr>${headers.map((h, i) => { const v = row[h] || ''; return i === bankCardIndex && v ? `<td style="mso-number-format:\\@">${v}</td>` : `<td>${v}</td>` }).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/vnd.ms-excel;charset=utf-8'
    extension = 'xlsx'
  } else if (exportFormat.value === 'word') {
    content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">${headers.map(h => `<th>${h}</th>`).join('')}${exportData.map(row => `<tr>${headers.map(h => { const v = row[h] || ''; return h === '银行卡号' && v ? `<td style="mso-number-format:\\@">${v}</td>` : `<td>${v}</td>` }).join('')}</tr>`).join('')}</table></body></html>`
    mimeType = 'application/ms-word;charset=utf-8'
    extension = 'docx'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `供应商数据_${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportModal.value = false
  exitExportMode()
  ElMessage.success('导出成功')
}

// ==================== 初始化 ====================

onMounted(async () => {
  await Promise.all([
    supplierStore.loadSuppliers(),
    dictionaryStore.loadDictionaries(),
    supplierCodeRuleStore.fetchCategories()
  ])
})
</script>

<style scoped>
/* 弹窗内输入框样式 - 与订单管理标准一致 */
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
