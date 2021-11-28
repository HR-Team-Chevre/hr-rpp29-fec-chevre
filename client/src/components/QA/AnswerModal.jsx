import React from 'react';
import withTracker from './QATrackerHOC';
import API from './QAAPIUtils';

class AnswerModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photos: [],
      questionId: this.props.questionId
    };

    this.submitAnswer = this.submitAnswer.bind(this);
    this.uploadPhotos = this.uploadPhotos.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.handleModal = this.handleModal.bind(this);
  }

  clickHandler(e) {
    this.props.handleTrackingClick(e, e.currentTarget.className, 'Questions & Answers');
    this.props.openThumbnail(e);
  }

  uploadPhotos(e) {
    let photos = [];

    for (let key in e.target.files) {
      if (key !== 'length' && key !== 'item') {
        photos.push(URL.createObjectURL(e.target.files[key]));
      }
    }

    if (e.target.files.length > 5) {
      alert('You may only upload 5 images');
      e.target.value = '';
    } else {
      this.setState({
        photos
      });
    }
  }

  submitAnswer(e) {
    e.preventDefault();

    const answer = document.getElementById('modal-answer').value;
    const name = document.getElementById('modal-answer-nickname').value;
    const email = document.getElementById('modal-answer-email').value;
    const photos = document.getElementById('modal-photos').files;

    let photoFileNames = [];

    for (let key in photos) {
      if (key !== 'item' && key !== 'length') {
        photoFileNames.push(photos[key].name);
      }
    }

    let tracker = {
      answer,
      name,
      email
    };

    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const emailValid = regexp.test(email);

    if (!answer || !name || !email || !emailValid) {
      let string = 'You must enter or address the following:\n';

      for (let key in tracker) {
        if (!tracker[key]) {
          string += `- ${key.slice(0, 1).toUpperCase() + key.slice(1)}\n`;
        }
      }

      if (email && !emailValid) {
        string += '- Your email must be formatted correctly\n';
      }

      if (!this.photosValid(photoFileNames)) {
        string += '- You may only upload .jpg, .jpeg, .bmp, .gif, and .png files';
      }

      alert(string);
      return;
    }

    this.handleModal('.modal');

    let formElement = document.querySelector('#add-answer');
    let formData = new FormData(formElement);
    formData.append('questionId', this.props.questionId);


    API.postAnswer(formData)
      .then(response => {
        document.getElementById('modal-answer').value = '';
        document.getElementById('modal-answer-nickname').value = '';
        document.getElementById('modal-answer-email').value = '';
        document.getElementById('modal-photos').value = '';
        this.setState({
          photos: []
        });
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

  photosValid(photos) {
    const validFileExtensions = ['.jpg', '.jpeg', '.bmp', '.png', '.gif'];

    for (let i = 0; i < photos.length; i++) {
      let fileName = photos[i];
      let valid = false;

      for (let j = 0; j < validFileExtensions.length; j++) {
        let currExtension = validFileExtensions[j];
        if (fileName.substr(fileName.length - currExtension.length, currExtension.length).toLowerCase() === currExtension.toLowerCase()) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        return false;
      }
    }

    return true;
  }

  render() {
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close-btn" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.className, 'Questions & Answers'); }}>&times;</span>
          <p>SUBMIT ANSWER</p>
          <div className="subtitle" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.className, 'Questions & Answers'); }}>{this.props.productName}: {this.props.questionBody}</div>
          <form id="add-answer">
            <label>Your answer:*&nbsp;</label>
            <textarea id="modal-answer" name="body" maxLength="1000" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}></textarea>
            <div className="modal-answer-photos">{this.state.photos.map((photo, i) => {
              return (
                <img src={photo} full={photo} width="70px" height="70px" key={i} className="answer-photo-thumbnail" onClick={this.clickHandler}></img>
              );
            })}</div>
            <label>What is your nickname:*&nbsp;</label>
            <input type="text" id="modal-answer-nickname" placeholder="Example: jack543!" name="name" maxLength="60" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}/>
            <div className="form-label">(For privacy reasons, do not use your full name or email address)</div>
            <br></br>
            <label>Your email:*&nbsp;</label>
            <input type="text" id="modal-answer-email" placeholder="Example: jane@email.com" name="email" maxLength="60" onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}/>
            <div className="form-label">(For authentication reasons, you will not be emailed)</div>
            <br></br>
            <label id="modal-photos-label">Upload photos:&nbsp;</label>
            <input type="file" multiple id="modal-photos" name="photos" onChange={this.uploadPhotos} onClick={(e) => { this.props.handleTrackingClick(e, e.currentTarget.id, 'Questions & Answers'); }}/>
            <button onClick={this.submitAnswer}>Submit answer</button>
          </form>
        </div>
      </div>
    );
  }
}

export {AnswerModal as TestableAnswerModal};

export default withTracker(AnswerModal);