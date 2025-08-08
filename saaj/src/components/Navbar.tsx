import { getCart } from "@/lib/cart";
import Link from "next/link";
import { redirect } from "next/navigation";
import CartButton from "./CartButton";
import UserMenuButton from "./UserMenuButton";
import { getServerSession } from "next-auth";
import { auth_opts } from "@/app/api/auth/[...nextauth]/route";
import LogoSvg from "./LogoSVG";
import Search from "./Search";

async function searchProducts(form_data: FormData) {
	"use server";

	const search_query = form_data.get("search_query")?.toString();

	if (search_query) {
		redirect(`/search?query=${search_query}`);
	}
}

export default async function Navbar() {
	const session = await getServerSession(auth_opts);
	const cart = await getCart();

	return (
		<div className="bg-base-200">
			<div className="navbar max-w-7xl mx-auto flex-col sm:flex-row gap-2">
				<div className="navbar-start">
				</div>
				<div className="navbar-center">
					<Link href="/" className="h-24 gap-2">
						<LogoSvg className="h-full" />
					</Link>
				</div>
				<div className="navbar-end gap-2 join">
					<Search />
					<CartButton cart={cart} />
					<UserMenuButton session={session} />
				</div>
			</div>
		</div>
	);
}
