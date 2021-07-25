import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import React from "react";

const Navbar = () => {
    //Whether or not the time is up (when watching a channel)
    const isTimeUp = useSelector((state) => state.isTimeUp.value);

    return (<div className="navbar">
        <span className="title">TwitchTime</span>
        <div className="content">
            {isTimeUp ? <React.Fragment>
                <Link to="/dashboard" className="dashboardEnabled">Home</Link>
                <Link to="/about" className="aboutEnabled">About</Link>
            </React.Fragment>
                : <React.Fragment>
                    <a href="#!" onClick={() => false} className="dashboardDisabled">Home</a>
                    <a href="#!" onClick={() => false} className="aboutDisabled">About</a>
                </React.Fragment>}
        </div>
    </div>);
}

export default Navbar;