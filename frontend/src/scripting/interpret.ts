import Network from "../model/Network";

export default function compile(input: string): [{instr: string[], status: string}] {

    input = input.toLowerCase();

    const inputCommands = input.split("\n");
    let instructionBlocks: [{instr: string[], status: string}];
    let ibIndex = 0;

    let normal = true;   // execute all instructions, don't wait
    let inOrder = false; // wait for response before executing next instruction to guarantee order

    for (let i = 0; i < inputCommands.length; ++i) {

        const str = inputCommands[i].trim();
        if (!str.length) {
            continue;

        } else if (str === 'normal') {
            normal = true;
            inOrder = false;
            if (instructionBlocks) {
                ibIndex = instructionBlocks.length; // set ibIndex to the current instruction block that we just initialized
            }
            continue;

        } else if (str === 'in-order') {
            normal = false;
            inOrder = true;
            continue;
        }

        if (!instructionBlocks) {
            instructionBlocks = [{instr: [str], status: 'new'}];
            continue;
        }  

        if (normal && !instructionBlocks[ibIndex]) {
            instructionBlocks.push({instr: [str], status: 'new'});
            ibIndex = instructionBlocks.length - 1; // set ibIndex to the current instruction block that we just initialized

        } else if (normal && instructionBlocks[ibIndex]) {
            instructionBlocks[ibIndex].instr.push(str);

        } else if (inOrder) {
            instructionBlocks.push({instr: [str], status: 'new'});
            ibIndex = instructionBlocks.length; // set ibIndex to the block AFTER this one ie it doesn't exist yet
        }
    }

    return instructionBlocks;
}

export function interpretAllCommands(something: any): any {
    // what do I put here?
    return undefined;
}

export function interpretOneCommand(input: string, network: Network) {

    let inputObj  = {};

    // detect json object and take it out before splitting
    let jsonStartIndex = 0;
    let jsonEndIndex = 0;

    for(let i = 0; i < input.length; i++) {
        if (input[i] === '{') {
            jsonStartIndex = i;
        } else if (input[i] === '}') {
            jsonEndIndex = ++i;
        }
    }

    if (jsonStartIndex && jsonEndIndex) {
        try {
            inputObj = JSON.parse(input.slice(jsonStartIndex, jsonEndIndex));
        } catch (e) {
            return {failure: true, msg: 'entered JSON string ' + input.slice(jsonStartIndex, jsonEndIndex) + ' was invalid. Did you remember to put quotes?'};
        }

        input = input.substring(0, jsonStartIndex);
    }

    let inputArr = input.split(" ");
    let cleanArr: string[] = [];

    inputArr.forEach( (token) => {
        if (token.length !== 0) {
            cleanArr.push(token);
        }
    });

    inputArr = cleanArr;
    let i = 0;

    let concurrent: boolean;
    let nodeId: number;
    let op: 'read' | 'update' | 'insert' | 'delete';
    let itemId: number;

    if (inputArr[i] === 'node' || inputArr[i] === 'n') {
        i++;
    }
    
    if (!isNaN(inputArr[i] as any)) {
        nodeId = parseInt(inputArr[i]);
        i++;
    } else {
        return {failure: true, msg: 'Node id ' + inputArr[i] + ' is invalid'};
    }

    if (inputArr[i] === 'read' || inputArr[i] === 'r') {
        op = 'read';
        i++;

        if (inputArr[i] === 'item' || inputArr[i] === 'i') {
            i++;
        }
        if (!isNaN(inputArr[i] as any)) {
            itemId = parseInt(inputArr[i]);

        } else {
            return {failure: true, msg: 'Item id must be a number, input was ' + inputArr[i]};
        }

    } else if (inputArr[i] === 'update' || inputArr[i] === 'u' || inputArr[i] === 'write' || inputArr[i] === 'w') {
        op = 'update';
        i++;

        if (inputArr[i] === 'item' || inputArr[i] === 'i') {
            i++;
        }
        if (!isNaN(inputArr[i] as any)) {
            itemId = parseInt(inputArr[i]);
            i++;

        } else {
            return {failure: true, msg: 'Item id must be a number, input was ' + inputArr[i]};
        }

    } else if (inputArr[i] === 'insert' || inputArr[i] === 'i') {
        op = 'insert';
        i++;

        if (inputArr[i] === 'item' || inputArr[i] === 'i') {
            i++;
        }

    } else if (inputArr[i] === 'delete' || inputArr[i] === 'd') {
        op = 'delete';
        i++;

        if (inputArr[i] === 'item' || inputArr[i] === 'i') {
            i++;
        }
        if (!isNaN(inputArr[i] as any)) {
            itemId = parseInt(inputArr[i]);
            i++;
        } else {
            return {failure: true, msg: 'Item id must be a number, input was ' + inputArr[i]};
        }

    } else {
        return {failure: true, msg: 'operation ' + inputArr[i] + ' not recognized'};
    }

    // network.getNode(nodeId)
    //return node.op(itemId | JSON)
}