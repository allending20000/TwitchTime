const Authentication = () => {
    return (<div className="authentication">
        <div className="title">
            <span>TwitchTime</span>
            <img src="https://www.tailorbrands.com/wp-content/uploads/2021/04/twitch-logo.png" alt="Twitch Logo" />
        </div>
        <div className="content">
            <div>Welcome to TwitchTime: an app that easily allows you to manage your time watching your favorite channels.</div>
            <a href="/api/auth/signin" className="button">Sign In with Twitch</a>
        </div>
    </div>);
}

export default Authentication;