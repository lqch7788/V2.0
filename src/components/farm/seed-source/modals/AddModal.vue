<!--
  种源新增弹窗（V1.1 → V2.0 1:1 完整迁移版）
  V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\AddModal.tsx (828 行)

  本文件按 V1.1 → V2.0 逐行 1:1 迁移，完整保留：
  1. INITIAL_FORM_DATA 全 31 字段（即使 V3.4 仓库模式下隐藏）
  2. handleSubmit 三段式（Transfer / 校验链 / addItem+createInstance）
  3. handleGenerateSeedCode 完整逻辑（含 todayLocal fallback + 日期 strip）
  4. handleSelectCrop / handleSelectSupplier / handleCropCodeChange / handleQuickAddSuccess
  5. 供应商搜索（supplierSearchKeyword + showSupplierSearch + 级联过滤）
  6. useState → ref / useEffect → watch / useMemo → computed 全栈对齐
  7. V1.1 所有 P0/P1 修复标记 + 中文业务注释完整保留

  V1.1 V3.4（2026-07-07）：
  - 取消「入库登记（外购）」入口
  - 取消外购入库 tab（默认改为库存调拨）
  - 种源仅支持「库存调拨」入库
  - 外部采购走「作物库存 → 新建入库」完成，再调拨入种源
  - 自有种源走「种植/育苗 → 行级采收入库 → 作物库存 → 调拨」入种源

  隐藏源码块（V1.1 V3.4 UI）：
  - 作物选择 / 种源类型 / 来源途径 / 供应商 / 采购日期 / 数量 / 单价 / 图片 / 备注
  - 调拨面板内 onConfirm → 写入 transferItems，handleSubmit 直接走 createFromTransfer 路径
  - showFooter 在 transfer 模式下隐藏

  数据流：V1.1 formData (React useState) → V2.0 form (Vue ref)
        V1.1 useEffect/onChange → V2.0 watch / computed / 事件回调
        V1.1 store action (Zustand) → V2.0 store action (Pinia)
