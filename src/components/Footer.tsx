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
    <footer className="mt-auto w-full bg-gradient-to-b from-transparent to-[#1b1b1b]/90 backdrop-blur-sm border-t border-[#57AAB4]/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 order-2 md:order-1">
            <Network className="h-6 w-6 text-[#57AAB4]" style={{
              filter: 'drop-shadow(0 0 8px rgba(87, 170, 180, 0.5))'
            }} />
            <div className="text-right">
              <h3 className="text-base font-bold text-[#57AAB4]" style={{
                textShadow: '0 0 10px rgba(87, 170, 180, 0.3)'
              }}>
                نظام إدارة خطوط الإنترنت
              </h3>
              <p className="text-xs text-gray-400">
                إدارة احترافية وسهلة الاستخدام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 order-1 md:order-2">
            <span className="text-sm text-gray-400 hidden sm:inline">للتواصل:</span>
            <Button
              onClick={handleFacebookClick}
              variant="outline"
              size="sm"
              className="bg-transparent border border-[#57AAB4]/30 text-[#57AAB4] hover:bg-[#57AAB4]/10 hover:border-[#57AAB4] transition-all duration-300"
              style={{
                boxShadow: '0 0 10px rgba(87, 170, 180, 0.1)'
              }}
            >
              <Facebook className="h-4 w-4 ml-1" />
              فيسبوك
            </Button>
            <Button
              onClick={handleWhatsAppClick}
              variant="outline"
              size="sm"
              className="bg-transparent border border-[#57AAB4]/30 text-[#57AAB4] hover:bg-[#57AAB4]/10 hover:border-[#57AAB4] transition-all duration-300"
              style={{
                boxShadow: '0 0 10px rgba(87, 170, 180, 0.1)'
              }}
            >
              <MessageCircle className="h-4 w-4 ml-1" />
              واتساب
            </Button>
          </div>

          <div className="text-center md:text-left order-3">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              © 2025 تم التطوير بـ
              <Heart className="h-3 w-3 text-[#57AAB4]" style={{
                filter: 'drop-shadow(0 0 5px rgba(87, 170, 180, 0.5))'
              }} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
