import React, { useEffect, useState } from 'react';
import Network from "../../model/Network";
import { Instruction } from "../../util/interpret";

interface ApiProps {
    numNodes?: number,
    network: Network,
    sentInstructions: Instruction[][]
}

const Api: React.FunctionComponent<ApiProps> = (props) => {
    
    useEffect(() => {
        console.log('api received instr: ', props.sentInstructions);

    }, [props.sentInstructions]);

    return ( <></> ); // nothing, this component's only purpose is to simulate an api
}

export function generateNetwork(numNodes: number): Network {
    return new Network(numNodes);
}

export default Api;

