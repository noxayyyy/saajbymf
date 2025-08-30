"use client";

import Image from "next/image";
import React, { useState, useRef, MouseEvent } from "react";

interface Image {
	id: number | string;
	src: string;
	alt: string;
}

interface ProductImageMagnifierProps {
	images: Image[];
}

const Magnifier = ({ image }: { image: Image }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		setCursorPosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
	};
	const handleMouseEnter = () => setIsVisible(true);
	const handleMouseLeave = () => setIsVisible(false);

	const containerWidth = containerRef.current?.offsetWidth ?? 0;
	const containerHeight = containerRef.current?.offsetHeight ?? 0;

	const MAGNIFIER_SIZE = 400;
	const OVERLAY_SIZE = 150;

	const overlayX = Math.max(0, Math.min(cursorPosition.x - OVERLAY_SIZE / 2, containerWidth - OVERLAY_SIZE));
	const overlayY = Math.max(0, Math.min(cursorPosition.y - OVERLAY_SIZE / 2, containerHeight - OVERLAY_SIZE));

	const zoomFactor = MAGNIFIER_SIZE / OVERLAY_SIZE;

	const magnifierStyle = {
		backgroundImage: `url(${image.src})`,
		backgroundRepeat: "no-repeat",
		backgroundSize: `${containerWidth * zoomFactor}px ${containerHeight * zoomFactor}px`,
		backgroundPosition: `-${overlayX * zoomFactor}px -${overlayY * zoomFactor}px`,
	};

	const overlayClipPath = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${overlayY}px, ${overlayX}px ${overlayY}px, ${overlayX}px ${overlayY + OVERLAY_SIZE}px, ${overlayX + OVERLAY_SIZE}px ${overlayY + OVERLAY_SIZE}px, ${overlayX + OVERLAY_SIZE}px ${overlayY}px, ${overlayX}px ${overlayY}px, 0 ${overlayY}px, 0 0)`;

	return (
		<div className="relative">
			<div
				ref={containerRef}
				onMouseMove={handleMouseMove}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="w-auto h-[800px] relative rounded-lg cursor-crosshair"
			>
				<Image
					src={image.src}
					alt={image.alt}
					width={600}
					height={600}
					className="w-auto h-full rounded-lg object-cover"
				/>
				{isVisible && (
					<>
						<div
							className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
							style={{
								clipPath: overlayClipPath,
								backgroundColor: "rgba(0, 0, 0, 0.4)",
							}}
						/>
						<div
							className="absolute border-2 border-white pointer-events-none"
							style={{
								left: `${overlayX}px`,
								top: `${overlayY}px`,
								width: `${OVERLAY_SIZE}px`,
								height: `${OVERLAY_SIZE}px`,
							}}
						/>
					</>
				)}
			</div>
			{isVisible && (
				<div
					className="hidden lg:block absolute left-full top-0 ml-8 border border-base-300 z-4"
					style={{
						...magnifierStyle,
						width: `${MAGNIFIER_SIZE}px`,
						height: `${MAGNIFIER_SIZE}px`,
					}}
				/>
			)}
		</div>
	);
};

function ProductImageMagnifier({ images }: ProductImageMagnifierProps) {
	const [activeImage, setActiveImage] = useState<Image>(images[0]);
	if (!images || images.length === 0) return null;

	return (

		<div className="flex flex-col lg:flex-row gap-4 min-w-fit w-full relative">
			{/* Thumbnail Column */}
			<div className="flex flex-row lg:flex-col gap-2 order-last lg:order-first">
				{images.map((image) => (
					<div
						key={image.id}
						onClick={() => setActiveImage(image)}
						className={`w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-md cursor-pointer border-2 transition-all duration-200 ${activeImage.id === image.id ? "border-primary" : "border-base-300 hover:border-base-content/50"}`}
					>
						<Image
							src={image.src}
							alt={image.alt}
							width={600}
							height={600}
							className="w-full h-full object-cover rounded" />
					</div>
				))}
			</div>

			{/* Main Display Area */}
			<div className="w-full min-w-full">
				<div className="hidden lg:flex">
					<Magnifier image={activeImage} />
				</div>

				<div className="flex justify-center w-full max-h-[600px] rounded-lg lg:hidden">
					<Image
						src={activeImage.src}
						alt={activeImage.alt}
						width={600}
						height={600}
						className="h-full w-auto max-h-[600px] object-cover rounded-lg"
					/>
				</div>
			</div>
		</div>
	);
}

export default ProductImageMagnifier;
