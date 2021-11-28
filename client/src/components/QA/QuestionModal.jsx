import React from 'react';
import withTracker from './QATrackerHOC';
import API from './QAAPIUtils';

class QuestionModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currProductId: this.props.currProductId,
    };

    this.submitQuestion = this.submitQuestion.bind(this);
    this.handleModal = this.handleModal.bind(this);
  }

  submitQuestion(e) {
    e.preventDefault();

    const question = document.getElementById('modal-question').value;
    const name = document.getElementById('modal-question-nickname').value;
    const email = document.getElementById('modal-question-email').value;

    let tracker = {
      question,
      name,
      email
    };

    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const emailValid = regexp.test(email);

    if (!question || !name || !email || !emailValid) {
      let string = 'You must enter or address the following:\n';

      for (let key in tracker) {
        if (!tracker[key]) {
          string += `- ${key.slice(0, 1).toUpperCase() + key.slice(1)}\n`;
        }
      }

      if (email && !emailValid) {
        string += '- Your email must be formatted correctly\n';
      }

      alert(string);
      return;
    }

    this.handleModal('.modal-q');

    let formElement = document.querySelector('#add-question');
    let formData = new FormData(formElement);

    let data = {};

    for (let [key, value] of formData) {
      data[key] = value;
    }

    data['product_id'] = Number(this.state.currProductId);

    API.postQuestion({ data })
      .then(response => {
        document.getElementById('modal-question').value = '';
        document.getElementById('modal-question-nickname').value = '';
        document.getElementById('modal-question-email').value = '';
        this.props.getQuestions();
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleModal(target) {
    let modal = document.querySelector(target);
    modal.style.display = 'none';
  }

  render() {
    return (
      <div className="modal-q">
        <div className="modal-content">
          <span className="close-btn" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.className, 'Questions & Answers'); }}>&times;</span>
          <p>ASK YOUR QUESTION</p>
          <div className="subtitle" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.className, 'Questions & Answers'); }}>About the {this.props.productName}</div>
          <form id="add-question">
            <label>Your Question:*&nbsp;</label>
            <textarea id="modal-question" name="body" maxLength="1000" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}></textarea>
            <label>What is your nickname:*&nbsp;</label>
            <input type="text" id="modal-question-nickname" placeholder="Example: jackson11!" name="name" maxLength="60" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}/>
            <div className="form-label">(For privacy reasons, do not use your full name or email address)</div>
            <br></br>
            <label>Your email:*&nbsp;</label>
            <input type="text" id="modal-question-email" placeholder="Example: jane@email.com" name="email" maxLength="60" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}/>
            <div className="form-label">(For authentication reasons, you will not be emailed)</div>
            <button onClick={this.submitQuestion}>Submit question</button>
          </form>
        </div>
      </div>
    );
  }
}

export {QuestionModal as TestableQuestionModal};

export default withTracker(QuestionModal);