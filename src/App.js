import React, { Component } from 'react';
import TreeTable from './TreeTable';
import { TYPE_CLUSTER, TYPE_LOCALITY, TYPE_NODE } from './types';
import './App.css';

const nodeTree =
{
  type: TYPE_CLUSTER,
  children: [
    {
      type: TYPE_LOCALITY,
      name: 'US',
      children: [
        {
          type: TYPE_LOCALITY,
          name: 'us-east',
          children: [
            {
              type: TYPE_LOCALITY,
              name: 'us-east-1a',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.4'
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.5'
                },
              ]
            },
            {
              type: TYPE_LOCALITY,
              name: 'us-east-1b',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.6'
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.7'
                },
              ]
            }
          ]
        }
      ]
    },
    {
      type: TYPE_LOCALITY,
      name: 'EU',
      children: [
        {
          type: TYPE_LOCALITY,
          name: 'eu-east',
          children: [
            {
              type: TYPE_LOCALITY,
              name: 'eu-east-1a',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.8'
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.9'
                },
              ]
            },
            {
              type: TYPE_LOCALITY,
              name: 'eu-east-1b',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.10'
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.11'
                },
              ]
            }
          ]
        }
      ]
    },
  ]
}

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
