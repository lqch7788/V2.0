/**
 * el-dialog 8方向缩放指令
 * 用法：<el-dialog v-dialog-resizable> ... </el-dialog>
 * 拖拽四角/四边缩放弹窗（与 v-dialog-draggable 配合使用）
 *
 * 对标 V1.1 useDragResize.tsx 中的 startResize + resizeHandles 实现
 */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export const vDialogResizable = {
  mounted(el, binding) {
    const options = binding.value || {}
    const minWidth = options.minWidth || 400
    const minHeight = options.minHeight || 300
    const maxWidth = options.maxWidth || window.innerWidth
    const maxHeight = options.maxHeight || window.innerHeight

    requestAnimationFrame(() => {
      const body = el.querySelector('.el-dialog')
      if (!body) return

      body.style.position = 'relative'

      // 创建 8 个把手
      const handles = [
        { dir: 'nw', cursor: 'nw-resize', style: 'top:-3px;left:-3px;width:10px;height:10px;' },
        { dir: 'ne', cursor: 'ne-resize', style: 'top:-3px;right:-3px;width:10px;height:10px;' },
        { dir: 'sw', cursor: 'sw-resize', style: 'bottom:-3px;left:-3px;width:10px;height:10px;' },
        { dir: 'se', cursor: 'se-resize', style: 'bottom:-3px;right:-3px;width:10px;height:10px;' },
        { dir: 'n', cursor: 'n-resize', style: 'top:-3px;left:10px;right:10px;height:6px;' },
        { dir: 's', cursor: 's-resize', style: 'bottom:-3px;left:10px;right:10px;height:6px;' },
        { dir: 'w', cursor: 'w-resize', style: 'left:-3px;top:10px;bottom:10px;width:6px;' },
        { dir: 'e', cursor: 'e-resize', style: 'right:-3px;top:10px;bottom:10px;width:6px;' },
      ]

      const handleEls = []

      handles.forEach(({ dir, cursor, style }) => {
        const handle = document.createElement('div')
        handle.className = `v-dialog-resize-handle v-dialog-resize-${dir}`
        handle.style.cssText = `position:absolute;z-index:1;cursor:${cursor};${style}`
        body.appendChild(handle)
        handleEls.push(handle)

        const onMouseDown = (e) => {
          if (e.button !== 0) return
          e.preventDefault()
          e.stopPropagation()

          const rect = body.getBoundingClientRect()
          const startX = e.clientX
          const startY = e.clientY
          const startW = rect.width
          const startH = rect.height

          const onMouseMove = (ev) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY

            let dw = 0, dh = 0
            if (dir.includes('e')) dw = dx
            if (dir.includes('w')) dw = -dx
            if (dir.includes('s')) dh = dy
            if (dir.includes('n')) dh = -dy

            const newW = clamp(startW + dw, minWidth, maxWidth)
            const newH = clamp(startH + dh, minHeight, maxHeight)

            body.style.width = `${newW}px`
            body.style.minWidth = `${newW}px`
            body.style.maxWidth = `${newW}px`
          }

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }

        handle.addEventListener('mousedown', onMouseDown)
        handle.__cleanup = () => handle.removeEventListener('mousedown', onMouseDown)
      })

      el.__resizeHandleEls = handleEls
    })
  },

  unmounted(el) {
    if (el.__resizeHandleEls) {
      el.__resizeHandleEls.forEach((handle) => {
        if (handle.__cleanup) handle.__cleanup()
        handle.remove()
      })
      delete el.__resizeHandleEls
    }
  },
}

export default vDialogResizable