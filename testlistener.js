const Cortex = require('ion-cortex');
const NanoTimer = require('nanotimer');
const timer        = new NanoTimer();

const cortex = new Cortex({
    prefix: "spacejat",
    url: "redis://default:5x2DNgNcx2K4RqQnusjnfF3f@104.248.33.48:6011",
    type: 'listener',
    state: () => {
        return {
            info: "listener info"
        }
    },
    defaultTimeout: 10000
});

const math = {
    add: async (data) => {
        let sum = data['a'] + data['b'];
        await delay('6s')
        return sum
    },
    sub: async (data) => {
        let sum = data['a'] - data['b'];
        return sum
    },
    mult: async (data) => {
        let sum = data['a'] * data['b'];
        return sum
    },
    div: async (data) => {
        let sum = data['a'] / data['b'];
        return sum
    }
}

const startListener = () => {

    setTimeout(() => {
        console.log("*** nodes ***")
        console.log(cortex.nodes)
    }, 2000);

    cortex.sub("onError", (data, meta, cb) => {
        console.log(`*** Responsing ***`)
        console.log('Error');
        cb(`Error`)
    })

    cortex.sub('math.*', async (data, meta, cb) => {
        if (!data) {
            console.log(`*** Error: No Data sent ***`);
            cb("Error: No Data sent")
        } else {
            console.log(`*** Responsing ***`)
            console.log(data);
            console.log(meta);
            let event = meta.event.split(".")[1]
            try {
                let result = await math[event](data);
                if (result) {
                    cb(result)
                } else {
                    cb("Error")
                }
            } catch (error) {
                console.log("Function is not found")
                cb("Function is not found")
            }
        }
    })
}

startListener();

async function delay(time) {
    return new Promise((resolve, reject) => {
      timer.setTimeout(() => {
        resolve(true);
      }, '', time)
    })
  }