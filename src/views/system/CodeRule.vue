<template>
  <div class="space-y-6">
    <!-- 加载中状态 -->
    <div v-if="store.isLoading" class="flex items-center justify-center h-64">
      <div class="text-center space-y-4">
        <el-icon :size="32" class="animate-spin text-emerald-600 mx-auto"><Loading /></el-icon>
        <p class="text-gray-500">正在加载编码规则数据...</p>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div v-else-if="store.error" class="flex items-center justify-center h-64">
      <div class="text-center space-y-4">
        <el-icon :size="48" color="#ef4444"><WarningFilled /></el-icon>
        <p class="text-red-600 font-medium">加载失败</p>
        <p class="text-gray-500">{{ store.error }}</p>
        <el-button type="primary" @click="store.loadCategories()">重试</el-button>
      </div>
    </div>

    <!-- 正常内容 -->
    <template v-else>
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
              <h1 class="text-2xl font-bold text-gray-900">物料编码规则</h1>
              <p class="text-gray-500">编码结构：大类代码(2位) + 中类代码(2位) + 小类代码(2位) + 流水号(3位)</p>
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
                <el-icon><Check /></el-icon> 退出编辑
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <!-- 使用说明（编辑模式下显示） -->
      <div v-if="isEditing" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 class="font-semibold text-blue-800 mb-2">使用说明</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• 点击名称可编辑分类名称（实时保存到后端）</li>
          <li>• 点击"添加大类/中类/小类"按钮新增分类</li>
          <li>• 点击左侧图标展开/折叠下级分类</li>
          <li>• 所有修改即时持久化到后端数据库</li>
        </ul>
      </div>

      <!-- 分类表格 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="width: 90%">
        <table class="w-full">
          <thead class="bg-emerald-600">
            <tr>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white w-24">大类代码</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white">大类名称</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white w-24">中类代码</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white w-48">中类名称</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white w-24">小类代码</th>
              <th class="px-2 py-3 text-left text-sm font-semibold text-white w-48">小类名称</th>
            </tr>
            <!-- 添加大类按钮行（编辑模式下显示） -->
            <tr v-if="isEditing" class="bg-white">
              <td colspan="6" class="px-2 py-2">
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
                    <div class="flex items-center gap-2">
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
                      <span class="text-xs text-gray-400">({{ big.nameEn }})</span>
                      <el-button link size="small" class="!text-red-400 hover:!text-red-600" @click="handleDeleteBig(big.code)">
                        <el-icon :size="12"><Delete /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center">
                      <span class="font-semibold text-gray-800 text-sm">{{ big.name }}</span>
                      <span class="text-xs text-gray-400 ml-1">({{ big.nameEn }})</span>
                    </div>
                  </template>
                </td>
                <td class="px-2 py-3" />
                <td class="px-2 py-3" />
                <td class="px-2 py-3" />
                <td class="px-2 py-3" />
              </tr>

              <!-- 已展开的中类 + 小类 -->
              <template v-if="expandedBig.has(big.code)">
                <template v-for="mid in big.midCategories" :key="'mid-' + big.code + '-' + mid.code">
                  <!-- 中类标题行 -->
                  <tr>
                    <td class="px-2 py-2" />
                    <td class="px-2 py-2" />
                    <td class="px-2 py-2">
                      <div class="flex items-center gap-2">
                        <el-button link @click="toggleMid(big.code, mid.code)">
                          <el-icon :size="16">
                            <ArrowDown v-if="expandedMid.has(big.code + mid.code)" />
                            <ArrowRight v-else />
                          </el-icon>
                        </el-button>
                        <span class="font-mono text-blue-600 font-medium text-sm">{{ mid.code }}</span>
                      </div>
                    </td>
                    <td class="px-2 py-2 whitespace-nowrap">
                      <div class="flex items-center gap-2">
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
                          <el-button link size="small" class="!text-red-400 hover:!text-red-600" @click="handleDeleteMid(big.code, mid.code)">
                            <el-icon :size="12"><Delete /></el-icon>
                          </el-button>
                          <el-button link size="small" class="!text-emerald-600" @click="openAddSub(big.code, mid.code)">
                            <el-icon :size="12"><Plus /></el-icon> 添加小类
                          </el-button>
                        </template>
                        <template v-else>
                          <span class="font-medium text-gray-800 text-sm">{{ mid.name }}</span>
                        </template>
                      </div>
                    </td>
                    <td class="px-2 py-2" />
                    <td class="px-2 py-2" />
                  </tr>

                  <!-- 已展开的小类 -->
                  <template v-if="expandedMid.has(big.code + mid.code)">
                    <tr v-for="sub in mid.subCategories" :key="big.code + mid.code + sub.code">
                      <td class="px-2 py-2" />
                      <td class="px-2 py-2" />
                      <td class="px-2 py-2" />
                      <td class="px-2 py-2" />
                      <td class="px-2 py-2">
                        <span class="font-mono text-blue-600 text-sm">{{ sub.code }}</span>
                      </td>
                      <td class="px-2 py-2 whitespace-nowrap">
                        <template v-if="isEditing">
                          <div class="flex items-center gap-2">
                            <EditCell
                              type="sub"
                              :big-code="big.code"
                              :mid-code="mid.code"
                              :sub-code="sub.code"
                              :current-name="sub.name"
                              :editing-cell="editingCell"
                              :edit-value="editValue"
                              @start-edit="startEdit"
                              @save-edit="saveEdit"
                              @cancel-edit="cancelEdit"
                              @update:edit-value="editValue = $event"
                            />
                            <el-button link size="small" class="!text-red-400 hover:!text-red-600" @click="handleDeleteSub(big.code, mid.code, sub.code)">
                              <el-icon :size="12"><Delete /></el-icon>
                            </el-button>
                          </div>
                        </template>
                        <template v-else>
                          <span class="text-sm text-gray-700">{{ sub.name }}</span>
                        </template>
                      </td>
                    </tr>
                  </template>
                </template>

                <!-- 添加中类按钮（大类底部） -->
                <tr v-if="isEditing">
                  <td class="px-2 py-2" />
                  <td class="px-2 py-2">
                    <el-button link class="!text-emerald-600" @click="openAddMid(big.code)">
                      <el-icon><Plus /></el-icon> 添加中类
                    </el-button>
                  </td>
                  <td class="px-2 py-2" />
                  <td class="px-2 py-2" />
                  <td class="px-2 py-2" />
                  <td class="px-2 py-2" />
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
            <el-input v-model="newMidCode" placeholder="两位数字，如：04" />
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

      <!-- 添加小类弹窗 -->
      <el-dialog v-model="showAddSubDialog" :title="addSubTitle" width="400px" :close-on-click-modal="false">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类代码</label>
            <el-input v-model="newSubCode" placeholder="两位数字，如：10" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">小类名称</label>
            <el-input v-model="newSubName" placeholder="小类名称" />
          </div>
        </div>
        <template #footer>
          <el-button @click="cancelAddSub">取消</el-button>
          <el-button type="primary" @click="handleAddSub(showAddSub.bigCode, showAddSub.midCode)">添加</el-button>
        </template>
      </el-dialog>

      <!-- 退出编辑确认弹窗 -->
      <el-dialog v-model="showSaveConfirm" title="退出编辑" width="480px" :close-on-click-modal="false">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <el-icon :size="20" color="#059669"><WarningFilled /></el-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">退出编辑</h3>
        </div>
        <div class="mb-6">
          <p class="text-gray-600 mb-3">所有修改均已实时保存到后端数据库。</p>
          <ul class="text-sm text-gray-500 space-y-2 bg-emerald-50 p-4 rounded-lg">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500">✓</span>
              <span>编辑分类名称时，修改会即时持久化到数据库</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500">✓</span>
              <span>新增/删除分类操作也已写入数据库</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500">✓</span>
              <span>页面刷新后数据不会丢失</span>
            </li>
          </ul>
        </div>
        <template #footer>
          <el-button @click="showSaveConfirm = false">取消</el-button>
          <el-button type="primary" @click="handleSaveConfirm">确认退出编辑</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowDown, ArrowRight, Plus, Edit, Check, Delete, Loading, WarningFilled, Collection } from '@element-plus/icons-vue'
