"use client";

import { useEffect, useState } from "react";
import { PhoneInput } from "react-international-phone";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import 'react-international-phone/style.css';
import "react-country-state-city/dist/react-country-state-city.css";
import { City, Country, State } from "react-country-state-city/dist/esm/types";
import FormSubmitButton from "./FormSubmitButton";

interface CheckoutInfoFormProps {
	cart_id: string,
	setCountryCodeAction: (name: string) => void,
	addOrderAction: (form_data: FormData, cart_id: string, total: string) => Promise<void>,
	total: string,
}

export default function CheckoutInfoForm({ cart_id, setCountryCodeAction: setCountryCode, addOrderAction: addOrder, total }: CheckoutInfoFormProps) {
	const [country_id, setCountryId] = useState<number | null>(null);
	const [state_id, setStateId] = useState<number | null>(null);

	const [countries, setCountryList] = useState<Country[]>([]);
	const [states, setStateList] = useState<State[]>([]);
	const [cities, setCityList] = useState<City[]>([]);

	const VALID_COUNTRIES = ["UK", "PK", "US"]

	const [has_states, setHasStates] = useState(false);
	const [has_cities, setHasCities] = useState(false);

	useEffect(() => {
		GetCountries().then((res) => {
			setCountryList(res.filter((c) => VALID_COUNTRIES.includes(c.iso2) || c.region === "Europe"));
		});
	}, []);
	useEffect(() => {
		if (country_id === null) return;

		GetState(country_id).then((res) => {
			setStateList(res);
			setHasStates(res.length > 0);
		});
	}, [country_id]);
	useEffect(() => {
		if (state_id === null || country_id === null) return;

		GetCity(country_id, state_id).then((res) => {
			setCityList(res);
			setHasCities(res.length > 0)
		});
	}, [state_id, country_id]);

	return (
		<div className="collapse collapse-arrow lg:collapse-open">
			<input type="checkbox" className="lg:pointer-events-none" defaultChecked />
			<h1 className="font-semibold collapse-title text-lg">Checkout Information</h1>
			<form
				className="space-y-4 max-w-xl mx-auto p-4 md:p-8 rounded-lg shadow-lg collapse-content"
				action={(e) => addOrder(e, cart_id, total)}
			>
				{/* First Name & Last Name (in a grid for side-by-side layout) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">First Name</span>
						</label>
						<input
							type="text"
							name="firstName"
							placeholder="John"
							className="input input-ghost border-b-black w-full rounded-none focus:outline-hidden focus:border-b-black"
							required
							minLength={2}
						/>
					</div>
					<div className="form-control">
						<label className="label">
							<span className="label-text">Last Name</span>
						</label>
						<input
							type="text"
							name="lastName"
							placeholder="Doe"
							className="input input-ghost border-b-black w-full rounded-none focus:outline-hidden focus:border-b-black"
							required
							minLength={2}
						/>
					</div>
				</div>

				{/* Email */}
				<div className="form-control">
					<label className="label">
						<span className="label-text">Email Address</span>
					</label>
					<input
						type="email"
						name="email"
						placeholder="john.doe@example.com"
						className="input input-ghost border-b-black w-full rounded-none focus:outline-hidden focus:border-b-black"
						required
					/>
				</div>

				{/* Mobile Number */}
				<div className="form-control">
					<label className="label pb-2">
						<span className="label-text">Mobile Number</span>
					</label>
					<PhoneInput
						defaultCountry="pk"
						required
						name="phone"
						style={{
							"--react-international-phone-border-color": "black",
						} as React.CSSProperties}
					/>
				</div>

				{/* Address */}
				<div className="form-control">
					<label className="label">
						<span className="label-text">Address</span>
					</label>
					<div className="pt-2">
						<input
							type="text"
							name="street"
							placeholder="Street Address"
							className="input input-ghost border-b-black w-full rounded-none focus:outline-hidden focus:border-b-black"
							required
							minLength={2}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 pt-2">
						<label>
							<span className="text-xs opacity-70">Country</span>
							<select
								onChange={(e) => {
									const [id, code] = e.target.value.split(',');
									setCountryId(parseInt(id));
									setCountryCode(code);
								}}
								className="select select-ghost border-b-black rounded-none focus:outline-hidden focus:border-b-black"
								name="country"
								required
							>
								<option value={""}>-- Select Country --</option>
								{
									countries.map((c) => (
										<option key={c.id} value={`${c.id},${c.iso2}`}>
											{c.name}
										</option>
									))
								}
							</select>
						</label>
						<label>
							<span className="text-xs opacity-70">State</span>
							<select
								onChange={(e) => {
									setStateId(parseInt(e.target.value.split(',')[0]));
								}}
								disabled={!has_states}
								className="select select-ghost border-b-black rounded-none focus:outline-hidden focus:border-b-black disabled:select-ghost"
								name="state"
								required
							>
								<option value={""}>-- Select State --</option>
								{
									states.map((s) => (
										<option key={s.id} value={`${s.id},${s.name}`}>
											{s.name}
										</option>
									))
								}
							</select>
						</label>
						<label>
							<span className="text-xs opacity-70">City</span>
							<select
								disabled={!has_cities}
								className="select select-ghost border-b-black rounded-none focus:outline-hidden focus:border-b-black disabled:select-ghost"
								name="city"
							>
								<option value={""}>-- Select City --</option>
								{
									cities.map((c) => (
										<option key={c.id} value={`${c.id},${c.name}`}>
											{c.name}
										</option>
									))
								}
							</select>
						</label>
						<label>
							<span className="text-xs opacity-70">Postal Code</span>
							<input
								type="text"
								name="zip"
								placeholder="Postal Code"
								className="input input-ghost border-b-black w-full rounded-none focus:outline-hidden focus:border-b-black"
								required
								minLength={2}
							/>
						</label>
					</div>
				</div>

				<div className="form-control pt-2 flex flex-col">
					<label className="label pb-2">
						<span className="label-text">Payment</span>
					</label>
					<div className="card border-black bg-gray-300 text-base-content mb-2">
						<div className="card-body">
							<p className="">
								Please transfer your total payment amount using the bank transfer details below and attach proof of payment here.
								<br />
								<br />
								Meezan Bank - MOZANG ROAD
								<br />
								A/C Title: MF CLOTHING
								<br />
								IBAN: PK11MEZN0011480109151803
								<br />
								A/C#: 11480109151803
								<br />
								<br />
								Please ensure you share a screenshot of your payment with our team so that your order can be processed.
							</p>
						</div>
					</div>
					<input
						type="file"
						accept="image/*"
						name="payment"
						placeholder="Image"
						className="file-input file-input-secondary file-input-ghost border-b-black rounded-none focus:outline-none focus:border-b-black"
						style={{
							"--radius-field": "0"
						} as React.CSSProperties}
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file && file.size < 5 * 1024 * 1024) return;
							alert("File too large! Please upload image under 5MB.");
							e.target.value = "";
						}}
						required
					/>
				</div>
				<FormSubmitButton className="mx-auto w-full">Place Order</FormSubmitButton>
			</form>
		</div>
	);
}
