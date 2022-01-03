const SortedSetManager = require('ion-sortedset');
const debug            = require('debug')('aeon-machine');

module.exports = class Aeon {
    constructor({ cortex }) {
        this.cortex = cortex;
        this.sortedSet = new SortedSetManager({ url: cortex.stream.url });
        this.consumer = this.sortedSet.consumer({
            timestamp: Date.now(),
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

    async addCortexCall({ data }) {
        const cortexCall = data.cortex;
        let args = cortexCall.args;
        let json = {}
        json['call'] = cortexCall.method;
        json['args'] = {
            type: args.type,
            call: args.call,
            data: args.data
        }
        json['onError'] = data.onError
        await this.producer.emit({ key: 'Aeon', json, timestamp: data.at });
        return 'scheduled';
    }

    async execCortex({ data }) {
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
    }

    async execError({ data }) {
        await this.cortex[data.method](data.args, (data) => {
            debug(`*** reached listener and returning error ***`)
            debug(data);
        });
    }
}






