const os = require('os');
import Store from '@/utils/store'

export default (url, data = {}, headers = {}) =>
  new Promise((resolve, reject) => {
    fetch('https://env-00jy6kohbldz.dev-hz.cloudbasefunction.cn/cjjl' + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Name: process.env.USER || process.env.USERNAME || os.userInfo().username,
        Platform: process.platform,
        Machine: window.id,
        uuid: Store._id || '',
        id: Store.id || '',
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json().then(resolve))
      .catch(reject)
  })
