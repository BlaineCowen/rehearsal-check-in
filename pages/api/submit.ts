import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

type SheetForm = { 
    id: string
    date: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse)
     {
        // Run the middleware
        await runMiddleware(req, res, cors)

        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'only POST allowed' })
        }

        const body = req.body as SheetForm
        
        console.log("body message is " + body.id);

        try {
            //prepare auth
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },

                scopes: [
                // your scopes here
                ],
            })

            // your code here
        } catch (error) {
            // handle error
        }
    }