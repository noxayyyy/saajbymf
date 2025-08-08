"use client";

import { setCurrency } from "@/app/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CurrencySelectorProps {
	curr_currency: string;
}

const supported_currencies = ["PKR", "USD", "GBP", "EUR"];
const supported_countries: { [key: string]: string } = {
	"PKR": "PK",
	"USD": "US",
	"GBP": "GB",
	"EUR": "EU",
};

export default function CurrencySelector({ curr_currency }: CurrencySelectorProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const new_currency = e.target.value;
		startTransition(async () => {
			await setCurrency(new_currency);
			router.refresh();
		});
	};

	return (
		<div className={`flex rounded-md join w-fit ${pending ? "bg-base-300" : "bg-black"} text-white fixed bottom-5 right-5 z-50`}>
			<Image
				className="join-item object-contain rounded-md mr-2 ml-2 my-2"
				src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${supported_countries[curr_currency]}.svg`}
				width={40}
				height={27}
				alt={curr_currency}
			/>
			<select
				className="join-item"
				defaultValue={curr_currency}
				onChange={handleCurrencyChange}
				disabled={pending}
			>
				{supported_currencies.map((currency, idx) =>
					<option key={idx} value={currency}>{currency}</option>
				)}
			</select>
		</div>
	);
}
