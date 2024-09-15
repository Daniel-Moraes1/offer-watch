import {NextResponse} from "next/server"
import { upsertJobApplication } from '../../../convex/myFunctions';
import convex from "../../../lib/convexClient";
import { mutation } from '../../../convex/_generated/server';
import { useConvex } from 'convex/react';
import { api } from "../../../convex/_generated/api";
import { type } from "os";

function extractHeaders(headers: HeadersList) {
    const headerMap = new Map(headers.entries());
    console.log(headerMap)
    console.log(headerMap.get('email'))
    const email = headerMap.get('email') || null;
    const role = headerMap.get('role') || null;
    const company = headerMap.get('company') || null;
    const status = headerMap.get('status') || null;
    const jobDescriptionLink = headerMap.get('jobdescriptionlink') || null;
    const applicationDate = headerMap.get('applicationdate') || null;
    const dueDate = headerMap.get('duedate') || null;
    const lastActionDate = headerMap.get('lastactiondate') || null;

    return {
        email,
        role,
        company,
        status,
        jobDescriptionLink,
        applicationDate,
        dueDate,
        lastActionDate,
    };
}


export async function POST(req:any, res:any) {
    try {
        const {
            email,
            role,
            company,
            status,
            jobDescriptionLink,
            applicationDate,
            dueDate,
            lastActionDate,
        } = extractHeaders(req.headers); 

        console.log(email, role, company, status, jobDescriptionLink, applicationDate, dueDate, lastActionDate);
    
        // Validate required fields
        if (!email || !role || !company || !status || !jobDescriptionLink || !applicationDate || !dueDate || !lastActionDate) {
            return new NextResponse("Missing fields", {status:500});
        }

        try {
            // Call the upsertJobApplication function
            if (convex != null) {
                const result = await convex.mutation(api.myFunctions.upsertJobApplication, { 
                    email, 
                    company,
                    role,
                    status,
                    jobDescriptionLink,
                    applicationDate,
                    dueDate,
                    lastActionDate
                });
            }
            else {
                throw new Error("Database client not defined");
            }

            return new NextResponse("Data successfully entered", {status:200});
        } catch (error) {
            return new NextResponse("Request Failed", {status:500});
        }
      // TODO: Add your logic here to handle the data, such as saving it to a database
      // Example: save to a mock database (this part depends on your actual database logic)
  
      // Assuming the process was successful:
      res.status(200).json({ message: 'Process created successfully', data: req.body });
    } catch (error) {
        console.error("Error in POST handler:", error);
    }
}