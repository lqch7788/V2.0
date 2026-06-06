<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <el-button circle @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Collection /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">供应商编码规则</h1>
            <!-- P1-3 修复：补充"流水号 3 位"提示，与 V1.1 描述完全一致 -->
            <p class="text-gray-500">编码结构：大类代码(2位) + 中类代码(2位) + 流水号(3位)，前缀 SU_</p>
            <p class="text-xs text-amber-600 mt-1">提示：流水号为 3 位数字（如 001, 002...），系统按供应商添加顺序自动递增</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <template v-if="!isEditing">
            <el-button type="primary" @click="isEditing = true">
              <el-icon><Edit /></el-icon> 修改规则
            </el-button>
          </template>
          <template v-else>
            <el-button @click="isEditing = false">取消修改</el-button>
            <el-button type="primary" @click="showSaveConfirm = true">
              <el-icon><Check /></el-icon> 保存修改
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 使用说明（编辑模式下显示） -->
    <div v-if="isEditing" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h3 class="font-semibold text-blue-800 mb-2">使用说明</h3>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>• 点击"修改规则"按钮进入编辑模式</li>
        <li>• 编辑模式下可添加、删除、修改分类</li>
        <li>• 点击展开图标查看下级分类</li>
        <li>• 点击"保存修改"前请注意风险提示</li>
      </ul>
    </div>

    <!-- 分类表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="width: 65%">
      <table class="w-full">
        <thead class="bg-emerald-600">
          <tr>
            <th class="px-2 py-3 text-left text-base font-semibold text-white w-24">大类代码</th>
            <th class="px-2 py-3 text-left text-base font-semibold text-white">大类名称</th>
            <th class="px-2 py-3 text-left text-base font-semibold text-white w-24">中类代码</th>
            <th class="px-2 py-3 text-left text-base font-semibold text-white w-48">中类名称</th>
          </tr>
          <!-- 添加大类按钮行 -->
          <tr v-if="isEditing" class="bg-white">
            <td colspan="4" class="px-2 py-2">
              <template v-if="showAddBig">
                <div class="flex items-center gap-2">
                  <el-input v-model="newBigCode" placeholder="代码(如:AB)" size="small" class="!w-24" />
                  <el-input v-model="newBigName" placeholder="大类名称" size="small" class="!w-40" />
                  <el-button type="primary" size="small" @click="handleAddBig">添加</el-button>
                  <el-button size="small" @click="cancelAddBig">取消</el-button>
                </div>
              </template>
              <template v-else>
                <el-button link @click="showAddBig = true">
                  <el-icon><Plus /></el-icon> 添加大类
                </el-button>
              </template>
            </td>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <template v-for="big in store.categories" :key="'big-' + big.code">
            <!-- 大类标题行 -->
            <tr class="bg-white hover:bg-gray-50">
              <td class="px-2 py-3">
                <div class="flex items-center gap-2">
                  <el-button link @click="toggleBig(big.code)">
                    <el-icon :size="20">
                      <ArrowDown v-if="expandedBig.has(big.code)" />
                      <ArrowRight v-else />
                    </el-icon>
                  </el-button>
                  <span class="font-mono font-bold text-blue-600 text-sm">{{ big.code }}</span>
                </div>
              </td>
              <td class="px-2 py-3 whitespace-nowrap">
                <template v-if="isEditing">
                  <div class="flex items-center">
                    <EditCell
                      type="big"
                      :big-code="big.code"
                      :current-name="big.name"
                      :editing-cell="editingCell"
                      :edit-value="editValue"
                      @start-edit="startEdit"
                      @save-edit="saveEdit"
                      @cancel-edit="cancelEdit"
                      @update:edit-value="editValue = $event"
                    />
                    <span class="text-xs text-gray-400 ml-1">({{ big.nameEn }})</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-800 text-sm">{{ big.name }}</span>
                    <span class="text-xs text-gray-400 ml-1">({{ big.nameEn }})</span>
                  </div>
                </template>
              </td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3">
                <template v-if="isEditing">
                  <el-button link size="small" class="!text-red-500" @click="handleDeleteBig(big.code)">
                    <el-icon :size="16"><Delete /></el-icon>
                  </el-button>
                </template>
              </td>
            </tr>

            <!-- 已展开的中类 -->
            <template v-if="expandedBig.has(big.code)">
              <tr v-for="mid in big.midCategories" :key="'mid-' + big.code + '-' + mid.code" class="bg-white hover:bg-gray-50">
                <td class="px-2 py-2"></td>
                <td class="px-2 py-2"></td>
                <td class="px-2 py-2">
                  <span class="font-mono text-blue-600 font-medium text-sm">{{ mid.code }}</span>
                </td>
                <td class="px-2 py-2 whitespace-nowrap">
                  <div class="flex items-center gap-4">
                    <template v-if="isEditing">
                      <EditCell
                        type="mid"
                        :big-code="big.code"
                        :mid-code="mid.code"
                        :current-name="mid.name"
                        :editing-cell="editingCell"
                        :edit-value="editValue"
                        @start-edit="startEdit"
                        @save-edit="saveEdit"
                        @cancel-edit="cancelEdit"
                        @update:edit-value="editValue = $event"
                      />
                    </template>
                    <template v-else>
                      <span class="font-medium text-gray-800 text-sm">{{ mid.name }}</span>
                    </template>
                    <template v-if="isEditing">
                      <el-button link size="small" @click="handleDeleteMid(big.code, mid.code)">
                        <el-icon :size="16"><Delete /></el-icon>
                      </el-button>
                    </template>
                  </div>
                </td>
              </tr>

              <!-- 添加中类按钮 -->
              <tr v-if="isEditing" class="bg-white hover:bg-gray-50">
                <td class="px-2 py-2"></td>
                <td class="px-2 py-2">
                  <el-button link class="!text-emerald-600" @click="openAddMid(big.code)">
                    <el-icon><Plus /></el-icon> 添加中类
                  </el-button>
                </td>
                <td class="px-2 py-2"></td>
                <td class="px-2 py-2"></td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 添加中类弹窗 -->
    <el-dialog v-model="showAddMidDialog" :title="'添加中类 — ' + showAddMid" width="400px" :close-on-click-modal="false">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">中类代码</label>
          <el-input v-model="newMidCode" placeholder="中类代码" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">中类名称</label>
          <el-input v-model="newMidName" placeholder="中类名称" />
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelAddMid">取消</el-button>
        <el-button type="primary" @click="handleAddMid(showAddMid)">添加</el-button>
      </template>
    </el-dialog>

    <!-- 风险提示/保存确认弹窗 -->
    <el-dialog v-model="showSaveConfirm" title="风险提示" width="480px" :close-on-click-modal="false">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <el-icon :size="20" color="#dc2626"><WarningFilled /></el-icon>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">风险提示</h3>
      </div>
      <div class="mb-6">
        <p class="text-gray-600 mb-3">您即将保存对编码规则的修改，请注意以下风险：</p>
        <ul class="text-sm text-gray-500 space-y-2 bg-red-50 p-4 rounded-lg">
          <li class="flex items-start gap-2">
            <span class="text-red-500">•</span>
            <span>如果修改后的编码规则与系统中已有的供应商编码冲突，可能导致系统无法识别该供应商</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-red-500">•</span>
            <span>删除已被使用的编码分类可能影响历史数据的关联和追溯</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-red-500">•</span>
            <span>建议在修改前备份系统数据，确保可以回滚</span>
          </li>
        </ul>
      </div>
      <template #footer>
        <el-button @click="showSaveConfirm = false">取消保存</el-button>
        <el-button type="danger" @click="handleSaveConfirm">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowDown, ArrowRight, Plus, Edit, Check, Delete, WarningFilled, Collection } from '@element-plus/icons-vue'
