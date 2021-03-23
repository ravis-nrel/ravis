import React from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './components/app/App.js';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './rootReducer';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';


let middlewares = [thunkMiddleware];
if(process.env.LOG_ACTIONS === 'true') {
  middlewares.push(createLogger());
}

const store = createStore(rootReducer, applyMiddleware.apply(this, middlewares));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
