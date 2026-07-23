<!--
  种源详情弹窗 — V1.1 DetailModal.tsx 1:1 完整迁移版
  V1.1 源文件：D:\TMcrop\yuanxingtu\V1.1\src\components\farm\seed-source\modals\DetailModal.tsx（1263 行）

  Tab 结构（V1.1 EntityDetailModal 风格）：
  - 基本信息（始终显示，含模式 badge + 库存信息 + 其他信息）
  - 调拨来源（条件显示，仅库存调拨入库的种源）
  - 入库记录（始终显示，支持冲销/撤销）
  - 使用记录（始终显示）
  - 合并历史（条件显示，仅 mergedFromIds.length > 0）
  - 冲销记录（始终显示）

  2026-07-22：1:1 完整字段对齐 V1.1
  - SeedSourceBasicInfo（库存状态/可用数量/价格字段统一/原始调拨信息/回流次数/合并历史/备注）
  - TransferSourcePanel（调拨来源完整字段）
  - UsageRecordsPanel（使用记录表格 + Excel 导出 + 空态）
  - InboundRecordsPanel（入库汇总 + 表格 + Excel 导出 + 撤销按钮 + 冲销对话框）
  - MergeHistoryPanel（合并历史 + archived 标记）
  - InboundAuditPanel（冲销审计 + 格式化数量变化 + 状态徽章）
  - SeedSourceQrCodeCard（QR 码卡 + 复制链接）
