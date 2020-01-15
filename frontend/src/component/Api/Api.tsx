import React, { useEffect, useState } from 'react';
import Network from "../../model/Network";
import { Instruction, interpretOneCommand } from "../../util/interpret";
import {Subject, Subscription} from 'rxjs';

interface ApiProps {
    numNodes?: number,
    network: Network,
    setNetwork: React.Dispatch<React.SetStateAction<Network>>,
    sentInstructions: Instruction[][],
    setApiResponse: React.Dispatch<React.SetStateAction<Promise<any>>>,
    simFinishedExecuting: boolean;
}

const Api: React.FunctionComponent<ApiProps> = (props) => {

    const [ eventStream ] = useState(new Subject<any>());
    const [ emittedEvents, setEmittedEvents ] = useState([]);
    const [ finishedExecuting, setFinishedExecuting ] = useState(false);

    useEffect( () => {
        props.setNetwork(generateNetwork(10));
    }, []);

    const generateNetwork = (numNodes: number) => {
        return new Network(numNodes, 3, eventStream);
    }

    useEffect(() => {
        // don't execute more backend stuff until the sim is done
        if (!props.sentInstructions || props.simFinishedExecuting === false) {
            return;
        }

        const subscription = eventStream.subscribe((event) => { emittedEvents.push(event) });
        executeAllCommands(props.sentInstructions, 0, subscription);

        /** 
         node 0 read 5
         node 0 read 6

         in-order
         node 0 write 7 {"hello": "hello!"}
         node 0 write 7 {"hello": "second edit!"}

         n 0 u 6 {"hello":"hello"}
         n 0 r 6
         
         in-order
         n 0 d 6
        */

    }, [props.sentInstructions]);

    useEffect( () => {
        if (!finishedExecuting) {
            return;
        }
        props.setApiResponse(JSON.parse(JSON.stringify(emittedEvents)));

        setEmittedEvents([]);
        setFinishedExecuting(false);
        
    }, [finishedExecuting]);


    const executeAllCommands = (instrLists: Instruction[][], index: number, subs: Subscription) => {

        if (index === instrLists.length) {
            console.log('completed all commands!');
            console.log(props.sentInstructions);

            subs.unsubscribe();
            setFinishedExecuting(true);

            return {done: true};
        }

        const currList = instrLists[index];
        const totalInList = currList.length;
        let numCompletedInList = 0;

        // all commands in this single block/list execute concurrently, but we only execute the next block/list
        // when all commands in the current block/list resolve. This preserves the normal vs in-order execution methods
        for (let i = 0; i < currList.length; i++) {

            const originalInstr = currList[i];
            const response = interpretOneCommand(originalInstr.instrId, originalInstr.text, true, props.network);
            if (response instanceof Promise) {
                response.then( (res) => {
                    numCompletedInList++;

                    originalInstr.res = res;
                    // console.log('instr ' + originalInstr.instrId + ' completed');

                    if (numCompletedInList === totalInList) {
                        // console.log('completed this list/block!');
                        return executeAllCommands(instrLists, ++index, subs);
                    }
                });
            }
        }
    };

    return ( <></> ); // nothing, this component's only purpose is to simulate an api
};

export default Api;