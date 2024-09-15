// app/page.tsx
"use client";
import { Lexend } from "next/font/google";
import { upsertJobApplication } from "../convex/myFunctions";
import convex from "../lib/convexClient";
import { mutation } from "../convex/_generated/server";
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";

import "./globals.css";
import { useState, useEffect } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";

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

const JobApplications = ({ jobApplications }) => {
  const [sortColumn, setSortColumn] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

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

  const statusColors: { [key: string]: string } = {
    applied: "#118AB2",
    "interview pending": "#6fadfd",
    rejected: "#EF476F",
    accepted: "#06D6A0",
  };

  return (
    <table border={1} rules={"rows"}>
      <thead style={{}}>
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
      </thead>

      <tbody style={{}}>
        {sortedData.map((job, index) => (
          <tr key={index}>
            <td>{job.company}</td>
            <td>{job.role !== "null" ? job.role : "N/A"}</td>
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
              {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : "N/A"}
            </td>
            <td>
              {job.lastActionDate
                ? new Date(job.lastActionDate).toLocaleDateString()
                : "N/A"}
            </td>
            <td
              style={{
                backgroundColor: statusColors[job.status.toLowerCase()],
                color: "white",
              }}
            >
              <span className={`status-badge ${job.status.toLowerCase()}`}>
                {job.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Simulate fetching job data dynamically (mocked for now)
const fetchJobApplications = async (email) => {
  console.log("testx2");
  const result = await convex.query(api.myFunctions.getApplications, {
    email,
  });
  return result;
};

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("something");
    const fetchData = async () => {
      if (isSignedIn && user?.id) {
        setLoading(true);
        try {
          const data = await fetchJobApplications(
            user.primaryEmailAddress?.emailAddress
          ); // Pass user email to fetchJobApplications
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

  if (!isLoaded) {
    return <div>Loading...</div>; // Wait for Clerk to load user info
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />; // Redirect to sign-in page if not authenticated
  }

  if (!jobApplications) {
    return <p>Loading your job applications...</p>;
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
          <JobApplications jobApplications={jobApplications} />
        )}
      </div>
    </div>
  );
}
