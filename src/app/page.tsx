"use client";

import React, { useState, useEffect, use } from "react";

import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parse } from "url";

import Image from "next/image";
import Checkbox from "@/components/Checkbox";
import { Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Attendance_Page from "./attendance_page";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

export default function Home({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [currentPage, setCurrentPage] = useState<string>("Attendance");

  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  const handleButtonClick = (pageName: string) => {
    setCurrentPage(pageName);
  };

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <html lang="en">
      <main>
        <body>
          <div className="flex justify-center">
            <Navbar
              onOptionClick={handleButtonClick}
              className="fixed h-16 bg-black z-10 w-11/12 justify-center border-b-2 border-x-2 rounded-b-lg border-gray-800 shadow-lg shadow-black"
            />
          </div>
          <h1 className="text-4xl text-center"></h1>
          {isOnline ? (
            <Attendance_Page currentPage={currentPage} />
          ) : (
            <div className="flex justify-center items-center h-screen">
              <h1 className="text-4xl text-center">You are offline</h1>
            </div>
          )}
        </body>
      </main>
    </html>
  );
}
