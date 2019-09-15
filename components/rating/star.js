import React, { Component } from 'react';
import StarRating from 'react-native-star-rating';
 
class Star extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      starCount: 0
    };
  }
 
  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    });
  }
 
  render() {
    return (
      <StarRating
        disabled={false}
        maxStars={5}
        rating={this.state.starCount}
        selectedStar={(rating) => this.onStarRatingPress(rating)}
      />
    );
  }
}
 
export default Star;