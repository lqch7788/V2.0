<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            href="javascript:void(0)"
            @click="router.push('/settings')"
            class="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-colors"
            title="返回系统设置"
          >
            <el-icon :size="20" color="#4b5563"><ArrowLeft /></el-icon>
          </a>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <el-icon :size="24" color="white"><Warning /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">病虫害字典</h1>
            <p class="text-gray-500">管理虫害和病害的基础数据</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="bg-white rounded-xl shadow-none border border-gray-100">
      <div class="border-b border-gray-100">
        <div class="flex">
          <button
            @click="activeTab = 'pest'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'pest'
                ? 'border-green-500 text-green-600 bg-green-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            <el-icon class="mr-1"><Warning /></el-icon>
            虫害 ({{ pestDiseaseStore.stats.pestCount }})
          </button>
          <button
            @click="activeTab = 'disease'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'disease'
                ? 'border-green-500 text-green-600 bg-green-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            <el-icon class="mr-1"><Warning /></el-icon>
            病害 ({{ pestDiseaseStore.stats.diseaseCount }})
          </button>
        </div>
      </div>

      <!-- 顶部操作栏 -->
      <div class="px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-100 flex-wrap">
        <div class="flex items-center gap-3 flex-1 flex-wrap">
          <!-- 搜索框 -->
          <div class="relative w-64">
            <el-icon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Search /></el-icon>
            <el-input
              type="text"
              v-model="pestDiseaseStore.searchKeyword"
              placeholder="搜索病虫害名称或编码..."
              class="pl-9"
              @keyup.enter="handleSearch"
            />
          </div>
          <!-- 适用作物 -->
          <el-input
            v-model="pestDiseaseStore.filters.targetCrops"
            placeholder="适用作物"
            class="w-40"
          />
          <!-- 状态 -->
          <el-select v-model="pestDiseaseStore.filters.status" placeholder="状态" class="w-28">
            <!-- 修复 P1-8: label 改为"全部"避免与 placeholder 重复 -->
            <el-option label="全部" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon class="mr-1"><Plus /></el-icon>
          新增{{ activeTab === 'pest' ? '虫害' : '病害' }}
        </el-button>
      </div>

      <!-- 错误提示 -->
      <div v-if="pestDiseaseStore.error" class="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        {{ pestDiseaseStore.error }}
      </div>

      <!-- 表格 -->
      <div class="p-4">
        <el-table
          :data="paginatedItems"
          v-loading="pestDiseaseStore.loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="dictCode" label="编码" width="150">
            <!-- 修复 P1-3: 编码列蓝色 mono 字体（V1.1 PestDiseaseDictTable.tsx L93 风格） -->
            <template #default="{ row }">
              <span class="font-mono text-blue-600">{{ row.dictCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="dictName" label="名称" min-width="150" />
          <el-table-column prop="dictType" label="类型" width="100">
            <template #default="{ row }">
              <span :class="row.dictType === 'pest' ? 'bg-orange-100 text-orange-700 inline-flex px-2 py-0.5 rounded-full text-xs font-medium' : 'bg-purple-100 text-purple-700 inline-flex px-2 py-0.5 rounded-full text-xs font-medium'">
                {{ row.dictType === 'pest' ? '虫害' : '病害' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="targetCrops" label="适用作物" width="150" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-1">
                <!-- 修复 P1-5: 操作列加 title tooltip（V1.1 PestDiseaseDictTable.tsx 风格） -->
                <el-button text size="small" @click="handleDetail(row)" class="action-btn edit-btn" title="查看详情">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleEdit(row)" class="action-btn edit-btn" title="编辑">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button text size="small" @click="handleDelete(row)" class="action-btn delete-btn" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 修复 P1-2: 表格分页（V1.1 PestDiseaseDictTable.tsx L152 风格） -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-end">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="pestDiseaseStore.filteredItems.length"
            layout="prev, pager, next, sizes, total"
            :page-sizes="[10, 20, 50]"
            background
            @current-change="() => {}"
          />
        </div>
      </div>
    </div>

    <!-- 新增弹窗 (V1.1 AddPestDiseaseModal 风格) -->
    <el-dialog
      v-model="addDialogVisible"
      :title="`新增${activeTab === 'pest' ? '虫害' : '病害'}字典`"
      width="1100px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4 max-h-[70vh] overflow-y-auto">
        <div class="border-b pb-4">
          <h3 class="text-sm font-bold text-gray-900 mb-3">📋 基础信息</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">编码</label>
              <el-input v-model="formData.dictCode" placeholder="自动生成" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                名称 <span class="text-red-500">*</span>
              </label>
              <el-input v-model="formData.dictName" placeholder="请输入名称" />
            </div>
          </div>
        </div>
        <div class="border-b pb-4">
          <h3 class="text-sm font-bold text-gray-900 mb-3">📝 详细信息</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">适用作物</label>
            <el-input v-model="formData.targetCrops" placeholder="请输入适用作物，多个用逗号分隔" />
          </div>
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入描述" resize="none" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 mb-3">💊 关联药剂</h3>
          <p class="text-xs text-gray-500 mb-3">选择能治疗该病虫害的药剂</p>
          <div class="mb-3">
            <el-input v-model="pesticideSearch" placeholder="搜索药剂名称、编码或功能..." clearable class="w-full" />
          </div>
          <div class="flex gap-2 mb-4">
            <button type="button" @click="pesticideTypeFilter = 'all'" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all', pesticideTypeFilter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50']">全部</button>
            <button type="button" @click="pesticideTypeFilter = 'chemical'" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all', pesticideTypeFilter === 'chemical' ? 'bg-red-500 text-white shadow-md' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100']">🧪 化学</button>
            <button type="button" @click="pesticideTypeFilter = 'bio'" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all', pesticideTypeFilter === 'bio' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100']">🌿 生物</button>
            <button type="button" @click="pesticideTypeFilter = 'physical'" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all', pesticideTypeFilter === 'physical' ? 'bg-blue-500 text-white shadow-md' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100']">🔧 物理</button>
          </div>
          <div v-if="selectedPesticideIds.length > 0" class="mb-3 p-6 bg-green-100 rounded-lg border border-green-200">
            <div class="text-xs font-semibold text-green-700 mb-2">已选药剂 ({{ selectedPesticideIds.length }})</div>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="pid in selectedPesticideIds" :key="pid" closable @close="togglePesticide(pid)" type="success" size="small">
                {{ getPesticideName(pid) }}
              </el-tag>
            </div>
          </div>
          <div class="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            <div v-if="filteredPesticides.length === 0" class="text-center text-gray-400 py-4 text-sm">无匹配药剂</div>
            <div v-for="pesticide in filteredPesticides" :key="pesticide.id" @click="togglePesticide(pesticide.id)" :class="['px-3 py-2 rounded-lg text-sm cursor-pointer mb-1 transition-all', selectedPesticideIds.includes(pesticide.id) ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-white border border-gray-200 hover:bg-gray-50']">
              <div class="font-medium">{{ pesticide.pesticideName }}</div>
              <!-- 修复 P1-4: 删除 functionDesc 显示 -->
              <div class="text-xs text-gray-500">{{ pesticide.pesticideCode }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="pestDiseaseStore.saveLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 (V1.1 EditPestDiseaseModal 风格 - 类型 readonly) -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑${formData.dictType === 'pest' ? '虫害' : '病害'}字典 - ${formData.dictCode}`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4 max-h-[60vh] overflow-y-auto">
        <div class="border-b pb-4">
          <h3 class="text-sm font-bold text-gray-900 mb-3">📋 基础信息</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">编码</label>
              <el-input v-model="formData.dictCode" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                名称 <span class="text-red-500">*</span>
              </label>
              <el-input v-model="formData.dictName" placeholder="请输入名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
              <!-- V1.1 风格：编辑时类型 readonly + 颜色徽章 -->
              <span :class="formData.dictType === 'pest' ? 'bg-orange-100 text-orange-700 inline-flex px-3 py-1 rounded-full text-sm font-medium' : 'bg-purple-100 text-purple-700 inline-flex px-3 py-1 rounded-full text-sm font-medium'">
                {{ formData.dictType === 'pest' ? '虫害' : '病害' }}
              </span>
            </div>
          </div>
        </div>
        <div class="border-b pb-4">
          <h3 class="text-sm font-bold text-gray-900 mb-3">📝 详细信息</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">适用作物</label>
            <el-input v-model="formData.targetCrops" placeholder="请输入适用作物，多个用逗号分隔" />
          </div>
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入描述" />
          </div>
        </div>

        <!-- 关联药剂 -->
        <div>
          <h3 class="text-sm font-bold text-gray-900 mb-3">💊 关联药剂</h3>
          <p class="text-xs text-gray-500 mb-3">选择能治疗该病虫害的药剂</p>

          <!-- 药剂搜索和筛选 -->
          <div class="mb-3">
            <el-input
              v-model="pesticideSearch"
              placeholder="搜索药剂名称、编码或功能..."
              clearable
              class="w-full"
            />
          </div>
          <div class="flex gap-2 mb-4">
            <button
              type="button"
              @click="pesticideTypeFilter = 'all'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pesticideTypeFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              ]"
            >
              全部
            </button>
            <button
              type="button"
              @click="pesticideTypeFilter = 'chemical'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pesticideTypeFilter === 'chemical'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              ]"
            >
              🧪 化学
            </button>
            <button
              type="button"
              @click="pesticideTypeFilter = 'bio'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pesticideTypeFilter === 'bio'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600 border border-green-200 hover:bg-green-100'
              ]"
            >
              🌿 生物
            </button>
            <button
              type="button"
              @click="pesticideTypeFilter = 'physical'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pesticideTypeFilter === 'physical'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
              ]"
            >
              🔧 物理
            </button>
          </div>

          <!-- 已选药剂列表 -->
          <div v-if="selectedPesticideIds.length > 0" class="mb-3 p-6 bg-green-100 rounded-lg border border-green-200">
            <div class="text-xs font-semibold text-green-700 mb-2">已选药剂 ({{ selectedPesticideIds.length }})</div>
            <div class="flex flex-wrap gap-2">
              <el-tag
                v-for="pid in selectedPesticideIds"
                :key="pid"
                closable
                @close="togglePesticide(pid)"
                type="success"
                size="small"
              >
                {{ getPesticideName(pid) }}
              </el-tag>
            </div>
          </div>

          <!-- 可选药剂列表 -->
          <div class="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            <div v-if="filteredPesticides.length === 0" class="text-center text-gray-400 py-4 text-sm">
              无匹配药剂
            </div>
            <div
              v-for="pesticide in filteredPesticides"
              :key="pesticide.id"
              @click="togglePesticide(pesticide.id)"
              :class="[
                'px-3 py-2 rounded-lg text-sm cursor-pointer mb-1 transition-all',
                selectedPesticideIds.includes(pesticide.id)
                  ? 'bg-green-100 border border-green-300 text-green-700'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              ]"
            >
              <div class="font-medium">{{ pesticide.pesticideName }}</div>
              <!-- 修复 P1-4: 删除 functionDesc 显示（V1.1 AddPestDiseaseModal.tsx L294-296 只显示名称+编码） -->
              <div class="text-xs text-gray-500">{{ pesticide.pesticideCode }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <!-- 修复 P0-2: dialogVisible 在 V2.0 不存在，正确引用应为 editDialogVisible -->
        <el-button @click="editDialogVisible = false">取消</el-button>
        <!-- 修复 P1-10: 编辑弹窗用 warning 样式 + "保存修改" 文案（V1.1 EditPestDiseaseModal.tsx L323 风格） -->
        <el-button type="warning" @click="handleSave" :loading="pestDiseaseStore.saveLoading">保存修改</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="病虫害详情"
      width="700px"
    >
      <div class="space-y-3" v-if="currentRecord">
        <!-- V1.1 风格：dictCode 渐变头部 -->
        <div class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-lg p-4 mb-4">
          <div class="text-xs text-orange-600 font-medium">编码</div>
          <div class="text-xl font-mono font-bold text-orange-700 mt-1">{{ currentRecord.dictCode }}</div>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">名称：</span>
          <span class="text-gray-900 font-bold">{{ currentRecord.dictName }}</span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">类型：</span>
          <span :class="currentRecord.dictType === 'pest' ? 'bg-orange-100 text-orange-700 inline-flex px-2 py-0.5 rounded-full text-xs font-medium' : 'bg-purple-100 text-purple-700 inline-flex px-2 py-0.5 rounded-full text-xs font-medium'">
            {{ currentRecord.dictType === 'pest' ? '虫害' : '病害' }}
          </span>
        </div>
        <div class="flex border-b border-gray-100 py-2">
          <span class="text-gray-500 w-24">适用作物：</span>
          <span class="text-gray-900">{{ currentRecord.targetCrops || '-' }}</span>
        </div>
        <div class="py-2">
          <span class="text-gray-500 w-24">描述：</span>
          <span class="text-gray-900">{{ currentRecord.description || '-' }}</span>
        </div>
        <!-- 修复 P1-1: 详情页补 createTime/updateTime 字段（V1.1 PestDiseaseDetailModal.tsx L101-102 风格） -->
        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <span class="text-gray-500 w-24 text-sm">创建时间：</span>
            <!-- 修复 P1-2: 用 toLocaleString() 本地化时间显示 -->
            <span class="text-gray-900 text-xs font-mono">{{ currentRecord.createTime ? new Date(currentRecord.createTime).toLocaleString() : '-' }}</span>
          </div>
          <div>
            <span class="text-gray-500 w-24 text-sm">状态：</span>
            <span :class="currentRecord.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'" class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium">
              {{ currentRecord.status === 'active' ? '启用' : '禁用' }}
            </span>
          </div>
        </div>
        <!-- 关联药剂 - V1.1 风格：列表式 + 三色 Badge -->
        <div class="mt-4 pt-4 border-t border-gray-200" v-if="currentRecord.relatedPesticides && currentRecord.relatedPesticides.length > 0">
          <h4 class="text-sm font-bold text-gray-900 mb-2">关联药剂 ({{ currentRecord.relatedPesticides.length }})</h4>
          <div class="space-y-2">
            <div
              v-for="pest in currentRecord.relatedPesticides"
              :key="pest.id"
              class="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <span class="font-mono text-sm text-blue-600">{{ pest.pesticideCode || pest.code }}</span>
              <span class="text-gray-900 font-medium">{{ pest.pesticideName || pest.name }}</span>
              <!-- 修复 P0-6 + 兼容 P2-6: 'biological' 视为 'bio' 别名 -->
              <span
                :class="[
                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                  pest.controlType === 'chemical' ? 'bg-red-100 text-red-700' :
                  (pest.controlType === 'bio' || pest.controlType === 'biological') ? 'bg-green-100 text-green-700' :
                  pest.controlType === 'physical' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ pest.controlType === 'chemical' ? '化学防治' :
                   (pest.controlType === 'bio' || pest.controlType === 'biological') ? '生物防治' :
                   pest.controlType === 'physical' ? '物理防治' : '未分类' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning,
  Plus,
  Search,
  Edit,
  Delete,
  View,
  ArrowLeft
} from '@element-plus/icons-vue'
import { usePestDiseaseDictStore } from '@/stores/modules/pestDiseaseDict'
import { usePesticideLibraryStore } from '@/stores/modules/pesticideLibrary'

