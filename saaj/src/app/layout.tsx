import type { Metadata } from "next"; import { Geist, Geist_Mono } from "next/font/google";
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
	variable: "--font-geist-mono",
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
		<html lang="en" data-theme="saaj">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SessionProvider>
					<Navbar />
					<main className="p-4 max-w-7xl m-auto min-w-[300px]">
						{children}
					</main>
					<Footer />
					<CurrencySelector curr_currency={currency} />
				</SessionProvider>
			</body>
		</html>
	);
}
