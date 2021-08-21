import React from "react";

class Control extends React.Component {
  state = {
    nextUpdate: null,
  };

  constructor(props) {
    super(props);

    this.timeInput = React.createRef();
  }

  componentDidMount() {
    setInterval(() => {
      if (this.props.location) {
        this.setState({
          nextUpdate: Math.round(this.props.location.next_refresh - Date.now() / 1000),
        });
      }
    });

    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  render() {
    if (!this.props.target) {
      return <div>No valid address</div>;
    }

    return (
      <div className="info-card shadow">
        <div className="info-body">
          {/* <h5 className="card-title">Your location: {this.props.target.place_name}</h5> */}
          {this.props.route && (
            <div className="label">
              <span>ye11ow</span> is{" "}
              <span className="fw-bold">
                {Math.round(this.props.route.duration / 60)}
              </span>{" "}
              minutes ({Math.round(this.props.route.distance / 1000)} KM) away.
              {"Notification" in window && this.props.notification && (
                <span>
                  &nbsp;You will be notified when ye11ow is{" "}
                  <span className="fw-bold">{this.props.notification}</span>{" "}
                  minutes away
                </span>
              )}
            </div>
          )}
          {"Notification" in window &&
            Notification.permission !== "granted" && (
              <div className="text-danger">
                Notification permission is not granted (
                {Notification.permission}).
              </div>
            )}
          {!("Notification" in window) && (
            <div className="text-danger">
              Notification is not supported on your device.
            </div>
          )}
          {this.props.error && (
             <div className="text-danger">
              {this.props.error}
           </div>
          )}
        </div>
        <div className="text-white-50 float-end">
          {this.props.location && (
            <span>updated at {this._formatTime(this.props.location.timestamp)}, </span>
          )}
          {this.state.nextUpdate > 0 ? (
            <span>next update in {this.state.nextUpdate}s</span>
          ) : (
            <span>updating...</span>
          )}
        </div>
      </div>
    );
  }

  _formatTime(timestamp) {
    const datetime = new Date(timestamp * 1000);

    return `${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}`;
  }
}

export default Control;
