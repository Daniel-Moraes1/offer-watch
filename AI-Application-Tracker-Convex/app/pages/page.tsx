import { getApplications } from '../../convex/myFunctions';
import convex from "../../lib/convexClient";
import { query } from '../../convex/_generated/server';
import { useConvex } from 'convex/react';
import { api } from "../../convex/_generated/api";
import { Id } from '../../convex/_generated/dataModel'

export default async function handler(req:any, res:any) {
    if (req.method === 'GET') {
      console.log("HELLO");
        // Destructure the input parameters from the request body    
        // Validate required fields
        try {
            // Call the upsertJobApplication function
            if (convex != null) {
              const result = await convex.query(api.myFunctions.getApplications, { 
                });
                
              console.log(result);
            }
            else {
                throw new Error("Database client not defined");
            }

            res.status(200).json({ message: 'Job application upserted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to upsert job application' });
        }
      // TODO: Add your logic here to handle the data, such as saving it to a database
      // Example: save to a mock database (this part depends on your actual database logic)
  
      // Assuming the process was successful:
      res.status(200).json({ message: 'Process created successfully', data: req.body });
    } else {
      // Handle any other HTTP method
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}