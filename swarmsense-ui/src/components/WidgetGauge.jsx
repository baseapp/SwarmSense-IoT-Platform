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
import highchartsMore from "highcharts/highcharts-more";
import noData from "highcharts/modules/no-data-to-display";
import SolidGauge from "highcharts/modules/solid-gauge";
import { get_logger } from "../utils";
highchartsMore(ReactHighcharts.Highcharts);
noData(ReactHighcharts.Highcharts);
SolidGauge(ReactHighcharts.Highcharts);
class WidgetGraph extends React.Component {
  constructor(props) {
    super(props);
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    this.logger = get_logger("WidgetSolidGauge");
  }
  updateChart(newProps) {
    let { point, widgetId: ref } = newProps,
      chart = this.refs[ref].getChart();
    chart.series[0].setData([point]); // set the point
  }
  componentWillReceiveProps(newProps) {
    if (!isEqual(newProps.point, this.props.point)) {
      // update the charts data
      this.updateChart(newProps);
    }
  }
  render() {
    let {
        title = null,
        point,
        minValue,
        maxValue,
        unit,
        style = {},
        widgetId: ref,
        neverReflow = true
      } = this.props,
      config = {
        title: null,
        chart: {
          type: "solidgauge"
        },
        pane: {
          backgroundColor:
            (Highcharts.theme && Highcharts.theme.background2) || "#EEE",
          center: ["50%", "85%"],
          size: "100%",
          startAngle: -90,
          endAngle: 90,
          background: {
            innerRadius: "60%",
            outerRadius: "100%",
            shape: "arc"
          }
        },
        yAxis: {
          // stops: [
          //   [0.1, "#55BF3B"], // green
          //   [0.5, "#DDDF0D"], // yellow
          //   [0.9, "#DF5353"] // red
          // ],
          lineWidth: 0,
          min: minValue,
          max: maxValue,
          title: {
            text: title,
            y: -70
          },
          labels: {
            y: 16
          }
        },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        },
        series: [
          {
            name: title,
            data: [point],
            dataLabels: {
              format:
                '<div style="text-align:center"><span style="font-size:1.1rem;color:' +
                ((Highcharts.theme && Highcharts.theme.contrastTextColor) ||
                  "black") +
                '">{y}</span><br/>' +
                `<span style="font-size:12px;color:silver">${unit ||
                  ""}</span></div>`
            },
            tooltip: {
              valueSuffix: " " + (unit || "")
            }
          }
        ]
      };
    // this.logger("@render:props", this.props, config);
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
  point: PropTypes.number, // stop at point
  neverReflow: PropTypes.bool,
  widgetId: PropTypes.string.isRequired,
  time: PropTypes.string,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  unit: PropTypes.string
};
export default WidgetGraph;
