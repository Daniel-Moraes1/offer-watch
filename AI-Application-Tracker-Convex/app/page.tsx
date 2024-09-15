"use client";

import { Lexend } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { api } from "../convex/_generated/api";
import convex from "../lib/convexClient";
import "./globals.css";

const lexend = Lexend({
  subsets: [],
  display: "swap",
});

// Helper function to sort based on the selected column and order
const sortData = (data, sortColumn, sortDirection) => {
  return [...data].sort((a, b) => {
    if (!a[sortColumn]) return 1;
    if (!b[sortColumn]) return -1;

    const valueA = a[sortColumn].toLowerCase
      ? a[sortColumn].toLowerCase()
      : a[sortColumn];
    const valueB = b[sortColumn].toLowerCase
      ? b[sortColumn].toLowerCase()
      : b[sortColumn];

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// EditableCell component
const EditableCell = ({ value, onChange, isEditing }) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus(); // Focus on input when editing starts
    }
  }, [isEditing]);

  const handleBlur = () => {
    onChange(tempValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(tempValue);
    }
  };

  return isEditing ? (
    <input
      type="text"
      ref={inputRef}
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  ) : (
    <span>{value || "N/A"}</span>
  );
};

// JobApplications component with editable cells and adding new row functionality
const JobApplications = ({ jobApplications, onAddJobApplication, onUpdateJobApplication }) => {
  const [sortColumn, setSortColumn] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnId }
  const [data, setData] = useState(jobApplications);
  const [isAdding, setIsAdding] = useState(false); // To track if adding a new row
  const [newJob, setNewJob] = useState({
    company: "",
    title: "",
    jobDescriptionLink: "",
    applicationDate: "",
    dueDate: "",
    lastActionDate: "",
    status: "",
  });

  useEffect(() => {
    setData(jobApplications); // Ensure `data` updates when `jobApplications` prop changes
  }, [jobApplications]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = sortData(data, sortColumn, sortDirection);

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const statusColors = {
    applied: "#118AB2",
    pending: "#6fadfd",
    rejected: "#EF476F",
    accepted: "#06D6A0",
  };

  const handleCellChange = (rowIndex, columnId, newValue) => {
    const updatedData = [...data];
    updatedData[rowIndex][columnId] = newValue;
    setData(updatedData);
    setEditingCell(null); // End editing mode

    // Call parent handler to update job applications globally
    onUpdateJobApplication(updatedData[rowIndex], rowIndex);
  };

  const handleCellClick = (rowIndex, columnId) => {
    if (editingCell && editingCell.rowIndex === rowIndex && editingCell.columnId === columnId) {
      return; // Already editing this cell
    }
    setEditingCell({ rowIndex, columnId });
  };

  const handleAddJob = (e) => {
    e.preventDefault();

    // Add the new job to the data
    const updatedData = [...data, newJob];
    setData(updatedData);
    onAddJobApplication(newJob); // Call the parent to update the global state

    setIsAdding(false); // Hide input fields after adding
    setNewJob({
      company: "",
      title: "",
      jobDescriptionLink: "",
      applicationDate: "",
      dueDate: "",
      lastActionDate: "",
      status: "",
    });
  };

  return (
    <form onSubmit={handleAddJob}>
      <table border={1} rules="rows">
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th onClick={() => handleSort("company")}>
              Company Name {renderSortIcon("company")}
            </th>
            <th onClick={() => handleSort("title")}>
              Job Title {renderSortIcon("title")}
            </th>
            <th>Job Description</th>
            <th onClick={() => handleSort("applicationDate")}>
              Application Date {renderSortIcon("applicationDate")}
            </th>
            <th onClick={() => handleSort("dueDate")}>
              Due Date {renderSortIcon("dueDate")}
            </th>
            <th onClick={() => handleSort("lastActionDate")}>
              Last Action Date {renderSortIcon("lastActionDate")}
            </th>
            <th onClick={() => handleSort("status")}>
              Status {renderSortIcon("status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((job, index) => (
            <tr key={index}>
              <td onClick={() => handleCellClick(index, "company")}>
                <EditableCell
                  value={job.company}
                  onChange={(newValue) => handleCellChange(index, "company", newValue)}
                  isEditing={editingCell?.rowIndex === index && editingCell?.columnId === "company"}
                />
              </td>
              <td onClick={() => handleCellClick(index, "title")}>
                <EditableCell
                  value={job.title}
                  onChange={(newValue) => handleCellChange(index, "title", newValue)}
                  isEditing={editingCell?.rowIndex === index && editingCell?.columnId === "title"}
                />
              </td>
              <td>
                <a href={job.jobDescriptionLink} target="_blank" rel="noopener noreferrer">
                  View Job
                </a>
              </td>
              <td onClick={() => handleCellClick(index, "applicationDate")}>
                <EditableCell
                  value={new Date(job.applicationDate).toLocaleDateString()}
                  onChange={(newValue) => handleCellChange(index, "applicationDate", newValue)}
                  isEditing={editingCell?.rowIndex === index && editingCell?.columnId === "applicationDate"}
                />
              </td>
              <td onClick={() => handleCellClick(index, "dueDate")}>
                <EditableCell
                  value={job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "N/A"}
                  onChange={(newValue) => handleCellChange(index, "dueDate", newValue)}
                  isEditing={editingCell?.rowIndex === index && editingCell?.columnId === "dueDate"}
                />
              </td>
              <td onClick={() => handleCellClick(index, "lastActionDate")}>
                <EditableCell
                  value={job.lastActionDate ? new Date(job.lastActionDate).toLocaleDateString() : "N/A"}
                  onChange={(newValue) => handleCellChange(index, "lastActionDate", newValue)}
                  isEditing={editingCell?.rowIndex === index && editingCell?.columnId === "lastActionDate"}
                />
              </td>
              <td style={{ backgroundColor: statusColors[job.status.toLowerCase()], color: "white" }}>
                {job.status}
              </td>
            </tr>
          ))}

          {/* Row for adding a new job */}
          {!isAdding ? (
            <tr>
              <td colSpan="6"></td>
              <td>
                <button type="button" onClick={() => setIsAdding(true)}>
                  +
                </button>
              </td>
            </tr>
          ) : (
            <tr>
              <td>
                <input
                  type="text"
                  placeholder="Company"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Job Description Link"
                  value={newJob.jobDescriptionLink}
                  onChange={(e) => setNewJob({ ...newJob, jobDescriptionLink: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.applicationDate}
                  onChange={(e) => setNewJob({ ...newJob, applicationDate: e.target.value })}
                  required
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.dueDate}
                  onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.lastActionDate}
                  onChange={(e) => setNewJob({ ...newJob, lastActionDate: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Status"
                  value={newJob.status}
                  onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                  required
                />
              </td>
              <td>
                <button type="submit">Add</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </form>
  );
};

const fetchJobApplications = async (email) => {
  const result = await convex.query(api.myFunctions.getApplications, { email });
  return result;
};

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn && user?.id) {
        setLoading(true);
        try {
          const data = await fetchJobApplications(user.primaryEmailAddress?.emailAddress);
          setJobApplications(data);
        } catch (error) {
          console.error("Error fetching job data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isSignedIn, user]);

  const handleAddJobApplication = (newJob) => {
    setJobApplications([...jobApplications, newJob]); // Add new job to the local state
  };

  const handleUpdateJobApplication = (updatedJob, index) => {
    const updatedApplications = [...jobApplications];
    updatedApplications[index] = updatedJob;
    setJobApplications(updatedApplications);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <div
      style={{
        height: "100%",
        overflow: "clip",
        padding: 0,
        margin: 0,
      }}
      className={`page-container ${lexend.className}`}
    >
      <h1
        style={{
          height: "80px",
          fontWeight: 800,
          fontSize: 28,
          paddingTop: 40,
          paddingLeft: 30,
          paddingRight: 30,
          color: "white",
        }}
      >
        Welcome, {user?.firstName}!
      </h1>
      <div
        className="applications-container"
        style={{ margin: 30, marginTop: 10 }}
      >
        {jobApplications.length === 0 ? (
          <p>No job applications found.</p>
        ) : (
          <JobApplications
            jobApplications={jobApplications}
            onAddJobApplication={handleAddJobApplication}
            onUpdateJobApplication={handleUpdateJobApplication}
          />
        )}
      </div>
    </div>
  );
}
