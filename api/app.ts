import node from '../shared-model/node';
import express = require('express');
import network from '../shared-model/network';

const app: express.Application = express();

app.get('/', function (req, res) {
  // nodeTest(res);
});

app.listen(4000, function () {
  console.log('Example app listening on port 3000!');
  genNodes(20);
});

function genNodes(numNodes: number): Map<number, node> {
  let map: Map<number, node> = new Map();
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

    map.set(n.id, n);
  }

  console.log(map);
  return map;
}