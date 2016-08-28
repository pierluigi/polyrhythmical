import React from 'react';
import { Button, Panel}
  from 'muicss/react';
import WebMidi from 'webmidi';

import Clock from './Clock';
import StepSequencer from './StepSequencer';

const TO_BIND = [
  'handleOnClockTick',
  'handleAddSequencer',
  'handleDestroySequencer',
  'handleOnClockReset',
  'onWebMidiDisconnected',
  'onWebMidiConnected'
];

export default class Main extends React.Component {
  constructor() {
    super();

    TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.initialRefCounter = 1;
    this.sequencerRefs = [];

    this.state = {
      outputs: null,
      sequencers: [{
        ref: `--seq-${this.initialRefCounter}`,
        component: StepSequencer
      }]
    }
  }

  componentDidMount() {
    this.onWebMidiConnected();
  }

  componentWillMount() {
    WebMidi.enable((err) => {
      if (err) {
        alert("Your browser does not support Web MIDI.");
        return;
      }

      WebMidi.addListener("connected", this.onWebMidiConnected);
      WebMidi.addListener("disconnected", this.onWebMidiDisconnected);
      this.onWebMidiConnected();
    });
  }

  componentWillUnmount() {
    WebMidi.removeListener("connected", this.onWebMidiConnected);
    WebMidi.removeListener("disconnected", this.onWebMidiDisconnected);
  }

  onWebMidiDisconnected() {
    this.assignDefaultMidiDevice();
  }

  onWebMidiConnected() {
    this.assignDefaultMidiDevice();
  }

  handleAddSequencer(e) {
    e.preventDefault();
    // TODO immutability
    let newSequencers = this.state.sequencers;

    newSequencers.push({
      ref: `--seq-${++this.initialRefCounter}`,
      component: StepSequencer
    });

    this.setState({sequencers: newSequencers});
  }

  handleDestroySequencer(id) {
    let newSequencers = this.state.sequencers;

    let index = newSequencers.findIndex(definition => definition.ref === id);
    if (index > -1) {
      newSequencers.splice(index, 1);
      this.setState({sequencers: newSequencers});
    }
  }

  handleOnClockTick(t0, t1, e = {args: null}) {
    this.state.sequencers.forEach(definition => {
      this.refs[definition.ref].onClockTick(...arguments);
    });
  }

  handleOnClockReset() {
    this.state.sequencers.forEach(definition => {
      this.refs[definition.ref].onClockReset(...arguments);
    });
  }

  assignDefaultMidiDevice() {
    const {outputs} = WebMidi;

    this.setState({outputs});
  }

  getSequencers() {
    return this.state.sequencers.map(definition => {
      let Sequencer = definition.component;
      let ref = definition.ref;
      return (
        <Sequencer ref={ref}
                   key={ref}
                   id={ref}
                   onDestroy={this.handleDestroySequencer}
                   outputs={this.state.outputs}
                   onNoteOn={this.handleNoteOn}
                   onNoteOff={this.handleNoteOff} />
      );
    });
  }

  // TODO
  // [ ] set gate duration in 1/N beats
  // [ ] https://github.com/dbkaplun/euclidean-rhythm
  render() {
    return (
      <div>
        <Clock onClockTick={this.handleOnClockTick}
               onClockReset={this.handleOnClockReset} />
        {this.getSequencers()}
        <Panel>
          <Button color="primary"
                  onClick={this.handleAddSequencer}>
            Add Step Sequencer
          </Button>
        </Panel>
      </div>
    );
  }
}
