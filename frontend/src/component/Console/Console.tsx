import React, { useEffect, useState } from 'react';
import './Console.css';
import Network from '../../model/Network';
import { Instruction } from '../../util/interpret';
import * as interpret from '../../util/interpret';
import Controls, { ControlsProps } from '../Controls/Controls';

interface ConsoleProps {
    ControlsProps: ControlsProps;
    handleTextAreaInput: (event: React.ChangeEvent<Element>) => void;
    sentInstructions: Instruction[][];
}

const Console: React.FunctionComponent<ConsoleProps> = (props) => {

    const [ instrList, setInstrList ] = useState([] as Instruction[]);

    useEffect( () => {
        if (props.ControlsProps.finishedExecuting === undefined) {
            return;

        } else {
            toggleButtonsAndInfo();
        }

        // we're currently executing something
        if (props.ControlsProps.finishedExecuting === false) {
            updateInstrList();

        } else {
            setInstrList([] as Instruction[]);
        }

    }, [props.ControlsProps.finishedExecuting]);

    useEffect( () => {
        if (!props.sentInstructions) {
            return;
        }
        console.log('updated instr:');
        console.log(props.sentInstructions)
        updateInstrList();
    }, [props.sentInstructions]);

    const toggleButtonsAndInfo = () => {
        document.getElementById('prompt').classList.toggle('display-none');
        document.getElementById('textarea').classList.toggle('display-none');
        document.getElementById('liveinfo').classList.toggle('display-none');
    };

    const updateInstrList = () => {
        const instrList = [] as Instruction[];
        props.sentInstructions.forEach( instrArr => {
            instrArr.forEach( instr => {
                instrList.push(instr);
            });
        });

        setInstrList(instrList);
    };


    return (
        <div id="console" className="console">
        <Controls {...props.ControlsProps} />
  
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea id="textarea" onClick={() => document.getElementById('prompt').classList.remove('blink')} onChange={props.handleTextAreaInput}></textarea>
        <div id="liveinfo" className="liveinfo display-none">
            {instrList.map((instr, key) => {
                return <div
                    id={'instr' + instr.instrId.toString()}
                    key={key}
                    className={instrList[key].done ? 'green' : 'yellow'}
                >{instr.text}</div>

            })}
        </div>
      </div>
    );
}

export default Console;