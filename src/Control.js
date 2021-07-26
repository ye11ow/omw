import React from "react";

class Control extends React.Component {

  state = {
    address: '',
    time: 5,
    nextUpdate: null
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    let addr = urlParams.get("address");
    this._address = '';
    if (addr && addr.length > 0) {
      this.state.address = addr;
      this.props.handleSubmitAddress(addr);
    }

    setInterval(() => {
      if (this.props.nextUpdate) {
        this.setState({
          nextUpdate: Math.round(this.props.nextUpdate - Date.now() / 1000)
        });
      }
    });
  }

  handleAddrChange(event) {
    this.setState({address: event.target.value});
  }

  handleNotificationChange(event) {
    this.setState({time: event.target.value});
  }


  handleSubmitAddress(event) {
    this.props.handleSubmitAddress(this.state.address);
    if (event) {
      event.preventDefault();
    }
  }

  render() {
    return (
      <div className="row">
        {this.props.target === null &&
          <form onSubmit={this.handleSubmitAddress.bind(this)}>
            <div className="col-sm-6">
              <input
                className="form-control"
                type="text"
                name="address"
                placeholder="Your address"
                value={this.state.address}
                onChange={this.handleAddrChange.bind(this)}
              />
            </div>
            <div className="col-sm-6">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </form>
        }
        {this.props.target &&
          <form onSubmit={this.props.handleSubmitNotification}>
            <div className="col">
              Your place: {this.state.address}
              {this.props.route && (
                <div className="label">
                  <span>ye11ow</span> is{" "}
                  <span className="time">
                    {Math.round(this.props.route.duration / 60)}
                  </span>{" "}
                  minutes or{" "}
                  <span className="distance">
                    {Math.round(this.props.route.distance / 1000)}
                  </span>{" "}
                  KM away (next update in <span>{Math.round(this.props.nextUpdate - Date.now() / 1000)}</span>s)
                </div>
              )}
            </div>
            <div className="col">
              {!this.props.notify &&
              <div>
                Notify me when ye11ow is
                <input
                  className="form-control"
                  type="number"
                  name="time"
                  value={this.state.time}
                  onChange={this.handleNotificationChange.bind(this)}
                />
                 minutes away
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
              }
              {this.props.notify && (
                <div className="label">
                  You will be notified when ye11ow is <span className="time">{this.props.time}</span> minutes away
                </div>
              )}
            </div>
          </form>
        }
      </div>
    );
  }
}

export default Control;
