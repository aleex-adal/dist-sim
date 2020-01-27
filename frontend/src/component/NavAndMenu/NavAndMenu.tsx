import React, { useEffect, useState } from 'react';
import './NavAndMenu.css';
import menu from '../../resource/menu.svg';


interface MenuProps {
    
}
// 
// tut => introduction
// walkthrough (enter command, tap node for clock, tap payload)
// example commands
const Menu: React.FunctionComponent<MenuProps> = (props) => {
    
    const [ menuClasses, setMenuClasses ] = useState(['menu', 'overlay']);
    const [ menuContents, setMenuContents ] = useState( 'initial-contents' );

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
            ><h2>welcome</h2></li>
            <li onClick={() => {
                setMenuContents('example-contents');
                setMenuClasses(['menu menu-full', 'overlay overlay-active']);
            }}><h2>example commands</h2></li>
            <li onClick={() => {
                setMenuContents('about-contents');
                setMenuClasses(['menu menu-full', 'overlay overlay-active']);
            }}><h2>motivation</h2></li>
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

    const backToMenuBtn = (
        <span 
            className='back-to-menu'
            onClick={() => {
                setMenuContents('initial-contents');
                setMenuClasses(['menu menu-active', 'overlay overlay-active']);
                document.getElementById('root').style.removeProperty('height');
                document.getElementById('app').style.removeProperty('height');
            }}
        >back to menu</span>
    );
    
    const tutorialContents = ( <>
        {backToMenuBtn}

        <div id="tutorial-wrapper" className="menu-content-wrapper">
            <h1 id="tutorial-contents-hero" className="contents-hero tutorial-first-fade">
                Welcome.
            </h1>
            <p id="tutorial-second-fade" className="tutorial-second-fade">
                You might have heard about Lamport clocks, but what the heck are they actually used for? Keep reading to find out.
            </p>

            {window.innerWidth > 1195 ? 
                <p className="tutorial-second-fade">
                    *This app was designed on mobile first. 
                    Feel free to visit on your phone as well - 
                    this page is especially suited for vertical scrolling :)
                </p>
                :
                ''}

            <ul id="tutorial-third-fade" className="instrlist menulist tutorial-third-fade">
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
                    <p style={{marginTop: '15px'}}>Seems backwards right? w2 was sent most recently so the database should end up with w2's value.</p>
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
                                <br></br>
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
                                <br></br>
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
                        <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block'}}>w2</div>
                        <div className="tut-clock-label">
                            <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                            <br></br>
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
                                <br></br>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 5 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div> 
                        </div>
                        <div className="half float-right">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block'}}>w2</div>
                            <div className="tut-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <br></br>
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
                        <span className="open-examples" onClick={() => {
                            document.getElementById('root').style.removeProperty('height');
                            document.getElementById('app').style.removeProperty('height');
                            setMenuContents('example-contents');
                            try {
                                document.getElementById('menu-close').scrollIntoView({ behavior: "smooth"});
                            } catch (e) { // mobile safari does not support smooth scroll
                                document.getElementById('menu-close').scrollIntoView();
                            };

                            // give the new menu contents some time to expand to new height then set app height to new height
                            setTimeout( () => {
                                document.getElementById('root').style.height = document.getElementById('menu').offsetHeight + 'px';
                                document.getElementById('app').style.height = document.getElementById('menu').offsetHeight + 'px';
                            }, 500);
                                                          
                        }}>{window.innerWidth > 1195 ? ' click here.' : ' tap here.'}</span>
                    </p>
                </li>
            </ul>
        </div>
    </>);

    const exampleContents = (<>
        {backToMenuBtn}
        <div id="example-wrapper" className="menu-content-wrapper">
            <h1 id="example-contents-hero" className="contents-hero">
                Example Commands
            </h1>
            <ul id="example-list" className="instrlist menulist extra-p-margin">
                <li className="first">
                    <p>All commands can be abbreviated.</p>
                    <p>Read</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>node 0 read item 15</span>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>n 0 r 15</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>Insert</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'node 0 insert item {"anyField":"anyString", "anyNumber":10 }'}</span>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'n 0 i {"anyField":"anyString", "anyNumber":10 }'}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>Update</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'node 0 update item 15 {"anyField":"anyString", "anyNumber":10 }'}</span>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'n 0 u 15 {"anyField":"anyString", "anyNumber":10 }'}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>Delete</p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'node 0 delete item 15'}</span>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'n 0 d 15'}</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>
                        Execute multiple commands by entering them on different lines in the console.
                    </p>
                    <p>
                        <strong>Normal</strong>, the default, sends at the same time.
                    </p>
                    <p>
                        <strong>In-order</strong> guarantees that the first command finishes before the second.
                    </p>
                    <p>
                        <strong>Delay</strong> delays the command by a number of seconds.
                    </p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'node 0 update item 15 {"secondEdit":false} delay 5'}</span>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <span>{'node 0 update item 15 {"secondEdit":true}'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half">
                            <div className="ex-clock-label">
                                <div>{'in-order'}</div>
                                <div>{'node 0 read item 15 delay 5'}</div>
                                <div>{'node 0 read item 15'}</div>
                            </div> 
                        </div>
                        <div className="half">
                            <div className="ex-clock-label">
                                <div>{'normal'}</div>
                                <div>{'node 0 read item 15'}</div>
                                <div>{'node 0 update item 15 {"secondEdit":true}'}</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <h3 style={{margin: '0'}}>Workflow</h3>
                    <p>
                        {window.innerWidth > 1195 ? 'Click ' : 'Tap '}
                        each node to display its data.
                    </p>
                    <p>
                        Note the nodeId that will send the request, and the itemId that will be read or modified.
                    </p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block'}}>0</div>
                            <div className="ex-clock-label">
                                <span style={{color: "#f1ef43"}}>node 0 info</span>
                            </div> 
                        </div>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block', backgroundColor: 'rgba(24, 205, 250, 0.904)'}}>5</div>
                            <div className="ex-clock-label">
                                <span style={{color: '#f1ef43'}}>dataSlice: </span>
                                <span style={{color: '#18cdfa'}}>[</span>
                                <span style={{color: '#f0d976'}}>{'{'}</span>
                                itemId: 15, ...
                                <span style={{color: '#f0d976'}}>{'}'}</span>
                                <span style={{color: '#18cdfa'}}>]</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <p>
                        Type your command in the console.
                    </p>
                    <p>
                        Try {window.innerWidth > 1195 ? ' clicking ' : ' tapping '}
                        the node that will send the command. Notice how its clock changes during the command.
                    </p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block'}}>0</div>
                            <div className="ex-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <br></br>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 5 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block'}}>0</div>
                            <div className="ex-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <br></br>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 6 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="last">
                    <p>
                        Hit the run button, and {window.innerWidth > 1195 ? ' click ' : ' tap '}
                        the blue message that pops up to see its contents. Then hit the play button.
                    </p>
                    <p>
                        Pause the sim before and after the message hits the target node that contains data to be read or modified.
                         How does the the target node's clock change?
                    </p>
                    <div className="showcase" style={{textAlign: 'center'}}>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block', backgroundColor: 'rgba(24, 205, 250, 0.904)'}}>5</div>
                            <div className="ex-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <br></br>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 0 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                        <div className="half ex-half">
                            <div className="dot-showcase" style={{float: 'none', margin: 'auto', display: 'block', backgroundColor: 'rgba(24, 205, 250, 0.904)'}}>5</div>
                            <div className="ex-clock-label">
                                <span style={{color: "#f1ef43", marginLeft: "10px"}}>clock: </span>
                                <br></br>
                                <span style={{color: "#18cdfa"}}>[</span>
                                <span style={{color: '#f1f5fd'}}> 2 </span>
                                <span style={{color: "#18cdfa", marginRight: "10px"}}>]</span>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </>);

    const aboutContents = (<>
        {backToMenuBtn}
        <div id="about-wrapper" className="menu-content-wrapper">
            <h1 id="about-contents-hero" className="contents-hero">
                Motivation
            </h1>
            <ul id="about-list" className="instrlist menulist extra-p-margin">
                <li className="first" style={{paddingTop: '0'}}>
                    <h3 style={{margin: '0'}}>Hello, I'm Aleexsan Adal.</h3>
                    <p>
                        I heard about Lamport clocks from this episode of <span>
                            <a target="_blank" href="https://softwareengineeringdaily.com/2019/09/18/distributed-databases-with-aly-cabral/">
                                Software Engineering Daily,
                            </a>
                        </span> and did some googling on the concept.
                    </p>
                    <p> 
                        Most articles explained what the algorithm is (just increment for messages sent and received), 
                        but none had a clear explanation of <strong>why a distributed system needs to track logical time.</strong>
                    </p>
                </li>
                <li>
                    <p>
                        <strong>The system needs clocks to re-order operations that arrive out of order. </strong>
                        You could send write 1 and then write 2, but they may arrive in the reverse order due to network delay.
                    </p>
                    <p>
                        The clocks will show which op was sent first, so the database nodes must compare the arriving clock with the most recent write's clock
                        to determine what to do.
                    </p>
                    <p>This is the example explained in the welcome section.</p>
                </li>
                <li>
                    <p>
                        I'm still bewildered that this example or similar ones aren't included in every explanation of logical clocks.
                    </p>
                </li>
                <li className="last">
                    <p>    
                        --- From a visual learner, supporting other visual learners. Those engineering textbooks sure aren't.
                    </p>
                </li>
            </ul>
        </div>
    </>);

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
        } else if (menuClasses[0] === 'menu') {
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

    const returnContents = (label: string) => {
        if (label === 'tutorial-contents') {
            return tutorialContents;
        } else if (label === 'example-contents') {
            return exampleContents;
        } else if (label === 'about-contents') {
            return aboutContents;
        } else {
            return initialContents;
        }
    }

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

            {returnContents(menuContents)}
        </div>
    </>)
}

export default Menu;