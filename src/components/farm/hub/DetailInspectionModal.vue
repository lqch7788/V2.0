<template>
  <!-- 巡查记录详情弹窗 -->
  <el-dialog
    :model-value="isOpen"
    title="记录详情"
    width="800px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div v-if="!record" class="text-center py-12 text-gray-500">
      <p>无记录数据</p>
    </div>

    <div v-else class="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      <!-- 巡查类型标签 -->
      <div class="flex items-center gap-2">
        <span v-if="record.inspectionType === 'farm'" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
          种植区域巡查
        </span>
        <span v-else-if="record.inspectionType === 'equipment'" class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
          设备保养巡查
        </span>
        <span v-else-if="record.inspectionType === 'infrastructure'" class="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
          基础设施巡检
        </span>
        <span v-else class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          传统巡查
        </span>
      </div>

      <!-- 基本信息 -->
      <div class="grid grid-cols-2 gap-4">
        <!-- 巡查编号 -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查编号</span>
          <span class="text-sm font-medium text-gray-900 font-mono">{{ record.recordCode }}</span>
        </div>
        <!-- 巡查人员 -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查人员</span>
          <span class="text-sm font-medium text-gray-900">{{ record.inspectorName }}</span>
        </div>
        <!-- 巡查区域 -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查区域</span>
          <span class="text-sm font-medium text-gray-900">{{ record.greenhouseName }}</span>
        </div>
        <!-- 巡查日期 -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查日期</span>
          <span class="text-sm font-medium text-gray-900">{{ record.checkDate }}</span>
        </div>

        <!-- 巡查时间 -->
        <div v-if="record.checkTime" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡查时间</span>
          <span class="text-sm font-medium text-gray-900">{{ record.checkTime }}</span>
        </div>

        <!-- farm类型特有 -->
        <template v-if="record.inspectionType === 'farm'">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">作物名称</span>
            <span class="text-sm font-medium text-gray-900">{{ record.cropName }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">作物状态</span>
            <span class="text-sm font-medium text-gray-900">{{ record.cropStatus }}</span>
          </div>
          <div v-if="record.plantHeight" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">株高</span>
            <span class="text-sm font-medium text-gray-900">{{ record.plantHeight }} cm</span>
          </div>
          <div v-if="record.leafCount" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-600">叶片数</span>
            <span class="text-sm font-medium text-gray-900">{{ record.leafCount }} 片</span>
          </div>
        </template>

        <!-- equipment类型特有 -->
        <div v-if="record.inspectionType === 'equipment'" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">设备名称</span>
          <span class="text-sm font-medium text-gray-900">{{ record.equipmentName }}</span>
        </div>

        <!-- infrastructure类型特有 -->
        <div v-if="record.inspectionType === 'infrastructure'" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">设施名称</span>
          <span class="text-sm font-medium text-gray-900">{{ record.infrastructureName }}</span>
        </div>

        <!-- 状态 -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">状态</span>
          <span :class="getStatusBadgeClass(record.status)">
            {{ getStatusLabel(record.status) }}
          </span>
        </div>

        <!-- 问题处理 -->
        <div v-if="record.issueStatus" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">问题处理</span>
          <span :class="getIssueStatusBadgeClass(record.issueStatus)">
            {{ getIssueStatusLabel(record.issueStatus) }}
          </span>
        </div>

        <!-- 巡检时长 -->
        <div v-if="record.duration" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">巡检时长</span>
          <span class="text-sm font-medium text-gray-900">{{ record.duration }} 分钟</span>
        </div>

        <!-- 关联批次 -->
        <div v-if="record.batchCode" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-600">关联批次</span>
          <span class="text-sm font-medium text-gray-900">{{ record.batchCode }}</span>
        </div>
      </div>

      <!-- 生长环境参数 - 仅farm类型 -->
      <div v-if="record.inspectionType === 'farm' && (record.airTemperature || record.soilTemperature)">
        <h4 class="text-base font-semibold text-gray-900 mb-3">生长环境参数</h4>
        <div class="grid grid-cols-2 gap-6">
          <!-- 空气环境参数 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">空气环境参数</h5>
            <div class="space-y-3">
              <!-- 空气温度 -->
              <div v-if="record.airTemperature" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">空气温度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.airTemperature }}°C</span>
              </div>
              <!-- 空气湿度 -->
              <div v-if="record.airHumidity" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">空气湿度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.airHumidity }}%</span>
              </div>
              <!-- 光照强度 -->
              <div v-if="record.lightIntensity" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">光照强度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.lightIntensity }} Lux</span>
              </div>
              <!-- CO2浓度 -->
              <div v-if="record.co2Concentration" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">CO2浓度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.co2Concentration }} ppm</span>
              </div>
            </div>
          </div>

          <!-- 土壤环境参数 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">土壤环境参数</h5>
            <div class="space-y-3">
              <div v-if="record.soilTemperature" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">土壤温度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.soilTemperature }}°C</span>
              </div>
              <div v-if="record.soilMoisture" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">土壤湿度</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.soilMoisture }}%</span>
              </div>
              <div v-if="record.soilEc" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">土壤EC值</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.soilEc }} mS/cm</span>
              </div>
              <div v-if="record.soilPh" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600">土壤PH值</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ record.soilPh }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 发现问题 -->
      <div v-if="record.issues && record.issues.length > 0">
        <h4 class="text-base font-semibold text-gray-900 mb-3">发现问题</h4>
        <div class="flex gap-2 flex-wrap">
          <span
            v-for="(issue, idx) in record.issues"
            :key="idx"
            class="px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-full"
          >
            {{ issue }}
          </span>
        </div>
      </div>

      <!-- 问题描述 -->
      <div v-if="record.issueText">
        <h4 class="text-base font-semibold text-gray-900 mb-2">问题描述</h4>
        <p class="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{{ record.issueText }}</p>
      </div>

      <!-- 严重程度 -->
      <div v-if="record.issueSeverity" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">严重程度：</span>
        <span :class="getSeverityBadgeClass(record.issueSeverity)">
          {{ record.issueSeverity }}
        </span>
      </div>

      <!-- 反馈人员 -->
      <div v-if="record.feedbackUsers && record.feedbackUsers.length > 0" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">反馈人员：</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="userId in record.feedbackUsers"
            :key="userId"
            class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {{ getUserName(userId) }}
          </span>
        </div>
      </div>

      <!-- 问题照片 -->
      <div v-if="record.issuePhotos && record.issuePhotos.length > 0">
        <h4 class="text-base font-semibold text-gray-900 mb-3">问题照片 (最多6张)</h4>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(img, idx) in record.issuePhotos.slice(0, 6)"
            :key="idx"
            class="aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img :src="img" :alt="`问题照片${idx + 1}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- ========== 问题处理信息区块 ========== -->
      <div v-if="problemData" class="border-t border-gray-200 pt-6">
        <!-- 问题信息卡片 -->
        <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 mb-4 border border-red-100">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span class="w-2 h-2 bg-red-500 rounded-full"></span>
              问题处理信息
            </h4>
            <span :class="getProblemStatusBadgeClass(problemData.status)">
              {{ problemData.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span class="text-sm text-gray-600">问题编号</span>
              <span class="text-sm font-mono font-medium text-gray-900">{{ problemData.problemCode }}</span>
            </div>
            <div v-if="problemData.handler" class="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span class="text-sm text-gray-600">处理人</span>
              <span class="text-sm font-medium text-gray-900">{{ problemData.handler }}</span>
            </div>
            <div v-if="problemData.handleDate" class="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span class="text-sm text-gray-600">处理时间</span>
              <span class="text-sm font-medium text-gray-900">{{ problemData.handleDate }}</span>
            </div>
            <div v-if="problemData.expectedCompletion" class="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span class="text-sm text-gray-600">期望完成</span>
              <span class="text-sm font-medium text-gray-900">{{ problemData.expectedCompletion }}</span>
            </div>
            <div v-if="problemData.completionTime" class="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <span class="text-sm text-gray-600">完成时间</span>
              <span class="text-sm font-medium text-green-700">{{ problemData.completionTime }}</span>
            </div>
          </div>

          <!-- 处理结果 -->
          <div v-if="problemData.handleResult" class="mt-4 p-3 bg-white/60 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">处理结果</div>
            <div class="text-sm text-gray-900">{{ problemData.handleResult }}</div>
          </div>

          <!-- 返工次数警告 -->
          <div v-if="problemData.reworkCount !== undefined && problemData.reworkCount > 0" class="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <span class="text-sm text-amber-700">
              ⚠️ 返工次数：{{ problemData.reworkCount }}次
              <template v-if="problemData.reworkCount >= 2">（已达上限，将重新分派）</template>
            </span>
          </div>

          <!-- 验收按钮 -->
          <div v-if="problemData.status === '待验收' && onAcceptProblem" class="mt-4 pt-4 border-t border-red-200">
            <el-button
              type="primary"
              class="w-full"
              @click="onAcceptProblem(problemData.id)"
            >
              问题验收
            </el-button>
          </div>
        </div>

        <!-- 流转记录区块 -->
        <div v-if="flowRecords.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 class="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>📋</span>
              处理流转记录（{{ flowRecords.length }}条）
            </h4>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="(flowRecord, index) in flowRecords"
              :key="flowRecord.id"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start gap-4">
                <!-- 时间线节点 -->
                <div class="flex flex-col items-center">
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium',
                      getActionNodeColor(flowRecord.action)
                    ]"
                  >
                    {{ index + 1 }}
                  </div>
                  <div
                    v-if="index < flowRecords.length - 1"
                    class="w-0.5 h-full min-h-[40px] bg-gray-200 mt-1"
                  ></div>
                </div>

                <!-- 流转详情 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900">{{ flowRecord.operatorName }}</span>
                      <span :class="getActionBadgeClass(flowRecord.action)">
                        {{ getActionLabel(flowRecord.action) }}
                      </span>
                    </div>
                    <span class="text-xs text-gray-400 whitespace-nowrap">
                      {{ formatTime(flowRecord.actionTime) }}
                    </span>
                  </div>

                  <!-- 状态变化 -->
                  <div v-if="flowRecord.fromStatus || flowRecord.toStatus" class="flex items-center gap-1 mb-1">
                    <span v-if="flowRecord.fromStatus" class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {{ flowRecord.fromStatus }}
                    </span>
                    <span v-if="flowRecord.fromStatus && flowRecord.toStatus" class="text-gray-400">→</span>
                    <span v-if="flowRecord.toStatus" :class="getFlowStatusBadgeClass(flowRecord.toStatus)">
                      {{ flowRecord.toStatus }}
                    </span>
                  </div>

                  <!-- 进度显示 -->
                  <div v-if="flowRecord.progress !== undefined" class="flex items-center gap-2 mb-1">
                    <div class="flex-1 max-w-[120px] bg-gray-200 rounded-full h-1.5">
                      <div
                        class="h-full bg-blue-500 rounded-full"
                        :style="{ width: `${flowRecord.progress}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ flowRecord.progress }}%</span>
                  </div>

                  <!-- 备注/说明 -->
                  <div v-if="flowRecord.comment" class="mt-1 text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                    {{ flowRecord.comment }}
                  </div>

                  <!-- 反馈数据展示 -->
                  <div v-if="flowRecord.feedbackData" class="mt-2 space-y-2">
                    <!-- GPS位置 -->
                    <div v-if="flowRecord.feedbackData.gpsLocation" class="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded px-2 py-1">
                      <span>📍</span>
                      <span>位置打卡：</span>
                      <span class="font-mono">
                        {{ flowRecord.feedbackData.gpsLocation.lat.toFixed(6) }}, {{ flowRecord.feedbackData.gpsLocation.lng.toFixed(6) }}
                      </span>
                    </div>

                    <!-- 作业前照片 -->
                    <div v-if="flowRecord.feedbackData.photosBefore && flowRecord.feedbackData.photosBefore.length > 0" class="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                      <span>📷</span>
                      <span>作业前照片：{{ flowRecord.feedbackData.photosBefore.length }}张</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <img
                          v-for="(img, idx) in flowRecord.feedbackData.photosBefore"
                          :key="idx"
                          :src="img"
                          :alt="`作业前${idx + 1}`"
                          class="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          :title="'点击查看原图'"
                          @click="openImage(img)"
                        />
                      </div>
                    </div>

                    <!-- 作业后照片 -->
                    <div v-if="flowRecord.feedbackData.photosAfter && flowRecord.feedbackData.photosAfter.length > 0" class="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                      <span>📷</span>
                      <span>作业后照片：{{ flowRecord.feedbackData.photosAfter.length }}张</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <img
                          v-for="(img, idx) in flowRecord.feedbackData.photosAfter"
                          :key="idx"
                          :src="img"
                          :alt="`作业后${idx + 1}`"
                          class="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          :title="'点击查看原图'"
                          @click="openImage(img)"
                        />
                      </div>
                    </div>

                    <!-- 物资编码 -->
                    <div v-if="flowRecord.feedbackData.materialCode" class="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1">
                      <span>📦</span>
                      <span>物资编码：{{ flowRecord.feedbackData.materialCode }}</span>
                    </div>

                    <!-- 语音备注 -->
                    <div v-if="flowRecord.feedbackData.voiceNote" class="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                      <span>🎤</span>
                      <span>语音备注（已录音）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无流转记录提示 -->
        <div v-if="flowRecords.length === 0" class="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
          暂无流转记录
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="record.remarks">
        <h4 class="text-base font-semibold text-gray-900 mb-3">备注</h4>
        <p class="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{{ record.remarks }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <el-button @click="onClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ============================================
