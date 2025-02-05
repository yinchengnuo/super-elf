import KEYS from '@/utils/key'

export default {
  鼠标操作: [
    { type: '移动至' },
    { type: '点击', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
    { type: '双击', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
    {
      type: '滚轮',
      action: [{ type: '向上' }, { type: '向下' }, { type: '向左' }, { type: '向右' }],
    },
    {
      type: '按下并按住',
      action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }],
    },
    { type: '释放', action: [{ type: '鼠标左键' }, { type: '鼠标右键' }, { type: '鼠标滚轮' }] },
  ],
  键盘操作: [{ type: '输入' }, { type: '敲击', action: Object.keys(KEYS).map((type) => ({ type })) }, { type: '按下并按住', action: Object.keys(KEYS).map((type) => ({ type })) }, { type: '释放', action: Object.keys(KEYS).map((type) => ({ type })) }],
  逻辑操作: [{ type: '等待执行' }, { type: 'JavaScript' }],
}
