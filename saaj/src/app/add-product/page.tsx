import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation"
import { auth_opts } from "../api/auth/[...nextauth]/route";
import AddProductForm from "@/components/AddProductForm";
import { Design, Size, Stock } from "@/generated/prisma";
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

	const name = form_data.get("name")?.toString();
	const sku = form_data.get("sku")?.toString();
	const desc = form_data.get("desc")?.toString();
	const fabric_desc = form_data.get("fabric_desc")?.toString();

	const pcs = Number(form_data.get("pcs"));
	const fabric = form_data.get("fabric")?.toString();
	const design = form_data.get("design")?.toString();
	const colour = form_data.get("colour")?.toString();

	const image_urls = form_data.getAll("image_url").map(url => url.toString());
	const cost = Number(form_data.get("cost"));

	const size_s = Boolean(form_data.get("size_s"));
	const size_m = Boolean(form_data.get("size_m"));
	const size_l = Boolean(form_data.get("size_l"));
	const size_xl = Boolean(form_data.get("size_xl"));

	const stock_s = Number(form_data.get("stock_s"));
	const stock_m = Number(form_data.get("stock_m"));
	const stock_l = Number(form_data.get("stock_l"));
	const stock_xl = Number(form_data.get("stock_xl"));

	const sizes_bools = [size_s, size_m, size_l, size_xl];
	const stock: Stock[] = [];

	if (sizes_bools[0]) {
		stock.push({ size: Size.S, qty: stock_s });
	}
	if (sizes_bools[1]) {
		stock.push({ size: Size.M, qty: stock_m });
	}
	if (sizes_bools[2]) {
		stock.push({ size: Size.L, qty: stock_l });
	}
	if (sizes_bools[3]) {
		stock.push({ size: Size.XL, qty: stock_xl });
	}

	if (!name || !sku || !desc || !image_urls[0] || !stock[0] || !cost || !fabric || !design || !colour || !fabric_desc) {
		throw ("Missing required fields.");
	}

	await prisma.product.create({
		data: {
			name: name,
			sku: sku,
			desc: desc,
			fabric_desc: fabric_desc,
			pcs: pcs,
			fabric: fabric,
			design: design as Design,
			colour: colour,
			image_urls: image_urls,
			price: cost,
			stock: stock,
		},
	});

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
