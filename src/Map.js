import React, { Component } from 'react';
import classNames from 'classnames';
import { stringifyPath, unStringifyPath, pathHasPrefix } from './nodes';
import worldBoundaries from './assets/world';
import * as Cities from './assets/cities100000';
import * as d3 from 'd3';
import './Map.css';

const graticule = d3.geoGraticule();
const outline = graticule.outline();

const WIDTH = 800;
const HEIGHT = 400;

class WorldBoundaries extends Component {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const geoPath = d3.geoPath(this.props.proj);
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

  constructor() {
    super();
    this.state = {
      proj: d3.geoNaturalEarth1()
        .scale(100)
        .translate([WIDTH/2, HEIGHT/2])
    };
  }

  coordsForCity(cityName) {
    const city = Cities.byName[cityName];
    const res = this.state.proj([city.longitude, city.latitude]);
    console.log(city, res);
    return res;
  }

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
    const { nodes, hoveredNodes } = this.props;

    const handleClick = this.handleClick.bind(this);
    const handleHover = this.handleHover.bind(this);
    const handleUnHover = this.handleUnHover.bind(this);

    return (
      <div>
        <svg width={WIDTH} height={HEIGHT}>
          <WorldBoundaries proj={this.state.proj} />

          <g className="nodes">
            {nodes.map((node) => {
              const [x, y] = this.coordsForCity(node.cityName);
              const name = node.path[node.path.length - 1];
              const isSelected = this.props.selectedNodes.has(stringifyPath(node.path));
              const isHovered = Array.from(hoveredNodes).some((hoveredPath) => (
                pathHasPrefix(unStringifyPath(hoveredPath), node.path)
              ))
              return (
                <g
                  key={stringifyPath(node.path)}
                  style={{ cursor: 'pointer' }}
                  className={classNames('map-node', { selected: isSelected, hovered: isHovered })}
                  onClick={() => handleClick(node.path)}
                  onMouseOver={() => { handleHover(node.path) }}
                  onMouseOut={() => handleUnHover(node.path)}
                >
                  <circle r="15" cx={x} cy={y} />
                  <text x={x} y={y} textAnchor="middle" alignmentBaseline="middle">{name}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }

}

export default Map;
