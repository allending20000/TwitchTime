import { useState } from "react";
import axios from "../../backend/node_modules/axios";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const AddChannel = () => {
    //State that represents channel name
    const [channelName, setChannelName] = useState(null);

    //handle changing channelName state
    const handleChannelNameChange = (e) => {
        console.log(e);
        setChannelName(e.target.value);
    }

    //handle submitting of form
    const handleSubmit = (e) => {
        //Prevent page from refreshing
        e.preventDefault();
        const data = {
            channelName: e.target[0].value
        };
        //Makes a post request to follow the given channel
        axios.post("http://localhost:8000/api/twitch/createUserFollow", data).then(res => {
            console.log(res);
        }).catch(error => {
            console.error(error);
        });
    }

    return (<div className="addChannel">
        <form className="channelForm" onSubmit={handleSubmit}>
            <input type="string" value={channelName || ""} placeholder="Name of Channel" onChange={handleChannelNameChange} />
            <button>Follow</button>
        </form>
    </div>);
}

export default AddChannel;