<template>
  <!--
    新增入库记录弹窗 - 严格 1:1 对齐 V1.1 InboundAddModal.tsx (InboundModals.tsx 行 1288-1626)
    V1.1: size="xxxl" 1350×700, showMaximize/drag/resize=true
    顶部: emerald-50 信息卡 4列(入库单号+生成按钮/入库日期/供应商/操作员)
    物料明细: 15列表格(操作/编码/名称/分类/规格/条码/单位/数量/单价/供应商/位置/批号/生产日期/有效期/备注)
    footer: 取消(secondary) + 提交(default)
  -->
  <UnifiedModal
    :model-value="isOpen"
    title="新增入库记录"
    size="xxxl"
    :width="1350"
    :height="700"
    :show-footer="true"
    :show-submit="false"
    :show-cancel="false"
    :show-maximize="true"
    :enable-drag="true"
    :enable-resize="true"
    @update:model-value="(v) => { if (!v) handleClose() }"
    @close="handleClose"
  >
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          class="h-8 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-1"
          @click="handleClose"
        >
          <X class="w-4 h-4" />取消
        </button>
        <button
          class="h-8 px-4 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
          @click="handleSubmit"
        >
          <Send class="w-4 h-4" />提交
        </button>
      </div>
    </template>

    <div class="flex flex-col h-full">
      <!-- ========== 1. 顶部入库单信息卡片 - V1.1: emerald-50/200, 4列 ========== -->
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">入库单号</label>
            <div class="flex gap-1">
              <input
                type="text"
                :value="formData.code"
                @input="(e) => { formData.code = e.target.value; codeError = '' }"
                placeholder="点击生成"
                class="flex-1 h-8 px-2 border border-gray-200 rounded text-sm font-mono"
              />
              <button
                class="h-8 px-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
                @click="handleGenerateCode"
                title="生成入库单号"
              >
                <RefreshCw class="w-4 h-4" />
              </button>
            </div>
            <span v-if="codeError" class="text-xs text-red-500 mt-0.5 block">{{ codeError }}</span>
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">入库日期</label>
            <input
              type="date"
              :value="formData.inboundDate"
              disabled
              class="w-full h-8 px-2 border border-gray-200 rounded text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">供应商</label>
            <input
              type="text"
              :value="formData.supplier"
              @input="(e) => formData.supplier = e.target.value"
              placeholder="请输入供应商"
              class="w-full h-8 px-2 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-emerald-700 mb-1">操作员</label>
            <input
              type="text"
              :value="formData.operator"
              readonly
              class="w-full h-8 px-2 border border-gray-200 rounded text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <!-- ========== 2. 物料明细区域 - V1.1: 标题 + 添加物料按钮 + 15列表格 ========== -->
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex items-center justify-between mb-3 flex-shrink-0">
          <h4 class="text-sm font-semibold text-gray-800">物料明细（{{ materials.length }}种物料）</h4>
          <button
            class="h-7 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1"
            @click="handleAddMaterial"
          >
            <Plus class="w-3 h-3" />添加物料
          </button>
        </div>

        <!-- 空状态 - V1.1: "暂无物料，请点击"添加物料"按钮添加" -->
        <div v-if="materials.length === 0" class="flex-1 text-center py-8 text-gray-500 text-sm border border-gray-200 rounded-lg">
          暂无物料，请点击"添加物料"按钮添加
        </div>

        <!-- 物料明细表 - V1.1: 15列 -->
        <div v-else class="flex-1 overflow-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-xs" style="min-width: 1400px;">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">操作</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">物料编码</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">物料名称</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">分类</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">规格</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">条形码</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">单位</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">数量</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">单价</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">供应商</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">存放位置</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">批号</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">生产日期</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">有效期至</th>
                <th class="px-2 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap text-left">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="m in materials" :key="m.id">
                <!-- 操作 - 删除 -->
                <td class="px-2 py-1.5 whitespace-nowrap">
                  <button class="text-red-500 hover:bg-red-50 p-1 rounded inline-flex" @click="handleDeleteMaterial(m.id)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
                <!-- 物料编码 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.materialCode"
                    @input="(e) => handleMaterialChange(m.id, 'materialCode', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 物料名称 - V1.1: w-24 input + V2.0增强: 搜索下拉自动关联 -->
                <td class="px-1 py-1.5 whitespace-nowrap relative">
                  <div class="relative material-search-dropdown" data-material-search-trigger>
                    <input
                      type="text"
                      :value="m.materialName"
                      @input="(e) => { handleMaterialChange(m.id, 'materialName', e.target.value); openMaterialSearch(m.id) }"
                      @focus="openMaterialSearch(m.id)"
                      @keydown="onMaterialSearchKeydown"
                      placeholder="搜索物料名称"
                      class="w-24 h-6 px-1 border border-gray-200 rounded text-xs"
                    />
                    <button
                      type="button"
                      class="absolute right-0.5 top-0.5 text-gray-400 hover:text-blue-600 p-0.5"
                      @click="openMaterialSearch(m.id)"
                      :title="m._fromSearch ? '已关联物料信息' : '搜索物料'"
                    >
                      <Search class="w-3 h-3" />
                    </button>
                    <Check v-if="m._fromSearch" class="absolute right-5 top-1.5 w-3 h-3 text-emerald-600" />
                    <!-- 搜索下拉建议列表 -->
                    <div
                      v-if="materialSearchShow && materialSearchIndex === m.id"
                      class="absolute z-50 left-0 top-full mt-1 w-80 max-h-64 overflow-y-auto bg-white border border-emerald-200 rounded-lg shadow-lg"
                    >
                      <div v-if="materialSearchResults.length === 0" class="px-3 py-2 text-xs text-gray-500 text-center">
                        未找到匹配的物料
                      </div>
                      <div
                        v-for="(mat, hi) in materialSearchResults"
                        :key="mat.id"
                        class="px-3 py-2 text-xs cursor-pointer border-b border-gray-100 last:border-b-0"
                        :class="hi === materialSearchHighlight ? 'bg-emerald-50' : 'hover:bg-gray-50'"
                        @mousedown.prevent="selectMaterialForRow(mat, m.id)"
                        @mouseenter="materialSearchHighlight = hi"
                      >
                        <div class="flex items-center justify-between gap-2">
                          <span class="font-medium text-gray-900 truncate">{{ mat.name }}</span>
                          <span class="text-gray-500 font-mono text-[10px] flex-shrink-0">{{ mat.code }}</span>
                        </div>
                        <div class="text-[10px] text-gray-500 mt-0.5 truncate">
                          {{ mat.category || '-' }} · {{ mat.specification || '-' }} · {{ mat.unit || '-' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <!-- 分类 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.category"
                    @input="(e) => handleMaterialChange(m.id, 'category', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 规格 - V1.1: w-16 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.specification"
                    @input="(e) => handleMaterialChange(m.id, 'specification', e.target.value)"
                    class="w-16 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 条形码 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.barcode"
                    @input="(e) => handleMaterialChange(m.id, 'barcode', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 单位 - V1.1: w-12 input -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.unit"
                    @input="(e) => handleMaterialChange(m.id, 'unit', e.target.value)"
                    class="w-12 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 数量 - V1.1: NumberInput w-16 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="number"
                    :value="m.quantity"
                    @input="(e) => handleMaterialChange(m.id, 'quantity', Number(e.target.value) || 0)"
                    class="w-16 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 单价 - V1.1: w-16 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.price"
                    @input="(e) => handleMaterialChange(m.id, 'price', e.target.value)"
                    class="w-16 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 供应商 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.supplier"
                    @input="(e) => handleMaterialChange(m.id, 'supplier', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 存放位置 - V1.1: w-16 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.location"
                    @input="(e) => handleMaterialChange(m.id, 'location', e.target.value)"
                    class="w-16 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 批号 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.batchNo"
                    @input="(e) => handleMaterialChange(m.id, 'batchNo', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 生产日期 - V1.1: DatePicker -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="date"
                    :value="m.productionDate"
                    @input="(e) => handleMaterialChange(m.id, 'productionDate', e.target.value)"
                    class="w-28 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 有效期至 - V1.1: DatePicker -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="date"
                    :value="m.expiryDate"
                    @input="(e) => handleMaterialChange(m.id, 'expiryDate', e.target.value)"
                    class="w-28 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
                <!-- 备注 - V1.1: w-20 -->
                <td class="px-1 py-1.5 whitespace-nowrap">
                  <input
                    type="text"
                    :value="m.remarks"
                    @input="(e) => handleMaterialChange(m.id, 'remarks', e.target.value)"
                    class="w-20 h-6 px-1 border border-gray-200 rounded text-xs"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UnifiedModal>
</template>

<script setup>
/**
 * 新增入库记录弹窗 - 严格 1:1 对齐 V1.1 InboundAddModal.tsx (InboundModals.tsx 行 1288-1626)
 * - 容器: UnifiedModal size=xxxl 1350×700, showMaximize/drag/resize=true
 * - 顶部: emerald-50 4列信息卡(入库单号+生成按钮/入库日期/供应商/操作员)
 * - 物料明细: 15列表格 (操作/编码/名称/分类/规格/条码/单位/数量/单价/供应商/位置/批号/生产日期/有效期/备注)
 * - 添加物料: 按 V1.1 默认空值+unit='袋'+ quantity=0
 * - 删除物料: 按 V1.1 filter 方式
 * - 提交: onSave 触发父组件保存
 * - V2.0增强: 物料名称支持搜索下拉 + 自动关联所有基础信息字段
 */
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import { Plus, Trash2, X, Send, RefreshCw, Search, Check } from 'lucide-vue-next'
import { UnifiedModal } from '@/components/ui'
import { useWarehouseMaterialStore } from '@/stores/modules/inventory/useWarehouseMaterialStore'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  // V1.1: onGenerateCode 由父组件生成订单号
  onGenerateCode: { type: Function, default: () => '' }
})

