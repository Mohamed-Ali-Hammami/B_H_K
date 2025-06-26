'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: 'Proposez-vous des sous-comptes ?',
    answer: 'Non, notre banque en ligne ne propose pas actuellement de sous-comptes. Ascensez facilement vos finances grâce à nos outils de suivi des dépenses et de catégorisation des transactions disponibles dans votre espace client.',
  },
  {
    question: 'Quels sont les frais de gestion de compte ?',
    answer: 'Aucun frais de gestion n’est appliqué. Votre compte reste entièrement gratuit, sans conditions de revenus minimums ou de solde à maintenir.',
  },
  {
    question: 'Les frais de dépôt en cryptomonnaies sont-ils remboursés lors du premier dépôt ?',
    answer: 'Oui, nous remboursons intégralement les frais de dépôt en cryptomonnaies lors de votre premier versement. Cette offre est valable une fois par client.',
  },
  {
    question: 'Quels sont les frais pour un virement local à Hong Kong ?',
    answer: 'Les virements entre comptes à Hong Kong sont gratuits, que ce soit entre clients de notre banque ou vers d’autres établissements locaux.',
  },
  {
    question: 'Quels sont les frais pour un virement international ?',
    answer: 'Un frais de 1,5% (avec un minimum de 50 HKD) est appliqué sur les virements envoyés à l’étranger.',
  },
  {
    question: 'Quels sont les frais pour les retraits ?',
    answer: 'Retrait à Hong Kong : 1% (applicable aux retraits en espèces via nos partenaires bancaires). Retrait à l’étranger : 1,5% (en plus des éventuels frais imposés par le distributeur local). Nous vous conseillons d’utiliser les paiements sans contact ou par virement pour éviter ces frais.',
  },
  {
    question: 'Y a-t-il une limite de dépôt sur mon compte ?',
    answer: 'Non, vous pouvez déposer autant de fonds que vous le souhaitez, sans plafond imposé. Des vérifications supplémentaires peuvent être requises pour les très gros montants.',
  },
  {
    question: 'Quelles sont les limites de retrait ?',
    answer: 'Limites : 200 000 HKD par semaine, 500 000 HKD par mois. Ces limites peuvent être ajustées sur demande pour les clients Premium.',
  },
  {
    question: 'Quelles sont les limites de virement ?',
    answer: 'Par défaut : 800 000 HKD par semaine, 2 000 000 HKD par mois. Les membres Premium bénéficient de limites illimitées sur les virements.',
  },
  {
    question: 'Comment fonctionne votre service client ?',
    answer: 'Notre équipe dédiée est disponible en plusieurs langues (anglais, mandarin, cantonais, français, espagnol, etc.) par chat en ligne, email ou téléphone.',
  },
  {
    question: 'Comment devenir membre Premium ?',
    answer: 'Le statut Premium est accessible sur invitation ou sous conditions de revenus/dépôts minimums. Contactez-nous pour connaître les critères d’éligibilité.',
  },
  {
    question: 'Quelles cryptomonnaies acceptez-vous ?',
    answer: 'Nous supportons les principales cryptodevises (Bitcoin, Ethereum, etc.). La liste complète est disponible dans votre espace client.',
  },
  {
    question: 'Comment sécurisez-vous mon compte ?',
    answer: 'Nous utilisons une authentification à double facteur (2FA), des alertes en temps réel et un chiffrement bancaire de niveau militaire.',
  },
  {
    question: 'Puis-je ouvrir un compte depuis l’étranger ?',
    answer: 'Oui, sous réserve de fournir les documents d’identité requis lors de l’inscription (Passeport ou ID).',
  },
  {
    question: 'Combien de temps prend un virement international ?',
    answer: 'En général 1 à 3 jours ouvrés, selon le pays et la banque destinataire.',
  },
];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-red-50">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white shadow-md py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            FAQ – NEAT 🇭🇰
          </h1>
          <p className="mt-4 text-lg text-gray-600 text-center">
            Bienvenue dans la FAQ de votre banque en ligne basée à Hong Kong. Nous nous engageons à vous offrir des services bancaires modernes, transparents et accessibles à tous.
          </p>
        </div>
      </motion.header>

      {/* FAQ Section */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-4 border-b border-gray-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left py-4 flex justify-between items-center focus:outline-none group"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                  {index + 1}. {faq.question}
                </span>
                <span className="text-red-600 text-xl">
                  {openIndex === index ? '-' : '+'}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 py-4">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer Section */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white py-6 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Votre satisfaction est notre priorité.{' '}
            <a
              href="/contact"
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
            >
              Contactez-nous
            </a>{' '}
            pour toute demande supplémentaire.
          </p>
          <p className="mt-2 text-gray-900 font-bold">— L’équipe NEAT HK</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default FAQPage;