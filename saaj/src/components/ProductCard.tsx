import { Price, Product } from "@/generated/prisma";
import Link from "next/link";
import CostTag from "./CostTag";
import Image from "next/image";

interface ProductCardProps {
	product: Product,
	product_price: Price,
}

export default function ProductCard({ product, product_price }: ProductCardProps) {
	const new_limit: number = 60480000; // milliseconds in a week
	const is_new: boolean = Date.now() - new Date(product.created_at).getTime() < new_limit;

	return (
		<div className="card group w-full bg-base-100 overflow-hidden max-w-xs" >
			<Link
				href={`/products/${product.id}`}
				className="card group w-full bg-base-200 hover:shadow-xl transition-shadow overflow-hidden"
			>
				<figure className="aspect-[4/5] relative">
					<Image
						src={product.image_urls[0]}
						alt={product.name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>

					<div className="card-body absolute bottom-0 left-0 right-0 h-1/3
								bg-gradient-to-t from-black/75 to-transparent
								p-4 text-white
								opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100
								transition-all duration-300 ease-in-out">
						<h2 className="card-title">{product.name}</h2>
						<p className="overflow-hidden text-ellipsis whitespace-nowrap">
							{product.desc}
						</p>
					</div>
				</figure>

			</Link>
			<div className="flex justify-between items-center w-full py-1">
				{is_new ? (
					<div className="badge badge-accent justify-start">NEW</div>
				) : (
					<div className="justify-start" />
				)}
				<CostTag price={product_price} className="justify-end" />
			</div>
		</div>
	);
}
