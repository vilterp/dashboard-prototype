import React, { Component } from 'react';
import { stringifyPath, unStringifyPath } from './nodes';
import classNames from 'classnames';
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
    const { selectedNodes: selectedSet, hoveredNodes } = this.props;
    const selectedNodes = Array.from(selectedSet).map(unStringifyPath);

    if (selectedNodes.length === 0) {
      return (
        <p style={{ padding: 150 }}>Select some nodes with the checkboxes.</p>
      )
    }

    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <div>
        <table className="table matrix">
          <thead>
            <tr>
              <th></th>
              {selectedNodes.map((colNodePath) => (
                <th
                  key={stringifyPath(colNodePath)}
                  className={classNames({ hovered: hoveredNodes.has(stringifyPath(colNodePath)) })}
                  onMouseOver={() => handleHover(colNodePath)}
                  onMouseOut={() => handleUnHover(colNodePath)}
                >
                  {nodeName(colNodePath)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedNodes.map((rowNodePath) => (
              <tr key={stringifyPath(rowNodePath)}>
                <th
                  className={classNames({ hovered: hoveredNodes.has(stringifyPath(rowNodePath)) })}
                  onMouseOver={() => handleHover(rowNodePath)}
                  onMouseOut={() => handleUnHover(rowNodePath)}
                >
                  {nodeName(rowNodePath)}
                </th>
                {selectedNodes.map((colNodePath) => (
                  <td
                    key={stringifyPath(colNodePath)}
                    onMouseOver={() => { handleHover(rowNodePath); handleHover(colNodePath); }}
                    onMouseOut={() => { handleUnHover(rowNodePath); handleUnHover(colNodePath); }}
                  >
                    {stringifyPath(rowNodePath) === stringifyPath(colNodePath)
                      ? '-'
                      : Math.round(Math.random() * 100)}
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
  return path.join('/');
}

export default Matrix;
