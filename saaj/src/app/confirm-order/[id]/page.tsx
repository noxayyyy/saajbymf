import { env } from "@/lib/env";

interface ConfirmOrderPageProps {
	params: Promise<{ id: string, }>
};

export default async function ConfirmOrderPage({ params }: ConfirmOrderPageProps) {
	const order_id = (await params).id;
	console.log(`Order: ${order_id}`);

	const res = await fetch("https://saajbymf.com/api/update-order/", {
		method: "POST",
		headers: {
			"ContentType": "application/json",
			"Authorization": `Bearer ${env.ORDER_SECRET}`,
		},
		body: JSON.stringify({
			"order": order_id,
		}),
	});
	console.log(res.status);
	console.log(res.statusText);

	return (
		<div>
			<h1>`Order# ${res.ok ? "Confirmed" : "Failed"}`</h1>
		</div>
	)
}
