import React from 'react';
import API from './ReviewsAPIUtils';
import ClickTracker from './ClickTracker';
import './RatingsAndReviews.scss';

const Sort = ({getReviewData, totalReviews, handleTrackingClick}) => {

  const handleSelected = (event) => {
    getReviewData(event.target.value);
  };

  const dropDownList = (
    <select onChange={handleSelected} className="reviews-sort-dropdown" onClick={(e) => handleTrackingClick(e, e.currentTarget.className)}>
      <option>relevance</option>
      <option>helpfulness</option>
      <option>newest</option>
    </select>
  );

  return (
    <div id="sort-reviews">{totalReviews} reviews, sorted by {dropDownList}</div>
  );
};

export default ClickTracker(Sort);
