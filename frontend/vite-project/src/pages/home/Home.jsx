import { motion } from "framer-motion";
import XWalletFooter from "../../layout/component/XWalletFooter";
import XWalletHeader from "../../layout/component/XWalletHeader";
import '../../../connection';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {/* Header */}
      <XWalletHeader />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8 bg-white dark:bg-background">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-7xl mx-auto"
          >
            {/* Hero Text */}
            <div className="text-center md:text-left md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Empower Your Family's Financial Future
              </h2>
              <p className="text-lg md:text-xl mb-8 text-muted-text">
                XWallet helps you manage, track, and teach financial
                responsibility to your loved ones.
              </p>
              {/* <a
                href="#connect"
                className="inline-block px-8 py-3 bg-primary text-white rounded-2xl font-medium shadow hover:bg-primary-hover transition"
              >
                Connect Wallet
              </a> */}
              <w3m-button />
            </div>
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex justify-center md:w-1/2"
            >
              <div className="w-full max-w-md h-64 rounded-lg shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <p className="text-white text-2xl font-bold">Family Budget</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-100 dark:bg-card">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-semibold mb-8">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Spending Limits",
                  desc: "Set daily, weekly, or monthly spending limits for users.",
                },
                {
                  title: "Stablecoin Support",
                  desc: "Fund wallets with USDC or other stablecoins.",
                },
                {
                  title: "Transaction Tracking",
                  desc: "Monitor all activity from one dashboard.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="p-6 bg-white dark:bg-background rounded-xl shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-muted-text">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <XWalletFooter />
    </div>
  );
}