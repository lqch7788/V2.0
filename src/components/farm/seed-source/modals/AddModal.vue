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
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    :model-value="visible"
    width="1170px"
    height="780px"
    top="5vh"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <template #header>
      <!-- V1.1 V3.4：渐变 header（emerald-500 → emerald-600）+ 白色文字（参考 V1.1 UnifiedModal header 风格） -->
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -m-4 px-6 py-3 flex items-center justify-between rounded-t-xl">
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

        <!-- ===== 种源批号 - 可点击生成 - 与入库方式同行（V1.1 紧凑布局） ===== -->
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
              :class="{ 'border-red-400': showSeedCodeWarn }"
            />
            <el-button type="primary" :loading="generatingSeedCode" @click="handleGenerateSeedCode">
              <el-icon v-if="!generatingSeedCode"><Refresh /></el-icon>
              {{ generatingSeedCode ? '生成中' : '生成' }}
            </el-button>
          </div>
          <!-- V1.1 L271 校验：seedCode 必须先生成（必填项） -->
          <p v-if="showSeedCodeWarn" class="mt-1 text-xs text-red-500">请先生成种源批号</p>
        </div>

        <!-- ===== 库存调拨分支（V1.1 独占 col-span-2，调拨面板内 onConfirm → handleSubmit） ===== -->
        <div class="col-span-2">
          <!-- 错误状态：调拨失败反馈（V1.1 风格：顶部 Alert） -->
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
            @confirm="(items) => { transferItems = items; handleSubmit(items) }"
          />
        </div>
      </div>
    </el-form>

    <template #footer>
      <!-- 2026-07-07 V3.4：库存调拨模式下隐藏底部 footer（V1.1 showFooter=false，V2.0 1:1 对齐） -->
      <div v-if="false" class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <span class="text-xs text-gray-400">种源仅支持"库存调拨"入库方式</span>
        <div class="flex gap-3">
          <el-button @click="handleClose" :disabled="submitting">取消</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, Refresh } from '@element-plus/icons-vue'
import { ArrowLeftRight } from 'lucide-vue-next'
import { useSeedSourceStore } from '@/stores/modules/seedSource'
import { useUserStore } from '@/stores/modules/user'
import { generateSeedCode } from '@/services/apiSeedSourceService'
import InventoryTransferPanel from '@/components/farm/seed-source/modals/InventoryTransferPanel.vue'

// V1.1 V3.4：只保留库存调拨（取消外购入库/育种/留种/无性繁殖）
const propagationOptions = [
  // 2026-06-24: 库存调拨 — 从作物库存 3 种 stock_type 调入种源（移动语义）
  {
    value: 'transfer_from_inventory',
    label: '库存调拨',
    desc: '从作物库存调入',
    icon: ArrowLeftRight
  }
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  units: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:visible', 'close', 'success'])

// Stores
const seedSourceStore = useSeedSourceStore()
const userStore = useUserStore()

// 本地日期工具（V1.1 todayLocal 等价）
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// State
const submitting = ref(false)
const generatingSeedCode = ref(false)
const submitError = ref('')
const showSeedCodeWarn = ref(false)
const transferItems = ref([])

// Form data（V1.1 V3.4：仅保留种源批号 + 调拨面板）
// V1.1 默认 propagationType='transfer_from_inventory'，sourceOrigin='inventory_transfer'
const form = ref({
  seedCode: '',
  propagationType: 'transfer_from_inventory',
  sourceOrigin: 'inventory_transfer'
})

// 当前用户（操作人）—— 对齐 V1.1 L55-73 currentUser 推导逻辑
// V1.1 useAuthStore.currentUser 等价于 V2.0 useUserStore().userInfo
const currentUser = computed(() => {
  // V2.0 当前激活用户（userInfo 字段）
  const u = userStore.userInfo
  if (u) {
    return {
      id: u.id || u.oid,
      name: u.realName || u.username || '',
      department: u.department || u.orgOid || '生产部',
    }
  }
  // 兜底：用 users 列表第一项（演示模式）
  if (userStore.users && userStore.users.length > 0) {
    const first = userStore.users[0]
    return {
      id: first.id || first.oid,
      name: first.realName || first.name || first.username || '',
      department: first.department || first.orgOid || '生产部',
    }
  }
  // P1-8：auth + users 都拿不到时直接拒绝
  return null
})

// ===== Event Handlers =====

// V1.1 兼容方法（虽然 V3.4 只有1种模式，但保留以防未来扩展）
const handlePropagationTypeChange = (value) => {
  form.value.propagationType = value
  const newSourceOrigin = value === 'external'
    ? 'external_purchase'
    : value === 'transfer_from_inventory'
    ? 'inventory_transfer'
    : 'inventory_transfer'
  form.value.sourceOrigin = newSourceOrigin
  showSeedCodeWarn.value = false
  submitError.value = ''
}

// 生成种源批号（V1.1 L218-225 对齐：调用服务端 generateSeedCode）
const handleGenerateSeedCode = async () => {
  // V1.1：日期源 = formData.purchaseDate || todayLocal()（V1.1 L222）
  // 2026-07-06 fix（来自 V1.1）：用本地日期避免 UTC 时区差（中国早上 0:00-8:00 UTC 还是昨天）
  const dateStr = (form.value.purchaseDate || todayLocal()).replace(/-/g, '')
  generatingSeedCode.value = true
  try {
    const newCode = await generateSeedCode(dateStr)
    // V1.1：成功直接赋值（生成失败由 service 抛错，alert 弹窗显示）
    form.value.seedCode = newCode
    showSeedCodeWarn.value = false
  } catch (e) {
    // V1.1：失败 throw 让 alert 显示
    await ElMessageBox.alert(e instanceof Error ? `生成失败：${e.message}` : '生成种源批号失败', '错误', { type: 'error' })
    throw e
  } finally {
    generatingSeedCode.value = false
  }
}

// 关闭弹窗
// V1.1 P0-2 修复：删除 submitting 守卫（finally 中已重置，submitting 不会阻塞 close）
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  resetForm()
}

