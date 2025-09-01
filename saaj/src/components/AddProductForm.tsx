"use client";

import { useState } from "react";
import FormSubmitButton from "./FormSubmitButton";
import { Design } from "@/generated/prisma";

interface AddProductFormProps {
	action: (arg: FormData) => Promise<void>;
}

export default function AddProductForm({ action }: AddProductFormProps) {
	const [image_fields, setImageFields] = useState<number[]>([0]);

	const addImageUrlField = () => {
		setImageFields(prev => [...prev, Date.now()]);
	};

	return (
		<form action={action}>
			<input
				name="name"
				placeholder="Name"
				className="input input-bordered mb-3 w-full font-sans"
				required
			/>
			<input
				name="sku"
				placeholder="SKU"
				className="input input-bordered mb-3 w-full font-sans"
				required
			/>
			<textarea
				name="desc"
				className="textarea textarea-bordered mb-3 w-full font-sans"
				placeholder="Description"
				required
			/>
			<textarea
				name="fabric_desc"
				className="textarea textarea-bordered mb-3 w-full font-sans"
				placeholder="Fabric Description e.g. Shirt: Raw Silk &emsp\; Trouser: Raw Silk &emsp\; Dupatta: Organza"
				required
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<label>
					<span className="fieldset-label">Pcs</span>
					<input
						name="pcs"
						type="number"
						min="1"
						defaultValue="1"
						placeholder="Pcs"
						className="input input-bordered mb-3 font-sans"
					/>
				</label>
				<label>
					<span className="fieldset-label">Fabric</span>
					<input
						name="fabric"
						placeholder="Fabric"
						className="input input-bordered mb-3 font-sans"
						required
					/>
				</label>
				<label>
					<span className="fieldset-label">Design</span>
					<select
						name="design"
						className="select mb-3 font-sans"
						required
					>
						<option value={Design.Embroidered}>Embroidered</option>
						<option value={Design.Printed}>Printed</option>
					</select>
				</label>
				<label>
					<span className="fieldset-label">Colour</span>
					<input
						name="colour"
						placeholder="Colour"
						className="input input-bordered mb-3 font-sans"
						required
					/>
				</label>
			</div>
			<fieldset className="fieldset font-bold flex w-full mb-3">
				<legend className="fieldset-legend">Sizes</legend>
				<label className="label px-2">
					<input type="checkbox" name="size_s" className="checkbox checked:checkbox-primary" required />
					Small
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_m" className="checkbox checked:checkbox-primary" required />
					Medium
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_l" className="checkbox checked:checkbox-primary" required />
					Large
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_xl" className="checkbox checked:checkbox-primary" required />
					X Large
				</label>
			</fieldset>

			<div className="mb-3 w-full">
				<legend className="fieldset-legend">Stocks</legend>
				<div className="flex flex-col lg:flex-row justify-center w-full">
					<div className="join p-2 w-full">
						<div className="join-item min-w-23 btn btn-secondary btn-active">Small</div>
						<input
							name="stock_s"
							type="number"
							min="0"
							defaultValue="0"
							placeholder="Quantity"
							className="input input-bordered w-full join-item font-sans"
						/>
					</div>
					<div className="join p-2 w-full">
						<div className="join-item min-w-23 btn btn-secondary btn-active">Medium</div>
						<input
							name="stock_m"
							type="number"
							min="0"
							defaultValue="0"
							placeholder="Quantity"
							className="input input-bordered w-full join-item font-sans"
						/>
					</div>
					<div className="join p-2 w-full">
						<div className="join-item min-w-23 btn btn-secondary btn-active">Large</div>
						<input
							name="stock_l"
							type="number"
							min="0"
							defaultValue="0"
							placeholder="Quantity"
							className="input input-bordered w-full join-item font-sans"
						/>
					</div>
					<div className="join p-2 w-full">
						<div className="join-item min-w-23 btn btn-secondary btn-active">X Large</div>
						<input
							name="stock_xl"
							type="number"
							min="0"
							defaultValue="0"
							placeholder="Quantity"
							className="input input-bordered w-full join-item font-sans"
						/>
					</div>
				</div>
			</div>

			<div className="mb-3">
				{image_fields.map((key, index) => (
					<input
						key={key}
						name="image_url"
						type="url"
						placeholder={`Image URL ${index + 1}`}
						className="input input-bordered mb-2 w-full font-sans"
					/>
				))}
				<button type="button" className="btn btn-primary" onClick={addImageUrlField}>
					+
				</button>
			</div>

			<label className="input input-bordered mb-3 w-full">
				<div>Rs.</div>
				<input
					name="cost"
					placeholder="Cost"
					type="number"
					className="font-sans"
					step="0.01"
					min="0"
					required
				/>
			</label>
			<FormSubmitButton className="btn-block">Add Product</FormSubmitButton>
		</form >
	);
}
