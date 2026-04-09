import { CommonHeader, Footer } from '@/components/layout';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <CommonHeader />
      
      <main className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-lg">
            <p className="text-gray-600">Last updated: March 2026</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, such as when you create an account, 
              create or modify your resume, or communicate with us. This includes your name, email address, 
              and any resume content you choose to include.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, and communicate with you about your account and our services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share information with 
              service providers who assist us in operating our website.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect the security 
              of your personal information. However, no method of transmission over the Internet is 
              100% secure.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-600">
              You have the right to access, correct, or delete your personal information. You may 
              also export your data at any time. Contact us to exercise these rights.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Cookies</h2>
            <p className="text-gray-600">
              We use cookies to maintain your session and remember your preferences. You can control 
              cookie settings through your browser.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at privacy@flowcv.com.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
