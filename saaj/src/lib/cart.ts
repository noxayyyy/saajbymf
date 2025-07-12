import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { CartItem, Prisma } from "../generated/prisma";
import { getServerSession } from "next-auth";
import { auth_opts } from "@/app/api/auth/[...nextauth]/route";
import { getProductCostWithCurrency } from "./cost";

export type CartWithProducts = Prisma.CartGetPayload<{
  include: { items: { include: { product: { include: { prices: true } } } } };
}>;

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: { include: { prices: true } } };
}>;

export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};

export async function createCart(): Promise<ShoppingCart> {
  const session = await getServerSession(auth_opts);

  const new_cart = await prisma.cart.create({
    data: session ? { userId: session.user.id } : {},
  });

  // TODO: encrypt the cart id
  // TODO: cookies also need encryption + security

  if (!session) {
    (await cookies()).set("localCartId", new_cart.id);
  }

  return {
    ...new_cart,
    items: [],
    size: 0,
    subtotal: 0,
  };
}

export async function getCart(
  user_country: string,
): Promise<ShoppingCart | null> {
  const session = await getServerSession(auth_opts);

  let cart: CartWithProducts | null = null;

  if (session) {
    cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: { include: { prices: true } } } },
      },
    });
  } else {
    const local_id = (await cookies()).get("localCartId")?.value;
    cart = local_id
      ? await prisma.cart.findUnique({
          where: { id: local_id },
          include: {
            items: { include: { product: { include: { prices: true } } } },
          },
        })
      : null;
  }

  let subtotal = 0;
  if (cart) {
    for (const item of cart.items) {
      subtotal +=
        item.quantity *
        (await getProductCostWithCurrency(item.product.prices, user_country))
          .amount;
    }
  }

  return cart
    ? {
        ...cart,
        size: cart.items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: subtotal,
      }
    : null;
}

export async function mergeCarts(user_id: string) {
  const local_id = (await cookies()).get("localCartId")?.value;
  const local_cart = local_id
    ? await prisma.cart.findUnique({
        where: { id: local_id },
        include: { items: true },
      })
    : null;

  if (!local_cart) return;

  const user_cart = await prisma.cart.findFirst({
    where: { userId: user_id },
    include: { items: true },
  });

  await prisma.$transaction(async (tx) => {
    if (user_cart) {
      const merged_items = mergeCartItems(local_cart.items, user_cart.items);
      await tx.cartItem.deleteMany({
        where: { cart_id: user_cart.id },
      });
      await tx.cart.update({
        where: { id: user_cart.id },
        data: {
          items: {
            createMany: {
              data: merged_items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
              })),
            },
          },
        },
      });

      await tx.cart.delete({
        where: { id: local_cart.id },
      });
      (await cookies()).set("localCartId", "");

      return;
    }

    await tx.cart.create({
      data: {
        userId: user_id,
        items: {
          createMany: {
            data: local_cart.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
          },
        },
      },
    });

    await tx.cart.delete({
      where: { id: local_cart.id },
    });
    (await cookies()).set("localCartId", "");
  });
}

function mergeCartItems(...cart_items: CartItem[][]) {
  return cart_items.reduce((acc, items) => {
    items.forEach((item) => {
      const existing = acc.find((i) => i.product_id === item.product_id);
      if (!existing) {
        acc.push(item);
        return;
      }
      existing.quantity += item.quantity;
    });

    return acc;
  }, [] as CartItem[]);
}
