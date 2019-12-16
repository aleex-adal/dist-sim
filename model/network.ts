import node from "./node";

export default class network {
    nodeMap: Map<number, node> = new Map();

    // generates a biased graph, but apparently it's similar to real networks
    // TODO: generate a truly random graph
    constructor(numNodes: number, dataRange?: number) {
        if (!dataRange) {
            dataRange = 5;
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
                    this.nodeMap.get(conn).connections.push(n.id);  
                });
            }
            
            // populate node's data slice
            let initialSlice = i * dataRange;
            n.dataRange = [initialSlice, initialSlice + dataRange - 1];
            for (let i = 0; i < dataRange; i++) {
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