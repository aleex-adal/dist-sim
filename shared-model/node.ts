import network from "./network";
import payload from "./payload";

export default class node {
    id: number = 0;
    connections: number[] = [];

    constructor(id: number) {
        this.id = id;
    }

    ping(payload: payload, network: network): string {
        return this.connections.includes(payload.id) ? network.access(payload) : "node: this node is not connected to id " + payload.id;
    }

    respond(payload: payload): string {
        return payload.msg === "Hello!" ? "Hello from node " + this.id : "no response";
    }
}