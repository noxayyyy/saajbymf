"use server";

import { createCart, getCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addItem(product_id: string) {
  const cart = (await getCart()) ?? (await createCart());
  const in_cart = cart.items.find((item) => item.product_id === product_id);

  if (in_cart) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          update: {
            where: { id: in_cart.id },
            data: { quantity: { increment: 1 } },
          },
        },
      },
    });
    revalidatePath("/products/[id]");

    return;
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      items: {
        create: {
          product_id: product_id,
          quantity: 1,
        },
      },
    },
  });
  revalidatePath("/products/[id]");
}

export async function setItemQty(product_id: string, qty: number) {
  const cart = (await getCart()) ?? (await createCart());
  const in_cart = cart.items.find((item) => item.product_id === product_id);

  if (qty === 0) {
    if (!in_cart) return;

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          delete: { id: in_cart.id },
        },
      },
    });
    revalidatePath("/cart");

    return;
  }

  if (in_cart) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          update: {
            where: { id: in_cart.id },
            data: { quantity: qty },
          },
        },
      },
    });
    revalidatePath("/cart");

    return;
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      items: {
        create: {
          product_id: product_id,
          quantity: qty,
        },
      },
    },
  });
  revalidatePath("/cart");
}
