import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'

export async function getSheetData() {
    
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
            ]
        })
    
        const client = await auth.getClient()
    
        //prepare sheets
        const sheets = google.sheets({
            version: 'v4',
            auth: auth,
        })
    
        //get sheet data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: 'Sheet1!A2:C100',
        })
    
        return response.data.values
    }