-->
<template>
  <el-dialog
    :model-value="visible"
    width="1170px"
    height="780px"
    top="5vh"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <!-- 2026-07-08 V3.4：弹窗整体 +30%（xl 默认 900×600 → 1170×780） -->
    <!-- V1.1 V3.4：绿色渐变 header（emerald-500 → emerald-600）+ 白色文字（对齐 V1.1 UnifiedModal 默认 header） -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -m-4 px-6 py-3 flex items-center justify-between rounded-t-xl">
        <h3 class="text-lg font-semibold text-white">新增种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <el-form :model="form" label-width="110px" ref="formRef">
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <!-- ===== 2026-07-07 V3.4 顶部提示条（占两列，emerald 主色，与育苗/种植一致）
             2026-07-08 V3.4 UI 改造：前端隐藏 banner 文字（用户决定），仅保留代码注释说明业务背景
             原显示文字：
             内部种源仅支持 库存调拨 入库。
             外部采购请通过「作物库存 → 新建入库」完成，再调拨入种源。
             自有种源请通过「种植/育苗 → 行级采收入库 → 作物库存 → 调拨」入种源。 ===== -->

        <!-- 入库方式 - 紧凑按钮（2026-07-08 V3.4 紧凑化），与种源批号同行 -->
        <div>
          <label class="text-gray-900 text-sm font-medium">入库方式</label>
          <!-- 2026-07-07 V3.4：取消外购入库选项，仅保留库存调拨 -->
          <div class="grid grid-cols-1 gap-2">
            <el-button
              v-for="opt in propagationOptions"
              :key="opt.value"
              @click="handlePropagationTypeChange(opt.value)"
              :class="[
                'p-2 border-2 rounded-lg text-left w-full h-auto justify-start transition-all',
                form.propagationType === opt.value
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-white'
              ]"
            >
              <!-- 2026-07-08 V3.4 紧凑化：icon + label + desc 单行展示，去掉垂直堆叠 -->
              <div class="flex items-center gap-1.5">
                <el-icon :size="16" :class="form.propagationType === opt.value ? 'text-emerald-600' : 'text-gray-500'">
                  <component :is="opt.icon" />
                </el-icon>
                <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
                <span class="text-xs text-gray-400">· {{ opt.desc }}</span>
              </div>
            </el-button>
          </div>
        </div>

        <!-- 种源批号 - 可点击生成 - 与入库方式同行（2026-07-08 V3.4 布局调整） -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            <span class="text-red-500">*</span> 种源批号
            <!-- 格式说明用括号样式紧跟 Label 同行展示，保留原文 text-xs text-gray-400 颜色 -->
            <span class="ml-2 text-xs font-normal text-gray-400 whitespace-nowrap">
              格式：ZZ + 年月日(8位) + "-" + 流水号(3位)
            </span>
          </label>
          <div class="flex gap-2">
            <el-input
              v-model="form.seedCode"
              placeholder="点击生成按钮获取批号"
              readonly
              class="flex-1"
              style="font-family: monospace;"
            />
            <el-button type="primary" :loading="generatingSeedCode" @click="handleGenerateSeedCode">
              <el-icon v-if="!generatingSeedCode"><Refresh /></el-icon>
              {{ generatingSeedCode ? '生成中' : '生成' }}
            </el-button>
          </div>
          <!-- V1.1 L262-265 校验：seedCode 必须先生成（必填项） -->
          <p v-if="showSeedCodeWarn" class="mt-1 text-xs text-red-500">请先生成种源批号</p>
        </div>

        <!-- ===== 库存调拨分支（2026-06-24）=====
             选中「库存调拨」时独占显示面板；隐藏所有其他字段
             调拨面板内 onConfirm → 写入 transferItems，handleSubmit 直接走 createFromTransfer 路径 -->
        <div class="col-span-2">
          <!-- 错误状态：调拨失败反馈（V1.1 L254-257 风格：顶部 Alert） -->
          <el-alert
            v-if="submitError"
            :title="submitError"
            type="error"
            :closable="true"
            class="mb-3"
            show-icon
            @close="submitError = ''"
          />
          <InventoryTransferPanel
            @confirm="handleTransferConfirm"
          />
        </div>

        <!-- 以下所有字段（作物选择 / 种源类型 / 供应商 / 数量 / 单价 / 图片 / 备注）在 transfer 模式下都隐藏
             （库存调拨面板已包含这些信息，无需重复输入） -->
        <template v-if="form.propagationType !== PropagationType.TRANSFER_FROM_INVENTORY">
          <!-- 作物选择 - 使用统一的 CropCodeSelector -->
          <div>
            <label class="text-gray-900 text-sm font-medium">
              <span class="text-red-500">*</span> 作物选择
            </label>
            <CropCodeSelector
              :model-value="form.cropCode"
              @update:model-value="(val) => { form.cropCode = String(val) }"
              @change="handleCropCodeChange"
              placeholder="搜索或选择作物品种..."
              size="md"
              :show-full-path="true"
            />
            <!-- 显示选中作物的详细信息 -->
            <div v-if="selectedCrop" class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div class="text-emerald-700">
                {{ selectedCrop.categoryName }} &gt; {{ selectedCrop.typeName }} &gt; {{ selectedCrop.varietyName }}
                <span v-if="selectedCrop.subVariety1Name"> &gt; {{ selectedCrop.subVariety1Name }}</span>
              </div>
            </div>
          </div>

          <!-- 种源类型 -->
          <div>
            <label class="text-gray-900 text-sm font-medium">种源类型</label>
            <DictSelect
              category="source_type"
              :model-value="form.sourceType"
              @update:model-value="(val) => handleSourceTypeChange(val)"
              placeholder="选择种源类型"
            />
            <!-- V1.1 sourceType === 'other' 时 remarks 必填 -->
            <div v-if="form.sourceType === SourceType.OTHER" class="mt-2">
              <el-input
                v-model="form.remarks"
                type="text"
                placeholder="请输入其他种源类型的详细说明"
                class="remarks-other"
                autofocus
              />
              <p class="mt-1 text-xs text-red-500">必填：选择"其他"时必须填写详细说明</p>
            </div>
          </div>

          <!-- 来源途径 - 根据入库方式自动设置（V1.1 L302-315） -->
          <div>
            <label class="text-gray-900 text-sm font-medium">来源途径</label>
            <el-input
              :model-value="form.propagationType === PropagationType.EXTERNAL ? '外部采购' : '自主产出'"
              readonly
              class="bg-gray-50 text-gray-700"
            />
          </div>

          <!-- ===== 育种计划产出字段 =====
               2026-07-14：删除 BREEDING / SEED_SAVING / ASEXUAL 三个繁殖死分支
               propagationType 默认强制为 TRANSFER_FROM_INVENTORY，这三个分支永远走不到 ===== -->

          <!-- 以下所有字段（供应商 / 数量 / 单价 / 图片 / 备注）在 transfer 模式下都隐藏。
               使用 NOT TRANSFER 包裹替代逐个加条件（避免漏改）。 -->

          <!-- 供应商 - 只在外购入库时显示（V1.1 L326-359） -->
          <div v-if="form.propagationType === PropagationType.EXTERNAL" ref="supplierSearchRef" class="relative">
            <label class="text-gray-900 text-sm font-medium">
              <span class="text-red-500">*</span> 供应商
            </label>
            <!-- 已选供应商展示（V1.1 L604-626 等价） -->
            <div v-if="selectedSupplier" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <el-icon :size="20" class="text-emerald-600"><Leaf /></el-icon>
                  <span class="text-sm font-medium text-emerald-800">{{ selectedSupplier.name }}</span>
                </div>
                <el-button link @click="handleClearSupplier" class="text-emerald-600 hover:bg-emerald-100">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <div class="mt-2 text-xs text-emerald-600">
                编码：{{ selectedSupplier.code }} · 联系人：{{ selectedSupplier.contact }}
              </div>
            </div>
            <!-- 未选供应商：搜索框 + 下拉（V1.1 L627-689） -->
            <div v-else class="relative">
              <div class="flex">
                <el-input
                  v-model="supplierSearchKeyword"
                  @focus="showSupplierSearch = true"
                  placeholder="搜索供应商名称、编码或联系人..."
                  class="flex-1"
                />
                <el-button @click="showSupplierSearch = !showSupplierSearch" class="border border-l-0 border-gray-400 rounded-l-none">
                  <el-icon><Search /></el-icon>
                </el-button>
              </div>
              <!-- 供应商搜索结果下拉（按种源类型级联过滤） -->
              <div v-if="showSupplierSearch" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <!-- 过滤提示 -->
                <div v-if="form.sourceType !== 'other' && filteredSearchResults.length !== supplierSearchResults.length && supplierSearchResults.length > 0"
                     class="px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 border-b border-emerald-100">
                  已按种源类型过滤：显示"{{ ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE[form.sourceType] || '' }}"类型供应商
                </div>
                <!-- 搜索结果列表 -->
                <template v-if="filteredSearchResults.length > 0">
                  <div
                    v-for="supplier in filteredSearchResults"
                    :key="supplier.id"
                    @click="handleSelectSupplier(supplier)"
                    class="w-full px-3 py-2 text-left hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ supplier.name }}</p>
                      <p class="text-xs text-gray-500">
                        {{ supplier.code }} · {{ supplier.contact }} · {{ supplier.mobilePhone }}
                      </p>
                    </div>
                    <el-icon class="text-emerald-600"><Check /></el-icon>
                  </div>
                </template>
                <!-- 空态 -->
                <div v-else-if="supplierSearchKeyword.trim()" class="p-4 text-center text-sm text-gray-500">
                  <template v-if="supplierSearchResults.length > 0">
                    当前种源类型下未找到匹配供应商，请切换种源类型或修改搜索关键词
                  </template>
                  <template v-else>
                    未找到 "{{ supplierSearchKeyword }}"
                  </template>
                </div>
                <div v-else class="p-4 text-center text-sm text-gray-500">
                  输入关键字搜索供应商
                </div>
              </div>
            </div>
          </div>

          <!-- 2026-07-14：删除 BREEDING 生产计划关联死分支（propagationType 默认 TRANSFER_FROM_INVENTORY） -->

          <!-- 采购/入库日期 - 根据来源途径动态显示标签（V1.1 L362-370） -->
          <div>
            <label class="text-gray-900 text-sm font-medium">
              {{ form.sourceOrigin === 'external_purchase' ? '采购日期' : '入库日期' }}
            </label>
            <el-date-picker
              v-model="form.purchaseDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </div>

          <!-- 数量字段 — V1.1 L373-389 标签按模式动态切换
               外购入库：实际到货数量，作为初始库存
               育种/留种/无性：预估产量/计划数量，最终入库数量在「阶段管理」中分批录入 -->
          <div>
            <label class="text-gray-900 text-sm font-medium">
              {{ form.propagationType === PropagationType.EXTERNAL ? '采购数量' : '预估产量 / 计划数量' }}
              <!-- 外购入库：备注用括号包裹，紧跟 Label 文字同行（不换行） -->
              <span v-if="form.propagationType === PropagationType.EXTERNAL"
                    class="ml-2 text-xs font-normal text-gray-500 whitespace-nowrap">
                (实际到货的数量，将作为初始库存写入)
              </span>
            </label>
            <!-- 育种/留种/无性：提示文字放在 Label 与输入框之间（占独立行） -->
            <p v-if="form.propagationType !== PropagationType.EXTERNAL" class="text-xs text-gray-500 mb-1">
              预估产量或计划数量，仅作记录。最终入库数量在「阶段管理 → 完成入库」中分批录入
            </p>
            <div class="grid grid-cols-2 gap-2">
              <el-input-number
                v-model="form.quantity"
                :min="0"
                class="w-full"
                style="width: 100%"
              />
              <DictSelect
                category="unit"
                :model-value="form.unit"
                @update:model-value="(val) => { form.unit = val }"
                placeholder="单位"
              />
            </div>
          </div>

          <!-- 单价（V1.1 L391-399） -->
          <div>
            <label class="text-gray-900 text-sm font-medium">单价（元）</label>
            <el-input-number
              v-model="form.unitPrice"
              :min="0"
              class="w-full"
              style="width: 100%"
            />
          </div>

          <!-- 图片上传 - 占两列（V1.1 L401-454，与育苗管理新增弹窗尺寸一致：80x80 缩略图 + 整行上传区） -->
          <div class="col-span-2">
            <label class="text-gray-900 text-sm font-medium">图片上传</label>
            <div class="border-2 border-dashed border-gray-400 rounded-lg p-4">
              <!-- 已上传的图片预览 -->
              <div v-if="form.pictures.length > 0" class="flex flex-wrap gap-2 mb-3">
                <div
                  v-for="(pic, index) in form.pictures"
                  :key="index"
                  class="relative group"
                >
                  <img
                    :src="pic"
                    :alt="`预览${index + 1}`"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    @click="handleRemovePicture(index)"
                    class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="删除图片"
                  >
                    <el-icon :size="12"><Close /></el-icon>
                  </button>
                </div>
              </div>
              <!-- 上传按钮 -->
              <label class="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 rounded-lg py-4">
                <el-icon :size="32" class="text-gray-400 mb-2"><Upload /></el-icon>
                <span class="text-sm text-gray-500">点击上传图片</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleFileChange"
                />
              </label>
            </div>
          </div>

          <!-- 备注 - 占两列（V1.1 L456-466） -->
          <div class="col-span-2">
            <label class="text-gray-900 text-sm font-medium">备注</label>
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </div>
        </template>
      </div>
    </el-form>

    <!-- 2026-07-07 V3.4：库存调拨模式下隐藏底部 footer（V1.1 showFooter=false，V2.0 1:1 对齐） -->
    <template #footer>
      <div v-if="form.propagationType !== PropagationType.TRANSFER_FROM_INVENTORY"
           class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
        <el-button @click="handleClose" :disabled="submitting">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit()">保存</el-button>
      </div>
    </template>

    <!-- 快速新增品种弹窗（V1.1 L820-825 QuickAddModal 集成） -->
    <QuickAddModal
      :visible="showQuickAdd"
      @update:visible="(val) => { if (!val) showQuickAdd = false }"
      @close="showQuickAdd = false"
      @success="handleQuickAddSuccess"
    />
  </el-dialog>
