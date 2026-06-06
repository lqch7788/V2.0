<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="bg-white rounded-xl p-6 shadow-none">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <el-button circle @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <el-icon :size="24" color="white"><Collection /></el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">作物编码规则</h1>
            <p class="text-gray-500">编码结构：类别(2位) + 类型(2位) + 品种(2位) + 子品种(3位) + 详细品种(2位) = 11位</p>
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
        <li>• 编辑模式下可修改分类名称</li>
        <li>• 点击展开图标查看下级分类</li>
        <li>• 点击"保存修改"前请注意风险提示</li>
      </ul>
    </div>

    <!-- 编码规则说明（查看模式下显示） -->
    <div v-if="!isEditing" class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <button class="flex items-center gap-2 w-full text-left" @click="showCodeRuleInfo = !showCodeRuleInfo">
        <el-icon :size="20" class="text-emerald-600 transition-transform" :class="{ 'rotate-90': showCodeRuleInfo }">
          <ArrowRight />
        </el-icon>
        <h3 class="font-semibold text-emerald-800">编码规则说明</h3>
      </button>
      <div v-if="showCodeRuleInfo" class="grid grid-cols-2 gap-4 text-sm text-emerald-700 mt-3">
        <div>
          <p><strong>编码结构：</strong>类别(2位) + 类型(2位) + 品种(2位) + 子品种(3位) + 详细品种(2位) = 11位</p>
          <p><strong>示例：</strong>FR010100101</p>
          <ul class="ml-4 mt-1 space-y-0.5">
            <li>• FR - 水果类</li>
            <li>• 01 - 浆果类</li>
            <li>• 01 - 草莓</li>
            <li>• 001 - 红颜（子品种）</li>
            <li>• 01 - 大叶红颜（详细品种序号）</li>
          </ul>
          <p class="mt-2 text-xs"><strong>注：</strong>详细品种名称（如"大叶红颜"）由用户在录入时手工输入，系统自动分配2位序号</p>
        </div>
        <div>
          <p><strong>大类代码：</strong></p>
          <ul class="ml-4 mt-1 space-y-0.5">
            <li>• PD - 蔬菜类</li>
            <li>• FR - 水果类</li>
            <li>• GR - 粮食类</li>
            <li>• FL - 花卉类</li>
            <li>• HB - 药材类</li>
            <li>• MG - 食用菌类</li>
            <li>• OT - 其他类</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 分类表格 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-emerald-600">
          <tr>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-16">类别代码</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-28">类别名称</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-16">类型代码</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-28">类型名称</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-16">品种代码</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-24">品种名称</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-16">子品种代码</th>
            <th class="px-2 py-3 text-left text-sm font-semibold text-white w-24">子品种名称</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-300">
          <template v-for="category in categories" :key="'cat-' + category.code">
            <!-- 大类行 -->
            <tr class="bg-gray-50 hover:bg-gray-100">
              <td class="px-2 py-3">
                <div class="flex items-center gap-2">
                  <el-button link @click="toggleCategory(category.code)">
                    <el-icon :size="20">
                      <ArrowDown v-if="expandedCategory.has(category.code)" />
                      <ArrowRight v-else />
                    </el-icon>
                  </el-button>
                  <span class="font-mono font-bold text-blue-600 text-sm">{{ category.code }}</span>
                </div>
              </td>
              <td class="px-2 py-3">
                <template v-if="isEditing">
                  <CategoryEditCell
                    cell-type="category"
                    :category-code="category.code"
                    :current-name="category.name"
                    :editing-cell="editingCell"
                    :edit-value="editValue"
                    @start-edit="startEdit('category', category.code, undefined, undefined, category.name)"
                    @save-edit="saveEdit"
                    @cancel-edit="cancelEdit"
                    @update:edit-value="editValue = $event"
                  />
                </template>
                <template v-else>
                  <div class="flex items-center">
                    <span class="font-semibold text-gray-800 text-sm">{{ category.name }}</span>
                    <span class="text-xs text-gray-400 ml-2">({{ category.nameEn }})</span>
                  </div>
                </template>
              </td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3"></td>
              <td class="px-2 py-3"></td>
            </tr>

            <!-- 类型和品种（已展开的大类） -->
            <template v-if="expandedCategory.has(category.code)">
              <template v-for="type in category.types" :key="'type-' + category.code + '-' + type.code">
                <!-- 类型行 -->
                <tr class="hover:bg-gray-50">
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2">
                    <div class="flex items-center gap-2">
                      <el-button link @click="toggleType(category.code, type.code)">
                        <el-icon :size="16">
                          <ArrowDown v-if="expandedType.has(category.code + '-' + type.code)" />
                          <ArrowRight v-else />
                        </el-icon>
                      </el-button>
                      <span class="font-mono text-blue-600 font-medium text-sm">{{ type.code }}</span>
                    </div>
                  </td>
                  <td class="px-2 py-2">
                    <div class="flex items-center gap-2">
                      <template v-if="isEditing">
                        <CategoryEditCell
                          cell-type="type"
                          :category-code="category.code"
                          :type-code="type.code"
                          :current-name="type.name"
                          :editing-cell="editingCell"
                          :edit-value="editValue"
                          @start-edit="startEdit('type', category.code, type.code, undefined, type.name)"
                          @save-edit="saveEdit"
                          @cancel-edit="cancelEdit"
                          @update:edit-value="editValue = $event"
                        />
                        <el-button link size="small" class="!text-emerald-600" @click="showAddSub = { categoryCode: category.code, typeCode: type.code }">
                          <el-icon :size="12"><Plus /></el-icon> 添加品种
                        </el-button>
                        <el-button link size="small" class="!text-red-500" @click="deleteType(category.code, type.code)">
                          <el-icon :size="12"><Delete /></el-icon>
                        </el-button>
                      </template>
                      <template v-else>
                        <span class="font-medium text-gray-700 text-sm">{{ type.name }}</span>
                      </template>
                    </div>
                  </td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                </tr>

                <!-- 品种行（已展开的类型） -->
                <template v-if="expandedType.has(category.code + '-' + type.code)">
                  <template v-for="sub in type.subCategories" :key="'sub-' + category.code + '-' + type.code + '-' + sub.code">
                    <tr class="hover:bg-blue-50">
                      <td class="px-2 py-1"></td>
                      <td class="px-2 py-1"></td>
                      <td class="px-2 py-1"></td>
                      <td class="px-2 py-1"></td>
                      <td class="px-2 py-1">
                        <div class="flex items-center gap-1">
                          <template v-if="sub.subVarieties && sub.subVarieties.length > 0">
                            <el-button link @click="toggleSub(category.code, type.code, sub.code)">
                              <el-icon :size="12" color="#059669">
                                <ArrowDown v-if="expandedSub.has(category.code + '-' + type.code + '-' + sub.code)" />
                                <ArrowRight v-else />
                              </el-icon>
                            </el-button>
                          </template>
                          <span v-else class="w-4"></span>
                          <span class="font-mono text-blue-600 text-sm">{{ sub.code }}</span>
                        </div>
                      </td>
                      <td class="px-2 py-1">
                        <div class="flex items-center gap-2">
                          <template v-if="isEditing">
                            <CategoryEditCell
                              cell-type="sub"
                              :category-code="category.code"
                              :type-code="type.code"
                              :sub-code="sub.code"
                              :current-name="sub.name"
                              :editing-cell="editingCell"
                              :edit-value="editValue"
                              @start-edit="startEdit('sub', category.code, type.code, sub.code, sub.name)"
                              @save-edit="saveEdit"
                              @cancel-edit="cancelEdit"
                              @update:edit-value="editValue = $event"
                            />
                            <el-button link size="small" class="!text-red-500" @click="deleteSub(category.code, type.code, sub.code)">
                              <el-icon :size="12"><Delete /></el-icon>
                            </el-button>
                          </template>
                          <template v-else>
                            <span class="text-sm text-gray-600">{{ sub.name }}</span>
                          </template>
                        </div>
                      </td>
                      <td class="px-2 py-1"></td>
                      <td class="px-2 py-1"></td>
                    </tr>

                    <!-- 子品种行 -->
                    <template v-if="expandedSub.has(category.code + '-' + type.code + '-' + sub.code) && sub.subVarieties && sub.subVarieties.length > 0">
                      <tr v-for="subVar in sub.subVarieties" :key="'sv-' + category.code + '-' + type.code + '-' + sub.code + '-' + subVar.code" class="hover:bg-green-50">
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1"></td>
                        <td class="px-2 py-1">
                          <div class="flex items-center gap-2 ml-6">
                            <span class="font-mono text-green-600 text-sm">{{ subVar.code }}</span>
                            <template v-if="isEditing">
                              <el-button link size="small" class="!text-red-500" @click="deleteSubVariety1(category.code, type.code, sub.code, subVar.code)">
                                <el-icon :size="12"><Delete /></el-icon>
                              </el-button>
                            </template>
                          </div>
                        </td>
                        <td class="px-2 py-1">
                          <span class="text-sm text-gray-600">{{ subVar.name }}</span>
                        </td>
                      </tr>
                    </template>

                    <!-- 添加子品种按钮行 -->
                    <tr v-if="isEditing && expandedSub.has(category.code + '-' + type.code + '-' + sub.code)" class="bg-green-50 hover:bg-green-100">
                      <td class="px-2 py-1" colspan="6"></td>
                      <td class="px-2 py-1" colspan="2">
                        <el-button link size="small" class="!text-emerald-600" @click="showAddSubVariety1 = { categoryCode: category.code, typeCode: type.code, subCode: sub.code }">
                          <el-icon :size="12"><Plus /></el-icon> 添加子品种
                        </el-button>
                      </td>
                    </tr>

                    <!-- 添加子品种输入行 -->
                    <tr v-if="showAddSubVariety1 && showAddSubVariety1.categoryCode === category.code && showAddSubVariety1.typeCode === type.code && showAddSubVariety1.subCode === sub.code && expandedSub.has(category.code + '-' + type.code + '-' + sub.code)" class="bg-green-50">
                      <td class="px-2 py-2" colspan="6"></td>
                      <td class="px-2 py-2" colspan="2">
                        <div class="flex items-center gap-2">
                          <el-input v-model="newSubVariety1Code" placeholder="代码(3位)" size="small" class="!w-24" maxlength="3" />
                          <el-input v-model="newSubVariety1Name" placeholder="子品种名称" size="small" class="!w-32" />
                          <el-button type="primary" size="small" @click="addSubVariety1(category.code, type.code, sub.code)">添加</el-button>
                          <el-button size="small" @click="showAddSubVariety1 = null; newSubVariety1Code = ''; newSubVariety1Name = ''">取消</el-button>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <!-- 添加品种按钮行 -->
                  <tr v-if="isEditing" class="bg-blue-50 hover:bg-blue-100">
                    <td class="px-2 py-2" colspan="8">
                      <el-button link size="small" class="!text-emerald-600" @click="showAddSub = { categoryCode: category.code, typeCode: type.code }">
                        <el-icon :size="14"><Plus /></el-icon> 添加品种
                      </el-button>
                    </td>
                  </tr>

                  <!-- 添加品种输入行 -->
                  <tr v-if="showAddSub && showAddSub.categoryCode === category.code && showAddSub.typeCode === type.code" class="bg-blue-50">
                    <td class="px-2 py-2" colspan="8">
                      <div class="flex items-center gap-2" style="margin-left: 480px">
                        <el-input v-model="newSubCode" placeholder="品种代码" size="small" class="!w-24" />
                        <el-input v-model="newSubName" placeholder="品种名称" size="small" class="!w-32" />
                        <el-button type="primary" size="small" @click="addSub(category.code, type.code)">添加</el-button>
                        <el-button size="small" @click="showAddSub = null; newSubCode = ''; newSubName = ''">取消</el-button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>

              <!-- 添加类型按钮行 -->
              <tr v-if="isEditing" class="bg-gray-50 hover:bg-gray-100">
                <td class="px-2 py-2"></td>
                <td class="px-2 py-2">
                  <el-button link size="small" class="!text-emerald-600" @click="showAddType = category.code">
                    <el-icon :size="14"><Plus /></el-icon> 添加类型
                  </el-button>
                </td>
                <td class="px-2 py-2" colspan="6"></td>
              </tr>

              <!-- 添加类型输入行 -->
              <tr v-if="showAddType === category.code" class="bg-blue-50">
                <td class="px-2 py-2" colspan="8">
                  <div class="flex items-center gap-2" style="margin-left: 240px">
                    <el-input v-model="newTypeCode" placeholder="类型代码" size="small" class="!w-24" />
                    <el-input v-model="newTypeName" placeholder="类型名称" size="small" class="!w-32" />
                    <el-button type="primary" size="small" @click="addType(category.code)">添加</el-button>
                    <el-button size="small" @click="showAddType = null; newTypeCode = ''; newTypeName = ''">取消</el-button>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>

      <!-- 添加大类按钮 -->
      <div v-if="isEditing" class="p-4 bg-gray-50 border-t border-gray-200">
        <template v-if="showAddCategory">
          <div class="flex items-center gap-4">
            <el-input v-model="newCategoryCode" placeholder="大类代码（2位大写字母）" size="small" class="!w-40" maxlength="2" />
            <el-input v-model="newCategoryName" placeholder="大类名称" size="small" class="!w-40" />
            <el-button type="primary" size="small" @click="addCategory">添加</el-button>
            <el-button size="small" @click="showAddCategory = false; newCategoryCode = ''; newCategoryName = ''">取消</el-button>
          </div>
        </template>
        <template v-else>
          <el-button link class="!text-emerald-600" @click="showAddCategory = true">
            <el-icon :size="20"><Plus /></el-icon> 添加大类
          </el-button>
        </template>
      </div>
    </div>

    <!-- 保存确认弹窗 -->
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
            <span>如果修改后的编码规则与系统中已有的产品编码冲突，可能导致系统无法识别该产品</span>
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
        <el-button type="danger" @click="showSaveConfirm = false; isEditing = false; handleSave()">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowDown, ArrowRight, Plus, Edit, Check, Delete, WarningFilled, Collection } from '@element-plus/icons-vue'
import { useProduceCodeRuleForm as useProduceCodeRule } from './components/ProduceCodeRule/hooks/useProduceCodeRuleForm'
import CategoryEditCell from './components/CategoryEditCell.vue'

const {
  categories, expandedCategory, expandedType, expandedSub,
  isEditing, showSaveConfirm, showCodeRuleInfo,
  editingCell, editValue,
  showAddType, showAddSub, showAddSubVariety1, showAddCategory,
  newTypeCode, newTypeName, newSubCode, newSubName,
  newSubVariety1Code, newSubVariety1Name, newCategoryCode, newCategoryName,
  toggleCategory, toggleType, toggleSub,
  startEdit, saveEdit, cancelEdit,
  addCategory, addType, addSub, addSubVariety1,
  deleteType, deleteSub, deleteSubVariety1,
  handleSave,
} = useProduceCodeRule()
</script>
