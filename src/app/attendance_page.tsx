"use client";

import React, { useState, useEffect } from "react";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { Console, log } from "console";

import Image from "next/image";
import Checkbox from "@/components/Checkbox";

interface Attendance_PageProps {
  currentPage: string;
}

export default function Attendance_Page({ currentPage }: Attendance_PageProps) {
  const [attendance_type, setAttendance_type] = useState("Daily");
  const [id, setId] = useState("");
  // const [student_name, setStudent_name] = useState("");
  const [nameData, setNameData] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      let data = sessionStorage.getItem("data");
      if (!data) {
        try {
          const response = await fetch("api/retrieve_info");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          data = await response.json();
          sessionStorage.setItem("data", JSON.stringify(data));
        } catch (error) {
          console.error("An error occurred while fetching the data.", error);
        }
      } else {
        data = JSON.parse(data);
      }
      if (Array.isArray(data)) {
        setNameData(data);
        // name data needs to be a json object with the headers as keys
        console.log("data", data);
      } else {
        setNameData([]);
      }
    };

    fetchData();
  }, []);

  function toTitleCase(str: string) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function findName(data: any[], id: string) {
    // data = nameData;

    for (let i = 0; i < data.length; i++) {
      if (data[i].Student_ID === id || data[i].Id_formated === id) {
        console.log("data[i].First_Last", data[i].First_Last);
        setSuccessMessage("Success!");
        return data[i] ? toTitleCase(data[i].First_Last) : "No Name Found";
      }
    }
    setSuccessMessage("No Name Found for ID ");
    return null;
  }

  useEffect(() => {
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  // When userName changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // find where id is in array[i][7] or array[i][8]
    // if array[i][7] or 8 = id, then 3 is name

    setUserName(findName(nameData, id) ?? "");
    event.preventDefault();
    // get the current time and date
    const date = new Date().toLocaleString();

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
  };

  return (
    <div className="min-h-screen items-center relative justify-between p-24">
      <div className="relative pb-10 h-fit mb-10">
        <h1 className="text-6xl flex w-full font-bold text-center capitalize justify-center pb-10 font-sans">
          SOHO CHOIR {currentPage.toUpperCase()} CHECK IN
        </h1>
        <div
          className=" absolute opacity-0 w-full h-2 justify-center text-center"
          id="submit"
        >
          <h1 className="text-6xl h-2 w-full font-bold text-center justify-center pb-10 font-sans">
            {successMessage} {userName}
          </h1>
        </div>
        <div className="w-full absolute pt-3" id="form">
          <form onSubmit={handleSubmit} className="flex w-full">
            {/* make a in input box with placeholder "Type/Scan ID Number" */}
            <input
              onChange={(e) => setId(e.target.value)}
              value={id}
              className="w-4/5 h-12 px-4 mr-2 text-2xl font-semibold rounded-lg shadow-lg bg-neutral-800 text-neutral-100"
              placeholder="Type/Scan ID Number"
            />
            {/* to the right of the input box, place a button that says "Submit" */}
            <button
              type="submit"
              className="w-1/5 h-12 px-4 text-l font-semibold rounded-lg shadow-lg bg-neutral-800 text-neutral-100"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className="relative w-full h-64"></div>
      <div className="flex justify-center">
        <h1 className="">Last to check in: {userName}</h1>
      </div>

      <div className="flex justify-center">
        <Image src="/logo.png" alt="logo" width={400} height={400} />
      </div>

      <div className="w-full flex h-full"></div>
    </div>
  );
}
