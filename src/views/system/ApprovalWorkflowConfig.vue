<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="/settings"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563">
              <ArrowLeft />
            </el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white">
              <Guide />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">审批流程配置</h1>
            <p class="text-gray-500">审批工作流与节点管理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- P0-EX-001 修复：注释掉 V1.1 不存在的独立搜索栏 UI -->
    <!--
      V1.1 ApprovalWorkflowConfig.tsx 没有独立搜索栏 UI（V1.1 只有 searchTerm state 但无可见 UI）。
      V2.0 自创的独立搜索栏 UI（L29-43）属于 P0-EX（自我创造功能）。
      处理方案：注释掉 UI 块，保留 searchTerm state + filteredWorkflows computed
      （V1.1 1:1 兼容）以备后续用户决定是否恢复。
      TODO: 等待用户确认是否完全删除该功能
    -->
    <!--
    <div class="bg-white rounded-xl p-4 shadow-none">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <el-input
          v-model="searchTerm"
          placeholder="搜索流程名称、编码、模块..."
          clearable
          class="w-full sm:w-80"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    -->

    <!-- 加载状态 -->
    <div v-if="store.loading" class="flex items-center justify-center h-64">
      <el-icon class="is-loading" :size="32" color="#059669">
        <Loading />
      </el-icon>
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center h-64">
      <el-icon :size="32" color="#ef4444">
        <Warning />
      </el-icon>
      <span class="ml-2 text-red-600">{{ error }}</span>
    </div>

    <!-- 流程列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="workflow in filteredWorkflows"
        :key="workflow.id"
        class="bg-white rounded-xl shadow-none border border-gray-100 overflow-hidden"
      >
        <div class="p-6">
          <!-- 流程主体信息 -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 rounded-lg">
                <el-icon :size="20" color="#059669">
                  <Guide />
                </el-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ workflow.name }}</h3>
                <p class="text-xs text-gray-500">{{ workflow.code }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="[workflow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600', 'px-3', 'py-1', 'text-xs', 'rounded-full']">
                {{ workflow.status === 'active' ? '启用' : '停用' }}
              </span>
              <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                {{ getModuleLabel(workflow.module) }}
              </span>
              <el-button link size="small" @click="handleToggleStatus(workflow.id)">
                {{ workflow.status === 'active' ? '停用' : '启用' }}
              </el-button>
              <el-button link size="small" @click="editWorkflowAction(workflow)">
                <el-icon :size="16" color="#4b5563"><Edit /></el-icon>
              </el-button>
              <el-button link size="small" @click="handleDeleteWorkflow(workflow.id)">
                <el-icon :size="16" color="#ef4444"><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ workflow.description }}</p>
          <div class="text-xs text-gray-500 mb-3">
            <span class="font-medium">触发条件：</span>{{ workflow.triggerCondition }}
          </div>

          <!-- 展开/收起按钮 -->
          <el-button
            link
            size="small"
            @click="toggleExpand(workflow.id)"
            class="flex items-center gap-2"
          >
            <el-icon :size="16">
              <component :is="expandedWorkflows.includes(workflow.id) ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
            {{ expandedWorkflows.includes(workflow.id) ? '收起节点' : '查看审批节点' }} ({{ workflow.nodes?.length || 0 }})
          </el-button>

          <!-- 审批节点展示 -->
          <div v-if="expandedWorkflows.includes(workflow.id)" class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2 overflow-x-auto">
              <template v-for="(node, index) in workflow.nodes" :key="node.id">
                <div class="px-4 py-3 bg-gray-50 rounded-lg min-w-[160px]">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      {{ index + 1 }}
                    </span>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ node.name }}</p>
                      <p class="text-xs text-gray-500">{{ node.approverRole }}</p>
                    </div>
                  </div>
                  <div class="mt-2 text-xs text-gray-500 space-y-1">
                    <p>超时：{{ node.timeoutHours }}小时</p>
                    <p>{{ node.autoApproveOnTimeout ? '自动通过' : '超时待审' }}</p>
                    <p>{{ node.requireComment ? '必须填写意见' : '可选意见' }}</p>
                  </div>
                </div>
                <el-icon v-if="index < (workflow.nodes?.length || 0) - 1" :size="20" color="#9ca3af" class="flex-shrink-0">
                  <ArrowRight />
                </el-icon>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="showModal"
      :title="editingWorkflow ? '编辑审批流程' : '新增审批流程'"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">流程名称</label>
            <el-input v-model="newWorkflow.name" placeholder="请输入流程名称" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">流程代码</label>
            <el-input v-model="newWorkflow.code" placeholder="请输入流程代码" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <el-input
            v-model="newWorkflow.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">所属模块</label>
            <el-select v-model="newWorkflow.module" placeholder="请选择模块" class="w-full">
              <el-option label="请选择模块" value="" />
              <el-option
                v-for="opt in MODULE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">触发条件</label>
            <el-input v-model="newWorkflow.triggerCondition" placeholder="请输入触发条件" />
          </div>
        </div>

        <!-- 审批节点配置 -->
        <div class="pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-semibold text-gray-900">审批节点</h4>
            <el-button type="primary" size="small" @click="addNode">
              <el-icon :size="14"><Plus /></el-icon> 添加节点
            </el-button>
          </div>
          <div class="space-y-3">
            <div
              v-for="(node, index) in newWorkflow.nodes"
              :key="node.id"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    {{ index + 1 }}
                  </span>
                  <span class="text-sm font-medium text-gray-900">节点 {{ index + 1 }}</span>
                </div>
                <el-button link type="danger" size="small" @click="removeNode(node.id)">
                  <el-icon :size="16" color="#ef4444"><Delete /></el-icon>
                </el-button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">节点名称</label>
                  <el-input v-model="node.name" size="small" placeholder="请输入节点名称" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">审批角色</label>
                  <el-input v-model="node.approverRole" size="small" placeholder="请输入审批角色" />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">超时时间（小时）</label>
                  <el-input-number
                    v-model="node.timeoutHours"
                    :min="1"
                    :max="999"
                    size="small"
                    controls-position="right"
                  />
                </div>
                <div class="space-y-2">
                  <el-checkbox v-model="node.autoApproveOnTimeout" label="超时自动通过" />
                  <br />
                  <el-checkbox v-model="node.requireComment" label="必须填写意见" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="handleSaveWorkflow">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Guide,
  ArrowLeft,
  Search,
  Edit,
  Delete,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Loading,
  Warning
} from '@element-plus/icons-vue'
import { useApprovalWorkflowStore } from '@/stores/modules/approvalWorkflow'

