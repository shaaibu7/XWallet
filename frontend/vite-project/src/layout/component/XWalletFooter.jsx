import {
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
} from "@tabler/icons-react";

const XWalletFooter = () => {
  return (
    <footer className="bg-[#151515] text-white py-10 px-6 md:px-20 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">XWallet</h1>
          <p className="text-sm mt-2 text-gray-300">Secure. Smart. Seamless.</p>
        </div>

        <div className="flex gap-4 mt-6 md:mt-0">
          <div className="bg-gray-700 p-2 rounded-full hover:bg-[#1da1f2] transition-all">
            <IconBrandTwitter size={20} stroke={1.5} />
          </div>
          <div className="bg-gray-700 p-2 rounded-full hover:bg-[#e1306c] transition-all">
            <IconBrandInstagram size={20} stroke={1.5} />
          </div>
          <div className="bg-gray-700 p-2 rounded-full hover:bg-[#0077b5] transition-all">
            <IconBrandLinkedin size={20} stroke={1.5} />
          </div>
          <div className="bg-gray-700 p-2 rounded-full hover:bg-[#010101] transition-all">
            <IconBrandTiktok size={20} stroke={1.5} />
          </div>
          <div className="bg-gray-700 p-2 rounded-full hover:bg-[#ff0000] transition-all">
            <IconBrandYoutube size={20} stroke={1.5} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 border-t border-gray-700 pt-4">
        <p>© {new Date().getFullYear()} XWallet. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default XWalletFooter;