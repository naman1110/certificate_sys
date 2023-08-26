import React, { useState } from 'react';
import './isuance.css';
import { Link } from 'react-router-dom';

function VerifyForm() {
  const [selectedFile, setSelectedFile] = useState(null);
 

  const handleFileChange = async (event) => {
     setSelectedFile( await event.target.files[0]);
    console.log(selectedFile,"hello");
  };

  const handleSubmit = async (event) => {
  
    event.preventDefault();
    console.log(selectedFile);
    const formData =  new FormData();
    
    formData.append('pdfFile', selectedFile);
    
    
    
    try {
      const response = await fetch('http://localhost:8000/api/verify', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {

       alert("Verified:Certificate is valid");
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

  return (<> 
  
          <nav className="nav-links">
            <Link className="nav-link" to="/">Issue</Link>
            <Link className="nav-link" to="/verify">Verify</Link> 
          </nav>
         <div className="issuer-container">
          <h1>Verify Certificate</h1>
          <form onSubmit={handleSubmit}>
            <h3>Upload File:To verify</h3>
            <input type="file" accept="application/pdf" name="image" onChange={handleFileChange}  />
            <br />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
        </>
  );
}

export default VerifyForm;
