import React, { Component } from 'react';
import { TYPE_LOCALITY, TYPE_NODE } from './types';
import classNames from 'classnames';

function stringifyPath(path) {
  return path.map((elem) => `"${elem.replace(/"/, '"')}"`).join(',');
}

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
      hoveredNodes: new Set()
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
    this.state.hoveredNodes.add(stringifyPath(path));
    this.setState({
      hoveredNodes: hovered
    });
    if (this.props.onHover) {
      this.props.onHover();
    }
  }

  handleUnHover(path) {
    const hovered = this.state.hoveredNodes;
    this.state.hoveredNodes.delete(stringifyPath(path));
    this.setState({
      hoveredNodes: hovered
    });
    if (this.props.onUnHover) {
      this.props.onUnHover(path);
    }
  }

  flatten(nodeTree) {
    const output = [];
    const collapsedNodes = this.state.collapsedNodes;
    const hoveredNodes = this.state.hoveredNodes;

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

    function recur(node, depth, pathSoFar) {
      const pathToThis = [];
      pathSoFar.forEach((pathElem) => { pathToThis.push(pathElem); }); // TODO: copy func somewhere?
      pathToThis.push(node.name);
      const strPathToThis = stringifyPath(pathToThis);
      const nodeCollapsed = collapsedNodes.has(strPathToThis);
      output.push({
        depth: depth,
        node: node,
        path: pathToThis,
        hovered: hoveredNodes.has(strPathToThis),
        collapsed: nodeCollapsed,
        stats: getStats(node, strPathToThis)
      });
      if (node.type !== TYPE_NODE && !nodeCollapsed) {
        node.children.forEach((childNode) => {
          recur(childNode, depth + 1, pathToThis);
        });
      }
    }
    recur(nodeTree, 0, []);
    return output;
  }

  render() {
    const { nodes } = this.props;

    const flattenedNodes = this.flatten(nodes);

    const handleToggle = this.handleToggle.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

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
              onToggle={handleToggle}
              onHover={handleHover}
              onUnHover={handleUnHover}
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
    const { flattenedNode, onToggle, onHover, onUnHover } = this.props;
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

    return (
      <tr
        className={trClassnames}
        onMouseOver={() => onHover(path)}
        onMouseOut={() => onUnHover(path)}
      >
        <td
          style={{ paddingLeft: depth * INDENT_PX }}
          className={'treetable-node-name'}
          onClick={() => { onToggle(path) }}
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