// 修复共性 P0-2: 使用 Vue Router 替代 <a href>
const router = useRouter()

// 使用 Store
const pestDiseaseStore = usePestDiseaseDictStore()
const pesticideStore = usePesticideLibraryStore()

// Tab 类型
const TabType = {
  PEST: 'pest',
  DISEASE: 'disease'
}

// 本地状态
const activeTab = ref(TabType.PEST)
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref(null)
// 修复 P1-2: 分页状态
const currentPage = ref(1)
const pageSize = ref(20)

// 新增/编辑表单
const formData = reactive({
  id: '',
  dictCode: '',
  dictName: '',
  dictType: 'pest',
  targetCrops: '',
  description: '',
  status: 'active'
})

// 关联药剂相关状态
const selectedPesticideIds = ref([]) // 选中的药剂ID列表
const pesticideSearch = ref('') // 药剂搜索关键词
const pesticideTypeFilter = ref('all') // 药剂类型筛选

// 过滤后的药剂列表
const filteredPesticides = computed(() => {
  let list = pesticideStore.items || []
  if (pesticideSearch.value) {
    const kw = pesticideSearch.value.toLowerCase()
    // 修复 P1-3: 增加 ingredient 成分搜索（V1.1 AddPestDiseaseModal.tsx L83-93 风格）
    list = list.filter(p =>
      (p.pesticideName && p.pesticideName.toLowerCase().includes(kw)) ||
      (p.pesticideCode && p.pesticideCode.toLowerCase().includes(kw)) ||
      (p.functionDesc && p.functionDesc.toLowerCase().includes(kw)) ||
      (p.ingredient && p.ingredient.toLowerCase().includes(kw))
    )
  }
  if (pesticideTypeFilter.value !== 'all') {
    list = list.filter(p => p.controlType === pesticideTypeFilter.value)
  }
  return list
})

