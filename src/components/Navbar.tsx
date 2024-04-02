import React from "react";
import { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import Attendance_Page from "../app/attendance_page";

function Navbar({
  onOptionClick,
}: {
  onOptionClick: (pageName: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState<string>("Attendance");

  // render Daily_Page

  const handleButtonClick = (pageName: string) => {
    // go to home page
    setCurrentPage(pageName);
    onOptionClick(pageName);
    console.log("currentPage", currentPage);
  };
  return (
    <div className="h-16">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Soho Choir
        </Typography>
        <Button color="inherit" onClick={() => handleButtonClick("Rehearsal")}>
          <Link href={{ pathname: "../", query: { name: "Rehearsal" } }}>
            Rehearsal
          </Link>
        </Button>
        <Button color="inherit" onClick={() => handleButtonClick("Attendance")}>
          <Link href={{ pathname: "../", query: { name: "Attendance" } }}>
            Attendance
          </Link>
        </Button>
        <Button color="inherit" onClick={() => handleButtonClick("Red Rhythm")}>
          <Link href={{ pathname: "../", query: { name: "Red Rhythm" } }}>
            Red Rhythm
          </Link>
        </Button>
        <Button color="inherit">
          <Link href="app/student_attendance">Student Attendance</Link>
        </Button>
      </Toolbar>
    </div>
  );
}

export default Navbar;
