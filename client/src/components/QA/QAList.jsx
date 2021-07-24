import React from 'react';
import axios from 'axios';

import QAconfig from './QAconfig';

class QAList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currProductId: props.currProductId,
      questions: [],
      currProduct: {},
      productName: '',
      questionBody: '',
      questionId: '',
      photos: []
    };

    this.questionHelpful = this.questionHelpful.bind(this);
    this.answerHelpful = this.answerHelpful.bind(this);
    this.answerReport = this.answerReport.bind(this);
    this.addAnswer = this.addAnswer.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);
    this.submitQuestion = this.submitQuestion.bind(this);
    this.uploadPhotos = this.uploadPhotos.bind(this);
  }

  componentDidMount() {
    this.getQuestions();
    this.getProduct();
  }

  getProduct() {
    axios({
      method: 'GET',
      url: `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rpp/products/${this.state.currProductId}`,
      headers: {
        Authorization: QAconfig.GITHUB,
      }
    })
      .then(response => {
        let currProduct = response.data;

        this.setState({
          currProduct
        });
      })
      .catch(err => {
        console.log('axios get error', err);
      });

  }

  getQuestions() {
    axios({
      method: 'POST',
      url: '/getQuestions',
      data: {
        auth: QAconfig.GITHUB,
        productId: this.state.currProductId
      }
    })
      .then(response => {
        let questions = response.data.results;

        questions.sort((a, b) => {
          return b.question_helpfulness - a.question_helpfulness;
        });

        this.setState({
          questions
        });
      })
      .catch(err => {
        console.log('axios get error', err);
      });
  }

  answerHelpful(e) {
    let answerId = e.target.getAttribute('answer_id');

    axios({
      method: 'POST',
      url: '/answerHelpful',
      data: {
        auth: QAconfig.GITHUB,
        answerId
      }
    })
      .then(response => {
        this.getQuestions();
      })
      .catch(err => {
        console.log('a helpful axios error', err);
      });
  }

  answerReport(e) {
    let answerId = e.target.getAttribute('answer_id');

    e.target.innerHTML = 'Reported';

    axios({
      method: 'POST',
      url: '/reportAnswer',
      data: {
        auth: QAconfig.GITHUB,
        answerId
      }
    })
      .then(response => {

      })
      .catch(err => {
        console.log('report a axios error', err);
      });
  }

  questionHelpful(e) {
    let questionId = e.target.getAttribute('question_id');

    axios({
      method: 'POST',
      url: '/questionHelpful',
      data: {
        auth: QAconfig.GITHUB,
        questionId
      }
    })
      .then(response => {
        this.getQuestions();
      })
      .catch(err => {
        console.log('q helpful axios error', err);
      });
  }

  addAnswer(e) {
    let questionId = e.target.getAttribute('question_id');
    let questionBody = e.target.getAttribute('question_body');
    let productName = this.state.currProduct.name;

    this.setState({
      productName,
      questionBody,
      questionId
    });

    let modal = document.querySelector('.modal');

    modal.style.display = 'block';

    let closeBtn = document.querySelector('.close-btn');

    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  renderPhotoThumbnails() {

  }

  uploadPhotos(e) {
    console.log('entered uploadPhotos');

    console.log('e target files', e.target.files[0]);

    let data = new FormData();
    data.append('file', e.target.files[0]);

    let config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };

    axios.post('/uploadPhotos', data, config)
      .then(res => {
        console.log('res', res);

        this.setState({
          photos: [res.data, ...this.state.photos]
        });

        console.log(this.state.photos);
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  submitAnswer(e) {
    e.preventDefault();

    let answer = document.getElementById('modal-answer').value;
    let name = document.getElementById('modal-answer-nickname').value;
    let email = document.getElementById('modal-answer-email').value;
    let photos = document.getElementById('modal-photos').value;

    console.log('photos', photos);

    let tracker = {
      answer,
      name,
      email
    };

    if (!answer || !name || !email || !email.includes('@')) {
      let string = 'You must enter the following: ';

      for (let key in tracker) {
        if (!tracker[key]) {
          string += `${key}, `;
        }
      }

      string = string.slice(0, -2);

      let string2;

      if (!email.includes('@') && email) {
        string2 = '. Your email must also be formatted correctly';
      }

      if (string.length === 28) {
        alert('Your email must be formatted correctly');
      } else if (string2) {
        alert(string + string2);
      } else {
        alert(string);
      }

      return;
    }

    let modal = document.querySelector('.modal');
    modal.style.display = 'none';

    let formElement = document.querySelector('#add-answer');
    let formData = new FormData(formElement);

    let data = {};

    for (let [key, value] of formData) {
      data[key] = value;
    }

    axios({
      method: 'POST',
      url: '/addAnswer',
      data: {
        auth: QAconfig.GITHUB,
        questionId: this.state.questionId,
        data
      }
    })
      .then(response => {
        document.getElementById('modal-answer').value = '';
        document.getElementById('modal-answer-nickname').value = '';
        document.getElementById('modal-answer-email').value = '';
        this.getQuestions();
      })
      .catch(err => {
        console.log('submit answer axios error', err);
      });
  }

  addQuestion(e) {
    let productName = this.state.currProduct.name;

    this.setState({
      productName
    });

    let modal = document.querySelector('.modal-q');

    modal.style.display = 'block';

    let closeBtn = document.querySelector('.close-btn');

    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  submitQuestion(e) {
    e.preventDefault();

    let question = document.getElementById('modal-question').value;
    let name = document.getElementById('modal-question-nickname').value;
    let email = document.getElementById('modal-question-email').value;

    let tracker = {
      question,
      name,
      email
    };

    if (!question || !name || !email || !email.includes('@')) {
      let string = 'You must enter the following: ';

      for (let key in tracker) {
        if (!tracker[key]) {
          string += `${key}, `;
        }
      }

      string = string.slice(0, -2);

      let string2;

      if (!email.includes('@') && email) {
        string2 = '. Your email must also be formatted correctly';
      }

      if (string.length === 28) {
        alert('Your email must be formatted correctly');
      } else if (string2) {
        alert(string + string2);
      } else {
        alert(string);
      }

      return;
    }


    let modal = document.querySelector('.modal-q');
    modal.style.display = 'none';

    let formElement = document.querySelector('#add-question');
    let formData = new FormData(formElement);

    let data = {};

    for (let [key, value] of formData) {
      data[key] = value;
    }

    data['product_id'] = this.state.currProductId;

    axios({
      method: 'POST',
      url: '/addQuestion',
      data: {
        auth: QAconfig.GITHUB,
        data
      }
    })
      .then(response => {
        document.getElementById('modal-question').value = '';
        document.getElementById('modal-question-nickname').value = '';
        document.getElementById('modal-question-email').value = '';
        this.getQuestions();
      })
      .catch(err => {
        console.log('add q axios error', err);
      });


  }

  loadMoreAnswers() {
    console.log('LOAD MORE ANSWERS clicked');
  }

  moreAnsweredQs() {
    console.log('MORE ANSWERED QUESTIONS clicked');
  }

  render() {
    return (
      <div id="qa-list">{this.state.questions.map((q, i) => {

        if (q.answers) {
          let answers = [];
          let sellerAnswers = [];

          for (var key in q.answers) {
            if (q.answers[key].answerer_name === 'Seller') {
              sellerAnswers.push(q.answers[key]);
            } else {
              answers.push(q.answers[key]);
            }
          }

          answers.sort((a, b) => {
            return b.helpfulness - a.helpfulness;
          });

          sellerAnswers.sort((a, b) => {
            return b.helpfulness - a.helpfulness;
          });

          answers = sellerAnswers.concat(answers);

          return (
            <div key={q.question_date + i} className="qa" id="list">
              <div className="question">Q: {q.question_body}</div>

              <div>{answers.map(a => {
                let ISOdate = new Date(a.date);
                let month = ISOdate.toLocaleString('default', { month: 'long'});
                let day = ISOdate.getDate();
                let year = ISOdate.getFullYear();

                let date = `${month} ${day}, ${year}`;

                let aName = a.answerer_name;

                if (aName === 'Seller') {
                  aName = '<b>Seller</b>';
                }

                return (
                  <div className="answer-container" key={a.id}>

                    <div className="answer" key={a.body}>A: {a.body}</div>
                    <div className="answer-photos">{a.photos.map((photo, i) => {
                      return (
                        <img src={photo} width="50px" height="50px" key={i}></img>
                      );
                      // return (
                      //   <img src={photo} width="50px" height="50px" key={i}></img>
                      // );
                    })}</div>

                    <div className="signature-helpful-report">
                      <div>by&nbsp;</div>
                      <div className="author-date" dangerouslySetInnerHTML={{__html: aName}}></div>
                      <div>, {date} | Helpful?&nbsp;</div>
                      <div className="answer-helpful" onClick={this.answerHelpful} answer_id={a.id}>Yes ({a.helpfulness}) |&nbsp;</div>
                      <div className="report-answer" onClick={this.answerReport} answer_id={a.id}>Report</div>
                    </div>

                  </div>
                );
              })}</div>

              <div className="qhelpful-addanswer">
                <div>Helpful?&nbsp;</div>
                <div className="question-helpful" onClick={this.questionHelpful} question_id={q.question_id}>Yes ({q.question_helpfulness}) |&nbsp;</div>
                <div className="add-answer" onClick={this.addAnswer} question_id={q.question_id} question_body={q.question_body}>Add Answer</div>
              </div>

            </div>
          );
        }
      })}

      <div id="load-more-answers" onClick={this.loadMoreAnswers}>LOAD MORE ANSWERS</div>

      <div className="qa" id="buttons">
        <button id="more-answered-qs" onClick={this.moreAnsweredQs}>MORE ANSWERED QUESTIONS</button>
        <button id="addq" onClick={this.addQuestion}>ADD A QUESTION +</button>
      </div>

      <div className="modal">
        <div className="modal-content">
          <span className="close-btn">&times;</span>
          <p>Submit Answer</p>
          <div className="subtitle">{this.state.productName}: {this.state.questionBody}</div>
          <form id="add-answer">
            <label>Your answer:</label>
            <textarea id="modal-answer" name="body" maxLength="1000"></textarea>
            <label>What is your nickname:</label>
            <input type="text" id="modal-answer-nickname" placeholder="Example: jack543!" name="name" maxLength="50"/>
            <div>For privacy reasons, do not use your full name or email address</div>
            <label>Your email:</label>
            <input type="text" id="modal-answer-email" placeholder="Example: jack@email.com" name="email" maxLength="60"/>
            <div>For authentication reasons, you will not be emailed</div>
            <div className="modal-answer-photos">{this.state.photos.map((photo, i) => {
              return (
                <img src={`http://localhost:3000/photos/${photo.filename}`} width="50px" height="50px" key={i}></img>
              );
            })}</div>
            <label>Upload photos:</label>
            <input type="file" id="modal-photos" name="photos" onChange={this.uploadPhotos}/>
            <button onClick={this.submitAnswer}>Submit answer</button>
          </form>
        </div>
      </div>

      <div className="modal-q">
        <div className="modal-content">
          <span className="close-btn">&times;</span>
          <p>Ask Your Question</p>
          <div className="subtitle">About the {this.state.productName}</div>
          <form id="add-question">
            <label>Your Question:</label>
            <textarea id="modal-question" name="body" maxLength="1000"></textarea>
            <label>What is your nickname:</label>
            <input type="text" id="modal-question-nickname" placeholder="Example: jackson11!" name="name" maxLength="60"/>
            <div>For privacy reasons, do not use your full name or email address</div>
            <label>Your email:</label>
            <input type="text" id="modal-question-email" placeholder="Why did you like the product or not" name="email" maxLength="60"/>
            <div>For authentication reasons, you will not be emailed</div>
            <button onClick={this.submitQuestion}>Submit question</button>
          </form>
        </div>
      </div>

      </div>
    );
  }
}

export default QAList;