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

        // only set LiWidth on the first apiResponse
        if (apiResponseCopy.length === 0) {
            setLiWidth();
        }

        setApiResponseCopy(props.apiResponse);

        console.log('console received new api progression');
        console.log(props.apiResponse);

        const msgs = document.getElementsByClassName('msg');
        for (let i = 0; i < msgs.length; i++) {
            const currMsg = msgs.item(i) as HTMLElement;
            const tokens = currMsg.id.split('_');
            if (!currMsg.innerHTML && mapInstrIdsToLabels.get(parseInt(tokens[1]))) {
                currMsg.innerHTML = mapInstrIdsToLabels.get(parseInt(tokens[1]));
            }
        }

    }, [props.apiResponse]);
    
    useEffect( () => {
        if (props.ControlsProps.finishedExecuting === undefined) {
            return;

        // we're currently executing something
        } else if (props.ControlsProps.finishedExecuting === false) {
            toggleButtonsAndInfo();
            updateInstrList();

        // we're done executing
        } else {
            // toggleButtonsAndInfo executed by the reset event listener on Controls component
            // resetting the instruction list also done on the controls component
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

    useEffect( () => {
        if (instrList.length === 0) {
            setMapInstrIdsToLabels(undefined);
            // set this map to undefined so that 
        }
    }, [instrList]);

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

    const getInstrLabel = (instr: any): any => {

        let mapRes = undefined;
        let newMap = undefined as Map<number, string>;

        console.log('getinstlabel called on instr id ' + instr.instrId);

        if (mapInstrIdsToLabels) {
            mapRes = mapInstrIdsToLabels.get(instr.instrId);
            
        } else {
            newMap = new Map<number, string>();
        }

        if (mapRes === undefined) {
            let label: string;
            let itemId: any;

            if (instr.hasOwnProperty("payload")) {
                label = instr.payload.op;
                itemId = instr.payload.itemId;
            } else if (instr.hasOwnProperty("res")) {
                label = instr.res.op;
                itemId = instr.res.itemId;
            } else {
                console.log('no payload, no res');
                return '';
            }

            
            if (itemId && label !== 'i') {
                label = label.concat(itemId);
            }

            let repeatedInstrNumber = 0;
            if (mapInstrIdsToLabels) {
                mapInstrIdsToLabels.forEach( currLabel => {

                    if (currLabel[0] === label[0] && currLabel[1] === label[1]) {
    
                        if (currLabel.includes('_') && parseInt(currLabel[currLabel.length - 1]) >= repeatedInstrNumber) {
                            repeatedInstrNumber = parseInt(currLabel[currLabel.length - 1]) + 1;
                        } else {
                            repeatedInstrNumber = 2;
                        }
                    }
                });
            }

            if (repeatedInstrNumber) {
                label = label.concat('_' + repeatedInstrNumber);
            }

            console.log('label for instr id ' + instr.instrId + ' is ' + label);

            if (mapInstrIdsToLabels) {
                mapInstrIdsToLabels.set(instr.instrId, label);
            } else {
                newMap.set(instr.instrId, label);
                if (document.getElementById('run').innerHTML !== 'run') {
                    // this will set a new map for the second instruction ONLY
                    // when the run button's innerHTML is not 'run'
                    // this indicates that new instructions are on the way
                    setMapInstrIdsToLabels(newMap);
                }
            }

            label = label + ": ";
            return instr.done ? <s className='gray'>{label}</s> : label

        } else {
            mapRes = mapRes + ": ";
            return instr.done ? <s className='gray'>{mapRes}</s> : mapRes
        }
    };

    const getMsgColor = (val: any): string => {
        return val.done ? 'gray' : val.msg.includes('final') ? 'blue' : val.msg.includes('original') ? 'yellow' : 'sky'
    };

    const setLiWidth = () => {
        const totalWidth = document.getElementById('instrlist').offsetWidth;

        let labels = document.getElementsByClassName('listlabel');

        let maxWidth = 0;
        for (let i = 0; i < labels.length; i++) {
            const currWidth = (labels.item(i) as HTMLElement).offsetWidth;
            if (currWidth > maxWidth) {
                maxWidth = currWidth;
            }
        }

        let msgs = document.getElementsByClassName('listmsg');
        labels = document.getElementsByClassName('listlabel');

        for (let i = 0; i < msgs.length; i++) {
            let item = msgs.item(i) as HTMLElement;
            let label = labels.item(i) as HTMLElement;

            item.style.width = (totalWidth - maxWidth - 1) + 'px';
            label.style.lineHeight = item.offsetHeight + 'px';
        }
    };


    return (
        <div id="console" className="console">
        <Controls {...props.ControlsProps} setInstrList={setInstrList} setApiResponseCopy={setApiResponseCopy} />
  
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea id="textarea" onClick={() => document.getElementById('prompt').classList.remove('blink')} onChange={props.handleTextAreaInput}></textarea>
        <div id="liveinfo" className="liveinfo display-none">

            <h3 className={'liveinfo-h3'}>executing instructions:</h3>
            <div className='instrprogress'>
                {instrList.map((instr, key) => {
                    return <div
                        id={'instr' + instr.instrId.toString()}
                        key={key}
                        className={instrList[key].done ? 'gray' : 'sky'}
                    >{'instr '}{getInstrLabel(instr)}{instr.done ? <s>{instr.text}</s> : instr.text}</div>
                })}
            </div>
            

            <h3 className={'liveinfo-h3'}>all system actions:</h3>
            <ul className="instrlist" id="instrlist">
                {apiResponseCopy.map( (val, key) => {
                    return (
                        <li key={key} className={key === 0 ? 'first' : key === apiResponseCopy.length - 1 ? 'last' : ''}>
                            <div className="listlabel sky">{getInstrLabel(val)}</div>
                            <div className={'listmsg ' + getMsgColor(val)}>{val.msg}</div>
                        </li>
                    )
                })}
            </ul>

        </div>
      </div>
    );
}

export default Console;