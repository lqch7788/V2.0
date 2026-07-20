<template>
  <!-- 对齐 V1.1 UnifiedModal + el-dialog 拖拽/最大化/调整大小 -->
  <el-dialog
    :model-value="visible"
    title="每日记录"
    width="900px"
    top="5vh"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="false"
    class="print-label-modal seedling-dialog"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @update:model-value="onModelValueChange"
    @close="handleClose"
  >
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 px-6 py-3 flex items-center justify-between rounded-t-xl cursor-move">
        <div class="flex items-center gap-3">
          <el-icon :size="20" style="color: white;"><Calendar /></el-icon>
          <h3 class="text-lg font-semibold text-white">每日记录 - {{ record?.seedlingCode }}</h3>
        </div>
        <button type="button" class="text-white hover:bg-emerald-700 rounded p-1 transition-colors" aria-label="关闭" @click="handleClose">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </template>

      <!-- 2026-07-18 P0-MD-027：只读模式横幅（已结束的记录） -->
      <div v-if="readOnly" class="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
        <el-icon :size="16" class="text-amber-600"><Lock /></el-icon>
        <span class="text-sm text-amber-700">该育苗已结束，每日记录处于<strong>只读模式</strong>（可查看、导出）</span>
      </div>

      <!-- 内容区域 -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
        <div class="space-y-6">
          <!-- 添加新记录（只读模式下隐藏） -->
          <div v-if="!readOnly" class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">添加新记录</h4>
            <!-- 3列布局，与V1.1保持一致 -->
            <div class="grid grid-cols-3 gap-4">
              <!-- 第一行：记录日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">记录日期</label>
                <el-date-picker
                  v-model="formData.recordDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </div>
              <!-- 第一行：温度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">温度（℃）</label>
                <el-input-number v-model="formData.temperature" :min="0" :step="0.1" class="w-full" placeholder="如：25" />
              </div>
              <!-- 第一行：湿度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">湿度（%）</label>
                <el-input-number v-model="formData.humidity" :min="0" :step="0.1" class="w-full" placeholder="如：60" />
              </div>
              <!-- 第一行：操作人员（V1.1 第1行：日期+人员+异常，对齐 P0-MD-004）-->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
                <el-select v-model="formData.operator" placeholder="请选择操作人员" clearable class="w-full">
                  <el-option
                    v-for="op in operatorOptions"
                    :key="op.value"
                    :label="op.label"
                    :value="op.value"
                  />
                </el-select>
              </div>
              <!-- 第二行：pH值 -->
              <!-- 第二行：pH值 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">pH值</label>
                <el-input-number v-model="formData.phValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：6.5" />
              </div>
              <!-- 第二行：EC值 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">EC值（mS/cm）</label>
                <el-input-number v-model="formData.ecValue" :min="0" :step="0.1" :precision="1" class="w-full" placeholder="如：2.0" />
              </div>
              <!-- 第二行：异常情况（V1.1 第1行：日期+人员+异常） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">异常情况</label>
                <el-input v-model="formData.abnormality" placeholder="无异常请留空" />
              </div>
              <!-- 2026-07-20 P0-MD-007：浇水字段（V1.1 行为：填了方式/量就算浇了，watering 字段自动联动） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  浇水方式
                  <span v-if="formData.wateringMethod || formData.wateringAmount != null" class="text-xs text-cyan-600 ml-1">（已自动标记浇水）</span>
                </label>
                <el-select v-model="formData.wateringMethod" placeholder="请选择浇水方式（可选）" clearable class="w-full" @change="autoSetWatering">
                  <el-option v-for="(label, key) in WATERING_METHOD_MAP" :key="key" :label="label" :value="key" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">浇水量</label>
                <div class="flex gap-2">
                  <el-input-number v-model="formData.wateringAmount" :min="0" :step="0.1" :precision="1" class="flex-1" placeholder="如：5（可选）" @change="autoSetWatering" />
                  <el-select v-model="formData.wateringUnit" placeholder="单位" clearable class="!w-24">
                    <el-option v-for="(label, key) in WATERING_UNIT_MAP" :key="key" :label="label" :value="key" />
                  </el-select>
                </div>
              </div>
              <!-- 第三行：成活变化 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">成活变化</label>
                <el-input-number v-model="formData.survivalCountChange" class="w-full" placeholder="正数增加，负数减少" />
              </div>
              <!-- 第三行：定植变化 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">定植变化</label>
                <el-input-number v-model="formData.plantedCountChange" class="w-full" placeholder="正数增加，负数减少" />
              </div>
              <!-- 第三行：损耗数量 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">损耗数量</label>
                <el-input-number v-model="formData.lossCountChange" class="w-full" placeholder="正数增加" />
              </div>
              <!-- 2026-07-18 P0-DIFF-003：补苗变化（V1.1 2026-06-16 新增） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">补苗数量</label>
                <el-input-number v-model="formData.replantChange" class="w-full" placeholder="正数增加" />
              </div>
              <!-- 2026-07-18 P0-DIFF-003：1:多 模式专属（匍匐茎增加） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">匍匐茎增加（1:多）</label>
                <el-input-number v-model="formData.runnerIncreaseCount" class="w-full" placeholder="1:多模式专属" />
              </div>
              <!-- 第四行：操作人员（占2列） -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">操作人员</label>
                <el-select v-model="formData.operator" placeholder="请选择操作人员" clearable class="w-full">
                  <el-option label="张三" value="zhangsan" />
                  <el-option label="李四" value="lisi" />
                  <el-option label="王五" value="wangwu" />
                </el-select>
              </div>
              <!-- 第四行：异常情况 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">异常情况</label>
                <el-input v-model="formData.abnormality" placeholder="无异常请留空" />
              </div>
              <!-- 备注（单独一行，占3列） -->
              <div class="col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
              </div>

              <!-- 2026-07-18 P0-MD-023：施肥折叠面板（动态列表，1:N 嵌套） -->
              <details
                class="col-span-3 border border-emerald-100 rounded-lg bg-emerald-50/20 overflow-hidden"
                :open="(formData.fertilizerRecords?.length || 0) > 0"
              >
                <summary class="cursor-pointer select-none px-3 py-2 bg-emerald-50/50 hover:bg-emerald-50 text-sm font-semibold text-emerald-800 flex items-center justify-between">
                  <span>▼ 施肥（{{ formData.fertilizerRecords?.length || 0 }} 种）</span>
                  <button
                    type="button"
                    @click.prevent="handleAddFertilizer"
                    class="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    + 添加
                  </button>
                </summary>
                <div class="p-3 space-y-2">
                  <div v-if="(formData.fertilizerRecords?.length || 0) === 0" class="text-center py-3 text-xs text-gray-500">
                    暂无施肥记录 — 点击「+ 添加」记录
                  </div>
                  <FeedRecordCard
                    v-for="(rec, idx) in formData.fertilizerRecords"
                    :key="rec.id"
                    mode="fertilizer"
                    :value="rec"
                    @change="(next) => handleUpdateFertilizer(idx, next)"
                    @remove="() => handleRemoveFertilizer(idx)"
                  />
                </div>
              </details>

              <!-- 2026-07-18 P0-MD-023：用药折叠面板（动态列表，1:N 嵌套） -->
              <details
                class="col-span-3 border border-red-100 rounded-lg bg-red-50/20 overflow-hidden"
                :open="(formData.pesticideRecords?.length || 0) > 0"
              >
                <summary class="cursor-pointer select-none px-3 py-2 bg-red-50/50 hover:bg-red-50 text-sm font-semibold text-red-800 flex items-center justify-between">
                  <span>▼ 用药（{{ formData.pesticideRecords?.length || 0 }} 种）</span>
                  <button
                    type="button"
                    @click.prevent="handleAddPesticide"
                    class="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    + 添加
                  </button>
                </summary>
                <div class="p-3 space-y-2">
                  <div v-if="(formData.pesticideRecords?.length || 0) === 0" class="text-center py-3 text-xs text-gray-500">
                    暂无用药记录 — 点击「+ 添加」记录
                  </div>
                  <FeedRecordCard
                    v-for="(rec, idx) in formData.pesticideRecords"
                    :key="rec.id"
                    mode="pesticide"
                    :value="rec"
                    @change="(next) => handleUpdatePesticide(idx, next)"
                    @remove="() => handleRemovePesticide(idx)"
                  />
                </div>
              </details>
            </div>
          </div>

          <!-- 历史记录列表 -->
          <div>
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <h4 class="text-sm font-semibold text-gray-900">
                历史记录 ({{ latestDailyRecords.length }} 条)
              </h4>
              <el-button
                type="primary"
                size="small"
                @click="handleExport"
                :disabled="latestDailyRecords.length === 0"
                class="flex items-center gap-1"
              >
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
            <div v-if="latestDailyRecords.length === 0" class="text-center py-8 text-gray-500">
              暂无记录
            </div>
            <div v-else class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              <table class="w-full text-sm">
                <!-- 2026-07-18 P0-MD-028：蓝色表头对齐 V1.1 的 17 列（含条件列） -->
                <thead class="bg-blue-500 text-white sticky top-0">
                  <tr>
                    <th class="px-2 py-2 text-left font-semibold w-24">日期</th>
                    <th class="px-2 py-2 text-left font-semibold">温度</th>
                    <th class="px-2 py-2 text-left font-semibold">湿度</th>
                    <th class="px-2 py-2 text-left font-semibold">pH</th>
                    <th class="px-2 py-2 text-left font-semibold">EC</th>
                    <th class="px-2 py-2 text-left font-semibold">浇水</th>
                    <!-- 2026-07-18 P0-MD-028：浇水方式 + 浇水量 -->
                    <th class="px-2 py-2 text-left font-semibold w-24">浇水方式</th>
                    <th class="px-2 py-2 text-left font-semibold w-24">浇水量</th>
                    <!-- 2026-07-18 P0-MD-028：施肥/用药子表（种类计数） -->
                    <th class="px-2 py-2 text-left font-semibold w-16 text-emerald-200">施肥</th>
                    <th class="px-2 py-2 text-left font-semibold w-16 text-red-200">用药</th>
                    <!-- 2026-07-18 P0-MD-028：1:多 模式才显示母株损耗列 -->
                    <th v-if="isMotherMode" class="px-2 py-2 text-left font-semibold">母株损耗</th>
                    <!-- 2026-07-18 P0-MD-028：补苗列 -->
                    <th class="px-2 py-2 text-left font-semibold">补苗</th>
                    <!-- 2026-07-18 P0-MD-028：1:多 模式才显示小苗产出列 -->
                    <th v-if="isMotherMode" class="px-2 py-2 text-left font-semibold">小苗产出</th>
                    <th class="px-2 py-2 text-left font-semibold">小苗损耗</th>
                    <th class="px-2 py-2 text-left font-semibold">操作员</th>
                    <th class="px-2 py-2 text-left font-semibold">备注</th>
                    <th class="px-2 py-2 text-center font-semibold w-24">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(r, index) in latestDailyRecords" :key="r.id || index" class="hover:bg-gray-50">
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-date-picker
                          v-model="editingRow.recordDate"
                          type="date"
                          placeholder="选择日期"
                          value-format="YYYY-MM-DD"
                          class="w-full px-1 py-0.5 text-xs"
                        />
                      </template>
                      <template v-else>{{ r.recordDate }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.temperature" :min="0" :step="0.1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.temperature ? r.temperature + '℃' : '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.humidity" :min="0" :step="0.1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.humidity ? r.humidity + '%' : '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.phValue" :min="0" :step="0.1" :precision="1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.phValue ?? '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.ecValue" :min="0" :step="0.1" :precision="1" size="small" class="w-full" />
                      </template>
                      <template v-else>{{ r.ecValue ?? '-' }}</template>
                    </td>
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-checkbox v-model="editingRow.watering" />
                      </template>
                      <template v-else>{{ r.watering ? '✓' : '✗' }}</template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：浇水方式 -->
                    <td class="px-2 py-1.5 text-xs">
                      {{ r.watering ? (WATERING_METHOD_MAP[r.wateringMethod] || r.wateringMethod || '-') : '-' }}
                    </td>
                    <!-- 2026-07-18 P0-MD-028：浇水量 -->
                    <td class="px-2 py-1.5 text-xs">
                      {{ r.watering && r.wateringAmount != null ? `${r.wateringAmount} ${WATERING_UNIT_MAP[r.wateringUnit] || r.wateringUnit || ''}` : '-' }}
                    </td>
                    <!-- 2026-07-18 P0-MD-028：施肥种类计数（hover 显示明细） -->
                    <td class="px-2 py-1.5">
                      <template v-if="(r.fertilizerRecords?.length || 0) > 0">
                        <span
                          class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 cursor-help"
                          :title="(r.fertilizerRecords || []).map(f => `${f.name} ${f.amount || 0}${f.unit}${f.dilutionType === 'dilute' && f.dilution ? `×${f.dilution}倍` : '(干施)'}`).join('\n')"
                        >
                          {{ r.fertilizerRecords.length }} 种
                        </span>
                      </template>
                      <template v-else><span class="text-gray-300">-</span></template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：用药种类计数（hover 显示明细） -->
                    <td class="px-2 py-1.5">
                      <template v-if="(r.pesticideRecords?.length || 0) > 0">
                        <span
                          class="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 cursor-help"
                          :title="(r.pesticideRecords || []).map(p => `${p.name} ${p.amount || 0}${p.unit}${p.dilutionType === 'dilute' && p.dilution ? `×${p.dilution}倍` : ''}${p.targetPest ? `/${p.targetPest}` : ''}${p.safetyInterval ? `(间隔${p.safetyInterval}天)` : ''}`).join('\n')"
                        >
                          {{ r.pesticideRecords.length }} 种
                        </span>
                      </template>
                      <template v-else><span class="text-gray-300">-</span></template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：1:多 模式才显示母株损耗 -->
                    <td v-if="isMotherMode" class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.survivalCountChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.survivalCountChange !== undefined" :class="r.survivalCountChange > 0 ? 'text-green-600' : r.survivalCountChange < 0 ? 'text-red-600' : 'text-gray-500'">
                          {{ r.survivalCountChange > 0 ? '+' : '' }}{{ r.survivalCountChange }}
                        </span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：补苗 -->
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.replantChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.replantChange !== undefined" class="text-blue-600">+{{ r.replantChange }}</span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：1:多 模式才显示小苗产出 -->
                    <td v-if="isMotherMode" class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.runnerIncreaseCount" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.runnerIncreaseCount !== undefined" class="text-emerald-600">
                          {{ r.runnerIncreaseCount > 0 ? '+' : '' }}{{ r.runnerIncreaseCount }}
                        </span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <!-- 2026-07-18 P0-MD-028：小苗损耗 -->
                    <td class="px-2 py-1.5">
                      <template v-if="editingId === r.id">
                        <el-input-number v-model="editingRow.lossCountChange" size="small" class="w-full" />
                      </template>
                      <template v-else>
                        <span v-if="r.lossCountChange !== undefined" class="text-red-600">+{{ r.lossCountChange }}</span>
                        <span v-else>-</span>
                      </template>
                    </td>
                    <td class="px-2 py-1.5">{{ r.operator || '-' }}</td>
                    <!-- 2026-07-18 P0-MD-028：备注超长悬停查看完整内容 -->
                    <td class="px-2 py-1.5 text-gray-500 truncate max-w-[120px]" :title="r.remarks || ''">{{ r.remarks || '-' }}</td>
                    <td class="px-2 py-1.5 text-center">
                      <template v-if="editingId === r.id">
                        <div class="flex items-center justify-center gap-1">
                          <el-button
                            text
                            @click="handleSaveEdit"
                            class="h-7 w-7 text-green-600 hover:text-green-700"
                          >
                            <el-icon><Check /></el-icon>
                          </el-button>
                          <el-button
                            text
                            @click="handleCancelEdit"
                            class="h-7 w-7 text-gray-500 hover:text-gray-700"
                          >
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </div>
                      </template>
                      <template v-else>
                        <div class="flex items-center justify-center gap-1">
                          <!-- 2026-07-18 P0-MD-027：只读模式下隐藏编辑/删除按钮 -->
                          <template v-if="!readOnly">
                            <el-button
                              text
                              @click="handleStartEdit(r)"
                              class="h-7 w-7 text-blue-600 hover:text-blue-700"
                            >
                              <el-icon><Edit /></el-icon>
                            </el-button>
                            <el-button
                              text
                              @click="handleDelete(r)"
                              class="h-7 w-7 text-red-600 hover:text-red-700"
                            >
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </template>
                          <span v-else class="text-gray-400 text-xs">只读</span>
                        </div>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">{{ readOnly ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!readOnly" type="primary" @click="handleSubmit" :loading="submitting">添加记录</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Close, Download, Edit, Delete, Check, Lock } from '@element-plus/icons-vue'
