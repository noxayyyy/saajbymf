"use client";

import { ShoppingCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cost";

interface OrderSummaryProps {
	cart: ShoppingCart,
	currency: string,
	shipping: number | null,
}

export default function OrderSummary({ cart, currency, shipping }: OrderSummaryProps) {
	return (
		<div className="collapse collapse-arrow lg:collapse-open">
			<input type="checkbox" className="lg:pointer-events-none" />
			<h2 className="collapse-title text-lg font-semibold">Order Summary</h2>
			<div className="w-full collapse-content">
				<div className="flex justify-between w-full">
					<span className="justify-start">Price:</span>
					<span className="justify-end font-bold">{formatPrice(cart.subtotal, currency)}</span>
				</div>
				<div className="flex justify-between w-full">
					<span className="justify-start">Shipping:</span>
					<span className="justify-end font-bold">{shipping === null ? "Enter address to calculate" : formatPrice(shipping, currency)}</span>
				</div>
				<div className="divider my-0"></div>
				<div className="flex justify-between w-full">
					<span className="justify-start">Total:</span>
					<span className="justify-end font-bold">{formatPrice(cart.subtotal + (shipping ? shipping : 0), currency)}</span>
				</div>
			</div>
		</div>
	);
}
