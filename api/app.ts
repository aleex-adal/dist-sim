import node from '../shared-model/node';
import express = require('express');
import network from '../shared-model/network';

const app: express.Application = express();

app.get('/', function (req, res) {
  // nodeTest(res);
});

app.listen(4000, async () => {
  console.log('Example app listening on port 3000!');
  let net: network = new network(20);
  let node: node = net.getNode(0);

  console.log(
    await node.ping({id: node.connections[0], msg: "Hello!"}, net)
  );
});