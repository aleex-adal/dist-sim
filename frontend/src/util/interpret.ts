import Network from "../model/Network";
import node from "../model/node";

export interface Instruction {
    instrId: number,
    text: string,
    res?: any,
}

export interface InstructionBlock {
    instructions: Instruction[],
    status: string
}

export function createInstructionBlocks(input: string): InstructionBlock[] {

    input = input.toLowerCase();

    const inputCommands = input.split("\n");
    let instructionBlocks: InstructionBlock[];
    let nextInstructionId = 0;
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
            instructionBlocks = [
                {instructions: [{instrId: nextInstructionId++, text: str}], status: 'new'}
            ];
            continue;
        }  

        if (normal && !instructionBlocks[ibIndex]) {
            instructionBlocks.push({instructions: [{instrId: nextInstructionId++, text: str}], status: 'new'});
            ibIndex = instructionBlocks.length - 1; // set ibIndex to the current instruction block that we just initialized

        } else if (normal && instructionBlocks[ibIndex]) {
            instructionBlocks[ibIndex].instructions.push({instrId: nextInstructionId++, text: str});

        } else if (inOrder) {
            instructionBlocks.push({instructions: [{instrId: nextInstructionId++, text: str}], status: 'new'});
            ibIndex = instructionBlocks.length; // set ibIndex to the block AFTER this one ie it doesn't exist yet
        }
    }

    return instructionBlocks;
}

export function interpretAllCommands(something: any): any {
    // what do I put here?
    return undefined;
}


/**
 * 
 * @param input string command input
 * @param executeCommands if false, this function just checks for bad syntax
 * 
 * @returns Object with .failure either true or false, or the timeline
 */
export function interpretOneCommand(instrId: number, input: string, executeCommands: boolean, network?: Network): any {

    // if command has correct syntax all of these will be populated as necessary
    let inputObj  = undefined;
    let nodeId: number = undefined;
    let op: 'read' | 'update' | 'insert' | 'delete' = undefined;
    let itemId: number = undefined;
    let additionalDelay: number = undefined;

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

    if (jsonStartIndex && !jsonEndIndex) {
        return {failure: true, msg: 'entered JSON string \'' + input.slice(jsonStartIndex, input.length - 1) + '\' was missing a closing bracket'};
    }

    if (jsonStartIndex) {
        try {
            inputObj = JSON.parse(input.slice(jsonStartIndex, jsonEndIndex));
        } catch (e) {
            return {failure: true, msg: 'entered JSON string \'' + input.slice(jsonStartIndex, jsonEndIndex) + '\' was invalid. Did you remember to put quotes?'};
        }

        const beforeJson = input.substring(0, jsonStartIndex);
        let afterJson = undefined;
        if (jsonEndIndex + 1 < input.length) {
            afterJson = input.substring(jsonEndIndex + 1, input.length);
        }

        if (afterJson !== undefined) {
            input = beforeJson + ' ' + afterJson;
        } else {
            input = beforeJson;
        }
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

    if (inputArr[i] === 'node' || inputArr[i] === 'n') {
        i++;
    }
    
    if (!isNaN(inputArr[i] as any)) {
        nodeId = parseInt(inputArr[i]);
        i++;
    } else {
        return {failure: true, msg: 'Node id \'' + inputArr[i] + '\' is invalid'};
    }

    if (inputArr[i] === 'read' || inputArr[i] === 'r') {
        op = 'read';
        i++;

        if (inputArr[i] === 'item' || inputArr[i] === 'i') {
            i++;
        }
        if (!isNaN(inputArr[i] as any)) {
            itemId = parseInt(inputArr[i]);
            i++;

        } else {
            return {failure: true, msg: 'Item id must be a number, input was \'' + inputArr[i] + '\''};
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
            return {failure: true, msg: 'Item id must be a number, input was \'' + inputArr[i] + '\''};
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
            return {failure: true, msg: 'Item id must be a number, input was \'' + inputArr[i] + '\''};
        }

    } else {
        return {failure: true, msg: 'operation \'' + inputArr[i] + '\' not recognized'};
    }

    if (i < inputArr.length && (inputArr[i] === 'delay' || inputArr[i] === 'd')) {
        i++;
        if (!isNaN(inputArr[i] as any)) {
            additionalDelay = parseInt(inputArr[i]);
            i++;
        } else {
            return {failure: true, msg: 'delay must be followed by a number, ' + inputArr[i] + ' is not a number'};
        }
    }

    if (!executeCommands) {
        return {failure: false};

    } else if (executeCommands && !network) {
        return {failure: true, msg: 'A network to perform the operations on must be provided'};
    }

    // now, actually execute the commands lol
    const n = network.getNode(nodeId);

    if (op === 'read') {
        return n.read(itemId, additionalDelay, instrId);

    } else if (op === 'delete') {
        return n.delete(itemId, additionalDelay, instrId);

    } else if (op === 'insert') {
        return n.insert(inputObj, additionalDelay, instrId);
 
    } else if (op === 'update') {
        return n.update(itemId, inputObj, additionalDelay, instrId);
    }
}

export function buildNodeInfoString(n: node): string {
    let dataRangeString = '[{';
    for (let i = 0; i < n.dataRange.length; i++) {
      dataRangeString = dataRangeString.concat('range: ' + n.dataRange[i].start + ' => ' + n.dataRange[i].end + ', full: ' + n.dataRange[i].full);
      if (i + 1 < n.dataRange.length) {
        dataRangeString = dataRangeString.concat('}, {');
      }
    }
    dataRangeString = dataRangeString.concat('}]');

    let dataSliceString = "<span style='color: #18cdfa'>[</span></br>";
    const it = n.dataSlice.entries();

    let val = it.next().value;
    while (!!val) {
      dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>{</span>itemId: " + val[0] + ', ');
      Object.keys(val[1]).forEach( (key) => {
        dataSliceString = dataSliceString.concat(key + ': ' + val[1][key] + ', ');
      });
      dataSliceString = dataSliceString.slice(0, -2); 

      if (val = it.next().value) {
        dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>}</span>,</br>");
      } else {
        dataSliceString = dataSliceString.concat("<span style='color: #f0d976'>}</span></br>");
      }
    }
    dataSliceString = dataSliceString.concat("<span style='color: #18cdfa'>]</span>");

    let infoToPrint = "<span style='color: #dd9f58'>{</span>" + 
      "<span style='color: #f1ef43'>nodeId: </span>"          + n.id                          + ',</br>' +
      "<span style='color: #f1ef43'>connections: </span>" + JSON.stringify(n.connections) + ',</br>' +
      "<span style='color: #f1ef43'>dataRange: </span>"   + dataRangeString                  + ',</br>' +
      "<span style='color: #f1ef43'>dataSlice: </span>"   + dataSliceString   + ',</br>' +
      "<span style='color: #f1ef43'>clock: </span>"       + JSON.stringify(n.clock)       + "<span style='color: #dd9f58'>}</span>";
    
    return infoToPrint;
  }