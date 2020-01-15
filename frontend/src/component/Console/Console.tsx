import React, { useEffect, useState } from 'react';
import './Console.css';
import Network from '../../model/Network';
import { Instruction } from '../../util/interpret';
import * as interpret from '../../util/interpret';
import Controls, { ControlsProps } from '../Controls/Controls';

interface ConsoleProps {
    ControlsProps: ControlsProps;
    apiResponse: any;
    handleTextAreaInput: (event: React.ChangeEvent<Element>) => void;
    sentInstructions: Instruction[][];
}

const Console: React.FunctionComponent<ConsoleProps> = (props) => {

    const [ instrList, setInstrList ] = useState([] as Instruction[]);
    const [ apiResponseCopy, setApiResponseCopy ] = useState([]);
    const [ mapInstrIdsToLabels, setMapInstrIdsToLabels ] = useState(new Map<number, string>());

    useEffect( () => {
        if (!props.apiResponse) {
            return;
        }

        setApiResponseCopy(props.apiResponse);
        console.log('console received new api progression');
        console.log(props.apiResponse);

    }, [props.apiResponse]);

    const getInstrLabel = (instr: any): string => {

        const mapRes = mapInstrIdsToLabels.get(instr.instrId);
        if (mapRes === undefined) {
            let label = instr.payload.op;
            if (instr.payload.itemId) {
                label = label.concat(instr.payload.itemId);
            }

            mapInstrIdsToLabels.forEach( currLabel => {
                if (currLabel[0] === label[0] && currLabel[1] === label[1]) {
                    if (currLabel.length > 2) {
                        label = label.concat('_' + (currLabel[currLabel.length - 1] + 1));
                    } else {
                        label = label.concat('_2');
                    }
                }
            });
            mapInstrIdsToLabels.set(instr.instrId, label);
            return label;

        } else {
            return mapRes;
        }
    }

    const getColor = (instr): string => {
        return instr.done ? 'green' : instr.msg.includes('final') ? 'blue' : instr.msg.includes('original') ? 'orange' : 'yellow'
    }

    useEffect( () => {
        if (props.ControlsProps.finishedExecuting === undefined) {
            return;

        // we're currently executing something
        } else if (props.ControlsProps.finishedExecuting === false) {
            toggleButtonsAndInfo();
            updateInstrList();

        // we're done executing
        } else {
            toggleButtonsAndInfo();
            setInstrList([] as Instruction[]);
            setMapInstrIdsToLabels(new Map<number, string>());
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
            <ol>
                {apiResponseCopy.map( (val, key) => {
                    return (
                        <li key={key} className={getColor(val)}>{getInstrLabel(val) + ": " + val.msg}</li>
                    )
                })}
            </ol>

        </div>
      </div>
    );
}

export default Console;