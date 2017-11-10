import _ from 'lodash';
import React, { Component } from 'react';
import TreeTable from './TreeTable';
import MultiTimeSeries from './MultiTimeSeries';
import Matrix from './Matrix';
import Map from './Map';
import {
  stringifyPath,
  unStringifyPath,
  getLeafPaths,
  filterDescendentPaths
} from './nodes';
import nodeTree from './data'
import classNames from 'classnames';
import './App.css';

const TAB_MAP = 'MAP';
const TAB_TS = 'TS';
const TAB_MATRIX = 'MATRIX';

const TABS = {
  [TAB_MAP]: 'Map',
  [TAB_TS]: 'Time Series',
  [TAB_MATRIX]: 'Matrix'
};

const nodesForTesting = [
  {
    path: ['Cluster', 'US'],
    cityName: 'Omaha',
  },
  {
    path: ['Cluster', 'EU'],
    cityName: 'Berlin'
  },
  {
    path: ['Cluster', 'China', 'Beijing'],
    cityName: 'Beijing'
  }
];

class App extends Component {

  constructor() {
    super();
    this.state = {
      tab: TAB_MAP,
      selectedNodes: new Set(),
      hoveredNodes: new Set()
    };
  }

  handleChangeTab(tabId) {
    this.setState({
      tab: tabId
    });
  }

  handleSelectNode(path) {
    const selected = this.state.selectedNodes;
    selected.add(stringifyPath(path));
    this.setState({
      selectedNodes: filterDescendentPaths(selected, path)
    });
  }

  handleUnSelectNode(path) {
    const selected = this.state.selectedNodes;
    selected.delete(stringifyPath(path));
    this.setState({
      selectedNodes: selected
    });
  }

  handleHoverNode(path) {
    this.state.hoveredNodes.add(stringifyPath(path));
    this.setState({
      hoveredNodes: this.state.hoveredNodes
    });
  }

  handleUnHoverNode(path) {
    this.state.hoveredNodes.delete(stringifyPath(path));
    this.setState({
      hoveredNodes: this.state.hoveredNodes
    });
  }

  handleToggleSelected(path) {
    if (this.state.selectedNodes.has(stringifyPath(path))) {
      this.handleUnSelectNode(path);
    } else {
      this.handleSelectNode(path);
    }
  }

  render() {
    const handleChangeTab = this.handleChangeTab.bind(this);
    const handleSelectNode = this.handleSelectNode.bind(this);
    const handleUnSelectNode = this.handleUnSelectNode.bind(this);
    const handleHoverNode = this.handleHoverNode.bind(this);
    const handleUnHoverNode = this.handleUnHoverNode.bind(this);
    const handleToggle = this.handleToggleSelected.bind(this);

    const selectedNodes = Array.from(this.state.selectedNodes).map(unStringifyPath);
    const leafPaths = getLeafPaths(nodeTree, selectedNodes);

    let tabContents;
    switch (this.state.tab) {
      case TAB_MAP: {
        tabContents = (
          <div style={{ margin: 10 }}>
            <Map
              nodes={nodesForTesting}
              hoveredNodes={this.state.hoveredNodes}
              selectedNodes={this.state.selectedNodes}
              onHover={handleHoverNode}
              onUnHover={handleUnHoverNode}
              onClick={handleToggle}
            />
          </div>
        );
        break;
      }
      case TAB_TS: {
        tabContents = (
          <div style={{ height: 400, overflow: 'scroll' }}>
            <MultiTimeSeries
              hoveredNodes={this.state.hoveredNodes}
              selectedNodes={leafPaths}
              onHover={handleHoverNode}
              onUnHover={handleUnHoverNode}
            />
          </div>
        );
        break;
      }
      case TAB_MATRIX:
        tabContents = (
          <div style={{ minHeight: 400 }}>
            <Matrix
              selectedNodes={leafPaths}
              hoveredNodes={this.state.hoveredNodes}
              onHover={handleHoverNode}
              onUnHover={handleUnHoverNode}
            />
          </div>
        );
        break;
      default:
        console.error('unknown tab');
        tabContents = null;
    }

    return (
      <div style={{ margin: 10 }}>
        <h1>Cluster Overview</h1>
        <div>
          <ul className="nav nav-tabs">
            {_.map(TABS, (tabName, tabId) => (
              <li
                key={tabId}
                className="nav-item"
                onClick={() => { handleChangeTab(tabId) }}
              >
                <a className={classNames('nav-link', { active: this.state.tab === tabId })}>
                  {tabName}
                </a>
              </li>
            ))}
          </ul>
          {tabContents}
          <p>
            Hovered:{' '}
            {Array.from(this.state.hoveredNodes).map((path) =>
              unStringifyPath(path).join('/')
            ).join(', ')}
          </p>
        </div>
        <div>
          <TreeTable
            nodes={nodeTree}
            selectedNodes={this.state.selectedNodes}
            hoveredNodes={this.state.hoveredNodes}
            onSelect={handleSelectNode}
            onUnSelect={handleUnSelectNode}
            onHover={handleHoverNode}
            onUnHover={handleUnHoverNode}
          />
        </div>
      </div>
    );
  }
}

export default App;
