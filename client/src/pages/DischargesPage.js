import React, { useState, useEffect } from "react";
import { fetchDischarges } from "../utils/api";
import { Link } from "react-router-dom";
import { dischargeFields } from "../utils/constants";
import "../styles/DischargesPage.css";

export default function DischargesPage() {
  const [discharges, setDischarges] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // New: Items per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadDischarges = async () => {
      const { data, totalPages } = await fetchDischarges(page, itemsPerPage, sortField, sortOrder);
      setDischarges(data);
      setTotalPages(totalPages);
    };

    loadDischarges();
  }, [page, itemsPerPage, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Patient Discharges</h1>
        <p>View, sort, and manage discharged patient records.</p>
        <nav>
          <Link to="/" className="nav-link">Back to Upload</Link>
        </nav>
      </header>

      {/* Table */}
      <section className="discharges-container">
        <h2>Discharge Records</h2>

        {/* Pagination UI */}
        <div className="pagination">
          {/* Page Controls */}
          <div className="page-controls">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ⬅ Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              Next ➡
            </button>
          </div>
          
          {/* Items Per Page Selector */}
          <div className="items-per-page">
            <label>Items per page:</label>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        <table className="discharges-table">
          <thead>
            <tr>
              {dischargeFields.map(({ key, label }) => (
                <th key={key} onClick={() => handleSort(key)}>
                  {label} {sortField === key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discharges && discharges.length > 0 ? (
              discharges.map((discharge, index) => (
                <tr key={index}>
                  <td>{discharge.name}</td>
                  <td>{discharge.epic_id}</td>
                  <td>{discharge.phone_number}</td>
                  <td>{discharge.attending_physician}</td>
                  <td>{discharge.date}</td>
                  <td>{discharge.primary_care_provider}</td>
                  <td>{discharge.insurance}</td>
                  <td>{discharge.disposition}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No discharge records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
