"use client";

import { setItemQty } from "@/app/products/[id]/actions";
import { CartItemWithProduct } from "@/lib/cart";
import { formatPrice } from "@/lib/cost";
import Image from "next/image";
import Link from "next/link";
import { JSX, useTransition } from "react";
import CostTag from "./CostTag";

interface CartItemCardProps {
	item: CartItemWithProduct,
	currency: string,
	conversion_rate: number,
}

export default function CartItemCard({ item: { product, quantity }, currency, conversion_rate }: CartItemCardProps) {
	const [pending, startTransition] = useTransition();
	const qty_opts: JSX.Element[] = [];

	for (let i = 1; i < 100; i++) {
		qty_opts.push(
			<option value={i} key={i}>
				{i}
			</option>
		);
	}

	return (
		<div className="bg-base-100 rounded-xl h-fit my-4 outline outline-dashed shadow-lg">
			<div className="flex flex-row gap-3 p-4">
				<Image
					src={product.image_urls[0]}
					alt={product.name}
					width={150}
					height={150}
					className="rounded-lg shadow-xl"
				/>
				<div className="flex-1">
					<Link href={`/products/${product.id}`} className="text-sm font-semibold">
						{product.name}
					</Link>
					<div className="divider my-0 w-full"></div>
					<CostTag price={product.price} currency={currency} conversion_rate={conversion_rate} />
					<div className="flex gap-2 pt-1">
						<div className="my-1 flex items-center gap-2 font-semibold text-md">
							Qty:
							<select
								className="select rounded-xl max-h-8 w-full max-w-[70px] text-black focus:outline-hidden"
								value={quantity}
								onChange={menu => {
									const new_qty = parseInt(menu.currentTarget.value);
									startTransition(async () => {
										await setItemQty(product.id, new_qty);
									});
								}}
							>
								<option value={0}>Remove</option>
								{qty_opts}
							</select>
						</div>
						{pending && <span className="loading loading-spinner loading-sm" />}
					</div>
					<div className="flex items-center gap-2 text-lg font-bold">
						{formatPrice(product.price * quantity * conversion_rate, currency)}
					</div>
				</div>
			</div>
		</div>
	)
}
