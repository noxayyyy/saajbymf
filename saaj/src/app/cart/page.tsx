import CartItemCard from "@/components/CartItemCard";
import { getCart } from "@/lib/cart";
import { getProductCostWithCurrency } from "@/lib/cost";
import { countryToCurrency, DEFAULT_COUNTRY } from "../../../middleware";
import { headers } from "next/headers";
import { formatPrice } from "@/lib/cost";

export const metadata = {
	title: "Your Cart - Saaj by MF",
};

export default async function CartPage() {
	const user_country = (await headers()).get("x-user-country") || DEFAULT_COUNTRY;
	const cart = await getCart(user_country);
	const regional_prices = cart ? await Promise.all(cart?.items.map(async (item) => {
		return await getProductCostWithCurrency(item.product.prices, user_country);
	})) : undefined;

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
			<div className="divider"></div>
			{cart?.items.map((item, idx) => (
				regional_prices ? (
					<CartItemCard item={item} product_price={regional_prices[idx]} key={item.id} />
				) : (
					<CartItemCard item={item} key={item.id} />
				)
			))}
			{!cart?.size && <p>Your cart is empty.</p>}
			<div className="flex flex-col items-end sm:items-center">
				<p className="mb-3 font-bold">Total: {
					formatPrice({
						id: "",
						product_id: "",
						currency: countryToCurrency[user_country],
						amount: cart?.subtotal || 0
					})
				}</p>
				<button className="btn btn-primary sm:w-[150px]">Checkout</button>
			</div>
		</div>
	);
}
