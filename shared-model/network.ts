import node from "./node";
import payload from "./payload";

export default class network {
    nodeMap: Map<number, node> = new Map();
    latency: number = 1000;

    constructor(numNodes: number) {
        let connectArr: number[] = [];
        let connectArr2: number[] = [];

        for (let i = 0; i < numNodes; i++) {
            connectArr.push(i);
            connectArr2.push(i);
        }

        for (let i = 0; i < numNodes; i++) {
            let n = new node(i);
            let i1: number;

            do {
                i1 = Math.round(Math.random() * (connectArr.length - 1));
            } while (i1 == i)

            let c1 = connectArr.splice(i1, 1)[0];

            if (Math.round(Math.random())) {
                let i2;

                do {
                    i2 = Math.round(Math.random() * (connectArr2.length - 1));
                } while (i2 == i)

                let c2 = connectArr2.splice(i2, 1)[0];
                n.connections.push(c1);
                n.connections.push(c2);
            } else {
                n.connections.push(c1);
            }

            this.nodeMap.set(n.id, n);
        }
        console.log(this.nodeMap);
    }

    delay(): number {
        return Math.round(Math.random() * this.latency);
    }

    hasNode(id: number): boolean {
        return this.nodeMap.has(id)
    }

    getNode(id: number): node {
        let ret = this.nodeMap.get(id);
        return !!ret ? ret : new node(-1);
    }

    access(payload: payload): Promise<string> {
        let p = new Promise<string>((resolve) => {
            const delay = this.delay();
            setTimeout(() => {
                console.log(delay / 1000);
                let ret = this.nodeMap.get(payload.id);
                !!ret ? resolve(ret.respond(payload)) : resolve("network: no node found for id " + payload.id);
            }, delay);
        });
        
        return p;
    }
}