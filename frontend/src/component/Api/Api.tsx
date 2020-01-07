import React, { useEffect, useState } from 'react';
import Network from "../../model/Network";
import { Instruction, interpretOneCommand } from "../../util/interpret";

interface ApiProps {
    numNodes?: number,
    network: Network,
    sentInstructions: Instruction[][],
    setApiResponse: React.Dispatch<React.SetStateAction<Promise<any>>>,
}

const Api: React.FunctionComponent<ApiProps> = (props) => {
    
    useEffect(() => {
        if (!props.sentInstructions) {
            return;
        }

        let total = 0;
        props.sentInstructions.forEach(instrList => {
            total += instrList.length;
        });

        let numCompleted = 0;

        // setTotalCommands(total);

        console.log('api received instr: ', props.sentInstructions);

        const allResponses = [];

        executeAllCommands(props.sentInstructions, 0);

        /** 
         node 0 read 5
         node 0 read 6

         in-order
         node 0 write 7 {"hello": "hello!"}
         node 0 write 7 {"hello": "second edit!"}
        */

    }, [props.sentInstructions]);


    const executeAllCommands = (instrLists: Instruction[][], index: number) => {

        if (index === instrLists.length) {
            console.log('completed all commands!');
            return {done: true};
        }

        const currList = instrLists[index];
        const totalInList = currList.length;
        let numCompletedInList = 0;

        // all commands in this single block/list execute concurrently, but we only execute the next block/list
        // when all commands in the current block/list resolve. This preserves the normal vs in-order execution methods
        for (let i = 0; i < currList.length; i++) {

            const originalInstr = currList[i];
            const response = interpretOneCommand(originalInstr.text, true, props.network);
            if (response instanceof Promise) {
                response.then( (res) => {
                    numCompletedInList++;

                    originalInstr.res = res;
                    console.log('instr: ' + JSON.stringify(originalInstr) + ' received res: ' + JSON.stringify(res));

                    if (numCompletedInList === totalInList) {
                        console.log('completed this list/block!');
                        console.log(JSON.stringify(currList));
                        return executeAllCommands(instrLists, ++index);
                    }
                });
            }
        }
    };

    return ( <></> ); // nothing, this component's only purpose is to simulate an api
}

export function generateNetwork(numNodes: number): Network {
    return new Network(numNodes);
}

export default Api;