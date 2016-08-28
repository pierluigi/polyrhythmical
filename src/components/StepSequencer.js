import React from 'react';
import { Button, Dropdown, DropdownItem, Panel}
  from 'muicss/react';
import WebMidi from 'webmidi';

import StepSequencerPattern from './StepSequencerPattern';

const GRACE_NOTE_OFF = 100;

const RESOLUTIONS = {
  1: "1/16",
  2: "1/8",
  4: "1/4",
  16: "1 Bar"
};
const DEFAULT_RESOLUTION = 4;

const defaultPattern = () => {
  return {
    currentStep: -1,
    noteNumber: 66,
    steps: {
      0: {play: true, velocity: 100},
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null
    }
  }
};

const TO_BIND = [
  'handleAddPattern',
  'handleAddStep',
  'handlePatternNoteChange',
  'handleRemoveStep',
  'handleResolutionChange',
  'handleStepToggle',
  'onMidiOutputSelected',
  'onClockTick',
  'sendTestNote'
];


// TODO this component is getting huge
class StepSequencer extends React.Component {
  constructor() {
    super();

    TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.state = {
      selectedChannel: 1,
      selectedOutput: null,
      resolution: DEFAULT_RESOLUTION,
      patterns: [defaultPattern()]
    };
  }

  componentWillMount() {
    if (this.props.outputs && this.state.selectedOutput == null) {
      this.setState({selectedOutput: this.props.outputs[0]});
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.outputs && nextState.selectedOutput == null) {
      this.setState({selectedOutput: nextProps.outputs[0]});
    }
  }

  handleAddStep(patternKey) {
    this.updatePattern(patternKey, pattern => {
      let lastStep = Object.keys(pattern.steps).length;
      pattern.steps[lastStep] = null;
      return pattern;
    });
  }

  handleRemoveStep(patternKey) {
    this.updatePattern(patternKey, pattern => {
      let lastStep = Object.keys(pattern.steps).length;
      if (lastStep > 1) {
        delete pattern.steps[lastStep -1];
      }
      return pattern;
    });
  }

  handleStepToggle(patternKey, stepKey) {
    this.updatePattern(patternKey, pattern => {
      if (pattern.steps != null && pattern.steps[stepKey] !== undefined) {
        pattern.steps[stepKey] = pattern.steps[stepKey] == null
          ? {play: true, velocity: 1}
          : null;
      }
      return pattern;
    });
  }

  handlePatternNoteChange(patternKey, e) {
    this.updatePattern(patternKey, pattern => {
      pattern.noteNumber = parseInt(e.target.value, 10);
      return pattern;
    });
  }

  updatePattern(patternKey, callback = () => {}) {
    let newState = Object.assign({}, this.state);
    let pattern = Object.assign({}, newState.patterns[patternKey]);

    if (pattern != null) {
      newState.patterns[patternKey] = callback(pattern);
      this.setState(newState);
    }
  }

  handleResolutionChange(value) {
    this.setState({resolution: value});
  }

  handleAddPattern(e) {
    e.preventDefault();
    let newState = Object.assign({}, this.state);

    newState.patterns.push(Object.assign({}, {
      currentStep: -1,
      noteNumber: 41,
      steps: []
    }));

    this.setState(newState);
  }

  onMidiOutputSelected(id) {
    let selectedOutput = this.props.outputs.find(output => output.id === id);
    this.setState({selectedOutput});
  }

  sendTestNote(e) {
    e.preventDefault();
    const {selectedOutput, selectedChannel} = this.state;

    if (selectedOutput == null) {
      return;
    }

    selectedOutput.playNote(
      "C3",
      selectedChannel,
      {duration: WebMidi.time + 500, velocity: 1}
    );
  }

  // Returns the max length of all patterns
  getLastStep() {
    return this.state.patterns.reduce(function(memo, pattern) {
      return Math.max(Object.keys(pattern.steps).length, memo);
    }, 0);
  }

  getMidiChannelDropdown() {
    const {state} = this;
    const {outputs} = this.props;

    if (outputs == null || outputs.length === 0) {
      return (
        <Dropdown color="default" disabled label="No Outputs Found" />
      )
    }

    return (
      <Dropdown variant="raised"
                color="default"
                label={state.selectedChannel.toString()}
                size="small"
                onSelect={value => {
          let selectedChannel = parseInt(value, 10) || null;
          this.setState({selectedChannel});
        }}>
        {Array(16).fill(0).map((e, i) =>
            <DropdownItem key={i} value={i+1}>{i+1}</DropdownItem>
        )}
      </Dropdown>
    );
  }