// 动作类型中文映射（与V1.1完全一致）
// ============================================
const ACTION_LABELS: Record<string, string> = {
  'report': '上报问题',
  'dispatch': '分派任务',
  'accept': '接单',
  'reject': '拒绝任务',
  'start': '开始处理',
  'submit': '提交反馈',
  'approve': '验收通过',
  'reject_acceptance': '验收返工',
  'complete': '完成',
  'comment': '添加备注',
  'progress': '进度更新',
}

// ============================================
// Props 定义
// ============================================
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  onClose: { type: Function, required: true },
  record: { type: Object, default: null },
  onAcceptProblem: { type: Function, default: undefined },
  /** 问题数据（从外部传入） */
  problemData: { type: Object, default: null },
  /** 流转记录列表（从外部传入） */
  problemFlowRecords: { type: Array, default: () => [] },
  /** 用户列表（用于解析用户名） */
  users: { type: Array, default: () => [] },
})

// ============================================
// 计算属性
// ============================================
// 流转记录按时间倒序
const flowRecords = computed(() => {
  const records = props.problemFlowRecords || []
  return [...records].sort((a, b) =>
    new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
  )
})

// ============================================
// 方法
// ============================================
// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取状态标签
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'normal': return 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full'
    case 'warning':
    case 'attention': return 'px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full'
    case 'critical': return 'px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full'
    default: return 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    normal: '正常',
    warning: '注意',
    attention: '需关注',
    critical: '异常',
  }
  return labels[status] || '未知'
}

