import network from "./network";
import payload from "./payload";
import DataRange from "./DataRange";
import OrderedMap from "./OrderedMap";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 100;
    nodeMap: Map<number, node> = new Map(); // nodeId => node
    dataRangeOrderedMap: OrderedMap = new OrderedMap(); // dataRange.start => dataRange

    dataRange: DataRange[] = [];
    dataSlice: Map<number, Object> = new Map();

    /**
     * TODO: add vector clocks
     * test that vector clocks function correctly
     * 
     * change insert so that all nodes will point to the same one (least id) when adding a new dataRange
     * 
     * 
     * for concurrent inserts, objects should be stored in arrival order and should not be "switched". if a stale node accidentally sends too many inserts
     * to one node the target node will know because it's data range will fill up and the source node will not be sending a new data range. At that point
     * it should determine a new node with least data and forward inserts to the new node.
     * 
     * test stale node write with concurrent updated node write. Target node should read vector clocks and if stale write arrives second, it should
     * read that the stale vector clock is smaller than the updated write's vector clock, not do the stale write and update stale vector clock to be
     * more recent than the node that was previously updated
     * 
     * The above test cases should work when the instructions come from the same node concurrently because the vector clocks from the source node
     * will indicate proper order. Cool!
     * 
     */

    processPayload: (payload: payload) => Promise<Object> = 
    (payload) => {
        if (payload.hasOwnProperty("msg") && payload.msg === "Hello!") {
            return Promise.resolve("Hello from node " + this.id);

        } else if (payload.pathIndex !== (payload.path.length - 1) && payload.pathIndex !== 0) {

            if (payload.dir === 'out') {
                ++payload.pathIndex;
            }else {
                --payload.pathIndex;
            }
            payload.id = payload.path[payload.pathIndex];
            // console.log('node id ' + this.id + ' received payload');
            return this.ping(payload);

        } else if (payload.op === 'r' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {

            console.log('node id ' + this.id + ' received final out payload');
            let msg = 'itemId ' + payload.itemId + ' was not found in database';

            for (let i = 0; i < this.dataRange.length; i++) {
                if (payload.itemId >= this.dataRange[i].start && payload.itemId <= this.dataRange[i].end) {
                    msg = 'successful';
                    break;
                }
            }

            let item = this.dataSlice.get(payload.itemId);
            
            payload.msg = msg;
            payload.item = item;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            return this.ping(payload);
        
        } else if (payload.op === 'u' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {

            let msg = 'itemId ' + payload.itemId + ' was not found in database';

            for (let i = 0; i < this.dataRange.length; i++) {
                if (payload.itemId >= this.dataRange[i].start && payload.itemId <= this.dataRange[i].end) {
                    msg = 'successful';
                    break;
                }
            }

            let dbItem = this.dataSlice.get(payload.itemId);
            if (dbItem) {
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

            payload.msg = msg;
            payload.item = dbItem;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            return this.ping(payload);


        } else if (payload.op === 'i' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {

            // console.log('node id ' + this.id + ' received final out payload');
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
                        let pathIndex = val.path[0] === this.id ? 1 : 0;
                        this.ping({id: val.path[pathIndex], path: val.path, pathIndex: pathIndex, op: 'updateDataRange', newRange: changedDataRange, dir: 'out'});
                    }
                });
            }

            // changed dataRange must be updated immediately on sending node in case it is sending another insert
            payload.newRange = changedDataRange;

            payload.msg = broadcast;
            payload.item = retItem;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            return this.ping(payload);

        } else if (payload.op === 'updateDataRange' && payload.pathIndex === payload.path.length - 1 && payload.dir === 'out') {
            this.dataRangeOrderedMap.set(payload.newRange.start, payload.newRange);
            return Promise.resolve({msg: 'updateDataRange on node id ' + this.id + ' done'});

        } else if (payload.pathIndex <= 0 && payload.newRange) {
            this.dataRangeOrderedMap.set(payload.newRange.start, payload.newRange);
            return Promise.resolve(payload);

        } else if (payload.pathIndex <= 0) {
            return Promise.resolve(payload);

        } else {
            return Promise.resolve("unknown");
        }

    };

    constructor(id: number) {
        this.id = id;


    }

    ping(payload: payload): Promise<Object> {

        if (this.id < 0) {
            return Promise.resolve('node: I am an invalid node!')

        } else if (payload.path.length === 1 && payload.path[0] === this.id) {
            payload.pathIndex = 0;
            return this.processPayload(payload);
        }

        const nodeToPing = this.nodeMap.get(payload.id);
        if (!nodeToPing) {
            return Promise.resolve('invalid node id requested');
        }

        return this.connections.includes(payload.id) ? nodeToPing.respond(payload) : Promise.resolve("node: this node is not connected to id " + payload.id)
    }

    respond(payload: payload): Promise<Object> {
        return new Promise<Object>((resolve) => {
            const delay = this.delay();
            setTimeout(() => {

                resolve();

            }, delay);
        })
        .then(
            () => this.processPayload(payload)
        );
    }

    // set data that nodes will need to know about other nodes
    // includes node object metadata (not the actual data) and data range information
    // (which node has which range of id's? Is that range full?)
    findAllNodes(originalNode: node, network: network): void {
        this.connections.forEach(id => {
            let newNode = network.getNode(id);
            if (newNode.id >= 0 && !originalNode.nodeMap.has(newNode.id)) {
                originalNode.nodeMap.set(newNode.id, newNode);
                newNode.dataRange.forEach( range => {
                    originalNode.dataRangeOrderedMap.set(range.start, range);
                });
                newNode.findAllNodes(originalNode, network);
            } else {
                return;
            }
        });
    }

    read(itemId: number | Object): Promise<Object> {
        if (typeof itemId === 'number') {
            let targetNode = -1;

            // If we didn't have dataRange start values mapped to node id's, this would be n-squared
            // because for each node, we need to check each data range (and nodes can have multiple data ranges)

            // TODO: make binary search instead of linear
            const highest = this.dataRangeOrderedMap.keysInOrder.length - 1;
            for (let i = highest; i >= 0; i--) {
                let currDataRangeStart = this.dataRangeOrderedMap.keysInOrder[i];
                if (currDataRangeStart <= itemId) {
                    targetNode = this.dataRangeOrderedMap.get(currDataRangeStart).nodeId;
                    break;
                }
            }

            if (!targetNode) {
                return Promise.resolve({msg: 'requested id does not exist in db'});
            }
            
            // get the shortest path
            let prePath = this.shortestPath(targetNode, false);
            let path: number[];
            if (!(prePath instanceof Map)) {
                path = prePath;
            }

            let pathIndex = path[0] === this.id ? 1 : 0;
            return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'r', itemId: itemId, dir: 'out'});
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    update(itemId: number | Object, changes: Object): Promise<Object> {
        if (typeof itemId === 'number') {
            let targetNode = -1;

            // If we didn't have dataRange start values mapped to node id's, this would be n-squared
            // because for each node, we need to check each data range (and nodes can have multiple data ranges)

            // TODO: make binary search instead of linear
            const highest = this.dataRangeOrderedMap.keysInOrder.length - 1;
            for (let i = highest; i >= 0; i--) {
                let currDataRangeStart = this.dataRangeOrderedMap.keysInOrder[i];
                if (currDataRangeStart <= itemId) {
                    targetNode = this.dataRangeOrderedMap.get(currDataRangeStart).nodeId;
                    break;
                }
            }

            if (!targetNode) {
                return Promise.resolve({msg: 'requested id does not exist in db'});
            }
            
            // get the shortest path
            let prePath = this.shortestPath(targetNode, false);
            let path: number[];
            if (!(prePath instanceof Map)) {
                path = prePath;
            }

            let pathIndex = path[0] === this.id ? 1 : 0;
            
            return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'u', itemId: itemId, item: changes, dir: 'out'});
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    insert(item: Object | Object[]): Promise<Object> {
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
             
            return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'i', item: item, dir: 'out'});
        }

        // else assign the new datarange to a node at random
        // TODO: add numItems to nodes and choose the node with the least number of items

        targetNode = Math.round(Math.random() * (this.nodeMap.size - 1));

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
        return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'i', item: item, newRange: newRange, dir: 'out'});
    }

    delete(itemId: number | Object): Promise<Object> {
        return this.update(itemId, {deleted: true});
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
}