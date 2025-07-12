import { Price } from "@/generated/prisma";
import { formatPrice } from "@/lib/cost";

interface CostTagProps {
	price: Price
	className?: string,
}

export default function CostTag({ price, className }: CostTagProps) {
	const formatted_cost = formatPrice(price);
	return (
		<span className={`badge badge-secondary ${className}`}>{formatted_cost}</span>
	);
}
