<template>
  <ElModal
    :model-value="show"
    title="供应商详情"
    :width="700"
    :height="600"
    @update:model-value="(v) => { if (!v) $emit('close') }"
    @close="$emit('close')"
  >

      <div class="overflow-y-auto space-y-4 text-sm">
        <!-- 基本信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">基本信息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">供应商编号</span>
                <span class="text-sm font-medium text-gray-900">{ detailSupplier?.code }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应商名称</span>
                <span class="text-sm font-medium text-gray-900">{ detailSupplier?.name }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应类型</span>
                <span class="text-sm text-gray-700">{ detailSupplier ? getSupplierTypeName(detailSupplier.supplierType) : '' }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">供应商属性</span>
                <span class="text-sm text-gray-700">{ detailSupplier?.supplierAttribute }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">所属组织</span>
                <span class="text-sm text-gray-700">{ detailSupplier?.organization }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">状态</span>
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-700': detailSupplier?.status === '合作中',
                  'bg-yellow-100 text-yellow-700': detailSupplier?.status === '暂停',
                  'bg-red-100 text-red-700': detailSupplier?.status === '终止'
                }">{ detailSupplier?.status }</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">联系方式</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">联系人</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.contact }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">移动电话</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.mobilePhone }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">工作电话</span>
                <span class="text-sm text-gray-700">{ detailSupplier?.workPhone || '-' }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">传真</span>
                <span class="text-sm text-gray-700">{ detailSupplier?.fax || '-' }</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 地址信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">地址信息</h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span class="text-xs text-gray-500 block">国家/地区</span>
              <span class="text-sm text-gray-900">{ detailSupplier?.country }</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">省份</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.province }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">城市</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.city }</span>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500 block">详细地址</span>
              <span class="text-sm text-gray-900">{ detailSupplier?.address }</span>
            </div>
          </div>
        </div>

        <!-- 银行信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">银行信息</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 block">开户行</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.bankName || '-' }</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 block">银行卡号</span>
                <span class="text-sm text-gray-900">{ detailSupplier?.bankCardNumber || '-' }</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-3">其他信息</h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span class="text-xs text-gray-500 block">创建时间</span>
              <span class="text-sm text-gray-900">{ detailSupplier?.createDate }</span>
            </div>
            <div v-if="detailSupplier?.remarks">
              <span class="text-xs text-gray-500 block">备注</span>
              <span class="text-sm text-gray-700">{ detailSupplier.remarks }</span>
            </div>
            <div v-if="detailSupplier?.lastEditBy">
              <span class="text-xs text-gray-500 block">最后编辑人</span>
              <span class="text-sm text-gray-700">{ detailSupplier.lastEditBy }</span>
            </div>
            <div v-if="detailSupplier?.lastEditTime">
              <span class="text-xs text-gray-500 block">最后编辑时间</span>
              <span class="text-sm text-gray-700">{ detailSupplier.lastEditTime }</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button size="small" @click="showDetailModal = false">关闭</el-button>
        </div>
      </template>
    
  </ElModal>
</template>

<script setup>
import { ElModal } from '@/components/ui'
defineProps({
  show: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>
