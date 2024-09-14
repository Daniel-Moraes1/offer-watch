// app/page.tsx

// This line tells Next.js that the component is a Client Component
"use client";

import './globals.css';
import { useState } from 'react';

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
  const [sortColumn, setSortColumn] = useState('title'); // default sort column
  const [sortDirection, setSortDirection] = useState('asc'); // default sort direction

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

// Sample data for testing
const jobApplications = [
  {
    title: 'Frontend Developer',
    company: 'Google',
    status: 'Applied',
    jobDescriptionLink: 'https://google.com',
    applicationDate: '2024-09-01',
    dueDate: '2024-09-15',
    lastActionDate: '2024-09-10',
  },
  {
    title: 'Backend Developer',
    company: 'Apple',
    status: 'Interviewed',
    jobDescriptionLink: 'https://apple.com',
    applicationDate: '2024-08-20',
    dueDate: null,
    lastActionDate: '2024-09-12',
  },
];

export default function Home() {
  return (
    <div>
      <h1>Job Application Dashboard</h1>
      <JobApplications jobApplications={jobApplications} />
    </div>
  );
}
