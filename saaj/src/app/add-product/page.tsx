import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation"
import { auth_opts } from "../api/auth/[...nextauth]/route";
import AddProductForm from "@/components/AddProductForm";
import { countryToCurrency, supported_countries } from "../../../middleware";

export const metadata = {
	title: "Add Product - Saaj by MF"
}

async function addProduct(form_data: FormData) {
	"use server";

	const session = await getServerSession(auth_opts);

	if (!session) {
		redirect("/api/auth/signin?callbackUrl=/add-product");
	}

	let name = form_data.get("name")?.toString();
	const sku = form_data.get("sku")?.toString();
	const desc = form_data.get("desc")?.toString();
	const image_urls = form_data.getAll("image_url").map(url => url.toString());
	let cost = Number(form_data.get("cost"));
	const currency_rates = await prisma.currency.findMany({});

	if (!name || !sku || !desc || !image_urls[0] || !cost) {
		throw Error("Missing required fields");
	}

	for (let i = 0; i < 50; i++) {
		name = `${name} ${i}`;
		cost = Math.random() * 500;
		for (let i = image_urls.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[image_urls[i], image_urls[j]] = [image_urls[j], image_urls[i]];
		}
		await prisma.product.create({
			data: {
				name,
				sku,
				desc,
				image_urls,
				def_price: cost,
				prices: {
					create: supported_countries.map((country) => {
						return {
							currency: countryToCurrency[country],
							amount: Math.ceil(
								(cost * currency_rates.filter(
									(rate) => rate.name === countryToCurrency[country]
								)[0].rate) / (country === "PK" ? 100 : 10)
							) * (country === "PK" ? 100 : 10)
						}
					})
				}
			},
		});
		name = name.split(" ")[0];
	}

	// redirect("/");
}

export default async function AddProductPage() {
	const session = await getServerSession(auth_opts);

	if (!session) {
		redirect("/api/auth/signin?callbackUrl=/add-product");
	}

	return (
		<div>
			<h1 className="text-lg mb-3 font-bold">Add Product</h1>
			<AddProductForm action={addProduct} />
		</div >
	)
}
