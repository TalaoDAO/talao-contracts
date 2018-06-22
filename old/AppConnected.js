import Vault from './vault/Vault';
import Menu from './menu/Menu';
import AddDocument from './document/AddDocument';
import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './AppConnected.css';

class AppConnected extends React.Component {

    render() {
        return (
            <Router>
                <div>
                    <div>
                        <Menu />
                        <div>
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