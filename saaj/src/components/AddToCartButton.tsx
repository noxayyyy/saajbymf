"use client";

import { addItem } from "@/app/products/[id]/actions";
import { useState, useTransition } from "react";

interface AddToCartButtonProps {
	user_country: string,
	product_id: string,
}

export default function AddToCartButton({ user_country, product_id }: AddToCartButtonProps) {
	const [pending, startTransition] = useTransition();
	const [success, setSuccess] = useState(false);
	return (
		<div className="flex items-center gap-2">
			<button
				className="btn btn-primary m-auto"
				onClick={() => {
					setSuccess(false);
					startTransition(async () => {
						await addItem(product_id, user_country);
						setSuccess(true);
					});
				}}
			>Add To Cart</button>
			{pending && <span className="loading loading-spinner loading-md" />}
			{(!pending && success) && <span className="text-success">Added to Cart!</span>}
		</div>
	);
}
