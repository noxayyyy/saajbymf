"use client";

import { setItemQty } from "@/app/products/[id]/actions";
import { CartItemWithProduct } from "@/lib/cart";
import { formatPrice } from "@/lib/cost";
import Image from "next/image";
import Link from "next/link";
import { JSX, useTransition } from "react";

interface CartItemCardProps {
	item: CartItemWithProduct,
	currency: string,
	conversion_rate: number,
}

export default function CartItemCard({ item: { product, quantity }, currency, conversion_rate }: CartItemCardProps) {
	const [pending, startTransition] = useTransition();

	const qty_opts: JSX.Element[] = [];
	const formatted_price = formatPrice(product.price * conversion_rate, currency);

	for (let i = 1; i < 100; i++) {
		qty_opts.push(
			<option value={i} key={i}>
				{i}
			</option>
		);
	}

	return (
		<div>
			<div className="flex flex-wrap items-center gap-3">
				<Image
					src={product.image_urls[0]}
					alt={product.name}
					width={200}
					height={200}
					className="rounded-lg"
				/>
				<div>
					<Link href={`/products/${product.id}`} className="font-bold">
						{product.name}
					</Link>
					<div>Cost: {formatted_price}</div>
					<div className="flex gap-2">
						<div className="my-1 flex items-center gap-2">
							Quantity:
							<select
								className="select border w-full max-w-[80px]"
								defaultValue={quantity}
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
					<div className="flex items-center gap-2">
						Total: {formatPrice(product.price * quantity * conversion_rate, currency)}
					</div>
				</div>
			</div>
			<div className="divider"></div>
		</div>
	)
}
