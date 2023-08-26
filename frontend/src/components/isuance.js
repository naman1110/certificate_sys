import React, { useState } from 'react';
import './isuance.css';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

function CertificateForm() {
  const [selectedFile, setSelectedFile] = useState(null);
 

  const handleFileChange = async (event) => {
     setSelectedFile( await event.target.files[0]);
   
  };

  const handleSubmit = async (event) => {
  
    event.preventDefault();
    console.log(selectedFile);
    const formData =  new FormData();
    
    formData.append('pdfFile', selectedFile);
    formData.append('certificateId', event.target.certificateId.value);
    formData.append('name', event.target.name.value);
    formData.append('courseName', event.target.courseName.value);
    formData.append('issueDate', event.target.issueDate.value);
    formData.append('issuerAuthority', event.target.issuerAuthority.value);
    
    console.log(event.target.issuerAuthority.value);
    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });
      console.log(response.status, response.headers);
      if (response.ok) {
     
      
      // const pdfBlob = await response.blob();
      response.arrayBuffer().then(buffer => {
        console.log(buffer);
        const uint8Array = new Uint8Array(buffer);
        console.log(uint8Array);
        const pdfBlob =  new Blob([uint8Array], {type: 'application/pdf'});
        console.log(pdfBlob.size);
        saveAs(pdfBlob, 'certificate.pdf') ;
        // Process uint8array
      })
    
      
      
     
      
       
 
        console.log('File uploaded successfully!');
      } else {
        // Handle error response
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error('Error uploading file:', error.message);
    }
  };

  return (
    <>
      <nav className="nav-links">
      <Link className="nav-link" to="/">Issue</Link>
      <Link className="nav-link" to="/verify">Verify</Link> 
    </nav>
    <div className="issuer-container">

      <h1>Issue Certificate</h1>
      <form onSubmit={handleSubmit}>
        <h3>Upload File:</h3>
        <input type="file" accept="application/pdf" name="image" onChange={handleFileChange}  />
        <h3>Text Inputs:</h3>
        <div className="form-row">
          <div>
        <label htmlFor="certificateId">Certificate ID:</label>
        <input
          type="number"
          name="certificateId"
          placeholder="Certificate ID"
          required
        /></div>
        <div>
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" placeholder="Name" required />
        </div>
        <div>
        <label htmlFor="courseName">Course Name:</label>
        <input type="text" name="courseName" placeholder="Course Name" required />
        </div>
        <div>
        <label htmlFor="issueDate">Issue Date:</label>
        <input type="text" name="issueDate" placeholder="Issue Date" required />
        </div>
        <div>
        <label htmlFor="issuerAuthority">Issuer Authority:</label>
        <input
          type="text"
          name="issuerAuthority"
          placeholder="Issuer Authority"
          required
        />
        </div>
        <br />
        <br />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    </>
  );
}

export default CertificateForm;
