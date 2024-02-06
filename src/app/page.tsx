"use client";

import React, { useState } from "react";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import Link from "next/link";

import Image from "next/image";
import Checkbox from "@/components/Checkbox";
import { Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Attendance_Page from "./attendance_page";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>("Attendance");

  // render Daily_Page

  const handleButtonClick = (pageName: string) => {
    setCurrentPage(pageName);
  };

  return (
    <html lang="en">
      <body>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Soho Choir
          </Typography>
          <Button
            color="inherit"
            onClick={() => handleButtonClick("Rehearsal")}
          >
            Rehearsal
          </Button>
          <Button
            color="inherit"
            onClick={() => handleButtonClick("Attendance")}
          >
            Attendance
          </Button>
          <Button
            color="inherit"
            onClick={() => handleButtonClick("Red Rhythm")}
          >
            Red Rhythm
          </Button>
          <Button color="inherit">
            <Link href="app/student_attendance">Student Attendance</Link>
          </Button>
        </Toolbar>
        <Attendance_Page currentPage={currentPage} />
      </body>
    </html>
  );
}
