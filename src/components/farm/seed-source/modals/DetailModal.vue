<!--
  种源详情弹窗 — V1.1 DetailModal.tsx 1:1 对齐版
  V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\DetailModal.tsx

  Tab 结构（V1.1 EntityDetailModal 风格）：
  - 基本信息（始终显示，含模式 badge + 库存信息 + 其他信息）
  - 调拨来源（条件显示，仅库存调拨入库的种源）
  - 入库记录（始终显示，来自 inventory_inbound_records）
  - 使用记录（始终显示，来自 GET /api/seed-sources/:id/usage-records）
-->
<template>
  <el-dialog
    :model-value="visible"
    width="1350px"
    height="700px"
    top="5vh"
    :close-on-click-modal="true"
    v-dialog-draggable
    v-dialog-resizable
    v-dialog-maximizable
    @close="handleClose"
  >
    <!-- 2026-07-15: 自定义绿色渐变 header（与 EditModal 一致） -->
    <template #header>
      <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 -mx-6 -mt-4 px-6 py-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">种源详情</h3>
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

    <el-tabs v-model="activeTab" v-if="record">
      <!-- Tab 1: 基本信息（始终显示） -->
      <el-tab-pane label="基本信息" name="info">
        <!-- P0-DETAIL-040：space-y-6 + h4 + 两列 flex grid（对齐 V1.1 SeedSourceBasicInfo） -->
        <div class="space-y-6">
          <!-- P0-DETAIL-008：模式 badge 在内容顶部（不是 header），16px，padding px-3 py-1.5 rounded-lg text-sm font-semibold 无边框 -->
          <div v-if="modeConfig" :class="['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold', modeConfig.color]">
            <component :is="modeConfig.icon" :size="16" />
            {{ modeConfig.label }}
          </div>

          <!-- 基本信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">基本信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">种源批号：</span>
                <span class="text-sm font-mono text-blue-600">{{ record.seedCode }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">作物编码：</span>
                <span class="text-sm font-mono text-orange-600">{{ record.cropCode || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">作物品种：</span>
                <span class="text-sm text-gray-900">{{ record.cropName }}{{ record.cropVariety ? `（${record.cropVariety}）` : '' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">品种路径：</span>
                <span class="text-sm text-gray-600">{{ varietyPath }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">来源途径：</span>
                <!-- P0-DETAIL-006：SOURCE_ORIGIN_MAP[originKey]?.label -->
                <span class="text-sm text-gray-900">{{ SOURCE_ORIGIN_MAP[originKey]?.label || modeConfig.label }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">形态：</span>
                <!-- P0-DETAIL-001：种源形态字段翻译（中文/英文 → 中文） -->
                <span class="text-sm text-gray-900">{{ formatSeedForm(record.seedForm) }}</span>
              </div>
            </div>
          </div>

          <!-- 库存信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">库存信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">入库日期：</span>
                <span class="text-sm text-gray-900">{{ record.purchaseDate || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">入库数量：</span>
                <!-- P0-DETAIL-005：UNIT_MAP -->
                <span class="text-sm text-gray-900">{{ record.quantity.toLocaleString() }} {{ UNIT_MAP[record.unit] || record.unit }}</span>
              </div>
              <template v-if="isExternal">
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">单价：</span>
                  <span class="text-sm text-gray-900">¥{{ record.unitPrice }}/{{ UNIT_MAP[record.unit] || record.unit }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">总金额：</span>
                  <span class="text-sm text-gray-900">¥{{ (record.totalAmount || 0).toLocaleString() }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">供应商：</span>
                  <span class="text-sm text-gray-900">{{ record.supplierName || '—' }}</span>
                </div>
              </template>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">可用数量：</span>
                <span class="text-sm font-medium text-emerald-600">{{ record.availableCount.toLocaleString() }} {{ UNIT_MAP[record.unit] || record.unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">库存状态：</span>
                <!-- P0-DETAIL-007：status.color 直接渲染 -->
                <span :class="['px-2 py-1 rounded text-xs font-medium', statusInfo.color]">{{ statusInfo.label }}</span>
              </div>
            </div>
          </div>

          <!-- 种植留种信息（条件显示） -->
          <div v-if="isPlantingKept">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">种植留种信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">关联种植：</span>
                <span class="text-sm font-mono text-gray-900">{{ record.linkedPlantingCode || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">世代：</span>
                <span class="text-sm text-gray-900">{{ record.generation || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">采收形态：</span>
                <!-- P0-DETAIL-001：种源形态字段翻译（中文/英文 → 中文） -->
                <span class="text-sm text-gray-900">{{ formatSeedForm(record.seedForm) }}</span>
              </div>
            </div>
          </div>

          <!-- 其他信息 -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">其他信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建人：</span>
                <span class="text-sm text-gray-900">{{ record.createBy || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">创建时间：</span>
                <span class="text-sm text-gray-900">{{ record.createTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">更新时间：</span>
                <span class="text-sm text-gray-900">{{ record.updateTime }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-24">打印次数：</span>
                <span class="text-sm text-gray-900">{{ record.printCount || 0 }} 次</span>
              </div>
              <div v-if="record.remarks" class="col-span-2 flex items-start">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
                <span class="text-sm text-gray-900">{{ record.remarks }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 操作历史（V1.1 EntityDetailModal + EntityHistoryTimeline 1:1 对齐） -->
      <el-tab-pane label="操作历史" name="history">
        <!-- P0-DETAIL-004/007/008：升级为完整双视图组件（时间线/表格 + 5分类筛选 + 导出Excel + typeColumn） -->
        <EntityHistoryTimeline
          entity="seed-sources"
          :entity-id="record.id"
          :entity-code="record.seedCode"
          :type-column="historyTypeColumn"
        />
      </el-tab-pane>

      <!-- Tab 3: 调拨来源（条件显示） -->
      <el-tab-pane v-if="hasTransferSource" label="调拨来源" name="transfer-source">
        <div class="space-y-6">
          <div>
            <!-- P0-DETAIL-045：调拨来源标题图标 ArrowLeftRight emerald -->
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <ArrowLeftRight :size="16" class="text-emerald-600" />
              调拨来源（原库存信息）
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原库存 ID：</span>
                <code class="text-xs font-mono text-gray-700">{{ record.transferredFromStockId }}</code>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">来源业务类型：</span>
                <!-- P0-DETAIL-002：transferredFromBusinessType 字典翻译（harvest→采收 等） -->
                <span class="text-sm text-gray-900">{{ TRANSFERRED_FROM_BUSINESS_TYPE_MAP[record.transferredFromBusinessType] || record.transferredFromBusinessType || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">来源业务 ID：</span>
                <code class="text-xs font-mono text-gray-700">{{ record.transferredFromBusinessId || '—' }}</code>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始入库日期：</span>
                <span class="text-sm text-gray-900">{{ record.originalInboundDate || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始来源模块：</span>
                <!-- P0-DETAIL-003：originalSourceModule 字典翻译（seed_source→种源 等） -->
                <span class="text-sm text-gray-900">{{ ORIGINAL_SOURCE_MODULE_MAP[record.originalSourceModule] || record.originalSourceModule || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始来源 ID：</span>
                <code class="text-xs font-mono text-gray-700">{{ record.originalSourceId || '—' }}</code>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">作物 / 品种 / 价格</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始作物：</span>
                <span class="text-sm text-gray-900">{{ record.originalCropName || record.cropName || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始品种：</span>
                <span class="text-sm text-gray-900">{{ record.originalVarietyName || record.cropVariety || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始单位：</span>
                <span class="text-sm text-gray-900">{{ record.originalUnit || record.unit || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始单价：</span>
                <span class="text-sm text-gray-900">{{ record.originalUnitPrice != null ? `¥${record.originalUnitPrice}` : '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始供应商：</span>
                <span class="text-sm text-gray-900">{{ record.originalSupplierName || '—' }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 w-28">原始生产计划：</span>
                <code class="text-xs font-mono text-gray-700">{{ record.originalProductionPlanCode || '—' }}</code>
              </div>
            </div>
          </div>
          <div v-if="record.originalHarvestRecordId" class="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded p-3">
            <strong>采收记录：</strong>
            <code class="font-mono">{{ record.originalHarvestRecordId }}</code>
            <span class="ml-2">（调拨前的入库来源）</span>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 入库记录（始终显示） -->
      <el-tab-pane label="入库记录" name="inbound-records">
        <div v-if="inboundLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="inboundError" :title="inboundError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="inboundRecords.length > 0">
          <!-- P0-DETAIL-013：先标题/导出按钮，再汇总条（V1.1 L484-486 L303-305 顺序） -->
          <div class="flex items-center justify-between mb-3">
            <!-- P0-DETAIL-045：标题 Package emerald 图标 -->
            <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package :size="16" class="text-emerald-600" />
              入库记录（共 {{ inboundRecords.length }} 条）
            </h4>
            <el-button size="small" class="!bg-emerald-600 !hover:bg-emerald-700 !text-white" @click="exportInboundExcel">
              <el-icon class="mr-1"><Download /></el-icon>导出 Excel
            </el-button>
          </div>

          <!-- 顶部汇总条 -->
          <div class="grid grid-cols-4 gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-3">
            <div>
              <div class="text-xs text-amber-700">入库条数</div>
              <div class="text-lg font-semibold text-amber-900">{{ inboundSummary.count }} <span class="text-xs font-normal">条</span></div>
            </div>
            <div>
              <div class="text-xs text-amber-700">原始数量</div>
              <div class="text-lg font-semibold text-amber-900">
                {{ inboundSummary.totalOriginal.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-amber-700">已退数量</div>
              <div class="text-lg font-semibold text-amber-900">
                <span v-if="inboundSummary.totalReturned > 0" class="text-red-600">
                  {{ inboundSummary.totalReturned.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
                </span>
                <span v-else class="text-gray-400 text-sm">—</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-amber-700">可退数量</div>
              <div class="text-lg font-semibold text-amber-900">
                {{ inboundSummary.totalReturnable.toLocaleString() }} <span class="text-xs font-normal">{{ inboundSummary.unit }}</span>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-left">日期</th>
                  <th class="px-2 py-2 text-left">入库方式</th>
                  <th class="px-2 py-2 text-left">入库单号</th>
                  <th class="px-2 py-2 text-left">作物</th>
                  <th class="px-2 py-2 text-left">品种</th>
                  <th class="px-2 py-2 text-left">仓库</th>
                  <th class="px-2 py-2 text-right">原始数量</th>
                  <th class="px-2 py-2 text-right">已退数量</th>
                  <th class="px-2 py-2 text-right">可退数量</th>
                  <th class="px-2 py-2 text-right">单价</th>
                  <th class="px-2 py-2 text-right">总金额</th>
                  <th class="px-2 py-2 text-left">供应商</th>
                  <th class="px-2 py-2 text-left">操作员</th>
                  <th class="px-2 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in inboundRecords" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-2 py-1.5">{{ r.recordDate || '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span class="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">
                      {{ SOURCE_MODULE_MAP[r.sourceModule || ''] || r.sourceModule || '-' }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.id || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ r.cropName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.varietyName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.warehouseName || '-' }}</td>
                  <td class="px-2 py-1.5 text-right font-medium">{{ (r.quantity || 0).toLocaleString() }}</td>
                  <td class="px-2 py-1.5 text-right">
                    <span v-if="(r.returnedQuantity || 0) > 0" class="text-amber-600 font-medium">
                      {{ (r.returnedQuantity || 0).toLocaleString() }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-2 py-1.5 text-right">
                    <span :class="((r.quantity || 0) - (r.returnedQuantity || 0)) > 0 ? 'text-emerald-600 font-medium' : 'text-gray-400'">
                      {{ ((r.quantity || 0) - (r.returnedQuantity || 0)).toLocaleString() }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5 text-right">{{ (r.unitPrice || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5 text-right">{{ (r.totalAmount || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5">{{ r.supplierName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.notes || ''">{{ r.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <!-- P0-DETAIL-015：空态用虚线边框文本块（不用 el-empty） -->
        <div v-else class="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
          暂无入库记录
        </div>
      </el-tab-pane>

      <!-- Tab 4: 使用记录（始终显示） -->
      <el-tab-pane label="使用记录" name="usage-records">
        <div v-if="usageLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="usageError" :title="usageError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="usageRecords.length > 0">
          <div class="flex items-center justify-between mb-3">
            <!-- P0-DETAIL-045：标题 MoveRight emerald 图标 -->
            <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MoveRight :size="16" class="text-emerald-600" />
              使用记录（共 {{ usageRecords.length }} 条）
            </h4>
            <el-button size="small" class="!bg-emerald-600 !hover:bg-emerald-700 !text-white" @click="exportUsageExcel">
              <el-icon class="mr-1"><Download /></el-icon>导出 Excel
            </el-button>
          </div>
          <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th class="px-2 py-2 text-left">日期</th>
                  <th class="px-2 py-2 text-left">类型</th>
                  <th class="px-2 py-2 text-left">种源批号</th>
                  <th class="px-2 py-2 text-left">作物名称</th>
                  <th class="px-2 py-2 text-left">作物编码</th>
                  <th class="px-2 py-2 text-left">形态</th>
                  <th class="px-2 py-2 text-right">数量</th>
                  <th class="px-2 py-2 text-left">目标种植单</th>
                  <th class="px-2 py-2 text-left">目标区域</th>
                  <th class="px-2 py-2 text-left">操作员</th>
                  <th class="px-2 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in usageRecords" :key="r.id" class="hover:bg-gray-50 border-b border-gray-100">
                  <td class="px-2 py-1.5 whitespace-nowrap">{{ r.operationDate || '-' }}</td>
                  <td class="px-2 py-1.5">
                    <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs', r.operationType === 'move_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600']">
                      {{ r.operationType === 'move_in' ? '调入' : '调出' }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.sourceCode || '-' }}</code></td>
                  <td class="px-2 py-1.5 whitespace-nowrap">{{ r.cropName || '-' }}</td>
                  <td class="px-2 py-1.5"><code class="text-xs text-orange-600">{{ r.cropCode || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ formatSeedForm(r.seedForm) }}</td>
                  <td class="px-2 py-1.5 text-right font-medium">{{ (r.quantity || 0).toLocaleString() }}</td>
                  <td class="px-2 py-1.5"><code class="text-xs">{{ r.plantingCode || '-' }}</code></td>
                  <td class="px-2 py-1.5">{{ r.toAreaName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.remarks || ''">{{ r.remarks || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <!-- P0-DETAIL-015：空态用虚线边框文本块 -->
        <div v-else class="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
          暂无使用记录
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 种源详情弹窗 — V1.1 DetailModal.tsx 1:1 对齐
 * 4 Tab 结构：基本信息 / 调拨来源（条件）/ 入库记录 / 使用记录
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ArrowLeftRight, MoveRight, Package, Sprout, Store } from 'lucide-vue-next'
import { X } from 'lucide-vue-next'
import { getSeedSourceUsageRecords, getSeedSourceInboundHistory } from '@/services/apiSeedSourceService'
import { UNIT_MAP, SOURCE_ORIGIN_MAP, STOCK_STATUS_MAP, computeStockStatus } from '@/constants/seedSourceDict'
// P0-DETAIL-002/003：调拨来源 Tab 字典
import { TRANSFERRED_FROM_BUSINESS_TYPE_MAP, ORIGINAL_SOURCE_MODULE_MAP } from '@/constants/cropConstants'
// P0-DETAIL-001：种源形态字段翻译（中文/英文 → 中文）
import { formatSeedForm } from '@/utils/seedFormTranslator'
// P0-DETAIL-004/007/008：完整操作历史双视图组件
import EntityHistoryTimeline from '@/components/farm/seed-source/components/EntityHistoryTimeline.vue'
import * as XLSX from 'xlsx'

const props = defineProps({
  visible: { type: Boolean, default: false },
  // P0-DETAIL-018：nullable record 保护（默认空对象避免 undefined 访问崩溃）
  record: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:visible', 'close'])

const activeTab = ref('info')

// ===== 入库模式配置（对齐 V1.1 MODE_CONFIG L26-32） =====
const MODE_CONFIG = {
  planting_self_kept:      { label: '种植留种', color: 'text-green-700 bg-green-50', icon: Sprout },
  inventory_transfer:      { label: '库存调拨', color: 'text-cyan-700 bg-cyan-50', icon: ArrowLeftRight },
  transfer_from_inventory: { label: '库存调拨', color: 'text-cyan-700 bg-cyan-50', icon: ArrowLeftRight },
  external_purchase:       { label: '外购入库', color: 'text-blue-700 bg-blue-50', icon: Store },
  external:                { label: '外购入库', color: 'text-blue-700 bg-blue-50', icon: Store }
}

const SOURCE_MODULE_MAP = {
  seed_source: '商品种源入库',
  inventory: '库存调拨'
}

const handleClose = () => emit('update:visible', false)

// ===== 计算属性（对齐 V1.1） =====
const hasTransferSource = computed(() => !!props.record?.transferredFromStockId)
const originKey = computed(() => props.record?.sourceOrigin || (props.record?.transferredFromStockId ? 'transfer_from_inventory' : 'external'))
const modeConfig = computed(() => MODE_CONFIG[originKey.value] || MODE_CONFIG.external)
const isExternal = computed(() => originKey.value === 'external' || originKey.value === 'external_purchase')
const isPlantingKept = computed(() => originKey.value === 'planting_self_kept')

const varietyPath = computed(() => {
  const r = props.record
  if (!r) return '—'
  if (r.typeName && r.varietyName) return `${r.typeName} › ${r.varietyName}`
  return r.varietyName || r.typeName || '—'
})

// P0-DETAIL-007：状态色直接 status.color 渲染（不读 tagType）
const statusInfo = computed(() => {
  if (!props.record) return { label: '-', color: 'bg-gray-100 text-gray-800' }
  const key = computeStockStatus(props.record.availableCount, props.record.initialCount)
  return STOCK_STATUS_MAP[key] || { label: key || '-', color: 'bg-gray-100 text-gray-800' }
})

// ===== 入库记录 =====
const inboundRecords = ref([])
const inboundLoading = ref(false)
const inboundError = ref(null)

const inboundSummary = computed(() => {
  const records = inboundRecords.value
  const totalOriginal = records.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
  const totalReturned = records.reduce((s, r) => s + (Number(r.returnedQuantity) || 0), 0)
  const totalReturnable = totalOriginal - totalReturned
  const unit = records.find(r => r.unit)?.unit || ''
  return { totalOriginal, totalReturned, totalReturnable, unit, count: records.length }
})

// P0-DETAIL-041：改用 getSeedSourceInboundHistory service 函数
const fetchInboundRecords = async () => {
  if (!props.record?.id) return
  inboundLoading.value = true
  inboundError.value = null
  try {
    const data = await getSeedSourceInboundHistory(props.record.id)
    inboundRecords.value = Array.isArray(data) ? data : []
  } catch (e) {
    // P0-DETAIL-042：catch 加 console.error
    console.error('[DetailModal] 入库记录加载失败:', e)
    inboundError.value = (e && e.message) || '加载失败'
  } finally {
    inboundLoading.value = false
  }
}

// ===== 使用记录 =====
const usageRecords = ref([])
const usageLoading = ref(false)
const usageError = ref(null)

const fetchUsageRecords = async () => {
  if (!props.record?.id) return
  usageLoading.value = true
  usageError.value = null
  try {
    const data = await getSeedSourceUsageRecords(props.record.id)
    usageRecords.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('[DetailModal] 使用记录加载失败:', e)
    usageError.value = (e && e.message) || '加载失败'
  } finally {
    usageLoading.value = false
  }
}

// ===== 操作历史（V1.1 EntityHistoryTimeline 1:1 对齐） =====
// 数据源：/api/seed-sources/:id/history（统一实体历史端点） + material_flow_log 合并
// P0-DETAIL-008：typeColumn 配置（V1.1 EntityDetailModal L48 typeColumn 1:1 迁移）
const historyTypeColumn = computed(() => ({
  label: '入库方式',
  value: modeConfig.value?.label || '—'
}))

// ===== 导出 Excel =====
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const exportInboundExcel = () => {
  const headers = ['日期', '入库方式', '入库单号', '作物', '品种', '仓库', '原始数量', '已退数量', '可退数量', '单价', '总金额', '供应商', '操作员', '备注']
  const data = inboundRecords.value.map(r => [
    r.recordDate || '', SOURCE_MODULE_MAP[r.sourceModule || ''] || r.sourceModule || '',
    r.id || '', r.cropName || '', r.varietyName || '', r.warehouseName || '',
    r.quantity ?? 0, r.returnedQuantity ?? 0, (r.quantity || 0) - (r.returnedQuantity || 0),
    r.unitPrice ?? 0, r.totalAmount ?? 0, r.supplierName || '', r.operatorName || '', r.notes || ''
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '入库记录')
  XLSX.writeFile(wb, `入库记录_${todayLocal().replace(/-/g, '')}_${inboundRecords.value.length}条.xlsx`)
}

const exportUsageExcel = () => {
  const headers = ['日期', '类型', '种源批号', '作物名称', '作物编码', '形态', '数量', '目标种植单', '目标区域', '操作员', '备注']
  const data = usageRecords.value.map(r => [
    r.operationDate || '', r.operationType === 'move_in' ? '调入' : '调出',
    r.sourceCode || '', r.cropName || '', r.cropCode || '', r.seedForm || '',
    r.quantity ?? 0, r.plantingCode || '', r.toAreaName || r.fromAreaName || '',
    r.operatorName || '', r.remarks || ''
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '使用记录')
  XLSX.writeFile(wb, `使用记录_${todayLocal().replace(/-/g, '')}_${usageRecords.value.length}条.xlsx`)
}

// ===== 加载数据（按 Tab 激活懒加载，P0-DETAIL-043） =====
// 监听 Tab 切换
watch(activeTab, (val) => {
  if (!props.record?.id) return
  if (val === 'inbound-records' && inboundRecords.value.length === 0 && !inboundLoading.value) {
    fetchInboundRecords()
  }
  if (val === 'usage-records' && usageRecords.value.length === 0 && !usageLoading.value) {
    fetchUsageRecords()
  }
  // 操作历史 Tab 由 EntityHistoryTimeline 内部自动加载（无需此处处理）
})

// 打开时加载基础 Tab 数据（info Tab 无需异步加载）
watch(() => props.visible, (val) => {
  if (val && props.record?.id) {
    // 重置状态
    inboundRecords.value = []
    usageRecords.value = []
    // 默认加载 info（无数据请求）
    // 用户切换 Tab 时再加载对应数据
  }
})

onMounted(() => {
  if (props.visible && props.record?.id) {
    // 初次打开不在 onMounted 加载，按 Tab 切换懒加载
  }
})
</script>