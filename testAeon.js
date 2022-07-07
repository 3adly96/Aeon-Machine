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
/* timestampFrom is the timestamp that the listener will start listening from 
   segmantDuration is the amount of time the listener will segmant the timestamps*/
const aeon = new Aeon({ cortex , timestampFrom: Date.now(), segmantDuration: 500 });
let count = 0;
setInterval(async () => {
    const a = await aeon.call( {
        id: count++,
        cortex: { method: 'emitToAllOf', args: { type: 'listener', call: 'math.add', data: { a: 1, b: 4 } } },
        at: Date.now() + 30000,
        onError: { method: 'emitToAllOf', args: { type: 'listener', call: 'onError', data: '' } }
    })
    console.log(a)
}, 5000)
