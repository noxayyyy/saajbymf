import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "../components/SessionProvider";
import CurrencySelector from "@/components/CurrencySelector";
import { getCurrency } from "@/lib/currency";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

const cinzelSerif = Cinzel({
	variable: "--font-serif",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Saaj by MF",
	description: "placeholder",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const currency = await getCurrency();

	return (
		<html lang="en" data-theme="saaj" className="scroll-smooth">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${cinzelSerif.variable} antialiased font-serif`}
			>
				<SessionProvider>
					<div className="flex flex-col min-h-screen overflow-x-clip">
						<Navbar />
						<main className="flex-1 flex-grow p-4 max-w-7xl w-full m-auto min-w-[300px] overflow-visible">
							{children}
						</main>
						<Footer />
					</div>
					<CurrencySelector curr_currency={currency} />
				</SessionProvider>
			</body>
		</html>
	);
}
