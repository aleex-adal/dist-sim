import React, { useEffect, useState } from 'react';
import './NavAndMenu.css';
import menu from '../../resource/menu.svg';


interface MenuProps {
    
}
// first time? click here
// tut => introduction
// walkthrough (enter command, tap node for clock, tap payload)
// example commands
const Menu: React.FunctionComponent<MenuProps> = (props) => {
    
    const [ menuClasses, setMenuClasses ] = useState(['menu', 'overlay']);
    const [ menuContents, setMenuContents ] = useState( 'initial-contents' );

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

    const getMsgShowcase = (o: {
        id: string,
        label: string,
        bgc: string,
        animation: string,
        classes?: string
    }) => {
        return <div 
            id        ={o.id}
            className ={o.classes ? 'msg-showcase ' + o.classes : 'msg-showcase'}
            style     ={{backgroundColor: o.bgc, animation: o.animation}}
        >
            {o.label}
        </div>  
    };

    const backToMenuBtn = () => {
        return (
            <span 
                className='back-to-menu'
                onClick={() => {
                    setMenuContents('initial-contents');
                    setMenuClasses(['menu menu-active', 'overlay overlay-active']);
                }}
            >back to menu</span>
        )
    };
    
    const tutorialContents = ( <>
        {backToMenuBtn()}

        <div id="tutorial-wrapper" className="tutorial-wrapper">
            <h1 id="tutorial-contents-hero" className="tutorial-contents-hero">
                Welcome.
            </h1>
            <p id="tutorial-second-fade" className="tutorial-second-fade">
                You might have heard about Lamport clocks, but what the heck are they actually used for? Keep reading to find out.
            </p>

            {window.innerWidth > 1195 ? 
                <p className="tutorial-second-fade">
                    This app was designed for mobile first. 
                    Feel free to visit on your phone as well - 
                    the tutorial is especially suited for vertical scrolling :)
                </p>
                :
                ''}

            <ul id="tutorial-third-fade" className="instrlist tutlist tutorial-third-fade">
                <li className="first">
                    <p>Node 1 is a node in our database.</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div id="s0n1" className="dot-showcase" style={{float: 'none'}}>1</div>
                    </div>
                </li>
                
                <li>
                    <p>Let's send two write requests to the node, one after the other: w1 and w2.</p>
                    <div className="showcase">
                        {getMsgShowcase({
                            id: 's1w2',
                            label: 'w2',
                            bgc: 'rgba(24, 205, 250, 0.904)',
                            animation: 's1 10s linear 8s infinite'
                        })}
                        {getMsgShowcase({
                            id: 's1w1',
                            label: 'w1',
                            bgc: 'rgba(250, 235, 24, 0.904)',
                            animation: 's1 10s linear 8s infinite'
                        })}
                        <div id="s1n1" className="dot-showcase">1</div>
                    </div>
                </li>
                <li>
                    <p>w2 travels faster and completes first.</p>
                    <div className="showcase">
                        {getMsgShowcase({
                            id: 's2w2',
                            label: 'w2',
                            bgc: 'rgba(24, 205, 250, 0.904)',
                            animation: 's2w2 10s linear 14s infinite'
                        })}
                        {getMsgShowcase({
                            id: 's2w1',
                            label: 'w1',
                            bgc: 'rgba(250, 235, 24, 0.904)',
                            animation: 's2w1 10s linear 14s infinite'
                        })}
                        <div id="s2n1" className="dot-showcase">1</div>
                    </div>
                </li>
                <li>
                    <p>What happens when w1 arrives at the node after w2 already completed?</p>
                    <p>The database will write w1, and end up with w1's value.</p>
                    <div className="showcase showcase-3">
                        {getMsgShowcase({
                            id: 's3w1',
                            label: 'w1',
                            bgc: 'rgba(250, 235, 24, 0.904)',
                            animation: 's3w1 10s linear 18s infinite',
                            classes: 'msg-showcase-3 s3n1',
                        })}
                        {getMsgShowcase({
                            id: 's3w2',
                            label: 'w2',
                            bgc: 'rgba(24, 205, 250, 0.904)',
                            animation: 's3w2 10s linear 18s infinite',
                            classes: 'msg-showcase-3 s3n1',
                        })}
                        <div id="s3n3" className="dot-showcase" style={{backgroundColor: 'rgba(250, 24, 24, 0.904)', color: '#fff'}}>w1</div>
                        <div id="s3n2" className="dot-showcase s3n2" style={{backgroundColor: 'rgba(24, 205, 250, 0.904)', animation: 's3n2 10s linear 18s infinite'}}>w2</div>
                        <div id="s3n1" className="dot-showcase s3n1" style={{animation: 's3n1 10s linear 18s infinite'}}>1</div>
                    </div>
                    <p style={{marginTop: '15px'}}>Seems backwards right? w2 was sent last so the database should end up with w2's value.</p>
                </li>
                <li>
                    <p>To solve this problem, each request is sent with a <strong>clock</strong>. It's just a number that counts up for each request sent and received.</p>
                    <p>The clocks tell us that we sent w1 at time 5. We sent w2 right after, at time 6.</p>

                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            {getMsgShowcase({
                                id: 's4w1',
                                label: 'w1',
                                bgc: 'rgba(250, 235, 24, 0.904)',
                                animation: '',
                                classes: 'margin-auto display-block'
                            })}
                            <div className="tut-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 5 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div> 
                        </div>
                        <div className="half float-right">
                            {getMsgShowcase({
                                id: 's4w2',
                                label: 'w2',
                                bgc: 'rgba(24, 205, 250, 0.904)',
                                animation: '',
                                classes: 'margin-auto display-block'
                            })}
                            <div className="tut-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 6 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>The node receives w2 first, and it remembers that w2 was sent at time 6.</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="dot-showcase" style={{float: 'none', backgroundColor: 'rgba(24, 205, 250, 0.904)', margin: 'auto', display: 'block'}}>w2</div>
                        <div className="tut-clock-label">
                            <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                            <span style={{color: "#18cdfa"}}>[</span>
                            <span style={{color: '#f1f5fd'}}> 6 </span>
                            <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                        </div>
                    </div>
                </li>
                <li>
                    <p>The node then receives w1. w1's clock is "behind" w2's clock so the node doesn't execute w1.</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            {getMsgShowcase({
                                id: 's4w1',
                                label: 'w1',
                                bgc: 'rgba(250, 235, 24, 0.904)',
                                animation: '',
                                classes: 'margin-auto display-block'
                            })}
                            <div className="tut-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 5 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div> 
                        </div>
                        <div className="half float-right">
                            <div className="dot-showcase" style={{float: 'none', backgroundColor: 'rgba(24, 205, 250, 0.904)', margin: 'auto', display: 'block'}}>w2</div>
                            <div className="tut-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 6 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                    </div>
                    <p style={{marginTop: '15px'}}>When w1 arrives, it has already been overwritten by the more recent operation w2.</p>
                    <p><strong>This is how logical clocks are used in distributed systems.</strong></p>
                </li>
                
                <li className="last">
                    <p>To see logical clocks in action, enter these commands into the console on the main page: </p>
                    <div className="tut-clock-label" style={{paddingLeft: '10px', paddingRight: '10px', textAlign: 'left'}}>
                        <span style={{color: '#f1f5fd', display: 'block', marginBottom: '5px'}}>
                            {'node 0 update item 15 {"fruit": "apple"} delay 5'}
                        </span>
                        <span style={{color: '#f1f5fd', display: 'block'}}>
                            {'node 0 update item 15 {"fruit": "kiwi", "secondEdit":"true"}'}
                        </span>
                    </div>
                    <p style={{marginTop: '15px'}}>To learn what else you can do with this database simulation, 
                        <span className="open-examples" onClick={() => openExamples()}>{window.innerWidth > 1195 ? 'tap here.' : 'click here.'}</span>
                    </p>
                </li>
            </ul>
            
            
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
        setTimeout( () => {
            setOriginalHeight(document.getElementById('root').offsetHeight);
        }, 500);
    }, []);

    const openMenu = () => {

        if (document.getElementById('tutorial-wrapper')) {
            setMenuClasses(['menu menu-full', 'overlay overlay-active']);

        } else {
            setMenuClasses(['menu menu-active', 'overlay overlay-active']);
        }
    };

    const openExamples = () => {
        setMenuContents('example-contents');
    };

    useEffect( () => {

        // expand the height of the app so scrolling isn't weird af
        if (menuClasses[0] === 'menu menu-full') {

            document.getElementById('root').style.height = document.getElementById('menu').offsetHeight + 'px';
            document.getElementById('app').style.height = document.getElementById('menu').offsetHeight + 'px';

        // collapse the app height back to normal
        } else if (
                originalHeight &&
                menuClasses[0] !== 'menu menu-full'
            ) {
            if (menuContents !== 'initial-contents') {
                setMenuContents('initial-contents');
            }

            document.getElementById('root').style.removeProperty('height');
            document.getElementById('app').style.removeProperty('height');
        }
    }, [menuClasses]);

    useEffect( () => {
        if (menuContents === 'tutorial-contents') {

            const msgWidth = document.getElementById('s1w1').offsetWidth;
    
            let w1ToEnd = document.getElementById('s1n1').getBoundingClientRect().left
            - document.getElementById('s1w1').getBoundingClientRect().left
            - msgWidth;

            let w2ToEnd = document.getElementById('s1n1').getBoundingClientRect().left
            - document.getElementById('s1w2').getBoundingClientRect().left
            - msgWidth;
            
            // showcase 1
            (document.styleSheets[0] as any).insertRule(
                `@keyframes s1 {
                    25% { transform: translate(${w1ToEnd}px, 0); }
                    100% { transform: translate(${w1ToEnd}px, 0); }
                }`
            );

            //showcase 2
            (document.styleSheets[0] as any).insertRule(
                `@keyframes s2w1 {
                    25% { transform: translate(${w1ToEnd - msgWidth}px, 0); }
                    100% { transform: translate(${w1ToEnd - msgWidth}px, 0); }
                }`
            );
            (document.styleSheets[0] as any).insertRule(
                `@keyframes s2w2 {
                    17% { transform: translate(${w2ToEnd}px, 0); }
                    100% { transform: translate(${w2ToEnd}px, 0); }
                }`
            );

            // showcase 3
            // w1 and w2 have already been translated because
            // node 2 and 3 were in the way so their final trans is msgWidth * 3 or 4
            (document.styleSheets[0] as any).insertRule(
                `@keyframes s3w2 {
                    30%  { transform: translate(${(msgWidth) * 2}px, 0); opacity: 1; }
                    40%  { transform: translate(${(msgWidth) * 3}px, 0); opacity: 0; }
                    100% { transform: translate(${(msgWidth) * 3}px, 0); opacity: 0; }
                }`
            );

            (document.styleSheets[0] as any).insertRule(
                `@keyframes s3n1 {
                    30%  { opacity: 1; }
                    40%  { opacity: 0; }
                    100% { opacity: 0; }
                }`
            );

            (document.styleSheets[0] as any).insertRule(
                `@keyframes s3w1 {
                    50%  { transform: translate(${(msgWidth) * 2}px, 0); opacity: 1; }
                    60%  { opacity: 1; }
                    70%  { transform: translate(${(msgWidth) * 4}px, 0); opacity: 0; }
                    100% { transform: translate(${(msgWidth) * 4}px, 0); opacity: 0; }
                }`
            );

            (document.styleSheets[0] as any).insertRule(
                `@keyframes s3n2 {
                    60%  { opacity: 1; }
                    70%  { opacity: 0; }
                    100% { opacity: 0; }
                }`
            );
        }

    }, [menuContents]);

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