-->
<template>
  <el-dialog
    :model-value="visible"
    width="1350px"
    top="5vh"
    :close-on-click-modal="true"
    <!-- v-dialog-draggable disabled for el-dialog -->
    <!-- v-dialog-resizable disabled for el-dialog -->
    <!-- v-dialog-maximizable disabled for el-dialog -->
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

    <el-tabs v-model="activeTab" v-if="record && Object.keys(record).length > 0">
      <!-- ============================== -->
      <!-- Tab 1: 基本信息（始终显示）     -->
      <!-- ============================== -->
      <el-tab-pane label="基本信息" name="info">
        <div class="flex gap-4">
          <div class="flex-1 space-y-6">
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
                  <span class="text-sm text-gray-900">{{ SOURCE_ORIGIN_MAP[originKey]?.label || modeConfig.label }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">形态：</span>
                  <span class="text-sm text-gray-900">{{ formatSeedForm(record.seedForm) }}</span>
                </div>
                <!-- 2026-07-21：补种源类型字段（与编辑/列表对齐） -->
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">种源类型：</span>
                  <span class="text-sm text-gray-900">{{ SOURCE_TYPE_MAP[record.sourceType] || record.sourceType || '—' }}</span>
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
                  <span class="text-sm text-gray-900">{{ (record.quantity || 0).toLocaleString() }} {{ formatUnit(record.unit) }}</span>
                </div>
                <!-- 2026-07-21：价格字段统一展示（不再仅 external 模式显示）
                    - 外购：显示 unitPrice + totalAmount
                    - 调拨：unitPrice 已从原库存复制，显示单价+总额 + 原始供应商
                    - 回流：unitPrice 默认 0，显示"—"
                    调拨种源额外显示"原始单价"作为审计对照
                    2026-07-21 修复：加"元"字，为 0 时显示"—" -->
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">单价：</span>
                  <span class="text-sm text-gray-900">
                    <template v-if="record.unitPrice">¥{{ record.unitPrice }}元/{{ formatUnit(record.unit) }}</template>
                    <template v-else>—</template>
                    <span
                      v-if="isTransfer && record.originalUnitPrice != null && Number(record.unitPrice) !== Number(record.originalUnitPrice)"
                      class="text-xs text-gray-400 ml-1"
                    >（原始 ¥{{ record.originalUnitPrice }}元）</span>
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">总金额：</span>
                  <span class="text-sm text-gray-900">
                    <template v-if="record.totalAmount">¥{{ (record.totalAmount || 0).toLocaleString() }}元</template>
                    <template v-else>—</template>
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">供应商：</span>
                  <span class="text-sm text-gray-900">
                    {{ record.supplierName || '—' }}
                    <span v-if="isTransfer && record.originalSupplierName" class="text-xs text-gray-400 ml-1">
                      （原始：{{ record.originalSupplierName }}）
                    </span>
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">可用数量：</span>
                  <span class="text-sm font-medium text-emerald-600">{{ (record.availableCount || 0).toLocaleString() }} {{ formatUnit(record.unit) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">库存状态：</span>
                  <span :class="['px-2 py-1 rounded text-xs font-medium', statusInfo.color]">{{ statusInfo.label }}</span>
                </div>
              </div>
            </div>

            <!-- 2026-07-21：删除"繁殖信息"区块 — 内部种源已退化为纯仓库角色，育种/留种功能已移到种植管理
               外购/调拨/回流种源均不再显示繁殖相关字段（propagationType/propagationMethod/propagationStatus 为历史遗留） -->

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
                  <span class="text-sm text-gray-900">{{ record.createTime || '—' }}</span>
                </div>
                <!-- 2026-07-21：补全最后修改人/时间 -->
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">最后修改人：</span>
                  <span class="text-sm text-gray-900">{{ record.updateBy || '—' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">最后修改时间：</span>
                  <span class="text-sm text-gray-900">{{ record.updateTime || '—' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">打印次数：</span>
                  <span class="text-sm text-gray-900">{{ record.printCount || 0 }} 次</span>
                </div>
                <!-- 2026-07-21：始终展示生产计划和溯源码（空值显示"—"） -->
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">生产计划：</span>
                  <span class="text-sm font-mono text-gray-900">{{ record.productionPlanCode || '—' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">溯源码：</span>
                  <span class="text-sm font-mono text-gray-900">{{ record.traceabilityCode || '—' }}</span>
                </div>
                <!-- 2026-07-18: 种源合并 - 回流次数 + 最近回流时间 + 合并历史 -->
                <div v-if="(record.reflowCount || 0) > 0" class="flex items-center">
                  <span class="text-sm text-gray-500 w-24">回流次数：</span>
                  <span class="text-sm text-cyan-700 font-medium">
                    {{ record.reflowCount }} 次
                    <span v-if="record.lastReflowAt" class="text-xs text-gray-500 ml-2">
                      （最近 {{ record.lastReflowAt }}）
                    </span>
                  </span>
                </div>
                <div v-if="record.mergedFromIds && record.mergedFromIds.length > 0" class="col-span-2 flex items-start">
                  <span class="text-sm text-gray-500 w-24 flex-shrink-0">合并历史：</span>
                  <div class="flex flex-wrap gap-1">
                    <span class="inline-flex items-center rounded-full border border-transparent bg-gray-100 text-gray-900 px-2.5 py-0.5 text-xs font-semibold">
                      合并了 {{ record.mergedFromIds.length }} 条历史种源
                    </span>
                    <code v-for="(id, idx) in record.mergedFromIds.slice(0, 3)" :key="idx" class="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                      {{ id.substring(0, 16) }}...
                    </code>
                    <span v-if="record.mergedFromIds.length > 3" class="text-xs text-gray-500">等 {{ record.mergedFromIds.length }} 条</span>
                  </div>
                </div>
                <div v-if="record.remarks" class="col-span-2 flex items-start">
                  <span class="text-sm text-gray-500 w-24 flex-shrink-0">备注：</span>
                  <span class="text-sm text-gray-900">{{ record.remarks }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：QR 码卡（V1.1 SeedSourceQrCodeCard 1:1 迁移） -->
          <div v-if="record.seedCode" class="flex flex-col items-center gap-1.5 px-2 py-2 bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-lg shadow-sm self-start">
            <div class="bg-white p-1 rounded">
              <QRCode :value="qrUrl" :size="128" />
            </div>
            <span class="text-xs font-medium text-emerald-800 whitespace-nowrap">扫码查看详情</span>
            <button
              type="button"
              class="h-6 px-2.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              @click="copyQrLink"
            >
              复制链接
            </button>
          </div>
        </div>
      </el-tab-pane>

      <!-- ============================== -->
      <!-- Tab 2: 操作历史（V1.1 EntityHistoryTimeline 1:1 对齐） -->
      <!-- ============================== -->
      <el-tab-pane label="操作历史" name="history">
        <EntityHistoryTimeline
          entity="seed-sources"
          :entity-id="record.id"
          :entity-code="record.seedCode"
          :type-column="historyTypeColumn"
        />
      </el-tab-pane>

      <!-- ============================== -->
      <!-- Tab 3: 调拨来源（条件显示） -->
      <!-- ============================== -->
      <el-tab-pane v-if="hasTransferSource" label="调拨来源" name="transfer-source">
        <div class="space-y-6">
          <div>
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
                <span class="text-sm text-gray-900">
                  <template v-if="record.originalUnitPrice != null">¥{{ record.originalUnitPrice }}</template>
                  <template v-else>—</template>
                </span>
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

      <!-- ============================== -->
      <!-- Tab 4: 入库记录（始终显示） -->
      <!-- ============================== -->
      <el-tab-pane label="入库记录" name="inbound-records">
        <!-- P0-DETAIL-013：先标题/导出按钮，再汇总条（V1.1 L484-486 L303-305 顺序） -->
        <div v-if="inboundLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="inboundError" :title="inboundError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="inboundRecords.length > 0">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Package :size="16" class="text-emerald-600" />
              入库记录（共 {{ inboundRecords.length }} 条）
            </h4>
            <el-button size="small" class="!bg-emerald-600 !hover:bg-emerald-700 !text-white" @click="exportInboundExcel">
              <Download :size="14" class="mr-1 inline" />
              <span class="ml-1">导出 Excel</span>
            </el-button>
          </div>

          <!-- 顶部汇总条 — 让用户一眼看到退库累计（无需切换 Tab） -->
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
                  <!-- 2026-07-18: 冲销按钮列（C-1 修复） -->
                  <th class="px-2 py-2 text-left w-20">操作</th>
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
                    <!-- 2026-07-19 P1：已冲销/已撤销行可退数量显示为 —，避免业务认知错误 -->
                    <span v-if="r.reversedAt" class="text-gray-400">—（已冲销）</span>
                    <span v-else-if="((r.quantity || 0) - (r.returnedQuantity || 0)) > 0" class="text-emerald-600 font-medium">
                      {{ ((r.quantity || 0) - (r.returnedQuantity || 0)).toLocaleString() }}
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-2 py-1.5 text-right">{{ (r.unitPrice || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5 text-right">{{ (r.totalAmount || 0).toFixed(2) }}</td>
                  <td class="px-2 py-1.5">{{ r.supplierName || '-' }}</td>
                  <td class="px-2 py-1.5">{{ r.operatorName || '-' }}</td>
                  <td class="px-2 py-1.5 text-gray-500 truncate max-w-[200px]" :title="r.notes || ''">{{ r.notes || '-' }}</td>
                  <!-- 2026-07-18: 冲销按钮（C-1 修复） -->
                  <!-- 2026-07-19: 留种回流也支持撤销 — onClick 内按 recordSource 路由
                      （移除 recordSource 禁用，禁用条件只剩"已退完 / 不可操作"两类） -->
                  <td class="px-2 py-1.5">
                    <template v-if="r.reversedAt">
                      <span class="inline-flex items-center rounded-full border border-transparent bg-red-500 text-gray-50 px-2.5 py-0.5 text-xs font-semibold">已冲销</span>
                    </template>
                    <template v-else>
                      <!-- 2026-07-19：留种回流也支持撤销 — 按 recordSource 路由 -->
                      <button
                        type="button"
                        class="p-1 hover:bg-gray-100 rounded transition-colors"
                        :title="r.recordSource === 'crop_circulation_records' ? '撤销该次留种回流（整批作废）' : '冲销此入库'"
                        @click="handleReverseClick(r)"
                      >
                        <RotateCcw :size="14" />
                      </button>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <Package :size="40" class="mx-auto mb-2 opacity-30" />
          <div class="text-sm">暂无入库记录</div>
          <div class="text-xs mt-1 text-gray-400">
            通过「外购入库」「库存调拨」「种植留种」等入口添加后会显示在此
          </div>
        </div>

        <!-- 2026-07-18: 冲销确认对话框（C-1 修复） -->
        <!-- 2026-07-19 P1：提交期间阻止关闭（避免中断进行中的库存扣减）-->
        <el-dialog
          :model-value="reversingRecord !== null"
          width="500px"
          :close-on-click-modal="!reverseSubmitting"
          :close-on-press-escape="!reverseSubmitting"
          :show-close="!reverseSubmitting"
          @close="closeReverseDialog"
          @keydown="handleReverseKeydown"
        >
          <template #header>
            <h3 class="text-lg font-semibold flex items-center gap-2 text-red-600">
              <AlertTriangle :size="20" />
              {{ reversingRecord?.recordSource === 'crop_circulation_records' ? '撤销留种回流' : '冲销入库记录' }}
            </h3>
          </template>
          <div class="space-y-3 text-sm">
            <!-- 完整 context 显示：让用户清楚知道要冲什么 -->
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
              <div class="flex justify-between">
                <span class="text-gray-500">单据号</span>
                <code class="text-xs font-mono text-gray-700">{{ reversingRecord?.id }}</code>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ reversingRecord?.recordSource === 'crop_circulation_records' ? '回流来源' : '入库方式' }}</span>
                <span class="text-gray-700">
                  {{ SOURCE_MODULE_MAP[reversingRecord?.sourceModule || ''] || reversingRecord?.sourceModule || '外购入库' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">{{ reversingRecord?.recordSource === 'crop_circulation_records' ? '回流日期' : '入库日期' }}</span>
                <span class="text-gray-700">{{ reversingRecord?.recordDate || '—' }}</span>
              </div>
              <div class="border-t border-gray-200 pt-1.5 mt-1.5 space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-500">{{ reversingRecord?.recordSource === 'crop_circulation_records' ? '回流量' : '原始入库数量' }}</span>
                  <span class="text-gray-700">{{ (reversingRecord?.quantity || 0).toLocaleString() }} {{ reversingRecord?.unit }}</span>
                </div>
                <template v-if="reversingRecord?.recordSource !== 'crop_circulation_records'">
                  <div class="flex justify-between">
                    <span class="text-gray-500">已退数量</span>
                    <span class="text-amber-600">{{ (reversingRecord?.returnedQuantity || 0).toLocaleString() }} {{ reversingRecord?.unit }}</span>
                  </div>
                  <div class="flex justify-between font-medium">
                    <span class="text-gray-700">本次可冲销数量</span>
                    <span class="text-red-600 text-base">
                      {{ ((reversingRecord?.quantity || 0) - (reversingRecord?.returnedQuantity || 0)).toLocaleString() }} {{ reversingRecord?.unit }}
                    </span>
                  </div>
                </template>
              </div>
            </div>

            <template v-if="reversingRecord?.recordSource === 'crop_circulation_records'">
              <p class="text-gray-600 text-xs">撤销后：</p>
              <ul class="list-disc pl-5 space-y-0.5 text-xs text-gray-600">
                <li>回流记录标记为「已撤销」（<code>circulation_edit_log</code> 留痕）</li>
                <li>种源 <code class="font-mono text-gray-700">{{ record.seedCode }}</code> 可用数量相应减少</li>
                <li>合并计数 <code>reflow_count</code> -1（仅合并命中的回流）</li>
                <li>种植端 <code>planting_harvest_records.circulation_revoked_at</code> 同步标记（种植事实保留）</li>
                <li class="text-red-600 font-medium">此操作不可撤销（需新建正向回流补偿）</li>
              </ul>
            </template>
            <template v-else>
              <p class="text-gray-600 text-xs">冲销后将：</p>
              <ul class="list-disc pl-5 space-y-0.5 text-xs text-gray-600">
                <li>入库记录标记为「已冲销」（<code>inbound_edit_log</code> 留痕）</li>
                <li>种源 <code class="font-mono text-gray-700">{{ record.seedCode }}</code> 可用数量相应减少</li>
                <li class="text-red-600 font-medium">此操作不可撤销（需新建正向入库单补偿）</li>
              </ul>
            </template>

            <div>
              <label class="text-sm font-medium text-gray-900">{{ reversingRecord?.recordSource === 'crop_circulation_records' ? '撤销原因' : '冲销原因' }} <span class="text-red-600">*</span></label>
              <el-input
                v-model="reverseReason"
                type="textarea"
                :rows="2"
                :maxlength="200"
                :placeholder="reversingRecord?.recordSource === 'crop_circulation_records' ? '错回流 / 误操作 / 数据错误...' : '录入错误 / 重复提交 / 误操作...'"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>必填，将写入审计日志</span>
                <span>{{ reverseReason.length }} / 200</span>
              </div>
            </div>
          </div>
          <template #footer>
            <!-- 2026-07-19 P1：提交期间禁用取消按钮 -->
            <el-button :disabled="reverseSubmitting" @click="closeReverseDialog">
              取消 <span class="ml-1 text-xs text-gray-400">Esc</span>
            </el-button>
            <el-button
              type="danger"
              :disabled="!reverseReason.trim() || reverseSubmitting"
              :loading="reverseSubmitting"
              @click="handleReverse"
            >
              {{ reverseSubmitting
                ? (reversingRecord?.recordSource === 'crop_circulation_records' ? '撤销中...' : '冲销中...')
                : (reversingRecord?.recordSource === 'crop_circulation_records' ? '确认撤销' : '确认冲销')
              }}
              <span class="ml-1 text-xs opacity-70">Ctrl+Enter</span>
            </el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- ============================== -->
      <!-- Tab 5: 使用记录（始终显示） -->
      <!-- ============================== -->
      <el-tab-pane label="使用记录" name="usage-records">
        <div v-if="usageLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="usageError" :title="usageError" type="error" :closable="false" show-icon class="mb-3" />
        <template v-else-if="usageRecords.length > 0">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MoveRight :size="16" class="text-emerald-600" />
              使用记录（共 {{ usageRecords.length }} 条）
            </h4>
            <el-button size="small" class="!bg-emerald-600 !hover:bg-emerald-700 !text-white" @click="exportUsageExcel">
              <Download :size="14" class="mr-1 inline" />
              <span class="ml-1">导出 Excel</span>
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
        <div v-else class="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <MoveRight :size="40" class="mx-auto mb-2 opacity-30" />
          <div class="text-sm">暂无使用记录</div>
          <div class="text-xs mt-1 text-gray-400">
            当该种源被育苗或种植环节调用时会显示在此
          </div>
        </div>
      </el-tab-pane>

      <!-- ============================== -->
      <!-- Tab 6: 合并历史（条件显示） -->
      <!-- ============================== -->
      <el-tab-pane v-if="hasMergedHistory" :label="`合并历史 (${record.mergedFromIds.length})`" name="merge-history">
        <div class="space-y-3">
          <div class="relative flex gap-3 p-4 rounded-lg border border-cyan-200 bg-cyan-50">
            <Layers :size="20" class="w-5 h-5 flex-shrink-0 mt-0.5 text-cyan-600" />
            <div class="flex-1 space-y-1">
              <h4 class="text-sm font-medium text-cyan-900">种源合并说明</h4>
              <div class="mt-1 text-sm text-cyan-700">
                本种源 <code class="font-mono">{{ record.seedCode }}</code> 是由 <strong>{{ record.mergedFromIds.length }}</strong> 条历史重复种源合并而成。
                合并操作由「内部种源去重迁移脚本」或运行时写时合并触发。
              </div>
              <div class="mt-2 text-xs text-cyan-600">
                <div>• 合并时间：{{ record.lastReflowAt || '未知' }}</div>
                <div>• 合并回流次数：<strong>{{ record.reflowCount || 0 }}</strong> 次</div>
                <div>• 合并后总数量：<strong>{{ (record.quantity || 0).toLocaleString() }}</strong> {{ record.unit }}</div>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
              被合并的历史种源（共 {{ record.mergedFromIds.length }} 条）
            </div>
            <div class="max-h-96 overflow-y-auto divide-y divide-gray-100">
              <div v-for="(id, idx) in record.mergedFromIds" :key="idx" class="px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50">
                <div class="flex items-center gap-2">
                  <span class="text-gray-400 text-xs w-8">#{{ idx + 1 }}</span>
                  <code class="text-xs font-mono text-gray-700">{{ id }}</code>
                </div>
                <span class="inline-flex items-center rounded-full border border-transparent bg-gray-100 text-gray-900 px-2.5 py-0.5 text-xs font-semibold">archived</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500">
            被合并的种源记录已标记为 archived，不再在种源列表显示，但保留追溯链路。如需恢复，请联系管理员。
          </p>
        </div>
      </el-tab-pane>

      <!-- ============================== -->
      <!-- Tab 7: 冲销记录（始终显示） -->
      <!-- ============================== -->
      <el-tab-pane label="冲销记录" name="inbound-audit">
        <div v-if="auditLoading" class="text-center py-8 text-gray-500">加载中…</div>
        <el-alert v-else-if="auditError" :title="auditError" type="error" :closable="false" show-icon class="mb-3" />
        <div v-else-if="auditLogs.length === 0" class="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <History :size="40" class="mx-auto mb-2 opacity-30" />
          <div class="text-sm">暂无审计日志</div>
          <div class="text-xs mt-1 text-gray-400">
            入库流水被冲销或修改时会记录在此
          </div>
        </div>
        <div v-else class="space-y-2">
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between">
              <span>冲销记录（{{ auditLogs.length }} 条）</span>
              <span class="text-xs text-gray-500">按时间倒序 · 调拨冲销 + 留种回流撤销</span>
            </div>
            <div class="overflow-x-auto max-h-[32rem] overflow-y-auto">
              <table class="w-full text-xs">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
                  <tr>
                    <th class="px-2 py-2 text-left whitespace-nowrap">操作时间</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">操作</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">来源</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">单据号</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">单据日期</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">作物/品种</th>
                    <th class="px-2 py-2 text-right whitespace-nowrap">原数量</th>
                    <th class="px-2 py-2 text-right whitespace-nowrap">数量变化</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">单位</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">供应商/源</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">回流方式</th>
                    <th class="px-2 py-2 text-left whitespace-nowrap">操作人</th>
                    <th class="px-2 py-2 text-left" style="min-width: 180px">撤回原因</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-gray-50">
                    <td class="px-2 py-2 text-gray-600 whitespace-nowrap">
                      {{ log.createdAt ? formatLocalDateTime(log.createdAt) : '-' }}
                    </td>
                    <td class="px-2 py-2 whitespace-nowrap">
                      <span :class="['inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', log.action === 'reverse' ? 'border-transparent bg-red-500 text-gray-50' : 'border-transparent bg-gray-100 text-gray-900']">
                        {{ log.sourceType === 'crop_circulation_records'
                            ? (log.action === 'reverse' ? '撤销' : '修改')
                            : (log.action === 'reverse' ? '冲销' : '修改') }}
                      </span>
                    </td>
                    <td class="px-2 py-2 whitespace-nowrap">
                      <span class="inline-flex items-center rounded-full border text-gray-950 px-2.5 py-0.5 text-xs font-semibold">
                        {{ log.sourceType === 'crop_circulation_records' ? '留种回流' : '调拨入库' }}
                      </span>
                    </td>
                    <td class="px-2 py-2"><code class="text-xs font-mono text-gray-700">{{ log.inboundId }}</code></td>
                    <td class="px-2 py-2 text-gray-600 whitespace-nowrap">{{ log.recordDate ? log.recordDate.split('T')[0] : '-' }}</td>
                    <td class="px-2 py-2 text-gray-700" style="max-width: 180px">
                      {{ log.cropName
                          ? `${log.cropName}${log.varietyName ? ` / ${log.varietyName}` : ''}`
                          : (log.sourceType === 'crop_circulation_records' ? '（作物信息见种源）' : '-') }}
                    </td>
                    <td class="px-2 py-2 text-right text-gray-700 whitespace-nowrap">
                      {{ log.originalQuantity != null ? log.originalQuantity.toLocaleString() : '-' }}
                    </td>
                    <td class="px-2 py-2 text-right whitespace-nowrap">
                      <span :class="log.action === 'reverse' ? 'text-red-600 font-medium' : 'text-amber-600'">
                        {{ formatQtyChange(log) }}
                      </span>
                    </td>
                    <td class="px-2 py-2 text-gray-600 whitespace-nowrap">{{ log.unit || '-' }}</td>
                    <td class="px-2 py-2 text-gray-600 truncate" style="max-width: 120px" :title="log.supplierName || log.sourceId || ''">
                      {{ log.supplierName || log.sourceId || '-' }}
                    </td>
                    <td class="px-2 py-2 text-gray-600 whitespace-nowrap">
                      {{ log.mergeAction === 'create_new' ? '新建种源' : log.mergeAction === 'merge_into_existing' ? '合并命中' : '-' }}
                    </td>
                    <td class="px-2 py-2 text-gray-600 whitespace-nowrap">{{ log.editedByName || log.editedBy || '-' }}</td>
                    <td class="px-2 py-2 text-gray-700" style="max-width: 240px">
                      <div class="line-clamp-2" :title="log.reason || ''">{{ log.reason || '-' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
 * 种源详情弹窗 — V1.1 DetailModal.tsx 1:1 完整对齐
 * 7 Tab 结构（含合并历史、冲销记录、QR 码卡、冲销/撤销对话框）
 */
import { ref, computed, watch, onMounted } from 'vue'
import {
  X, ArrowLeftRight, MoveRight, Package, Store, Sprout,
  Layers, History, AlertTriangle, RotateCcw, Download
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'

// 共用工具
import { todayLocal } from '@/lib/dateUtils'
import { enhancedApiClient } from '@/lib/apiClient'
import { formatSeedForm } from '@/utils/seedFormTranslator'

// V2.0 字典（V1.1 cropConstants + seedSourceDict 合并）
import {
  UNIT_MAP,
  SOURCE_TYPE_MAP,
  SOURCE_ORIGIN_MAP,
  STOCK_STATUS_MAP,
  computeStockStatus,
  TRANSFERRED_FROM_BUSINESS_TYPE_MAP,
  ORIGINAL_SOURCE_MODULE_MAP
} from '@/constants/seedSourceDict'

// Pinia Store（V2.0）
import { useSeedSourceStore } from '@/stores/modules/seedSource'

// 子组件（V2.0 EntityHistoryTimeline 1:1 对齐）
import EntityHistoryTimeline from '@/components/farm/seed-source/components/EntityHistoryTimeline.vue'

// V2.0 自研 QRCode 组件（基于 canvas）
import { QRCode } from '@/components/ui'

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:visible', 'close'])

const activeTab = ref('info')

// ===== 入库模式配置（对齐 V1.1 MODE_CONFIG L54-60） =====
const MODE_CONFIG = {
  planting_self_kept:      { label: '种植留种',  color: 'text-green-700 bg-green-50',  icon: Sprout },
  inventory_transfer:      { label: '库存调拨',  color: 'text-cyan-700 bg-cyan-50',    icon: ArrowLeftRight },
  transfer_from_inventory: { label: '库存调拨',  color: 'text-cyan-700 bg-cyan-50',    icon: ArrowLeftRight },
  external_purchase:       { label: '外购入库',  color: 'text-blue-700 bg-blue-50',    icon: Store },
  external:                { label: '外购入库',  color: 'text-blue-700 bg-blue-50',    icon: Store }
}

// 来源模块中文映射（V1.1 L485-498，与 SeedSourceInboundModal 的 sourceModule 保持一致）
const SOURCE_MODULE_MAP = {
  // inventory_inbound_records 来源
  seed_source: '商品种源入库',
  inventory: '库存调拨',
  inventory_inbound: '外购入库',
  // crop_circulation_records（PROPAGATION 自产回流）来源
  planting: '种植采收回流',
  seedling: '育苗回流',
  harvest: '采收回流',
  // 兜底
  circulation: '作物流转',
  circulation_records: '作物流转',
  inbound: '入库流水'
}

const seedSourceStore = useSeedSourceStore()

const handleClose = () => emit('update:visible', false)

// ===== 计算属性（对齐 V1.1） =====
const hasTransferSource = computed(() => !!props.record?.transferredFromStockId)
const hasMergedHistory = computed(() => Array.isArray(props.record?.mergedFromIds) && props.record.mergedFromIds.length > 0)
const originKey = computed(() => props.record?.sourceOrigin || (props.record?.transferredFromStockId ? 'transfer_from_inventory' : 'external'))
const modeConfig = computed(() => MODE_CONFIG[originKey.value] || MODE_CONFIG.external)
const isExternal = computed(() => originKey.value === 'external' || originKey.value === 'external_purchase')
const isTransfer = computed(() => originKey.value === 'inventory_transfer' || originKey.value === 'transfer_from_inventory' || !!props.record?.transferredFromStockId)
const isPlantingKept = computed(() => originKey.value === 'planting_self_kept')

// 单位格式化（V1.1 SeedSourceBasicInfo formatUnit）
const formatUnit = (unit) => UNIT_MAP[unit] || unit || ''

// 品种路径（V1.1 useSeedSourceVarietyPath 共享 — V2.0 暂时使用简化版，后续接入完整 hook）
const varietyPath = computed(() => {
  const r = props.record
  if (!r) return '—'
  // V1.1 用 useSeedSourceVarietyPath 共享 hook 拼 4 段路径（类别 > 类型 > 品种 > 子品种）
  const parts = []
  if (r.cropCategory) parts.push(r.cropCategory)
  if (r.typeName) parts.push(r.typeName)
  if (r.varietyName) parts.push(r.varietyName)
  if (r.cropVariety && r.cropVariety !== r.varietyName) parts.push(r.cropVariety)
  return parts.length > 0 ? parts.join(' › ') : '—'
})

// 库存状态实时计算（V1.1 computeStockStatus + STOCK_STATUS_MAP）
const statusInfo = computed(() => {
  if (!props.record) return { label: '-', color: 'bg-gray-100 text-gray-800' }
  const key = computeStockStatus(props.record.availableCount, props.record.initialCount)
  return STOCK_STATUS_MAP[key] || { label: key || '-', color: 'bg-gray-100 text-gray-800' }
})

// QR 码链接（V1.1 SeedSourceQrCodeCard L1241：扫码跳转种源详情）
const qrUrl = computed(() => {
  const code = props.record?.seedCode
  if (!code) return ''
  if (typeof window === 'undefined') return `/crop/seed-sources?seedCode=${encodeURIComponent(code)}`
  return `${window.location.origin}/crop/seed-sources?seedCode=${encodeURIComponent(code)}`
})

// 复制 QR 链接（V1.1 SeedSourceQrCodeCard L1252-1257）
const copyQrLink = () => {
  if (!qrUrl.value) return
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(qrUrl.value).then(
      () => { /* ElMessage */ },
      () => { /* fallback */ }
    )
  }
}

// 操作历史 typeColumn（V1.1 EntityDetailModal L48 typeColumn 1:1 迁移）
const historyTypeColumn = computed(() => ({
  label: '入库方式',
  value: modeConfig.value?.label || '—'
}))

// ===== 入库记录 =====
const inboundRecords = ref([])
const inboundLoading = ref(false)
const inboundError = ref(null)

const inboundSummary = computed(() => {
  // 2026-07-18：过滤已冲销记录（C-2 修复）
  const activeRecords = inboundRecords.value.filter(r => !r.reversedAt)
  const totalOriginal = activeRecords.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
  const totalReturned = activeRecords.reduce((s, r) => s + (Number(r.returnedQuantity) || 0), 0)
  const totalReturnable = totalOriginal - totalReturned
  // 取所有行的单位（通常一致，取第一个非空）
  const unit = activeRecords.find(r => r.unit)?.unit || ''
  return { totalOriginal, totalReturned, totalReturnable, unit, count: activeRecords.length }
})

const fetchInboundRecords = async () => {
  if (!props.record?.id) return
  inboundLoading.value = true
  inboundError.value = null
  try {
    // 2026-07-18：改用 getInboundRecords（UNION inventory_inbound + crop_circulation PROPAGATION）
    const data = await enhancedApiClient.get(`/seed-sources/${props.record.id}/history-inbound`)
    inboundRecords.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('[DetailModal] 入库记录加载失败:', e)
    inboundError.value = (e && e.message) || '加载失败'
  } finally {
    inboundLoading.value = false
  }
}

// ===== 冲销/撤销对话框 =====
const reversingRecord = ref(null)
const reverseReason = ref('')
const reverseSubmitting = ref(false)

const closeReverseDialog = () => {
  if (reverseSubmitting.value) return
  reversingRecord.value = null
  reverseReason.value = ''
}

// 2026-07-19: 按 recordSource 路由（调拨 → reverseInbound；留种回流 → revokeCirculation）
const handleReverse = async () => {
  if (!reversingRecord.value || !reverseReason.value.trim()) return
  reverseSubmitting.value = true
  const isCirculation = reversingRecord.value.recordSource === 'crop_circulation_records'
  try {
    if (isCirculation) {
      // 留种回流撤销
      await seedSourceStore.revokeCirculation({
        circulationId: reversingRecord.value.id,
        reason: reverseReason.value.trim()
      })
    } else {
      // 调拨/外购入库冲销
      await seedSourceStore.reverseInbound(props.record.id, {
        inboundRecordId: reversingRecord.value.id,
        reason: reverseReason.value.trim()
      })
    }
    reversingRecord.value = null
    reverseReason.value = ''
    // 刷新种源（更新 remainingQuantity）+ 刷新入库记录（更新 reversedAt 标记）+ 刷新审计
    await seedSourceStore.loadItems()
    await fetchInboundRecords()
    await fetchAuditLogs()
    // 2026-07-18: 跨页面刷新 - 通知 inventory store 同步（库存数量变化）
    try {
      const { useCropInventoryStore } = await import('@/stores/modules/inventory/useCropInventoryStore')
      useCropInventoryStore().notifyChange?.()
    } catch {}
  } catch (e) {
    const msg = (e && e.message) || '未知错误'
    console.error(`[DetailModal] ${isCirculation ? '撤销' : '冲销'}失败:`, e)
  } finally {
    reverseSubmitting.value = false
  }
}

// 2026-07-18: 冲销/撤销按钮点击
const handleReverseClick = (record) => {
  const isCirculation = record.recordSource === 'crop_circulation_records'
  const returnableQty = (record.quantity || 0) - (record.returnedQuantity || 0)
  // 调拨入库（不可整批撤销）但已退完 → 禁用
  if (!isCirculation && returnableQty <= 0) {
    return
  }
  reversingRecord.value = record
}

// 2026-07-18: 键盘快捷键 - Enter 提交（Ctrl+Enter）、Esc 关闭
const handleReverseKeydown = (e) => {
  if (!reversingRecord.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeReverseDialog()
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && reverseReason.value.trim() && !reverseSubmitting.value) {
    e.preventDefault()
    handleReverse()
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
    const data = await enhancedApiClient.get(`/seed-sources/${props.record.id}/usage-records`)
    usageRecords.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('[DetailModal] 使用记录加载失败:', e)
    usageError.value = (e && e.message) || '加载失败'
  } finally {
    usageLoading.value = false
  }
}

// ===== 冲销审计 =====
const auditLogs = ref([])
const auditLoading = ref(false)
const auditError = ref(null)

const fetchAuditLogs = async () => {
  if (!props.record?.id) return
  auditLoading.value = true
  auditError.value = null
  try {
    const data = await enhancedApiClient.get(`/seed-sources/${props.record.id}/inbound-audit`)
    auditLogs.value = Array.isArray(data) ? data : []
  } catch (e) {
    const msg = e instanceof Error ? e.message : '加载失败'
    auditError.value = msg
    console.error('[DetailModal] 审计日志加载失败:', e)
  } finally {
    auditLoading.value = false
  }
}

// ===== 合并历史（V1.1 MergeHistoryPanel L948-990） =====
const mergeHistoryIds = computed(() => props.record?.mergedFromIds || [])

// ===== 格式化（V1.1 InboundAuditPanel formatQtyChange L1043-1050） =====
const formatQtyChange = (log) => {
  if (log.beforeQuantity == null) return '-'
  const before = log.beforeQuantity
  const after = log.afterQuantity ?? 0
  const delta = after - before
  const sign = delta > 0 ? '+' : ''
  return `${before} → ${after}（${sign}${delta}）`
}

// 本地时间格式化（避免 UTC 跨时区，与 V1.1 toLocaleString('zh-CN') 对齐）
const formatLocalDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('zh-CN')
  } catch {
    return dateStr
  }
}

// ===== 导出 Excel（V1.1 InboundRecordsPanel L632-660） =====
const exportInboundExcel = () => {
  // 2026-07-19 P1：Excel 导出增加"记录类型"+"作废状态"列，已冲销行显示"—（已冲销）"
  const headers = ['日期', '入库方式', '入库单号', '作物', '品种', '仓库', '原始数量', '已退数量', '可退数量', '单价', '总金额', '供应商', '操作员', '记录类型', '作废状态', '备注']
  const data = inboundRecords.value.map(r => {
    const isCirculation = r.recordSource === 'crop_circulation_records'
    const isReversed = !!r.reversedAt
    return [
      r.recordDate || '',
      SOURCE_MODULE_MAP[r.sourceModule || ''] || r.sourceModule || '',
      r.id || '',
      r.cropName || '',
      r.varietyName || '',
      r.warehouseName || '',
      r.quantity ?? 0,
      r.returnedQuantity ?? 0,
      isReversed ? '—（已冲销）' : ((r.quantity || 0) - (r.returnedQuantity || 0)),
      r.unitPrice ?? 0,
      r.totalAmount ?? 0,
      r.supplierName || '',
      r.operatorName || '',
      isCirculation ? '留种回流' : '调拨入库',
      isReversed ? (isCirculation ? '已撤销' : '已冲销') : '',
      r.notes || ''
    ]
  })
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '入库记录')
  // 2026-07-10 P0-1 修复：用 todayLocal() 替代 toISOString() 避免 UTC 时区 bug
  const today = todayLocal().replace(/-/g, '')
  XLSX.writeFile(wb, `入库记录_${today}_${inboundRecords.value.length}条.xlsx`)
}

// ===== 导出 Excel（V1.1 UsageRecordsPanel L393-414） =====
const exportUsageExcel = () => {
  const headers = ['日期', '类型', '种源批号', '作物名称', '作物编码', '形态', '数量', '目标种植单', '目标区域', '操作员', '备注']
  const data = usageRecords.value.map(r => [
    r.operationDate || '',
    r.operationType === 'move_in' ? '调入' : '调出',
    r.sourceCode || '',
    r.cropName || '',
    r.cropCode || '',
    r.seedForm ? formatSeedForm(r.seedForm) : '',
    r.quantity ?? 0,
    r.plantingCode || '',
    r.toAreaName || r.fromAreaName || '',
    r.operatorName || '',
    r.remarks || ''
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(() => ({ wch: 16 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '使用记录')
  const today = todayLocal().replace(/-/g, '')
  XLSX.writeFile(wb, `使用记录_${today}_${usageRecords.value.length}条.xlsx`)
}

// ===== 加载策略：按 Tab 激活懒加载（P0-DETAIL-043） =====
watch(activeTab, (val) => {
  if (!props.record?.id) return
  if (val === 'inbound-records' && inboundRecords.value.length === 0 && !inboundLoading.value) {
    fetchInboundRecords()
  }
  if (val === 'usage-records' && usageRecords.value.length === 0 && !usageLoading.value) {
    fetchUsageRecords()
  }
  if (val === 'inbound-audit' && auditLogs.value.length === 0 && !auditLoading.value) {
    fetchAuditLogs()
  }
})

// 打开弹窗时重置状态
watch(() => props.visible, (val) => {
  if (val && props.record?.id) {
    inboundRecords.value = []
    usageRecords.value = []
    auditLogs.value = []
    activeTab.value = 'info'
  }
})

onMounted(() => {
  if (props.visible && props.record?.id) {
    activeTab.value = 'info'
  }
})
</script>

<style scoped>
/* 表格滚动条样式（V1.1 表格 max-h-96） */
:deep(.el-tabs__content) {
  padding: 8px 0;
}
:deep(.el-tabs__header) {
  margin-bottom: 12px;
}
</style>
