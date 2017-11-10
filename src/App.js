import React, { Component } from 'react';
import TreeTable from './TreeTable';
import nodeTree from './data'
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <div>Map or Timeseries or Matrix goes here</div>
        <div>
          <TreeTable nodes={nodeTree} />
        </div>
      </div>
    );
  }
}

export default App;
