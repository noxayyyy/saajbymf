"use server";

import { Size } from "@/generated/prisma";
import { createCart, getCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addItem(product_id: string, size: Size) {
  const cart = (await getCart()) ?? (await createCart());
  const in_cart = cart.items.find(
    (item) => item.product_id === product_id && item.size === size,
  );

  if (in_cart) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          update: {
            where: { id: in_cart.id, size: size },
            data: {
              quantity: { increment: 1 },
            },
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
          size: size,
        },
      },
    },
  });
  revalidatePath("/products/[id]");
}

export async function setItemQty(product_id: string, size: Size, qty: number) {
  const cart = (await getCart()) ?? (await createCart());
  const in_cart = cart.items.find(
    (item) => item.product_id === product_id && item.size === size,
  );

  if (qty === 0) {
    if (!in_cart) return;

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          delete: { id: in_cart.id, size: size },
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
            where: { id: in_cart.id, size: size },
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
          size: size,
        },
      },
    },
  });
  revalidatePath("/cart");
}
