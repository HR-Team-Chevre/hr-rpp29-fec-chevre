import React from 'react';
import axios from 'axios';

import QAHeader from './QAHeader';
import SearchBar from './SearchBar';
import QAList from './QAList';
import QAButtons from './QAButtons';
import AnswerModal from './AnswerModal';
import QuestionModal from './QuestionModal';
import ThumbnailModal from './ThumbnailModal';

import API from './QAAPIUtils.js';
import withTracker from './QATrackerHOC';

import './QA.scss';

class QuestionsAndAnswers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      currProduct: {name: 'TEST PRODUCT NAME'},
      currProductId: props.productId,
      productName: '',
      questions: [],
      filteredQs: [],
      questionBody: '',
      questionId: '',
      answers: {},
      filteredAs: {},
      photos: [],
      searchVal: '',
      count: 2,
      originalLength: null,
      displayedImage: '',
      displayMoreAnsweredQs: true
    };

    this.retrieveSortQAs = this.retrieveSortQAs.bind(this);
    this.displayButtons = this.displayButtons.bind(this);
    this.markHelpful = this.markHelpful.bind(this);
    this.report = this.report.bind(this);
    this.addAnswer = this.addAnswer.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.openModal = this.openModal.bind(this);
    this.moreAnsweredQs = this.moreAnsweredQs.bind(this);
    this.loadMoreAnswers = this.loadMoreAnswers.bind(this);
    this.openThumbnail = this.openThumbnail.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
    this.showLoadMoreAnswers = this.showLoadMoreAnswers.bind(this);
    this.showMoreAnsweredQs = this.showMoreAnsweredQs.bind(this);
    this.hideLoadMoreAnswers = this.hideLoadMoreAnswers.bind(this);
    this.setSearchState = this.setSearchState.bind(this);
    this.getProductName = this.getProductName.bind(this);
  }

  componentDidMount() {
    this.getQuestions((result) => {
      this.setState({
        originalLength: result.length,
        isLoaded: true
      });

      if (result.length <= 2) {
        this.setState({
          displayMoreAnsweredQs: false
        });
      }
    });

    this.getProductName();
  }

  getQuestions(cb, reset) {
    API.getQuestions(this.state.currProductId)
      .then(response => {
        const questions = response.data.results;

        if (cb) {
          cb(questions);
        }

        if (reset) {
          this.retrieveSortQAs(questions, true);
        } else {
          this.retrieveSortQAs(questions);
        }

        this.displayButtons();
      })
      .catch(err => {
        console.log(err);
      });
  }

  getProductName() {
    API.getProductName(this.state.currProductId)
      .then(response => {
        this.setState({
          currProduct: {
            name: response.data.name
          }
        });
      }).
      catch(err => {
        console.log('err', err);
      });
  }

  retrieveSortQAs(questions, reset) {
    const answers = {};

    questions.forEach(q => {
      const ansObj = {};
      const ansArray = [];

      for (let i in q.answers) {
        ansArray.push(q.answers[i]);
      }

      ansObj.data = ansArray;

      if (reset) {
        ansObj.count = 2;
      } else {
        if (this.state.answers[q.question_id] && this.state.answers[q.question_id].count) {
          ansObj.count = this.state.answers[q.question_id].count;
        } else {
          ansObj.count = 2;
        }
      }

      answers[q.question_id] = ansObj;
    });

    this.setState({
      answers,
      filteredAs: answers
    });

    questions.sort((a, b) => {
      return b.question_helpfulness - a.question_helpfulness;
    });

    let filteredQs;

    if (reset) {
      filteredQs = questions.slice(0, 2);
    } else {
      filteredQs = questions.slice(0, this.state.count);
    }

    this.setState({
      questions,
      filteredQs
    });
  }

  displayButtons() {
    const displayedAnswers = document.getElementsByClassName('load-more-answers');

    for (let i = 0; i < displayedAnswers.length; i++) {
      let length = displayedAnswers[i].attributes['original-length'].value;

      if (length <= 2) {
        displayedAnswers[i].style.display = 'none';
      } else if (length > 2) {
        displayedAnswers[i].style.display = 'block';
      }
    }
  }

  markHelpful(e) {
    const clicked = e.target.getAttribute('clicked');

    let url, data;

    if (clicked === 'true') {
      alert('You have already marked this as helpful');
      return;
    }

    e.target.setAttribute('clicked', 'true');
    e.target.style['text-decoration'] = 'none';

    if (e.target.className === 'answer-helpful') {
      let answerId = e.target.getAttribute('answer_id');
      data = { answerId };
    } else if (e.target.className === 'question-helpful') {
      let questionId = e.target.getAttribute('question_id');
      data = { questionId };
    }

    API.markHelpful(e.target.className, data)
      .then(response => {
        this.getQuestions();
      })
      .catch(err => {
        console.log(err);
      });
  }

  report(e) {
    e.target.innerHTML = 'Reported';

    let url, data, questionId, answerId;

    if (e.target.className === 'report-question') {
      questionId = e.target.getAttribute('question_id');
      data = { questionId };

      let filteredQs = this.state.filteredQs;

      for (let i = 0; i < filteredQs.length; i++) {
        if (filteredQs[i].question_id === Number(questionId)) {
          filteredQs.splice(i, 1);
        }
      }

      setTimeout(() => {
        this.setState({
          filteredQs
        });

        this.displayButtons();
      }, 1000);
    } else if (e.target.className === 'report-answer') {
      answerId = e.target.getAttribute('answer_id');
      data = { answerId };

      let filteredAs = this.state.filteredAs;

      for (let key in filteredAs) {
        for (let i = 0; i < filteredAs[key].data.length; i++) {
          if (filteredAs[key].data[i].id === Number(answerId)) {
            filteredAs[key].data.splice(i, 1);
          }
        }
      }

      setTimeout(() => {
        this.setState({
          filteredAs
        });

        this.displayButtons();
      }, 1000);
    }

    API.report(e.target.className, data)
      .catch(err => {
        console.log(err);
      });
  }

  addQuestion(e) {
    const productName = this.state.currProduct.name;

    this.setState({
      productName
    });

    this.openModal('question');
  }

  addAnswer(e) {
    const questionId = e.target.getAttribute('question_id');
    const questionBody = e.target.getAttribute('question_body');
    const productName = this.state.currProduct.name;

    this.setState({
      productName,
      questionBody,
      questionId
    });

    this.openModal('answer');
  }

  openModal(target) {
    let modal;

    if (target === 'question') {
      modal = document.querySelector('.modal-q');
    } else if (target === 'answer') {
      modal = document.querySelector('.modal');
    } else if (target === 'image') {
      modal = document.querySelector('.modal-thumbnail');
    }

    modal.style.display = 'block';

    const closeBtn = document.querySelector('.modal .close-btn');
    const closeBtn2 = document.querySelector('.modal-q .close-btn');
    const closeBtn3 = document.querySelector('.modal-thumbnail .close-btn');

    let buttons = [closeBtn, closeBtn2, closeBtn3];

    buttons.forEach(button => {
      button.onclick = () => {
        modal.style.display = 'none';
        document.getElementsByTagName('body')[0].removeAttribute('style', 'overflow-y: hidden');
      };
    });

    window.onclick = (e) => {
      if (e.target === modal || e.target.className === 'thumbnail-content') {
        modal.style.display = 'none';
        document.getElementsByTagName('body')[0].removeAttribute('style', 'overflow-y: hidden');
      }
    };
  }

  openThumbnail(e) {
    const displayedImage = e.target.getAttribute('full');

    document.getElementsByTagName('body')[0].setAttribute('style', 'overflow-y: hidden');

    this.setState({
      displayedImage
    });

    this.openModal('image');
  }

  moreAnsweredQs() {
    this.setState({
      count: this.state.count + 5,
      displayMoreAnsweredQs: false
    });

    this.getQuestions();
  }

  showMoreAnsweredQs() {
    if (this.state.questions.length >= 2) {
      this.setState({
        displayMoreAnsweredQs: true
      });
    }
  }

  loadMoreAnswers(e) {
    const text = e.target.parentElement.textContent;
    const questionId = e.target.parentElement.getAttribute('question_id');
    const originalLength = e.target.parentElement.getAttribute('original-length');

    let answers = this.state.answers;

    if (text === 'LOAD MORE ANSWERS') {
      e.target.parentElement.innerHTML = '<b>COLLAPSE ANSWERS</b>';
      answers[questionId].count = originalLength;
    } else if (text === 'COLLAPSE ANSWERS') {
      answers[questionId].count = 2;
      e.target.parentElement.innerHTML = '<b>LOAD MORE ANSWERS</b>';
    }

    this.setState({
      answers
    });

    this.getQuestions();
  }

  hideLoadMoreAnswers() {
    let loadMoreAnswers = document.getElementsByClassName('load-more-answers');
    for (let i = 0; i < loadMoreAnswers.length; i++) {
      loadMoreAnswers[i].style.display = 'none';
    }
  }

  showLoadMoreAnswers() {
    let loadMoreAnswers = document.getElementsByClassName('load-more-answers');
    for (let i = 0; i < loadMoreAnswers.length; i++) {
      loadMoreAnswers[i].style.display = 'block';
    }
  }

  setSearchState(filteredAs, filteredQs, cb) {
    this.setState({
      filteredAs,
      filteredQs
    }, () => {
      cb();
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return (
        <div id="loading">Loading...</div>
      );
    }

    return (
      <div className="qa" id="qa-wrapper">
        <QAHeader />
        <SearchBar getQuestions={this.getQuestions} showLoadMoreAnswers={this.showLoadMoreAnswers} showMoreAnsweredQs={this.showMoreAnsweredQs} hideLoadMoreAnswers={this.hideLoadMoreAnswers} questions={this.state.questions} answers={this.state.answers} setSearchState={this.setSearchState}/>
        <QAList filteredQs={this.state.filteredQs} markHelpful={this.markHelpful} report={this.report} loadMoreAnswers={this.loadMoreAnswers} addAnswer={this.addAnswer} moreAnsweredQs={this.moreAnsweredQs} addQuestion={this.addQuestion} productName={this.state.productName} questionBody={this.state.questionBody} uploadPhotos={this.uploadPhotos} submitAnswer={this.submitAnswer} productName={this.state.productName} submitQuestion={this.submitQuestion} answers={this.state.filteredAs} answerCount={this.state.answerCount} getQuestions={this.getQuestions} openThumbnail={this.openThumbnail}/>
        <QAButtons moreAnsweredQs={this.moreAnsweredQs} addQuestion={this.addQuestion} displayMoreAnsweredQs={this.state.displayMoreAnsweredQs} />
        <AnswerModal productName={this.state.productName} questionBody={this.state.questionBody} openThumbnail={this.openThumbnail} questionId={this.state.questionId} getQuestions={this.getQuestions} />
        <QuestionModal productName={this.state.productName} getQuestions={this.getQuestions} currProductId={this.state.currProductId}/>
        <ThumbnailModal photo={this.state.displayedImage}/>
      </div>
    );
  }
}

export {QuestionsAndAnswers as TestableQuestionsAndAnswers};

export default withTracker(QuestionsAndAnswers);