// 切换药剂选中状态
const togglePesticide = (pesticideId) => {
  const idx = selectedPesticideIds.value.indexOf(pesticideId)
  if (idx >= 0) {
    selectedPesticideIds.value.splice(idx, 1)
  } else {
    selectedPesticideIds.value.push(pesticideId)
  }
}

// 获取药剂名称
const getPesticideName = (pesticideId) => {
  const pesticide = pesticideStore.items.find(p => p.id === pesticideId)
  return pesticide ? pesticide.pesticideName : pesticideId
}

// 修复 P1-2: 表格分页（基于 store.filteredItems 切片）
const paginatedItems = computed(() => {
  const items = pestDiseaseStore.filteredItems || []
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return items.slice(start, end)
})

// 监听 Tab 切换，同步到 Store 并重新加载数据
watch(activeTab, (newTab) => {
  pestDiseaseStore.activeTab = newTab
  formData.dictType = newTab
  // 修复 P1-2: 切换 Tab 时重置分页
  currentPage.value = 1
  pestDiseaseStore.loadData()
})

// 方法
const handleSearch = () => {
  pestDiseaseStore.loadData()
}

const handleReset = () => {
  pestDiseaseStore.searchKeyword = ''
  pestDiseaseStore.filters.targetCrops = ''
  pestDiseaseStore.filters.status = ''
  // 修复 P1-5: 重置分页
  currentPage.value = 1
}

