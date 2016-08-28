# Polyrhythmical

An experiment in Web MIDI and polyrhythms written in Javascript.

![Polyrhythmical](https://raw.githubusercontent.com/pierlo-upitup/polyrhythmical/master/image.png "Polyrhythmical")


# Installation

### Requirements
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
