import React from "react";

class BarComponent extends React.Component{
  constructor(props){
    super(props);

    this.toggleGoing = this.toggleGoing.bind(this);

    this.state = {
      goinglist: this.props.bardata.going,
      showgoing: false
    };
  }

  toggleGoing() {
    var params = "?&username="+this.props.username+"&bardata="+encodeURIComponent(JSON.stringify(this.props.bardata));
    if (this.state.goinglist.includes(this.props.username)) {
      $.getJSON('/notgoing/'+params, function(result) {
        if (result.error) {
          alert("Error: "+result.error);
        } else {
          this.setState({goinglist: result.going});
        }
      }.bind(this))
    } else {
      $.getJSON('/going/'+params, function(result) {
        if (result.error) {
          alert("Error: "+result.error);
        } else {
          this.setState({goinglist: result.going});
        }
      }.bind(this))
    }
  }

  render() {
    var imagesource = this.props.bardata.image_url? this.props.bardata.image_url : 'images/placeholder.gif';
    var price = this.props.bardata.price? this.props.bardata.price : 'Not available';
    var rating = this.props.bardata.rating? this.props.bardata.rating : 'Not available';
    return (
      <div className="card bigcard restaurantcard">
        <img src={imagesource} />
        <div className="restaurantdescription">
          <a href={this.props.bardata.url}><strong>{this.props.bardata.name}</strong></a>
          <br/>
          <em>{this.props.bardata.display_address}</em>
          <br/>
          Price: {price}
          <br/>
          Rating: {rating}
          <button className="btn btn-info waves-effect waves-light" disabled={this.props.username === null} onClick={this.toggleGoing}>
            Going ({this.state.goinglist.length})
          </button>
          {this.state.goinglist.includes(this.props.username)? <em>You are going</em> : null}
        </div>
      </div>
    )
  }
}

export default BarComponent;
