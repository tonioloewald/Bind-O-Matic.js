/**
# editable-rect

Creates an editable-rect that is absolutely positioned.

The purpose of this is to form a basis for positioning and resizing elements in
a typical drawing program and, in particular, in a user interface. You may also
find the component useful for allowing elements to be positioned or resized in
other contexts.

The rect's size and position are constrained by exactly two of left / right / width
and exactly two of top / bottom / height.

By default, the rect is {left: 0, width: 80, top: 0, height: 40}

If the `constraints` attribute is omitted then the locks will be hidden.

When the a `shiftKey` is depressed dragging will be snapped to a `10px` grid.

If the rect is shrunk below 20px on a side, it will hide some of the controls.

To see the constraints working, **resize** the preview pane or the entire fiddle.

```
<style>
  b8r-editable-rect {
    border: 1px solid rgba(0, 128, 255, 0.5);
    background: rgba(205, 230, 255, 0.5);
  }
</style>
<b8r-editable-rect constraints top="10" bottom="20" left="10" height="NaN" width="NaN" right="178"></b8r-editable-rect>
<b8r-editable-rect constraints top="10" left="NaN" bottom="70" right="20" width="148"></b8r-editable-rect>
<b8r-editable-rect constraints top="NaN" left="NaN" bottom="20" right="20" width="148" height="40"></b8r-editable-rect>
<script>
  import('../web-components/editable-rect.js')
</script>
```
*/

import { makeWebComponent, slot, div, makeElement, dispatch } from '../lib/web-components.js'
import { listenForDragStart, trackDrag } from '../lib/track-drag.js'

const makeSVG = (d, width = 12, height = 12, viewWidth = 16, viewHeight = 16) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('version', '1.1')
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  path.setAttribute('fill', 'rgba(0,128,255,0.5)')
  svg.appendChild(path)
  return svg
}

const locked = makeSVG('M10,8 L10,6 C10,4.8954305 9.1045695,4 8,4 C6.8954305,4 6,4.8954305 6,6 L6,8 L10,8 Z M4,8 L4,6 C4,3.790861 5.790861,2 8,2 C10.209139,2 12,3.790861 12,6 L12,8 C12.5522847,8 13,8.44771525 13,9 L13,14 C13,14.5522847 12.5522847,15 12,15 L4,15 C3.44771525,15 3,14.5522847 3,14 L3,9 C3,8.44771525 3.44771525,8 4,8 Z')
const unlocked = makeSVG('M9,8 C9.55228475,8 10,8.44771525 10,9 L10,14 C10,14.5522847 9.55228475,15 9,15 L1,15 C0.44771525,15 0,14.5522847 0,14 L0,9 C0,8.44771525 0.44771525,8 1,8 L7,8 L7,4 C7,1.790861 8.790861,0 11,0 C13.209139,0 15,1.790861 15,4 L15,7 L13,7 L13,4 C13,2.8954305 12.1045695,2 11,2 C9.8954305,2 9,2.8954305 9,4 L9,8 Z')

export const LockToggle = makeWebComponent('b8r-lock-toggle', {
  attributes: {
    locked: false
  },
  style: {

  },
  content: [
    locked.cloneNode(true),
    unlocked.cloneNode(true)
  ],
  eventHandlers: {
    mouseup () {
      this.locked = !this.locked
      dispatch(this, 'change')
    }
  },
  methods: {
    render () {
      const [locked, unlocked] = this.shadowRoot.querySelectorAll('svg')
      if (this.locked) {
        locked.style.display = ''
        unlocked.style.display = 'none'
      } else {
        locked.style.display = 'none'
        unlocked.style.display = ''
      }
    }
  }
})

const lockToggle = (props = {}) => makeElement('b8r-lock-toggle', props)

const pixelDimension = (number) => isNaN(number) ? '' : number + 'px'

