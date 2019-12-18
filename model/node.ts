import network from "./network";
import payload from "./payload";
import DataRange from "./DataRange";
import OrderedMap from "./OrderedMap";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 1000;
    nodeMap: Map<number, node> = new Map(); // nodeId => node
    dataRangeOrderedMap: OrderedMap = new OrderedMap(); // dataRange.start => dataRange

    dataRange: DataRange[] = [];
    dataSlice: Map<number, Object> = new Map();


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
            console.log('node id ' + this.id + ' received payload');
            return this.ping(payload);

        } else if (payload.op === 'r' && payload.pathIndex === payload.path.length - 1) {

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
        
        } else if (payload.op === 'u' && payload.pathIndex === payload.path.length - 1) {

            console.log('node id ' + this.id + ' received final out payload');
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
                    dbItem[key] = changes[key];
                }

                this.dataSlice.set(payload.itemId, dbItem);
            }

            payload.msg = msg;
            payload.item = dbItem;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            return this.ping(payload);


        } else if (payload.pathIndex === 0) {
            return Promise.resolve(payload);

        } else {
            return Promise.resolve("unknown");
        }

    };

    constructor(id: number) {
        this.id = id;


    }

    ping(payload: payload): Promise<Object> {
        if (this.id < 0) { return Promise.resolve('node: I am an invalid node!') }
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

                // console.log(delay / 1000);
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
                    originalNode.dataRangeOrderedMap.set(range.start, JSON.parse(JSON.stringify(range)));
                    if (originalNode.id === 0) {
                        console.log(range);
                        console.log(JSON.stringify(originalNode.dataRangeOrderedMap));
                        console.log(JSON.stringify(originalNode.dataRangeOrderedMap.map.get(1)));

                    }
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
            // because for each node, we need to check each data range (nodes can have multiple data ranges)

            // TODO: make binary search instead of linear
            const highest = this.dataRangeOrderedMap.keysInOrder.length - 1;
            for (let i = highest; i >= 0; i--) {
                let currDataRangeStart = this.dataRangeOrderedMap.keysInOrder[i];
                console.log('current data range start: ' + currDataRangeStart);
                if (currDataRangeStart <= itemId) {
                    targetNode = this.dataRangeOrderedMap.get(currDataRangeStart).nodeId;
                    console.log('target node: ' + targetNode);
                    console.log(this.nodeMap.get(targetNode).dataRange[0]);
                    console.log(JSON.stringify(this.nodeMap.get(targetNode).dataSlice));
                    break;
                }
            }

            if (!targetNode) {
                return Promise.resolve({msg: 'requested id does not exist in db'});
            }
            
            // get the shortest path
            const path = this.shortestPath(targetNode);
            console.log('shortest path to target is: ' + path);

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
            // because for each node, we need to check each data range (nodes can have multiple data ranges)

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
            const path = this.shortestPath(targetNode);
            console.log('shortest path to target is: ' + path);

            let pathIndex = path[0] === this.id ? 1 : 0;
            
            return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'u', itemId: itemId, item: changes, dir: 'out'});
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    insert(item: Object | Object[]): Promise<Object> {
        /**
        * search all nodes for highest data range
        * if there is room in that data range, simply add the data to the node that owns the highest data range
        */
        
        // let highestDataRange = 0;
        // let highestItemId = 0;
        // let highestNodeId = 0;
        // for (let i = 0; i < this.nodeMap.size; i++) {
        //     let currNode = this.nodeMap.get(i);
        //     if (currNode.dataRange[1] > highestDataRange) {
        //         highestDataRange = currNode.dataRange[1];
        //         highestNodeId = currNode.id;
        //     }
        // }

        // if (item instanceof Object && ) {

        // }



         /**
         * if we go into the next index range,
         * do a BFS traversal to figure out which node has the least items
         * assign the new index range randomly among the nodes that have the least items
         * 
         * send the new index range along with data to the target node(s)
         * 
         * on the target nodes in processPayload, if the insert is successful then send a BFS signal to all nodes with target's updated
         * datarange and number of items
         * 
         * TODO: Define some way to update dataRange maps of all nodes upon insert or deletion
         * 
         * 
         */
        return Promise.resolve({unknown: true});
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

    shortestPath(targetId: number): number[] {
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
            if (currId === targetId) {
                break;
            }
        }

        const preRet = connMap.get(targetId);
        let ret: number[] = [];
        if (!!preRet) {
            ret = preRet.path;
        }
        return ret;
    }

    delay(): number {
        return Math.round(Math.random() * this.latency);
    }
}