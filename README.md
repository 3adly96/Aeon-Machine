
# Aeon-Machine


## Why Aeon-Machine

Aeon-Machine is built to push events to be executed with cortex to ion-sortedset this allows you to trigger any function subscribed in cortex in the future.

## How Does Aeon-Machine work

It schedules the calls in [ion-sortedset](https://www.npmjs.com/package/ion-sortedset) that produces and consumes redis sorted sets in non-blocking manner, then ion-sortedset notifies when a call is its time to trigger to Aeon, then Aeon executes that cortex call.

## Create Aeon-Machine instance

```jsx
const Cortex = require('ion-cortex');
const Aeon = require('aeon-machine');

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
/**
 * timestampFrom is the timestamp that the listener will start listening from 
 * segmantDuration is the amount of time in millseconds the listener will segmant the timestamps and listen to each bulk and executes the calls in each bulk
*/
const aeon = new Aeon({ cortex , timestampFrom: Date.now(), segmantDuration: 500 });
```

## Functions

### call

Used to push an event in the sortedset with a certain timestamp that the event will be executed in.



```jsx

aeon.call({ 
    id: 'adsfjnafsdl',
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
    });

```
id is the unique identifier that is checked if that function was already scheduled with the same id or not if the function was already scheduled then it will not be scheduled again.
### Advanced Example
#### Aeon.js
```jsx

const Cortex = require('ion-cortex');
const Aeon = require('aeon-machine');

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

const aeon = new Aeon({ cortex , timestampFrom: Date.now(), segmantDuration: 500 });

setTimeout(() => {
    aeon.call({ 
        id: 'adsfjnafsdl',
        cortex: { method: 'emitToAllOf', args: { type: 'listener', call: 'math.add', data: { a: 1, b: 4 } } },
        at: Date.now() + 30000,
        onError: { method: 'emitToAllOf', args: { type: 'listener', call: 'onError', data: '' } } 
    })
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