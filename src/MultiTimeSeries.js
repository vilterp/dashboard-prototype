import React, { Component } from 'react';
import classNames from 'classnames';
import { stringifyPath } from './types';
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
    const { selectedNodes, hoveredNode } = this.props;

    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <div>
        <p>Imagine some pretty time series here</p>
        <p>Of nodes:</p>
        <ul>
          {Array.from(selectedNodes).map((path) => {
            const isHovered = hoveredNode && stringifyPath(hoveredNode) === stringifyPath(path);
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
  }

}

export default MultiTimeSeries;
