import React, { useEffect, useState } from 'react';
import './NavAndMenu.css';
import menu from '../../resource/menu.svg';


interface MenuProps {
    
}

const Menu: React.FunctionComponent<MenuProps> = (props) => {
    
    const [ menuClasses, setMenuClasses ] = useState(['menu', 'overlay']);
    const [ menuContents, setMenuContents ] = useState( 'initial-contents' );
    const [ msgShowcase, setMsgShowcase ] = useState( <></> );

    const [ originalHeight, setOriginalHeight ] = useState( undefined as number );

    const initialContents = (
        <ul id="initial-contents" className='initial-contents'>
            <li id='tutorial-li'
                onClick={() => {
                    setMenuContents('tutorial-contents');
                    setMenuClasses(['menu menu-full', 'overlay overlay-active']);

                    if (document.getElementById('tutorial').classList.length < 2) {
                        document.getElementById('tutorial').classList.add('display-none');
                    }
                }}
            >tutorial</li>
            <li>example commands</li>
            <li>about</li>
        </ul>
    );

    const getMsgShowcase = (label: string, bgc: string, classes: string) => {
        return <div className={'msg-showcase ' + classes} style={{backgroundColor: bgc}}>{label}</div>
    }
    
    const tutorialContents = ( <>
        <span 
            className='back-to-menu'
            onClick={() => {
                setMenuContents('initial-contents');
                setMenuClasses(['menu menu-active', 'overlay overlay-active']);
            }}
        >back to menu</span>

        <div id="tutorial-wrapper" className="tutorial-wrapper">
            <h1 id="tutorial-contents-hero" className="tutorial-contents-hero">
                Welcome.
            </h1>
            <p id="tutorial-second-fade" className="tutorial-second-fade">
                You might have heard about Lamport clocks, but what the heck are they actually used for?
            </p>

            <div id="tutorial-third-fade" className="tutorial-third-fade">
                <p>Let's send two write requests to this node, one after the other: w1 and w2.</p>
                <div className="showcase">
                    {getMsgShowcase('w2', 'rgba(24, 205, 250, 0.904)', 'fast-to-end')}
                    {getMsgShowcase('w1', 'rgba(250, 235, 24, 0.904)', 'slow-to-end')}
                    <div className="dot-showcase">1</div>
                </div>

                <p>w2 happens to travel faster and completes first.</p>

                <p>What happens when w1 arrives at the node after w2 already completed?</p>
                <p>The database will write w1, and end up with w1's value.</p>
                <p>Seems backwards right? w2 was sent last so the database should end up with w2's value.</p>
                
                <p>To solve this problem, each request is sent with a <strong>clock</strong>. It's just a number that counts up for each request sent and received.</p>
                <p>The clocks tell us that we sent w1 at time 5. We sent w2 at time 6.</p>
                <p>The node receives w2 first, and it remembers that w2 was sent at time 6.</p>
                <p>The node then receives w1. w1's clock is "behind" w2's clock so the node doesn't execute w1.</p>
                <p><strong>When w1 arrives, it has already been overwritten by the more recent operation w2.</strong></p>
                <p><strong>This is how logical clocks are used in distributed systems.</strong></p>
            </div>
            
            
            {/* <p>
                This is a distributed, sharded, non-replicated database simulation.
            </p>
            <p><strong>Distributed - </strong>the data is spread across multiple nodes.</p>
            <p><strong>Sharded - </strong> Each node contains some data.</p>
            <p><strong>Non-Replicated - </strong> nodes do not contain copies of data.</p>
            <p>
                Any node can request data from any other node.
            </p> */}
        </div>
    </>);

    useEffect( () => {
        // setMenuContents(initialContents);
        setTimeout( () => {
            setOriginalHeight(document.getElementById('root').offsetHeight);
            setMsgShowcase(<div className='msg-showcase' style={{color: 'red'}}>w1</div>);
        }, 500);
    }, []);

    const openMenu = () => {

        if (document.getElementById('tutorial-wrapper')) {
            setMenuClasses(['menu menu-full', 'overlay overlay-active']);

        } else {
            setMenuClasses(['menu menu-active', 'overlay overlay-active']);
        }
    };

    useEffect( () => {

        // expand the height of the app so scrolling isn't weird af
        if (menuClasses[0] === 'menu menu-full') {

            document.getElementById('root').style.height = document.getElementById('menu').offsetHeight + 'px';
            document.getElementById('app').style.height = document.getElementById('menu').offsetHeight + 'px';

        // collapse the app height back to normal
        } else if (
                originalHeight &&
                menuClasses[0] !== 'menu menu-full' &&
                document.getElementById('root').offsetHeight !== originalHeight
            ) {
            
            document.getElementById('root').style.height = originalHeight + 'px';
            document.getElementById('app').style.height = originalHeight + 'px';

        }
    }, [menuClasses]);

    return (<>
        <header>
            <nav id='nav'>
            <div className="nav-title">
                dist-sim
            </div>
            <img id="menu-btn" className="menu-btn" src={menu} alt="Menu icon" onClick={() => openMenu()}></img>
            </nav>
        </header>

        <div id='overlay' className={menuClasses[1]} onClick={() => setMenuClasses(['menu', 'overlay'])}></div>
        <div id='menu' className={menuClasses[0]}>
            <svg onClick={() => setMenuClasses(['menu', 'overlay'])}
                id="menu-close" className="menu-close" viewBox="0 0 20 20">
				<path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
			</svg>

            {menuContents === 'initial-contents' ? initialContents : tutorialContents}
        </div>
    </>)
}

export default Menu;