/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import Highcharts from "highcharts";
import ReactHighcharts from "react-highcharts";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import FlatButton from "material-ui/FlatButton";
import highchartsMore from "highcharts/highcharts-more";
import noData from "highcharts/modules/no-data-to-display";
import { get_logger } from "../utils";
highchartsMore(ReactHighcharts.Highcharts);
noData(ReactHighcharts.Highcharts);
class WidgetGraph extends React.Component {
  constructor(props) {
    super(props);
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    this.logger = get_logger("WidgetGraph");
    this.state = { day_view: "live", error: undefined };
  }
  updateChart(newProps) {
    let { data, widgetId: ref } = newProps,
      chart = this.refs[ref].getChart();
    data = data.sort((a, b) => {
      return a.x - b.x;
    });
    // this.logger("@updateChart, day_view, data", this.state.day_view, data);
    chart.series[0].setData(data); // set the data
  }
  componentWillReceiveProps(newProps) {
    if (
      !isEqual(newProps.data, this.props.data) &&
      this.state.day_view === "live"
    ) {
      // update the charts data
      this.updateChart(newProps);
    }
  }
  getHistory(day_view = null) {
    // this.logger("@getHistory: day_view", day_view);
    let { getHistoryOf } = this.props;
    return getHistoryOf(day_view);
  }
  clickHandler(view = "live") {
    // number of days
    // this.logger("@clickHandler: view", view);
    let current_day_view = this.state.day_view,
      { widgetId: ref } = this.props,
      chart = this.refs[ref].getChart();
    this.setState({ ...this.state, day_view: view }, async () => {
      try {
        chart.showLoading();
        let history = [];
        if (view !== "live") {
          history = await this.getHistory(view);
        } else {
          history = await this.getHistory();
        }
        chart.hideLoading();
        this.updateChart({ ...this.props, data: history });
      } catch (e) {
        chart.hideLoading();
        this.logger("error@while_getting_history", e.message || e);
        this.setState({
          ...this.state,
          day_view: current_day_view,
          error: e.message
        });
      }
    });
  }
  render() {
    let {
      title = null,
      yAxisTitleText,
      data,
      series_name,
      style = {},
      widgetId: ref,
      neverReflow = true
    } = this.props;
    data = data.sort((a, b) => {
      return a.x - b.x;
    });
    let config = {
      title,
      chart: {
        type: "spline",
        animation: Highcharts.svg,
        zoomType: "x",
        panning: true
      },
      yAxis: {
        title: {
          text: yAxisTitleText
        }
      },
      xAxis: {
        type: "datetime",
        tickPixelInterval: 60
      },
      plotOptions: {
        spline: {
          turboThreshold: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [
        {
          name: `${series_name} data`,
          data
        }
      ],
      tooltip: {
        formatter: function() {
          return (
            "<b>" +
            this.series.name +
            "</b><br/>" +
            Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) +
            "<br/>" +
            Highcharts.numberFormat(this.y, 2)
          );
        }
      }
    };
    // CSS issue with height in chrome : resolved. - https://github.com/highcharts/highcharts/issues/4649
    return (
      <div
        style={{
          height: 0,
          width: "100%",
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {neverReflow && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              // flexWrap: "wrap",
              justifyContent: "flex-start"
            }}
          >
            <FlatButton
              secondary
              label="live"
              onClick={() => this.clickHandler()}
              disabled={this.state.day_view === "live"}
              style={{
                padding: 0,
                minWidth: "50px"
              }}
            />
            <FlatButton
              secondary
              label="7d"
              onClick={() => this.clickHandler(7)}
              disabled={this.state.day_view === 7}
              style={{
                padding: 0,
                minWidth: "50px"
              }}
            />
            <FlatButton
              secondary
              label="1m"
              onClick={() => this.clickHandler(30)}
              disabled={this.state.day_view === 30}
              style={{
                padding: 0,
                minWidth: "50px"
              }}
            />
            <FlatButton
              secondary
              label="6m"
              onClick={() => this.clickHandler(180)}
              disabled={this.state.day_view === 180}
              style={{
                padding: 0,
                minWidth: "50px"
              }}
            />
          </div>
        )}
        <ReactHighcharts
          ref={ref}
          config={config}
          neverReflow={neverReflow}
          domProps={{
            style: { ...style, flex: "1", display: "flex" }
          }}
        />
      </div>
    );
  }
}

WidgetGraph.propTypes = {
  title: PropTypes.string, // title of the graph
  yAxisTitleText: PropTypes.string, // y-axis of the graph
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number, // Value on the x axis for this point
      y: PropTypes.number // Value on the y axis for this point
    })
  ),
  neverReflow: PropTypes.bool,
  series_name: PropTypes.string, // name of the series
  style: PropTypes.object, // style of the parent element.
  widgetId: PropTypes.string.isRequired,
  getHistory: PropTypes.func // for fetching history of sensor of signature - (days)=>Promise.resolve(history)
};
export default WidgetGraph;
