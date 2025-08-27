"use client";

import { Product } from "@/generated/prisma";
import AddToCartButton from "./AddToCartButton";
import CostTag from "./CostTag";
import { useState } from "react";
import SizeRadio from "./SizeRadio";

interface ProductDetailsProps {
	product: Product;
	currency: string;
	conversion_rate: number;
}

export default function ProductDetails({ product, currency, conversion_rate }: ProductDetailsProps) {
	const [size, setSize] = useState(product.stock.filter((ps) => ps.qty > 0)[0].size);

	return (
		<div className="w-full text-center max-w-2xl space-y-4">
			{/* Product Name */}
			<h1 className="text-4xl font-extrabold tracking-tight text-base-content sm:text-5xl">
				{product.name}
			</h1>

			{/* SKU and Price */}
			<div className="flex justify-center items-center gap-4">
				<p className="text-sm text-base-content/70">SKU: {product.sku}</p>
				<div className="badge badge-accent badge-outline">In Stock</div>
			</div>
			<div className="flex justify-center items-center text-base-content gap-1">
				{
					product.stock.map((s, idx) => (<SizeRadio key={idx} default_size={size} stock={s} onClickAction={setSize} />))
				}
			</div>

			<div className="flex justify-center items-center">
				<CostTag price={product.price} currency={currency} conversion_rate={conversion_rate} className="text-3xl p-4" />
			</div>

			{/* Divider */}
			<div className="divider"></div>

			{/* Product Description */}
			<div>
				<h2 className="text-xl font-semibold text-base-content">Description</h2>
				<p className="text-base-content/80 mt-2">
					{product.desc}
				</p>
			</div>

			{/* Add to Cart Section */}
			{/* Constrain the button width for better aesthetics */}
			<div className="w-full max-w-sm mx-auto pt-4">
				<AddToCartButton product_id={product.id} size={size} />
			</div>
		</div>
	);
}