export const EditableRect = makeWebComponent('b8r-editable-rect', {
  attributes: {
    top: 0,
    left: 0,
    bottom: NaN,
    right: NaN,
    width: 80,
    height: 40,
    minWidth: 10,
    minHeight: 10,
    constraints: false
  },
  style: {
    ':host': {
      display: 'block',
      position: 'absolute'
    },
    '.handle': {
      display: 'block',
      width: '8px',
      height: '8px',
      background: 'rgba(0,128,255,0.25)',
      position: 'absolute',
      cursor: 'move'
    },
    '.handle:hover': {
      background: 'rgba(0,128,255,0.5)'
    },
    '.top': {
      top: '-4px'
    },
    '.bottom': {
      bottom: '-4px'
    },
    '.left': {
      left: '-4px'
    },
    '.right': {
      right: '-4px'
    },
    'b8r-lock-toggle': {
      position: 'absolute'
    },
    'b8r-lock-toggle.left': {
      top: '50%',
      left: '-2px',
      transform: 'translateX(-100%) translateY(-50%)'
    },
    'b8r-lock-toggle.right': {
      top: '50%',
      right: '-2px',
      transform: 'translateX(100%) translateY(-50%)'
    },
    'b8r-lock-toggle.top': {
      top: '-2px',
      left: '50%',
      transform: 'translateX(-50%) translateY(-100%)'
    },
    'b8r-lock-toggle.bottom': {
      bottom: '-2px',
      left: '50%',
      transform: 'translateX(-50%) translateY(100%)'
    },
    '.center': {
      width: '11px',
      height: '11px',
      top: '50%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-50%) rotateZ(45deg)'
    }
  },
  content: [
    slot(),
    div({ classes: ['handle', 'top', 'left'] }),
    div({ classes: ['handle', 'top', 'right'] }),
    div({ classes: ['handle', 'bottom', 'left'] }),
    div({ classes: ['handle', 'bottom', 'right'] }),
    div({ classes: ['handle', 'center'] }),
    lockToggle({ classes: ['left'] }),
    lockToggle({ classes: ['top'] }),
    lockToggle({ classes: ['right'] }),
    lockToggle({ classes: ['bottom'] })
  ],
  methods: {
    getBounds () {
      const w = this.offsetParent.offsetWidth
      const h = this.offsetParent.offsetHeight
      return {
        left: isNaN(this.left) ? w - this.right - this.width : this.left,
        right: isNaN(this.right) ? w - this.left - this.width : this.right,
        top: isNaN(this.top) ? h - this.bottom - this.height : this.top,
        bottom: isNaN(this.bottom) ? h - this.top - this.height : this.bottom,
        width: isNaN(this.width) ? w - this.left - this.right : this.width,
        height: isNaN(this.height) ? w - this.top - this.bottom : this.height
      }
    },

    connectedCallback () {
      const editable = this

      if (editable.left && editable.right) editable.width = NaN
      if (editable.top && editable.bottom) editable.height = NaN
      if (editable.width && editable.right) editable.left = NaN
      if (editable.height && editable.bottom) editable.top = NaN

      const topLeft = editable.shadowRoot.querySelector('.top.left')
      listenForDragStart(topLeft, (evt) => {
        const {
          left,
          top
        } = editable.getBounds()
        trackDrag(evt, left, top, (x, y, dx, dy) => {
          if (!isNaN(editable.left)) editable.left += dx
          if (!isNaN(editable.width)) editable.width -= dx
          if (!isNaN(editable.top)) editable.top += dy
          if (!isNaN(editable.height)) editable.height -= dy
        })
      })

      const topRight = editable.shadowRoot.querySelector('.top.right')
      listenForDragStart(topRight, (evt) => {
        const {
          right,
          top
        } = editable.getBounds()
        trackDrag(evt, editable.parentElement.offsetWidth - right, top, (x, y, dx, dy) => {
          if (!isNaN(editable.right)) editable.right -= dx
          if (!isNaN(editable.width)) editable.width += dx
          if (!isNaN(editable.top)) editable.top += dy
          if (!isNaN(editable.height)) editable.height -= dy
        })
      })

      const bottomLeft = editable.shadowRoot.querySelector('.bottom.left')
      listenForDragStart(bottomLeft, (evt) => {
        const {
          left,
          bottom
        } = editable.getBounds()
        trackDrag(evt, left, editable.parentElement.offsetHeight - bottom, (x, y, dx, dy) => {
          if (!isNaN(editable.left)) editable.left += dx
          if (!isNaN(editable.width)) editable.width -= dx
          if (!isNaN(editable.bottom)) editable.bottom -= dy
          if (!isNaN(editable.height)) editable.height += dy
        })
      })

      const bottomRight = editable.shadowRoot.querySelector('.bottom.right')
      listenForDragStart(bottomRight, (evt) => {
        const {
          right,
          bottom
        } = editable.getBounds()
        trackDrag(evt, editable.parentElement.offsetWidth - right, editable.parentElement.offsetHeight - bottom, (x, y, dx, dy) => {
          if (!isNaN(editable.right)) editable.right -= dx
          if (!isNaN(editable.width)) editable.width += dx
          if (!isNaN(editable.bottom)) editable.bottom -= dy
          if (!isNaN(editable.height)) editable.height += dy
        })
      })

      const center = editable.shadowRoot.querySelector('.center')
      listenForDragStart(center, (evt) => {
        const {
          left,
          top,
          width,
          height
        } = editable.getBounds()
        trackDrag(evt, left + width * 0.5, top + height * 0.5, (x, y, dx, dy) => {
          if (!isNaN(editable.right)) editable.right -= dx
          if (!isNaN(editable.left)) editable.left += dx
          if (!isNaN(editable.bottom)) editable.bottom -= dy
          if (!isNaN(editable.top)) editable.top += dy
        })
      })

      const lockLeft = editable.shadowRoot.querySelector('b8r-lock-toggle.left')
      lockLeft.addEventListener('change', function (evt) {
        if (this.locked) {
          editable.left = editable.parentElement.offsetWidth - editable.right - editable.width
          editable.width = NaN
        } else if (!isNaN(editable.width)) {
          editable.right = editable.parentElement.offsetWidth - editable.left - editable.width
          editable.left = NaN
        } else {
          editable.width = editable.parentElement.offsetWidth - editable.left - editable.right
          editable.left = NaN
        }
      })

      const lockRight = editable.shadowRoot.querySelector('b8r-lock-toggle.right')
      lockRight.addEventListener('change', function (evt) {
        if (this.locked) {
          editable.right = editable.parentElement.offsetWidth - editable.left - editable.width
          editable.width = NaN
        } else if (!isNaN(editable.width)) {
          editable.left = editable.parentElement.offsetWidth - editable.right - editable.width
          editable.right = NaN
        } else {
          editable.width = editable.parentElement.offsetWidth - editable.left - editable.right
          editable.right = NaN
        }
      })

      const lockTop = editable.shadowRoot.querySelector('b8r-lock-toggle.top')
      lockTop.addEventListener('change', function (evt) {
        if (this.locked) {
          editable.top = editable.parentElement.offsetHeight - editable.bottom - editable.height
          editable.height = NaN
        } else if (!isNaN(editable.height)) {
          editable.bottom = editable.parentElement.offsetHeight - editable.top - editable.height
          editable.top = NaN
        } else {
          editable.height = editable.parentElement.offsetHeight - editable.top - editable.bottom
          editable.top = NaN
        }
      })

      const lockBottom = editable.shadowRoot.querySelector('b8r-lock-toggle.bottom')
      lockBottom.addEventListener('change', function (evt) {
        if (this.locked) {
          editable.bottom = editable.parentElement.offsetHeight - editable.top - editable.height
          editable.height = NaN
        } else if (!isNaN(editable.height)) {
          editable.top = editable.parentElement.offsetHeight - editable.bottom - editable.height
          editable.bottom = NaN
        } else {
          editable.height = editable.parentElement.offsetHeight - editable.top - editable.bottom
          editable.bottom = NaN
        }
      })

      Object.assign(editable, { center, lockLeft, lockRight, lockTop, lockBottom })
    },

    render () {
      const {
        left,
        top,
        right,
        bottom,
        width,
        height,
        center,
        lockLeft,
        lockRight,
        lockTop,
        lockBottom,
        constraints
      } = this

      this.style.left = pixelDimension(left)
      this.style.top = pixelDimension(top)
      this.style.width = pixelDimension(width)
      this.style.height = pixelDimension(height)
      this.style.right = pixelDimension(right)
      this.style.bottom = pixelDimension(bottom)

      if (!constraints || this.offsetWidth < 20 || this.offsetHeight < 20) {
        [center, lockLeft, lockRight, lockTop, lockBottom].forEach(elt => {
          elt.style.display = 'none'
        })
      } else {
        [center, lockLeft, lockRight, lockTop, lockBottom].forEach(elt => {
          elt.style.display = ''
        })
      }

      lockLeft.locked = !isNaN(this.left)
      lockRight.locked = !isNaN(this.right)
      lockTop.locked = !isNaN(this.top)
      lockBottom.locked = !isNaN(this.bottom)
    }
  }
})