</template>

<script setup>
/**
 * 种源新增弹窗（V1.1 → V2.0 1:1 完整迁移版）
 * V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\AddModal.tsx (828 行)
 *
 * 迁移映射：
 * - React useState → Vue ref
 * - React useEffect → Vue watch / onMounted
 * - React useMemo → Vue computed
 * - React props → Vue defineProps
 * - React emit (onClose/onSuccess) → Vue emit (close/success)
 * - Zustand getState().addItem → Pinia store.addItem
 * - AntD / 自研 UI → Element Plus（保留所有 V1.1 字段与事件）
 */
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Refresh, Search, Check, Upload } from '@element-plus/icons-vue'
import { ArrowLeftRight, Leaf } from 'lucide-vue-next'

import DictSelect from '@/components/common/settings/DictSelect.vue'
import CropCodeSelector from '@/components/farm/common/CropCodeSelector.vue'
import QuickAddModal from '@/components/farm/crop-variety/modals/QuickAddModal.vue'
import InventoryTransferPanel from '@/components/farm/seed-source/modals/InventoryTransferPanel.vue'

import { SourceType, PropagationType } from '@/types/crop'
import { todayLocal } from '@/lib/dateUtils'
import { ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE } from '@/constants/seedSourceDict'
import { generateSeedCode, checkSourceCodeExists } from '@/services/apiSeedSourceService'
import * as cropInstanceService from '@/services/apiCropInstanceService'

