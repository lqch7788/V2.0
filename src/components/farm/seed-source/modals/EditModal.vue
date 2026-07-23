<!--
  种源编辑弹窗（V1.1 1:1 迁移版，2026-07-22 重构）

  V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\EditModal.tsx (607 行)
  目标行数：~600 行（与 V1.1 业务逻辑 1:1 对齐，UI 用 Element Plus 渲染）

  V1.1 关键设计原则（深度审核后重构）：
  1. 按 sourceOrigin 决定字段可编辑性（EDIT_RULES 单一真理源）
     - external_purchase: 大部分字段可编辑（供应商、采购日期、单位、数量*）
     - inventory_transfer / planting_self_kept / transfer_from_inventory:
       来源相关字段全部只读（入库时已确定，不允许事后篡改）
     - quantity 不允许编辑（累计值，由入库/调拨动作累加）
  2. seedForm 字段新增（与表格"形态"列对齐）
  3. originalSupplierName 调拨来源供应商独立展示
  4. 入库数量 / 剩余可用 / 已使用 三段展示
  5. 审计字段（创建人/时间、修改人/时间）折叠区
  6. 移除冗余繁殖字段（编辑时不允许改育种/留种数据，应由专门模块管理）

  V2.0 改造点（与 V2.0 项目规范对齐）：
  - React useState/useEffect → Vue ref/watch
  - UnifiedModal → el-dialog（V2.0 风格对话框）
  - DictSelect → el-select 字典项
  - useAuthStore.currentUser → useUserStore.userInfo
  - showAlert → dialogService.showAlert（Element Plus MessageBox）
