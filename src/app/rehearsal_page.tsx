"use client";

import React, { useState } from "react";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { Console, log } from "console";

import Image from "next/image";
import Checkbox from "@/components/Checkbox";

export default function Rehearsal_Page() {
  const [attendance_type, setAttendance_type] = useState("Rehearsal");
  const [id, setId] = useState("");
  // get the current time and date
  const date = new Date();
  const [student_name, setStudent_name] = useState("");

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setId(e.currentTarget.value);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setAttendance_type("Rehearsal");
    document.getElementById("form")!.classList.add("fade-out");

    document.getElementById("submit")!.classList.add("fade-in");
    document.getElementById("form")!.classList.add("opacity-0");

    document.getElementById("submit")!.classList.remove("opacity-0");

    event.preventDefault();
    console.log(id);
    // get the current time and date
    const date = new Date();

    const form = {
      id,
      date,
      attendance_type,
    };

    setId("");
    setTimeout(function () {
      document.getElementById("form")!.classList.add("opacity-0");

      document.getElementById("submit")!.classList.remove("opacity-0");

      document.getElementById("submit")!.classList.remove("fade-in");
      document.getElementById("form")!.classList.remove("fade-out");
      document.getElementById("form")!.classList.add("fade-in");
      document.getElementById("submit")!.classList.add("fade-out");
    }, 500);

    setTimeout(function () {
      document.getElementById("form")!.classList.remove("opacity-0");
      document.getElementById("submit")!.classList.add("opacity-0");
      document.getElementById("submit")!.classList.remove("fade-out");
      document.getElementById("form")!.classList.remove("fade-in");
      document.getElementById("submit")!.classList.remove("fade-in");
      document.getElementById("form")!.classList.remove("fade-out");
    }, 1000);

    const response = await fetch("api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      console.error("API response was not ok", response);
      return;
    }

    // refresh the page and get ready for the next ID number to be entered

    // give form and submit class fadeOut
    // remove hidden from submit

    const content = await response.json();

    console.log(content);
  };

  return (
    <main className="min-h-screen items-center relative justify-between p-24">
      {/* make a header that says "SOHO CHOIR CHECK IN" */}

      <div className="relative pb-10 h-fit mb-10">
        <h1 className="text-6xl flex w-full font-bold text-center justify-center pb-10 font-sans">
          SOHO CHOIR REHEARSAL CHECK IN
        </h1>
        <div
          className=" absolute opacity-0 w-full h-2 justify-center text-center"
          id="submit"
        >
          <h1 className="text-6xl h-2 w-full font-bold text-center justify-center pb-10 font-sans">
            Submitted
          </h1>
        </div>
        <div className="w-full absolute pt-3" id="form">
          <form onSubmit={handleSubmit} className="flex w-full">
            {/* make a in input box with placeholder "Type/Scan ID Number" */}
            <input
              onChange={(e) => setId(e.target.value)}
              value={id}
              className="w-4/5 h-12 px-4 mr-2 text-2xl font-semibold rounded-lg shadow-lg dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Type/Scan ID Number"
            />
            {/* to the right of the input box, place a button that says "Submit" */}
            <button
              type="submit"
              className="w-1/5 h-12 px-4 text-l font-semibold rounded-lg shadow-lg dark:bg-neutral-800 dark:text-neutral-100"
            >
              Submit
            </button>
          </form>
        </div>
        {/* add a check box that says "Red Rhythm?" */}
        <Checkbox />
      </div>

      <div className="w-full flex h-full">
        <div className=" flex w-full h-60">
          {/* add div */}

          <div className="relative w-full h-full">
            <Image
              fill
              src="/logo.png"
              alt="logo"
              style={{
                objectFit: "contain",
                maxHeight: "500px",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
