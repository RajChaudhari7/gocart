import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {

        const body = await request.json();

        const {
            name,
            phone,
            email,
            password,

            profilePhoto,

            vehicleType,
            vehicleName,
            vehicleNumber,

            driverLicense,
            aadharFront,
            aadharBack,
            rcBook,

            bankName,
            accountHolder,
            accountNumber,
            ifsc,
            upiId
        } = body;

        // Validation

        if (
            !name ||
            !phone ||
            !password ||
            !profilePhoto ||
            !vehicleType ||
            !vehicleNumber ||
            !driverLicense ||
            !aadharFront ||
            !aadharBack ||
            !rcBook ||
            !bankName ||
            !accountHolder ||
            !accountNumber ||
            !ifsc
        ) {

            return NextResponse.json(
                {
                    error: "Please fill all required fields."
                },
                {
                    status: 400
                }
            );

        }

        // Phone already registered?

        const existingDriver = await prisma.driver.findFirst({
            where: {
                phone
            }
        });

        if (existingDriver) {

            return NextResponse.json(
                {
                    error: "This phone number is already registered."
                },
                {
                    status: 400
                }
            );

        }

        // Pending application?

        const existingApplication =
            await prisma.driverApplication.findFirst({

                where: {
                    phone,
                    status: "PENDING"
                }

            });

        if (existingApplication) {

            return NextResponse.json(
                {
                    error: "Your application is already under review."
                },
                {
                    status: 400
                }
            );

        }

        // Hash Password

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Save Application

        const application =
            await prisma.driverApplication.create({

                data: {

                    name,
                    phone,
                    email,

                    password: hashedPassword,

                    profilePhoto,

                    vehicleType,
                    vehicleName,
                    vehicleNumber,

                    driverLicense,
                    aadharFront,
                    aadharBack,
                    rcBook,

                    bankName,
                    accountHolder,
                    accountNumber,
                    ifsc,
                    upiId

                }

            });

        return NextResponse.json({

            success: true,

            message:
                "Application submitted successfully. Wait for admin approval.",

            applicationId: application.id

        });

    }
    catch (error) {
        console.error("REGISTER ERROR:");
        console.error(error);

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );
    }
}