-->
<template>
  <el-dialog
    :model-value="visible"
    title="编辑种源"
    width="1170px"
    height="600px"
    top="5vh"
    :close-on-click-modal="true"
    :draggable="true"
    v-dialog-draggable="'edit-seed-source'"
    <!-- v-dialog-resizable disabled for el-dialog -->
    <!-- v-dialog-maximizable disabled for el-dialog -->
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义绿色渐变 header 1:1 对齐 V1.1 UnifiedModal 默认 header -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">编辑种源</h3>
        <button
          type="button"
          class="text-white hover:bg-emerald-500 rounded p-1 transition-colors"
          aria-label="关闭"
          @click="handleClose"
        >
          <X :size="20" />
        </button>
      </div>
    </template>

    <el-form :model="form" label-width="110px" ref="formRef">
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <!-- ========== 第 1 行：种源批号（只读）+ 来源途径（V1.1 L237-269） ========== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">种源批号</label>
          <el-input
            :model-value="record?.seedCode || ''"
            readonly
            class="bg-gray-50 font-mono"
          />
        </div>

        <div>
          <label class="text-gray-900 text-sm font-medium">
            来源途径
            <span v-if="!editRule.sourceOriginEditable" class="ml-2 text-xs font-normal text-amber-600">（入库时已确定）</span>
          </label>
          <!-- external_purchase 可编辑（DictSelect category="source_origin" 等价 el-select 字典） -->
          <el-select
            v-if="editRule.sourceOriginEditable"
            v-model="form.sourceOrigin"
            placeholder="选择来源途径"
            class="w-full"
          >
            <el-option label="外部采购" value="external_purchase" />
            <el-option label="种植自留种" value="planting_self_kept" />
            <el-option label="库存调拨" value="inventory_transfer" />
            <el-option label="调拨入种源" value="transfer_from_inventory" />
            <el-option label="内部种源" value="internal_seed" />
            <el-option label="自产" value="self_produced" />
            <el-option label="委托生产" value="commissioned" />
            <el-option label="赠送/受赠" value="gift" />
            <el-option label="外购种苗" value="purchased_seedling" />
            <el-option label="其他" value="other" />
          </el-select>
          <!-- 其他来源类型只读显示（V1.1 L262-267） -->
          <el-input
            v-else
            :model-value="sourceOriginLabel"
            readonly
            class="bg-gray-50"
          />
        </div>

        <!-- ========== 第 2 行：作物选择 + 种源类型（只读）（V1.1 L272-302） ========== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            <span class="text-red-500">*</span> 作物选择
          </label>
          <CropCodeSelector
            :model-value="form.cropCode"
            @update:model-value="(val) => { form.cropCode = val }"
            @change="handleCropCodeChange"
            placeholder="搜索或选择作物品种..."
            :show-full-path="true"
          />
          <!-- 2026-07-21：显示当前种源的完整品种路径（与列表/详情完全一致） -->
          <div
            v-if="getVarietyPath(record) && getVarietyPath(record) !== '—'"
            class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs"
          >
            <div class="text-emerald-700">{{ getVarietyPath(record) }}</div>
          </div>
        </div>

        <div>
          <label class="text-gray-900 text-sm font-medium">种源类型</label>
          <!-- 种源类型不可编辑（入库时已确定，避免类型和库存单位/形态不匹配）（V1.1 L293-301） -->
          <!-- 2026-07-21：SOURCE_TYPE_MAP[record.sourceType] 值是字符串不是 .label 对象 -->
          <el-input
            :model-value="(typeof SOURCE_TYPE_MAP[record?.sourceType] === 'string' ? SOURCE_TYPE_MAP[record?.sourceType] : (SOURCE_TYPE_MAP[record?.sourceType]?.label)) || record?.sourceType || '-'"
            readonly
            class="bg-gray-50"
          />
          <p class="mt-1 text-xs text-gray-400">入库时已确定，编辑时不可修改</p>
        </div>

        <!-- ========== 第 3 行：种源形态 + 供应商（V1.1 L304-366） ========== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">种源形态</label>
          <!-- 形态是物理属性，所有来源都可改（V1.1 L80） -->
          <el-select
            v-if="editRule.seedFormEditable"
            v-model="form.seedForm"
            placeholder="选择种源形态"
            class="w-full"
          >
            <el-option label="未选择" value="" />
            <el-option
              v-for="opt in SEED_FORM_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <el-input
            v-else
            :model-value="form.seedForm || '-'"
            readonly
            class="bg-gray-50"
          />
          <p v-if="form.seedForm === '其他'" class="mt-1 text-xs text-red-500">备注必填：形态为"其他"时需说明详情</p>
        </div>

        <div>
          <label class="text-gray-900 text-sm font-medium">
            <span v-if="editRule.supplierEditable" class="text-red-500">*</span>
            {{ editRule.supplierEditable ? '供应商' : '供应商（只读）' }}
          </label>
          <!-- external_purchase 可编辑（V1.1 L336-357） -->
          <el-select
            v-if="editRule.supplierEditable"
            v-model="form.supplierId"
            placeholder="请选择供应商"
            class="w-full"
            filterable
            @change="handleSupplierChange"
          >
            <el-option
              v-for="item in filteredSuppliers"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
            <!-- 内部自留时：显示占位项（V1.1 L141 内部自留逻辑） -->
            <el-option
              v-if="form.sourceOrigin !== 'external_purchase'"
              value="__none__"
              label="内部自留/无需填写"
            />
            <template #empty>
              <div v-if="form.sourceOrigin === 'external_purchase'" class="px-4 py-2 text-gray-500 text-sm">
                当前种源类型下无匹配供应商，请切换种源类型
              </div>
              <div v-else class="px-4 py-2 text-gray-500 text-sm">
                内部自留/无需填写
              </div>
            </template>
          </el-select>
          <el-input
            v-else
            :model-value="form.supplierName || '内部自留/无供应商'"
            readonly
            class="bg-gray-50"
          />
        </div>

        <!-- ========== 第 4 行：原始供应商（仅 showOriginalSupplier） / 采购日期（V1.1 L368-416） ========== -->
        <template v-if="editRule.showOriginalSupplier">
          <div>
            <label class="text-gray-900 text-sm font-medium">
              原始供应商
              <span class="ml-2 text-xs font-normal text-gray-400">（调拨来源库存）</span>
            </label>
            <el-input
              :model-value="record?.originalSupplierName || '-'"
              readonly
              class="bg-gray-50"
            />
            <p class="mt-1 text-xs text-gray-400">来源库存的供应商，不可修改</p>
          </div>
          <div>
            <label class="text-gray-900 text-sm font-medium">入库日期</label>
            <el-input
              :model-value="record?.originalInboundDate || form.purchaseDate || record?.createTime || '-'"
              readonly
              class="bg-gray-50"
            />
            <p class="mt-1 text-xs text-gray-400">原始入库日期，由入库动作决定</p>
          </div>
        </template>
        <template v-else>
          <div>
            <label class="text-gray-900 text-sm font-medium">
              {{ editRule.purchaseDateEditable ? '采购日期' : '入库日期' }}
            </label>
            <!-- 2026-06-12：DatePicker 通过 todayLocal(date) 转换本地时区 YYYY-MM-DD（V1.1 L390-391） -->
            <el-date-picker
              v-if="editRule.purchaseDateEditable"
              v-model="form.purchaseDateObj"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              class="w-full"
              @change="(val) => { form.purchaseDate = todayLocal(val) }"
            />
            <el-input
              v-else
              :model-value="form.purchaseDate || record?.createTime || '-'"
              readonly
              class="bg-gray-50"
            />
          </div>
          <!-- 占位：第 4 行第 2 列保留空白，保持 2 列 grid 布局对齐 V1.1 L403-416 -->
          <div v-if="!editRule.showOriginalSupplier"></div>
        </template>

        <!-- ========== 第 5 行：入库/剩余/已用 三段展示（V1.1 L418-444） ========== -->
        <div class="col-span-2">
          <label class="text-gray-900 text-sm font-medium">
            库存数量
            <span class="ml-2 text-xs font-normal text-amber-600">（累计值由入库/调拨动作累加，不可直接修改）</span>
          </label>
          <div class="grid grid-cols-3 gap-3">
            <div class="px-3 py-2 border border-gray-200 rounded-lg bg-blue-50">
              <div class="text-xs text-gray-500">入库数量</div>
              <div class="text-lg font-semibold text-blue-700 mt-1">
                {{ formatNumber(record?.quantity) }} <span class="text-xs text-gray-500 font-normal">{{ record?.unit || '' }}</span>
              </div>
            </div>
            <div class="px-3 py-2 border border-gray-200 rounded-lg bg-emerald-50">
              <div class="text-xs text-gray-500">剩余可用</div>
              <div class="text-lg font-semibold text-emerald-700 mt-1">
                {{ formatNumber(record?.availableCount) }} <span class="text-xs text-gray-500 font-normal">{{ record?.unit || '' }}</span>
              </div>
            </div>
            <div class="px-3 py-2 border border-gray-200 rounded-lg bg-amber-50">
              <div class="text-xs text-gray-500">已使用</div>
              <div class="text-lg font-semibold text-amber-700 mt-1">
                {{ formatNumber(usedCount) }} <span class="text-xs text-gray-500 font-normal">{{ record?.unit || '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 第 6 行：单位（只读） + 单价（V1.1 L446-470） ========== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            单位
            <span class="ml-2 text-xs font-normal text-gray-400">（入库时已确定）</span>
          </label>
          <el-input
            :model-value="record?.unit || '-'"
            readonly
            class="bg-gray-50"
          />
          <p class="mt-1 text-xs text-gray-400">单位修改会影响数量计算，请走退库/重新入库流程</p>
        </div>

        <div>
          <label class="text-gray-900 text-sm font-medium">单价（元）</label>
          <el-input-number
            v-model="form.unitPrice"
            :min="0"
            class="w-full"
            style="width: 100%"
          />
        </div>

        <!-- ========== 图片上传（V1.1 L472-523） ========== -->
        <div class="col-span-2">
          <label class="text-gray-900 text-sm font-medium">图片上传</label>
          <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 hover:border-emerald-500 transition-colors">
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
                  class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  aria-label="删除图片"
                >
                  <X :size="12" />
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

        <!-- ========== 备注（V1.1 L525-534） ========== -->
        <div class="col-span-2">
          <label class="text-gray-900 text-sm font-medium">备注</label>
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </div>

        <!-- ========== 审计信息（折叠区）（V1.1 L536-603） ========== -->
        <div class="col-span-2">
          <button
            type="button"
            @click="showAuditInfo = !showAuditInfo"
            class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <component :is="showAuditInfo ? ChevronDown : ChevronRight" :size="16" />
            审计信息（创建人/时间、最后修改）
          </button>
          <div
            v-if="showAuditInfo"
            class="mt-2 grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          >
            <div>
              <span class="text-gray-500">创建人：</span>
              <span class="text-gray-700">{{ record?.createBy || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">创建时间：</span>
              <span class="text-gray-700">{{ record?.createTime || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">最后修改人：</span>
              <span class="text-gray-700">{{ record?.updateBy || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">最后修改：</span>
              <span class="text-gray-700">{{ record?.updateTime || '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">结束状态：</span>
              <span :class="record?.endTime ? 'text-red-600' : 'text-emerald-600'">
                {{ record?.endTime
                  ? `${record?.endType === 'abnormal' ? '异常结束' : '正常结束'} (${record?.endTime})`
                  : '进行中' }}
              </span>
            </div>
            <div v-if="record?.productionPlanCode">
              <span class="text-gray-500">生产计划：</span>
              <span class="text-gray-700 font-mono">{{ record?.productionPlanCode }}</span>
            </div>
            <div v-if="record?.traceabilityCode">
              <span class="text-gray-500">溯源码：</span>
              <span class="text-gray-700 font-mono">{{ record?.traceabilityCode }}</span>
            </div>
            <template v-if="record?.transferredFromStockId">
              <div>
                <span class="text-gray-500">调拨来源库存：</span>
                <span class="text-gray-700 font-mono">{{ record?.transferredFromStockId }}</span>
              </div>
              <div>
                <span class="text-gray-500">调拨业务：</span>
                <span class="text-gray-700">{{ record?.transferredFromBusinessType }} #{{ record?.transferredFromBusinessId }}</span>
              </div>
            </template>
            <!-- 2026-07-21：回流合并信息 — 仅 planting_self_kept 且 reflowCount > 0 时显示（V1.1 L595-600） -->
            <div
              v-if="record?.sourceOrigin === 'planting_self_kept' && (record?.reflowCount ?? 0) > 0"
              class="col-span-2"
            >
              <span class="text-gray-500">回流合并：</span>
              <span class="text-gray-700">{{ record?.reflowCount }} 次（最近 {{ record?.lastReflowAt }}）</span>
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 种源编辑弹窗（V1.1 → V2.0 1:1 迁移版，2026-07-22 重构）
 *
 * V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\EditModal.tsx
 *
 * 设计原则（深度审核后重构）：
 * 1. 按 sourceOrigin 决定字段可编辑性（EDIT_RULES 单一真理源）
 *    - external_purchase: 大部分字段可编辑
 *    - inventory_transfer / planting_self_kept / transfer_from_inventory: 来源相关字段全部只读
 *    - quantity 不允许编辑（累计值）
 * 2. seedForm 字段新增（与表格"形态"列对齐）
 * 3. originalSupplierName 调拨来源供应商独立展示
 * 4. 入库数量 / 剩余可用 / 已使用 三段展示
 * 5. 审计字段（创建人/时间、修改人/时间）折叠区
 * 6. 移除冗余繁殖字段（编辑时不允许改育种/留种数据）
 */
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, CaretBottom, CaretRight } from '@element-plus/icons-vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { X } from 'lucide-vue-next'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { enhancedApiClient } from '@/lib/apiClient'
import { todayLocal } from '@/lib/dateUtils'
import { showAlert } from '@/lib/dialogService'
import CropCodeSelector from '@/components/farm/common/CropCodeSelector.vue'
import { SOURCE_TYPE_MAP } from '@/constants/cropConstants'
import { ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE } from '@/constants/seedSourceDict'
import { SEED_FORM_OPTIONS } from '@/constants/seedFormDict'
import { useSeedSourceVarietyPath } from '@/hooks/useSeedSourceVarietyPath'

// ========== 来源途径 → 字段可编辑性规则（单一真理源，V1.1 L47-83）==========
/**
 * @typedef {Object} EditabilityRule
 * @property {boolean} sourceOriginEditable - 来源途径是否可编辑
 * @property {boolean} supplierEditable - 供应商是否可编辑
 * @property {boolean} purchaseDateEditable - 采购日期是否可编辑
 * @property {boolean} unitEditable - 单位是否可编辑（永远只读）
 * @property {boolean} seedFormEditable - 形态是否可编辑（所有来源都可改）
 * @property {boolean} showOriginalSupplier - 是否展示原始供应商（仅调拨/回流）
 */

/** 来源类型：入库时已确定，不允许编辑（V1.1 L59-63） */
const TRANSFERRED_ORIGINS = ['inventory_transfer', 'planting_self_kept', 'transfer_from_inventory']

/**
 * 判断来源途径是否属于"入库时确定，不允许编辑"类（V1.1 L66-70）
 * @param {string} sourceOrigin
 * @returns {boolean}
 */
function isImportedFromInventory(sourceOrigin) {
  return TRANSFERRED_ORIGINS.includes(sourceOrigin)
}

/**
 * 获取编辑性规则（V1.1 L72-83）
 * @param {string} sourceOrigin
 * @returns {EditabilityRule}
 */
function getEditRule(sourceOrigin) {
  const isExternalPurchase = sourceOrigin === 'external_purchase' || sourceOrigin === 'external_purchased'
  const isImported = isImportedFromInventory(sourceOrigin)
  return {
    sourceOriginEditable: isExternalPurchase,
    supplierEditable: isExternalPurchase,
    purchaseDateEditable: isExternalPurchase,
    unitEditable: isExternalPurchase && false, // 单位永远只读（quantity 按单位算，V1.1 L79）
    seedFormEditable: true, // 形态是物理属性，所有来源都可改
    showOriginalSupplier: isImported,
  }
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: {
    type: Object,
    default: () => ({})
  },
  // V1.1 L34：父组件传入供应商列表（可为空，内部兜底加载）
  suppliers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()

// 2026-07-21：使用共享 hook 显示完整品种路径（与列表/详情完全一致，V1.1 L97-98）
const { getVarietyPath } = useSeedSourceVarietyPath()

// 当前用户（操作人，V1.1 L51 useAuthStore.currentUser 等价于 V2.0 useUserStore().userInfo）
const currentUser = computed(() => {
  const u = userStore.userInfo
  if (u) {
    return {
      id: u.id || u.oid,
      name: u.realName || u.username || '',
      department: u.department || u.orgOid || '生产部',
    }
  }
  if (userStore.users && userStore.users.length > 0) {
    const first = userStore.users[0]
    return {
      id: first.id || first.oid,
      name: first.realName || first.name || first.username || '',
      department: first.department || first.orgOid || '生产部',
    }
  }
  return null
})

const formRef = ref()
const submitting = ref(false)
const showAuditInfo = ref(false) // 审计信息折叠状态（V1.1 L94）

// 选中作物信息（V1.1 L93）
const selectedCrop = ref(null)

// 来源途径显示文案（V1.1 L102）
const sourceOriginLabel = computed(() => {
  const value = props.record?.sourceOrigin
  if (!value) return '-'
  const item = SOURCE_TYPE_MAP[value]
  if (typeof item === 'string') return item
  if (item && typeof item === 'object' && item.label) return item.label
  return value
})

// 编辑性规则（按来源途径，V1.1 L101）
const editRule = computed(() => getEditRule(props.record?.sourceOrigin || ''))

// 已使用数量 = 入库 - 剩余（V1.1 L222）
const usedCount = computed(() => {
  return Math.max(0, (props.record?.quantity || 0) - (props.record?.availableCount || 0))
})

// 供应商数据（按 sourceType 过滤，V1.1 L138-146）
const allSuppliersFromStore = ref([])

/** 过滤后的供应商（V1.1 L117-125）：根据种源类型级联过滤 */
const filteredSuppliers = computed(() => {
  // 优先用 props 传入的 suppliers（V1.1 L141）
  const baseList = props.suppliers && props.suppliers.length > 0 ? props.suppliers : allSuppliersFromStore.value
  const targetType = ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE[props.record?.sourceType]
  if (!targetType) {
    // null = 展示全部（V1.1 L119）
    return baseList
  }
  // 过滤 supplierType === targetType（V1.1 L121-124）
  // 兼容 value-only 和 {value,label,supplierType} 两种结构
  return baseList.filter(s => {
    if (s.supplierType) return s.supplierType === targetType
    // 从 allSuppliersFromStore 反查 supplierType
    const found = allSuppliersFromStore.value.find(x => String(x.id) === String(s.value))
    return found?.supplierType === targetType
  })
})

// 表单初始值（V1.1 L105-126 buildFormData）
const buildFormData = (r) => ({
  sourceOrigin: r?.sourceOrigin || 'external_purchase',
  cropCategory: r?.cropCategory,
  typeName: r?.typeName,
  varietyName: r?.varietyName,
  cropName: r?.cropName,
  cropVariety: r?.cropVariety,
  cropCode: r?.cropCode || '',
  // 兼容 DatePicker 同时存在 string 和 Date 两种内部状态
  purchaseDate: r?.purchaseDate,
  purchaseDateObj: r?.purchaseDate ? new Date(r.purchaseDate) : null,
  unitPrice: r?.unitPrice ?? 0,
  seedForm: r?.seedForm || '',
  pictures: parsePictures(r?.pictures),
  remarks: r?.remarks || '',
  // supplierId/supplierName 由 selectedCrop/watch 单独管理
  supplierId: r?.supplierId || '',
  supplierName: r?.supplierName || '',
})

/** 解析 pictures 字段（V1.1 L118-124） */
const parsePictures = (raw) => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

const form = ref(buildFormData(null))

/** 数字本地化（V1.1 L428: toLocaleString） */
const formatNumber = (n) => {
  if (n == null) return 0
  return Number(n).toLocaleString()
}

// ===== 加载供应商列表（V1.1 L107-116 service 风格：URLSearchParams + camelCase 字段 supplierName）=====
const loadSuppliers = async () => {
  try {
    // V1.1：使用 URLSearchParams 拼接 page/limit（pageSize → limit 兼容）
    const params = new URLSearchParams({ page: '1', limit: '1000' })
    const res = await enhancedApiClient.get(`/suppliers?${params.toString()}`)
    // V1.1 后端返回 { success, data: [...] }，camelCase 中间件转换后字段是 supplierName
    const list = res?.data || res?.list || []
    allSuppliersFromStore.value = list.map(item => ({
      value: String(item.id),
      label: item.supplierName || item.name,
      supplierType: item.supplierType || item.type
    }))
  } catch (e) {
    // V2.0 项目：供应商 store 不一定存在，失败不阻断主流程
    console.warn('[EditModal] 供应商加载失败：', e)
    allSuppliersFromStore.value = []
  }
}

// ===== 事件处理 =====

/** 处理作物编码选择（V1.1 L148-163） */
const handleCropCodeChange = (code, varietyInfo) => {
  if (varietyInfo) {
    selectedCrop.value = varietyInfo
    form.value.cropCategory = varietyInfo.categoryName
    form.value.typeName = varietyInfo.typeName
    form.value.varietyName = varietyInfo.varietyName
    form.value.cropName = varietyInfo.detailVarietyCode && varietyInfo.detailVarietyCode !== '00'
      ? varietyInfo.varietyName
      : (varietyInfo.subVariety1Name || varietyInfo.varietyName)
    form.value.cropVariety = varietyInfo.subVariety1Name || ''
  } else {
    selectedCrop.value = null
  }
}

/** 处理种源类型变化 - 清空不匹配的供应商（V1.1 L128-139 备份逻辑） */
const handleSourceTypeChange = () => {
  if (form.value.supplierId) {
    const targetType = ADD_SOURCE_TYPE_TO_SUPPLIER_TYPE[props.record?.sourceType]
    if (targetType) {
      const currentSupplier = (props.suppliers && props.suppliers.length > 0 ? props.suppliers : allSuppliersFromStore.value)
        .find(s => s.value === form.value.supplierId)
      if (currentSupplier && currentSupplier.supplierType && currentSupplier.supplierType !== targetType) {
        form.value.supplierId = ''
        form.value.supplierName = ''
      }
    }
  }
}

/** 处理供应商变化（V1.1 L339-347） */
const handleSupplierChange = (val) => {
  if (val === '__none__') {
    form.value.supplierId = ''
    form.value.supplierName = ''
    return
  }
  const baseList = props.suppliers && props.suppliers.length > 0 ? props.suppliers : allSuppliersFromStore.value
  const supplier = baseList.find(s => s.value === val)
  form.value.supplierName = supplier?.label || ''
}

/** 移除已上传图片（V1.1 L489） */
const handleRemovePicture = (index) => {
  form.value.pictures = form.value.pictures.filter((_, i) => i !== index)
}

/** 处理文件上传（V1.1 L505-519） */
const handleFileChange = (e) => {
  const files = e.target.files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        form.value.pictures = [...form.value.pictures, result]
      }
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

// ===== 生命周期 =====

// 监听 visible + record 变化（V1.1 L130-135 useEffect 1:1 转换）
watch(
  [() => props.visible, () => props.record?.id],
  ([val]) => {
    if (val && props.record) {
      form.value = buildFormData(props.record)
      // 重置 selectedCrop（由 CropCodeSelector 内部处理 selectedVariety）
      selectedCrop.value = null
      // 加载供应商（兜底：当 props.suppliers 为空时）
      if (!props.suppliers || props.suppliers.length === 0) {
        loadSuppliers()
      }
    }
  },
  { immediate: false }
)

// 初次挂载时如果 props.suppliers 为空，预加载供应商
onMounted(() => {
  if (!props.suppliers || props.suppliers.length === 0) {
    loadSuppliers()
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  // P0-EDIT-013 nullable record 保护（V1.1 L165-166）
  if (!props.record?.id) {
    ElMessage.error('记录不存在，无法保存')
    return
  }
  // 校验：选择"其他"种源形态时备注必填（V1.1 L167-170）
  if (form.value.seedForm === '其他' && !form.value.remarks.trim()) {
    await showAlert('种源形态选择"其他"时，备注为必填项，请输入详细说明')
    return
  }
  // 外购入库必须选供应商（V1.1 L172-175）
  if (editRule.value.supplierEditable && !form.value.supplierId) {
    await showAlert('请选择供应商')
    return
  }

  submitting.value = true
  try {
    // 解析供应商名称（V1.1 L178-179）
    const baseList = props.suppliers && props.suppliers.length > 0 ? props.suppliers : allSuppliersFromStore.value
    const supplier = baseList.find(s => s.value === form.value.supplierId)
    const supplierName = supplier?.label || form.value.supplierName

    // V1.1 L181-210：调用 store.updateItem
    await seedSourceStore.updateItem(String(props.record.id), {
      // ========== 按编辑规则提交字段（V1.1 L184-208）==========
      // 来源途径：仅 external_purchase 可改
      ...(editRule.value.sourceOriginEditable && { sourceOrigin: form.value.sourceOrigin }),
      cropCategory: form.value.cropCategory,
      typeName: form.value.typeName,
      varietyName: form.value.varietyName,
      cropName: form.value.cropName,
      cropVariety: form.value.cropVariety,
      cropCode: form.value.cropCode,
      // 供应商：仅 external_purchase 可改
      ...(editRule.value.supplierEditable && {
        supplierId: form.value.supplierId,
        supplierName,
      }),
      // 采购日期：仅 external_purchase 可改
      ...(editRule.value.purchaseDateEditable && { purchaseDate: form.value.purchaseDate }),
      // 单位：永远只读，不提交（V1.1 L199-200）
      // 数量：永远只读，不提交（累计值由入库/调拨动作累加）
      unitPrice: form.value.unitPrice,
      // 总金额 = 单价 × 累计入库量（不随编辑变，V1.1 L203）
      totalAmount: form.value.unitPrice * (props.record?.quantity || 0),
      // 种源形态：所有来源都可改
      seedForm: form.value.seedForm || undefined,
      pictures: form.value.pictures,
      remarks: form.value.remarks,
      // 操作人（V1.1 L209）
      updateBy: currentUser.value?.name || 'system',
    })

    // V1.1 L217-218：成功不显示 toast，直接关闭弹窗 + 刷新
    emit('success')
    handleClose()
  } catch (error) {
    console.error('[EditModal] 更新种源失败:', error)
    await showAlert('更新失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 2026-07-22：审计信息折叠区 hover 效果（V1.1 L538-544 1:1 还原） */
.audit-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #4b5563;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 0;
}
.audit-toggle:hover {
  color: #111827;
}
</style>
