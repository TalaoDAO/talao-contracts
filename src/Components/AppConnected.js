import Vault from './Vault'
import Menu from './Menu'
import React, { Component } from 'react'

class AppConnected extends React.Component {

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-2">
                        <Menu />
                    </div>
                    <div className="col-12">
                        <Vault />
                    </div>
                </div>
            </div>
        )
    }
}

export default AppConnected;