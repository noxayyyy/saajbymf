import { formatPrice } from "@/lib/cost";

interface CostTagProps {
	price: number,
	currency: string,
	conversion_rate: number,
	className?: string,
}

export default function CostTag({ price, currency, conversion_rate, className }: CostTagProps) {
	const formatted_cost = formatPrice(price * conversion_rate, currency);
	return (
		<span className={`badge badge-secondary font-sans ${className}`}>{formatted_cost}</span>
	);
}