const handleAdd = async () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    dictCode: '',
    dictName: '',
    dictType: activeTab.value,
    targetCrops: '',
    description: '',
    status: 'active'
  })
  selectedPesticideIds.value = []
  pesticideSearch.value = ''
  pesticideTypeFilter.value = 'all'

  // 自动获取下一个编码
  try {
    const nextCode = await pestDiseaseStore.fetchNextCode(activeTab.value)
    formData.dictCode = nextCode
  } catch (e) {
    // 获取失败时留空，用户可手动填写
  }

  // 加载药剂列表
  await pesticideStore.fetchItems()

  addDialogVisible.value = true
}

const handleDetail = async (record) => {
  // 修复 P0-7/P1-6: 详情打开时调 fetchRelatedPesticides 加载关联药剂
  currentRecord.value = record
  detailVisible.value = true
  try {
    const relatedPesticides = await pestDiseaseStore.fetchRelatedPesticides(record.id)
    currentRecord.value = { ...record, relatedPesticides }
  } catch (e) {
    console.error('[PestDiseaseDictPage] 加载关联药剂失败:', e)
    currentRecord.value = { ...record, relatedPesticides: [] }
  }
}

const handleEdit = async (record) => {
  isEdit.value = true
  Object.assign(formData, { ...record })
  selectedPesticideIds.value = []
  pesticideSearch.value = ''
  pesticideTypeFilter.value = 'all'

  // 加载药剂列表
  await pesticideStore.fetchItems()

  // 修复 P0-1/8: 用 pestDiseaseStore.fetchRelatedPesticides 取代字符串推断
  // 旧逻辑从 pesticide.targetPests 文本反推关联（不可靠）
  // 新逻辑直接调 GET /pest-disease-dict/:id/relations 拿权威数据
  try {
    const relatedPesticides = await pestDiseaseStore.fetchRelatedPesticides(record.id)
    selectedPesticideIds.value = relatedPesticides.map(p => p.id)
  } catch (e) {
    console.error('[PestDiseaseDictPage] 加载关联药剂失败:', e)
    selectedPesticideIds.value = []
  }

  editDialogVisible.value = true
}

