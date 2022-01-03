const Cortex = require('ion-cortex');

const cortex = new Cortex({
    prefix: "spacejat",
    url: "redis://127.0.0.1:6379",
    type: 'listener',
    state: () => {
        return {
            info: "listener info"
        }
    }
});

const math = {
    add: async (data) => {
        let sum = data['a'] + data['b'];
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
