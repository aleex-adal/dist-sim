import React, { useEffect, useState } from 'react';

interface MenuProps {
    menuClasses: string[];
    setMenuClasses: React.Dispatch<React.SetStateAction<string[]>>;
}

const Menu: React.FunctionComponent<MenuProps> = (props) => {
    const initialContents = (
        <ul>
            <li onClick={() => {
                setMenuContents(tutorialContents);
                props.setMenuClasses(['menu menu-full', 'overlay overlay-active']);
                }}
            >tutorial</li>
            <li>about</li>
        </ul>
    );
    
    const tutorialContents = ( <>
        <div>
            This is the tutorial
        </div>
        <div onClick={() => {
            setMenuContents(initialContents);
            props.setMenuClasses(['menu menu-active', 'overlay overlay-active']);
        }}
        >go back</div>
    </>);

    const [ menuContents, setMenuContents ] = useState( initialContents );


    return (<>
        <div id='overlay' className={props.menuClasses[1]} onClick={() => props.setMenuClasses(['menu', 'overlay'])}></div>
        <div id='menu' className={props.menuClasses[0]}>
            <div id="close-menu" className="close-menu">X</div>
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm0 10.293l5.293-5.293.707.707-5.293 5.293 5.293 5.293-.707.707-5.293-5.293-5.293 5.293-.707-.707 5.293-5.293-5.293-5.293.707-.707 5.293 5.293z"/></svg>
            {menuContents}
        </div>
    </>)
}

export default Menu;