import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { useSupplierStore } from '@/stores/modules/inventory/useSupplierStore'

// ============================================================
// V1.1 V3.4：入库方式选项（仅保留「库存调拨」）
// ============================================================
const propagationOptions = [
  // 2026-06-24: 库存调拨 — 从作物库存 3 种 stock_type 调入种源（移动语义）
  {
    value: PropagationType.TRANSFER_FROM_INVENTORY,
    label: '库存调拨',
    desc: '从作物库存调入',
    icon: ArrowLeftRight
  }
]

// ============================================================
// Props / Emits（V1.1 props 签名对齐）
// ============================================================
const props = defineProps({
  // V1.1 isOpen → V2.0 visible（受控值）
  visible: { type: Boolean, default: false },
  // V1.1 onClose → V2.0 emit('close')
  onClose: { type: Function, default: null },
  // V1.1 onSuccess → V2.0 emit('success')
  onSuccess: { type: Function, default: null },
  // V1.1 units 列表（本弹窗未直接使用，但保留接口以备扩展）
  units: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'close', 'success'])

// ============================================================
// Stores
// ============================================================
const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()
// P2 #15 修复（V1.1）：直接订阅 useSupplierStore（响应式），替代 supplierService 的 localStorage 同步缓存
const supplierStore = useSupplierStore()

// ============================================================
// V1.1 useState → ref / 完整 31 字段初始值（INITIAL_FORM_DATA）
// ============================================================

/**
 * V1.1 L78-107 INITIAL_FORM_DATA 完整搬运：
 *  - 包含 sourceType/sourceOrigin/cropCategory/typeName/varietyName/cropName/cropVariety/cropCode
 *  - supplierId/supplierName/purchaseDate/quantity/unit/unitPrice/pictures/remarks/createBy
 *  - productionPlanId/productionPlanCode
 *  - propagationType/propagationMethod/parentMaleId/parentMaleCode/parentFemaleId/parentFemaleCode
 *  - motherPlantId/motherPlantCode/linkedPlantingId/linkedPlantingCode
 *  - propagationStartDate/expectedHarvestDate/breedingLocation/targetTraits/generation
 */
const buildInitialFormData = () => ({
  // 种源批号（在另一个独立 ref，不放进 form 以便和 V1.1 一致：seedCode 独立 + form 内 cropName 等）
  sourceType: SourceType.SEED,
  sourceOrigin: 'external_purchase',
  cropCategory: '',
  typeName: '',
  varietyName: '',
  cropName: '',
  cropVariety: '',
  cropCode: '',
  supplierId: '',
  supplierName: '',
  purchaseDate: todayLocal(),
  quantity: 0,
  unit: '袋',
  unitPrice: 0,
  pictures: [],
  remarks: '',
  createBy: '',
  productionPlanId: '',
  productionPlanCode: '',
  // 2026-07-07 V3.4：取消外购入库 tab，默认改为库存调拨
  propagationType: PropagationType.TRANSFER_FROM_INVENTORY,
  propagationMethod: '',
  parentMaleId: '',
  parentMaleCode: '',
  parentFemaleId: '',
  parentFemaleCode: '',
  motherPlantId: '',
  motherPlantCode: '',
  linkedPlantingId: '',
  linkedPlantingCode: '',
  propagationStartDate: '',
  expectedHarvestDate: '',
  breedingLocation: '',
  targetTraits: '',
  generation: ''
})

// 表单数据（V1.1 L110 setFormData → reactive 对象）
const form = reactive(buildInitialFormData())

