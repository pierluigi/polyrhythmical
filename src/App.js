import React from 'react';
import { Link } from 'react-router';
import { Container, Panel } from 'muicss/react';

import Main from './components/Main';

class App extends React.Component {
  render() {
    return (
      <div>
        <Panel>
          <Container>
            <h1>Polyrhythmical</h1>
            <h4>
              A simple browser-based polyrhythmic MIDI sequencer by <a href="https://github.com/pierlo-upitup">Pierlo</a>
            </h4>
            <div>
              <span className="mui--divider-right">
                <Link to="/">Main</Link>
              </span>
              <span>
                <Link to="/about">About</Link>
              </span>
            </div>
          </Container>
        </Panel>
        <Container>
          {this.props.children || <Main />}
        </Container>
        <Container>
          <p>
            &copy; 2016 by <a href="https://github.com/pierlo-upitup">Pierlo</a>
          </p>
        </Container>
      </div>
    )
  }
}

App.propTypes = { children: React.PropTypes.object };

export default App;
