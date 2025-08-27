"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { auth_opts } from "../api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { OrderStatus } from "@/generated/prisma";

export const addOrder = async (
  form_data: FormData,
  cart_id: string,
  total: string,
) => {
  const session = await getServerSession(auth_opts);
  if (!session) {
    notFound();
  }
  const now = new Date();
  const first_name = form_data.get("firstName")?.toString() || "";
  const last_name = form_data.get("lastName")?.toString() || "";
  const email = form_data.get("email")?.toString() || "";
  const phone = form_data.get("phone")?.toString() || "";

  const street = form_data.get("street")?.toString() || "";
  const country = form_data.get("country")?.toString() || "";
  const state = form_data.get("state")?.toString() || "";
  const city = form_data.get("city")?.toString() || "";
  const zip = form_data.get("zip")?.toString() || "";

  const img = form_data.get("payment") as File;
  const img_data = Buffer.from(await img.arrayBuffer()).toString("base64");
  const img_type = img.type;

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      order: {
        create: {
          cartId: cart_id,
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone: phone,
          street_addr: street,
          country: country,
          state: state,
          city: city,
          zip_code: zip,
          payment: img_data,
          payment_type: img_type,
          total: total,
          expires: new Date(now.setDate(now.getDate() + 3)),
          status: OrderStatus.PENDING,
        },
      },
    },
  });
};
