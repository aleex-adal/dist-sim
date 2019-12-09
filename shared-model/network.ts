import node from "./node";
import payload from "./payload";

export default class network {
    nodeMap: Map<number, node> = new Map();

    constructor(map: Map<number, node>) {
        this.nodeMap = map;
    }

    hasNode(id: number) {
        return this.nodeMap.has(id)
    }

    access(payload: payload): string {
        let ret = this.nodeMap.get(payload.id);
        return !!ret ? ret.respond(payload) : "network: no node found";
    }
}