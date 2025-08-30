export default function LoadingPage() {
	return (
		<div className="flex w-full flex-col p-4">
			<div className="skeleton h-192 w-full bg-gray-300"></div>
			<div className="flex w-full justify-between mt-4">
				<div className="justify-start skeleton bg-gray-300 rounded-4xl w-[97.5px] h-[40px]"></div>
				<div className="justify-end skeleton bg-gray-300 rounded-4xl w-[215px] h-[40px]"></div>
			</div>
			<div className="flex flex-col">
				<div className="my-4 justify-items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
					<div className="skeleton bg-gray-300 aspect-[4/5] w-2xs"></div>
				</div>
			</div>
		</div>
	)
}
