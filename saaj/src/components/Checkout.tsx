"use client";

import { ShoppingCart } from "@/lib/cart";
import CartItemCard from "./CartItemCard"
import CheckoutInfoForm from "./CheckoutInfoForm";
import OrderSummary from "./OrderSummary";
import { useEffect, useState } from "react";
import { addOrder } from "@/app/checkout/actions";

interface CheckoutProps {
	cart: ShoppingCart,
	currency: string,
	conversion_rate: number,
}

export default function Checkout({ cart, currency, conversion_rate }: CheckoutProps) {
	const [country_iso2, setCountryCode] = useState("");
	const [shipping, setShipping] = useState<number | null>(null);

	useEffect(() => {
		if (country_iso2 === undefined || country_iso2 === "") {
			setShipping(null);
			return;
		}
		if (country_iso2 === "PK") {
			setShipping(500);
			return;
		}
		setShipping(45000);
	}, [country_iso2]);

	console.log(country_iso2);

	return (
		<div className="flex flex-col lg:flex-row w-full gap-4">
			<CheckoutInfoForm cart_id={cart.id} setCountryCodeAction={setCountryCode} addOrderAction={addOrder} />
			<div className="flex flex-col order-first w-full lg:order-last">
				<div className={`mx-auto collapse collapse-arrow lg:h-8 lg:collapse-open lg:flex-grow w-full lg:overflow-y-auto`}>
					<input type="checkbox" className="lg:pointer-events-none" />
					<div className="collapse-title text-lg font-semibold">{`Your Cart (${cart.size})`}</div>
					<div className="collapse-content">
						{cart.items.map((item) => (
							<CartItemCard className={"mx-2"} item={item} currency={currency} conversion_rate={conversion_rate} key={item.id} />
						))}
					</div>
				</div>
				<OrderSummary cart={cart} currency={currency} shipping={shipping} />
			</div>
		</div>
	);
}
