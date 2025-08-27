"use client";

import { addItem } from "@/app/products/[id]/actions";
import { Size } from "@/generated/prisma";
import { useTransition } from "react";

interface AddToCartButtonProps {
	product_id: string,
	size: Size
}

export default function AddToCartButton({ product_id, size }: AddToCartButtonProps) {
	const [pending, startTransition] = useTransition();
	return (
		<div className="flex items-center justify-center w-32 m-auto">
			<button
				className="btn btn-primary w-full"
				onClick={() => {
					startTransition(async () => {
						await addItem(product_id, size);
					});
				}}
			>
				{pending && <span className="loading loading-spinner loading-md" />}
				{!pending && "Add To Cart"}
			</button>
		</div>
	);
}
