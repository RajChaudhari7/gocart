import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {

  const body = await req.json();

  const hashedPassword = await bcrypt.hash(
    body.password,
    10
  );

  const driver = await prisma.driver.create({
    data: {
      name: body.name,
      phone: body.phone,
      password: hashedPassword,
      vehicle: body.vehicle,
      vehicleNo: body.vehicleNo,
    },
  });

  return NextResponse.json(driver);
}