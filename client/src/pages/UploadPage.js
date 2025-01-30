import React, { useState } from "react";
import { parsePDF, saveParsedData, verifyPhoneNumberAPI } from "../utils/api";
import { Link } from "react-router-dom";
import { dischargeFields } from "../utils/constants";
import "../styles/UploadPage.css";

export default function UploadPage() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    setIsLoading(true);

    try {
      const data = await parsePDF(uploadedFile);
      setParsedData(data);
    } catch (error) {
      setError(error.error || "Failed to process PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedData = [...parsedData];
    updatedData[index][field] = value;
    setParsedData(updatedData);
  };

  const verifyPhoneNumber = async (index) => {
    const phone_number = parsedData[index].phone_number;
    try {
      const result = await verifyPhoneNumberAPI(phone_number);
      if (result.valid) {
        handleInputChange(index, "phone_number", result.formatted);
        alert("Phone number verified and updated!");
      } else {
        alert("Invalid phone number");
      }
    } catch (error) {
      setError(error);
    }
  };

  const saveData = async () => {
    if (!parsedData) return;
    setIsLoading(true);

    try {
      await saveParsedData(parsedData);
      setParsedData(null);
      alert("Data saved successfully!");
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <h1>Welcome to the Discharge Management App</h1>
        <p>
          Easily manage patient discharges by uploading PDF reports.
          Review, edit, verify, and enrich details before saving to the database.
        </p>
        <nav>
          <Link to="/discharges" className="nav-link">View Discharges</Link>
        </nav>
      </header>

      {/* Upload Section */}
      <section className="upload-container">
        <h2>Upload a Discharges Report PDF</h2>
        <input type="file" accept=".pdf" onChange={handleFileUpload} />
        {isLoading && <p>Processing file...</p>}
        {!isLoading && parsedData && parsedData.length === 0 && <p>No data found in the PDF.</p>}
        {error && <p className="error">{error.message}</p>}
      </section>

      {/* Parsed Data Review Section */}
      {parsedData && parsedData.length > 0 && !isLoading && !error && (
        <section className="review-container">
          <h2>Review and Edit Parsed Data</h2>
          <button onClick={saveData}>Save to Database</button>
          <table className="parsed-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Epic ID</th>
                <th>Phone Number</th>
                <th>Attending Physician</th>
                <th>Date</th>
                <th>Primary Care Provider</th>
                <th>Insurance</th>
                <th>Disposition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(parsedData) && parsedData.map((entry, index) => (
                <tr key={index}>
                  {dischargeFields.map(field => (
                    <td key={field.key}>
                      <input
                        type="text"
                        value={entry[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(index, field.key, e.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => verifyPhoneNumber(index)}>
                      Verify Phone
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
