import React from 'react';
import './RatingsAndReviews.scss';
import { AiOutlinePlus } from 'react-icons/ai';

import Stars from '../Stars/Stars';
import Sort from './Sort';
import ReviewContent from './ReviewContent';
import RatingsBreakdown from './RatingsBreakdown';
import FilteredStatus from './FilteredStatus';
import ProductBreakdown from './ProductBreakdown';
import ReviewsModal from './ReviewsModal';
import NewReviewForm from './NewReviewForm';
import API from './ReviewsAPIUtils';
import ClickTracker from './ClickTracker';

class RatingsAndReviews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentProductName: '',
      currentProductReviews: [],
      currentProductMeta: {},
      displayedReviewsCount: 2,
      filterReviews: [0, 0, 0, 0, 0],
      imageURL: '',
      currentSortMethod: 'relevance',
      displayForm: false
    };

    this.getReviewData = this.getReviewData.bind(this);
    this.handleStarsNumberClick = this.handleStarsNumberClick.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.displayImage = this.displayImage.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.handleHelpfulClick = this.handleHelpfulClick.bind(this);
    this.handleReportClick = this.handleReportClick.bind(this);

    this.handleAddNewReview = this.handleAddNewReview.bind(this);

  }

  componentDidMount () {
    this.getReviewData('relevance');
  }

  getReviewsToDisplay(filtered) {
    let reviewHolder = [];
    let reviews, compareLength;

    if (filtered) {
      this.state.currentProductReviews.forEach(review => {
        if (this.state.filterReviews[review.rating - 1]) {
          reviewHolder.push(review);
        }
      });
      reviews = reviewHolder.slice(0, this.state.displayedReviewsCount);
      compareLength = reviewHolder.length;
    } else {
      reviews = this.state.currentProductReviews.slice(0, this.state.displayedReviewsCount);
      compareLength = this.state.currentProductReviews.length;
    }

    return [reviews, compareLength];
  }

  async getReviewData (sortMethod) {
    const reviews = await API.getProductReviews(this.props.productId, sortMethod);
    const reviewsMeta = await API.getProductReviewsMeta(this.props.productId);
    const productName = await API.getProductName(this.props.productId);
    this.setState({
      currentProductReviews: reviews.data.results,
      currentProductMeta: reviewsMeta,
      currentSortMethod: sortMethod,
      currentProductName: productName.data
    });
  }

  getAverageRating (reviews) {
    const averageRating = reviews.reduce((average, review) => {
      return average + review.rating;
    }, 0) / reviews.length;

    return averageRating.toFixed(1);
  }

  getPercentRecommended (meta) {
    const { recommended } = meta;
    const total = parseInt(recommended.false) + parseInt(recommended.true);
    const percentRecommended = (recommended.true / total) * 100;

    return percentRecommended.toFixed();
  }

  clearAllFilters () {
    this.setState({
      filterReviews: [0, 0, 0, 0, 0]
    });
  }

  displayImage (url) {
    document.getElementsByTagName('body')[0].setAttribute('style', 'overflow-y: hidden');
    this.setState({
      imageURL: url
    });
  }

  closeImage (id) {
    if (id === 'reviews-fullscreen-image-wrapper' || id === 'close-image') {
      document.getElementsByTagName('body')[0].removeAttribute('style', 'overflow-y: hidden');
      this.setState({
        imageURL: ''
      });
    }
  }

  closeForm (id) {
    if (id === 'review-form-wrapper' || id === 'close-form') {
      document.getElementsByTagName('body')[0].removeAttribute('style', 'overflow-y: hidden');
      this.getReviewData(this.state.currentSortMethod);
      this.setState({
        displayForm: false
      });
    }
  }

  handleMoreReviewsClick () {
    const newCount = this.state.displayedReviewsCount + 2;
    this.setState({
      displayedReviewsCount: newCount
    });
  }

  handleAddNewReview () {
    document.getElementsByTagName('body')[0].setAttribute('style', 'overflow-y: hidden');
    this.setState({
      displayForm: true
    });
  }

  async handleHelpfulClick (reviewId) {
    try {
      const response = await API.sendHelpful(reviewId);
      this.getReviewData(this.state.currentSortMethod);
    } catch (err) {
      console.log(err.message);
    }
  }

  async handleReportClick(reviewId) {
    try {
      const response = await API.reportReview(reviewId);
      this.getReviewData(this.state.currentSortMethod);
    } catch (err) {
      console.log(err.message);
    }
  }

  handleStarsNumberClick (stars) {
    const filters = [...this.state.filterReviews];
    filters[stars - 1] === 0 ? filters[stars - 1] = 1 : filters[stars - 1] = 0;
    this.setState({
      filterReviews: filters,
      displayedReviewsCount: 2
    });
  }

  render () {
    if (this.state.currentProductReviews.length === 0) {
      return (
        <div id="reviews-section">
          {this.state.displayForm &&
           <NewReviewForm
             currentProductName={this.state.currentProductName}
             productId={this.props.productId}
             closeForm={this.closeForm}
             currentProductMeta={this.state.currentProductMeta}/>
          }
          <div id="review-section-title">RATINGS AND REVIEWS</div>
          <div id="reviews-wrapper">
            <div id="reviews-col1"></div>
            <div id="reviews-col2">
              <button className="btn" onClick={this.handleAddNewReview}>ADD A REVIEW <span className="plus-icon">+</span></button>
            </div>
          </div>
        </div>
      );
    }

    const averageRating = this.getAverageRating(this.state.currentProductReviews);
    const percentRecommended = this.getPercentRecommended(this.state.currentProductMeta);
    const totalReviews = this.state.currentProductReviews.length;
    const filtered = this.state.filterReviews.includes(1);
    const [ displayedReviews, compareLength ] = this.getReviewsToDisplay(filtered);


    let reviewsToDisplay = displayedReviews.map(review => {
      return <ReviewContent
        handleHelpfulClick={this.handleHelpfulClick}
        handleReportClick={this.handleReportClick}
        displayImage={this.displayImage}
        key={review.review_id}
        review={review}
      />;
    });


    return (
      <div id="reviews-section">
        {this.state.displayForm &&
          <NewReviewForm
            currentProductName={this.state.currentProductName}
            productId={this.props.productId}
            closeForm={this.closeForm}
            currentProductMeta={this.state.currentProductMeta}
            currentProductName={this.state.currentProductName}/>
        }
        {this.state.imageURL.length > 0 &&
          <ReviewsModal closeImage={this.closeImage} imageURL={this.state.imageURL}/>
        }
        <div id="review-section-title">RATINGS AND REVIEWS</div>
        <div id="reviews-wrapper">
          <div id="reviews-col1">
            <div id="avg-reviews-container">
              <div className="large-avg-review">{averageRating}</div>
              <div id="avg-stars-container"><Stars average={averageRating} /></div>
            </div>
            <RatingsBreakdown handleStarsNumberClick={this.handleStarsNumberClick} percentRecommended={percentRecommended} reviews={this.state.currentProductReviews} totalReviews={totalReviews}/>
            {filtered === true &&
              <FilteredStatus filterReviews={this.state.filterReviews} clearAllFilters={this.clearAllFilters}/>
            }
            <ProductBreakdown currentProductMeta={this.state.currentProductMeta}/>
          </div>
          <div id="reviews-col2">
            <Sort getReviewData={this.getReviewData} totalReviews={totalReviews}/>
            <div className="review-content-wrapper">
              <div>
                {reviewsToDisplay}
              </div>
            </div>
            {this.state.displayedReviewsCount < compareLength &&
              <button className="btn more-reviews-btn" onClick={(e) => {
                this.handleMoreReviewsClick();
                this.props.handleTrackingClick(e, e.currentTarget.className);
              }}>MORE REVIEWS</button>
            }
            <button className="btn add-reviews-btn" onClick={(e) => {
              this.handleAddNewReview();
              this.props.handleTrackingClick(e, e.currentTarget.className);
            }}>ADD A REVIEW <span className="plus-icon">+</span></button>
          </div>
        </div>
      </div>
    );
  }
}
export { RatingsAndReviews as TestRatingsAndReviews };

export default ClickTracker(RatingsAndReviews);
