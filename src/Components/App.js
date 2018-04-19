import React, { Component } from 'react'
import Web3Wrapper from './web3wrapper/Web3Wrapper'
import AppConnected from './AppConnected'

class App extends React.Component {

    render() {
        return (
            <div>
                <p> app test </p>
                <Web3Wrapper>
                    <AppConnected />
                </Web3Wrapper>
            </div>

        )
    }
}

export default App;