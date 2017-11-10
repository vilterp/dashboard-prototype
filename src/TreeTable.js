import React, { Component } from 'react';
import { TYPE_LOCALITY, TYPE_NODE } from './types';
import classNames from 'classnames';

export function stringifyPath(path) {
  return JSON.stringify(path);
}

export function unStringifyPath(stringified) {
  return JSON.parse(stringified);
}

function pathHasPrefix(path, prefix) {
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== path[i]) {
      return false;
    }
  }
  return true;
}

// filterDescendentPaths returns a new set with the paths that descend
// from the given path filtered out.
export function filterDescendentPaths(allPaths, path) {
  const res = new Set([...allPaths].filter((curPathStr) => {
    const curPath = unStringifyPath(curPathStr);
    const isDescendant = curPath.length > path.length && pathHasPrefix(curPath, path);
    return !isDescendant;
  }));
  return res;
}

const EMPTY_PATH = stringifyPath([]);

const EMPTY_STATS = {
  QPS: 0,
  gbUsed: 0,
  gbCapacity: 0
};

function addStats(a, b) {
  return {
    QPS: a.QPS + b.QPS,
    gbUsed: a.gbUsed + b.gbUsed,
    gbCapacity: a.gbCapacity + b.gbCapacity
  };
}

class TreeTable extends Component {

  constructor() {
    super();
    this.state = {
      collapsedNodes: new Set(),
      hoveredNodes: new Set(),
      selectedNodes: new Set() // just what the user has actually clicked on
    };
  }

  handleToggle(path) {
    const collapsed = this.state.collapsedNodes;
    const stringified = stringifyPath(path);
    if (collapsed.has(stringified)) {
      collapsed.delete(stringified);
    } else {
      collapsed.add(stringified);
    }
    this.setState({
      collapsedNodes: collapsed
    });
  }

  handleHover(path) {
    const hovered = this.state.hoveredNodes;
    hovered.add(stringifyPath(path));
    this.setState({
      hoveredNodes: hovered
    });
    if (this.props.onHover) {
      this.props.onHover(path);
    }
  }

  handleUnHover(path) {
    const hovered = this.state.hoveredNodes;
    hovered.delete(stringifyPath(path));
    this.setState({
      hoveredNodes: hovered
    });
    if (this.props.onUnHover) {
      this.props.onUnHover(path);
    }
  }

  handleSelect(path) {
    const selected = this.state.selectedNodes;
    selected.add(stringifyPath(path));
    this.setState({
      selectedNodes: filterDescendentPaths(selected, path)
    });
    if (this.props.onSelect) {
      this.props.onSelect(path);
    }
  }

  handleUnSelect(path) {
    const selected = this.state.selectedNodes;
    selected.delete(stringifyPath(path));
    this.setState({
      selectedNodes: selected
    });
    if (this.props.onUnSelect) {
      this.props.onUnSelect(path);
    }
  }

  flatten(nodeTree) {
    const output = [];
    const collapsedNodes = this.state.collapsedNodes;
    const hoveredNodes = this.state.hoveredNodes;
    const selectedNodes = this.state.selectedNodes;

    // stringified path => stats
    const memoizedStats = {};

    function getStats(node, strPathToNode) {
      if (node.type === TYPE_NODE) {
        return node.stats;
      }
      if (memoizedStats[strPathToNode]) {
        return memoizedStats[strPathToNode];
      }
      let result = EMPTY_STATS;
      node.children.forEach((childNode) => {
        result = addStats(result, getStats(childNode));
      });
      return result;
    }

    function recur(node, depth, pathSoFar, parentSelected) {
      const pathToThis = [...pathSoFar];
      pathToThis.push(node.name);
      const strPathToThis = stringifyPath(pathToThis);
      const nodeCollapsed = collapsedNodes.has(strPathToThis);
      const nodeSelected = selectedNodes.has(strPathToThis);
      output.push({
        depth: depth,
        node: node,
        path: pathToThis,
        hovered: hoveredNodes.has(strPathToThis),
        collapsed: nodeCollapsed,
        selected: nodeSelected || parentSelected,
        stats: getStats(node, strPathToThis)
      });
      if (node.type !== TYPE_NODE && !nodeCollapsed) {
        node.children.forEach((childNode) => {
          recur(childNode, depth + 1, pathToThis, parentSelected || nodeSelected);
        });
      }
    }
    recur(nodeTree, 0, [], selectedNodes.has(EMPTY_PATH));
    return output;
  }

  render() {
    const { nodes } = this.props;

    const flattenedNodes = this.flatten(nodes);

    const handleToggle = this.handleToggle.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);
    const handleSelect = this.handleSelect.bind(this);
    const handleUnSelect = this.handleUnSelect.bind(this);

    return (
      <table className="table-compact treetable">
        <thead>
          <tr>
            <th></th>
            <th style={{ width: 300 }}>Name</th>
            <th>CPU</th>
            <th>QPS</th>
            <th>GB Used</th>
            <th>GB Capacity</th>
            <th>% GB Used</th>
          </tr>
        </thead>
        <tbody>
          {flattenedNodes.map((flattenedNode) => (
            <Node
              key={flattenedNode.path.join('-')}
              flattenedNode={flattenedNode}
              onToggleCollapsed={handleToggle}
              onHover={handleHover}
              onUnHover={handleUnHover}
              onSelect={handleSelect}
              onUnSelect={handleUnSelect}
            />
          ))}
        </tbody>
      </table>
    )
  }

}

const INDENT_PX = 20;

class Node extends Component {

  render() {
    const {
      flattenedNode,
      onToggleCollapsed,
      onHover,
      onUnHover,
      onSelect,
      onUnSelect
    } = this.props;
    const { node, depth, path } = flattenedNode;

    const trClassnames = classNames(
      'treetable-node',
      {
        'locality': node.type === TYPE_LOCALITY,
        'hovered': flattenedNode.hovered
      }
    );

    let arrow = '';
    if (node.type === TYPE_LOCALITY) {
      arrow = flattenedNode.collapsed ? '▶ ' : '▼ ';
    }

    const stats = flattenedNode.stats;

    const toggleSelected = () => flattenedNode.selected ? onUnSelect(path) : onSelect(path);

    const onNameClick = node.type === TYPE_LOCALITY
      ? () => { onToggleCollapsed(path) }
      : toggleSelected;

    return (
      <tr
        className={trClassnames}
        onMouseOver={() => onHover(path)}
        onMouseOut={() => onUnHover(path)}
      >
        <td style={{ textAlign: 'center' }}>
          <input
            type="checkbox"
            checked={flattenedNode.selected}
            onClick={toggleSelected}
          />
        </td>
        <td
          style={{ paddingLeft: depth * INDENT_PX }}
          className={'treetable-node-name'}
          onClick={onNameClick}
        >
          {arrow}{node.name}
        </td>
        <td className="treetable-stat">{node.type === TYPE_NODE ? `${Math.round(stats.CPU)}%` : ''}</td>
        <td className="treetable-stat">{Math.round(stats.QPS)}</td>
        <td className="treetable-stat">{Math.round(stats.gbUsed)}</td>
        <td className="treetable-stat">{Math.round(stats.gbCapacity)}</td>
        <td className="treetable-stat">{Math.floor(stats.gbUsed / stats.gbCapacity * 100)}</td>
      </tr>
    );
  }

}

export default TreeTable;
