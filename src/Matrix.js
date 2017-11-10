import React, { Component } from 'react';
import { stringifyPath } from './types';
import './Matrix.css';

class Matrix extends Component {

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

  render() {
    const { selectedNodes: selectedSet, hoveredNode } = this.props;
    const selectedNodes = Array.from(selectedSet);

    return (
      <div>
        <table className="table matrix">
          <thead>
            <tr>
              <th></th>
              {selectedNodes.map((colNodePath) => (
                <th key={stringifyPath(colNodePath)}>
                  {nodeName(colNodePath)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedNodes.map((rowNodePath) => (
              <tr key={stringifyPath(rowNodePath)}>
                <th>{nodeName(rowNodePath)}</th>
                {selectedNodes.map((colNodePath) => (
                  <td key={stringifyPath(colNodePath)}>
                    {Math.round(Math.random() * 100)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* TODO: metric selector: throughput, latency, # replicated ranges */}
      </div>
    );
  }

}

function nodeName(path) {
  return path[path.length-1];
}

export default Matrix;
