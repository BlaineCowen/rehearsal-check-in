import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                client_id: process.env.GOOGLE_CLIENT_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file'
            ]
        })

        const client = await auth.getClient()

        const sheets = google.sheets({
            version: 'v4',
            auth: auth,
        })

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'names!A1:L1000',
        })

        const [header, ...rows] = response.data.values as any[][];

        // Convert the rows into objects
        const data = rows.map(row => {
            const obj: { [key: string]: any } = {}; // Define obj as an indexable object
            header.forEach((column, index) => {
                obj[column] = row[index];
            });
            return obj;
        });

        res.status(200).json(data)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'An error occurred while retrieving data' })
    }
}