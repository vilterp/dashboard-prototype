import React, { Component } from 'react';
import classNames from 'classnames';
import { stringifyPath, pathHasPrefix } from './types';
import worldBoundaries from './assets/world';
import * as Cities from './assets/cities100000';
import * as d3 from 'd3';

import './Map.css';

const proj = d3.geoNaturalEarth1().scale(80);
const geoPath = d3.geoPath(proj);
const graticule = d3.geoGraticule();
const outline = graticule.outline();

function coordsForCity(cityName) {
  const city = Cities.byName[cityName];
  const res = proj([city.latitude, city.longitude]);
  return res;
}

const WIDTH = 1000;
const HEIGHT = 500;

class WorldBoundaries extends Component {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <g>
        <g className="world-boundaries">
          {worldBoundaries.features.map((feature, idx) => {
            const pathString = geoPath(feature.geometry);
            return (<path
              key={`${feature.id}-${idx}`}
              d={pathString}
              fill="grey"
            />);
          })}
        </g>
        <path d={geoPath(outline)} stroke="black" fill="none" />
      </g>
    );
  }

}

class Map extends Component {

  handleClick(path) {
    if (this.props.onClick) {
      this.props.onClick(path);
    }
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

  render() {
    const { nodes, hoveredNode } = this.props;

    const handleClick = this.handleClick.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <svg width={WIDTH} height={HEIGHT}>
        <WorldBoundaries />

        <g className="nodes">
          {nodes.map((node) => {
            const [x, y] = coordsForCity(node.cityName);
            const name = node.path[node.path.length - 1];
            const isSelected = this.props.selectedNodes.has(stringifyPath(node.path));
            const isHovered = (
              hoveredNode !== null && pathHasPrefix(hoveredNode, node.path)
            );
            return (
              <g
                key={stringifyPath(node.path)}
                style={{ cursor: 'pointer' }}
                className={classNames('map-node', { selected: isSelected, hovered: isHovered })}
                onClick={() => handleClick(node.path)}
                onMouseOver={() => { handleHover(node.path) }}
                onMouseOut={() => handleUnHover(node.path)}
              >
                <circle r="10" cx={x} cy={y} />
                <text x={x} y={y + 30} textAnchor="middle">{name}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

}

export default Map;