// 作物编码（V1.1 L113 cropCode，独立 state）
const cropCode = ref('')

// 种源批号状态（V1.1 L116 seedCode）
const seedCode = ref('')

// 作物选择状态（V1.1 L119 selectedCrop）
const selectedCrop = ref(null)

// 供应商搜索状态（V1.1 L122-131）
const showSupplierSearch = ref(false)
const supplierSearchKeyword = ref('')
const supplierSearchResults = ref([])
const selectedSupplier = ref(null)

// 供应商搜索容器 ref（V1.1 L131 supplierSearchRef，用于点击外部关闭）
const supplierSearchRef = ref(null)

// 快速新增弹窗状态（V1.1 L134 showQuickAdd）
const showQuickAdd = ref(false)

// 2026-06-24: 库存调拨入种源 — 多选调拨明细（V1.1 L137 transferItems）
const transferItems = ref([])

// 提交相关（V1.1 L227-403 handleSubmit 等价状态）
const submitting = ref(false)
const generatingSeedCode = ref(false)
const submitError = ref('')
const showSeedCodeWarn = ref(false)

// formRef（el-form 引用，校验时用）
const formRef = ref(null)

// ============================================================
// V1.1 L50-73 currentUser 推导（auth + storeUsers fallback）
// ============================================================
/**
 * 当前用户（操作人）—— V1.1 L55-73 currentUser 推导逻辑
 * V1.1 useAuthStore.currentUser 等价于 V2.0 useUserStore().userInfo
 * 修复：CurrentUser 没有 name 字段（只有 realName/username），fallback 取 realName/username
 * P1-8：auth + storeUsers 都拿不到时直接拒绝，不写入脏数据
 */
const currentUser = computed(() => {
  // 1) useUserStore.userInfo（V2.0 登录用户对齐 V1.1 useAuthStore.currentUser）
  const u = userStore.userInfo
  if (u) {
    return {
      id: u.id || u.oid,
      name: u.realName || u.username || '',
      department: u.department || u.orgOid || '生产部'
    }
  }
  // 2) storeUsers 第一个兜底（演示模式）
  if (userStore.users && userStore.users.length > 0) {
    const first = userStore.users[0]
    return {
      id: first.id || first.oid,
      name: first.realName || first.name || first.username || '',
      department: first.department || first.orgOid || '生产部'
    }
  }
  // 3) auth + users 都拿不到时直接拒绝
  return null
})

// 2026-07-01 P1-8：currentUser 拿不到时拒绝写入（在 handleSubmit 里判断）
const canSubmit = computed(() => currentUser.value !== null)

// 初始化 createBy（V1.1 L95：INITIAL_FORM_DATA.createBy = currentUser?.name || ''）
form.createBy = currentUser.value?.name || ''

// ============================================================
// V1.1 useMemo → computed（供应商搜索结果 + 级联过滤）
// ============================================================

// V1.1 L145-152 useEffect：搜索供应商（响应 keyword + supplierItems 变化）
// V2.0 等价：watch [supplierSearchKeyword, supplierStore.suppliers] 设置 supplierSearchResults
// 拆为 watch + computed（V1.1 风格：搜索 + 全量二选一）

// 计算级联过滤结果（V1.1 L155-159 useMemo filteredSearchResults）
const filteredSearchResults = computed(() => {
  const targetSupplierType = ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE[form.sourceType]
  if (!targetSupplierType) return supplierSearchResults.value
  return supplierSearchResults.value.filter(s => s.supplierType === targetSupplierType)
})

// ============================================================
// V1.1 useEffect → watch / onMounted
// ============================================================

// 1. 挂载时触发供应商全量加载（V1.1 L140-142：store 内部有 5 分钟去重）
onMounted(() => {
  void supplierStore.loadSuppliers()
})

// 2. 监听 supplierSearchKeyword / supplierStore.suppliers → 更新 supplierSearchResults（V1.1 L145-152）
watch(
  [supplierSearchKeyword, () => supplierStore.suppliers],
  ([keyword, items]) => {
    if (String(keyword || '').trim()) {
      // P2 #15：调用 store.search（V1.1 searchSuppliersInStore 等价）
      supplierSearchResults.value = supplierStore.search(String(keyword))
    } else {
      // 无关键字时显示全部（避免空数组时啥也看不到）
      supplierSearchResults.value = items || []
    }
  },
  { immediate: true }
)

// 3. 当种源类型改变时，清空已选供应商（V1.1 L164-172：类型不匹配）
watch(
  () => form.sourceType,
  () => {
    if (selectedSupplier.value) {
      const targetType = ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE[form.sourceType]
      if (targetType && selectedSupplier.value.supplierType !== targetType) {
        selectedSupplier.value = null
        form.supplierId = ''
        form.supplierName = ''
      }
    }
  }
)

// 4. 监听 visible：打开时 resetForm（V1.1 useEffect 重置语义）
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 打开时重置（避免上次脏数据）
      resetForm()
    } else {
      // 关闭时清理提交中状态（防止热更新遗留 loading）
      submitting.value = false
      generatingSeedCode.value = false
    }
  }
)

// 5. click outside 关闭供应商搜索框（V1.1 没有显式 click-outside，V2.0 增强可关闭）
const handleClickOutsideSupplier = (event) => {
  if (
    showSupplierSearch.value
    && supplierSearchRef.value
    && !supplierSearchRef.value.contains(event.target)
  ) {
    showSupplierSearch.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideSupplier)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideSupplier)
})