import { useSupplierCodeRuleStore } from '@/stores/modules/supplierCodeRule'
import EditCell from './components/EditCell.vue'

const store = useSupplierCodeRuleStore()

// 展开状态
const expandedBig = ref(new Set(store.categories.map(c => c.code)))

// 编辑模式
const isEditing = ref(false)
const showSaveConfirm = ref(false)

// 编辑状态
const editingCell = ref(null)
const editValue = ref('')

// 添加状态
const showAddBig = ref(false)
const newBigCode = ref('')
const newBigName = ref('')

const showAddMid = ref(null)
const showAddMidDialog = ref(false)
const newMidCode = ref('')
const newMidName = ref('')

// 加载数据
onMounted(async () => {
  await store.fetchCategories()
  expandedBig.value = new Set(store.categories.map(c => c.code))
})

// 展开/折叠
function toggleBig(code) {
  const next = new Set(expandedBig.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  expandedBig.value = next
}

// 编辑操作
function startEdit(type, bigCode, midCode, subCode, currentName) {
  editingCell.value = { type, bigCode, midCode, subCode }
  editValue.value = currentName || ''
}

async function saveEdit() {
  if (!editingCell.value || !editValue.value.trim()) return
  try {
    const cell = editingCell.value
    if (cell.type === 'big') {
      await store.updateBigName(cell.bigCode, editValue.value.trim())
    } else if (cell.type === 'mid' && cell.midCode) {
      await store.updateMidName(cell.bigCode, cell.midCode, editValue.value.trim())
    }
    editingCell.value = null
    editValue.value = ''
  } catch (err) {
    ElMessage.error(`保存失败: ${err.message || '未知错误'}`)
  }
}

function cancelEdit() {
  editingCell.value = null
  editValue.value = ''
}

// 新增大类
async function handleAddBig() {
  if (!newBigCode.value.trim() || !newBigName.value.trim()) return
  try {
    await store.addBigCategory(newBigCode.value.trim().toUpperCase(), newBigName.value.trim())
    cancelAddBig()
  } catch (err) {
    ElMessage.error(`新增大类失败: ${err.message || '未知错误'}`)
  }
}

function cancelAddBig() {
  showAddBig.value = false
  newBigCode.value = ''
  newBigName.value = ''
}

// 新增中类
function openAddMid(bigCode) {
  showAddMid.value = bigCode
  showAddMidDialog.value = true
  newMidCode.value = ''
  newMidName.value = ''
}

async function handleAddMid(bigCode) {
  if (!newMidCode.value.trim() || !newMidName.value.trim()) return
  try {
    await store.addMidCategory(bigCode, newMidCode.value.trim(), newMidName.value.trim())
    cancelAddMid()
  } catch (err) {
    ElMessage.error(`新增中类失败: ${err.message || '未知错误'}`)
  }
}

function cancelAddMid() {
  showAddMid.value = null
  showAddMidDialog.value = false
  newMidCode.value = ''
  newMidName.value = ''
}

// 删除操作
async function handleDeleteBig(bigCode) {
  try {
    await ElMessageBox.confirm(`确定要删除大类 "${bigCode}" 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    await store.deleteBigCategory(bigCode)
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(`删除失败: ${err.message || '未知错误'}`)
    }
  }
}

async function handleDeleteMid(bigCode, midCode) {
  try {
    await ElMessageBox.confirm(`确定要删除中类 "${midCode}" 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    await store.deleteMidCategory(bigCode, midCode)
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(`删除失败: ${err.message || '未知错误'}`)
    }
  }
}

// 保存确认
function handleSaveConfirm() {
  showSaveConfirm.value = false
  isEditing.value = false
  // 数据已通过每次CRUD操作实时持久化到后端数据库
}
</script>
