import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import Cors from 'cors'
import { data } from 'autoprefixer'

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse)
     {
        console.log("API route hit");
        const data = req.body
        console.log(data);


        // Run the middleware
        await runMiddleware(req, res, cors)

        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'only POST allowed' })
        }


        try {

            //prepare auth
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },

                scopes: [

                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file'

                // your scopes here
                ],
            })

            const sheets = google.sheets({ version: 'v4', auth })
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.SHEET_ID,
                range: 'Sheet1!A1:C1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    // values: [[body.id, body.date, body.attendance_type]],
                    values: data,

                }
            });
            console.log(response.data);
        } catch (error) {
            console.error(error)
            // handle error
        }
    }