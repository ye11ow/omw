import Map from './Map';
import Control from './Control';
import './App.css';
import React from 'react';

class App extends React.Component {

  state = {
    target: null,
    route: null,
    me: null,
    time: 5,
    notify: false,
    lastUpdate: null,
    nextUpdate: null,
    ongoingRequest: false
  }

  componentDidMount() {
    setInterval(this.updateVehicle.bind(this), 1000)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.address !== this.state.address || prevState.me !== this.state.me)  {
      this.refreshRoute();
    }
    return true;
  }

  handleSubmitAddress(addr) {
    console.log("querying address: " + addr);

    fetch(this._buildAddrURI(addr))
      .then(response => response.json())
      .then(data => {
        if (data.features.length > 0) {
          const target = data.features[0];
          console.log("found target", target.place_name, target.center);

          this.setState({
            target: target
          });
        } else {
          alert(`Address ${addr} not found`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  handleAddrChange(event) {
    this.setState({ address: event.target.value });
  }

  handleSubmitNotification(event) {
    this.setState({
      notify: true
    });

    if (event) {
      event.preventDefault();
    }
  }

  updateVehicle() {
    if (this.state.ongoingRequest) {
      return;
    }

    if (this.state.nextUpdate && this.state.nextUpdate > Date.now() / 1000) {
       return;
    }

    this.setState({
      ongoingRequest: true
    })

    fetch('/tesla')
      .then(response => response.json())
      .then(data => {
        this.setState({
          me: {
            lng: data.vehicle.longitude,
            lat: data.vehicle.latitude
          },
          nextUpdate: data.next_refresh,
          ongoingRequest: false
        })
        console.log('scheduled next run to be', Math.round(data.next_refresh - Date.now() / 1000), 's later', data);
      }).catch((error) => {
        console.error('Error:', error);
      });
  }

  refreshRoute() {
    if (!this.state.me || !this.state.target) {
      return;
    }
    fetch(this._buildDirectionURI(this.state.me, this.state.target))
      .then(response => response.json())
      .then(data => {
        let route = null;
        if (data.routes.length > 0) {
          route = data.routes[0];
          console.log("found route", route);
        } else {
          console.log("no route found");
        }

        this.setState({
          route: route,
          lastUpdate: Date.now(),
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  render() {
    return (
      <div className="container-fluid">
        <Control target={this.state.target} route={this.state.route} notify={this.state.notify} lastUpdate={this.state.lastUpdate} nextUpdate={this.state.nextUpdate} time={this.state.time} handleSubmitAddress={this.handleSubmitAddress.bind(this)} handleSubmitNotification={this.handleSubmitNotification.bind(this)} />
        <div className="row">
          <div className="col">
            <Map me={this.state.me} target={this.state.target} />
          </div>
        </div>

      </div>
    );
  }

  _buildDirectionURI(me, target) {
    const coordinates = `${me.lng},${me.lat};${target.center[0]},${target.center[1]}`;
    return `route?coordinates=${encodeURI(coordinates)}`
  }

  _buildAddrURI(addr) {
    return `address?address=${encodeURI(addr)}`
  }

}

export default App;
