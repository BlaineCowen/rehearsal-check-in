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

  const handleButtonClick = (pageName: string) => {
    setCurrentPage(pageName);
  };

  return (
    <html lang="en">
      <main>
        <body>
          <Navbar
            onOptionClick={handleButtonClick}
            className="fixed h-16 bg-black z-10 w-full justify-center"
          />

          <Attendance_Page currentPage={currentPage} />
        </body>
      </main>
    </html>
  );
}
