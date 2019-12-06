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
    let nodeArr = [];
    for (let i=0; i < 20; i++) {
        nodeArr[i] = new node(i);
    }
    res.send(nodeArr);
}