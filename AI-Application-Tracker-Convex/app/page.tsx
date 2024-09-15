// app/page.tsx

"use client";

import './globals.css';
import { useState, useEffect } from 'react';
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "../convex/_generated/client"; // Path to your Convex client

// Helper function to sort based on the selected column and order
const sortData = (data, sortColumn, sortDirection) => {
  return [...data].sort((a, b) => {
    if (!a[sortColumn]) return 1;
    if (!b[sortColumn]) return -1;

    const valueA = a[sortColumn].toLowerCase ? a[sortColumn].toLowerCase() : a[sortColumn];
    const valueB = b[sortColumn].toLowerCase ? b[sortColumn].toLowerCase() : b[sortColumn];

    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

const JobApplications = ({ jobApplications }) => {
  const [sortColumn, setSortColumn] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = sortData(jobApplications, sortColumn, sortDirection);

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort('title')}>Job Title {renderSortIcon('title')}</th>
          <th onClick={() => handleSort('company')}>Company Name {renderSortIcon('company')}</th>
          <th onClick={() => handleSort('status')}>Status {renderSortIcon('status')}</th>
          <th>Job Description</th>
          <th onClick={() => handleSort('applicationDate')}>Application Date {renderSortIcon('applicationDate')}</th>
          <th onClick={() => handleSort('dueDate')}>Due Date {renderSortIcon('dueDate')}</th>
          <th onClick={() => handleSort('lastActionDate')}>Last Action Date {renderSortIcon('lastActionDate')}</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((job, index) => (
          <tr key={index}>
            <td>{job.title}</td>
            <td>{job.company}</td>
            <td>
              <span className={`status-badge ${job.status.toLowerCase()}`}>
                {job.status}
              </span>
            </td>
            <td>
              <a href={job.jobDescriptionLink} target="_blank" rel="noopener noreferrer">
                View Job
              </a>
            </td>
            <td>{new Date(job.applicationDate).toLocaleDateString()}</td>
            <td>{job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A'}</td>
            <td>{job.lastActionDate ? new Date(job.lastActionDate).toLocaleDateString() : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser(); // Use Clerk for authentication

  // Fetch job applications using Convex useQuery
  const jobApplications = useQuery("getUserApplications", { email: user?.primaryEmailAddress }); 

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
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      {jobApplications.length === 0 ? (
        <p>No job applications found.</p>
      ) : (
        <JobApplications jobApplications={jobApplications} />
      )}
    </div>
  );
}
