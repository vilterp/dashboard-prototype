import _ from 'lodash';
import React, { Component } from 'react';
import TreeTable from './TreeTable';
import MultiTimeSeries from './MultiTimeSeries';
import Matrix from './Matrix';
import Map from './Map';
import { stringifyPath, unStringifyPath, filterDescendentPaths } from './types';
import { TYPE_NODE } from './types';
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
          <div style={{ height: 400, overflow: 'scroll' }}>
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