import { useMaterialCodeRuleStore } from '@/stores/modules/materialCodeRule'
import EditCell from './components/EditCell.vue'

const store = useMaterialCodeRuleStore()

// 展开状态
const expandedBig = ref(new Set())
const expandedMid = ref(new Set())

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

const showAddSub = ref(null)
const showAddSubDialog = ref(false)
const newSubCode = ref('')
const newSubName = ref('')

const addSubTitle = computed(() => {
  if (!showAddSub.value) return ''
  return `添加小类 — ${showAddSub.value.bigCode}${showAddSub.value.midCode}`
})

// 加载数据
onMounted(async () => {
  await store.loadCategories()
  if (store.categories.length > 0) {
    // P1-1 修复：与 V1.1 严格对齐 - 固定展开 7 大类（SP/EQ/OP/PH/IT/EC/OT）
    const fixedBigCodes = ['SP', 'EQ', 'OP', 'PH', 'IT', 'EC', 'OT']
    expandedBig.value = new Set(fixedBigCodes)
    // 初始化展开中类（与V1.1一致 - 默认展开所有中类）
    const midKeys = []
    store.categories.forEach(big => {
      if (big.midCategories) {
        big.midCategories.forEach(mid => {
          midKeys.push(big.code + mid.code)
        })
      }
    })
    expandedMid.value = new Set(midKeys)
  }
})

// 展开/折叠
function toggleBig(code) {
  const next = new Set(expandedBig.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  expandedBig.value = next
}

function toggleMid(bigCode, midCode) {
  const key = bigCode + midCode
  const next = new Set(expandedMid.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedMid.value = next
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
    } else if (cell.type === 'sub' && cell.midCode && cell.subCode) {
      await store.updateSubName(cell.bigCode, cell.midCode, cell.subCode, editValue.value.trim())
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

// 新增小类
function openAddSub(bigCode, midCode) {
  showAddSub.value = { bigCode, midCode }
  showAddSubDialog.value = true
  newSubCode.value = ''
  newSubName.value = ''
}

async function handleAddSub(bigCode, midCode) {
  if (!newSubCode.value.trim() || !newSubName.value.trim()) return
  try {
    await store.addSubCategory(bigCode, midCode, newSubCode.value.trim(), newSubName.value.trim())
    cancelAddSub()
  } catch (err) {
    ElMessage.error(`新增小类失败: ${err.message || '未知错误'}`)
  }
}

function cancelAddSub() {
  showAddSub.value = null
  showAddSubDialog.value = false
  newSubCode.value = ''
  newSubName.value = ''
}

// 删除操作
async function handleDeleteBig(bigCode) {
  try {
    await ElMessageBox.confirm(`确定要删除大类 "${bigCode}" 及其所有子分类吗？此操作不可恢复。`, '确认删除', {
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
    await ElMessageBox.confirm(`确定要删除中类 "${midCode}" 及其所有小类吗？`, '确认删除', {
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

async function handleDeleteSub(bigCode, midCode, subCode) {
  try {
    await ElMessageBox.confirm(`确定要删除小类 "${subCode}" 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    await store.deleteSubCategory(bigCode, midCode, subCode)
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
}
</script>