// 重置表单（V1.1 L411-444 resetForm 等价实现）
const resetForm = () => {
  form.value = {
    seedCode: '',
    propagationType: 'transfer_from_inventory',
    sourceOrigin: 'inventory_transfer',
  }
  transferItems.value = []
  submitError.value = ''
  showSeedCodeWarn.value = false
}

// V1.1 核心：调拨模式提交（独立路径，绕过所有外购/育种字段校验）
// V1.1 L246-249：items.length === 0 阻断 + showAlert
// V1.1 L271-274：seedCode 必须先生成（仅在非 transfer 模式下校验，transfer 模式由面板自行生成/外部传入）
const handleSubmit = async (overrideItems) => {
  // 2026-07-01 P1-8：currentUser 可能为 null（auth 失效时），拒绝写入脏数据
  if (!currentUser.value) {
    submitError.value = '无法识别当前操作员，请先登录系统'
    ElMessage.warning(submitError.value)
    return
  }

  // V1.1：库存调拨分支 — 完全独立的提交路径（V1.1 L235-259）
  if (form.value.propagationType === 'transfer_from_inventory') {
    // V1.1 P0-3 修复：接受 overrideItems 参数，避免 React state 闭包过期问题
    const items = overrideItems ?? transferItems.value
    if (items.length === 0) {
      submitError.value = '请先在调拨面板选择至少 1 条库存'
      await ElMessageBox.alert(submitError.value, '提示', { type: 'warning' })
      return
    }

    submitting.value = true
    submitError.value = ''
    try {
      // V1.1 P0-2 修复：操作员信息完整透传（之前 store action 只接收 1 个参数）
      const operator = currentUser.value?.name
        ? { id: String(currentUser.value.id || ''), name: currentUser.value.name }
        : undefined

      // V1.1 调用方式：useSeedSourceStore.getState().createFromTransfer(items, operator)
      // V2.0 Pinia 等价：seedSourceStore.createFromTransfer(items, operator)
      const results = await seedSourceStore.createFromTransfer(items, operator)
      const list = Array.isArray(results) ? results : []

      // V1.1 L244-248：阻塞式 alert（ElMessageBox.alert）展示成功结果
      await ElMessageBox.alert(
        `调拨成功！共生成 ${list.length} 条新种源：\n${list.map((r) => r.newSeedSourceCode).join('\n')}`,
        '成功',
        { type: 'success' }
      )
      transferItems.value = []
      // V1.1 P1-4：调拨成功后重置表单，避免重开 modal 见脏数据
      resetForm()
      emit('success')
      handleClose()
    } catch (err) {
      // V1.1 L254-257：明确错误处理 + alert 弹窗
      const msg = err instanceof Error ? err.message : '调拨失败'
      submitError.value = `调拨失败：${msg}`
      await ElMessageBox.alert(submitError.value, '错误', { type: 'error' })
    } finally {
      submitting.value = false
    }
    return
  }

  // 兜底分支（V3.4 当前不可达；保留以防未来扩展）
  submitError.value = '仅支持库存调拨入库'
  ElMessage.warning(submitError.value)
}

// ===== Lifecycle =====

onMounted(() => {
  // 初始重置表单
  resetForm()
})

// V1.1 useEffect 闭包替代：监听 visible 重置
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
  },
)
</script>
