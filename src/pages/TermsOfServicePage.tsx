import React from "react";
import { default as Navbar } from "../components/Navbar";

const TermsOfServicePage: React.FC = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for text readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      
      <div className="layout-container flex h-full grow flex-col relative z-10">
        <Navbar />
        {/* Spacer for fixed navbar */}
        <div className="h-16 sm:h-20"></div>
        <div className="px-2 sm:px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-2 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="p-2 sm:p-4">
                {/* Hero Section */}
                <div className="relative flex min-h-[200px] flex-col gap-4 sm:gap-6 rounded-xl items-center justify-center p-4 sm:p-8 overflow-hidden mb-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 rounded-xl"></div>
                  <div className="relative z-10 flex flex-col gap-4 items-center justify-center text-center">
                    <h1
                      className="text-[#2F4F4F] text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-[-0.02em]"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 5px white' }}
                    >
                      Terms of Service
                    </h1>
                    <p 
                      className="text-[#2F4F4F] text-lg sm:text-xl max-w-2xl"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 10px white' }}
                    >
                      Please read these terms carefully
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6 space-y-8">
                  <div className="text-center mb-8">
                    <p className="text-[#5a5a5a] text-sm">
                      Last updated: January 2025
                    </p>
                  </div>

                  {/* Acceptance of Terms */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      By accessing and using Entropy Suite ("the Service"), operated by Boondock Labs ("we," "our," or "us"), 
                      you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  {/* Description of Service */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">2. Description of Service</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Entropy Suite is a collection of AI-powered tools and utilities designed to enhance productivity and creativity. 
                      Our services include but are not limited to:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>Text summarization and processing tools</li>
                      <li>Document conversion and manipulation tools</li>
                      <li>AI-powered chatbot and assistance features</li>
                      <li>Image processing and background removal tools</li>
                      <li>Productivity planning and organization tools</li>
                      <li>Development environment and terminal access</li>
                    </ul>
                  </section>

                  {/* User Responsibilities */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">3. User Responsibilities</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      As a user of our service, you agree to:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>Use the service only for lawful purposes</li>
                      <li>Not violate any applicable local, state, national, or international laws</li>
                      <li>Not transmit any material that is unlawful, harassing, libelous, or invasive of another's privacy</li>
                      <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
                      <li>Not use the service to distribute spam, malware, or other harmful content</li>
                      <li>Respect intellectual property rights of others</li>
                    </ul>
                  </section>

                  {/* AI Usage Guidelines */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">4. AI Services Usage Guidelines</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      When using our AI-powered tools, you agree to:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base mb-4 space-y-2">
                      <li>Not input illegal, harmful, or malicious content</li>
                      <li>Not attempt to generate content that violates intellectual property rights</li>
                      <li>Not use AI tools to create misleading or deceptive content</li>
                      <li>Understand that AI-generated content may not always be accurate</li>
                      <li>Take responsibility for reviewing and validating AI-generated outputs</li>
                    </ul>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      We reserve the right to monitor usage and terminate access for violations of these guidelines.
                    </p>
                  </section>

                  {/* Intellectual Property */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">5. Intellectual Property</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      The Service and its original content, features, and functionality are and will remain the exclusive property 
                      of Boondock Labs and its licensors. The service is protected by copyright, trademark, and other laws.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      You retain ownership of any content you input into our services, but you grant us a limited license to 
                      process this content for the purpose of providing our services.
                    </p>
                  </section>

                  {/* Privacy and Data */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">6. Privacy and Data Protection</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                      to understand our practices.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      We implement appropriate security measures to protect your data, but cannot guarantee absolute security. 
                      You acknowledge that you use our services at your own risk.
                    </p>
                  </section>

                  {/* Service Availability */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">7. Service Availability</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We strive to maintain the highest uptime possible, but we do not guarantee that our service will be 
                      available at all times. The service may be temporarily unavailable due to:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>Scheduled maintenance</li>
                      <li>Technical issues beyond our control</li>
                      <li>Third-party service dependencies</li>
                      <li>Force majeure events</li>
                    </ul>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">8. Limitation of Liability</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      To the fullest extent permitted by applicable law, Boondock Labs shall not be liable for any indirect, 
                      incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      Our total liability to you for any damages shall not exceed the amount you have paid us for the service 
                      in the 12 months preceding the claim.
                    </p>
                  </section>

                  {/* Disclaimer */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">9. Disclaimer</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, 
                      this Company:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>Excludes all representations and warranties relating to this service and its contents</li>
                      <li>Excludes all liability for damages arising out of or in connection with your use of this service</li>
                      <li>Does not guarantee the accuracy or completeness of AI-generated content</li>
                    </ul>
                  </section>

                  {/* Termination */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">10. Termination</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We may terminate or suspend your access to our service immediately, without prior notice or liability, 
                      for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      Upon termination, your right to use the service will cease immediately.
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">11. Changes to Terms</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                      If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      What constitutes a material change will be determined at our sole discretion. Your continued use of 
                      the service after any such changes constitutes your acceptance of the new Terms.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">12. Governing Law</h2>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      These Terms shall be interpreted and governed by the laws of South Africa, without regard to its 
                      conflict of law provisions. Our failure to enforce any right or provision of these Terms will not 
                      be considered a waiver of those rights.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">13. Contact Information</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                      <p className="text-[#382f29] text-base mb-2">
                        <strong>Email:</strong> <a href="mailto:philosncube@gmail.com" className="text-[#e67722] hover:text-[#d66320] transition-colors duration-200">philosncube@gmail.com</a>
                      </p>
                      <p className="text-[#382f29] text-base mb-2">
                        <strong>Company:</strong> Boondock Labs
                      </p>
                      <p className="text-[#382f29] text-base">
                        <strong>Website:</strong> <a href="https://boondocklabs.co.za" target="_blank" rel="noopener noreferrer" className="text-[#e67722] hover:text-[#d66320] transition-colors duration-200">boondocklabs.co.za</a>
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 