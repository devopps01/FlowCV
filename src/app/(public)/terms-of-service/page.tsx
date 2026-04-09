import { CommonHeader, Footer } from '@/components/layout';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <CommonHeader />
      
      <main className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-lg">
            <p className="text-gray-600">Last updated: March 2026</p>
            
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using FlowCV&apos;s services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-600">
              FlowCV provides an online resume builder that allows users to create, edit, and download 
              professional resumes. Our service includes access to resume templates, PDF export functionality, 
              and online sharing features.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-600">
              To use certain features, you must create an account. You are responsible for maintaining 
              the confidentiality of your account credentials and for all activities under your account.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. User Content</h2>
            <p className="text-gray-600">
              You retain ownership of all content you create using our service. By uploading content, 
              you grant us a license to store and display your content as necessary to provide our services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-600">
              You agree not to use our service for any unlawful purpose or in any way that could damage, 
              disable, or impair our services. You may not attempt to gain unauthorized access to any 
              part of our service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600">
              The service and its original content, features, and functionality are owned by FlowCV and 
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-600">
              We may terminate or suspend your access to the service immediately, without prior notice, 
              for any reason, including breach of these Terms of Service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              FlowCV shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify or replace these terms at any time. Your continued use of 
              the service after any changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Contact</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at legal@flowcv.com.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
