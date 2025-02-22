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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

function Navbar({ orgName }: { orgName: string }) {
  const router = useRouter();

  const handleButtonClick = (pageName: string) => {
    router.push(`/${pageName}`);
  };

  const { data: user } = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md">
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
          <Link href="/" prefetch={true}>
            Home
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() =>
            router.push(`/org/${user?.organizations[0].id}/update`)
          }
        >
          <Link
            href={`/org/${user?.organizations[0].id}/update`}
            prefetch={true}
          >
            <Avatar>
              <AvatarImage src={user?.organizations[0].imageUrl} />
              <AvatarFallback>
                {user?.organizations[0].name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </Button>
      </Toolbar>
    </div>
  );
}

export default Navbar;