const handleDelete = async (record) => {
  try {
    await ElMessageBox.confirm(
      `确定删除该病虫害吗？\n\n删除后，被引用的信息将无法完整显示。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await pestDiseaseStore.deleteItem(record.id)
    ElMessage.success('删除成功')
    // 刷新列表
    await pestDiseaseStore.loadData()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err instanceof Error ? err.message : '删除失败')
    }
  }
}

const handleSave = async () => {
  if (!formData.dictName) {
    ElMessage.error('请填写名称')
    return
  }

  try {
    let savedItem = null
    if (isEdit.value) {
      await pestDiseaseStore.updateItem(formData.id, formData)
      ElMessage.success('保存成功')
    } else {
      savedItem = await pestDiseaseStore.createItem(formData)
      ElMessage.success('新增成功')
    }

    // 修复 P0-8: 在病虫害侧用 pestDiseaseStore.updateRelations 一次性差集同步
    // 旧逻辑在药剂侧循环 N 次 updateRelations（颠倒方向，不删除旧关联）
    // 新逻辑在病虫害侧调 PUT/POST/DELETE 差集（V1.1 风格）
    const pestId = savedItem ? savedItem.id : formData.id
    if (pestId) {
      await pestDiseaseStore.updateRelations(pestId, [...selectedPesticideIds.value])
    }

    addDialogVisible.value = false
    editDialogVisible.value = false
    // 刷新列表
    await pestDiseaseStore.loadData()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

// 初始化
onMounted(() => {
  pestDiseaseStore.loadData()
})
</script>

<style scoped>
/* 操作按钮样式 - 蓝色编辑/红色删除无边框图标 */
.action-btn {
  background-color: transparent !important;
  border: none !important;
  width: 24px;
  height: 24px;
  padding: 0;
}
.edit-btn {
  color: #3b82f6;
}
.edit-btn:hover {
  background-color: #dbeafe !important;
  color: #1d4ed8 !important;
}
.delete-btn {
  color: #ef4444;
}
.delete-btn:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}
</style>
