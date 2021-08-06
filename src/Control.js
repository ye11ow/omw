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

  handleSubmitNotification(event) {
    this.props.handleSubmitNotification(this.timeInput.current.value);
    event.preventDefault();
  }

  render() {
    return (
      <div className="row">
        {this.props.target === null &&
          <div className="col-sm-12">
            No valid address
          </div>
        }
        {this.props.target &&
          <form onSubmit={this.handleSubmitNotification.bind(this)}>
            <div className="col">
              Your location: {this.props.target.place_name}
              {this.props.route && (
                <div className="label">
                  <span>ye11ow</span> is{" "}
                  <span className="time">
                    {Math.round(this.props.route.duration / 60)}
                  </span>{" "}
                  minutes ({Math.round(this.props.route.distance / 1000)} KM) away (next update in <span>{Math.round(this.props.nextUpdate - Date.now() / 1000)}</span>s)
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
                  defaultValue={this.props.time}
                  ref={this.timeInput}
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
