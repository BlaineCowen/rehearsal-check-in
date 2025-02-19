import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Test blob upload
    const { url } = await put('test/blob.txt', 'Hello World!', { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log("Test blob URL:", url);
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string | null;

    let imageUrl = existingImageUrl;

    if (image) {
      const filename = `org-${id}-${Date.now()}-${image.name}`;
      const blob = await put(filename, image, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      imageUrl = blob.url;
    }

    // Verify user has access to this organization
    const userOrg = await prisma.organization.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!userOrg) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.update({
      where: {
        id: id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Failed to update organization:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const formData = await req.formData();
//     const name = formData.get("name") as string;
//     const image = formData.get("image") as File | null;
//     const existingImageUrl = formData.get("imageUrl") as string | null;

//     let imageUrl = existingImageUrl;

//     if (image) {
//       // Generate a unique filename
//       const filename = `org-${params.id}-${Date.now()}-${image.name}`;
//       const blob = await put(filename, image, {
//         access: 'public',
//       });
//       imageUrl = blob.url;
//     }

//     const organization = await prisma.organization.update({
//       where: {
//         id: params.id,
//       },
//       data: {
//         name,
//         imageUrl,
//       },
//     });

//     return NextResponse.json(organization);
//   } catch (error) {
//     console.error("Failed to update organization:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// } 