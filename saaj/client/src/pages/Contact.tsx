import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Seo from "@/components/Seo";

export default function Contact() {
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const content = settings?.page_contact;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Contact — SAAJ by MF"
        description="Get in touch with SAAJ by MF for orders, custom sizing, bridal appointments, and customer support."
        canonicalPath="/contact"
      />
      <div className="bg-gray-50 py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase text-gray-900"
          >
            Contact Us
          </motion.h1>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-14 md:py-20">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        ) : content ? (
          <div
            className="font-sans text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-8">
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                We'd love to hear from you. Reach out through any of the following channels.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-[#c4151c] mt-0.5" />
                  <div>
                    <h3 className="font-sans text-sm font-medium text-gray-900 mb-1">Email</h3>
                    <p className="font-sans text-sm text-gray-600">info@saajbymf.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#c4151c] mt-0.5" />
                  <div>
                    <h3 className="font-sans text-sm font-medium text-gray-900 mb-1">WhatsApp</h3>
                    <p className="font-sans text-sm text-gray-600">+92-300-1775557</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#c4151c] mt-0.5" />
                  <div>
                    <h3 className="font-sans text-sm font-medium text-gray-900 mb-1">Hours</h3>
                    <p className="font-sans text-sm text-gray-600">Mon - Sat: 10am - 6pm (PKT)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#c4151c] mt-0.5" />
                  <div>
                    <h3 className="font-sans text-sm font-medium text-gray-900 mb-1">Office</h3>
                    <p className="font-sans text-sm text-gray-600">Lahore, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg text-gray-900 mb-6">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 px-4 py-3 text-sm font-sans bg-transparent focus:outline-none focus:border-gray-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 px-4 py-3 text-sm font-sans bg-transparent focus:outline-none focus:border-gray-500"
                />
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  className="w-full border border-gray-300 px-4 py-3 text-sm font-sans bg-transparent focus:outline-none focus:border-gray-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 font-sans text-xs tracking-[0.2em] uppercase hover:bg-[#c4151c] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
