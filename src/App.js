import Map from "./Map";
import Control from "./Control";
import "./App.css";
import React from "react";
import { buildLocationURI, getSession } from "./Utils"
import { isEmpty } from "lodash/core";

class App extends React.Component {
  state = {
    target: null,
    route: null,
    location: null,
    notification: 5,
    error: null
  };

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    let addr = urlParams.get("address");
    this._address = "";
    if (addr && addr.length > 0) {
      this._address = addr;
      this.handleSubmitAddress(addr);
    }

    this._session = getSession();

    const noti = urlParams.get("notification");
    if (noti && parseInt(noti, 10) > 0) {
      this.state.notification = parseInt(noti, 10);
    }

    setInterval(this.updateVehicle.bind(this), 5000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.address !== this.state.address ||
      prevState.location !== this.state.location
    ) {
      this.refreshRoute();
    }
    return true;
  }

  handleSubmitAddress(addr) {
    console.log("querying address: " + addr);

    fetch(this._buildAddrURI(addr))
      .then((response) => {
        if (!response.ok) {
          throw response;
        }

        return response.json()
      })
      .then((data) => {
        if (data.features.length > 0) {
          const target = data.features[0];
          console.log("found target", target.place_name, target.center);

          this.setState({
            target: target,
            error: null
          });
        } else {
          alert(`Address ${addr} not found`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        this.setState({
          error: "Server offline. Please Wechat ye11ow."
        });
      });
  }

  updateVehicle() {
    if (this._updatingVehicle) {
      return;
    }

    if (this.state.location && this.state.location.next_refresh > Date.now() / 1000) {
      return;
    }

    this._updatingVehicle = fetch(buildLocationURI(this._session))
      .then((response) => {
        if (!response.ok) {
          throw response;
        }

        return response.json()
      })
      .then((data) => {
        if (isEmpty(data)) {
          this.setState({
            location: null,
            error: "Empty session. (is there anyone sending data?)"
          });

          return;
        }

        this.setState({
          location: data,
          error: null
        });
        console.log(
          "scheduled next run to be",
          Math.round(data.next_refresh - Date.now() / 1000),
          "s later",
          data
        );
      })
      .catch((error) => {
        console.error("Error:", error);

        this.setState({
          error: "Server offline. Please Wechat ye11ow."
        });
      })
      .finally(() => (this._updatingVehicle = null));
  }

  refreshRoute() {
    if (this._refreshingRoute) {
      return;
    }

    if (!this.state.location || !this.state.target) {
      return;
    }

    this._refreshingRoute = fetch(
      this._buildDirectionURI(this.state.location, this.state.target)
    )
      .then((response) => {
        if (!response.ok) {
          throw response;
        }

        return response.json()
      })
      .then((data) => {
        let route = null;
        if (data.routes.length > 0) {
          route = data.routes[0];
          console.log("found route", route);
          if (route && this.state.notification && "Notification" in window) {
            if (route.duration <= this.state.notification * 60) {
              new Notification(
                `Hey! ye11ow is ${Math.round(
                  route.duration / 60
                )} minutes away!`
              );
            }
          }
        } else {
          console.log("no route found");
        }

        this.setState({
          route: route,
          error: null
        });
      })
      .catch((error) => {
        console.error("Error:", error);

        this.setState({
          error: "Server offline. Please Wechat ye11ow."
        });
      })
      .finally(() => (this._refreshingRoute = null));
  }

  render() {
    return (
      <div>
        <Control
          target={this.state.target}
          route={this.state.route}
          notify={this.state.notify}
          location={this.state.location}
          notification={this.state.notification}
          error={this.state.error}
        />
        <Map
          location={this.state.location}
          target={this.state.target}
          route={this.state.route}
        />
      </div>
    );
  }

  _buildDirectionURI(location, target) {
    const coordinates = `${location.vehicle.longitude},${location.vehicle.latitude};${target.center[0]},${target.center[1]}`;
    return `route?coordinates=${encodeURI(coordinates)}`;
  }

  _buildAddrURI(addr) {
    return `address?address=${encodeURI(addr)}`;
  }
}

export default App;
