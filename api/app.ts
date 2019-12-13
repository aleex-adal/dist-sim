import node from '../shared-model/node';
import express = require('express');
import network from '../shared-model/network';

import fs from 'fs';

const app: express.Application = express();

app.get('/', function (req, res) {
  // nodeTest(res);
});

app.listen(4000, async () => {
  console.log('Example app listening on port 3000!');
  let net: network = new network(10);
  // let n: node = net.getRandomNode();

  net.nodeMap = new Map(JSON.parse(fs.readFileSync('out.js', 'utf8')));
  console.log(net.nodeMap);
  let n: node = net.getNode(0);
  console.log(n);


  n = new node(undefined, n);
  n.findAllNodes(n, net);
  console.log(
    await n.ping({id: n.connections[0], msg: "Hello!"})
  );

  n.read(2);
});

function getRandomFruit(): string {
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

function getNm(): Map<number, node> {
  const nm = new Map<number, node>();

  const n0 = new node(0);
  n0.connections.push(4);
  n0.dataRange.push(0);
  n0.dataRange.push(4);
  n0.dataSlice.set(0, {fruit: getRandomFruit(), location: 'in ma head'});
  n0.dataSlice.set(1, {fruit: getRandomFruit(), location: 'in ma head'});
  n0.dataSlice.set(2, {fruit: getRandomFruit(), location: 'in ma head'});
  n0.dataSlice.set(3, {fruit: getRandomFruit(), location: 'in ma head'});
  n0.dataSlice.set(4, {fruit: getRandomFruit(), location: 'in ma head'});
  nm.set(0, n0);

  const n1 = new node(1);
  n1.connections.push(3);
  n1.connections.push(4);
  n1.dataRange.push(5);
  n1.dataRange.push(9);
  n1.dataSlice.set(5, {fruit: getRandomFruit(), location: 'in ma head'});
  n1.dataSlice.set(6, {fruit: getRandomFruit(), location: 'in ma head'});
  n1.dataSlice.set(7, {fruit: getRandomFruit(), location: 'in ma head'});
  n1.dataSlice.set(8, {fruit: getRandomFruit(), location: 'in ma head'});
  n1.dataSlice.set(9, {fruit: getRandomFruit(), location: 'in ma head'});
  nm.set(1, n1);

  const n2 = new node(2);
  n2.connections.push(0);
  n2.dataRange.push(10);
  n2.dataRange.push(14);
  n2.dataSlice.set(10, {fruit: getRandomFruit(), location: 'in ma head'});
  n2.dataSlice.set(11, {fruit: getRandomFruit(), location: 'in ma head'});
  n2.dataSlice.set(12, {fruit: getRandomFruit(), location: 'in ma head'});
  n2.dataSlice.set(13, {fruit: getRandomFruit(), location: 'in ma head'});
  n2.dataSlice.set(14, {fruit: getRandomFruit(), location: 'in ma head'});
  nm.set(2, n2);

  const n3 = new node(3);
  n3.connections.push(0);
  n3.connections.push(1);
  n3.dataRange.push(15);
  n3.dataRange.push(19);
  n3.dataSlice.set(15, {fruit: getRandomFruit(), location: 'in ma head'});
  n3.dataSlice.set(16, {fruit: getRandomFruit(), location: 'in ma head'});
  n3.dataSlice.set(17, {fruit: getRandomFruit(), location: 'in ma head'});
  n3.dataSlice.set(18, {fruit: getRandomFruit(), location: 'in ma head'});
  n3.dataSlice.set(19, {fruit: getRandomFruit(), location: 'in ma head'});
  nm.set(3, n3);

  const n4 = new node(4);
  n4.connections.push(2);
  n4.connections.push(0);
  n4.dataRange.push(20);
  n4.dataRange.push(24);
  n4.dataSlice.set(20, {fruit: getRandomFruit(), location: 'in ma head'});
  n4.dataSlice.set(21, {fruit: getRandomFruit(), location: 'in ma head'});
  n4.dataSlice.set(22, {fruit: getRandomFruit(), location: 'in ma head'});
  n4.dataSlice.set(23, {fruit: getRandomFruit(), location: 'in ma head'});
  n4.dataSlice.set(24, {fruit: getRandomFruit(), location: 'in ma head'});
  nm.set(4, n4);

  return nm;
}