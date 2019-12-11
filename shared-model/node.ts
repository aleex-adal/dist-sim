import network from "./network";
import payload from "./payload";

export default class node {
    id: number = 0;
    connections: number[] = [];
    latency: number = 1000;
    nodeMap: Map<number, node> = new Map();
    dataSlice: Map<number, number> = new Map();

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

    delay(): number {
        return Math.round(Math.random() * this.latency);
    }
}