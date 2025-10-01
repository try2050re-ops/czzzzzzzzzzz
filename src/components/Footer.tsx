import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Network, Heart } from "lucide-react";

export const Footer = () => {
  const handleFacebookClick = () => {
    window.open("https://www.facebook.com/palestine7102023y/", "_blank");
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/+201559181558", "_blank");
  };

  return (
    <footer className="mt-auto bg-gradient-to-r from-blue-600/90 to-green-600/90 text-white backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo and Title */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <Network className="h-8 w-8 text-white animate-pulse" />
              <h3 className="text-xl font-bold">نظام إدارة خطوط الإنترنت</h3>
            </div>
            <p className="text-blue-100 text-sm">
              إدارة احترافية لخطوط الإنترنت والاشتراكات الشهرية
            </p>
          </div>

          {/* Contact Developer */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-red-300 animate-pulse" />
              للتواصل مع المطور
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleFacebookClick}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Facebook className="h-4 w-4 ml-2" />
                فيسبوك
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                واتساب
              </Button>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-2">
                © 2025 جميع الحقوق محفوظة
              </p>
              <p className="text-xs text-blue-200">
                تم التطوير بـ <Heart className="h-3 w-3 inline text-red-300" />{" "}
                بواسطة المطور
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-sm text-blue-100">
              نظام متطور لإدارة خطوط الإنترنت مع واجهة سهلة الاستخدام
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
