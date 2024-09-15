import { upsertJobApplication } from '../../../convex/myFunctions';
import convex from "../../../lib/convexClient"
import { mutation } from '../../../convex/_generated/server';


export default async function handler(req:any, res:any) {
    if (req.method === 'POST') {
        // Destructure the input parameters from the request body
        const {
            email,
            role,
            company,
            status,
            jobDescriptionLink,
            applicationDate,
            dueDate,
            lastActionDate,
        } = req.body;

        const application = {
            email,
            company,
            role,
            status: status,
            jobDescriptionLink: jobDescriptionLink,
            applicationDate: applicationDate,
            dueDate: dueDate,
            lastActionDate: lastActionDate
        }    
    
        // Validate required fields
        if (!email || !role || !company || !status || !jobDescriptionLink || !applicationDate || !dueDate || !lastActionDate) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        try {
            // Call the upsertJobApplication function
            await ("users", { email, company, role, application });

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
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}