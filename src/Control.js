import React from "react";

class Control extends React.Component {

  state = {
    nextUpdate: null
  }

  constructor(props) {
    super(props);

    this.timeInput = React.createRef();
  }

  componentDidMount() {
    setInterval(() => {
      if (this.props.nextUpdate) {
        this.setState({
          nextUpdate: Math.round(this.props.nextUpdate - Date.now() / 1000)
        });
      }
    });

    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  render() {
    if (!this.props.target) {
      return (
        <div className="col-sm-12">
          No valid address
        </div>
      );
    }

    const nextUpdate = Math.round(this.props.nextUpdate - Date.now() / 1000);
    return (
      <div className="row">
        <div className="col-sm-12">
          <div className="card info-card">
            <div className="card-body">
              <h5 className="card-title">Your location: {this.props.target.place_name}</h5>
              {this.props.route && (
                <div className="label">
                  <span>ye11ow</span> is{" "}
                  <mark className="fw-bold">
                    {Math.round(this.props.route.duration / 60)}
                  </mark>{" "}
                  minutes ({Math.round(this.props.route.distance / 1000)} KM) away
                </div>
              )}
              {"Notification" in window && this.props.notification && (
                <div className="label">
                  You will be notified when ye11ow is <mark className="fw-bold">{this.props.notification}</mark> minutes away
                </div>
              )}
              {"Notification" in window && Notification.permission !== "granted" &&
                <div className="text-danger">
                  Notification permission is not granted ({Notification.permission}).
                </div>
              }
              {!("Notification" in window) &&
                <div className="text-danger">
                  Notification is not supported on your device.
                </div>
              }
            </div>
            <div className="card-footer text-muted">
              {nextUpdate > 0
                ? <span className="text-muted">next update in {nextUpdate}s</span>
                : <span className="text-muted">updating...</span>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Control;
