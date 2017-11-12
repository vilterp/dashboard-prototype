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
    this.state = stateFromUrl(decodeURI(window.location.pathname));
  }

  componentDidMount() {
    window.addEventListener('popstate', (evt) => {
      this.setStateFromWindow(evt.state);
    });
  }

  setStateFromWindow(state) {
    this.setState({
      tab: state.tab,
      selectedNodes: state.selectedNodes
    });
  }

  handleChangeTab(tabId) {
    this.setState({
      tab: tabId
    });
    pushWindowState({
      tab: tabId,
      selectedNodes: this.state.selectedNodes
    });
  }

  handleSelectNode(path) {
    const selected = this.state.selectedNodes;
    selected.add(stringifyPath(path));
    const filteredSelectedNodes = filterDescendentPaths(selected, path);
    this.setState({
      selectedNodes: filteredSelectedNodes
    });
    pushWindowState({
      tab: this.state.tab,
      selectedNodes: new Set([...filteredSelectedNodes])
    });
  }

  handleUnSelectNode(path) {
    const selected = this.state.selectedNodes;
    selected.delete(stringifyPath(path));
    this.setState({
      selectedNodes: selected
    });
    pushWindowState({
      tab: this.state.tab,
      selectedNodes: new Set([...selected])
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

  handleAddMetric(metric) {
    this.state.selectedMetrics.add(metric);
    this.setState({
      selectedMetrics: this.state.selectedMetrics
    });
  }

  handleRemoveMetric(metric) {
    this.state.selectedMetrics.delete(metric);
    this.setState({
      selectedMetrics: this.state.selectedMetrics
    });
  }

  handleSetMetrics(metrics) {
    this.setState({
      selectedMetrics: metrics
    });
  }

  render() {
    const handleChangeTab = this.handleChangeTab.bind(this);
    const handleSelectNode = this.handleSelectNode.bind(this);
    const handleUnSelectNode = this.handleUnSelectNode.bind(this);
    const handleHoverNode = this.handleHoverNode.bind(this);
    const handleUnHoverNode = this.handleUnHoverNode.bind(this);
    const handleToggle = this.handleToggleSelected.bind(this);
    const handleAddMetric = this.handleAddMetric.bind(this);
    const handleRemoveMetric = this.handleRemoveMetric.bind(this);
    const handleSetMetrics = this.handleSetMetrics.bind(this);

    const selectedNodes = Array.from(this.state.selectedNodes).map(unStringifyPath);
    const leafPaths = getLeafPaths(nodeTree, selectedNodes);

    let tabContents;
    switch (this.state.tab) {
      case TAB_MAP: {
        tabContents = (
          <div style={{ height: 400 }}>
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
              selectedNodes={this.state.selectedNodes}
              selectedMetrics={this.state.selectedMetrics}
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
              selectedNodes={this.state.selectedNodes}
              hoveredNodes={this.state.hoveredNodes}
              onHover={handleHoverNode}
              onUnHover={handleUnHoverNode}
            />
          </div>
        );
        break;
      default:
        console.error('unknown tab', this.state.tab);
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
        </div>
        <div>
          <TreeTable
            nodes={nodeTree}
            selectedNodes={this.state.selectedNodes}
            selectedMetrics={this.state.selectedMetrics}
            hoveredNodes={this.state.hoveredNodes}
            showCheckboxes={true}
            onSelect={handleSelectNode}
            onUnSelect={handleUnSelectNode}
            onHover={handleHoverNode}
            onUnHover={handleUnHoverNode}
            onAddMetric={handleAddMetric}
            onRemoveMetric={handleRemoveMetric}
            onSetMetrics={handleSetMetrics}
            onSelectTS={() => handleChangeTab(TAB_TS)}
          />
        </div>
      </div>
    );
  }
}

export function stateToUrl(state) {
  const tabName = state.tab.toLowerCase();
  return `/${tabName}/${Array.from(state.selectedNodes).join(';')}`;
}

export function stateFromUrl(url) {
  const segments = url.split('/');
  segments.splice(0, 1); // remove initial ''
  const result = {
    tab: TAB_MAP,
    hoveredNodes: new Set(),
    selectedNodes: new Set(),
    selectedMetrics: new Set()
  }
  if (segments.length > 0 && segments[0].length > 0) {
    result.tab = segments[0].toUpperCase();
  }
  if (segments.length > 1 && segments[1].length > 0) {
    const selected = segments[1].split(';');
    result.selectedNodes = new Set(selected);
  }
  console.log(result);
  return result;
}

export function pushWindowState(state) {
  window.history.pushState(state, '', stateToUrl(state));
}

export default App;