  getOutputDevicesDropdown() {
    const {state} = this;
    const {outputs} = this.props;

    if (outputs == null || outputs.length === 0) {
      return (
        <Dropdown color="default" disabled label="No Outputs Found" />
      )
    }

    let selectedOutputName = state.selectedOutput != null
      ? state.selectedOutput.name
      : "Please select";

    return (

      <Dropdown label={selectedOutputName}
                variant="raised"
                color="default"
                size="small"
                onSelect={this.onMidiOutputSelected}>
        {outputs.map(output =>
            <DropdownItem key={output.id}
                          value={output.id}>
              {output.name}
            </DropdownItem>
        )}
      </Dropdown>
    );
  }

  onClockTick(t0, t1, e) {
    // Skip if outside of resolution
    if (e.args.tick % this.state.resolution !== 0) {
      return;
    }

    let newState = Object.assign({}, this.state);
    let {selectedOutput, selectedChannel} = this.state;
    let notes = [];

    // Set individual pattern steps
    newState.patterns.forEach(pattern => {
      if (pattern.steps != null) {
        let nextStep = parseInt(pattern.currentStep, 10) + 1;
        let lastStep = Object.keys(pattern.steps).length;

        // TODO avoid direct state mutation!
        pattern.currentStep = lastStep > 0
          ? nextStep % lastStep
          : 0;

        // Reset steps every 32 ticks
        // TODO refactor this crap
        if (e.args.tick % 32 === 0) {
          pattern.currentStep = 0;
        }

        // Got note?
        let activeStep = pattern.steps[pattern.currentStep];

        if (activeStep != null) {
          notes.push(pattern.noteNumber);
        }
      }
    });

    if (notes.length && selectedOutput != null) {
      let duration = parseInt(e.args.duration * 1000, 10);
      selectedOutput.playNote(
        notes,
        selectedChannel,
        {
          duration: WebMidi.time + duration - GRACE_NOTE_OFF,
          velocity: 0.8
        }
      );
    }

    this.setState(newState);
  }

  onClockReset() {
    // TODO immutability
    let newState = Object.assign({}, this.state);
    newState.patterns.forEach(pattern => { pattern.currentStep = -1;});
    this.setState(newState);
  }

  getPatternHeader() {
    let totalSteps = new Array(this.getLastStep()).fill(true);
    let cells = totalSteps.map((_, i) => (<th key={i} />));

    if (cells == null) {
      return null;
    }

    return (
      <tr>
        <th style={{width: "155px"}}>Last Step</th>
        <th style={{width: "75px"}}>Note #</th>
        {cells}
      </tr>
    );
  }

  getPatterns() {
    let totalSteps = new Array(this.getLastStep()).fill(true);

    return this.state.patterns.map((pattern, patternKey) => {
      return (
        <StepSequencerPattern key={patternKey}
                              onAddStep={this.handleAddStep}
                              onRemoveStep={this.handleRemoveStep}
                              onPatternNoteChange={this.handlePatternNoteChange}
                              onStepToggle={this.handleStepToggle}
                              totalSteps={totalSteps}
                              pattern={pattern}
                              patternKey={patternKey}/>
      );
    });
  }

  render() {
    let {resolution} = this.state;
    let resolutions = Object.keys(RESOLUTIONS).map(key => (
      <DropdownItem key={key} value={key}>{RESOLUTIONS[key]}</DropdownItem>
    ));

    return (
      <Panel>
        <div>
          <h2 style={{float: "left", margin: 0}}>Step Sequencer {this.props.id}</h2>
          <div style={{textAlign: "right"}}>
            <Button variant="fab"
                    color="danger"
                    size="small"
                    onClick={this.props.onDestroy.bind(this, this.props.id)}>
              X
            </Button>
          </div>
        </div>
        <table className="mui-table">
          <thead>
            {this.getPatternHeader()}
          </thead>
          <tbody>
            {this.getPatterns()}
            <tr>
              <td colSpan={2 + this.getLastStep()}>
                <Button color="primary" size="small"
                  onClick={this.handleAddPattern}>Add Pattern</Button>
              </td>
            </tr>
          </tbody>
        </table>
        <table className="mui-table">
          <thead>
          <tr>
            <th>Resolution</th>
            <th>Output Device</th>
            <th>MIDI Channel</th>
            <th>Test Output</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              <Dropdown label={RESOLUTIONS[resolution]}
                        variant="raised"
                        size="small"
                        onSelect={this.handleResolutionChange}>
                {resolutions}
              </Dropdown>
            </td>
            <td>{this.getOutputDevicesDropdown()}</td>
            <td>{this.getMidiChannelDropdown()}</td>
            <td>
              <Button size="small"
                      variant="fab"
                      disabled={this.state.selectedOutput == null}
                      color="dark"
                      onClick={this.sendTestNote}>
                ♬
              </Button>
            </td>
          </tr>
          </tbody>
        </table>
      </Panel>
    );
  }
}

StepSequencer.propType = {
  id: React.PropTypes.number,
  onDestroy: React.PropTypes.func,
  onNoteOn: React.PropTypes.func,
  onNoteOff: React.PropTypes.func,
  outputs: React.PropTypes.array
}

export default StepSequencer;
