const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  status = PENDING
  value = null
  onFulfilledCallbacks = []
  onRejectedCallbacks = []

  constructor(executor) {
    executor(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = value
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()?.(value)
      }
    }
  }

  reject = (value) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.value = value
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()?.(value)
      }
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      // 如果成功
      if (this.status === FULFILLED) {
        const x = onFulfilled(this.value);
        resolvePromise(x, resolve, reject);
      } else if (this.status === REJECTED) {
        onRejected(this.value);
      } else if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(onFulfilled);
        this.onRejectedCallbacks.push(onRejected);
      }
    });
  }
}

function resolvePromise(x, resolve, reject) {
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}

// test.js
const promise = new MyPromise((resolve, _) => {
  setTimeout(() => {
    resolve('success')
  }, 2000);
})

promise.then(value => {
  console.log('resolve', value)
}, reason => {
  console.log('reject', reason)
})
promise.then(() => console.log(123))

// 等待 2s 输出 resolve success
