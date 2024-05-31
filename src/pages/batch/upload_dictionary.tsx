import React, { useState } from "react";
import axios from "axios";
import "./DictionaryUpload.scss";
import { useNavigate } from "react-router-dom";

const DictionaryUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const selectFile = () => {
    document.getElementById("file-input")?.click();
  };

  const uploadFile = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus(null);
      setUploadMessage(null);
      setLoading(true);

      try {
        const response = await axios.post(
          "https://mocarps.azurewebsites.net/dictionary/upload",
          formData
        );
        if (response.status !== 200) {
          setUploadStatus("error");
          let errorMessage = response.data.message + "\n";
          response.data.log.forEach((item: any) => {
            errorMessage += `Title: ${item.title}, Error: ${item.error}\n`;
          });
          setUploadMessage(errorMessage);
        } else {
          setUploadStatus("success");
          setUploadMessage(response.data.message);
        }
      } catch (error: any) {
        setUploadStatus("error");
        setUploadMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="container">
      <div id="template-container">
        <h3>Dictionary Batch Upload Template</h3>
        <a>* Compulsory field</a>
        <button onClick={() => navigate("/dictionary")}>Return</button>
        <table id="data-table">
          <thead>
            <tr>
              <th>title *</th>
              <th>keyword *</th>
              <th>description</th>
              <th>example</th>
              <th>resourceName</th>
              <th>resourceType</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>demo_1</td>
              <td>demo_1</td>
              <td>demo_1</td>
              <td>demo_1</td>
              <td>demo1.png</td>
              <td>image</td>
            </tr>
            <tr>
              <td>demo_2</td>
              <td>demo_2</td>
              <td>demo_2</td>
              <td>demo_2</td>
              <td>demo2.png</td>
              <td>image</td>
            </tr>
          </tbody>
        </table>
        <a
          href="https://mocarpsassets.blob.core.windows.net/files/Dictionary.zip"
          download
          id="template-container-message"
        >
          Download Template .zip File
        </a>
      </div>
      <div id="upload-container" onClick={selectFile}>
        <i id="upload-icon" className="fas fa-cloud-upload-alt"></i>
        <p>Browse Zip File to Upload</p>
        <input
          type="file"
          id="file-input"
          onChange={(e) => uploadFile(e.target.files)}
          accept="application/zip"
          style={{ display: "none" }}
        />
      </div>
      {loading && (
        <div id="loading">
          <div id="spinner"></div>
        </div>
      )}
      {uploadStatus && (
        <div id="upload-status">
          {uploadStatus === "success" && (
            <i id="upload-success-icon" className="fas fa-check-circle"></i>
          )}
          {uploadStatus === "error" && (
            <i id="upload-error-icon" className="fas fa-exclamation-circle"></i>
          )}
          <p id="upload-message">{uploadMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DictionaryUpload;
