"use client";

import { Lexend } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { api } from "../convex/_generated/api";
import convex from "../lib/convexClient"; // Convex client import
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

// EditableCell component for inline editing
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

// JobApplications component to handle job list, sorting, editing, adding, and deleting rows
const JobApplications = ({
  jobApplications,
  onAddJobApplication,
  onUpdateJobApplication,
  onDeleteJobApplication,
}) => {
  const [sortColumn, setSortColumn] = useState("role"); // Sorting by role by default
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnId }
  const [data, setData] = useState(jobApplications);
  const [isAdding, setIsAdding] = useState(false); // To track if adding a new row
  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    status: "",
    jobDescriptionLink: "",
    applicationDate: "",
    dueDate: "",
    lastActionDate: "",
  });

  const statusOptions = [
    "Applied",
    "Pending Interview",
    "Pending Decision",
    "Received Offer",
    "Rejected",
  ];
  

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

  const statusColors: Record<string, string> = {
    Applied: "#073B4C",
    "Pending Interview": "#073B4C",
    "Pending Decision": "#073B4C",
    "Received Offer": "#06D6A0",
    Rejected: "#EF476F",
  };

  const handleCellChange = (rowIndex, columnId, newValue) => {
    const updatedData = [...data];
    updatedData[rowIndex][columnId] = newValue;
    setData(updatedData);
    setEditingCell(null); // End editing mode

    // Call parent handler to update job applications globally and save to database
    onUpdateJobApplication(updatedData[rowIndex], rowIndex);
  };

  const handleCellClick = (rowIndex, columnId) => {
    if (
      editingCell &&
      editingCell.rowIndex === rowIndex &&
      editingCell.columnId === columnId
    ) {
      return; // Already editing this cell
    }
    setEditingCell({ rowIndex, columnId });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();

    // Add the new job to the data
    const updatedData = [...data, newJob];
    setData(updatedData);

    // Save the new job to the database
    await onAddJobApplication(newJob); // Call the parent to update the global state

    setIsAdding(false); // Hide input fields after adding
    setNewJob({
      company: "",
      role: "",
      status: "",
      jobDescriptionLink: "",
      applicationDate: "",
      dueDate: "",
      lastActionDate: "",
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
            <th onClick={() => handleSort("role")}>
              Job Role {renderSortIcon("role")}
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
            <th>Actions</th> {/* Added Actions column for deleting */}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((job, index) => (
            <tr key={index}>
              <td onClick={() => handleCellClick(index, "company")}>
                <EditableCell
                  value={job.company}
                  onChange={(newValue) =>
                    handleCellChange(index, "company", newValue)
                  }
                  isEditing={
                    editingCell?.rowIndex === index &&
                    editingCell?.columnId === "company"
                  }
                />
              </td>
              <td onClick={() => handleCellClick(index, "role")}>
                <EditableCell
                  value={job.role}
                  onChange={(newValue) =>
                    handleCellChange(index, "role", newValue)
                  }
                  isEditing={
                    editingCell?.rowIndex === index &&
                    editingCell?.columnId === "role"
                  }
                />
              </td>
              <td>
                <a
                  href={job.jobDescriptionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Job
                </a>
              </td>
              <td onClick={() => handleCellClick(index, "applicationDate")}>
                <EditableCell
                  value={new Date(job.applicationDate).toLocaleDateString()}
                  onChange={(newValue) =>
                    handleCellChange(index, "applicationDate", newValue)
                  }
                  isEditing={
                    editingCell?.rowIndex === index &&
                    editingCell?.columnId === "applicationDate"
                  }
                />
              </td>
              <td onClick={() => handleCellClick(index, "dueDate")}>
                <EditableCell
                  value={
                    job.dueDate
                      ? new Date(job.dueDate).toLocaleDateString()
                      : "N/A"
                  }
                  onChange={(newValue) =>
                    handleCellChange(index, "dueDate", newValue)
                  }
                  isEditing={
                    editingCell?.rowIndex === index &&
                    editingCell?.columnId === "dueDate"
                  }
                />
              </td>
              <td onClick={() => handleCellClick(index, "lastActionDate")}>
                <EditableCell
                  value={
                    job.lastActionDate
                      ? new Date(job.lastActionDate).toLocaleDateString()
                      : "N/A"
                  }
                  onChange={(newValue) =>
                    handleCellChange(index, "lastActionDate", newValue)
                  }
                  isEditing={
                    editingCell?.rowIndex === index &&
                    editingCell?.columnId === "lastActionDate"
                  }
                />
              </td>
              <td
                style={{
                  backgroundColor: statusColors[job.status],
                  color: "white",
                }}
              >
                {job.status}
              </td>
              <td>
                {/* Delete button to trigger onDeleteJobApplication */}
                <button
                  type="button"
                  onClick={() => onDeleteJobApplication(job)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Row for adding a new job */}
          {/* Row for adding a new job */}
          {!isAdding ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setIsAdding(true)} style={{ padding: '10px', cursor: 'pointer' }}>
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
                  onChange={(e) =>
                    setNewJob({ ...newJob, company: e.target.value })
                  }
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Role"
                  value={newJob.role}
                  onChange={(e) =>
                    setNewJob({ ...newJob, role: e.target.value })
                  }
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Job Description Link"
                  value={newJob.jobDescriptionLink}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      jobDescriptionLink: e.target.value,
                    })
                  }
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.applicationDate}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      applicationDate: e.target.value,
                    })
                  }
                  required
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.dueDate}
                  onChange={(e) =>
                    setNewJob({ ...newJob, dueDate: e.target.value })
                  }
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newJob.lastActionDate}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      lastActionDate: e.target.value,
                    })
                  }
                />
              </td>
              <td>
                <select
                  value={newJob.status}
                  onChange={(e) =>
                    setNewJob({ ...newJob, status: e.target.value })
                  }
                  required
                >
                  {statusOptions.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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

// Simulate fetching job data dynamically
const fetchJobApplications = async (email) => {
  const result = await convex?.query(api.myFunctions.getApplications, {
    email,
  });
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
          const data = await fetchJobApplications(
            user.primaryEmailAddress?.emailAddress
          );
          setJobApplications(data);
        } catch (error) {
          console.error("Error fetching job data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
    const heartbeatPeriod = 1000 * 5;
    const intervalId = setInterval(() => {
      fetchData()
        .then(() => {})
        .catch((error) => {
          console.error("Error fetching job data:", error);
        });
    }, heartbeatPeriod);
    return () => clearInterval(intervalId);
  }, [isSignedIn, user]);

  const handleAddJobApplication = async (newJob) => {
    try {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error("User email not found");

      const jobWithEmail = {
        ...newJob,
        email, // Add email to job
      };

      console.log("Adding job:", jobWithEmail);
      await convex?.mutation(
        api.myFunctions.upsertJobApplication,
        jobWithEmail
      );
      setJobApplications([...jobApplications, jobWithEmail]);
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  const handleUpdateJobApplication = async (updatedJob, index) => {
    try {
      const oldJob = jobApplications[index];

      if (
        oldJob.email !== updatedJob.email ||
        oldJob.company !== updatedJob.company ||
        oldJob.role !== updatedJob.role
      ) {
        await convex?.mutation(api.myFunctions.deleteJobApplication, oldJob);
      }

      await convex?.mutation(api.myFunctions.upsertJobApplication, updatedJob);

      const updatedApplications = [...jobApplications];
      updatedApplications[index] = updatedJob;
      setJobApplications(updatedApplications);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJobApplication = async (oldJob) => {
    try {
      await convex?.mutation(api.myFunctions.deleteJobApplication, oldJob);
      setJobApplications(jobApplications.filter((job) => job !== oldJob));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
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
          <JobApplications
            jobApplications={jobApplications}
            onAddJobApplication={handleAddJobApplication}
            onUpdateJobApplication={handleUpdateJobApplication}
            onDeleteJobApplication={handleDeleteJobApplication}
          />
        ) : (
          <JobApplications
            jobApplications={jobApplications}
            onAddJobApplication={handleAddJobApplication}
            onUpdateJobApplication={handleUpdateJobApplication}
            onDeleteJobApplication={handleDeleteJobApplication}
          />
        )}
      </div>
    </div>
  );
}