// ============================================================
// V1.1 L175-189 handleSelectCrop：选择作物后填充表单
// ============================================================
const handleSelectCrop = (variety) => {
  selectedCrop.value = variety
  cropCode.value = variety.cropCode || ''
  form.cropCode = variety.cropCode || ''
  // 获取最细化的作物品种名称
  const cropNameValue = variety.detailVarietyCode && variety.detailVarietyCode !== '00'
    ? variety.varietyName
    : (variety.subVariety1Name || variety.varietyName)
  // V1.1 L182-189 多字段赋值
  form.cropCategory = variety.categoryName || ''
  form.typeName = variety.typeName || ''
  form.varietyName = variety.varietyName || ''
  form.cropName = cropNameValue || ''
  form.cropVariety = variety.subVariety1Name || ''
}

// 处理作物编码选择（V1.1 L198-202，来自 CropCodeSelector 的 onChange(code, varietyInfo)）
const handleCropCodeChange = (code, varietyInfo) => {
  if (varietyInfo) {
    handleSelectCrop(varietyInfo)
  } else {
    selectedCrop.value = null
    cropCode.value = String(code || '')
    form.cropCode = String(code || '')
  }
}

// 快速新增品种成功后选中（V1.1 L193-195）
const handleQuickAddSuccess = (variety) => {
  handleSelectCrop(variety)
}

// ============================================================
// V1.1 L205-215 handleSelectSupplier：选择供应商后填充表单
// ============================================================
const handleSelectSupplier = (supplier) => {
  selectedSupplier.value = supplier
  form.supplierId = String(supplier.id)
  form.supplierName = supplier.name
  showSupplierSearch.value = false
  supplierSearchKeyword.value = ''
  supplierSearchResults.value = []
}

// 移除已选供应商（V1.1 L612-621 + L168-170）
const handleClearSupplier = () => {
  selectedSupplier.value = null
  form.supplierId = ''
  form.supplierName = ''
}

// ============================================================
// V1.1 L218-225 handleGenerateSeedCode
// ============================================================
/**
 * 2026-07-14：移除内嵌 todayLocal 函数（与导入同名遮蔽）
 * 2026-06-26：用本地日期避免 UTC 时区差（中国早上 0:00-8:00 UTC 还是昨天）
 * 2026-07-06 fix：fallback 走 todayLocal() 后也要 strip dashes
 */
const handleGenerateSeedCode = async () => {
  const dateStr = (form.purchaseDate || todayLocal()).replace(/-/g, '')
  generatingSeedCode.value = true
  try {
    const newCode = await generateSeedCode(dateStr)
    seedCode.value = newCode
    showSeedCodeWarn.value = false
  } catch (e) {
    await ElMessageBox.alert(
      e instanceof Error ? `生成失败：${e.message}` : '生成种源批号失败',
      '错误',
      { type: 'error' }
    )
    throw e
  } finally {
    generatingSeedCode.value = false
  }
}

// ============================================================
// 种源类型变化（V1.1 → V2.0：DictSelect 通过 v-model 传入 handleSourceTypeChange）
// ============================================================
const handleSourceTypeChange = (val) => {
  form.sourceType = val
}

// ============================================================
// V1.1 L455-461 入库方式切换
// ============================================================
/**
 * V1.1 L454-466：sourceOrigin 简化为只跟 propagationType 走（去掉 self_produced 分支）
 * 2026-07-14：opt 数组只有 TRANSFER_FROM_INVENTORY，三元永远走 else 分支 → 直接赋值
 */
const handlePropagationTypeChange = (value) => {
  const newSourceOrigin = 'inventory_transfer'
  form.propagationType = value
  form.propagationMethod = ''
  form.sourceOrigin = newSourceOrigin
  form.supplierId = ''
  form.supplierName = ''
  selectedSupplier.value = null
  showSeedCodeWarn.value = false
  submitError.value = ''
}

// ============================================================
// V1.1 L468-487 图片上传
// ============================================================
/** V1.1 L417-422 移除已上传图片 */
const handleRemovePicture = (index) => {
  form.pictures = form.pictures.filter((_, i) => i !== index)
}

/** V1.1 L437-450 处理文件上传 */
const handleFileChange = (e) => {
  const files = e.target.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        form.pictures = [...form.pictures, result]
      }
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

// ============================================================
// V1.1 L227-403 handleSubmit 完整三段式（V2.0 1:1 迁移）
// ============================================================
/**
 * V1.1 L227 handleSubmit
 * 入参 overrideItems: V1.1 P0-3 修复：接受 overrideItems，避免 React state 闭包过期
 *               panel onConfirm 异步 setState 后立即调用
 *
 * 段 1：currentUser 验证（L228-232）
 * 段 2：库存调拨分支（L235-259）
 *        - items.length === 0 阻断
 *        - 调拨成功弹窗 + showAlert 显示新批号列表
 *        - P1-4 修复：调拨成功后重置表单
 * 段 3：非 Transfer 分支（外购 / 育种 / 留种 / 无性）
 *        - seedCode 必填（L262-265）
 *        - 前端查重 checkSourceCodeExists（L266-276）
 *        - 必填校验链：selectedCrop / supplierId / quantity > 0 / Number.isFinite(unitPrice)
 *        - 计算 totalAmount / initialCount / availableCount
 *        - 2026-07-10 P0-1：溯源码用 todayLocal() 避免 UTC 时区 bug
 *        - 调用 useSeedSourceStore.addItem（含繁殖字段）
 *        - 同时创建作物实例 cropInstanceService.createInstance（不阻断主流程）
 */
