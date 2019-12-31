import node from "./node";
import DataRange from "./DataRange";

export default class Network {
    nodeMap: Map<number, node> = new Map();

    // generates a biased graph, but apparently it's similar to real networks
    // TODO: generate a truly random graph
    constructor(numNodes: number, dataRangeSize?: number) {
        if (!dataRangeSize) {
            dataRangeSize = 5;
        }

        // populate nodes
        for (let i = 0; i < numNodes; i++) {
            let n = new node(i);

            if (i > 0) {
                let connectionsToPush = [];
    
                // push a random first connection
                connectionsToPush.push(
                    Math.round(Math.random() * (this.nodeMap.size - 1))
                );

                // 50% chance of having second connection
                if ( i > 1 && Math.round(Math.random())) {
                    connectionsToPush.push(
                        Math.round(Math.random() * (this.nodeMap.size - 1))
                    );
                }

                connectionsToPush.forEach( conn => {
                    n.connections.push(conn);

                    // non-directed graph, directed wouldn't make sense for real networks
                    const connNode = this.nodeMap.get(conn);
                    if (connNode.connections.indexOf(n.id) < 0) {
                        connNode.connections.push(n.id);  
                    }
                });
            }
            
            // populate node's initial data range metadata for use by other nodes on the network
            let initialSlice = i * dataRangeSize;

            const initialRange = new DataRange();
            initialRange.nodeId = n.id;
            initialRange.start = initialSlice;
            initialRange.end = initialSlice + dataRangeSize - 1;
            initialRange.full = true;
            n.dataRange.push(initialRange);

            // populate node's initial data
            for (let i = 0; i < dataRangeSize; i++) {
                n.dataSlice.set(initialSlice + i, {fruit: this.getRandomFruit(initialSlice + i), location: 'in ma head'});
            }

            this.nodeMap.set(n.id, n);
        }

        // after all nodes are created, instruct all nodes to find each other
        this.nodeMap.forEach(node => {
            node.findAllNodes(node, this);
        });
    }

    getNode(id: number): node {
        let ret = this.nodeMap.get(id);
        return !!ret ? ret : new node(-1);
    }

    getRandomNode(): node {
        let ret = this.nodeMap.get(Math.round(Math.random() * (this.nodeMap.size - 1)));
        if (ret === undefined) {
            console.log('network: getRandomNode failed');
        }
        return !!ret ? ret : new node(-1);
    }

    getRandomFruit(num: number): string {
        const rand = Math.random();
        let f: string;

        if (rand < 0.1) {
            f = 'apple';
        } else if (rand < 0.2) {
            f = 'banana';
        } else if (rand < 0.3) {
            f = 'cherry';
        } else if (rand < 0.4) {
            f = 'strawberry';
        } else if (rand < 0.5) {
            f = 'pineapple';
        } else if (rand < 0.6) {
            f = 'tomato';
        } else if (rand < 0.7) {
            f = 'tomahhto';
        } else if (rand < 0.8) {
            f = 'passionfruit';
        } else if (rand < 0.9) {
            f = 'grapefruit';
        } else if (rand < 0.95) {
            f = 'dragonfruit';
        } else {
            f = 'a super expensive Japanese melon';
        }

        return f;
    }
}