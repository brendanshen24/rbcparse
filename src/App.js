import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null,
        loaded:0
      }
   
  }
  checkMimeType=(event)=>{
    //getting file object
    let files = event.target.files 
    //define message container
    let err = []
    // list allow mime type
   const types = ['application/pdf']
    // loop access array
    for(var x = 0; x<files.length; x++) {
     // compare file type find doesn't matach
         if (types.every(type => files[x].type !== type)) {
         // create error message and assign to container
             err[x] = 'Only pdf files are supported.';
         //err[x] = files[x].type+' is not a supported format\nOnly pdf files are supported.';
       }
     };
     for(var z = 0; z<err.length; z++) {// if message not same old that mean has error 
         // discard selected file
        toast.error(err[z])
        event.target.value = null
    }
   return true;
  }
  maxSelectFile=(event)=>{
    let files = event.target.files
        if (files.length > 3) {
           const msg = 'Only 3 can be uploaded at a time'
           event.target.value = null
           toast.warn(msg)
           return false;
      }
    return true;
 }
 checkFileSize=(event)=>{
  let files = event.target.files
  let size = 2000000 
  let err = []; 
  for(var x = 0; x<files.length; x++) {
  if (files[x].size > size) {
   err[x] = files[x].type+'is too large, please pick a smaller file\n';
 }
};
for(var z = 0; z<err.length; z++) {// if message not same old that mean has error 
  // discard selected file
 toast.error(err[z])
 event.target.value = null
}
return true;
}

  onClickHandler = () => {
    const data = new FormData()
      if (this.state.selectedFile != null){
          for(var x = 0; x<this.state.selectedFile.length; x++) {
              data.append('file', this.state.selectedFile[x])
          }
          axios.post("http://localhost:8000/upload", data, {
              onUploadProgress: ProgressEvent => {
                  this.setState({
                      loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
                  })
              },
          })
              .then(res => { // then print response status
                  toast.success('Upload Successful!')
              })
              .catch(err => { // then print response status
                  toast.error('Upload failed! Check server status!')
              })
      }
    }
    onClick2Handler = () => {
      const data = 'del'
            axios.post("http://localhost:8081/delete", data, {
                onUploadProgress: ProgressEvent => {
                    this.setState({
                        loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
                    })
                },
            })
                .then(res => {
                })
                .catch(err => {
                })

    }
    onChangeHandler=event=>{
        var files = event.target.files
        if(this.maxSelectFile(event) && this.checkMimeType(event) && this.checkFileSize(event)){
            // if return true allow to setState
            this.setState({
                selectedFile: files,
                loaded:0
            })
        }

    }

  render() {
    return (
      <div class="container">
	      <div class="row">
      	  <div class="offset-md-3 col-md-6">
               <div class="form-group files">
                   <h1>RBC PDF To CSV Converter</h1>
                <p>Upload Your PDF File </p>
                <input type="file" class="form-control" multiple onChange={this.onChangeHandler}/>
              </div>  
              <div class="form-group">
              <ToastContainer />
              <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded,2) }%</Progress>
        
              </div> 
              
              <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
              <a type="button" class="btn btn-success btn-block" onClick={this.onClick2Handler} href='/convert.csv' download>Download CSV</a>
	      </div>

      </div>
      </div>
    );
  }
}

export default App;