const handleSubmit = async (overrideItems) => {
  // 段 1：currentUser 验证（V1.1 L228-232）
  if (!currentUser.value) {
    await ElMessageBox.alert('无法识别当前操作员，请先登录系统', '提示', { type: 'warning' })
    return
  }

  // 段 2：库存调拨分支（V1.1 L235-259）
  if (form.propagationType === PropagationType.TRANSFER_FROM_INVENTORY) {
    // P0-3 修复：接受 overrideItems 参数，避免陈旧闭包
    const items = overrideItems ?? transferItems.value
    if (items.length === 0) {
      await ElMessageBox.alert('请先在调拨面板选择至少 1 条库存', '提示', { type: 'warning' })
      return
    }

    submitting.value = true
    submitError.value = ''
    try {
      // P0-2 修复：操作员信息完整透传（之前 store action 只接收 1 个参数，operator 被静默丢弃）
      const operator = currentUser.value?.name
        ? { id: String(currentUser.value.id || ''), name: currentUser.value.name }
        : undefined

      // V1.1 调用：useSeedSourceStore.getState().createFromTransfer(items, operator)
      // V2.0 调用：seedSourceStore.createFromTransfer(items, operator)
      const results = await seedSourceStore.createFromTransfer(items, operator)
      const list = Array.isArray(results) ? results : []

      await ElMessageBox.alert(
        `调拨成功！共生成 ${list.length} 条新种源：\n${list.map(r => r.newSeedSourceCode).join('\n')}`,
        '成功',
        { type: 'success' }
      )

      transferItems.value = []
      // P1-4 修复：调拨成功后重置表单，避免重开 modal 见脏数据
      resetForm()
      emit('success')
      props.onSuccess?.()
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '调拨失败'
      submitError.value = `调拨失败：${msg}`
      await ElMessageBox.alert(submitError.value, '错误', { type: 'error' })
    } finally {
      submitting.value = false
    }
    return
  }

  // 段 3：非 Transfer 分支（V1.1 L261-403）
  // 验证必填项：seedCode
  if (!seedCode.value) {
    showSeedCodeWarn.value = true
    await ElMessageBox.alert('请先生成种源批号', '提示', { type: 'warning' })
    return
  }
  // 前端实时查重（V1.1 L266-276）：三层防重第 1 层
  try {
    const exists = await checkSourceCodeExists(seedCode.value)
    if (exists) {
      await ElMessageBox.alert(
        `种源批号 ${seedCode.value} 已存在，请重新生成或换一个`,
        '提示',
        { type: 'warning' }
      )
      return
    }
  } catch (err) {
    // 查重失败不阻断（后端还有 service + DB UNIQUE 兜底）
    console.warn('[AddModal] checkSourceCodeExists 失败，继续提交:', err)
  }

  // selectedCrop 必填（V1.1 L277-280）
  if (!selectedCrop.value) {
    await ElMessageBox.alert('请选择作物', '提示', { type: 'warning' })
    return
  }

  // 外部采购时供应商必填（V1.1 L282-285）
  if (form.sourceOrigin === 'external_purchase' && !form.supplierId) {
    await ElMessageBox.alert('请选择供应商', '提示', { type: 'warning' })
    return
  }

  // 数量必须 > 0（V1.1 L287-290，HIGH #6）
  if (form.quantity <= 0) {
    await ElMessageBox.alert('请输入有效的采购数量（必须大于 0）', '提示', { type: 'warning' })
    return
  }

  // 单价必须为有限数字（V1.1 L291-294，HIGH #6）
  if (!Number.isFinite(form.unitPrice)) {
    await ElMessageBox.alert('请输入有效的单价（数字）', '提示', { type: 'warning' })
    return
  }

  submitting.value = true
  submitError.value = ''
  try {
    // 获取供应商名称（V1.1 L297 selectedSupplier?.name）
    const supplierName = selectedSupplier.value?.name || ''

    // 计算总金额（V1.1 L300 totalAmount = quantity * unitPrice）
    const totalAmount = form.quantity * form.unitPrice

    // 入库数量 = 可用数量（V1.1 L303-304：新入库均为用户输入）
    const initialCount = form.quantity
    const availableCount = initialCount

    // 2026-06-04: status 改为实时计算，AddModal 不再计算 status 传给 store

    // 生成溯源码（V1.1 L309-310 P0-1 修复：用 todayLocal() 避免 UTC 时区 bug）
    const traceabilityCode = 'TR' + todayLocal().replace(/-/g, '') + String(form.cropName || '').substring(0, 2)

    // 创建种源记录（V1.1 L313-374）
    let newSeedSource = null
    try {
      const baseData = {
        seedCode: seedCode.value,
        sourceOrigin: form.sourceOrigin,
        sourceType: form.sourceType,
        cropCategory: form.cropCategory,
        typeName: form.typeName,
        varietyName: form.varietyName,
        cropName: form.cropName,
        cropVariety: form.cropVariety,
        cropCode: cropCode.value,
        supplierId: form.supplierId,
        supplierName,
        purchaseDate: form.purchaseDate,
        quantity: form.quantity,
        unit: form.unit,
        unitPrice: form.unitPrice,
        totalAmount,
        initialCount,
        availableCount,
        pictures: form.pictures,
        remarks: form.remarks,
        // status 字段已废弃（2026-06-04 V1.1 L337-338）
        traceabilityCode,
        printCount: 0,
        createBy: form.createBy || currentUser.value?.name || '',
        // V3.0 新增字段（V1.1 L342-343）
        productionPlanId: form.productionPlanId,
        productionPlanCode: form.productionPlanCode
      }

      // 繁殖途径字段（V1.1 L347-361）
      if (form.propagationType !== PropagationType.EXTERNAL) {
        baseData.propagationType = form.propagationType
        baseData.propagationStatus = 'planned'
        baseData.propagationMethod = form.propagationMethod
        baseData.parentMaleCode = form.parentMaleCode
        baseData.parentFemaleCode = form.parentFemaleCode
        baseData.motherPlantId = form.motherPlantId
        baseData.motherPlantCode = form.motherPlantCode
        baseData.linkedPlantingId = form.linkedPlantingId
        baseData.linkedPlantingCode = form.linkedPlantingCode
        baseData.expectedHarvestDate = form.expectedHarvestDate
        baseData.breedingLocation = form.breedingLocation
        baseData.targetTraits = form.targetTraits
        baseData.generation = form.generation
      }

      newSeedSource = await seedSourceStore.addItem(baseData)
      // P0 #3 修复：addItem 失败时返回 null，下游不可访问 .id（V1.1 L364-368）
      if (!newSeedSource) {
        await ElMessageBox.alert('创建失败，请重试', '错误', { type: 'error' })
        return
      }
    } catch (error) {
      // 2026-07-14：补充 console.error（CLAUDE.md Fail Loud 铁律）
      console.error('[AddModal] 创建种源失败:', error)
      await ElMessageBox.alert('创建失败，请重试', '错误', { type: 'error' })
      return
    }

    // 同时创建作物实例记录（V1.1 L376-397 — 不阻断主流程）
    try {
      const instance = await cropInstanceService.createInstance(
        {
          cropCategory: form.cropCategory,
          cropName: form.cropName,
          cropVariety: form.cropVariety
        },
        'external_purchase',
        initialCount,
        {
          sourceDescription: `种源入库-${supplierName || '未知供应商'}`
        }
      )
      if (newSeedSource?.id && instance?.id) {
        await seedSourceStore.updateItem(String(newSeedSource.id), { instanceId: instance.id })
      }
    } catch (error) {
      // 2026-07-14：补充 console.warn（CLAUDE.md Fail Loud 铁律 — 之前完全静默吞错）
      console.warn('[AddModal] 创建作物实例失败（不阻断主流程）:', error)
    }

    // 重置表单（V1.1 L400-402）
    resetForm()
    emit('close')
    props.onSuccess?.()
    props.onClose?.()
    emit('success')
    emit('update:visible', false)
  } catch (err) {
    console.error('[AddModal] 提交异常:', err)
    submitError.value = err instanceof Error ? err.message : '提交失败'
    ElMessage.error(submitError.value)
  } finally {
    submitting.value = false
  }
}

