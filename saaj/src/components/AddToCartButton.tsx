"use client";

import { addItem } from "@/app/products/[id]/actions";
import { useTransition } from "react";

interface AddToCartButtonProps {
	product_id: string,
}

export default function AddToCartButton({ product_id }: AddToCartButtonProps) {
	const [pending, startTransition] = useTransition();
	return (
		<div className="flex items-center justify-center w-32 m-auto">
			<button
				className="btn btn-primary w-full"
				onClick={() => {
					startTransition(async () => {
						await addItem(product_id);
					});
				}}
			>
				{pending && <span className="loading loading-spinner loading-md" />}
				{!pending && "Add To Cart"}
			</button>
		</div>
	);
}
