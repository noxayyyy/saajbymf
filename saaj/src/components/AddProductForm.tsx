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
				required
				name="name"
				placeholder="Name"
				className="input input-bordered mb-3 w-full"
			/>
			<input
				required
				name="sku"
				placeholder="SKU"
				className="input input-bordered mb-3 w-full"
			/>
			<textarea
				required
				name="desc"
				className="textarea textarea-bordered mb-3 w-full"
				placeholder="Description"
			/>

			<div className="mb-3">
				{image_fields.map((key, index) => (
					<input
						key={key}
						required
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
				<div>$</div>
				<input
					required
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
