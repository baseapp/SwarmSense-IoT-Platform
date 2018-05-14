/** 
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { List, Responsive } from "admin-on-rest";
import MenuItem from "material-ui/MenuItem";
import BigCalendar from "react-big-calendar";
import { set_params } from "../utils";
import { SimpleList, ActionPanel } from "./index";
import moment from "moment";
import PropTypes from "prop-types";
import { RRule } from "rrule";
import nlp from "rrule/lib/nlp.js"; // required for the proper operation or rrule
import "react-big-calendar/lib/css/react-big-calendar.css";

BigCalendar.momentLocalizer(moment);

/**
 * A calendar based on BigCalendar to show Events. It is a {@link https://marmelab.com/admin-on-rest/List.html#using-a-custom-iterator | custom iterator}.
 */

class EventsCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: "true",
      view: "month",
      date: new Date()
    };
  }

  /**
   * make_events - Makes the event based on the data provided.
   *
   * @return {Array} Array with events list
   */

  make_events() {
    let { ids, data } = this.props,
      current_timestamp = this.state.date.getTime(),
      view = this.state.view,
      events = [];
    ids.map((id, key) => {
      let { name, id: event_id, start_date, repeat, unit, is_active } = data[
          id
        ],
        record = data[id],
        start = new Date(start_date),
        end = new Date(start.getTime() + 15 * 60 * 1000);
      if (repeat) {
        let options = {},
          view_start = new Date(current_timestamp),
          view_stop = new Date(current_timestamp),
          last_month = view_start.getMonth() - 1,
          next_month = view_start.getMonth() + 1,
          last_year = view_start.getYear() - 1,
          next_year = view_start.getYear() + 1;
        if (last_month < 0) {
          last_month = 11;
          view_start.setYear(last_year);
        }
        if (next_month > 12) {
          next_month = 0;
          view_stop.setYear(next_year);
        }
        view_start.setMonth(last_month);
        view_stop.setMonth(next_month);
        if (unit === "day") {
          options = RRule.parseText("Every day");
        } else if (unit === "month") {
          options = RRule.parseText(`Every month`);
        } else if (unit === "week") {
          options = RRule.parseText(`Every week`);
        } else if (unit === "year") {
          options = RRule.parseText(`Every year`);
        }
        options.dtstart = start;
        let rule = new RRule(options);
        rule.between(view_start, view_stop).map((strtime, key) => {
          start = new Date(strtime);
          end = new Date(start.getTime() + 1 * 60 * 1000);
          let _event = {
            id,
            start,
            end,
            allDay: false,
            title: name,
            desc: `Active: ${is_active ? "Y" : "N"}`,
            record
          };
          events.push(_event);
        });
      } else {
        let _event = {
          id,
          start,
          end,
          allDay: false,
          title: name,
          desc: `Active: ${is_active ? "Y" : "N"}`,
          record
        };
        events.push(_event);
      }
      return null;
    });
    return events;
  }
  render() {
    let eventsList = this.make_events();
    return (
      <div style={{ height: "80vh", margin: "10px" }}>
        <BigCalendar
          date={this.state.date}
          events={eventsList}
          onSelectEvent={({ record }) => {
            console.log(record, "onSelectEvent");
            this.props.editEvent(record);
          }}
          onNavigate={date => this.setState({ ...this.state, date })}
          onView={view => this.setState({ ...this.state, view })}
          views={["month", "week", "day"]}
        />
      </div>
    );
  }
}

/**
 * Component to list all the events.
 * @extends React.Component
 */

class ListEvents extends React.Component {
  render() {
    let props = this.props;
    let title = "Events",
      customButtons = [
        { label: "Alerts", href: "#/company_alerts" },
        { label: "History", href: "#/events_history" }
      ];
    return (
      <List
        {...props}
        title={title}
        actions={<ActionPanel customButtons={customButtons} />}
        pagination={null}
      >
        {permissions => {
          const editItems = permissions === "read" ? false : true;
          return (
            <Responsive
              small={
                <SimpleList
                  onEditItem={record => set_params("event", record)}
                  editItems={editItems}
                  primaryText={({ name }) => {
                    return `${name}`;
                  }}
                />
              }
              medium={
                <EventsCalendar
                  editEvent={record => {
                    if (editItems) {
                      record => set_params("event", record);
                      this.context.router.history.push(`events/${record.id}`);
                    }
                  }}
                />
              }
            />
          );
        }}
      </List>
    );
  }
}
ListEvents.contextTypes = {
  router: PropTypes.object
};
export default ListEvents;
