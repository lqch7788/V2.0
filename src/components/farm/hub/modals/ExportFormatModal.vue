<!--
  农事任务中心 - 导出格式选择弹窗（适配器）
  1:1 对应 V1.1 src/components/farm/hub/modals/ExportFormatModal.tsx
  V1.1 原文件：
    export { ExportFormatModal, ExportFormatModal as default } from '@/components/common/ExportFormatModal';
  V2.0 等价实现：直接 re-export @/components/common/ExportFormatModal.vue
  - props: visible / exportFileType / selectedCount
  - emits: update:visible / confirm / update:exportFileType
-->
<script>
// V2.0: 与 V1.1 一致，从统一组件 re-export
// 注：必须用普通 <script> 而非 <script setup>，因为后者不允许 ES module export
export { default } from '@/components/common/ExportFormatModal.vue'
</script>
