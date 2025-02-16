"use client";
import React from "react";
import { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Attendance_Page from "../app/attendance_page";
import { QueryClient } from "@tanstack/react-query";

function Navbar({ orgName }: { orgName: string }) {
  const router = useRouter();

  const handleButtonClick = (pageName: string) => {
    router.push(`/${pageName}`);
  };

  return (
    <div className={orgName}>
      <div className="h-full">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Easy Attendance
          </Typography>
          <Button color="inherit" onClick={() => handleButtonClick("")}>
            <Link href={{ pathname: "../", query: { name: "" } }}>Home</Link>
          </Button>
          <Button
            color="inherit"
            onClick={() => handleButtonClick("Attendance")}
          >
            <Link href={{ pathname: "../", query: { name: "students" } }}>
              Students
            </Link>
          </Button>
          <Button
            color="inherit"
            onClick={() => handleButtonClick("Red Rhythm")}
          >
            <Link href={{ pathname: "../", query: { name: "groups" } }}>
              groups
            </Link>
          </Button>
        </Toolbar>
      </div>
    </div>
  );
}

export default Navbar;
