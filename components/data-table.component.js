/**
# Data Table

Data-table is intended to make quick work of simple tables.

The data-table is highly configurable via its `config` property.

### To Do

- show/hide columns UI (showing/hiding columns is already supported programmatically)
- columns can specify custom headerCell component path or renderer (function)
- columns can specify custom contentCell component path or renderer (function)
- columns can be `sortable: true` or `sortable: (a, b) => -1 | 0 | 1`
- table can have selection: { multiple: true|false, path: 'path.to.prop' } (if no path provided, selection is tracked internally)
- virtual table (minimum number of elements in DOM)
- state persistence to localStorage / services

```
<style>
  ._component_ .loading-component {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
</style>
<b8r-component
  path="../components/data-table.component.js"
  data-bind="
    component(rows)=_component_.rows
    component(config)=_component_.config
  "
>
</b8r-component>
<b8r-component path="../components/loading" data-bind="show_if=_component_.loading"></b8r-component>
<script>
  set('config', {
    columns: [
      {
        name: 'emoji',
        path: '.chars',
        width: 60,
      },
      {
        name: 'code',
        path: '.code',
        width: 100,
      },
      {
        name: 'name',
        path: '.name',
        width: 200,
      },
      {
        name: 'category',
        path: '.category',
        visible: false,
        width: 120,
      },
      {
        name: 'sub-category',
        path: '.subcatory',
        visible: false,
        width: 120,
      },
    ]
  })
  set({loading: true})
  b8r.json('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json').then(rows => {
    set({rows})
    set('loading', false)
  })
</script>
```
*/

import { trackDrag } from '../lib/track-drag.js'

export default {
  css: `
    ._component_ {
      --table-height: 400px;
      --table-width: 100%;
      --columns: 40px 80px 120px 160px 200px auto;
      --table-head-font: bold 14px sans-serif;
      --table-body-font: 14px sans-serif;
      width: var(--table-width);
      height: var(--table-height);
      display: flex;
      flex-direction: column;
      cursor: default;
    }

    ._component_ .t-head {
      flex: 0 0 auto;
      background: var(--black-10);
      font: var(--table-head-font);
    }

    ._component_ .t-body {
      flex: 1 1;
      overflow-y: scroll;
      overflow-y: overlay;
      font: var(--table-body-font);
    }

    ._component_ .t-row {
      display: grid;
      grid-template-columns: var(--columns);
      vertical-align: middle;
      line-height: 20px;
    }

    ._component_ .t-row:nth-child(4n+3),
    ._component_ .t-row:nth-child(4n) {
      background: var(--black-5);
    }

    ._component_ .t-row > * {
      padding: 2px 10px;
    }

    ._component_ .t-head > * {
      padding: 5px 10px;
      position: relative;
    }

    ._component_ .t-head > *+*:before {
      content: ' ';
      position: absolute;
      display: block;
      width: 10px;
      top: 0;
      left: -5px;
      bottom: 0;
    }


    ._component_ .t-head > *+*:after {
      content: ' ';
      position: absolute;
      display: block;
      width: 5px;
      top: 0;
      left: -5px;
      height: 100vh;
      border-left: 1px solid var(--black-10);
      cursor: col-resize;
    }

    ._component_ :not(.t-head).t-row:hover {
      background: var(--black-10);
    }`,
  html: `
    <div class="t-head t-row">
      <span 
        data-list="_component_.visibleColumns(_component_.config.columns):_auto_"
        data-bind="text=.name"
        data-event="mousedown:_component_.resizeColumn"
      ></span>
    </div>
    <div 
      class="t-body" 
      data-bind="method(_component_.renderRow)=."
    >
      <div 
        class="t-row" 
        data-list="_component_.rows:_auto_"
      >
      </div>
    </div>`,
  initialValue: ({ b8r, get, component, on, findOne }) => {
    b8r.addDataBinding(component, 'method(_component_.renderGrid)', '_component_.config.columns')
    return {
      visibleColumns (columns) {
        return columns.filter(({ visible }) => visible !== false)
      },
      resizeColumn (evt) {
        if (evt.offsetX <= 5) {
          console.log(evt.target.textContent, b8r.elementIndex(evt.target))
          const edgeIndex = b8r.elementIndex(evt.target) - 1
          const columns = b8r.cssVar(component, '--columns').split(' ')
          columns.pop()
          const liveResize = get('rows').length <= get('config.maxRowsForLiveColumnResize')
          const widths = columns.map(x => parseInt(x, 10))
          const thead = findOne('.t-head')
          trackDrag(evt, widths[edgeIndex], 0, (w, _y, _dx, _dy, dragEnded) => {
            widths[edgeIndex] = w < 20 ? 20 : w
            const gridSpec = widths.map(w => w + 'px').join(' ') + ' auto'
            if (liveResize || dragEnded) {
              b8r.cssVar(thead, '--columns', '')
              b8r.cssVar(component, '--columns', gridSpec)
            } else {
              b8r.cssVar(thead, '--columns', gridSpec)
            }
          })
        }
      },
      renderGrid (table, columns) {
        const widths = get('visibleColumns')(columns).map(col => col.width + 'px')
        widths[widths.length - 1] = 'auto'
        b8r.cssVar(table, '--columns', widths.join(' '))
      },
      renderRow (tableBody, rowData) {
        const { config, visibleColumns } = get()
        const rowTemplate = tableBody.querySelector('[data-list]')
        rowTemplate.textContent = ''

        if (config.columns) {
          visibleColumns(config.columns)
            .forEach(async ({ path }) => {
              const span = b8r.create('span')
              span.dataset.bind = `text=${path}`
              rowTemplate.appendChild(span)
            })
        }
        b8r.bindAll(rowTemplate)
      },
      config: {
        maxRowsForLiveColumnResize: 100,
        columns: []
      },
      rows: []
    }
  }
}
