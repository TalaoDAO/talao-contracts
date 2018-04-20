import React from 'react';
import { Link } from "react-router-dom";

class Menu extends React.Component {

    render() {
        return (
            <div>
                <img src={require("../talao-logo.svg")} alt="talao logo" />
                <div>
                    <Link to="/">My Account</Link>
                </div>
                <div>
                    <Link to="/adddocument">Add document</Link>
                </div>
            </div >
        );
    }
}

export default Menu;
