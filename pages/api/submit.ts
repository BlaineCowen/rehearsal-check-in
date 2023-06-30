import { NextApiRequest, NextApiResponse } from 'next'
import {google} from 'googleapis'

type SheetForm = { 
    id: string
    date: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse)
     {
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
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file'

                ],
            })
            const sheets = google.sheets({ version: 'v4', auth })
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.SHEET_ID,
                range: 'Sheet1!A1:B1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[body.id, body.date]],
                }
            });

            return res.status(200).json({
                data: response.data,
                message: 'success posting ' + body.id
            })

        } catch (e) {
            return res.status(500).json({message: "error on submit " + e.message })
        }


    }

