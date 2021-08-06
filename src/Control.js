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
    return (
      <div className="row">
        <div className="col-sm-12">
          Your location: {this.props.target.place_name}
          {this.props.route && (
            <div className="label">
              <span>ye11ow</span> is{" "}
              <mark className="fw-bold">
                {Math.round(this.props.route.duration / 60)}
              </mark>{" "}
              minutes ({Math.round(this.props.route.distance / 1000)} KM) away (<span className="text-muted">next update in {Math.round(this.props.nextUpdate - Date.now() / 1000)}</span>s)
            </div>
          )}
          {this.props.notification && (
            <div className="label">
              You will be notified when ye11ow is <mark className="fw-bold">{this.props.notification}</mark> minutes away
            </div>
          )}
          {"Notification" in window && Notification.permission !== "granted" &&
            <div className="text-danger">
              Notification permission is not granted ({Notification.permission}).
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Control;
