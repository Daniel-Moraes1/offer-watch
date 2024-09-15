"use client";
import { Lexend } from "next/font/google";
import { useState, useEffect } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { api } from "../convex/_generated/api"; // Assuming Convex setup is correct
import convex from "../lib/convexClient";

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

const JobApplications = ({ jobApplications, onAddJobApplication }) => {
  const [sortColumn, setSortColumn] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState({
    company: "",
    title: "",
    jobDescriptionLink: "",
    applicationDate: "",
    dueDate: "",
    lastActionDate: "",
    status: "",
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = sortData(jobApplications, sortColumn, sortDirection);

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const handleAdd = (e) => {
    e.preventDefault();
    onAddJobApplication(newJob);
    setIsAdding(false);
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
    <form onSubmit={handleAdd}>
      <table border={1} rules={"rows"}>
        <thead>
          <tr>
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
              <td>{job.company}</td>
              <td>{job.title}</td>
              <td>
                <a
                  href={job.jobDescriptionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Job
                </a>
              </td>
              <td>{new Date(job.applicationDate).toLocaleDateString()}</td>
              <td>
                {job.dueDate
                  ? new Date(job.dueDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                {job.lastActionDate
                  ? new Date(job.lastActionDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>{job.status}</td>
            </tr>
          ))}

          {/* Add an empty row with a "+" button */}
          {!isAdding ? (
            <tr>
              <td colSpan='6'></td>
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
                  onChange={(e) =>
                    setNewJob({ ...newJob, company: e.target.value })
                  }
                  required
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Title"
                  value={newJob.title}
                  onChange={(e) =>
                    setNewJob({ ...newJob, title: e.target.value })
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
                <input
                  type="text"
                  placeholder="Status"
                  value={newJob.status}
                  onChange={(e) =>
                    setNewJob({ ...newJob, status: e.target.value })
                  }
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
  }, [isSignedIn, user]);

  const handleAddJobApplication = (newJob) => {
    setJobApplications([...jobApplications, newJob]);
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
          />
        )}
      </div>
    </div>
  );
}
