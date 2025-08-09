import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation"
import { auth_opts } from "../api/auth/[...nextauth]/route";
import AddProductForm from "@/components/AddProductForm";
import { Size, Stock } from "@/generated/prisma";
import { env } from "@/lib/env";

export const metadata = {
	title: "Add Product - Saaj by MF"
}

async function addProduct(form_data: FormData) {
	"use server";

	const session = await getServerSession(auth_opts);

	if (!session) {
		redirect("/api/auth/signin?callbackUrl=/add-product");
	}

	const admins = env.ADMINS.split(",");
	if (!admins.includes(session.user.id)) {
		notFound();
	}

	let name = form_data.get("name")?.toString();
	const sku = form_data.get("sku")?.toString();
	const desc = form_data.get("desc")?.toString();
	const image_urls = form_data.getAll("image_url").map(url => url.toString());
	let cost = Number(form_data.get("cost"));

	const size_s = Boolean(form_data.get("size_s"));
	const size_m = Boolean(form_data.get("size_m"));
	const size_l = Boolean(form_data.get("size_l"));
	const size_xl = Boolean(form_data.get("size_xl"));

	const stock_s = Number(form_data.get("stock_s"));
	const stock_m = Number(form_data.get("stock_m"));
	const stock_l = Number(form_data.get("stock_l"));
	const stock_xl = Number(form_data.get("stock_xl"));

	const sizes_bools = [size_s, size_m, size_l, size_xl];
	const sizes = [];
	const stocks: Stock[] = [];

	if (sizes_bools[0]) {
		sizes.push(Size.SMALL);
		stocks.push({ size: Size.SMALL, qty: stock_s });
	}
	if (sizes_bools[1]) {
		sizes.push(Size.MEDIUM);
		stocks.push({ size: Size.MEDIUM, qty: stock_m });
	}
	if (sizes_bools[2]) {
		sizes.push(Size.LARGE);
		stocks.push({ size: Size.LARGE, qty: stock_l });
	}
	if (sizes_bools[3]) {
		sizes.push(Size.EXTRA_LARGE);
		stocks.push({ size: Size.EXTRA_LARGE, qty: stock_xl });
	}

	if (!name || !sku || !desc || !image_urls[0] || !sizes[0] || !cost) {
		throw ("Missing required fields.");
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
				price: cost,
				sizes: sizes as Size[],
				stocks: stocks,
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
