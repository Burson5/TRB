const colors = {
  progressColor: '#0d08',
  arrow: '#555',
  danger: 'red',
  complete: '#f00',
  paused: 'grey',
  background: 'white'
};

const Icon24 = new Image();
const imgSrc = (Icon24.src = require('~/assets/images/icon_24.png'));
const TAU = 2 * Math.PI;

export { colors, imgSrc, TAU };
