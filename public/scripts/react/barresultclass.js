var BarComponent = React.createClass({
  render: function() {
    var imagesource = this.props.bardata.image_url? this.props.bardata.image_url : 'images/placeholder.gif';
    var price = this.props.bardata.price? this.props.bardata.price : 'Not available';
    var rating = this.props.bardata.rating? this.props.bardata.rating : 'Not available';
    return (
      <div className="card bigcard restaurantcard">
        <img src={imagesource} />
        <div className="restaurantdescription">
          <strong>{this.props.bardata.name}</strong>
          <br/>
          <em>{this.props.bardata.location.display_address.join(", ")}</em>
          <br/>
          Price: {price}
          <br/>
          Rating: {rating}
          <button className="btn btn-info waves-effect waves-light">Going</button>
        </div>
      </div>
    )
  }
})
