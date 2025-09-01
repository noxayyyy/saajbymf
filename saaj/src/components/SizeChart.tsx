import { Size } from "@/generated/prisma";
import IconSvg from "./IconSvg";

interface SizeChartProps {
	size: Size;
}

export default function SizeChart({ size }: SizeChartProps) {
	return (
		<div>
			<button className="btn underline btn-secondary rounded-full btn-ghost" onClick={() => (document.getElementById('my_modal_2') as HTMLDialogElement).showModal()}>Size Chart</button>
			<dialog id="my_modal_2" className="modal">
				<div className="modal-box max-w-fit overflow-auto max-h-fit">
					<IconSvg className="max-w-16 mx-auto" />
					<div className="divider mb-0"></div>
					<div className="divider mt-0"></div>
					<div>
						<h1 className="text-lg py-1 font-serif">SHIRT</h1>
						<table className="table text-center">
							<thead>
								<tr>
									<th>Size</th>
									<th>Chest</th>
									<th>Waist</th>
									<th>Hip</th>
									<th>Sleeves</th>
									<th>Shoulders</th>
									<th>Short Shirt Length</th>
									<th>Long Shirt Length</th>
								</tr>
							</thead>
							<tbody>
								<tr className={size === Size.S ? "bg-gray-200" : ""}>
									<th>S</th>
									<td>19</td>
									<td>18</td>
									<td>20</td>
									<td>22</td>
									<td>14</td>
									<td>34</td>
									<td>48</td>
								</tr>
								<tr className={size === Size.M ? "bg-gray-200" : ""}>
									<th>M</th>
									<td>21</td>
									<td>20</td>
									<td>23</td>
									<td>22</td>
									<td>14.5</td>
									<td>36</td>
									<td>48</td>
								</tr>
								<tr className={size === Size.L ? "bg-gray-200" : ""}>
									<th>L</th>
									<td>23</td>
									<td>22</td>
									<td>24</td>
									<td>23</td>
									<td>15</td>
									<td>36</td>
									<td>48</td>
								</tr>
								<tr className={size === Size.XL ? "bg-gray-200" : ""}>
									<th>XL</th>
									<td>24</td>
									<td>23</td>
									<td>25</td>
									<td>23</td>
									<td>15.5</td>
									<td>38</td>
									<td>48</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="divider"></div>
					<div>
						<h1 className="text-lg py-1 font-serif">PANTS</h1>
						<table className="table text-center">
							<thead>
								<tr>
									<th>Size</th>
									<th>Length</th>
									<th>Bottom</th>
									<th>Waist</th>
									<th>Hip</th>
								</tr>
							</thead>
							<tbody>
								<tr className={size === Size.S ? "bg-gray-200" : ""}>
									<th>S</th>
									<td>37</td>
									<td>6</td>
									<td>30</td>
									<td>40</td>
								</tr>
								<tr className={size === Size.M ? "bg-gray-200" : ""}>
									<th>M</th>
									<td>38</td>
									<td>7</td>
									<td>32</td>
									<td>42</td>
								</tr>
								<tr className={size === Size.L ? "bg-gray-200" : ""}>
									<th>L</th>
									<td>39</td>
									<td>7.5</td>
									<td>36</td>
									<td>44</td>
								</tr>
								<tr className={size === Size.XL ? "bg-gray-200" : ""}>
									<th>XL</th>
									<td>40</td>
									<td>8</td>
									<td>38</td>
									<td>46</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
	);
}
