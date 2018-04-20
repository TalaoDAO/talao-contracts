import React from 'react';
import { Link } from "react-router-dom";

class Menu extends React.Component {

    render() {
        return (
            <div>
                <div className="ml-4 mt-3">
                    <div>
                        <Link to="/">My account</Link>
                    </div>
                    <div>
                        <Link to="/adddocument">Add document</Link>
                    </div>
                </div>
            </div >
        );
    }
}

export default Menu;
