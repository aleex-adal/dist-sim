import network from "./network";
import payload from "./payload";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 1000;
    nodeMap: Map<number, node> = new Map();
    dataSlice: Map<number, Object> = new Map();
    dataRange: number[] = [];

    processPayload: (payload: payload) => string = 
    (payload) => {
        if (payload.hasOwnProperty("msg") && payload.msg === "Hello!") {
            return "Hello from node " + this.id
        } else if (payload.hasOwnProperty("msg")) {
            return "no response";
        } else if (payload.hasOwnProperty("operation")) {
            
            return "whatever";
        } else {
            return "unknown";
        }

    };

    constructor(id: number) {
        this.id = id;
    }

    ping(payload: payload): Promise<string> {
        if (this.id < 0) { return Promise.resolve('node: I am an invalid node!') }
        const nodeToPing = this.nodeMap.get(payload.id);
        let realNode = new node(-1);

        if (!!nodeToPing) {
            realNode = nodeToPing;
        }

        return this.connections.includes(payload.id) ? realNode.respond(payload) : Promise.resolve("node: this node is not connected to id " + payload.id)
    }

    respond(payload: payload): Promise<string> {
        return new Promise<string>((resolve) => {

            const delay = this.delay();
            setTimeout(() => {

                console.log(delay / 1000);
                resolve(this.processPayload(payload));

            }, delay);
        });
    }

    findAllNodes(originalNode: node, network: network): void {
        this.connections.forEach(id => {
            let newNode = network.getNode(id);
            if (newNode.id >= 0 && !originalNode.nodeMap.has(newNode.id)) {
                console.log('node id ' + originalNode.id + ' found node of id ' + newNode.id);
                originalNode.nodeMap.set(newNode.id, newNode);
                newNode.findAllNodes(originalNode, network);
            } else {
                return;
            }
        });
    }

    read(id: number | Object): Promise<Object> {
        if (typeof id === 'number') {
            const range = this.dataRange[1] + 1 - this.dataRange[0];
            const targetRange = Math.floor(id / range);
            const targetNode = targetRange / range;
            
            // get the shortest path
            const path = this.shortestPath(id);
            console.log('shortest path to target is: ' + path);
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
                console.log('found target node early!');
                break;
            }
        }

        console.log(connMap);
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