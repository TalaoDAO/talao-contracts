import React from 'react';
import './App.scss';
import Button from '@material/react-button/dist';

class App extends React.Component {

    render() {
      return (
        <div>
          <header>
            Header
          </header>
          <main>
            <Button className='button-alternate'>
              Hello World
            </Button>
          </main>
          <footer>
          </footer>
        </div>
      );
    }
}

export default App;