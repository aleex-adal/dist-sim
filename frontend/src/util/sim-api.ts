import Network from "../model/Network";
import { Instruction } from "./interpret";

export function generateNetwork(numNodes: number): Network {
    return new Network(numNodes);
}

export function processInstructions(blocks: Instruction[][]): any {
    console.log('api received instr: ', blocks);
}