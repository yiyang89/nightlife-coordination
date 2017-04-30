var SearchAndListComponent = React.createClass({
  getInitialState: function() {
    return {location: '', restaurantlist: []};
  },
  handleLocationChange: function(event) {
    this.setState({location: event.target.value});
  },
  search: function() {
    if (this.state.location.trim() === '') {
      alert('Please enter a location');
    } else {
      var params = "?&location=" + this.state.location;
      $.getJSON('/search/'+params, function(result) {
        if (result.error) {
          alert("Error: "+result.error);
        } else {
          console.log(result);
          this.setState({restaurantlist: result});
        }
      }.bind(this))
    }
  },
  render: function() {
    return (
      <div className="searchandlist">
        <input type="text" placeholder="Where are you?" value={this.state.location} onChange={this.handleLocationChange}/>
        <button className="btn btn-info waves-effect waves-light" onClick={this.search}>Search</button>
        {this.state.restaurantlist.map(function(restaurant, i) {
          return <BarComponent key={i} bardata={restaurant}/>
        })}
      </div>
    );
  }
})
