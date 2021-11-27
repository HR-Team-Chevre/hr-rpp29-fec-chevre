import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App.jsx';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.has('product') ? urlParams.get('product') : 59556;

ReactDOM.render(
  <App productId={productId}/>,
  document.getElementById('app')
);

