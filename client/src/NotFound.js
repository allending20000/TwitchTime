import { Link } from "react-router-dom";

const NotFound = () => {
    return (<div className="notFound">
        <div>Page cannot be found</div>
        <Link to="/">Return to front page</Link>
    </div>);
}

export default NotFound;