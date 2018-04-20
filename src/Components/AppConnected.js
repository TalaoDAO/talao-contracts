import Vault from './Vault';
import Menu from './Menu';
import AddDocument from './AddDocument';
import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './AppConnected.css';

class AppConnected extends React.Component {

    render() {
        return (
            <Router>
                <div className="container">
                    <div className="row">
                        <div className="col-3">
                            <Menu />
                        </div>
                        <div className="col-9">
                            <Route exact path="/" component={Vault} />
                            <Route exact path="/adddocument" component={AddDocument} />
                        </div>
                    </div>
                </div>
            </Router>
        );
    }
}

export default AppConnected;