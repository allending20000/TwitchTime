import { useLocation } from 'react-router-dom';
import axios from '../../backend/node_modules/axios';
import { useEffect } from 'react';
const queryString = require('query-string');
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Callback = (props) => {
    //Search is a property containing the query string
    const { search } = useLocation();
    //Use the query-string library to parse the query string to get auth code
    const { code } = queryString.parse(search);
    //Parameters for GET request
    const params = {
        code: code
    };
    //Fetch the authorization code and send it to the server
    useEffect(() => {
        //Send authorization code for OAuth to the server
        axios.get("http://localhost:8000/api/auth/generate-token", { params }).then(res => {
            console.log(res);
            axios.get("http://localhost:8000/api/auth/cookie");
        }).catch(err => {
            console.error(err);
        });
    }, []);

    return (<div className="callback">
        callback
    </div>);
}

export default Callback;