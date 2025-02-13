import Store from '@/utils/store'

export default (url, data = {}, headers = {}) =>
  new Promise((resolve, reject) => {
    fetch('https://fc-mp-f3138cb7-2a3b-4344-8e79-a1f65871aab2.next.bspapp.com/cjjl' + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Name: process.env.USER || process.env.USERNAME,
        Platform: process.platform,
        Machine: window.id,
        _id: Store._id || '',
        id: Store.id || '',
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json().then(resolve))
      .catch(reject)
  })
