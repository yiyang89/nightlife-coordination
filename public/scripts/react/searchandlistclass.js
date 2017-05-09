import React from "react";
import BarComponent from "./barresultclass";

class SearchAndListComponent extends React.Component{
  constructor(props){
    super(props);

    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.search = this.search.bind(this);

    this.state = {location: '', restaurantlist: []};
  }

  handleLocationChange(event) {
    this.setState({location: event.target.value});
  }

  search() {
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
  }

  render() {
    return (
      <div className="searchandlist">
        <input type="text" placeholder="Where are you?" value={this.state.location} onChange={this.handleLocationChange}/>
        <button className="btn btn-info waves-effect waves-light" onClick={this.search}>Search</button>
        <p className="subtext">Search powered by Yelp</p>
        {this.state.restaurantlist.map(function(restaurant, i) {
          return <BarComponent key={i} bardata={restaurant} username={this.props.username}/>
        }.bind(this))}
      </div>
    );
  }
}

export default SearchAndListComponent;
