import React from "react";
import { default as Navbar } from "../components/Navbar";

const PrivacyPolicyPage: React.FC = () => {
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
                      Privacy Policy
                    </h1>
                    <p 
                      className="text-[#2F4F4F] text-lg sm:text-xl max-w-2xl"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 10px white' }}
                    >
                      Your privacy is important to us
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

                  {/* Introduction */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">1. Introduction</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Welcome to Entropy Suite. This Privacy Policy explains how Boondock Labs ("we," "our," or "us") 
                      collects, uses, and protects your information when you use our website and services.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      By using Entropy Suite, you agree to the collection and use of information in accordance with this policy.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">2. Information We Collect</h2>
                    
                    <h3 className="text-[#382f29] text-lg font-semibold mb-3">2.1 Personal Information</h3>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We may collect personally identifiable information, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base mb-6 space-y-2">
                      <li>Email addresses when you contact us</li>
                      <li>Names when provided in contact forms</li>
                      <li>Usage data and analytics</li>
                      <li>Device information and IP addresses</li>
                    </ul>

                    <h3 className="text-[#382f29] text-lg font-semibold mb-3">2.2 Usage Data</h3>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      We automatically collect certain information when you visit our service, including your IP address, 
                      browser type, operating system, referring URLs, and pages visited.
                    </p>
                  </section>

                  {/* How We Use Information */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We use the collected information for various purposes:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>To provide and maintain our services</li>
                      <li>To notify you about changes to our services</li>
                      <li>To provide customer support</li>
                      <li>To gather analysis or valuable information to improve our services</li>
                      <li>To monitor usage of our services</li>
                      <li>To detect, prevent, and address technical issues</li>
                    </ul>
                  </section>

                  {/* AI Services */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">4. AI Services and Data Processing</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Entropy Suite uses various AI services to provide our tools and features. When you use our AI-powered tools:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base mb-4 space-y-2">
                      <li>Your input data may be processed by third-party AI services</li>
                      <li>We do not store your personal content permanently unless explicitly stated</li>
                      <li>AI processing is done in accordance with our service providers' privacy policies</li>
                      <li>We strive to use AI services that prioritize user privacy and data protection</li>
                    </ul>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      We recommend not inputting sensitive personal information into our AI tools.
                    </p>
                  </section>

                  {/* Data Security */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">5. Data Security</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      The security of your data is important to us. We implement appropriate security measures to protect 
                      your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      However, remember that no method of transmission over the Internet or electronic storage is 100% secure. 
                      While we strive to use commercially acceptable means to protect your personal information, we cannot 
                      guarantee its absolute security.
                    </p>
                  </section>

                  {/* Third-Party Services */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">6. Third-Party Services</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      Our service may contain links to other sites or use third-party services. If you click on a third-party 
                      link or use a third-party service, you will be directed to that site or service.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      We strongly advise you to review the Privacy Policy of every site you visit or service you use. 
                      We have no control over and assume no responsibility for the content, privacy policies, or practices 
                      of any third-party sites or services.
                    </p>
                  </section>

                  {/* Cookies */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We use cookies and similar tracking technologies to track activity on our service and store certain information. 
                      You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      However, if you do not accept cookies, you may not be able to use some portions of our service.
                    </p>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">8. Your Privacy Rights</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      You have certain rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside text-[#382f29] text-base space-y-2">
                      <li>The right to access your personal information</li>
                      <li>The right to update or correct your personal information</li>
                      <li>The right to delete your personal information</li>
                      <li>The right to restrict processing of your personal information</li>
                      <li>The right to data portability</li>
                    </ul>
                  </section>

                  {/* Changes to Policy */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">9. Changes to This Privacy Policy</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
                      new Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                    <p className="text-[#382f29] text-base leading-relaxed">
                      You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy 
                      are effective when they are posted on this page.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-[#382f29] text-2xl font-bold mb-4">10. Contact Us</h2>
                    <p className="text-[#382f29] text-base leading-relaxed mb-4">
                      If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicyPage; 