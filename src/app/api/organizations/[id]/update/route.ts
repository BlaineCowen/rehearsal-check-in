import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await context.params;
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string | null;

    let imageUrl = existingImageUrl;

    if (image) {
      // Generate a unique filename
      const filename = `org-${id}-${Date.now()}-${image.name}`;
      const blob = await put(filename, image, {
        access: 'public',
      });
      imageUrl = blob.url;
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
    return new NextResponse("Internal Server Error", { status: 500 });
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