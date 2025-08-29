import { prisma } from "@/lib/prisma";

interface ConfirmOrderPageProps {
	params: Promise<{ id: string, }>
};

export default async function ConfirmOrderPage({ params }: ConfirmOrderPageProps) {
	const order_id = (await params).id;
	let ok = true;

	try {
		await prisma.order.update({
			where: {
				id: order_id,
			},
			data: {
				status: "CONFIRMED",
			},
		});
	} catch (err) {
		ok = false;
	}

	return (
		<div>
			<h1>`Order# ${ok ? "Confirmed" : "Failed"}`</h1>
		</div>
	)
}
