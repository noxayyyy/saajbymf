import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
	LayoutDashboard, Package, FolderOpen, ShoppingCart, Users,
	Settings, LogOut, ArrowLeft, Image, Menu, X,
} from "lucide-react";

const adminLinks = [
	{ label: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ label: "Products", href: "/admin/products", icon: Package },
	{ label: "Collections", href: "/admin/collections", icon: FolderOpen },
	{ label: "Banners", href: "/admin/banners", icon: Image },
	{ label: "Orders", href: "/admin/orders", icon: ShoppingCart },
	{ label: "Customers", href: "/admin/customers", icon: Users },
	{ label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const [location, navigate] = useLocation();
	const { user, logout, isAdmin, isLoading } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const { data: settings } = useQuery<Record<string, string>>({
		queryKey: ["/api/settings/public"],
	});

	const logoSrc = settings?.site_logo || "https://isnohirrymxtpfgmxsgp.supabase.co/storage/v1/object/public/saaj-uploads/logo.png";

	useEffect(() => {
		if (!isLoading && (!user || !isAdmin)) {
			navigate("/login");
		}
	}, [isLoading, user, isAdmin, navigate]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-pulse font-sans text-gray-400 text-sm">Loading...</div>
			</div>
		);
	}

	if (!user || !isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-pulse font-sans text-gray-400 text-sm">Redirecting...</div>
			</div>
		);
	}

	const currentPage = adminLinks.find(
		(l) => location === l.href || (l.href !== "/admin" && location.startsWith(l.href))
	);

	const sidebarContent = (
		<>
			<div className="p-6 border-b border-white/10">
				<Link href="/">
					<div className="flex items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
						<ArrowLeft className="w-4 h-4" />
						<span className="font-sans text-[10px] tracking-[0.2em] uppercase">Back to Site</span>
					</div>
				</Link>
				<div className="mt-4">
					<img
						src={logoSrc}
						alt="SAAJ Admin"
						className="h-10 w-auto object-contain brightness-0 invert"
					/>
					<p className="font-sans text-[10px] tracking-[0.15em] uppercase opacity-60 mt-1">
						Management Panel
					</p>
				</div>
			</div>

			<nav className="flex-1 py-4">
				{adminLinks.map((link) => {
					const Icon = link.icon;
					const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
					return (
						<Link key={link.href} href={link.href}>
							<div
								onClick={() => setSidebarOpen(false)}
								className={`flex items-center gap-3 px-6 py-3 font-sans text-xs tracking-[0.1em] uppercase cursor-pointer transition-colors ${isActive
										? "bg-white/10 text-white"
										: "text-white/60 hover:text-white hover:bg-white/5"
									}`}
							>
								<Icon className="w-4 h-4" />
								{link.label}
							</div>
						</Link>
					);
				})}
			</nav>

			<div className="p-6 border-t border-white/10">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-sans text-xs">
						{user.firstName[0]}{user.lastName[0]}
					</div>
					<div>
						<p className="font-sans text-xs">{user.firstName} {user.lastName}</p>
						<p className="font-sans text-[10px] opacity-60">Admin</p>
					</div>
				</div>
				<button
					onClick={async () => { await logout(); navigate("/"); }}
					className="flex items-center gap-2 font-sans text-[10px] tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors"
				>
					<LogOut className="w-3 h-3" />
					Sign Out
				</button>
			</div>
		</>
	);

	return (
		<div className="flex min-h-screen bg-gray-50">
			<aside className="hidden lg:flex w-64 bg-primary text-primary-foreground flex-col fixed h-full z-40 overflow-y-auto">
				{sidebarContent}
			</aside>

			{sidebarOpen && (
				<div className="lg:hidden fixed inset-0 z-[100]">
					<div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
					<aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary text-primary-foreground flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
						<button
							onClick={() => setSidebarOpen(false)}
							className="absolute top-4 right-4 text-white/60 hover:text-white"
						>
							<X className="w-5 h-5" />
						</button>
						{sidebarContent}
					</aside>
				</div>
			)}

			<main className="flex-1 lg:ml-64">
				<div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
					<button onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-black">
						<Menu className="w-5 h-5" />
					</button>
					<div className="flex items-center gap-2">
						{currentPage && <currentPage.icon className="w-4 h-4 text-gray-500" />}
						<span className="font-sans text-sm font-medium text-gray-800">
							{currentPage?.label || "Admin"}
						</span>
					</div>
				</div>
				<div className="p-4 sm:p-6 lg:p-8">
					{children}
				</div>
			</main>
		</div>
	);
}
