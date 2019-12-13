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
        }

        // else it's an object, non-index search

        return Promise.resolve({result: 'unknown'});
    }

    shortestPath(id: number): Object {
        const nodes: any[] = [];
        this.nodeMap.forEach( node => {
            if (node.id === this.id) {
                nodes.push({id: node.id, distance: 0, visited: true});
            } else {
                nodes.push({id: node.id, distance: undefined, visited: false});
            }
        });

        this.shortestPathRecursion(nodes, 0, this.nodeMap);
        console.log(nodes);
        console.log('hello!');

        return {};
    }

    shortestPathRecursion(nodes: any[], dist: number, nodeMap: Map<number, node>): void {
        const neighbors: node[] = [];
        this.connections.forEach( id => {
            const conn = nodes.find( (node: any) => node.id === id);
            // if (!conn.visited) {

                if (conn.distance === undefined) {
                    conn.distance = dist + 1;

                } else if (conn.distance > dist + 1) {
                    conn.distance = dist + 1;
                }

                const newNode = nodeMap.get(conn.id);
                if (!!newNode) {
                    neighbors.push(newNode);
                }

            // } else {
            //     return;
            // }
        });

        const me = nodes.find( (node: any) => node.id === this.id);
        me.visited = true;

        neighbors.forEach(neighbor => {
            const conn = nodes.find( (node: any) => neighbor.id === node.id);
            if (!conn.visited) {
                neighbor.shortestPathRecursion(nodes, dist + 1, nodeMap);
            }
        });
        return;
    }

    delay(): number {
        return Math.round(Math.random() * this.latency);
    }
}