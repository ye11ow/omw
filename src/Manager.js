import React from "react";
import { buildLocationURI, getSession } from "./Utils";

const UPDATE_INTERVAL = 60;

class Manager extends React.Component {
  state = {
    history: [],
  };

  componentDidMount() {
    this.updateLocation();
    setInterval(this.updateLocation.bind(this), UPDATE_INTERVAL * 1000);
  }

  updateLocation() {
    const that = this;
    navigator.geolocation.getCurrentPosition((position) => {
      const session = getSession();
      const timestamp = Math.round(Date.now() / 1000);

      fetch(buildLocationURI(session), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: timestamp,
          next_refresh: timestamp + UPDATE_INTERVAL,
          vehicle: {
            heading: 0,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }),
      }).finally(() => {
        that.setState((state) => ({
          history: [...state.history, {
            timestamp: timestamp,
            heading: 0,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }]
        }));
      });
    }, null);
  }

  render() {
    return <div className="container">
      <h1>Manager page</h1>
      <dl className="row">
        <dt className="col-sm-3">Session name</dt>
        <dd className="col-sm-9">{getSession()}</dd>
      </dl>
      <h2>Location history</h2>
        <ul>
            {this.state.history.map((h) => {
                return (
                    <li key={h.timestamp}>
                      <span className="text-info ">{new Date(h.timestamp * 1000).toISOString()}</span> ({h.latitude}, {h.longitude})</li>
                )
            })}
        </ul>
    </div>;
  }
}

export default Manager;
