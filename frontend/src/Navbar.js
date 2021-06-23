import { Link } from "react-router-dom";

const Navbar = () => {
    return (<div className="navbar">
        <span className="title">TwitchTime</span>
        <div className="content">
            <Link to="/dashboard" className="dashboard">Home</Link>
            <Link to="/about" className="about">About</Link>
        </div>
    </div>);
}

export default Navbar;