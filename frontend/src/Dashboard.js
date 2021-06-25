import { useEffect } from "react";
import axios from "../../backend/node_modules/axios";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Dashboard = () => {
    //Runs the first time component mounts
    useEffect(() => {
        axios.get("http://localhost:8000/api/twitch/getFollowedStreams").then(res => {
            console.log(res);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (<div className="dashboard">
    </div>);
}

export default Dashboard;