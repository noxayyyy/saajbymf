"use client";

import { ShoppingCart } from "@/lib/cart";
import { formatPrice } from "@/lib/cost";
import CartItemCard from "./CartItemCard";
import Link from "next/link";
import { useState } from "react";

interface CartButtonProps {
	cart: ShoppingCart | null;
	currency: string;
	conversion_rate: number;
	className?: string;
};

export default function CartButton({ cart, currency, conversion_rate, className }: CartButtonProps) {
	const [is_open, setOpen] = useState(false);

	return (
		<div className={className}>
			<div className="drawer drawer-end">
				<input
					id="cart-drawer"
					type="checkbox"
					className="drawer-toggle"
					checked={is_open}
					onChange={() => setOpen(!is_open)}
				/>
				<div className="drawer-content">
					{/* Page content here */}
					<label htmlFor="cart-drawer" tabIndex={0} className="drawer-button btn btn-ghost btn-circle">
						<div className="indicator">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<span className="badge badge-xs indicator-item">
								{cart?.size || 0}
							</span>
						</div>
					</label>
				</div>
				<div className="drawer-side z-50">
					<label htmlFor="cart-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
					<div className="flex flex-col h-screen w-85 text-base-content bg-base-100">
						<div className="shadow-2xl">
							<h1 className="text-3xl font-semibold pl-4 pt-2">SHOPPING CART</h1>
							<div className="divider my-0 divider-secondary"></div>
						</div>
						<ul className="p-4 flex-1 overflow-y-auto">
							{/* Sidebar content here */}
							{cart?.items.map((item, idx) => (
								<li key={idx}><CartItemCard key={item.id} item={item} currency={currency} conversion_rate={conversion_rate} /></li>
							))}
						</ul>
						<div className="text-lg">
							<div className="flex flex-col items-center pb-4">
								<p className="mb-3 font-bold">
									Total: {<span className="font-sans">{formatPrice((cart?.subtotal || 0) * conversion_rate, currency)}</span>}
								</p>
								<Link
									href={`/checkout?cartId=${cart?.id}`}
									className="btn btn-primary rounded-lg sm:w-[150px]"
									onClick={() => setOpen(false)}
								>
									Checkout
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
