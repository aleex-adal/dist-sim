import Network from "./Network";
import payload from "./payload";
import DataRange from "./DataRange";
import OrderedMap from "./OrderedMap";

import { Subject } from "rxjs";
import { buildNodeInfoString } from "../util/interpret";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 100;
    nodeMap: Map<number, node> = new Map(); // nodeId => node
    dataRangeOrderedMap: OrderedMap = new OrderedMap(); // dataRange.start => dataRange

    dataRange: DataRange[] = [];
    dataSlice: Map<number, Object> = new Map();

    clock: number[] = [];
    mostRecentWrite: {clock: number[], itemId: number, item: any} = undefined;

    eventStream: Subject<any> = undefined;

    processPayload: (payload: payload, networkLatency: number, additionalDelay: number) => Promise<Object> = 
    (payload, networkLatency, additionalDelay) => {
        if (payload.hasOwnProperty("msg") && payload.msg === "Hello!") {
            return Promise.resolve("Hello from node " + this.id);

        } else if (payload.pathIndex !== (payload.path.length - 1) && payload.pathIndex !== 0) {

            // emit event
            if (payload.op !== 'updateDataRange') {
                this.eventStream.next({
                    instrId: payload.instrId,
                    nodeId: this.id,
                    dir: 'recv',
                    networkLatency: networkLatency,
                    additionalDelay: additionalDelay,
                    msg: 'middle node ' + this.id + ' received payload',
                    payload: JSON.parse(JSON.stringify(payload)),
                    done: false,
                    nodeInfoString: buildNodeInfoString(this),
                });
            }
            

            // don't update clocks if the node is simply forwarding the message. Pretend like sourceNode is sending
            // directly to targetNode
            if (payload.dir === 'out') {
                ++payload.pathIndex;
            }else {
                --payload.pathIndex;
            }
            payload.id = payload.path[payload.pathIndex];

            // emit event
            if (payload.op !== 'updateDataRange') {
                this.eventStream.next({
                    instrId: payload.instrId,
                    nodeId: this.id,
                    dir: 'send',
                    msg: 'middle node ' + this.id + ' changed payload path, is forwarding',
                    payload: JSON.parse(JSON.stringify(payload)),
                    done: false,
                    nodeInfoString: buildNodeInfoString(this),
                });
            }

            return this.ping(payload);

        } else if (payload.op === 'r' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {
            this.syncAndIncrementClock(payload.sourceClock);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'recv',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'final node ' + this.id + ' received payload',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            this.clock[this.id]++; // increment once more because we're sending a message back
            payload.requestClock = payload.sourceClock;
            payload.sourceClock = JSON.parse(JSON.stringify(this.clock));
            // console.log('node id ' + this.id + ' new clock: ' + this.clock);

            let msg = 'itemId ' + payload.itemId + ' was not found in database';

            for (let i = 0; i < this.dataRange.length; i++) {
                if (payload.itemId >= this.dataRange[i].start && payload.itemId <= this.dataRange[i].end) {
                    msg = 'successful';
                    break;
                }
            }

            let item = this.dataSlice.get(payload.itemId);

            // item is a pointer. we need to deep copy it just in case 
            // another operation mutates item while this response is en route
            item = JSON.parse(JSON.stringify(item));
            
            payload.msg = msg;
            payload.item = item;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                msg: 'final node ' + this.id + ' sending read response',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            return this.ping(payload);
        
        } else if (payload.op === 'u' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {
            this.syncAndIncrementClock(payload.sourceClock);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'recv',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'final node ' + this.id + ' received payload',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            let msg = 'itemId ' + payload.itemId + ' was not found in database';

            for (let i = 0; i < this.dataRange.length; i++) {
                if (payload.itemId >= this.dataRange[i].start && payload.itemId <= this.dataRange[i].end) {
                    msg = 'successful';
                    break;
                }
            }

            let dbItem = this.dataSlice.get(payload.itemId);
            const doIncomingWrite = this.sourceHasUpdatedVectorClock(payload);

            if (dbItem && (doIncomingWrite || payload.item.deleted)) {
                let changes = payload.item;

                for (const key of Object.keys(changes)) {
                    if (key === 'deleted' && changes[key] === true) {
                        dbItem = {deleted: true};
                        break;
                    }
                    dbItem[key] = changes[key];
                }
                this.dataSlice.set(payload.itemId, dbItem);
            }

            if ((doIncomingWrite === false) && (!!payload.item.deleted === false)) {
                msg = 'this write has already been overwritten. Returning what is currently in the database';
            }

            if (doIncomingWrite) {
                this.mostRecentWrite = {
                    clock: JSON.parse(JSON.stringify(payload.sourceClock)), // yikes, gotta copy this instead of using pointers
                    itemId: payload.itemId,
                    item: payload.item
                };
            }

            // item is a pointer. we need to deep copy it just in case 
            // another operation mutates item while this response is en route
            dbItem = JSON.parse(JSON.stringify(dbItem));

            payload.msg = msg;
            payload.item = dbItem;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            this.clock[this.id]++;
            payload.requestClock = payload.sourceClock;
            payload.sourceClock = JSON.parse(JSON.stringify(this.clock));

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                msg: 'final node ' + this.id + ' sending update response',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            return this.ping(payload);

        } else if (payload.op === 'i' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {
            this.syncAndIncrementClock(payload.sourceClock);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'recv',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'final node ' + this.id + ' received payload',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });
            
            // increments at the bottom

            let broadcast = 'successful';
            let retItem = {};

            let changedDataRange: DataRange = undefined;

            if (!payload.hasOwnProperty('newRange')) {
                let highestItemId = 0;

                this.dataSlice.forEach( (val, key) => {
                    if (key > highestItemId) {
                        highestItemId = key;
                    }
                });

                payload.itemId  = highestItemId + 1;

                this.dataSlice.set(payload.itemId, payload.item);
                retItem = this.dataSlice.get(payload.itemId);
                this.dataRange.forEach( range => {
                    if (payload.itemId === range.end) {
                        range.full = true;
                        broadcast = 'range that starts at ' + range.start + ' is now full';

                        changedDataRange = range;
                    }
                });

            } else { // we're creating a new data range on this node
                this.dataRange.push(payload.newRange);
                this.dataRangeOrderedMap.set(payload.newRange.start, payload.newRange);
                
                payload.itemId = payload.newRange.start;
                this.dataSlice.set(payload.itemId, payload.item);
                retItem = this.dataSlice.get(payload.itemId);
                broadcast = 'new range ' + JSON.stringify(payload.newRange) + ' added';

                changedDataRange = payload.newRange;
            }

            /**
             * if we filled the current range or created a new one,
             * let all other nodes know
             */
            if (changedDataRange) {
                const connMap = this.shortestPath(0, true);
                let realConnMap: Map<number, {distance: any, visited: boolean, path: number[]}>;
                if (connMap instanceof Map) {
                    realConnMap = connMap;
                }

                realConnMap.forEach( (val, key) => {
                    if (key !== this.id && key !== payload.path[0]) {
                        this.clock[this.id]++;
                        const tempClock = JSON.parse(JSON.stringify(this.clock));
                        let pathIndex = val.path[0] === this.id ? 1 : 0;

                        const payload = {
                            id: val.path[pathIndex],
                            path: val.path,
                            pathIndex: pathIndex,
                            op: 'updateDataRange',
                            newRange: changedDataRange,
                            dir: 'out',
                            sourceClock: tempClock,
                            instrId: key + 99, 
                        };

                        // emit event, but it's too complicated :(
                        // this.eventStream.next({
                        //     instrId: payload.instrId,
                        //     nodeId: this.id,
                        //     dir: 'send',
                        //     msg: 'node ' + this.id + ' emitting initial payload for updateDataRange op',
                        //     payload: JSON.parse(JSON.stringify(payload)),
                        //     done: false,
                        //     nodeInfoString: buildNodeInfoString(this),
                        // });
    
                        this.ping(payload);
                    }
                });
            }

            // item is a pointer. we need to deep copy it just in case 
            // another operation mutates item while this response is en route
            retItem = JSON.parse(JSON.stringify(retItem));

            // changed dataRange must be updated immediately on sending node in case it is sending another insert
            // this doesn't cover the case when the source node incorrectly sends multiple inserts to this node
            // when it should have only sent one insert to this node
            payload.newRange = changedDataRange;

            payload.msg = broadcast;
            payload.item = retItem;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            this.clock[this.id]++;
            payload.requestClock = payload.sourceClock;
            payload.sourceClock = JSON.parse(JSON.stringify(this.clock));
            // console.log('node id ' + this.id + ' new clock: ' + this.clock);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'final node ' + this.id + ' sending insert response',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            return this.ping(payload);

        } else if (payload.op === 'updateDataRange' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {
            this.syncAndIncrementClock(payload.sourceClock);
            // console.log('node id ' + this.id + ' new clock: ' + this.clock);

            this.dataRangeOrderedMap.set(payload.newRange.start, payload.newRange);

            // emit event, but it's too complicated :(
            // this.eventStream.next({
            //     instrId: payload.instrId,
            //     nodeId: this.id,
            //     dir: 'recv',
            //     networkLatency: networkLatency,
            //     additionalDelay: additionalDelay,
            //     msg: 'final node ' + this.id + ' received updateDataRange payload',
            //     payload: JSON.parse(JSON.stringify(payload)),
            //     done: false,
            //     nodeInfoString: buildNodeInfoString(this),
            // });
            
            return Promise.resolve({msg: 'updateDataRange on node id ' + this.id + ' done'});

        } else if (payload.pathIndex <= 0 && payload.newRange) {
            this.syncAndIncrementClock(payload.sourceClock);
            // console.log('node id ' + this.id + ' new clock: ' + this.clock);
        
            this.dataRangeOrderedMap.set(payload.newRange.start, payload.newRange);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'recv',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'original node ' + this.id + ' received response',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            return Promise.resolve(payload);

        } else if (payload.pathIndex <= 0) {
            
            this.syncAndIncrementClock(payload.sourceClock);
            // console.log('node id ' + this.id + ' new clock: ' + this.clock);

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'recv',
                networkLatency: networkLatency,
                additionalDelay: additionalDelay,
                msg: 'original node ' + this.id + ' received response',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });            
        
            return Promise.resolve(payload);

        } else {
            return Promise.resolve("unknown");
        }

    };

    constructor(id: number, eventStream?: Subject<any>) {
        this.id = id;

        if (eventStream) {
            this.eventStream = eventStream;
        }
    }

    ping(payload: payload, additionalDelay?: number): Promise<Object> {

        if (this.id < 0) {
            return Promise.resolve('node: I am an invalid node!')

        } else if (payload.path.length === 1 && payload.path[0] === this.id) {
            payload.pathIndex = 0;
            return this.processPayload(payload, 0, 0);
        }

        const nodeToPing = this.nodeMap.get(payload.id);
        if (!nodeToPing) {
            return Promise.resolve('invalid node id requested');
        }

        if (!additionalDelay) {
            additionalDelay = 0;
        }

        return this.connections.includes(payload.id) ? nodeToPing.respond(payload, additionalDelay) : Promise.resolve("node: this node is not connected to id " + payload.id)
    }

    respond(payload: payload, additionalDelay?: number): Promise<Object> {
        return new Promise<Object>((resolve) => {
            const networkLatency = this.delay();
            const totalDelay = additionalDelay ? networkLatency + additionalDelay : networkLatency

            setTimeout(() => {
                resolve({networkLatency: networkLatency, additionalDelay: additionalDelay});
            }, totalDelay);
        })
        .then(
            (val) => this.processPayload(payload, (val as any).networkLatency, (val as any).additionalDelay)
        );
    }

    // set data that nodes will need to know about other nodes
    // includes node object metadata (not the actual data) and data range information
    // (which node has which range of id's? Is that range full?)
    findAllNodes(originalNode: node, network: Network): void {
        this.connections.forEach(id => {
            let newNode = network.getNode(id);
            if (newNode.id >= 0 && !originalNode.nodeMap.has(newNode.id)) {
                originalNode.nodeMap.set(newNode.id, newNode); // find all other nodes
                newNode.dataRange.forEach( range => { // find all other dataRanges
                    originalNode.dataRangeOrderedMap.set(range.start, range);
                });
                originalNode.clock.push(0); // initialize vector clock
                newNode.findAllNodes(originalNode, network);
            } else {
                return;
            }
        });
    }

    read(itemId: number | Object, additionalDelay?: number, instrId?: number): Promise<Object> {
        this.clock[this.id]++;
        // console.log('node id ' + this.id + ' sending read: ' + this.clock);

        if (typeof itemId === 'number') {
            let targetNode = -1;

            // If we didn't have dataRange start values mapped to node id's, this would be n-squared
            // because for each node, we need to check each data range (and nodes can have multiple data ranges)

            // TODO: make binary search instead of linear
            const highest = this.dataRangeOrderedMap.keysInOrder.length - 1;
            for (let i = highest; i >= 0; i--) {
                let currDataRangeStart = this.dataRangeOrderedMap.keysInOrder[i];
                if (currDataRangeStart <= itemId) {
                    if (this.dataRangeOrderedMap.get(currDataRangeStart) === undefined) {
                        targetNode = undefined;
                    } else {
                        targetNode = this.dataRangeOrderedMap.get(currDataRangeStart).nodeId;
                    }
                    break;
                }
            }

            if (targetNode === undefined) {
                return Promise.resolve({msg: 'requested id does not exist in db'});
            }
            
            // get the shortest path
            let prePath = this.shortestPath(targetNode, false);
            let path: number[];
            if (!(prePath instanceof Map)) {
                path = prePath;
            }

            let pathIndex = path[0] === this.id ? 1 : 0;

            const payload = {
                id: path[pathIndex],
                path: path,
                pathIndex: pathIndex,
                op: 'r',
                itemId: itemId,
                dir: 'out',
                sourceClock: JSON.parse(JSON.stringify(this.clock)),
                instrId: instrId
            };

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                msg: 'node ' + this.id + ' emitting initial payload for read op',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });

            return this.ping(payload, additionalDelay);
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    update(itemId: number | Object, changes: Object, additionalDelay?: number, instrId?: number): Promise<Object> {
        this.clock[this.id]++;
        const updateOrDelete = (changes as any).deleted ? 'delete' : 'update';

        if (typeof itemId === 'number') {
            let targetNode = -1;

            // If we didn't have dataRange start values mapped to node id's, this would be n-squared
            // because for each node, we need to check each data range (and nodes can have multiple data ranges)

            // TODO: make binary search instead of linear
            const highest = this.dataRangeOrderedMap.keysInOrder.length - 1;
            for (let i = highest; i >= 0; i--) {
                let currDataRangeStart = this.dataRangeOrderedMap.keysInOrder[i];
                if (currDataRangeStart <= itemId) {
                    if (this.dataRangeOrderedMap.get(currDataRangeStart) === undefined) {
                        targetNode = undefined;
                    } else {
                        targetNode = this.dataRangeOrderedMap.get(currDataRangeStart).nodeId;
                    }
                    break;
                }
            }

            if (targetNode === undefined) {
                return Promise.resolve({msg: 'requested id does not exist in db'});
            }
            
            // get the shortest path
            let prePath = this.shortestPath(targetNode, false);
            let path: number[];
            if (!(prePath instanceof Map)) {
                path = prePath;
            }

            let pathIndex = path[0] === this.id ? 1 : 0;

            const payload = {
                id: path[pathIndex],
                path: path,
                pathIndex: pathIndex,
                op: 'u',
                itemId: itemId,
                item: changes,
                dir: 'out',
                sourceClock: JSON.parse(JSON.stringify(this.clock)),
                instrId: instrId
            };

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                msg: 'node ' + this.id + ' emitting initial payload for ' + updateOrDelete + ' op',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });
            
            return this.ping(payload, additionalDelay);
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    insert(item: Object | Object[], additionalDelay?: number, instrId?: number): Promise<Object> {
        this.clock[this.id]++;
        // console.log('node id ' + this.id + ' sending insert: ' + this.clock);


        let targetNode = -1;

        /**
        * search all nodes for highest data range
        * if there is room in that data range, simply add the data to the node that owns the highest data range
        */
        
        const highest = this.dataRangeOrderedMap.keysInOrder[this.dataRangeOrderedMap.keysInOrder.length - 1];
        const highestRange = this.dataRangeOrderedMap.get(highest);
        if (highestRange && !highestRange.full) {
            targetNode = highestRange.nodeId;
            // get the shortest path
            let prePath = this.shortestPath(targetNode, false);
            let path: number[];
            if (!(prePath instanceof Map)) {
                path = prePath;
            }
 
            let pathIndex = path[0] === this.id ? 1 : 0;

            const payload = {
                id: path[pathIndex],
                path: path,
                pathIndex: pathIndex,
                op: 'i',
                item: item,
                dir: 'out',
                sourceClock: JSON.parse(JSON.stringify(this.clock)),
                instrId: instrId
            };

            // emit event
            this.eventStream.next({
                instrId: payload.instrId,
                nodeId: this.id,
                dir: 'send',
                msg: 'node ' + this.id + ' emitting initial payload for insert op',
                payload: JSON.parse(JSON.stringify(payload)),
                done: false,
                nodeInfoString: buildNodeInfoString(this),
            });
             
            return this.ping(payload, additionalDelay);
        }

        // else assign the new datarange to a node at random
        // TODO: choose the node with the least number of data ranges, if there are multiple nodes then choose the one
        // with the lowest id

        let dataRangeToNode: [{numDataRange: number, nodeId: number}];

        this.dataRangeOrderedMap.map.forEach( (currDataRange, key) => {

            if (!dataRangeToNode) {
                dataRangeToNode = [{numDataRange: 1, nodeId: currDataRange.nodeId}];
    
            } else if (!dataRangeToNode.find(val => val.nodeId === currDataRange.nodeId)) {
                dataRangeToNode.push({numDataRange: 1, nodeId: currDataRange.nodeId});
    
            } else {
                dataRangeToNode.find(val => val.nodeId === currDataRange.nodeId)
                    .numDataRange++;
            }
        });

        dataRangeToNode.sort((a, b) => a.numDataRange - b.numDataRange);

        let count = 0;
        for (let i = 0; i < dataRangeToNode.length; i++) {
            if (dataRangeToNode[i].numDataRange > dataRangeToNode[0].numDataRange) {
                break;
            }
            count++;
        }

        const leastDataNodes = dataRangeToNode.splice(0, count);
        
        leastDataNodes.sort((a, b) => a.nodeId - b.nodeId);

        targetNode = leastDataNodes[0].nodeId;

        const newRange = new DataRange();
        newRange.start = highestRange.end + 1;
        newRange.end = newRange.start + this.dataRange[0].end - this.dataRange[0].start;
        newRange.full = false;
        newRange.nodeId = targetNode;

        // get the shortest path
        let prePath = this.shortestPath(targetNode, false);
        let path: number[];
        if (!(prePath instanceof Map)) {
            path = prePath;
        }

        let pathIndex = path[0] === this.id ? 1 : 0;

        const payload = {
            id: path[pathIndex],
            path: path,
            pathIndex: pathIndex,
            op: 'i',
            item: item,
            newRange: newRange,
            dir: 'out',
            sourceClock: JSON.parse(JSON.stringify(this.clock)),
            instrId: instrId
        };

        // emit event
        this.eventStream.next({
            instrId: payload.instrId,
            nodeId: this.id,
            dir: 'send',
            msg: 'node ' + this.id + ' emitting initial payload for insert op',
            payload: JSON.parse(JSON.stringify(payload)),
            done: false,
            nodeInfoString: buildNodeInfoString(this),
        });

        return this.ping(payload, additionalDelay);
    }

    delete(itemId: number | Object, additionalDelay?: number, instrId?: number): Promise<Object> {
        return this.update(itemId, {deleted: true}, additionalDelay, instrId);
    }

    recover() {
        // if ping hits a node that no longer exists, use parity (one parity node per 2 data nodes)
        // to recover the lost node

        // with this method, 1 out of every 3 nodes can fail and db is 1.33x the size without safety
        // with straight up replication, you can lose 1 out of every 2 nodes but the db is 2x the size
    }

    retry() {
        // if any operation fails at any point in the path, track the node where it failed and retry 2 or 3 times
        // if the same node failed all of those times, kill it and recover!
    }

    shortestPath(targetId: number, returnConnMap?: boolean): number[] | Map<number, {distance: any, visited: boolean, path: number[]}> {
        const connMap: Map<number, {distance: any, visited: boolean, path: number[]}> = new Map();

        this.nodeMap.forEach( node => {
            if (node.id === this.id) {
                connMap.set(node.id, {distance: 0, visited: true, path: [node.id]});
            } else {
                connMap.set(node.id, {distance: undefined, visited: false, path: []});
            }
        });

        const jobQ = [this.id];
        while (jobQ.length > 0) {

            // pop current node
            const currId = jobQ.splice(0, 1)[0];
            
            const preCurrConn = connMap.get(currId);
            let currConn: {distance: any, visited: boolean, path: number[]} = {distance: -1, visited: false, path: []}
            if (!!preCurrConn) {
                currConn = preCurrConn;
            }

            const preCurrNode = this.nodeMap.get(currId);
            let currNode: node = new node(-1)
            if (!!preCurrNode) {
                currNode = preCurrNode;
            }

            // add connections to jobQ for BFS order
            currNode.connections.forEach( id => {
                const nextConn = connMap.get(id);
                if (!!nextConn && !nextConn.visited) {
                    nextConn.distance = currConn.distance + 1;
                    nextConn.path = currConn.path.concat([id]);
                    jobQ.push(id);
                }
            });

            // mark currConn as visited
            currConn.visited = true;
            if (!returnConnMap && currId === targetId) {
                break;
            }
        }

        if (returnConnMap) {
            return connMap;
        } else {
            const preRet = connMap.get(targetId);
            let ret: number[] = [];
            if (!!preRet) {
                ret = preRet.path;
            }
            return ret;
        }
    }

    delay(): number {
        return Math.round(Math.random() * this.latency);
    }

    syncAndIncrementClock(sourceClock: number[]): void {
        sourceClock.forEach( (val, i) => {
            if (val > this.clock[i]) {
                this.clock[i] = val;
            }
        });
        this.clock[this.id]++;
    }

    sourceHasUpdatedVectorClock(payload: payload): boolean {

        // if the source/request vector clock is updated, we will do the write
        // if the source/request vector clock is behind our most recent write,
        // we will ignore the incoming write
        let doIncomingWrite = false;

        if (this.mostRecentWrite === undefined) {
            // console.log('VC: returning true because this is the first write');
            return true;
        }
        

        // console.log('inside VC stuff');
        // console.log('mostRecentWrite: ' + JSON.stringify(this.mostRecentWrite));
        // console.log('payload sourceClock: ' + JSON.stringify(payload.sourceClock));

        for ( let i = 0; i < this.mostRecentWrite.clock.length; i++) {
            if (this.mostRecentWrite.clock[i] < payload.sourceClock[i]) {
                // then the source is either concurrent with or more updated than our last write
                // therefore, we will do this write
                doIncomingWrite = true;
                break;
            }
        } // else, we won't do this write because it is behind the most recent write. It is logically in the past

        // console.log('doIncomingWrite is ' + doIncomingWrite);
        return doIncomingWrite;
    }

    emitEvent(event: any): void {
        if (this.eventStream) {
            this.eventStream.next(event);
        }
    }
}