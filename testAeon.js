const Cortex = require('ion-cortex');
const Aeon = require('./Aeon');

const cortex = new Cortex({
    prefix: "spacejat",
    url: "redis://127.0.0.1:6379",
    type: 'TimeMachine',
    state: () => {
        return {
            info: "listener info"
        }
    }
});
const aeon = new Aeon({ cortex });

const data = {
    cortex: { method: 'emitToAllOf', args: { type: 'listener', call: 'math.add', data: { a: 1, b: 4 } } },
    at: Date.now() + 30000,
    onError: { method: 'emitToAllOf', args: { type: 'listener', call: 'onError', data: '' } }
}
setTimeout(() => {
    aeon.addCortexCall({ data })
}, 5000)
