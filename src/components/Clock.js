import React from 'react';
import { Button, Checkbox, Input, Panel} from 'muicss/react';
import WebAudioScheduler from 'web-audio-scheduler';
import WorkerTimer from "worker-timer";

import Dot from "./Dot";

const DEFAULT_BPM = 120;
const SCHEDULER_INTERVAL = 0.025;
const SCHEDULER_AHEAD = 0.01;

var CURRENT_TICK = 0;

const noop = () => {};

const TO_BIND = [
  'handleMetronomeCheckboxChanged',
  'handleBPMChange',
  'ticktack',
  'metronome',
  'start',
  'stop',
  'reset'
];

class Clock extends React.Component {
  constructor() {
    super();

    this.audioContext = null;
    this.scheduler = null;

    TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.state = {
      running: false,
      isMetronomeUp: false,
      isMetronomeDown: false,
      isMetronomeEnabled: false,
      bpm: DEFAULT_BPM
    };
  }

  componentWillMount() {
    this.audioContext = new AudioContext();
    this.scheduler = new WebAudioScheduler({
      interval: SCHEDULER_INTERVAL,
      aheadTime: SCHEDULER_AHEAD,
      context: this.audioContext,
      timerAPI: WorkerTimer
    });
  }

  componentWillUnmount() {
    this.stop();
  }

  handleBPMChange(e) {
    this.setState({bpm: parseInt(e.target.value, 10)}, () => {
      //this.scheduler.removeAll();
      //this.scheduler.start(this.metronome);
    });
  }

  handleMetronomeCheckboxChanged(e) {
    this.setState({isMetronomeEnabled: !this.state.isMetronomeEnabled});
  }

  ticktack(e) {
    var t0 = e.playbackTime;
    var t1 = t0 + e.args.duration;

    this.props.onClockTick(t0, t1, e);

    let isBeat = e.args.tick % 4 === 0;
    let isMeasure = e.args.tick % 16 === 0;

    // Visual Metronome
    if (e.args.tick % 8 === 0) {
      this.setState({isMetronomeUp: true, isMetronomeDown: false});
    } else if (isBeat){
      this.setState({isMetronomeUp: false, isMetronomeDown: true});
    }

    // Metronome
    if (this.state.isMetronomeEnabled && isBeat) {
      const osc = this.audioContext.createOscillator();
      const amp = this.audioContext.createGain();

      osc.frequency.value = isMeasure ? 880 : 440;
      osc.start(t0);
      osc.stop(t1);
      osc.connect(amp);

      amp.gain.setValueAtTime(isMeasure ? 1 : 0.8, t0);
      amp.gain.exponentialRampToValueAtTime(1e-6, t1);
      amp.connect(this.audioContext.destination);

      this.scheduler.nextTick(t1, () => {
        osc.disconnect();
        amp.disconnect();
      });
    }

  }

  metronome(e) {
    // TODO clean up this mess
    let duration = parseFloat(
      ((1000 / (this.state.bpm / 60) / 1000) / 4).toFixed(4)
    );

    let t0 = e.playbackTime;
    let t1 = t0 + duration;

    // Send tick and schedule next call
    this.scheduler.insert(t0, this.ticktack, {
      tick: CURRENT_TICK++,
      duration: duration
    });

    this.scheduler.insert(t1, this.metronome);
  }

  start() {
    this.scheduler.start(this.metronome);
    this.props.onClockStart();
    this.setState({running: true});
  }

  stop() {
    this.scheduler.stop(true);
    this.props.onClockStop();
    this.setState({running: false});
  }

  reset() {
    this.scheduler.stop(true);
    CURRENT_TICK = 0;
    this.props.onClockReset();
    this.setState({
      isMetronomeUp: false,
      isMetronomeDown: false,
      running: false
    });
  }

  render() {
    return (
      <Panel>
        <table className="mui-table">
          <thead>
            <tr>
              <th>Transport</th>
              <th>BPM</th>
              <th>
                Metronome <span>
                  <Dot visible={this.state.isMetronomeUp} />
                  <Dot visible={this.state.isMetronomeDown} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Button color={ this.state.running ? "accent" : "primary"}
                        size="small"
                        onClick={this.start}>‣</Button>
                <Button color="dark"
                        size="small"
                        onClick={this.stop}>■</Button>
                <Button color="dark"
                        size="small"
                        onClick={this.reset}>⤆</Button>
              </td>
              <td>
                <Input type="number" value={this.state.bpm.toString()}
                       onChange={this.handleBPMChange} />
              </td>
              <td>
                <Checkbox label="Audible"
                          checked={this.state.isMetronomeEnabled}
                          onChange={this.handleMetronomeCheckboxChanged} />
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    );
  }
}

Clock.propTypes = {
  onClockTick: React.PropTypes.func,
  onClockStart: React.PropTypes.func,
  onClockStop: React.PropTypes.func,
  onClockReset: React.PropTypes.func
};


Clock.defaultProps = {
  onClockTick: noop,
  onClockStart: noop,
  onClockStop: noop,
  onClockReset: noop
}

export default Clock;
