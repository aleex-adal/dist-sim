import React, { useEffect, useState } from 'react';

interface MenuProps {
    menuClasses: string[];
    setMenuClasses: React.Dispatch<React.SetStateAction<string[]>>;
}

const Menu: React.FunctionComponent<MenuProps> = (props) => {
    const initialContents = (
        <ul>
            <li onClick={() => setMenuContents(tutorialContents)}>tutorial</li>
            <li>about</li>
        </ul>
    );
    
    const tutorialContents = ( <>
        <div>
            This is the tutorial
        </div>
        <div onClick={() => setMenuContents(initialContents)}>
            go back
        </div>
    </>);

    const [ menuContents, setMenuContents ] = useState( initialContents );


    return (<>
        <div id='overlay' className={props.menuClasses[1]} onClick={() => props.setMenuClasses(['menu', 'overlay'])}></div>
        <div id='menu' className={props.menuClasses[0]}>
            {menuContents}
        </div>
    </>)
}

export default Menu;