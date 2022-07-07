const SortedSetManager = require('../ion-sortedset');
const debug = require('debug')('aeon-machine');

module.exports = class Aeon {
  constructor({ cortex, timestampFrom, segmantDuration}) {
    this.cortex = cortex;
    this.sortedSet = new SortedSetManager({ url: cortex.stream.url });
    this.consumer = this.sortedSet.consumer({
      timestamp: timestampFrom,
      segmantDuration: segmantDuration,
      key: 'Aeon',
      keepAlive: true,
      onMessage: async (data) => {
        await this.execCortex({ data });
      },
      onError: (data) => { debug(`got error`, data) },
      onClose: () => { debug(`got close`) },
    });
    this.producer = this.sortedSet.producer();

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
      let a = this.producer.emit({ key: 'Aeon', json, timestamp: data.at });
      return a;
    } catch (err) {
      debug('===> Error at cortex call <===');
      debug(err);
      return { error: err }
    }
  }

  async execCortex({ data }) {
    try {
      data = data.value;
      await this.cortex[data.call](data.args,
        (data) => {
          if (data.error && data.OnError) {
            debug(`Error:`, data.error);
            this.execError({ data: data.OnError });
          } else {
            debug(`*** reached listener and returning ***`)
            debug(data);
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






