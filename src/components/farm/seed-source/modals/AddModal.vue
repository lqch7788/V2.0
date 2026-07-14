<template>
  <!--
    种源新增弹窗（V1.1 V3.4 1:1 迁移版）
    V1.1源文件：src/components/farm/seed-source/modals/AddModal.tsx

    V1.1 V3.4（2026-07-07）：
    - 取消「入库登记（外购）」入口
    - 取消外购入库 tab（默认改为库存调拨）
    - 种源仅支持「库存调拨」入库
    - 外部采购走「作物库存 → 新建入库」完成，再调拨入种源
    - 自有种源走「种植/育苗 → 行级采收入库 → 作物库存 → 调拨」入种源

    功能：种源批号 + 库存调拨面板（从作物库存3种 stock_type 调入种源）
  -->
  <el-dialog
    :model-value="visible"
    title="新增种源"
    width="1170px"
    top="5vh"
    :close-on-click-modal="false"
    :draggable="true"
    @update:model-value="(v) => !v && handleClose()"
    @close="handleClose"
  >
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">新增种源</h3>
        <el-button link @click="handleClose" style="color: white;">
          <el-icon :size="20"><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <el-form :model="form" label-width="110px" ref="formRef">
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <!-- ===== 2026-07-07 V3.4 顶部提示条（占两列，emerald 主色）
             2026-07-08 V3.4 UI 改造：前端隐藏 banner 文字（用户决定），仅保留代码注释
             原显示文字：
             内部种源仅支持 库存调拨 入库。
             外部采购请通过「作物库存 → 新建入库」完成，再调拨入种源。
             自有种源请通过「种植/育苗 → 行级采收入库 → 作物库存 → 调拨」入种源。 ===== -->

        <!-- ===== 入库方式 - 紧凑按钮（V1.1 V3.4 只保留库存调拨） ===== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">入库方式</label>
          <!-- V1.1 V3.4：取消外购入库选项，仅保留库存调拨 -->
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="opt in propagationOptions"
              :key="opt.value"
              @click="handlePropagationTypeChange(opt.value)"
              :class="[
                'p-2 border-2 cursor-pointer rounded-lg text-left transition-all',
                form.propagationType === opt.value
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              ]"
            >
              <div class="flex items-center gap-1.5">
                <el-icon :size="16" :class="form.propagationType === opt.value ? 'text-emerald-600' : 'text-gray-500'">
                  <component :is="opt.icon" />
                </el-icon>
                <span class="text-sm font-medium text-gray-900">{{ opt.label }}</span>
                <span class="text-xs text-gray-400">· {{ opt.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 种源批号 - 可点击生成 - 与入库方式同行（V1.1 紧凑布局） ===== -->
        <div>
          <label class="text-gray-900 text-sm font-medium">
            种源批号
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
            <el-button type="primary" @click="handleGenerateSeedCode">
              <el-icon><Refresh /></el-icon>
              生成
            </el-button>
          </div>
        </div>

        <!-- ===== 库存调拨分支（V1.1 独占 col-span-2，调拨面板内 onConfirm → handleSubmit） ===== -->
        <div class="col-span-2">
          <InventoryTransferPanel
            @confirm="(items) => { transferItems = items; handleSubmit(items) }"
          />
        </div>
      </div>
    </el-form>

    <template #footer>
      <!-- 2026-07-07 V3.4：库存调拨模式下隐藏底部保存按钮（已在调拨面板的"确认调拨"自动提交） -->
      <div class="px-6 py-3 border-t border-gray-200 flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Refresh, ShoppingCart } from '@element-plus/icons-vue'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { getTodayMaxSeedCodeSerial } from '@/services/apiSeedSourceService'
import InventoryTransferPanel from '@/components/farm/seed-source/modals/InventoryTransferPanel.vue'

// V1.1 V3.4：只保留库存调拨（取消外购入库/育种/留种/无性繁殖）
const propagationOptions = [
  // 2026-06-24: 库存调拨 — 从作物库存 3 种 stock_type 调入种源（移动语义）
  {
    value: 'transfer_from_inventory',
    label: '库存调拨',
    desc: '从作物库存调入',
    icon: ShoppingCart
  }
]

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'close', 'success'])

// Stores
const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()

// State
const submitting = ref(false)
const transferItems = ref([])

// Form data（V1.1 V3.4：仅保留种源批号 + 调拨面板）
const form = ref({
  seedCode: '',
  // 库存调拨相关字段
  propagationType: 'transfer_from_inventory',
  sourceOrigin: 'inventory_transfer'
})

// 当前用户（操作人）
const currentUser = computed(() => {
  const u = userStore.currentUser
  return u ? { id: u.oid, name: u.realName || u.username || '' } : null
})

// ===== Event Handlers =====

// V1.1 兼容方法（虽然 V3.4 只有1种模式，但保留以防未来扩展）
const handlePropagationTypeChange = (value) => {
  form.value.propagationType = value
  const newSourceOrigin = value === 'external' ? 'external_purchase'
    : value === 'transfer_from_inventory' ? 'inventory_transfer'
    : 'other'
  form.value.sourceOrigin = newSourceOrigin
}

// 生成种源批号
const handleGenerateSeedCode = async () => {
  try {
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const serial = await getTodayMaxSeedCodeSerial(dateStr)
    const newCode = `ZZ${dateStr}-${String(serial + 1).padStart(3, '0')}`
    form.value.seedCode = newCode
  } catch (e) {
    ElMessage.error('生成种源批号失败')
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.value = {
    seedCode: '',
    propagationType: 'transfer_from_inventory',
    sourceOrigin: 'inventory_transfer'
  }
  transferItems.value = []
}

// V1.1 核心：调拨模式提交（独立路径，绕过所有外购/育种字段校验）
const handleSubmit = async (overrideItems) => {
  if (!currentUser.value) {
    ElMessage.warning('无法识别当前操作员，请先登录系统')
    return
  }

  // 2026-07-01 P1-8：currentUser 可能为 null（auth 失效时），拒绝写入脏数据
  if (form.value.propagationType !== 'transfer_from_inventory') {
    ElMessage.warning('仅支持库存调拨入库')
    return
  }

  // V1.1: 接受 overrideItems 参数，避免 React state 闭包过期问题
  const items = overrideItems ?? transferItems.value
  if (items.length === 0) {
    ElMessage.warning('请先在调拨面板选择至少 1 条库存')
    return
  }

  try {
    submitting.value = true
    // 2026-07-07 V3.4：操作员信息完整透传
    const operator = currentUser.value?.name
      ? { id: String(currentUser.value.id || ''), name: currentUser.value.name }
      : undefined

    // 调用 Store 的 createFromTransfer（V1.1 实际是 useSeedSourceStore.getState().createFromTransfer）
    const results = await seedSourceStore.createFromTransfer?.(items, operator)

    ElMessage.success(
      `调拨成功！共生成 ${results?.length || 0} 条新种源：\n${
        results?.map(r => r.newSeedSourceCode).join('\n') || ''
      }`
    )
    transferItems.value = []
    // P1-4 修复：调拨成功后重置表单
    resetForm()
    emit('success')
    handleClose()
  } catch (err) {
    const msg = err instanceof Error ? err.message : '调拨失败'
    ElMessage.error(`调拨失败：${msg}`)
  } finally {
    submitting.value = false
  }
}

// ===== Lifecycle =====

onMounted(() => {
  // 初始重置表单
  resetForm()
})

watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
  }
})
</script>
