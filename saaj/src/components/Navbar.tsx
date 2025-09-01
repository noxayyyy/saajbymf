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
				</div>
				<div className="navbar-start md:navbar-center">
					<Link href="/" className="h-24">
						<LogoSvg className="h-full" />
					</Link>
				</div>
				<div className="navbar-center flex-col md:flex-row gap-1 join">
					<Search className="join-item" />
					<CartButton cart={cart} currency={currency} conversion_rate={conversion_rate} className="join-item" />
					<UserMenuButton session={session} className="join-item" />
				</div>
			</div>
		</div>
	);
}
