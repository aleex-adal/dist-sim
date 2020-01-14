import React, { useEffect, useState } from 'react';
import './Console.css';
import Network from '../../model/Network';
import { Instruction } from '../../util/interpret';
import * as interpret from '../../util/interpret';
import Controls, { ControlsProps } from '../Controls/Controls';

interface ConsoleProps {
    ControlsProps: ControlsProps;
    handleTextAreaInput: (event: React.ChangeEvent<Element>) => void;
}

const Console: React.FunctionComponent<ConsoleProps> = (props) => {

    useEffect( () => {
        if (props.ControlsProps.finishedExecuting === undefined) {
            return;
        }

        else if (props.ControlsProps.finishedExecuting === false) {
            document.getElementById('prompt').classList.toggle('display-none');
            document.getElementById('textarea').classList.toggle('display-none');


            document.getElementById('liveinfo').classList.toggle('display-none');


        }

        else {
            document.getElementById('prompt').classList.toggle('display-none');
            document.getElementById('textarea').classList.toggle('display-none');

            document.getElementById('liveinfo').classList.toggle('display-none');

        }

    }, [props.ControlsProps.finishedExecuting]);


    return (
        <div id="console" className="console">
        <Controls {...props.ControlsProps} />
  
        <div id="prompt" className="before-textarea blink">>>></div>
        <textarea id="textarea" onClick={() => document.getElementById('prompt').classList.remove('blink')} onChange={props.handleTextAreaInput}></textarea>
        <div id="liveinfo" className="liveinfo display-none"></div>
      </div>
    );
}

export default Console;