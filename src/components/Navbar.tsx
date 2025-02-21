"use client";
import React from "react";
import { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Attendance_Page from "../app/attendance_page";
import { QueryClient } from "@tanstack/react-query";

function Navbar({ orgName }: { orgName: string }) {
  const router = useRouter();

  const handleButtonClick = (pageName: string) => {
    router.push(`/${pageName}`);
  };

  return (
    <div className={orgName}>
      <div className="h-full bg-base-100 rounded-sm shadow-md">
        <Toolbar>
          <Typography
            className="text-base-content"
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Easy Attendance
          </Typography>
          <Button
            color="info"
            variant="outline"
            className="mx-2"
            onClick={() => handleButtonClick("")}
          >
            <Link href={"/"}>Home</Link>
          </Button>
          <Button
            variant="outline"
            className="mx-2"
            onClick={() => handleButtonClick("Attendance")}
          >
            <Link href={{ pathname: "../", query: { name: "students" } }}>
              Students
            </Link>
          </Button>
          <Button
            variant="outline"
            className="mx-2"
            onClick={() => handleButtonClick("Red Rhythm")}
          >
            <Link href={{ pathname: "../", query: { name: "groups" } }}>
              groups
            </Link>
          </Button>
          <Button
            variant="outline"
            className="mx-2"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            Sign Out
          </Button>
        </Toolbar>
      </div>
    </div>
  );
}

export default Navbar;
