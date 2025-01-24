import KEYS from '@/utils/key'
const IPC = require('electron').ipcRenderer

const BUTTON = {
  鼠标左键: 0,
  鼠标右键: 2,
  鼠标滚轮: 1,
}
const SCROLL = {
  向上: 'scrollUp',
  向下: 'scrollDown',
  向左: 'scrollLeft',
  向右: 'scrollRight',
}

export const runAction = async (item, list) =>
  new Promise(async (resolve, reject) => {
    const code = Date.now()
    if (item.type === '鼠标操作') {
      if (item.subType === '移动至') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.setPosition({ x: ${item.x}, y: ${item.y} })
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '点击') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.click(${BUTTON[item.subTypeKey]})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '双击') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.doubleClick(${BUTTON[item.subTypeKey]})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '滚轮') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.${SCROLL[item.subTypeKey]}(${item.scroll})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '按下并按住') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.pressButton(${BUTTON[item.subTypeKey]})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '释放') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ mouse }) => {
              await mouse.releaseButton(${BUTTON[item.subTypeKey]})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
    }
    if (item.type === '键盘操作') {
      if (item.subType === '输入') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ keyboard }) => {
              keyboard.config.autoDelayMs = 1
              await keyboard.type('${item.text}')
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '敲击') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ keyboard }) => {
              keyboard.config.autoDelayMs = 1
              await keyboard.type(${item.keys.map((e) => KEYS[e])})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '按下并按住') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ keyboard }) => {
              keyboard.config.autoDelayMs = 1
              await keyboard.pressKey(${item.keys.map((e) => KEYS[e])})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
      if (item.subType === '释放') {
        IPC.once(code, () => resolve())
        IPC.invoke(
          'EVAL',
          `import('@nut-tree/nut-js').then(async ({ keyboard }) => {
              keyboard.config.autoDelayMs = 1
              await keyboard.releaseKey(${item.keys.map((e) => KEYS[e])})
              window.webContents.send('${code}')
          })`,
        ).catch(() => {})
      }
    }
    if (item.type === '逻辑操作') {
      if (item.subType === '等待执行') {
        await new Promise((resolve) => setTimeout(resolve, item.sleep * 1000))
        resolve()
      }
      if (item.subType === 'JavaScript') {
        window._resolve = resolve
        eval(`(async () => {
          ${item.code}
          window._resolve()
        })()`)
      }
    }
  })

export const getPosition = async () =>
  new Promise((resolve) => {
    const code = Date.now()
    require('electron').ipcRenderer.once(code, (_, pos) => resolve(pos))
    require('electron').ipcRenderer.invoke(
      'EVAL',
      `import('@nut-tree/nut-js').then(async ({ mouse }) => window.webContents.send('${code}', await mouse.getPosition()))`,
    )
  })

// export const center = () => {
//   require('electron').ipcRenderer.invoke(
//     'EVAL',
//     `import('@nut-tree/nut-js').then(async ({ mouse: { getPosition }}) => window.webContents.send('${code}', await getPosition()))`,
//   )
// }
