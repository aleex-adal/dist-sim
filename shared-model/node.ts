import network from "./network";
import payload from "./payload";

export default class node {
    id: number = 0;
    connections: number[] = [];
    process: (payload: payload) => string
        = (payload) => payload.msg === "Hello!" ? "Hello from node " + this.id : "no response";

    constructor(id: number) {
        this.id = id;
    }

    ping(payload: payload, network: network): Promise<string> {
        if (this.id < 0) { return Promise.resolve('node: I am an invalid node!') }

        return this.connections.includes(payload.id) ? network.access(payload) : Promise.resolve("node: this node is not connected to id " + payload.id)
    }

    respond(payload: payload): string {
        return this.process(payload);
    }
}