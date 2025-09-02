import { getCart } from "@/lib/cart";
import Link from "next/link";
import CartButton from "./CartButton";
import UserMenuButton from "./UserMenuButton";
import { getServerSession } from "next-auth";
import { auth_opts } from "@/app/api/auth/[...nextauth]/route";
import LogoSvg from "./LogoSVG";
import Search from "./Search";
import { getConversionRate, getCurrency } from "@/lib/currency";

export default async function Navbar() {
	const session = await getServerSession(auth_opts);
	const cart = await getCart();
	const currency = await getCurrency();
	const conversion_rate = await getConversionRate(currency);

	return (
		<div className="bg-base-200 top-0 left-0 sticky z-5 h-fit">
			<div className="navbar max-w-7xl mx-auto flex-row gap-2">
				<div className="navbar-start">
					<div className="sm:hidden join-item w-fit">
						<Search />
					</div>
				</div>
				<div className="navbar-center">
					<Link href="/" className="h-14 sm:h-24">
						<LogoSvg className="h-full" />
					</Link>
				</div>
				<div className="flex join navbar-end gap-2">
					<div className="hidden sm:block join-item">
						<Search />
					</div>
					<div className="join-item">
						<CartButton cart={cart} currency={currency} conversion_rate={conversion_rate} />
					</div>
					<div className="join-item">
						<UserMenuButton session={session} />
					</div>
				</div>
			</div>
		</div>
	);
}
