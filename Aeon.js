const SortedSetManager = require('../ion-sortedset');
const debug = require('debug')('aeon-machine');

process.on("SIGTERM", function () {
  console.log('aeon process existed: SIGTERM')
  process.exit(1)
});

process.on("SIGINT", function () {
  console.log('aeon process existed: SIGINT');
  setTimeout(() => {
      process.exit(1)
  }, 2000);
});

process.on('exit', () => {
  console.log('exit aeon')
  setTimeout(() => {
      process.exit(1)
  }, 2000);
})

process.on('error', function (err) {
  console.log(err);
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.log(reason);
  promise.then(e => console.log(e)).catch(e => console.log(e));
  process.exit(1);
})

process.on('uncaughtException', function (err) {
  console.log(err);
  process.exit(1);
})

module.exports = class Aeon {
  constructor({ cortex, timestampFrom, segmantDuration}) {
    this.cortex       = cortex;
    this.key          = 'Aeon';
    this.executionkey = 'AeonExecution';
    this.sortedSet    = new SortedSetManager({ url: cortex.stream.url });
    this.consumer     = this.sortedSet.consumer({
      timestamp: timestampFrom,
      segmantDuration: segmantDuration,
      key: this.key,
      executionkey: this.executionkey,
      keepAlive: true,
      onMessage: async (data) => {
        await this.execCortex({ data });
      },
      onError: (data) => { debug(`got error`, data) },
      onClose: () => { debug(`got close`) },
    });
    this.producer   = this.sortedSet.producer();
  }

  async call({ id, cortex, at, onError }) {
    let data = { id, cortex, at, onError }
    try {
      const cortexCall = data.cortex;
      let args = cortexCall.args;
      let json = {}
      json['id']   = id;
      json['call'] = cortexCall.method;
      json['args'] = {
        type: args.type,
        call: args.call,
        data: args.data
      }
      json['onError'] = data.onError
      return this.producer.emit({ key: this.key, json, timestamp: data.at });
    } catch (err) {
      debug('===> Error at cortex call <===');
      debug(err);
      return { error: err }
    }
  }

  async execCortex({ data }) {
    try {
      this.cortex[data.value.call](data.value.args, (result) => {
          if (result.error) {
            debug(`Error: ${result.error} with args`);
            debug(data.value.args);
            if (data.value.onError) this.execError({ data: data.value.onError });
          } else {
            debug(`*** reached listener and returning ***`)
            debug(result);
            this.producer.setAsExecuted({ executionkey: this.executionkey, id: data.id, json: data.value })
          }
        });
    } catch (err) {
      debug('===> Error at execCortex <===');
      debug(err);
    }
  }

  async execError({ data }) {
    await this.cortex[data.method](data.args, (data) => {
      debug(`*** reached listener and returning error ***`)
      debug(data);
    });
  }
}






