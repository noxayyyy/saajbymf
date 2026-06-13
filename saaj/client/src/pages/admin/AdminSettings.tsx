import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, CreditCard, Globe, Store, Upload, Lock, Eye, EyeOff, FileText, Share2, Mail, Send, Bell } from "lucide-react";
import type { SiteSetting } from "@shared/schema";

type SettingsMap = Record<string, string>;

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "shipping" | "pages" | "social" | "smtp" | "firebase" | "account">("general");

  const { data: allSettingsRaw, isLoading } = useQuery<SiteSetting[] | null>({
    queryKey: ["/api/admin/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  const allSettings = Array.isArray(allSettingsRaw) ? allSettingsRaw : [];

  const settingsMap: SettingsMap = {};
  allSettings.forEach(s => { settingsMap[s.key] = s.value || ""; });

  const [general, setGeneral] = useState({
    site_name: "", site_tagline: "", site_email: "", site_phone: "",
    site_whatsapp: "",
    site_address: "", site_currency: "PKR", site_announcement: "",
    site_logo: "", site_favicon: "", site_theme_color: "#c4151c",
  });

  const [payment, setPayment] = useState({
    payoneer_enabled: "false", payoneer_merchant_id: "", payoneer_api_key: "",
    payoneer_secret_key: "", payoneer_environment: "sandbox",
    payoneer_store_id: "", payoneer_checkout_id: "",
    jazzcash_enabled: "false", jazzcash_merchant_id: "", jazzcash_password: "",
    jazzcash_integrity_salt: "", jazzcash_environment: "sandbox",
    easypaisa_enabled: "false", easypaisa_store_id: "", easypaisa_hash_key: "",
    easypaisa_environment: "sandbox",
    cod_enabled: "true", bank_transfer_enabled: "false",
    bank_name: "", bank_account_title: "", bank_account_number: "", bank_iban: "",
  });

  const [shipping, setShipping] = useState({
    shipping_free_threshold: "0", shipping_flat_rate: "0",
    shipping_countries: "Pakistan", shipping_estimated_days: "3-5",
  });

  const [pages, setPages] = useState({
    page_privacy_policy: "", page_shipping_returns: "", page_size_guide: "",
    page_about: "", page_contact: "",
  });

  const [social, setSocial] = useState({
    social_instagram: "", social_facebook: "", social_pinterest: "",
    social_tiktok: "", social_youtube: "",
  });

  const [smtp, setSmtp] = useState({
    smtp_host: "", smtp_port: "587", smtp_secure: "false",
    smtp_user: "", smtp_pass: "", smtp_from: "",
    admin_notify_email: "", site_public_url: "",
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const [firebase, setFirebase] = useState({
    firebase_api_key: "",
    firebase_auth_domain: "",
    firebase_project_id: "",
    firebase_messaging_sender_id: "",
    firebase_app_id: "",
    firebase_vapid_key: "",
    firebase_service_account_json: "",
  });
  const [showServiceAccount, setShowServiceAccount] = useState(false);
  const serviceAccountFileRef = useRef<HTMLInputElement>(null);
  const [pushForm, setPushForm] = useState({
    topic: "all", title: "", body: "", link: "", image: "",
  });
  const [sendingPush, setSendingPush] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (allSettings.length > 0) {
      setGeneral(g => ({
        site_name: settingsMap.site_name ?? g.site_name,
        site_tagline: settingsMap.site_tagline ?? g.site_tagline,
        site_email: settingsMap.site_email ?? g.site_email,
        site_phone: settingsMap.site_phone ?? g.site_phone,
        site_whatsapp: settingsMap.site_whatsapp ?? g.site_whatsapp,
        site_address: settingsMap.site_address ?? g.site_address,
        site_currency: settingsMap.site_currency || g.site_currency,
        site_announcement: settingsMap.site_announcement ?? g.site_announcement,
        site_logo: settingsMap.site_logo ?? g.site_logo,
        site_favicon: settingsMap.site_favicon ?? g.site_favicon,
        site_theme_color: settingsMap.site_theme_color || g.site_theme_color || "#c4151c",
      }));
      setPayment(p => ({
        payoneer_enabled: settingsMap.payoneer_enabled || p.payoneer_enabled,
        payoneer_merchant_id: settingsMap.payoneer_merchant_id ?? p.payoneer_merchant_id,
        payoneer_api_key: settingsMap.payoneer_api_key ?? p.payoneer_api_key,
        payoneer_secret_key: settingsMap.payoneer_secret_key ?? p.payoneer_secret_key,
        payoneer_environment: settingsMap.payoneer_environment || p.payoneer_environment,
        payoneer_store_id: settingsMap.payoneer_store_id ?? p.payoneer_store_id,
        payoneer_checkout_id: settingsMap.payoneer_checkout_id ?? p.payoneer_checkout_id,
        jazzcash_enabled: settingsMap.jazzcash_enabled || p.jazzcash_enabled,
        jazzcash_merchant_id: settingsMap.jazzcash_merchant_id ?? p.jazzcash_merchant_id,
        jazzcash_password: settingsMap.jazzcash_password ?? p.jazzcash_password,
        jazzcash_integrity_salt: settingsMap.jazzcash_integrity_salt ?? p.jazzcash_integrity_salt,
        jazzcash_environment: settingsMap.jazzcash_environment || p.jazzcash_environment,
        easypaisa_enabled: settingsMap.easypaisa_enabled || p.easypaisa_enabled,
        easypaisa_store_id: settingsMap.easypaisa_store_id ?? p.easypaisa_store_id,
        easypaisa_hash_key: settingsMap.easypaisa_hash_key ?? p.easypaisa_hash_key,
        easypaisa_environment: settingsMap.easypaisa_environment || p.easypaisa_environment,
        cod_enabled: settingsMap.cod_enabled || p.cod_enabled,
        bank_transfer_enabled: settingsMap.bank_transfer_enabled || p.bank_transfer_enabled,
        bank_name: settingsMap.bank_name ?? p.bank_name,
        bank_account_title: settingsMap.bank_account_title ?? p.bank_account_title,
        bank_account_number: settingsMap.bank_account_number ?? p.bank_account_number,
        bank_iban: settingsMap.bank_iban ?? p.bank_iban,
      }));
      setShipping(s => ({
        shipping_free_threshold: settingsMap.shipping_free_threshold || s.shipping_free_threshold,
        shipping_flat_rate: settingsMap.shipping_flat_rate || s.shipping_flat_rate,
        shipping_countries: settingsMap.shipping_countries || s.shipping_countries,
        shipping_estimated_days: settingsMap.shipping_estimated_days || s.shipping_estimated_days,
      }));
      setPages(p => ({
        page_privacy_policy: settingsMap.page_privacy_policy ?? p.page_privacy_policy,
        page_shipping_returns: settingsMap.page_shipping_returns ?? p.page_shipping_returns,
        page_size_guide: settingsMap.page_size_guide ?? p.page_size_guide,
        page_about: settingsMap.page_about ?? p.page_about,
        page_contact: settingsMap.page_contact ?? p.page_contact,
      }));
      setSmtp(m => ({
        smtp_host: settingsMap.smtp_host ?? m.smtp_host,
        smtp_port: settingsMap.smtp_port || m.smtp_port,
        smtp_secure: settingsMap.smtp_secure || m.smtp_secure,
        smtp_user: settingsMap.smtp_user ?? m.smtp_user,
        smtp_pass: settingsMap.smtp_pass ?? m.smtp_pass,
        smtp_from: settingsMap.smtp_from ?? m.smtp_from,
        admin_notify_email: settingsMap.admin_notify_email ?? m.admin_notify_email,
        site_public_url: settingsMap.site_public_url ?? m.site_public_url,
      }));
      setSocial(s => ({
        social_instagram: settingsMap.social_instagram ?? s.social_instagram,
        social_facebook: settingsMap.social_facebook ?? s.social_facebook,
        social_pinterest: settingsMap.social_pinterest ?? s.social_pinterest,
        social_tiktok: settingsMap.social_tiktok ?? s.social_tiktok,
        social_youtube: settingsMap.social_youtube ?? s.social_youtube,
      }));
      setFirebase(f => ({
        firebase_api_key: settingsMap.firebase_api_key ?? f.firebase_api_key,
        firebase_auth_domain: settingsMap.firebase_auth_domain ?? f.firebase_auth_domain,
        firebase_project_id: settingsMap.firebase_project_id ?? f.firebase_project_id,
        firebase_messaging_sender_id: settingsMap.firebase_messaging_sender_id ?? f.firebase_messaging_sender_id,
        firebase_app_id: settingsMap.firebase_app_id ?? f.firebase_app_id,
        firebase_vapid_key: settingsMap.firebase_vapid_key ?? f.firebase_vapid_key,
        firebase_service_account_json: settingsMap.firebase_service_account_json ?? f.firebase_service_account_json,
      }));
    }
  }, [allSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data: { settings: { key: string; value: string; category: string }[] }) => {
      const res = await apiRequest("PUT", "/api/admin/settings", data);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      const themeHex = variables.settings.find(s => s.key === "site_theme_color")?.value;
      if (themeHex) {
        queryClient.setQueryData<Record<string, string>>(["/api/settings/public"], (old) => ({
          ...(old ?? {}),
          site_theme_color: themeHex,
        }));
      }
      queryClient.refetchQueries({ queryKey: ["/api/settings/public"] });
      toast({ title: "Settings saved" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PUT", "/api/admin/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const saveGeneral = () => {
    saveMutation.mutate({
      settings: Object.entries(general).map(([key, value]) => ({ key, value, category: "general" })),
    });
  };

  const savePayment = () => {
    saveMutation.mutate({
      settings: Object.entries(payment).map(([key, value]) => ({ key, value, category: "payment" })),
    });
  };

  const saveShipping = () => {
    saveMutation.mutate({
      settings: Object.entries(shipping).map(([key, value]) => ({ key, value, category: "shipping" })),
    });
  };

  const savePages = () => {
    saveMutation.mutate({
      settings: Object.entries(pages).map(([key, value]) => ({ key, value, category: "pages" })),
    });
  };

  const saveSmtp = () => {
    saveMutation.mutate({
      settings: Object.entries(smtp).map(([key, value]) => ({ key, value, category: "smtp" })),
    });
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({ title: "Enter a recipient email", variant: "destructive" });
      return;
    }
    setSendingTest(true);
    try {
      const res = await apiRequest("POST", "/api/admin/test-email", { to: testEmail.trim() });
      await res.json();
      toast({ title: "Test email sent", description: `Check the inbox of ${testEmail.trim()}` });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err?.message || "Check SMTP settings", variant: "destructive" });
    } finally {
      setSendingTest(false);
    }
  };

  const saveFirebase = () => {
    if (firebase.firebase_service_account_json) {
      try {
        JSON.parse(firebase.firebase_service_account_json);
      } catch {
        toast({ title: "Service account JSON is invalid", variant: "destructive" });
        return;
      }
    }
    saveMutation.mutate({
      settings: Object.entries(firebase).map(([key, value]) => ({ key, value, category: "firebase" })),
    });
  };

  const handleServiceAccountFile = async (file: File) => {
    const text = await file.text();
    try {
      JSON.parse(text);
    } catch {
      toast({ title: "Not a valid JSON file", variant: "destructive" });
      return;
    }
    setFirebase(f => ({ ...f, firebase_service_account_json: text }));
    toast({ title: "Service account loaded", description: "Click Save to store it." });
  };

  const handleSendPush = async () => {
    if (!pushForm.topic.trim() || !pushForm.title.trim() || !pushForm.body.trim()) {
      toast({ title: "Topic, title and body are required", variant: "destructive" });
      return;
    }
    setSendingPush(true);
    try {
      const res = await apiRequest("POST", "/api/admin/push/send", {
        topic: pushForm.topic.trim(),
        title: pushForm.title.trim(),
        body: pushForm.body.trim(),
        link: pushForm.link.trim() || undefined,
        image: pushForm.image.trim() || undefined,
      });
      const data = await res.json();
      toast({ title: "Notification sent", description: `Message ID: ${data.messageId}` });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err?.message || "Check Firebase settings", variant: "destructive" });
    } finally {
      setSendingPush(false);
    }
  };

  const saveSocial = () => {
    saveMutation.mutate({
      settings: Object.entries(social).map(([key, value]) => ({ key, value, category: "social" })),
    });
  };

  const handleChangePassword = () => {
    if (!passwords.currentPassword) {
      toast({ title: "Current password is required", variant: "destructive" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
  };

  const handleFileUpload = async (file: File, field: "site_logo" | "site_favicon") => {
    const setUploading = field === "site_logo" ? setLogoUploading : setFaviconUploading;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setGeneral(g => ({ ...g, [field]: data.url }));
      if (field === "site_favicon") {
        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) link.href = data.url;
      }
      toast({ title: `${field === "site_logo" ? "Logo" : "Favicon"} uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: Store },
    { id: "payment" as const, label: "Payment", icon: CreditCard },
    { id: "shipping" as const, label: "Shipping", icon: Globe },
    { id: "pages" as const, label: "Pages", icon: FileText },
    { id: "social" as const, label: "Social Links", icon: Share2 },
    { id: "smtp" as const, label: "Email / SMTP", icon: Mail },
    { id: "firebase" as const, label: "Firebase / Push", icon: Bell },
    { id: "account" as const, label: "Account", icon: Lock },
  ];

  if (isLoading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-wide">Settings</h1>
        <p className="font-sans text-sm text-gray-500 mt-1">Configure your store</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-xs tracking-[0.1em] uppercase transition-colors ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 max-w-[600px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Store Logo</Label>
              <div className="flex items-center gap-4">
                {general.site_logo && (
                  <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                    <img src={general.site_logo} alt="Store logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "site_logo"); e.target.value = ""; }} className="hidden" />
                  <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className="rounded-lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {logoUploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                  {general.site_logo && (
                    <Button variant="ghost" size="sm" onClick={() => setGeneral(g => ({ ...g, site_logo: "" }))} className="text-xs text-gray-500">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Favicon (Browser Tab Icon)</Label>
              <div className="flex items-center gap-4">
                {general.site_favicon && (
                  <div className="w-12 h-12 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                    <img src={general.site_favicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input ref={faviconInputRef} type="file" accept="image/*,.ico" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "site_favicon"); e.target.value = ""; }} className="hidden" />
                  <Button variant="outline" onClick={() => faviconInputRef.current?.click()} disabled={faviconUploading} className="rounded-lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {faviconUploading ? "Uploading..." : "Upload Favicon"}
                  </Button>
                  {general.site_favicon && (
                    <Button variant="ghost" size="sm" onClick={() => setGeneral(g => ({ ...g, site_favicon: "" }))} className="text-xs text-gray-500">Remove</Button>
                  )}
                </div>
              </div>
              <p className="font-sans text-xs text-gray-400">Recommended: 32×32 or 64×64 px PNG/ICO file</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Store Name</Label>
              <Input value={general.site_name} onChange={e => setGeneral(g => ({ ...g, site_name: e.target.value }))} placeholder="SAAJ by MF" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Tagline</Label>
              <Input value={general.site_tagline} onChange={e => setGeneral(g => ({ ...g, site_tagline: e.target.value }))} placeholder="Modernity in Heritage" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Email</Label>
                <Input type="email" value={general.site_email} onChange={e => setGeneral(g => ({ ...g, site_email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Phone</Label>
                <Input value={general.site_phone} onChange={e => setGeneral(g => ({ ...g, site_phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">WhatsApp Number</Label>
              <Input value={general.site_whatsapp} onChange={e => setGeneral(g => ({ ...g, site_whatsapp: e.target.value }))} placeholder="+92-300-1775557" />
              <p className="font-sans text-xs text-gray-400">Used for the WhatsApp icons in the header and mobile menu. Include country code.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Address</Label>
              <Textarea value={general.site_address} onChange={e => setGeneral(g => ({ ...g, site_address: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Currency</Label>
              <Select value={general.site_currency} onValueChange={v => setGeneral(g => ({ ...g, site_currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Announcement Bar</Label>
              <Input value={general.site_announcement} onChange={e => setGeneral(g => ({ ...g, site_announcement: e.target.value }))} placeholder="Free shipping on orders above PKR 25,000" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Theme color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={general.site_theme_color}
                  onChange={e => setGeneral(g => ({ ...g, site_theme_color: e.target.value }))}
                  className="w-12 h-10 rounded border border-gray-200 cursor-pointer bg-white p-0"
                />
                <Input
                  value={general.site_theme_color}
                  onChange={e => setGeneral(g => ({ ...g, site_theme_color: e.target.value }))}
                  placeholder="#c4151c"
                  className="font-mono text-sm max-w-[120px]"
                />
              </div>
              <p className="font-sans text-xs text-gray-400">Primary/brand color for buttons, links, and accents. Default: #c4151c</p>
            </div>
            <Button onClick={saveGeneral} disabled={saveMutation.isPending} className="rounded-lg">
              {saveMutation.isPending ? "Saving..." : "Save General Settings"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="space-y-8 max-w-[600px]">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">Payoneer</h3>
                <p className="font-sans text-xs text-gray-500">Accept card payments through Payoneer Checkout</p>
              </div>
              <div className="ml-auto">
                <Switch checked={payment.payoneer_enabled === "true"} onCheckedChange={v => setPayment(p => ({ ...p, payoneer_enabled: String(v) }))} />
              </div>
            </div>
            {payment.payoneer_enabled === "true" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Environment</Label>
                  <Select value={payment.payoneer_environment} onValueChange={v => setPayment(p => ({ ...p, payoneer_environment: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">Merchant ID</Label>
                    <Input value={payment.payoneer_merchant_id} onChange={e => setPayment(p => ({ ...p, payoneer_merchant_id: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">Store ID</Label>
                    <Input value={payment.payoneer_store_id} onChange={e => setPayment(p => ({ ...p, payoneer_store_id: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Checkout ID</Label>
                  <Input value={payment.payoneer_checkout_id} onChange={e => setPayment(p => ({ ...p, payoneer_checkout_id: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">API Key</Label>
                    <Input value={payment.payoneer_api_key} onChange={e => setPayment(p => ({ ...p, payoneer_api_key: e.target.value }))} type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">Secret Key</Label>
                    <Input value={payment.payoneer_secret_key} onChange={e => setPayment(p => ({ ...p, payoneer_secret_key: e.target.value }))} type="password" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">JazzCash</h3>
                <p className="font-sans text-xs text-gray-500">Accept payments via JazzCash mobile wallet</p>
              </div>
              <div className="ml-auto">
                <Switch checked={payment.jazzcash_enabled === "true"} onCheckedChange={v => setPayment(p => ({ ...p, jazzcash_enabled: String(v) }))} />
              </div>
            </div>
            {payment.jazzcash_enabled === "true" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Environment</Label>
                  <Select value={payment.jazzcash_environment} onValueChange={v => setPayment(p => ({ ...p, jazzcash_environment: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Merchant ID</Label>
                  <Input value={payment.jazzcash_merchant_id} onChange={e => setPayment(p => ({ ...p, jazzcash_merchant_id: e.target.value }))} placeholder="MC12345" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Password</Label>
                  <Input value={payment.jazzcash_password} onChange={e => setPayment(p => ({ ...p, jazzcash_password: e.target.value }))} type="password" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Integrity Salt</Label>
                  <Input value={payment.jazzcash_integrity_salt} onChange={e => setPayment(p => ({ ...p, jazzcash_integrity_salt: e.target.value }))} type="password" placeholder="Hash integrity salt" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">EasyPaisa</h3>
                <p className="font-sans text-xs text-gray-500">Accept payments via EasyPaisa mobile wallet</p>
              </div>
              <div className="ml-auto">
                <Switch checked={payment.easypaisa_enabled === "true"} onCheckedChange={v => setPayment(p => ({ ...p, easypaisa_enabled: String(v) }))} />
              </div>
            </div>
            {payment.easypaisa_enabled === "true" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Environment</Label>
                  <Select value={payment.easypaisa_environment} onValueChange={v => setPayment(p => ({ ...p, easypaisa_environment: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Store ID</Label>
                  <Input value={payment.easypaisa_store_id} onChange={e => setPayment(p => ({ ...p, easypaisa_store_id: e.target.value }))} placeholder="Your EasyPaisa Store ID" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Hash Key</Label>
                  <Input value={payment.easypaisa_hash_key} onChange={e => setPayment(p => ({ ...p, easypaisa_hash_key: e.target.value }))} type="password" placeholder="EasyPaisa Hash Key" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h3 className="font-sans text-sm font-medium mb-4">Other Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-sans text-sm">Cash on Delivery (COD)</span>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">Customer pays when order is delivered</p>
                </div>
                <Switch checked={payment.cod_enabled === "true"} onCheckedChange={v => setPayment(p => ({ ...p, cod_enabled: String(v) }))} />
              </div>
              <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-sans text-sm">Bank Transfer</span>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">Direct bank deposit / online transfer</p>
                </div>
                <Switch checked={payment.bank_transfer_enabled === "true"} onCheckedChange={v => setPayment(p => ({ ...p, bank_transfer_enabled: String(v) }))} />
              </div>
              {payment.bank_transfer_enabled === "true" && (
                <div className="space-y-3 pl-3 border-l-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide">Bank Name</Label>
                      <Input value={payment.bank_name} onChange={e => setPayment(p => ({ ...p, bank_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide">Account Title</Label>
                      <Input value={payment.bank_account_title} onChange={e => setPayment(p => ({ ...p, bank_account_title: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">Account Number</Label>
                    <Input value={payment.bank_account_number} onChange={e => setPayment(p => ({ ...p, bank_account_number: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">IBAN</Label>
                    <Input value={payment.bank_iban} onChange={e => setPayment(p => ({ ...p, bank_iban: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button onClick={savePayment} disabled={saveMutation.isPending} className="rounded-lg">
            {saveMutation.isPending ? "Saving..." : "Save Payment Settings"}
          </Button>
        </div>
      )}

      {activeTab === "shipping" && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 max-w-[600px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Free Shipping Threshold (PKR)</Label>
              <Input type="number" value={shipping.shipping_free_threshold} onChange={e => setShipping(s => ({ ...s, shipping_free_threshold: e.target.value }))} placeholder="0 for always free" />
              <p className="font-sans text-xs text-gray-400">Set to 0 for free shipping on all orders</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Flat Shipping Rate (PKR)</Label>
              <Input type="number" value={shipping.shipping_flat_rate} onChange={e => setShipping(s => ({ ...s, shipping_flat_rate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Shipping Countries</Label>
              <Input value={shipping.shipping_countries} onChange={e => setShipping(s => ({ ...s, shipping_countries: e.target.value }))} placeholder="Pakistan, UAE, UK" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Estimated Delivery Days</Label>
              <Input value={shipping.shipping_estimated_days} onChange={e => setShipping(s => ({ ...s, shipping_estimated_days: e.target.value }))} placeholder="3-5" />
            </div>
            <Button onClick={saveShipping} disabled={saveMutation.isPending} className="rounded-lg">
              {saveMutation.isPending ? "Saving..." : "Save Shipping Settings"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "pages" && (
        <div className="space-y-8 max-w-[700px]">
          <p className="font-sans text-xs text-gray-500">Enter HTML/CSS content for each page. This content will be displayed on the corresponding public pages.</p>
          {[
            { key: "page_privacy_policy" as const, label: "Privacy Policy", placeholder: "<h2>Privacy Policy</h2><p>Your content here...</p>" },
            { key: "page_shipping_returns" as const, label: "Shipping & Returns", placeholder: "<h2>Shipping Policy</h2><p>Your content here...</p>" },
            { key: "page_size_guide" as const, label: "Size Guide (Additional Info)", placeholder: "<p>Additional size guide information...</p>" },
            { key: "page_about" as const, label: "About Us", placeholder: "<h2>About SAAJ by MF</h2><p>Your story here...</p>" },
            { key: "page_contact" as const, label: "Contact Page", placeholder: "<p>Contact information...</p>" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="font-sans text-sm font-medium mb-3">{label}</h3>
              <Textarea
                value={pages[key]}
                onChange={e => setPages(p => ({ ...p, [key]: e.target.value }))}
                rows={8}
                placeholder={placeholder}
                className="font-mono text-xs"
              />
            </div>
          ))}
          <Button onClick={savePages} disabled={saveMutation.isPending} className="rounded-lg">
            {saveMutation.isPending ? "Saving..." : "Save Page Content"}
          </Button>
        </div>
      )}

      {activeTab === "social" && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 max-w-[600px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Instagram URL</Label>
              <Input value={social.social_instagram} onChange={e => setSocial(s => ({ ...s, social_instagram: e.target.value }))} placeholder="https://instagram.com/saajbymf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Facebook URL</Label>
              <Input value={social.social_facebook} onChange={e => setSocial(s => ({ ...s, social_facebook: e.target.value }))} placeholder="https://facebook.com/saajbymf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Pinterest URL</Label>
              <Input value={social.social_pinterest} onChange={e => setSocial(s => ({ ...s, social_pinterest: e.target.value }))} placeholder="https://pinterest.com/saajbymf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">TikTok URL</Label>
              <Input value={social.social_tiktok} onChange={e => setSocial(s => ({ ...s, social_tiktok: e.target.value }))} placeholder="https://tiktok.com/@saajbymf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">YouTube URL</Label>
              <Input value={social.social_youtube} onChange={e => setSocial(s => ({ ...s, social_youtube: e.target.value }))} placeholder="https://youtube.com/@saajbymf" />
            </div>
            <Button onClick={saveSocial} disabled={saveMutation.isPending} className="rounded-lg">
              {saveMutation.isPending ? "Saving..." : "Save Social Links"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "smtp" && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 max-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium">SMTP / Order Notifications</h3>
              <p className="font-sans text-xs text-gray-500">Configure outgoing email for order confirmations and admin alerts</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">SMTP Host</Label>
                <Input
                  value={smtp.smtp_host}
                  onChange={e => setSmtp(m => ({ ...m, smtp_host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  data-testid="input-smtp-host"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Port</Label>
                <Input
                  value={smtp.smtp_port}
                  onChange={e => setSmtp(m => ({ ...m, smtp_port: e.target.value }))}
                  placeholder="587"
                  data-testid="input-smtp-port"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div>
                <p className="font-sans text-xs font-medium">Use SSL/TLS (secure)</p>
                <p className="font-sans text-xs text-gray-500">Enable for port 465. Leave off for 587 (STARTTLS).</p>
              </div>
              <Switch
                checked={smtp.smtp_secure === "true"}
                onCheckedChange={v => setSmtp(m => ({ ...m, smtp_secure: String(v) }))}
                data-testid="switch-smtp-secure"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">SMTP Username</Label>
              <Input
                value={smtp.smtp_user}
                onChange={e => setSmtp(m => ({ ...m, smtp_user: e.target.value }))}
                placeholder="you@yourdomain.com"
                autoComplete="off"
                data-testid="input-smtp-user"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">SMTP Password</Label>
              <div className="relative">
                <Input
                  type={showSmtpPass ? "text" : "password"}
                  value={smtp.smtp_pass}
                  onChange={e => setSmtp(m => ({ ...m, smtp_pass: e.target.value }))}
                  placeholder="App password or SMTP secret"
                  autoComplete="new-password"
                  data-testid="input-smtp-pass"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-sans text-xs text-gray-400">For Gmail, use a 16-character App Password (not your account password).</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">From Address</Label>
              <Input
                value={smtp.smtp_from}
                onChange={e => setSmtp(m => ({ ...m, smtp_from: e.target.value }))}
                placeholder='"SAAJ by MF" <orders@yourdomain.com>'
                data-testid="input-smtp-from"
              />
              <p className="font-sans text-xs text-gray-400">Defaults to the SMTP username if left blank.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Admin Notification Email</Label>
              <Input
                value={smtp.admin_notify_email}
                onChange={e => setSmtp(m => ({ ...m, admin_notify_email: e.target.value }))}
                placeholder="admin@yourdomain.com"
                data-testid="input-admin-notify-email"
              />
              <p className="font-sans text-xs text-gray-400">New order alerts are sent here.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Public Site URL</Label>
              <Input
                value={smtp.site_public_url}
                onChange={e => setSmtp(m => ({ ...m, site_public_url: e.target.value }))}
                placeholder="https://saajbymf.com"
                data-testid="input-site-public-url"
              />
              <p className="font-sans text-xs text-gray-400">Used to build "Track your order" links inside emails.</p>
            </div>

            <Button onClick={saveSmtp} disabled={saveMutation.isPending} className="rounded-lg" data-testid="button-save-smtp">
              {saveMutation.isPending ? "Saving..." : "Save SMTP Settings"}
            </Button>

            <div className="border-t border-gray-100 pt-5 mt-2">
              <h4 className="font-sans text-sm font-medium mb-1">Send a test email</h4>
              <p className="font-sans text-xs text-gray-500 mb-3">Save your SMTP settings first, then send yourself a test message.</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  data-testid="input-test-email"
                />
                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  variant="outline"
                  className="rounded-lg whitespace-nowrap"
                  data-testid="button-send-test-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendingTest ? "Sending..." : "Send test"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "firebase" && (
        <div className="space-y-6 max-w-[700px]">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">Firebase Web Configuration</h3>
                <p className="font-sans text-xs text-gray-500">Public client SDK config (Project Settings → General → Your apps → Web)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">API Key</Label>
                  <Input
                    value={firebase.firebase_api_key}
                    onChange={e => setFirebase(f => ({ ...f, firebase_api_key: e.target.value }))}
                    placeholder="AIzaSy..."
                    data-testid="input-firebase-api-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Project ID</Label>
                  <Input
                    value={firebase.firebase_project_id}
                    onChange={e => setFirebase(f => ({ ...f, firebase_project_id: e.target.value }))}
                    placeholder="saaj-by-mf"
                    data-testid="input-firebase-project-id"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Auth Domain</Label>
                <Input
                  value={firebase.firebase_auth_domain}
                  onChange={e => setFirebase(f => ({ ...f, firebase_auth_domain: e.target.value }))}
                  placeholder="saaj-by-mf.firebaseapp.com"
                  data-testid="input-firebase-auth-domain"
                />
                <p className="font-sans text-xs text-gray-400">Optional. Defaults to {`{project-id}`}.firebaseapp.com</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Messaging Sender ID</Label>
                  <Input
                    value={firebase.firebase_messaging_sender_id}
                    onChange={e => setFirebase(f => ({ ...f, firebase_messaging_sender_id: e.target.value }))}
                    placeholder="1234567890"
                    data-testid="input-firebase-sender-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">App ID</Label>
                  <Input
                    value={firebase.firebase_app_id}
                    onChange={e => setFirebase(f => ({ ...f, firebase_app_id: e.target.value }))}
                    placeholder="1:1234567890:web:abc..."
                    data-testid="input-firebase-app-id"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">VAPID Public Key</Label>
                <Input
                  value={firebase.firebase_vapid_key}
                  onChange={e => setFirebase(f => ({ ...f, firebase_vapid_key: e.target.value }))}
                  placeholder="BNJ..."
                  data-testid="input-firebase-vapid-key"
                />
                <p className="font-sans text-xs text-gray-400">Project Settings → Cloud Messaging → Web configuration → Web Push certificates.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">Service Account (Private)</h3>
                <p className="font-sans text-xs text-gray-500">Used server-side to send push and manage topic subscriptions</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  ref={serviceAccountFileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleServiceAccountFile(f); e.target.value = ""; }}
                />
                <Button
                  variant="outline"
                  onClick={() => serviceAccountFileRef.current?.click()}
                  className="rounded-lg"
                  data-testid="button-upload-service-account"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload service-account.json
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceAccount(v => !v)}
                  className="text-xs text-gray-500"
                >
                  {showServiceAccount ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showServiceAccount ? "Hide" : "Show / Edit"} JSON
                </Button>
                {firebase.firebase_service_account_json && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                    Loaded
                  </span>
                )}
              </div>

              {showServiceAccount && (
                <Textarea
                  value={firebase.firebase_service_account_json}
                  onChange={e => setFirebase(f => ({ ...f, firebase_service_account_json: e.target.value }))}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder='{"type":"service_account","project_id":"...", ...}'
                  data-testid="textarea-service-account"
                />
              )}
              <p className="font-sans text-xs text-gray-400">
                Firebase Console → Project Settings → Service Accounts → Generate new private key. Never share this file publicly.
              </p>
            </div>

            <div className="mt-6">
              <Button onClick={saveFirebase} disabled={saveMutation.isPending} className="rounded-lg" data-testid="button-save-firebase">
                {saveMutation.isPending ? "Saving..." : "Save Firebase Settings"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium">Send a Topic Notification</h3>
                <p className="font-sans text-xs text-gray-500">Push a notification to all devices subscribed to a topic</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Topic</Label>
                <Input
                  value={pushForm.topic}
                  onChange={e => setPushForm(p => ({ ...p, topic: e.target.value }))}
                  placeholder="all"
                  data-testid="input-push-topic"
                />
                <p className="font-sans text-xs text-gray-400">Every visitor who allows notifications is auto-subscribed to <code>all</code>.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Title</Label>
                <Input
                  value={pushForm.title}
                  onChange={e => setPushForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="New Arrivals are here ✨"
                  data-testid="input-push-title"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Body</Label>
                <Textarea
                  value={pushForm.body}
                  onChange={e => setPushForm(p => ({ ...p, body: e.target.value }))}
                  rows={3}
                  placeholder="Discover the latest Mahira Verdure and Mehr Peridot pieces."
                  data-testid="textarea-push-body"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Click URL</Label>
                  <Input
                    value={pushForm.link}
                    onChange={e => setPushForm(p => ({ ...p, link: e.target.value }))}
                    placeholder="https://saajbymf.com/collections/new"
                    data-testid="input-push-link"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide">Image URL (optional)</Label>
                  <Input
                    value={pushForm.image}
                    onChange={e => setPushForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://.../hero.jpg"
                    data-testid="input-push-image"
                  />
                </div>
              </div>
              <Button onClick={handleSendPush} disabled={sendingPush} className="rounded-lg" data-testid="button-send-push">
                <Send className="w-4 h-4 mr-2" />
                {sendingPush ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 max-w-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium">Change Admin Password</h3>
              <p className="font-sans text-xs text-gray-500">Update your admin account password</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-sans text-xs text-gray-400">Minimum 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="rounded-lg"
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