// 获取问题处理状态标签
const getIssueStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    resolved: 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full',
    processing: 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full',
    pending: 'px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full',
  }
  return classes[status] || 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

const getIssueStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    resolved: '已解决',
    processing: '处理中',
    pending: '待处理',
  }
  return labels[status] || status
}

// 获取严重程度标签
const getSeverityBadgeClass = (severity: string) => {
  const classes: Record<string, string> = {
    '严重': 'px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full',
    '中等': 'px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full',
    '轻微': 'px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full',
  }
  return classes[severity] || 'px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full'
}

// 获取用户名
const getUserName = (userId: string) => {
  const user = (props.users || []).find(u => u.id === userId)
  return user?.name || userId
}

// 获取问题状态标签
const getProblemStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    '待处理': 'px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full',
    '处理中': 'px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full',
    '待验收': 'px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full',
    '已处理': 'px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full',
  }
  return classes[status] || 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
}

// 获取动作节点颜色
const getActionNodeColor = (action: string) => {
  switch (action) {
    case 'approve': return 'bg-green-500'
    case 'reject_acceptance': return 'bg-red-500'
    case 'submit': return 'bg-amber-500'
    case 'dispatch': return 'bg-blue-500'
    case 'report': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

// 获取动作标签
const getActionLabel = (action: string) => {
  return ACTION_LABELS[action] || action
}

// 获取动作标签样式
const getActionBadgeClass = (action: string) => {
  const classes: Record<string, string> = {
    approve: 'px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700',
    reject_acceptance: 'px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700',
    submit: 'px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700',
    dispatch: 'px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700',
    report: 'px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700',
  }
  return classes[action] || 'px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700'
}

// 获取流转状态标签
const getFlowStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    '已处理': 'px-2 py-0.5 text-xs rounded bg-green-100 text-green-700',
    '待验收': 'px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700',
    '处理中': 'px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700',
  }
  return classes[status] || 'px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600'
}

// 打开图片
const openImage = (url: string) => {
  window.open(url, '_blank')
}
</script>
