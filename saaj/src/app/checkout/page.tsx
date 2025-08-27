import { getConversionRate, getCurrency } from "@/lib/currency";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { auth_opts } from "../api/auth/[...nextauth]/route";
import { getCart } from "@/lib/cart";
import Checkout from "@/components/Checkout";

interface CheckoutPageProps {
	searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
	const params = await searchParams;
	const cart_id = params.cartId;
	if (!cart_id) {
		notFound();
	}

	const cart = await getCart();
	const currency: string = await getCurrency();
	const conversion_rate: number = await getConversionRate(currency);

	const session = await getServerSession(auth_opts);

	if (!session) {
		redirect(`/api/auth/signin?callbackUrl=/checkout?cartId=${cart_id}`);
	}

	if (!cart) {
		notFound();
	}

	return (
		<Checkout cart={cart} currency={currency} conversion_rate={conversion_rate} />
	);
}
