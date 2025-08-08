"use client";

import { useState } from "react";
import FormSubmitButton from "./FormSubmitButton";

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
				className="input input-bordered mb-3 w-full"
			/>
			<input
				name="sku"
				placeholder="SKU"
				className="input input-bordered mb-3 w-full"
			/>
			<textarea
				name="desc"
				className="textarea textarea-bordered mb-3 w-full"
				placeholder="Description"
			/>

			<fieldset className="fieldset font-bold flex w-full mb-3">
				<legend className="fieldset-legend">Sizes</legend>
				<label className="label px-2">
					<input type="checkbox" name="size_s" className="checkbox checked:checkbox-primary" />
					Small
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_m" className="checkbox checked:checkbox-primary" />
					Medium
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_l" className="checkbox checked:checkbox-primary" />
					Large
				</label>
				<label className="label px-2">
					<input type="checkbox" name="size_xl" className="checkbox checked:checkbox-primary" />
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
							className="input input-bordered w-full join-item"
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
							className="input input-bordered w-full join-item"
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
							className="input input-bordered w-full join-item"
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
							className="input input-bordered w-full join-item"
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
						className="input input-bordered mb-2 w-full"
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
					step="0.01"
					min="0"
				/>
			</label>
			<FormSubmitButton className="btn-block">Add Product</FormSubmitButton>
		</form>
	);
}
