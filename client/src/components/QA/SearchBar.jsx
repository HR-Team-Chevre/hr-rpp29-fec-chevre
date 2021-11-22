import React from 'react';
import withTracker from './QATrackerHOC';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchVal: '',
      questions: document.getElementsByClassName('question-text'),
      answers: document.getElementsByClassName('answer-text')
    };

    this.handleChange = this.handleChange.bind(this);
  }

  highlightText() {
    this.clearText();

    let term = this.state.searchVal;

    const answers = this.state.answers;
    const questions = this.state.questions;

    for (let i = 0; i < answers.length; i++) {
      let currText = answers[i].innerHTML;
      let newText = currText.replace(new RegExp(term, 'gi'), (match) => `<mark>${match}</mark>`);

      answers[i].innerHTML = newText;
    }

    for (let i = 0; i < questions.length; i++) {
      let currText = questions[i].innerHTML;
      let newText = currText.replace(new RegExp(term, 'gi'), (match) => `<mark>${match}</mark>`);

      questions[i].innerHTML = newText;
    }
  }

  clearText() {
    const answers = this.state.answers;
    const questions = this.state.questions;

    const regex = new RegExp('mark>', 'ig');

    for (let i = 0; i < answers.length; i++) {
      answers[i].innerHTML = answers[i].innerHTML.replace(regex, 'wbr>');
    }

    for (let i = 0; i < questions.length; i++) {
      questions[i].innerHTML = questions[i].innerHTML.replace(regex, 'wbr>');
    }
  }

  handleChange(e) {
    this.setState({
      searchVal: e.target.value
    });

    let text = e.target.value.toLowerCase();
    let questions = this.props.questions;

    if (!text || text === '' || text.length < 2) {
      this.props.getQuestions(null, true);
      this.props.showLoadMoreAnswers();
      this.props.showMoreAnsweredQs();
      this.clearText();
    } else if (text.length > 2) {
      let filteredQs = questions.filter(q => {
        let question = q.question_body.toLowerCase();
        let answers = '';

        for (let key in q.answers) {
          answers += q.answers[key].body;
        }

        answers = answers.toLowerCase();

        return question.includes(text) || answers.includes(text);
      });

      const originalAnswers = Object.assign({}, this.props.answers);
      const filteredAs = Object.assign({}, originalAnswers);

      let questionKeys = filteredQs.map(q => {
        return q.question_id;
      });

      for (let key in filteredAs) {
        if (filteredAs[key]) {
          let newData = [];

          for (let i = 0; i < filteredAs[key].data.length; i++) {
            if (filteredAs[key].data[i].body.toLowerCase().includes(text)) {
              newData.push(filteredAs[key].data[i]);
            }

            if (questionKeys.includes(Number(key)) && !newData.includes(filteredAs[key].data[i])) {
              newData.push(filteredAs[key].data[i]);
            }
          }
          filteredAs[key].count = 100;
          filteredAs[key].data = newData;
        }
      }

      this.props.setSearchState(filteredAs, filteredQs, () => {
        this.highlightText();
        this.props.hideLoadMoreAnswers();
        this.props.showMoreAnsweredQs();
      });
    }
  }

  render() {
    return (
      <div className="qa" id="search" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}>
        <input type="text" placeholder="HAVE A QUESTION? SEARCH FOR ANSWERS..." onChange={this.handleChange} ></input>
      </div>
    );
  }
}

export {SearchBar as TestableSearchBar};

export default withTracker(SearchBar);