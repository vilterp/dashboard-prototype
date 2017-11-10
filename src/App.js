import _ from 'lodash';
import React, { Component } from 'react';
import TreeTable from './TreeTable';
import nodeTree from './data'
import map from './map.svg';
import classNames from 'classnames';
import './App.css';

const TAB_MAP = 'MAP';
const TAB_TS = 'TS';

const TABS = {
  [TAB_MAP]: 'Map',
  [TAB_TS]: 'Time Series'
};

class App extends Component {

  constructor() {
    super();
    this.state = {
      tab: TAB_MAP
    };
  }

  handleChangeTab(tabId) {
    this.setState({
      tab: tabId
    });
  }

  render() {
    const handleChangeTab = this.handleChangeTab.bind(this);

    console.log(this.state.tab);
    let tabContents;
    switch (this.state.tab) {
      case TAB_MAP:
        tabContents = (
          <svg height="400px" width="800px">
            <image href={map} height="400px" />
          </svg>
        );
        break;
      case TAB_TS:
        tabContents = (
          <div style={{ height: 400 }}>
            <p>Imagine some pretty time series here</p>
          </div>
        );
        break;
      default:
        console.error('unknown tab');
        tabContents = null;
    }

    return (
      <div>
        <h1>Cluster Overview</h1>
        <div style={{ margin: 10 }}>
          <ul className="nav nav-tabs">
            {_.map(TABS, (tabName, tabId) => (
              <li
                key={tabId}
                className="nav-item"
                onClick={() => { console.log(tabId); handleChangeTab(tabId) }}
              >
                <a className={classNames('nav-link', { active: this.state.tab === tabId })}>
                  {tabName}
                </a>
              </li>
            ))}
          </ul>
          {tabContents}
        </div>
        <div>
          <TreeTable nodes={nodeTree} />
        </div>
      </div>
    );
  }
}

export default App;
