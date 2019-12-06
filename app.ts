import node from './node';
import express = require('express');

const app: express.Application = express();

app.get('/', function (req, res) {
  nodeTest(res);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function nodeTest(res: any) {
  let nodeArr: node[] = [];
  let connectArr: number[] = [];

  for (let i=0; i < 20; i++) {
    connectArr.push(i);
  }

  for (let i=0; i < 20; i++) {
      let n = new node(i);
      console.log(connectArr);
      let index = Math.round(Math.random() * connectArr.length);
      console.log(index); // figure out why this is throwing nulls

      let c = connectArr.splice(index, 1)[0];
      n.connections.push(c);
      nodeArr.push(n);
  }

  res.send(nodeArr);
}