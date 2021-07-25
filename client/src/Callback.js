import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
const queryString = require('query-string');
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Callback = (props) => {
    //Search is a property containing the query string
    const { search } = useLocation();
    //Use the query-string library to parse the query string to get auth code
    const { code } = queryString.parse(search);
    //Use to redirect
    const history = useHistory();
    //Parameters for GET request
    const params = {
        code: code
    };
    //Fetch the authorization code and send it to the server
    useEffect(() => {
        //Send authorization code for OAuth to the server
        axios.get("http://localhost:8000/api/auth/generate-token", { params }).then(res => {
            //redirect to dashboard after getting cookie from the server
            history.push("/dashboard");
            //set authentication value to true
        }).catch(err => {
            console.error(err);
        });
    }, []);

    return (<div className="callback">
        <div className="title">
            <span>TwitchTime</span>
            <img src="https://www.tailorbrands.com/wp-content/uploads/2021/04/twitch-logo.png" alt="Twitch Logo" />
        </div>
        <div className="content">
            <div>Thank you for authenticating! Redirecting to dashboard...</div>
        </div>
    </div>);
}

export default Callback;