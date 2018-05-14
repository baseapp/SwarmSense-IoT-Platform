/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { PropTypes } from "prop-types";
import Highcharts from "highcharts";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
let style = {
  defaultSelectFieldStyle: {
    width: "70px",
    float: "right",
    position: "relative",
    right: "20px"
  },
  defaultAreaStyle: {
    display: "flex",
    flexDirection: "column"
  }
};

/**
 * Draws charts based on highchartsJS.
 * @extends React.Component
 */

class GraphArea extends React.Component {
  constructor(props) {
    super(props);
    Highcharts.setOptions({
      ...this.props.hc_global_options
    });
    this.state = { columns: 1 };
    this.receive_counter = 0;
  }
  componentWillReceiveProps(newProps) {
    if (newProps.data_version > this.props.data_version) {
      let container = window.document.getElementById(this.props.section_id);
      if (container && newProps.graphs.length >= 1) {
        if (newProps.redraw_charts) {
          this.undraw_charts();
          this.draw_charts(newProps);
        } else {
          this.receive_counter += 1;
          if (this.receive_counter === 1) {
            this.draw_charts(newProps);
          } else {
            this.update_charts(newProps);
          }
        }
      }
    }
  }

  /**
   * set_columns - Change the number of columns for graphs.
   *
   * @param  {Number} n = 1 number of columns in each row.
   */

  set_columns(n = 1) {
    this.undraw_charts();
    this.setState({ ...this.state, columns: n }, () => {
      this.draw_charts();
    });
  }

  /**
   * draw_charts - Creates the container for charts and renders charts in them.
   *
   * @param  {Object} newProps = null props object
   */

  draw_charts(newProps = null) {
    // console.log("draw chart have been called", this.receive_counter)
    let props = this.props;
    if (newProps) {
      props = newProps;
    }
    if (props.timeSeries) {
      props.graphs_options.xAxis = {
        crosshair: true,
        id: "x-axis",
        type: "datetime",
        title: {
          text: "time"
        },
        dateTimeLabelFormats: {
          millisecond: "%H:%M:%S.%L",
          second: "%H:%M:%S",
          minute: "%H:%M",
          hour: "%H:%M",
          day: "%e. %b",
          week: "%e. %b",
          month: "%b '%y",
          year: "%Y"
        },
        units: [
          [
            "millisecond", // unit name
            [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
          ],
          ["second", [1, 2, 5, 10, 15, 30]],
          ["minute", [1, 2, 5, 10, 15, 30]],
          ["hour", [1, 2, 3, 4, 6, 8, 12]],
          ["day", [1]],
          ["week", [1]],
          ["month", [1, 3, 6]],
          ["year", null]
        ]
      };
    }
    if (props.onSelection) {
      let chart_options = props.graphs_options.chart || {};
      chart_options = {
        ...chart_options,
        zoomType: "x",
        events: {
          ...chart_options.events,
          selection: e => {
            // selection event to be customized to request new data
            e.preventDefault();
            let { min, max } = e.xAxis[0]; // get minimum and maximum of the selection
            props.onSelection(min, max);
          }
        }
      };
      props.graphs_options.chart = chart_options;
    }
    let container = document.getElementById(this.props.section_id);
    props.graphs.map(graph => {
      let { graph_id: id, options } = graph;
      let chart = document.getElementById(id);
      if (!chart) {
        // console.log("Creating chart for id" + id)
        chart = document.createElement("div");
        chart.setAttribute("id", id);
        container.append(chart);
      }
      Highcharts.chart(chart, { ...options, ...props.graphs_options });
      return null;
    });
  }

  /**
   * undraw_charts - removes the container for the charts container.
   *
   */

  undraw_charts() {
    let charts = document.getElementById(this.props.section_id);
    charts.innerHTML = null;
  }

  /**
   * update_charts - updates the data in the charts
   *
   * @param  {type} newOptions object containing newer data.
   */

  update_charts(newOptions) {
    Highcharts.charts.map((chart, i) => {
      if (newOptions.graphs[i]) {
        chart.update(newOptions.graphs[i].options, true);
      } else {
        // console.log(chart, i) // shouldn't happen!!
        // console.log(i+" skip")
        // console.log(newOptions.graphs)
      }
      return null;
    });
  }

  /**
   * componentDidMount - Creates the container for all the charts. And
   * then make charts.
   *
   */

  componentDidMount() {
    if (!this.props.loading) {
      let container = window.document.getElementById(this.props.section_id);
      if (container && this.props.graphs.length >= 1) {
        this.draw_charts(); //draw empty charts
      }
    }
  }
  render() {
    let gridTemplateColumns;

    switch (this.state.columns) {
      case 2:
        gridTemplateColumns = "50% 50%";
        break;
      case 3:
        gridTemplateColumns = "33% 34% 33%";
        break;
      case 4:
        gridTemplateColumns = "25% 25% 25% 25%";
        break;
      case 1:
      default:
        gridTemplateColumns = "100%";
    }
    return (
      <div style={{ ...this.props.area_style, ...style.defaultAreaStyle }}>
        {this.props.show_formatting && (
          <div>
            <SelectField
              style={{
                ...this.props.selectFieldStyle,
                ...style.defaultSelectFieldStyle
              }}
              value={this.state.columns}
              onChange={(e, k, p) => this.set_columns(p)}
              floatingLabelText="Columns"
            >
              <MenuItem value={1} primaryText="1" />
              <MenuItem value={2} primaryText="2" />
              <MenuItem value={3} primaryText="3" />
              <MenuItem value={4} primaryText="4" />
            </SelectField>
          </div>
        )}
        <div>
          <div
            id={this.props.section_id}
            style={{
              ...this.props.area_style,
              display: "grid",
              gridTemplateRows: "auto",
              gridTemplateColumns,
              gridAutoFlow: "columns"
            }}
          />
        </div>
      </div>
    );
  }
}

GraphArea.propTypes = {
  section_id: PropTypes.string, // container id of all the graphs
  graphs: PropTypes.arrayOf(
    PropTypes.shape({
      graph_id: PropTypes.string, // id for the element where this graph would be drawn
      options: PropTypes.object // specific options for this graph-id
    })
  ), // object with all the information for the graphs to be drawn
  hc_global_options: PropTypes.object, // global options for highcharts
  graphs_options: PropTypes.object, // options same for all the charts,
  onSelection: PropTypes.func, // signature : (xMin, xMax) => {...} -> Eventually must update the data
  timeSeries: PropTypes.bool, // tells if the x-axis is time-series
  area_style: PropTypes.object, // adds inline style of the graph-container
  selectFieldStyle: PropTypes.object, // adds style to the SeletField MUI component
  show_formatting: PropTypes.bool, // for showing the column selector
  data_version: PropTypes.number, // for incremental updates
  redraw_charts: PropTypes.bool // for undrawing and drawing the charts
};

GraphArea.defaultProps = {
  hc_global_options: {
    global: {
      useUTC: false
    }
  },
  section_id: "graph-container-dodo",
  graphs: [
    {
      graph_id: "graph-first",
      options: { data: [] }
    }
  ],
  show_formatting: true,
  data_version: 0
};
export default GraphArea;
