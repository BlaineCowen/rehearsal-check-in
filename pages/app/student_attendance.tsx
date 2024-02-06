// this page will create a list of names from 1st period
// it will be accested by "./student_attendance"
// the user will select "absent of present" for each student
// present will be selected by default

// Path: src/app/student_attendance.tsx
// for every student who is present, add their id to the google sheet

import React, { useState, useEffect } from "react";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { Console, log } from "console";
import { OAuth2Client } from "google-auth-library";
import { Credentials } from "google-auth-library/build/src/auth/credentials";

import Image from "next/image";

import Checkbox from "@/components/Checkbox";

// get data from the server

interface Attendance_PageProps {
  currentPage: string;
}

// get the namedata from the parent page

export default function Student_Attendance({
  currentPage,
}: Attendance_PageProps) {
  const [checkedStudents, setCheckedStudents] = useState<string[]>([]);
  const [attendance_type, setAttendance_type] = useState("Daily");
  const [id, setId] = useState("");
  // const [student_name, setStudent_name] = useState("");
  const [nameData, setNameData] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleCheckboxChange = (studentId: string, isChecked: boolean) => {
    if (isChecked) {
      // log checked id
      setCheckedStudents([...checkedStudents, studentId]);
    } else {
      setCheckedStudents(checkedStudents.filter((id) => id !== studentId));
    }
  };

  const handleSubmit = async () => {
    // Send checkedStudents to Google Sheets API
    console.log("checkedStudents", checkedStudents);

    // formate date as a sheetform
    const date = new Date();
    const sheetForm = checkedStudents.map((id: string) => [
      id,
      date,
      "Attendance",
    ]);
    // send sheetForm to the server
    const response = await fetch("../api/submit_array", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetForm),
    });
    const data = await response.json();
  };

  React.useEffect(() => {
    // check to see if data is already stored in the session
    const fetchData = async () => {
      let data = sessionStorage.getItem("data");
      if (!data) {
        try {
          const response = await fetch("../api/retrieve_info");
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
      console.log("data", data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Student Attendance</h1>
      <h2>Period 1</h2>
      <div>
        {nameData
          .filter((student) => student.Period === "1")
          .map((student) => (
            <div>
              <input
                type="checkbox"
                id={student.Student_ID}
                name={student.First_Last}
                value={student.First_Last}
                onChange={(e) =>
                  handleCheckboxChange(e.target.id, e.target.checked)
                }
              />
              <label htmlFor={student.First_Last}>{student.First_Last}</label>
            </div>
          ))}
      </div>

      {/* submit button */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
