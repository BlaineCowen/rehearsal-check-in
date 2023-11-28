import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    // Add your implementation here

    // Example: Send a response
    res.status(200).json({ message: 'Hello, world!' });
}



