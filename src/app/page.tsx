'use client';

import Link from 'next/link';
import { 
  FiArrowRight, 
  FiShield, 
  FiGlobe, 
  FiCreditCard, 
  FiDollarSign, 
  FiSmartphone, 
  FiLock,
  FiCheck,
  FiPhone,
  FiMail,
  FiClock
} from 'react-icons/fi';

export default function Home() {
  const features = [
    {
      icon: <FiShield className="h-8 w-8 text-red-600" />,
      title: 'Secure Banking',
      description: 'Advanced security measures to protect your finances and personal information.'
    },
    {
      icon: <FiGlobe className="h-8 w-8 text-red-600" />,
      title: 'Global Access',
      description: 'Manage your accounts and make transactions from anywhere in the world.'
    },
    {
      icon: <FiCreditCard className="h-8 w-8 text-red-600" />,
      title: 'Virtual Cards',
      description: 'Generate virtual cards for secure online shopping and subscriptions.'
    },
    {
      icon: <FiDollarSign className="h-8 w-8 text-red-600" />,
      title: 'Competitive Rates',
      description: 'Enjoy competitive exchange rates and low fees on international transfers.'
    },
    {
      icon: <FiSmartphone className="h-8 w-8 text-red-600" />,
      title: 'Mobile Banking',
      description: 'Full-featured mobile app for banking on the go.'
    },
    {
      icon: <FiLock className="h-8 w-8 text-red-600" />,
      title: 'Privacy First',
      description: 'Your data privacy is our top priority.'
    }
  ];

  const faqs = [
    {
      question: 'How do I open an account?',
      answer: 'You can open an account online in just a few minutes by clicking on the "Open an Account" button and following the simple registration process.'
    },
    {
      question: 'Is my money safe with Hong Kong Bank?',
      answer: 'Yes, we use bank-level security measures including 256-bit SSL encryption and multi-factor authentication to protect your funds and personal information.'
    },
    {
      question: 'What documents do I need to open an account?',
      answer: 'You\'ll need a valid government-issued ID (passport or HK ID card) and proof of address. Additional documents might be required based on your country of residence.'
    },
    {
      question: 'How long does account verification take?',
      answer: 'Most accounts are verified within 24-48 hours. We\'ll notify you via email once your account is ready to use.'
    }
  ];

  const securityFeatures = [
    '256-bit SSL encryption',
    'Biometric authentication',
    '24/7 fraud monitoring',
    'Two-factor authentication',
    'Real-time transaction alerts'
  ];

  const contactInfo = [
    {
      icon: <FiPhone className="h-5 w-5 text-red-500" />,
      label: 'Customer Support',
      value: '+852 1234 5678'
    },
    {
      icon: <FiMail className="h-5 w-5 text-red-500" />,
      label: 'Email',
      value: 'support@hongkongbank.com'
    },
    {
      icon: <FiClock className="h-5 w-5 text-red-500" />,
      label: '24/7 Emergency',
      value: '+852 8765 4321'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Modern Banking for <span className="text-red-200">Hong Kong</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl">
              Experience seamless digital banking with competitive rates, global access, and top-notch security.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/register"
                  className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors duration-200"
                >
                  Open an Account
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors duration-200"
                >
                  Online Banking
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Hong Kong Bank?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re redefining banking with innovative solutions tailored for the modern world.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-200">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of customers who trust us with their banking needs.
          </p>
          <Link
            href="/register"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200"
          >
            Open Your Account Today
          </Link>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Security is Our Priority</h2>
              <p className="text-lg text-gray-600 mb-6">
                We use bank-level encryption and multi-factor authentication to ensure your accounts and transactions are always protected.
              </p>
              <ul className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-green-500">
                      <FiCheck className="h-6 w-6" />
                    </div>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 bg-gray-100 rounded-xl p-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-6">Have questions? Our customer support team is here to help.</p>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="text-red-600">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our services and features.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
