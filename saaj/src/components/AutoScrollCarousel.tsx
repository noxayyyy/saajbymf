"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const slides = [
	{
		id: 1,
		src: "https://lh3.googleusercontent.com/d/19u8Dn_S-ojrpgD6kcUmsSGUhJ9LbpHb9",
		alt: "First slide"
	},
	{
		id: 2,
		src: "https://lh3.googleusercontent.com/d/1Xd2z2t6C0lz1abcHWoVbJnk2PA03TfD2",
		alt: "Second slide"
	},
	{
		id: 3,
		src: "https://lh3.googleusercontent.com/d/1Lj3Y4SAyy5sCMmw82hhmsWkoh3fkHmdM",
		alt: "Third slide"
	},
	{
		id: 4,
		src: "https://lh3.googleusercontent.com/d/1PiGBF_iSg6XZnjOBFwZK5v-WxrNOZ_9h",
		alt: "Fourth slide"
	}
];

const renderedSlides = [...slides, { ...slides[0], id: "clone" }];

interface AutoScrollCarouselProps {
	className?: string;
}

export default function AutoScrollCarousel({ className }: AutoScrollCarouselProps) {
	const scrollInterval = 3000;
	const carouselRef = useRef<HTMLDivElement>(null);
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		const interval = setInterval(() => {
			setCurrentSlide(prev => prev + 1);
		}, scrollInterval);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		carousel.scrollTo({
			left: carousel.clientWidth * currentSlide,
			behavior: 'smooth',
		});

		if (currentSlide === slides.length) {
			setTimeout(() => {
				if (carouselRef.current) {
					carouselRef.current.scrollTo({
						left: 0,
						behavior: "instant",
					});
					setCurrentSlide(0);
				}
			}, 2500);
		}
	}, [currentSlide]);

	return (
		<div className={className} >
			<div className="carousel w-full h-full" ref={carouselRef}>
				{renderedSlides.map((slide) => (
					<div key={slide.id} id={`slide${slide.id}`} className="carousel-item w-full relative">
						<Image
							src={slide.src}
							className={`object-cover object-center h-full md:w-full`}
							fill
							alt={slide.alt}
							priority={slide.id === 1}
							sizes="100vw"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
