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

    const [ numCommandsCompleted, setNumCommandsCompleted ] = useState(0);
    const [ totalCommands, setTotalCommands ] = useState(0);
    
    useEffect(() => {
        if (!props.sentInstructions) {
            return;
        }

        let total = 0;
        props.sentInstructions.forEach(instrList => {
            total += instrList.length;
        });

        setTotalCommands(total);

        console.log('api received instr: ', props.sentInstructions);

        const allResponses = [];

        props.sentInstructions.forEach( instrList => {
            for (let i = 0; i < instrList.length; i++) {

                const orig = instrList[i];
                const response = interpretOneCommand(orig.text, true, props.network);
                if (response instanceof Promise) {
                    response.then( (res) => {
                        setNumCommandsCompleted(numCommandsCompleted + 1);

                        orig.res = res;
                        console.log('instr ' + JSON.stringify(orig) + ' received res ' + JSON.stringify(res));
                    });
                }
            }
        });

        const response = new Promise( (resolve, reject) => {
            setTimeout(() => resolve({msg: 'hello!'}), 5000);
        } );
        props.setApiResponse(response);

    }, [props.sentInstructions]);


    useEffect( () => {
        if (!props.sentInstructions) {
            return;
        }

        if (numCommandsCompleted === totalCommands && numCommandsCompleted !== 0 && totalCommands !== 0) {
            console.log('completed all commands!');
            console.log(JSON.stringify(props.sentInstructions));
            setNumCommandsCompleted(0);
            setTotalCommands(0);
        }
    }, [numCommandsCompleted]);

    return ( <></> ); // nothing, this component's only purpose is to simulate an api
}

export function generateNetwork(numNodes: number): Network {
    return new Network(numNodes);
}

export default Api;