// ============================================================
// V1.1 L519-524 InventoryTransferPanel onConfirm 处理
// ============================================================
/**
 * V1.1 L519-525 调拨面板 onConfirm：(items) => { setTransferItems(items); handleSubmit(items) }
 * V2.0 等价：把 items 写入 transferItems ref，然后立即调用 handleSubmit(items)
 */
const handleTransferConfirm = (items) => {
  transferItems.value = items
  void handleSubmit(items)
}

// ============================================================
// V1.1 L406-412 resetForm：完整重置（含 INITIAL_FORM_DATA 字段一致性）
// ============================================================
const resetForm = () => {
  // 用 Object.assign 不破坏 reactive proxy（V1.1 setFormData({...INITIAL_FORM_DATA}) 等价）
  const initial = buildInitialFormData()
  initial.createBy = currentUser.value?.name || ''
  Object.assign(form, initial)
  cropCode.value = ''
  seedCode.value = ''
  selectedCrop.value = null
  selectedSupplier.value = null
  supplierSearchKeyword.value = ''
  supplierSearchResults.value = []
  transferItems.value = []
  submitError.value = ''
  showSeedCodeWarn.value = false
  showSupplierSearch.value = false
  showQuickAdd.value = false
}

// ============================================================
// V1.1 L244-248 handleClose：关闭弹窗（无 submitting 守卫）
// ============================================================
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  props.onClose?.()
  resetForm()
}

// ============================================================
// 暴露方法给父组件（V1.1 用 React forwardRef；V2.0 用 defineExpose）
// ============================================================
defineExpose({
  handleSubmit,
  handleClose,
  resetForm,
  // 暴露 useful fields
  form,
  seedCode,
  transferItems
})
</script>

<style scoped>
/*
 * V1.1 风格保留：
 * - other 种源类型时的红色边框（V1.1 L301 border-red-300）
 */
.remarks-other :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #fca5a5 inset;
}

/*
 * el-input-number 全宽显示（V1.1 grid grid-cols-2 等价）
 */
.el-input-number {
  width: 100%;
}
</style>
