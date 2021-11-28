import axios from 'axios';

export default {
  getProduct(id) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/api/products/${id}`)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  getProductStyles(id) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/api/products/${id}/styles`)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  getReviews(id) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/api/reviews/${id}/relevance`)
        .then(response => {
          resolve(response.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  },

  sendClickData(clickData) {
    return axios.post('/api/interactions/clickData', clickData);
  },
};
