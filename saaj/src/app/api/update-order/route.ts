import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (auth != `Bearer ${env.ORDER_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  const order_id: string = data.order;

  try {
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "CONFIRMED",
      },
    });
    return NextResponse.json({ message: "Order confirmed." }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: `${err}` }, { status: 400 });
  }
}
