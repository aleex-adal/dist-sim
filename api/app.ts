import node from '../shared-model/node';
import express = require('express');
import network from '../shared-model/network';

const app: express.Application = express();

app.get('/', function (req, res) {
  // nodeTest(res);
});

app.listen(4000, async () => {
  console.log('Example app listening on port 3000!');
  let nodelist: network = new network(20);
  let firstNode: node = nodelist.getNode(0);

  firstNode.findAllNodes(firstNode, nodelist);
  console.log(
    await firstNode.ping({id: firstNode.connections[0], msg: "Hello!"})
  );
});