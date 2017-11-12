import React, { Component } from 'react';
import classNames from 'classnames';
import { stringifyPath, unStringifyPath } from './nodes';
import './MultiTimeSeries.css';

class MultiTimeSeries extends Component {

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
    const {
      selectedNodes: selectedNodesSet,
      selectedMetrics: selectedMetricsSet,
      hoveredNodes
    } = this.props;
    const selectedNodes = Array.from(selectedNodesSet).map(unStringifyPath);
    const selectedMetrics = Array.from(selectedMetricsSet);

    if (selectedNodes.length === 0) {
      return (
        <p style={{ padding: 150 }}>Select some nodes with the checkboxes.</p>
      )
    }

    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <div>
        <ul>
          {selectedMetrics.map((metric) => (
            <div key={metric}>
              <h3>{metric}</h3>
              Imagine a pretty time series here of this metric on nodes/regions:
              <ul>
                {selectedNodes.map((path) => {
                  const isHovered = hoveredNodes.has(stringifyPath(path));
                  return (
                    <li
                      key={path.join('/')}
                      className={classNames('time-series-line', {
                        hovered: isHovered
                      })}
                      onMouseOver={() => handleHover(path)}
                      onMouseOut={() => handleUnHover(path)}
                    >
                      {path.join('/')}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </ul>
      </div>
    );
  }

}

export default MultiTimeSeries;