// ========== Store ==========
const store = useApprovalWorkflowStore()
const error = computed(() => store.error)

// 模块选项 - 与V1.1保持一致
const MODULE_OPTIONS = [
  { value: 'production', label: '生产管理' },
  { value: 'materials', label: '物料管理' },
  { value: 'hr', label: '人事管理' },
  { value: 'tech', label: '技术方案' },
  { value: 'purchase', label: '采购管理' },
  { value: 'finance', label: '财务管理' },
]

// 获取模块标签
const getModuleLabel = (moduleValue) => {
  return MODULE_OPTIONS.find(m => m.value === moduleValue)?.label || moduleValue
}

// 状态 - 使用Store的状态
const searchTerm = ref('')
const showModal = ref(false)
const editingWorkflow = ref(null)
const expandedWorkflows = ref([])

// 新建/编辑工作流数据
const newWorkflow = reactive({
  name: '',
  code: '',
  description: '',
  module: '',
  triggerCondition: '',
  nodes: [],
  status: 'active'
})

// 筛选后的工作流
const filteredWorkflows = computed(() => {
  if (!searchTerm.value) return store.workflows
  const term = searchTerm.value.toLowerCase()
  return store.workflows.filter(w =>
    w.name.toLowerCase().includes(term) ||
    w.code.toLowerCase().includes(term) ||
    w.module.toLowerCase().includes(term)
  )
})

