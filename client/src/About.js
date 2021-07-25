const About = () => {
    return (<div className="about">
        <div className="header">About Us</div>
        <div className="content">This is a web application designed to let users manage their time watching
            their favorite Twitch channels. To start, simply follow a live channel on Twitch (unfortunately, the Twitch API
            has disabled the ability to follow users, which is why this step is manual). Then, you should be able to see
            that channel on the dashboard after reloading the page. From there, set the number of minutes you want to watch for (must be between 1
            and 1440, inclusive) and click 'Watch'. You will be redirected to a page where you can watch that channel with a timer below.
            After the timer has reached 0, the stream will automatically be removed and you will be prompted to return to the dashboard,
            which will reflect the time watched.</div>
    </div>);
}

export default About;