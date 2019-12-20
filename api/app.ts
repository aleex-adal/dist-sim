import node from '../model/node';
import express = require('express');
import network from '../model/network';

import fs from 'fs';
import OrderedMap from '../model/OrderedMap';
import DataRange from '../model/DataRange';

const app: express.Application = express();

app.get('/', function (req, res) {
  // nodeTest(res);
});

app.listen(4000, async () => {
  console.log('Example app listening on port 3000!');
  let net: network = new network(10);
  let n: node = net.getNode(8);

  // console.log(
  //   await n.read(36)
  // );

  // console.log(
  //   await n.update(36, { fruit: 'YOLO_SWAG', extraField: 'This is an extra field!'})
  // );

  console.log(
    await n.insert({ fruit: 'I just inserted this fruit yo'})
  );

  console.log(
    await n.insert({ fruit: 'I just inserted this fruit AGAIN yo'})
  );

  console.log(
    await n.insert({ fruit: '3'})
  );

  console.log(
    await n.insert({ fruit: '4'})
  );

  console.log(
    await n.insert({ fruit: '5'})
  );

  console.log(
    await n.insert({ fruit: '6'})
  );

  console.log(
    await n.delete(54)
  )

  console.log(
    await n.delete(55)
  )

  console.log(
    await n.insert({ fruit: '7'})
  );

});