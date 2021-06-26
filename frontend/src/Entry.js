import { useState, useEffect } from "react";
import axios from "../../backend/node_modules/axios";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Entry = (props) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        //Query parameters
        const params = {
            userId: props.userId
        }
        //Fetch the profile image URL for each user
        axios.get("http://localhost:8000/api/twitch//getUserProfileImage", { params: params }).then(res => {
            //update the data state
            console.log(res);
            setData(res.data);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (<div className="entry">
        {data && <div>
            <div className="username">{props.userName}</div>
            <div className="viewercount">{props.viewerCount}</div>
            <img src={data} alt="Channel Profile Image" className="profileimage" />
        </div>
        }
    </div>);
}

export default Entry;