import { useSeedlingStore } from '@/stores'
import FeedRecordCard from './FeedRecordCard.vue'
import * as XLSX from 'xlsx'

const props = defineProps({
  visible: Boolean,
  record: Object,
  // 2026-07-18 P0-MD-027：只读模式（已结束的记录）— 禁用所有写操作，保留查看+导出
  readOnly: {
    type: Boolean,
    default: false
  }
})

// 2026-07-20 P0-MD-001/002：浇水方式/单位字典（对齐 V1.1 constants/cropConstants 16 种浇水方式 + 完整单位）
const WATERING_METHOD_MAP = {
  spray: '喷淋', drip: '滴灌', flood: '浇灌', mist: '喷雾',
  dip: '蘸根', pot: '盆浇', sprinkler: '喷灌', furrow: '沟灌',
  manual: '人工浇', drip_tape: '滴灌带', micro_spray: '微喷',
  flood_drain: '漫灌', root_dip: '浸根', soaking: '浸种',
  foliar: '叶面喷', overhead: '顶喷'
}
const WATERING_UNIT_MAP = {
  L: 'L', ml: 'mL', kg: 'kg', pot: '盆', ton: '吨',
  gram: '克', mu_li: '亩·厘', mm: '毫米'
}

const emit = defineEmits(['update:visible', 'success'])

