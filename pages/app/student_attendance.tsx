// this page will create a list of names from 1st period
// it will be accested by "./student_attendance"
// the user will select "absent of present" for each student
// present will be selected by default

// Path: src/app/student_attendance.tsx
// for every student who is present, add their id to the google sheet

import "tailwindcss/tailwind.css";
import React, { useState, useEffect } from "react";
import "/src/app/globals.css";
import { useRouter } from "next/navigation";

import Image from "next/image";

import Checkbox from "@/components/Checkbox";
import Navbar from "@/components/Navbar";
import NameBox from "@/components/Namebox";
import { Button } from "@mui/material";

// get data from the server

interface Attendance_PageProps {
  currentPage: string;
}
// get the namedata from the parent page

export default function Student_Attendance({}: Attendance_PageProps) {
  const [checkedStudents, setCheckedStudents] = useState<string[]>([]);
  const [attendance_type, setAttendance_type] = useState("Daily");
  const [id, setId] = useState("");
  // const [student_name, setStudent_name] = useState("");
  const [nameData, setNameData] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState<string>("Attendance");
  const router = useRouter();

  // render Daily_Page

  const handleButtonClick = (pageName: string) => {
    setCurrentPage(pageName);
  };

  const RefreshPage = () => {
    router.push("/app/attendance");
    console.log("refresh page?");
  };

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
    RefreshPage();

    const data = await response.json();

    // clear the checkboxes
    // setCheckedStudents([]);
  };

  useEffect(() => {
    console.log(currentPage);
  }, [currentPage]);

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
    <main>
      <div className="flex flex-col h-screen">
        <Navbar
          onOptionClick={handleButtonClick}
          className="fixed h-16 bg-black z-10 w-full justify-center"
        />
        <div className="flex-auto pt-4 flex items-center justify-center screen-minus-navbar">
          <div className="">
            <div className="text-5xl">Student Attendance</div>
            <div className="pt-6">
              {/* {nameData
                .filter((student) => student.Period === "1")
                .map((student) => (
                  <div className=" flex items-center">
                    <input
                      type="checkbox"
                      id={student.Student_ID}
                      name={student.First_Last}
                      value={student.First_Last}
                      onChange={(e) =>
                        handleCheckboxChange(e.target.id, e.target.checked)
                      }
                    />
                    <label className="text-3xl" htmlFor={student.First_Last}>
                      {student.First_Last}
                    </label>
                  </div>
                ))} */}
              {nameData
                .filter((student) => student.Period === "1")
                .map((student) => (
                  <NameBox
                    key={student.Student_ID} // Add key prop with unique value
                    name={student.First_Last}
                    id={student.Student_ID}
                    onSelect={(id: string) => {
                      console.log("id", id);
                      handleCheckboxChange(id, true);
                    }}
                  />
                ))}
            </div>
            <div className="mt-6 h-16 border-white bg-green-500 text-black border rounded hover:bg-green-400 flex justify-center ">
              <button className="text-2xl" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
