import React, { Component } from 'react';
import {
  TYPE_LOCALITY,
  TYPE_NODE,
  stringifyPath,
  EMPTY_PATH,
  addStats,
  EMPTY_STATS
} from './nodes';
import classNames from 'classnames';
import './TreeTable.css';

const METRICS = [
  { name: "CPU", extract: (stats, node) => node.type === TYPE_NODE ? `${Math.round(stats.CPU)}%` : '' },
  { name: "QPS", extract: (stats) => Math.round(stats.QPS) },
  { name: "GB Used", extract: (stats) => Math.round(stats.gbUsed) },
  { name: "GB Capacity", extract: (stats) => Math.round(stats.gbCapacity) },
  { name: "% GB Used", extract: (stats) => Math.floor(stats.gbUsed / stats.gbCapacity * 100) },
  { name: "# Ranges", extract: (stats) => stats.ranges },
];

class TreeTable extends Component {

  constructor() {
    super();
    this.state = {
      collapsedNodes: new Set()
    };
  }

  handleToggleNode(path) {
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
    if (this.props.onHover) {
      this.props.onHover(path);
    }
  }

  handleUnHover(path) {
    if (this.props.onUnHover) {
      this.props.onUnHover(path);
    }
  }

  handleSelect(path) {
    if (this.props.onSelect) {
      this.props.onSelect(path);
    }
  }

  handleUnSelect(path) {
    if (this.props.onUnSelect) {
      this.props.onUnSelect(path);
    }
  }

  handleClickHeader(metricName) {
    this.props.onSelectTS();
    this.handleToggleMetric(metricName);
  }

  handleToggleMetric(metricName) {
    const metricSelected = this.props.selectedMetrics.has(metricName);
    if (metricSelected) {
      if (this.props.onAddMetric) {
        this.props.onRemoveMetric(metricName);
      }
    } else {
      if (this.props.onAddMetric) {
        this.props.onAddMetric(metricName);
      }
    }
  }

  handleClickNumber(nodePath, metricName) {
    this.props.onSelectTS();
    this.props.onAddMetric(metricName);
    this.props.onSelect(nodePath);
  }

  flatten(nodeTree) {
    const output = [];
    const collapsedNodes = this.state.collapsedNodes;
    const hoveredNodes = this.props.hoveredNodes;
    const selectedNodes = this.props.selectedNodes;

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
      const nodeIsHovered = Array.from(hoveredNodes).some((hoveredPath) => (
        hoveredPath === strPathToThis
      ))
      output.push({
        depth: depth,
        node: node,
        path: pathToThis,
        hovered: nodeIsHovered,
        collapsed: nodeCollapsed,
        selected: nodeSelected,
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
    const { nodes, showCheckboxes, selectedMetrics } = this.props;

    const flattenedNodes = this.flatten(nodes);

    const handleToggleNode = this.handleToggleNode.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);
    const handleSelect = this.handleSelect.bind(this);
    const handleUnSelect = this.handleUnSelect.bind(this);
    const handleClickHeader = this.handleClickHeader.bind(this);
    const handleClickNumber = this.handleClickNumber.bind(this);

    return (
      <table className="table-compact treetable">
        <thead>
          <tr>
            <th></th>
            <th style={{ width: 300 }}>Name</th>
            {METRICS.map((metric) => (
              <th
                className="metric-name"
                key={metric.name}
                onClick={() => handleClickHeader(metric.name)}>
                {showCheckboxes
                  ? <span>
                      <input
                        type="checkbox"
                        checked={selectedMetrics.has(metric.name)}
                      />
                      {' '}
                    </span>
                  : null}
                {metric.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flattenedNodes.map((flattenedNode) => (
            <Node
              key={flattenedNode.path.join('-')}
              flattenedNode={flattenedNode}
              onToggleCollapsed={handleToggleNode}
              onHover={handleHover}
              onUnHover={handleUnHover}
              onSelect={handleSelect}
              onUnSelect={handleUnSelect}
              onClickMetric={(metric) => handleClickNumber(flattenedNode.path, metric)}
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
      onUnSelect,
      onClickMetric
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
            onChange={toggleSelected}
          />
        </td>
        <td
          style={{ paddingLeft: depth * INDENT_PX }}
          className={'treetable-node-name'}
          onClick={onNameClick}
        >
          {arrow}{node.name}
        </td>
        {METRICS.map((metric) => (
          <td
            key={metric.name}
            className="treetable-stat"
            onClick={() => onClickMetric(metric.name)}
          >
            {metric.extract(stats, node)}
          </td>
        ))}
      </tr>
    );
  }

}

export default TreeTable;
