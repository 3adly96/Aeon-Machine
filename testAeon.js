const Cortex = require('ion-cortex');
const Aeon = require('./Aeon');

const cortex = new Cortex({
    prefix: "spacejat",
    url: "redis://default:5x2DNgNcx2K4RqQnusjnfF3f@104.248.33.48:6011",
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
        cortex: { method: 'emitToOneOf', args: { type: 'listener', call: 'math.add', data: { a: 1, b: 4 } } },
        at: Date.now() + 3000,
        onError: { method: 'emitToOneOf', args: { type: 'listener', call: 'onError', data: '' } }
    })
    console.log(a)
}, 20000)