const emit = defineEmits(['close', 'save'])

// V1.1 InboundMaterial 接口
const createEmptyMaterial = () => ({
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
  supplier: '',
  location: '',
  batchNo: '',
  productionDate: '',
  expiryDate: '',
  remarks: '',
  _fromSearch: false
})

// 表单状态
const formData = reactive({
  code: '',
  inboundDate: new Date().toISOString().slice(0, 10),
  supplier: '',
  operator: localStorage.getItem('username') || '当前用户'
})

// 物料列表
const materials = ref([])

const codeError = ref('')

// 物料搜索下拉状态
const materialSearchIndex = ref(-1)
const materialSearchKeyword = ref('')
const materialSearchResults = ref([])
const materialSearchShow = ref(false)
const materialSearchHighlight = ref(0)

// V1.1 风格 12 种物料 mock 数据（与 V1.1 WarehouseMaterialsPage.tsx 行 33-47 完全一致）
// 用于 store 加载失败时的 fallback
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

// Store
const warehouseMaterialStore = useWarehouseMaterialStore()

// 搜索数据源：优先 store 数据，fallback 到 V1.1 风格 mock
const materialSearchDataSource = computed(() => {
  const storeData = warehouseMaterialStore.materials || []
  if (storeData.length > 0) return storeData
  return mockWarehouseMaterials
})

