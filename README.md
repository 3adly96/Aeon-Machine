
# Aeon-Machine


## Why Aeon-Machine

Aeon-Machine is built to push events to be executed with cortex to ion-sortedset.

## Create Aeon-Machine instance

```jsx
const Cortex = require('ion-cortex');
const Aeon = require('Aeon-Machine');

const cortex = new Cortex({
    prefix: "spacejat",
    url: "redis://127.0.0.1:6379",
    type: 'TimeMachine',
    state: () => {
        return {
            info: "TimeMachine Info"
        }
    }
});

const aeon = new Aeon({ cortex });
```

## Functions

### addCortexCall

Used to push an event in the sortedset with a certain timestamp that the event will be executed in.



```jsx

const data = {
    cortex: {
              method: 'emitToAllOf', 
              args: {
                      type: 'listener',
                      call: 'math.add',
                      data: { a: 1, b: 4 } 
              }
    },
    at: Date.now() + 30000,
    onError:{
              method: 'emitToAllOf',
              args: { 
                    type: 'listener',
                    call: 'onError',
                    data: '' 
                    }
            }
}

aeon.addCortexCall({ data });


```

### Advanced Example
#### Aeon.js
```jsx

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

```
#### listener.js

```jsx
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

```