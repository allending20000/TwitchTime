import { useState } from "react";

import { useEffect } from "react";

const Timer = (props) => {
    //props.time
    //time remaining on the timer in seconds
    const [timeRemaining, setTimeRemaining] = useState(null);
    //timeObj has properties h, m, and s, representing hours, minutes, seconds, respectively
    const [timeObj, setTimeObj] = useState(null);
    //value returned by setInterval, needed to clear interval
    const [intervalResponse, setIntervalResponse] = useState(null);
    //Converts current time in seconds to a time object
    const getTimeObjFromSec = (sec) => {
        const hours = Math.floor(sec / 3600);
        const minsLeftoverInSec = sec % 3600;
        const mins = Math.floor(minsLeftoverInSec / 60);
        const secs = Math.ceil(minsLeftoverInSec % 60);
        return {
            h: hours,
            m: mins,
            s: secs
        };
    }
    //Starts the timer
    const decrementTimer = () => {
        console.log(timeRemaining);
        if (timeRemaining === 0) {
            clearInterval(intervalResponse);
            return;
        }
        let newTime = timeRemaining - 1;
        setTimeRemaining(newTime);
        setTimeObj(getTimeObjFromSec(newTime));
    };
    //Called when component first mounts
    useEffect(() => {
        //Set the time remaining and time object, given that props.time is in mins
        const timeInSec = props.time * 60;
        setTimeRemaining(timeInSec);
        setTimeObj(getTimeObjFromSec(timeInSec));
        console.log(timeRemaining);
        //Starts the timer and sets interval response
        //setIntervalResponse(setInterval(decrementTimer, 1000));
        setInterval(decrementTimer, 1000);
    }, []);

    return (<div className="timer">
        {timeObj && <div>
            {timeObj.h} {timeObj.m} {timeObj.s}
        </div>}
    </div>);
}

export default Timer;