import { PricingHeader, Footer } from '@/components/layout';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for creating your first professional resume',
    features: [
      '1 Resume',
      '1 Cover Letter',
      '50+ Templates',
      'Unlimited PDF Downloads',
      'No Watermarks',
      'Basic Design Customization',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 9,
    period: '/month',
    description: 'For professionals who need multiple resume versions',
    features: [
      'Unlimited Resumes',
      'Unlimited Cover Letters',
      'All Templates',
      'Unlimited PDF Downloads',
      'No Watermarks',
      'Advanced Design Customization',
      'Multiple Design Versions',
      'AI Writing Assistance',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PricingHeader />
      
      <main>
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </div>
        </section>

        <section className="py-20 -mt-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-8 ${
                    plan.popular
                      ? 'border-primary-600 shadow-xl ring-2 ring-primary-600'
                      : 'border-gray-200 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
                        <Star className="h-4 w-4" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`block w-full text-center rounded-lg px-6 py-3 text-base font-medium transition-colors ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              {[
                {
                  q: 'Is FlowCV really free?',
                  a: 'Yes! Your first resume is 100% free forever. You get unlimited PDF downloads with no watermarks, access to all 50+ templates, and full design customization.',
                },
                {
                  q: 'What happens to my free resume if I upgrade?',
                  a: "Nothing changes. Your free resume stays free and editable. Upgrading gives you additional features like multiple resume versions and AI assistance.",
                },
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel your subscription at any time. Your saved resumes will remain accessible, though additional features will be locked.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                  <p className="mt-2 text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