// 加载工作流数据 - 调用Store方法
const loadWorkflows = async () => {
  await store.loadWorkflows()
}

// 切换展开状态
const toggleExpand = (id) => {
  const index = expandedWorkflows.value.indexOf(id)
  if (index > -1) {
    expandedWorkflows.value.splice(index, 1)
  } else {
    expandedWorkflows.value.push(id)
  }
}

// 打开编辑弹窗
const editWorkflowAction = (workflow) => {
  editingWorkflow.value = workflow
  Object.assign(newWorkflow, {
    name: workflow.name,
    code: workflow.code,
    description: workflow.description || '',
    module: workflow.module || '',
    triggerCondition: workflow.triggerCondition || '',
    nodes: JSON.parse(JSON.stringify(workflow.nodes || [])),
    status: workflow.status || 'active'
  })
  showModal.value = true
}

// 添加节点
const addNode = () => {
  const newNode = {
    id: `n${Date.now()}`,
    name: '',
    approverRole: '',
    timeoutHours: 24,
    autoApproveOnTimeout: false,
    requireComment: true
  }
  newWorkflow.nodes.push(newNode)
}

// 更新节点
const updateNode = (nodeId, updates) => {
  const node = newWorkflow.nodes.find(n => n.id === nodeId)
  if (node) {
    Object.assign(node, updates)
  }
}

// 移除节点
const removeNode = (nodeId) => {
  const index = newWorkflow.nodes.findIndex(n => n.id === nodeId)
  if (index > -1) {
    newWorkflow.nodes.splice(index, 1)
  }
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  editingWorkflow.value = null
  Object.assign(newWorkflow, {
    name: '',
    code: '',
    description: '',
    module: '',
    triggerCondition: '',
    nodes: [],
    status: 'active'
  })
}

// 保存工作流
const handleSaveWorkflow = async () => {
  try {
    // 表单验证
    if (!newWorkflow.name) {
      ElMessage.warning('请输入流程名称')
      return
    }
    if (!newWorkflow.code) {
      ElMessage.warning('请输入流程代码')
      return
    }

    const payload = {
      name: newWorkflow.name,
      code: newWorkflow.code,
      description: newWorkflow.description || '',
      module: newWorkflow.module || '',
      triggerCondition: newWorkflow.triggerCondition || '',
      nodes: newWorkflow.nodes || [],
      status: newWorkflow.status || 'active'
    }

    if (editingWorkflow.value) {
      // 编辑模式 - 调用Store
      await store.editWorkflow(editingWorkflow.value.id, payload)
    } else {
      // 新增模式 - 调用Store
      await store.addWorkflow(payload)
    }

    closeModal()
  } catch (err) {
    console.error('保存审批工作流失败:', err)
    ElMessage.error('保存审批工作流失败')
  }
}

// 删除工作流
const handleDeleteWorkflow = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该审批流程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.removeWorkflow(id)
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除审批工作流失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 切换状态
const handleToggleStatus = async (id) => {
  try {
    await store.toggleWorkflowStatus(id)
  } catch (err) {
    console.error('切换审批工作流状态失败:', err)
    ElMessage.error('切换状态失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadWorkflows()
})
</script>

<style scoped>
/* 弹窗头部渐变 - 与V1.1保持一致: 3-stop emerald渐变 */
:deep(.el-dialog__header) {
  background: linear-gradient(to right, #10b981, #059669, #10b981);
  border-radius: 8px 8px 0 0;
  margin: 0;
  padding: 16px 20px;
}
:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
/* 主按钮改为emerald绿色 - 与V1.1保持一致 */
:deep(.el-button--primary) {
  --el-button-bg-color: #059669;
  --el-button-border-color: #059669;
  --el-button-hover-bg-color: #047857;
  --el-button-hover-border-color: #047857;
}
</style>
