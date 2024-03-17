import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';

import './index.css';
import App from '../components/App';
import ErrorDisplay from '../components/ErrorDisplay';

import MainActions from '../mainActions';
import { SubscribableState, StateMapper } from '../ruxx';

// Load Kuromoji right away
import { startLoadingKuromoji } from '../util/analysis';
startLoadingKuromoji();

// Set some last-ditch error handlers
const errorEmitter = new EventEmitter();
const handleError = (error) => {
  errorEmitter.emit('error', error);
  window.api.send('openDevTools');
};
window.addEventListener('error', e => {
  handleError(e.error);
});
window.addEventListener('unhandledrejection', e => {
  handleError(e.reason);
});

// Create state, actions
const subscribableMainState = new SubscribableState();
const actions = new MainActions(subscribableMainState);

ReactDOM.render(<ErrorDisplay errorEmitter={errorEmitter}><StateMapper subscribableState={subscribableMainState} renderState={state => <App mainState={state} actions={actions} />} /></ErrorDisplay>, document.getElementById('root'));
