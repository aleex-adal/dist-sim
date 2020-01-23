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
    const [ displayResponse, setDisplayResponse ] = useState([] as boolean[]);
    

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
            // set this map to undefined so labels reset for next instructions

            setDisplayResponse([]);

        } else if (displayResponse.length === 0) {

            instrList.forEach( instr => displayResponse[instr.instrId] = false );
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

    const getInstrLabel = (instr: any, includeColon?: boolean): any => {

        let mapRes = undefined;
        let newMap = undefined as Map<number, string>;

        if (mapInstrIdsToLabels) {
            mapRes = mapInstrIdsToLabels.get(instr.instrId);
            
        } else {
            newMap = new Map<number, string>();
        }

        // define labels for all instructions at once
        if (mapRes === undefined) {
            let label: string;

            let labelList = [];
            for (let i = 0; i < instrList.length; i++) {
                const thisInstr = instrList[i];
                const tokens = thisInstr.text.split(' ');
                let opIndex = 0;
                let done = false;

                while (!done) {
                    if (tokens[opIndex] === 'read' || tokens[opIndex] === 'r') {
                        label = 'r';
                        done = true;

                    } else if (tokens[opIndex] === 'update' || tokens[opIndex] === 'u') {
                        label = 'u';
                        done = true;

                    } else if (tokens[opIndex] === 'insert' || tokens[opIndex] === 'i') {
                        label = 'i';
                        done = true;

                    } else if (tokens[opIndex] === 'delete' || tokens[opIndex] === 'd') {
                        label = 'd';
                        done = true;
                    }

                    opIndex++;
                }

                if (tokens[opIndex] === 'item' || tokens[opIndex] === 'i' ) {
                    opIndex++;
                }

                if (label !== 'i') {
                    label = label.concat(tokens[opIndex]);

                    for (let i = labelList.length - 1; i >= 0; i--) {
                        const currLabel = labelList[i].label;
                        if (currLabel[0] === label[0] && currLabel[1] === label[1]) {

                            if (currLabel.includes('_')) {
                                label = label.concat('_' + (parseInt(currLabel[currLabel.length - 1]) + 1).toString());
                            } else {
                                label = label.concat('_2');
                            }

                        }
                    }

                } else {

                    for (let i = labelList.length - 1; i >= 0; i--) {
                        const currLabel = labelList[i].label;
                        if (currLabel[0] === label[0]) {

                            if (currLabel.includes('_')) {
                                label = label.concat('_' + (parseInt(currLabel[currLabel.length - 1]) + 1).toString());
                            } else {
                                label = label.concat('_2');
                            }

                        }
                    }
                }

                labelList.push({instrId: thisInstr.instrId, label: label});
            }

            labelList.forEach( li => {
                newMap.set(li.instrId, li.label);
            });

            if (document.getElementById('run').innerHTML !== 'run') {
                // this will set a new map for the second instruction ONLY
                // when the run button's innerHTML is not 'run'
                // this indicates that new instructions are on the way
                setMapInstrIdsToLabels(newMap);
            }

            label = newMap.get(instr.instrId);

            return includeColon === false ? label : label + ": ";

        } else {
            return includeColon === false ? mapRes : mapRes + ": ";
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

    const getInstrClasses = (instrList: any[], key: number): string => {
        let c = instrList[key].done ? 'gray' : 'sky';
        if (key === 0) {
            c = c.concat(' first');
        }
        if (key === instrList.length - 1) {
            c = c.concat(' last');
        }
        return c;
    };

    const showResponse = (instrId: number): void => {
        const newState = [];
        displayResponse.forEach( (val, i) => {
            newState[i] = i === instrId ? true : val;
        });
        setDisplayResponse(newState);
    };

    const getResponseText = (instr: any): any => {

        let str = instr.res.itemId ? `itemId: ${instr.res.itemId}, ` : '';

        if (instr.res.item) {
            Object.keys(instr.res.item).forEach( (key) => {
                str = str.concat(key + ': ' + instr.res.item[key] + ', ');
            });
            str = str.slice(0, -2); 
        }

        return (<>
            <span style={{color: '#f1ef43'}}>msg: </span><span dangerouslySetInnerHTML={{__html: instr.res.msg}}></span><br></br>
            <span style={{color: '#f1ef43'}}>item: </span>
            <span style={{color: '#f0d976'}}>{'{'}</span>
                {str}
            <span style={{color: '#f0d976'}}>{'}'}</span>
        </>)
    };


    return (
        <>
        <div id="console" className="console">
        <Controls {...props.ControlsProps} setInstrList={setInstrList} setApiResponseCopy={setApiResponseCopy} />
  
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea id="textarea" onClick={() => document.getElementById('prompt').classList.remove('blink')} onChange={props.handleTextAreaInput}></textarea>
        <div id="liveinfo" className="liveinfo display-none">

            <h3 className={'liveinfo-h3 top-margin-20'}>executing instructions:</h3>
            <ul className='instrlist'>
                {instrList.map((instr, key) => {
                    return <li
                        id={'instr' + instr.instrId.toString()}
                        key={key}
                        className={getInstrClasses(instrList, key)}
                    >
                        {instr.done ? <s>{'instr ' + getInstrLabel(instr)}</s> : 'instr ' + getInstrLabel(instr)}
                        {instr.text}

                        {instr.done && !displayResponse[instr.instrId] ? <div className="view-response" onClick={() => showResponse(instr.instrId)}>view response</div> : ''}
                        {displayResponse[instr.instrId] ? <div className='response-text'><span className='blue'> instr {getInstrLabel(instr, false)} response: </span><br></br>{getResponseText(instr)}</div> : ''}
                    </li>
                })}
            </ul>
            

            <h3 className={'liveinfo-h3 top-margin'}>all system actions:</h3>
            <ul className="instrlist" id="instrlist">
                {apiResponseCopy.map( (val, key) => {
                    return (
                        <li key={key} className={key === 0 ? 'first' : key === apiResponseCopy.length - 1 ? 'last' : ''}>
                            {val.done ? <div className='listlabel gray'><s>{getInstrLabel(val)}</s></div> : <div className='listlabel sky'>{getInstrLabel(val)}</div>}
                            <div className={'listmsg ' + getMsgColor(val)}>{val.msg}</div>
                        </li>
                    )
                })}
            </ul>

        </div>
      </div>
      <div id="end"></div>
      </>
    );
}

export default Console;