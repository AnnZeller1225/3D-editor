import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter} from 'react-router-dom';
import store from './store';
import App from './components/app';
import ErrorBoundry from './components/error-boundry';
ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundry>

        <HashRouter>
          <App />
        </HashRouter>
    </ErrorBoundry>
  </Provider>,
  document.getElementById("root")
);