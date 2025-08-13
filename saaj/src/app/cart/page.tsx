import CartItemCard from "@/components/CartItemCard";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cost";
import { getConversionRate } from "@/lib/currency";
import { getCurrency } from "@/lib/currency";

export const metadata = {
	title: "Your Cart - Saaj by MF",
};

export default async function CartPage() {
	const cart = await getCart();
	const currency = await getCurrency();
	const conversion_rate = await getConversionRate(currency);

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
			<div className="divider"></div>
			{cart?.items.map((item) => (
				<CartItemCard item={item} currency={currency} conversion_rate={conversion_rate} key={item.id} />
			))}
			{!cart?.size && <p>Your cart is empty.</p>}
			<div className="flex flex-col items-end sm:items-center">
				<p className="mb-3 font-bold">
					Total: {formatPrice((cart?.subtotal || 0) * conversion_rate, currency)}
				</p>
				<button className="btn btn-primary sm:w-[150px]">Checkout</button>
			</div>
		</div>
	);
}
