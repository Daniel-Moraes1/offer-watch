// lib/convexClient.ts
import { ConvexHttpClient } from 'convex/browser';

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;


export default convex;