import React from 'react';
import { Panel} from 'muicss/react';

const About = () => {
  return (
    <Panel>
      <h2>About</h2>
      <p>&copy; 2016 <a target="_blank" href="https://github.com/pierlo-upitup">Pierlo</a></p>
      <h2>Author</h2>
      <p>Pierlo</p>
      <h2>Credits</h2>
      <p>Thanks to <a target="_blank" href="https://github.com/cotejp/webmidi">WebMidi</a> and
        <a target="_blank" href="https://github.com/mohayonao/web-audio-scheduler">Web Audio Scheduler</a>.
        Based on <a target="_blank" href="https://github.com/facebookincubator/create-react-app">Create React App</a> and
        <a target="_blank" href="https://www.muicss.com">MUI CSS</a>.</p>
    </Panel>
  );
};

export default About;