// 2026-07-19 修复：el-dialog modelValue 变化处理
const onModelValueChange = (val) => {
  if (!val) emit('update:visible', false)
}

const seedlingStore = useSeedlingStore()
const submitting = ref(false)

// 2026-07-18 P0-MD-024：判断是否为 1:多 模式（motherPlantCount > 0 表示双池逻辑）
const isMotherMode = computed(() => {
  const mode = props.record?.propagationMode || props.record?.propagation_mode
  return mode === 'one_to_many'
})

// 2026-07-18 P0-MD-023：施肥/用药子表辅助函数
/** 生成前端唯一 ID（编辑时识别行） */
const genFeedId = (prefix) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`
/** 创建一行默认空记录 */
const makeEmptyFeedRecord = (mode) => ({
  id: genFeedId(mode === 'fertilizer' ? 'fr' : 'pr'),
  name: '',
  category: mode === 'fertilizer' ? 'foliar' : 'fungicide',
  amount: undefined,
  unit: 'g',
  dilution: undefined,
  dilutionType: 'dilute',
  applicationMethod: 'spray',
  notes: '',
  ...(mode === 'pesticide' ? { safetyInterval: undefined, targetPest: '' } : {})
})
const handleAddFertilizer = () => {
  formData.value.fertilizerRecords = [makeEmptyFeedRecord('fertilizer'), ...(formData.value.fertilizerRecords || [])]
}
// 2026-07-20 P0-MD-007：浇水业务逻辑（V1.1 L251：填了方式/量就算浇了，watering 自动联动）
const autoSetWatering = () => {
  formData.value.watering = !!(formData.value.wateringMethod || formData.value.wateringAmount != null)
}
const handleAddPesticide = () => {
  formData.value.pesticideRecords = [makeEmptyFeedRecord('pesticide'), ...(formData.value.pesticideRecords || [])]
}
const handleUpdateFertilizer = (idx, next) => {
  const list = [...(formData.value.fertilizerRecords || [])]
  list[idx] = next
  formData.value.fertilizerRecords = list
}
const handleUpdatePesticide = (idx, next) => {
  const list = [...(formData.value.pesticideRecords || [])]
  list[idx] = next
  formData.value.pesticideRecords = list
}
const handleRemoveFertilizer = (idx) => {
  formData.value.fertilizerRecords = (formData.value.fertilizerRecords || []).filter((_, i) => i !== idx)
}
const handleRemovePesticide = (idx) => {
  formData.value.pesticideRecords = (formData.value.pesticideRecords || []).filter((_, i) => i !== idx)
}

// 编辑状态
const editingId = ref(null)
const editingRow = ref({})

// 2026-07-20 P0-MD-003：操作人员字典（从 getDictItems('operator') 读取，fallback 硬编码）
const operatorOptions = ref([
  { value: '系统管理员', label: '系统管理员' },
  { value: '操作员A', label: '操作员A' },
  { value: '操作员B', label: '操作员B' }
])
// 尝试从字典读取
try {
  const { getDictItems } = await import('@/stores/modules/dictionary')
  const dictOps = getDictItems('operator')
  if (dictOps && dictOps.length > 0) {
    operatorOptions.value = dictOps.map(d => ({ value: d.dictCode, label: d.dictLabel }))
  }
} catch {}

// 计算属性：获取最新的历史记录
const latestDailyRecords = computed(() => {
  if (!props.record) return []
  // 尝试从store获取最新数据
  const storeItem = seedlingStore.items?.find(s => s.id === props.record.id)
  return storeItem?.dailyRecords || props.record.dailyRecords || []
})

const formData = ref({
  recordDate: new Date().toISOString().split('T')[0],
  temperature: undefined,
  humidity: undefined,
  // 2026-07-20 P0-MD-007：浇水业务逻辑（V1.1：填了方式/量就算浇了，不再需要勾选 watering 字段）
  // watering 字段仍保留以兼容历史数据，但不再控制方式/量字段的显示
  watering: false,
  // 2026-07-18 P0-DIFF-003：补 V1.1 浇水细粒度字段
  wateringMethod: undefined,
  wateringAmount: undefined,
  wateringUnit: undefined,
  abnormality: '',
  // 2026-07-20 P0-MD-009/010：删除 V1.1 已删除的 plantedCountChange 字段
  // survivalCountChange 在 1:多 模式 = 母株损耗；1:1 模式 = 0（死字段）
  survivalCountChange: undefined,
  lossCountChange: undefined,
  // 2026-07-18 P0-DIFF-003：补苗/匍匐茎增加
  replantChange: undefined,
  runnerIncreaseCount: undefined,
  remarks: '',
  phValue: undefined,
  ecValue: undefined,
  operator: '',
  // 2026-07-18 P0-DIFF-003：施肥/用药子表（FeedRecordCard）
  fertilizerRecords: [],
  pesticideRecords: []
})

watch(() => props.visible, (val) => {
  if (val) {
    // 重置表单
    formData.value = {
      recordDate: new Date().toISOString().split('T')[0],
      temperature: undefined,
      humidity: undefined,
      watering: false,
      wateringMethod: undefined,
      wateringAmount: undefined,
      wateringUnit: undefined,
      abnormality: '',
      survivalCountChange: undefined,
      lossCountChange: undefined,
      replantChange: undefined,
      runnerIncreaseCount: undefined,
      fertilizerRecords: [],
      pesticideRecords: [],
      remarks: '',
      phValue: undefined,
      ecValue: undefined,
      operator: ''
    }
    // 重置编辑状态
    editingId.value = null
    editingRow.value = {}
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formData.value.recordDate) {
    ElMessage.warning('请选择记录日期')
    return
  }

  // 2026-07-18 P0-MD-024：两池分离校验（母株池 + 小苗池 各自独立）
  const sc = isMotherMode.value ? (formData.value.survivalCountChange || 0) : 0
  const ri = isMotherMode.value ? (formData.value.runnerIncreaseCount || 0) : 0
  const lc = formData.value.lossCountChange || 0
  const rc = formData.value.replantChange || 0

  // 母株池剩余可用
  const motherAvailable = Math.max(0,
    (props.record?.motherPlantCount || 0)
    - (props.record?.motherLossCount || 0)
    + (props.record?.replantCount || 0)
  )
  // 小苗池剩余可用
  const seedlingAvailable = Math.max(0,
    (props.record?.expandedPlantCount || 0)
    + ri
    + (isMotherMode.value ? 0 : rc)
    - (props.record?.seedlingLossCount || 0)
    - (props.record?.harvestStockedCount || 0)
  )

  if (isMotherMode.value) {
    if (sc > 0 && sc > motherAvailable) {
      ElMessage.warning(`1:多 模式：母株损耗 ${sc} 超过母株剩余可用 ${motherAvailable} 株，请调整`)
      return
    }
  } else {
    if (lc > 0 && lc > seedlingAvailable) {
      ElMessage.warning(`1:1 模式：小苗损耗 ${lc} 超过小苗剩余可用 ${seedlingAvailable} 株，请调整`)
      return
    }
  }
  // 损耗不能为负
  if (lc < 0) {
    ElMessage.warning('损耗数量不能为负数')
    return
  }

  submitting.value = true
  try {
    // 2026-07-18 P0-MD-025：浇水推断（填了方式/量就算浇了）
    const hasWatering = !!(formData.value.wateringMethod || formData.value.wateringAmount != null)
    // 2026-07-18 P0-MD-025：补齐 bizData 15+ 字段
    const bizData = {
      temperature: formData.value.temperature,
      humidity: formData.value.humidity,
      watering: hasWatering || formData.value.watering,
      wateringMethod: hasWatering ? formData.value.wateringMethod : undefined,
      wateringAmount: hasWatering ? formData.value.wateringAmount : undefined,
      wateringUnit: hasWatering ? formData.value.wateringUnit : undefined,
      // 仅写入有效行：name 非空 + amount > 0
      fertilizerRecords: (formData.value.fertilizerRecords || [])
        .filter(r => r.name && r.amount && r.amount > 0)
        .map(r => ({
          id: r.id, name: r.name, category: r.category, amount: r.amount, unit: r.unit,
          dilution: r.dilution, dilutionType: r.dilutionType, applicationMethod: r.applicationMethod,
          notes: r.notes || undefined
        })),
      pesticideRecords: (formData.value.pesticideRecords || [])
        .filter(r => r.name && r.amount && r.amount > 0)
        .map(r => ({
          id: r.id, name: r.name, category: r.category, amount: r.amount, unit: r.unit,
          dilution: r.dilution, dilutionType: r.dilutionType, applicationMethod: r.applicationMethod,
          safetyInterval: r.safetyInterval, targetPest: r.targetPest || undefined, notes: r.notes || undefined
        })),
      abnormality: formData.value.abnormality || undefined,
      // 5 个新业务字段
      motherLossChange: sc,
      seedlingLossChange: lc,
      expandedChange: ri,
      replantChange: rc,
      // 4 个兼容旧字段名
      survivalCountChange: sc,
      lossCountChange: lc,
      runnerIncreaseCount: ri,
      phValue: formData.value.phValue,
      ecValue: formData.value.ecValue,
      operator: formData.value.operator || undefined
    }

    await seedlingStore.addDailyRecord(props.record.id, {
      record_date: formData.value.recordDate,
      crop_name: props.record?.cropName,
      crop_variety: props.record?.cropVariety,
      greenhouse_name: props.record?.siteName,
      quantity: formData.value.survivalCountChange || 0,
      unit: '株',
      data: JSON.stringify(bizData),
      remarks: formData.value.remarks || undefined,
      create_by: formData.value.operator || localStorage.getItem('username') || '管理员'
    })

    ElMessage.success('添加记录成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('添加每日记录失败:', error)
    ElMessage.error('添加记录失败')
  } finally {
    submitting.value = false
  }
}

// 2026-07-18 P0-MD-026：编辑态业务字段白名单（防止 data JSON 垃圾字段污染 PUT）
const BUSINESS_FIELDS = [
  'recordDate', 'temperature', 'humidity', 'watering',
  'wateringMethod', 'wateringAmount', 'wateringUnit',
  'fertilizerRecords', 'pesticideRecords',
  'abnormality',
  'survivalCountChange', 'lossCountChange',
  'runnerIncreaseCount', 'replantChange', 'phValue', 'ecValue', 'operator', 'remarks'
]

// 开始编辑 — 白名单 + data JSON 清洗
const handleStartEdit = (r) => {
  editingId.value = r.id
  const cleanRow = {}
  // 2026-07-18 P0-MD-026：保留 data JSON 里的子表字段（fertilizerRecords/pesticideRecords 等）
  if (r.data && typeof r.data === 'object') {
    Object.entries(r.data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        cleanRow[k] = v
      }
    })
  }
  BUSINESS_FIELDS.forEach(k => {
    if (r[k] !== undefined) {
      cleanRow[k] = r[k]
    }
  })
  editingRow.value = cleanRow
}

// 取消编辑
const handleCancelEdit = () => {
  editingId.value = null
  editingRow.value = {}
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editingId.value) return
  try {
    const success = await seedlingStore.updateDailyRecord(props.record.id, editingId.value, editingRow.value)
    if (!success) {
      ElMessage.error('更新记录失败，请重试')
      return
    }
    editingId.value = null
    editingRow.value = {}
    ElMessage.success('更新记录成功')
    emit('success')
  } catch (error) {
    console.error('更新每日记录失败:', error)
    ElMessage.error('更新记录失败，请重试')
  }
}

// 删除记录
const handleDelete = async (r) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${r.recordDate} 的这条记录吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const success = await seedlingStore.deleteDailyRecord(props.record.id, r.id)
    if (!success) {
      ElMessage.error('删除记录失败，请重试')
      return
    }
    ElMessage.success('删除记录成功')
    emit('success')
  } catch (error) {
    // 用户取消删除
    console.log('取消删除')
  }
}

// 导出记录
const handleExport = () => {
  if (latestDailyRecords.value.length === 0) {
    ElMessage.warning('没有记录可导出')
    return
  }
  const data = latestDailyRecords.value.map(r => {
    // 2026-07-18 P0-MD-029：施肥/用药明细（多行转文本，对齐 V1.1 handleExport）
    const FEED_UNIT_MAP = { g: 'g', mL: 'mL', L: 'L', kg: 'kg', 包: '包', 粒: '粒' }
    const fertText = (r.fertilizerRecords || [])
      .map(f => `${f.name} ${f.amount || 0}${FEED_UNIT_MAP[f.unit] || f.unit}${f.dilutionType === 'dilute' && f.dilution ? `×${f.dilution}倍` : '(干施)'}`)
      .join('; ')
    const pestText = (r.pesticideRecords || [])
      .map(p => `${p.name} ${p.amount || 0}${FEED_UNIT_MAP[p.unit] || p.unit}${p.dilutionType === 'dilute' && p.dilution ? `×${p.dilution}倍` : ''}${p.targetPest ? `/${p.targetPest}` : ''}${p.safetyInterval ? `(安全间隔${p.safetyInterval}天)` : ''}`)
      .join('; ')
    return {
      '日期': r.recordDate,
      '温度(℃)': r.temperature ?? '',
      '湿度(%)': r.humidity ?? '',
      'pH值': r.phValue ?? '',
      'EC值(mS/cm)': r.ecValue ?? '',
      '浇水': r.watering ? '是' : '否',
      // 2026-07-18 P0-MD-029：浇水方式 + 浇水量
      '浇水方式': r.watering ? (WATERING_METHOD_MAP[r.wateringMethod] || r.wateringMethod || '-') : '-',
      '浇水量': r.watering && r.wateringAmount != null ? `${r.wateringAmount} ${WATERING_UNIT_MAP[r.wateringUnit] || r.wateringUnit || ''}` : '-',
      // 2026-07-18 P0-MD-029：施肥/用药子表（种类数 + 明细）
      '施肥种类': (r.fertilizerRecords || []).length,
      '施肥明细': fertText || '-',
      '用药种类': (r.pesticideRecords || []).length,
      '用药明细': pestText || '-',
      // 2026-07-18 P0-MD-029：母株损耗/补苗/小苗产出（1:多 模式下有效）
      '母株损耗': r.survivalCountChange ?? '',
      '补苗': r.replantChange ?? '',
      '小苗产出': r.runnerIncreaseCount ?? '',
      // 2026-07-18 P0-MD-029：小苗损耗
      '小苗损耗': r.lossCountChange ?? '',
      '操作员': r.operator ?? '',
      '备注': r.remarks ?? ''
    }
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '每日记录')
  XLSX.writeFile(wb, `每日记录_${props.record?.seedlingCode}.xlsx`)
  ElMessage.success('导出成功')
}
</script>
