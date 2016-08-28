# Polyrhythmical

An experiment in Web MIDI and polyrhythms written in Javascript.
Try the [Demo](https://pierlo-upitup.github.io/polyrhythmical).

![Polyrhythmical](https://raw.githubusercontent.com/pierlo-upitup/polyrhythmical/master/image.png "Polyrhythmical")

# Demo

If you have a recent Chrome version you can try the online [demo](https://pierlo-upitup.github.io/polyrhythmical) or just click the following image to see a video recording of Polyrhytmical in action:

[![Polyrhythmical video tour](http://img.youtube.com/vi/WLgGamX6BFg/0.jpg)](http://www.youtube.com/watch?v=WLgGamX6BFg "Polyrhythmical video tour")

# Features

With Polyrhythmical you can create several step sequencers and generate patterns with different step lengths to achieve odd polyrhythms. Each sequencer can be attached to a different MIDI output and channel. You can control both external and internal MIDI capable devices. Here is a [simple tutorial](https://www.ableton.com/en/help/article/using-virtual-MIDI-buses-live/) on how to create a virtual MIDI device on OSX. 


# Notes

This is an **experiment** written just for fun. Do not expect this to be a full-featured MIDI sequencer in your browser.

The goal of this project is to explore the current limitations of the Web MIDI API and to have fun with MIDI sequencing in the browser.

Unfortunately until [Web Workers don't get access to the MIDI API](https://github.com/WebAudio/web-midi-api/issues/99), accurate timing will stay a dream.

Please note that [Web MIDI API](https://webaudio.github.io/web-midi-api/#midiinput-interface) is [currently only supported by Chrome and Opera](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess).


# Development

### Requirements
- a recent version of Chrome
- Node 5
- npm
- a MIDI interface (virtual OR physical)
- a MIDI capable synthesizer (hardware OR software)

To start the development environment:

```
git clone etc
npm install
npm start
```

to build for production:

```
npm build
cd build
php -S localhost:8181 # or any other http server
```

# License

Licensed under an MIT License.

# Credits
Thanks to [WebMidi](https://github.com/cotejp/webmidi) and 
[Web Audio Scheduler](https://github.com/mohayonao/web-audio-scheduler).
Based on [Create React App](https://github.com/facebookincubator/create-react-app)
 and [MUI CSS](https://www.muicss.com).
