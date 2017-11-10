import _ from 'lodash';
import React, { Component } from 'react';
import TreeTable, { stringifyPath, unStringifyPath, filterDescendentPaths } from './TreeTable';
import { TYPE_NODE } from './types';
import nodeTree from './data'
import map from './map.svg';
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

function findNode(root, path) {
  function recur(curNode, pathInd) {
    if (pathInd === path.length) {
      return curNode;
    }
    const curPathElem = path[pathInd];
    for (const child of curNode.children) {
      if (child.name === curPathElem) {
        return recur(child, pathInd + 1)
      }
    }
  }
  return recur(root, 1);
}

function getLeafPathsFromNode(node, pathToNode) {
  const output = [];
  function recur(curNode, pathToCurNode) {
    if (curNode.type === TYPE_NODE) {
      output.push(pathToCurNode);
      return;
    }
    curNode.children.forEach((child) => {
      const pathToChild = [...pathToCurNode, child.name];
      recur(child, pathToChild);
    });
  }
  recur(node, pathToNode);
  return output;
}

function getLeafPaths(data, paths) {
  const output = new Set();
  paths.forEach((path) => {
    const node = findNode(data, path);
    const leafPaths = getLeafPathsFromNode(node, path);
    leafPaths.forEach((path) => {
      output.add(path);
    });
  })
  return output;
}

class App extends Component {

  constructor() {
    super();
    this.state = {
      tab: TAB_MAP,
      selectedNodes: new Set(),
      hoveredNode: null
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
    this.setState({
      hoveredNode: path
    });
  }

  handleUnHoverNode(path) {
    this.setState({
      hoveredNode: null
    });
  }

  render() {
    const handleChangeTab = this.handleChangeTab.bind(this);
    const handleSelectNode = this.handleSelectNode.bind(this);
    const handleUnSelectNode = this.handleUnSelectNode.bind(this);
    const handleHoverNode = this.handleHoverNode.bind(this);
    const handleUnHoverNode = this.handleUnHoverNode.bind(this);

    let tabContents;
    switch (this.state.tab) {
      case TAB_MAP: {
        const hovered = this.state.hoveredNode;
        tabContents = (
          <div>
            <svg className="map" height="400px" width="800px">
              <image href={map} height="400px" />
            </svg>
            <p>Hovered: {hovered ? hovered.join('/') : '(none)'}</p>
          </div>
        );
        break;
      }
      case TAB_TS: {
        const selectedNodes = Array.from(this.state.selectedNodes).map(unStringifyPath);
        const leafPaths = getLeafPaths(nodeTree, selectedNodes);
        tabContents = (
          <div style={{ height: 400 }}>
            <p>Imagine some pretty time series here</p>
            <p>Of nodes:</p>
            <ul>
              {Array.from(leafPaths).map((path) => (
                <li key={path.join('/')}>{path.join('/')}</li>
              ))}
            </ul>
            <p>Of metrics:</p>
            <ul>
              <li>CPU</li>
              <li>QPS</li>
              <li>GB Used</li>
              <li>GB Available</li>
              <li>% GB Used</li>
            </ul>
          </div>
        );
        break;
      }
      case TAB_MATRIX:
        tabContents = (
          <div style={{ height: 400 }}>
            <p>(Node replication / latency / throughput matrix)</p>
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
        </div>
        <div>
          <TreeTable
            nodes={nodeTree}
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
