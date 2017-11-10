import React, { Component } from 'react';
import { TYPE_CLUSTER, TYPE_LOCALITY, TYPE_NODE } from './types';
import classNames from 'classnames';

function stringifyPath(path) {
  return path.map((elem) => `"${elem.replace(/"/, '"')}"`).join(',');
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
    function recur(node, depth, pathSoFar) {
      const pathToThis = [];
      pathSoFar.forEach((pathElem) => { pathToThis.push(pathElem); }); // TODO: copy func somewhere?
      if (node.type !== TYPE_CLUSTER) {
        pathToThis.push(node.name);
      }
      const nodeCollapsed = collapsedNodes.has(stringifyPath(pathToThis));
      if (node.type !== TYPE_CLUSTER) {
        output.push({
          depth: depth,
          node: node,
          path: pathToThis,
          hovered: hoveredNodes.has(stringifyPath(pathToThis)),
          collapsed: nodeCollapsed
        });
      }
      if (node.type !== TYPE_NODE && !nodeCollapsed) {
        node.children.forEach((childNode) => {
          recur(childNode, depth + 1, pathToThis);
        });
      }
    }
    recur(nodeTree, -1, []);
    return output;
  }

  render() {
    const { nodes } = this.props;

    const flattenedNodes = this.flatten(nodes);

    const handleToggle = this.handleToggle.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Disk Used</th>
            <th>Disk Capacity</th>
            <th>Disk Usage %</th>
            <th>QPS</th>
            <th># Ranges</th>
            <th>Bytes In</th>
            <th>Bytes Out</th>
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
        <td>Disk Used</td>
        <td>Disk Capacity</td>
        <td>Disk Usage %</td>
        <td>QPS</td>
        <td># Ranges</td>
        <td>Bytes In</td>
        <td>Bytes Out</td>
      </tr>
    );
  }

}

export default TreeTable;
