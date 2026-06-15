<!--
  农事任务中心 - 删除警告弹窗（适配器）
  1:1 对应 V1.1 src/components/farm/hub/modals/DeleteWarningModal.tsx
  V1.1 原文件：
    export { DeleteConfirmModal as DeleteWarningModal } from '@/components/ui';
  V2.0 等价实现：直接 re-export @/components/common/DeleteWarningModal.vue
  - props: isOpen / selectedCount / title / description
  - emits: close / confirm / update:isOpen
-->
<script>
// V2.0: 与 V1.1 一致，从统一组件 re-export
// 注：必须用普通 <script> 而非 <script setup>，因为后者不允许 ES module export
export { default } from '@/components/common/DeleteWarningModal.vue'
</script>
