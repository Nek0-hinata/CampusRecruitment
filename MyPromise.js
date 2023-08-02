const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class MyPromise {
  status = PENDING;
  value = null;
  onFulfilledCallbacks = [];
  onRejectedCallbacks = [];

  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()?.(value);
      }
    }
  };

  reject = (value) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.value = value;
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()?.(value);
      }
    }
  };

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function'
        ? onFulfilled
        : value => value;
    onRejected = typeof onRejected === 'function'
        ? onRejected
        : reason => {throw reason;};
    const promise = new MyPromise((resolve, reject) => {
      // 如果成功
      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            // 判断是否自身调用
            resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (this.status === REJECTED) {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (this.status === PENDING) {
        // 等待
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
        // 等到执行成功失败函数的时候再传递
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    return promise;
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(
        new TypeError('Chaining cycle detected for promise #<Promise>'));
  }
  if (x instanceof MyPromise) {
    // 如果是promise，执行.then，改变其状态
    x.then(resolve, reject);
  } else {
    // 普通值直接兑现
    resolve(x);
  }
}

const promise = new MyPromise((resolve, reject) => {
  reject('success');
});
promise.then()
    .then()
    .then(value => console.log(value), reason => console.log(reason));