// ========== 搜索下拉相关函数 ==========

// 打开搜索下拉
const openMaterialSearch = (id) => {
  materialSearchIndex.value = id
  const row = materials.value.find(m => m.id === id)
  materialSearchKeyword.value = row?.materialName || ''
  filterMaterialSearchResults()
  materialSearchShow.value = true
  materialSearchHighlight.value = 0
}

// 过滤搜索结果
const filterMaterialSearchResults = () => {
  const kw = (materialSearchKeyword.value || '').trim().toLowerCase()
  const all = materialSearchDataSource.value || []
  if (!kw) {
    materialSearchResults.value = all.slice(0, 20)
    return
  }
  materialSearchResults.value = all.filter(m => {
    const name = (m.name || '').toLowerCase()
    const code = (m.code || '').toLowerCase()
    return name.includes(kw) || code.includes(kw)
  }).slice(0, 20)
}

// 关闭搜索下拉
const closeMaterialSearch = () => {
  materialSearchShow.value = false
  materialSearchIndex.value = -1
}

// 键盘导航
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
    if (item) selectMaterialForRow(item, materialSearchIndex.value)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeMaterialSearch()
  }
}

// 选择物料后自动填充所有字段
const selectMaterialForRow = (material, rowId) => {
  const row = materials.value.find(m => m.id === rowId)
  if (!row) return
  row.materialCode = material.code || ''
  row.materialName = material.name || ''
  row.category = material.category || ''
  row.specification = material.specification || ''
  row.barcode = material.barcode || ''
  row.unit = material.unit || '袋'
  row.price = material.price || ''
  row.supplier = material.supplier || ''
  row.location = material.location || ''
  row._fromSearch = true
  closeMaterialSearch()
}

// 监听全局点击关闭下拉
const onDocumentClick = (e) => {
  const target = e.target
  if (target && target.closest && target.closest('.material-search-dropdown')) return
  closeMaterialSearch()
}

// V1.1 业务方法
const handleGenerateCode = () => {
  const newCode = props.onGenerateCode ? props.onGenerateCode() : `RK${Date.now()}`
  formData.code = newCode
  codeError.value = ''
}

const handleAddMaterial = () => {
  materials.value.push(createEmptyMaterial())
}

const handleMaterialChange = (id, field, value) => {
  const row = materials.value.find(m => m.id === id)
  if (row) {
    row[field] = value
    // 如果手动修改了物料名称，清除 _fromSearch 标记
    if (field === 'materialName') {
      row._fromSearch = false
      materialSearchKeyword.value = value
      filterMaterialSearchResults()
    }
  }
}

const handleDeleteMaterial = (id) => {
  materials.value = materials.value.filter(m => m.id !== id)
}

const handleSubmit = () => {
  emit('save', {
    code: formData.code || (props.onGenerateCode ? props.onGenerateCode() : ''),
    inboundDate: formData.inboundDate,
    supplier: formData.supplier,
    operator: formData.operator,
    status: 'pending',
    materials: materials.value
  })
  // 重置表单
  formData.code = ''
  formData.supplier = ''
  materials.value = []
  emit('close')
}

const handleClose = () => {
  emit('close')
}

// 弹窗打开时重置表单
watch(() => props.isOpen, (val) => {
  if (val) {
    formData.inboundDate = new Date().toISOString().slice(0, 10)
    formData.operator = localStorage.getItem('username') || '当前用户'
    if (materials.value.length === 0) {
      formData.code = ''
      formData.supplier = ''
    }
  } else {
    closeMaterialSearch()
  }
})

// 生命周期
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  // 加载物料数据（用于搜索下拉）
  if (warehouseMaterialStore.materials.length === 0) {
    warehouseMaterialStore.loadMaterials().catch(err => {
      console.warn('[InboundAddModal] 物料数据加载失败, 使用 mock fallback', err)
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
