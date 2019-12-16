import network from "./network";
import payload from "./payload";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 1000;
    nodeMap: Map<number, node> = new Map();
    dataSlice: Map<number, Object> = new Map();
    dataRange: number[] = [];

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
            let msg = 'successful';

            if (payload.itemId < this.dataRange[0] || payload.itemId > this.dataRange[1]) {
                msg = 'itemId ' + payload.itemId + ' was not in dataRange ' + this.dataRange;
            }

            let item = this.dataSlice.get(payload.itemId);
            if (!item) {
                msg = 'itemId ' + payload.itemId + ' was not found in database';
            }

            payload.msg = msg;
            payload.item = item;
            payload.dir = 'in';
            payload.id = payload.path[--payload.pathIndex];

            return this.ping(payload);
        
        } else if (payload.op === 'r' && payload.pathIndex === 0) {
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

    findAllNodes(originalNode: node, network: network): void {
        this.connections.forEach(id => {
            let newNode = network.getNode(id);
            if (newNode.id >= 0 && !originalNode.nodeMap.has(newNode.id)) {
                originalNode.nodeMap.set(newNode.id, newNode);
                newNode.findAllNodes(originalNode, network);
            } else {
                return;
            }
        });
    }

    read(itemId: number | Object): Promise<Object> {
        if (typeof itemId === 'number') {
            const range = this.dataRange[1] + 1 - this.dataRange[0];
            const targetNode = Math.floor(itemId / range);
            
            // get the shortest path
            const path = this.shortestPath(targetNode);
            console.log('shortest path to target is: ' + path);

            let pathIndex = path[0] === this.id ? 1 : 0;
            
            return this.ping({id: path[pathIndex], path: path, pathIndex: pathIndex, op: 'r', itemId: itemId, dir: 'out'});
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
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