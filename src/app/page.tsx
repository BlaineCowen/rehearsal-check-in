'use client';

import React, { useState } from 'react';
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { Console, log } from 'console';


export default function Home() {
  const [id, setId] = useState("");
  // get the current time and date
  const date = new Date();

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setId(e.currentTarget.value);
  }
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(id);
  // get the current time and date
  const date = new Date();


  const form = {
    id,
    date
  }
  

  const response = await fetch('api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
    
  })
  const content = await response.json()
  
  console.log(content)

  // refresh the page and get ready for the next ID number to be entered
  setId("");

  }
  


  return (
    <main className="min-h-screen items-center justify-between p-24">

      {/* make a header that says "SOHO CHOIR CHECK IN" */}
      <h1 className="text-6xl flex w-full font-bold text-center justify-center pb-10 font-sans">SOHO CHOIR CHECK IN</h1>
      
        <div className='w-full '>
          <form onSubmit={handleSubmit} className='flex w-full'>
            {/* make a in input box with placeholder "Type/Scan ID Number" */}
            <input onChange={e => setId(e.target.value)} value={id}  className="w-4/5 h-12 px-4 mr-2 text-2xl font-semibold rounded-lg shadow-lg dark:bg-neutral-800 dark:text-neutral-100" placeholder="Type/Scan ID Number" />
            {/* to the right of the input box, place a button that says "Submit" */}
            <button type='submit' className="w-1/5 h-12 px-4 text-2xl font-semibold rounded-lg shadow-lg dark:bg-neutral-800 dark:text-neutral-100">Submit</button>
          </form>
        </div>

    </main>
  )


}
