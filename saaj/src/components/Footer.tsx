import Link from "next/link";

export default function Footer() {
	return (
		<footer className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
			<nav className="grid grid-flow-col gap-4">
				{
					// <Link className="link link-hover">About us</Link>
					// <Link className="link link-hover">Contact</Link>
					// <Link className="link link-hover">Jobs</Link>
					// <Link className="link link-hover">Press kit</Link>
				}
			</nav>
			<nav>
				<div className="grid grid-flow-col gap-4">
					<Link
						className="link"
						href="https://facebook.com/saajbymf"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">    <path d="M12,2C6.477,2,2,6.477,2,12c0,5.013,3.693,9.153,8.505,9.876V14.65H8.031v-2.629h2.474v-1.749 c0-2.896,1.411-4.167,3.818-4.167c1.153,0,1.762,0.085,2.051,0.124v2.294h-1.642c-1.022,0-1.379,0.969-1.379,2.061v1.437h2.995 l-0.406,2.629h-2.588v7.247C18.235,21.236,22,17.062,22,12C22,6.477,17.523,2,12,2z" /></svg>
					</Link>
					<Link
						className="link"
						href="https://instagram.com/saajbymf"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">    <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z" /></svg>
					</Link>
					<Link
						className="link"
						href="https://tiktok.com/@saajbymf"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path d="M 6 3 C 4.3550302 3 3 4.3550302 3 6 L 3 18 C 3 19.64497 4.3550302 21 6 21 L 18 21 C 19.64497 21 21 19.64497 21 18 L 21 6 C 21 4.3550302 19.64497 3 18 3 L 6 3 z M 12 7 L 14 7 C 14 8.005 15.471 9 16 9 L 16 11 C 15.395 11 14.668 10.734156 14 10.285156 L 14 14 C 14 15.654 12.654 17 11 17 C 9.346 17 8 15.654 8 14 C 8 12.346 9.346 11 11 11 L 11 13 C 10.448 13 10 13.449 10 14 C 10 14.551 10.448 15 11 15 C 11.552 15 12 14.551 12 14 L 12 7 z" /></svg>
					</Link>
				</div>
			</nav>
			<aside>
				<p>Copyright © {new Date().getFullYear()} - All rights reserved by MF Clothing</p>
			</aside>
		</footer>
	);
}
