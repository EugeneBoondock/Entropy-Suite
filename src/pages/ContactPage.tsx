import React, { useState } from "react";
import { default as Navbar } from "../components/Navbar";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('https://formspree.io/f/xdkzybze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      Get in Touch
                    </h1>
                    <p 
                      className="text-[#2F4F4F] text-lg sm:text-xl max-w-2xl"
                      style={{ textShadow: '0px 0px 5px white, 0px 0px 10px white' }}
                    >
                      We'd love to hear from you
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="flex flex-col gap-6">
                    {/* Contact Details */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                      <h2 className="text-[#382f29] text-2xl font-bold mb-6">Contact Information</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#e67722] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-[#382f29] font-semibold">Email</h3>
                            <a 
                              href="mailto:philosncube@gmail.com" 
                              className="text-[#e67722] hover:text-[#d66320] transition-colors duration-200"
                            >
                              philosncube@gmail.com
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#e67722] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-[#382f29] font-semibold">Location</h3>
                            <p className="text-[#5a5a5a]">South Africa</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#e67722] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-[#382f29] font-semibold">Company</h3>
                            <a 
                              href="https://boondocklabs.co.za" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#e67722] hover:text-[#d66320] transition-colors duration-200"
                            >
                              Boondock Labs
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                      <h3 className="text-[#382f29] text-xl font-bold mb-4">Response Time</h3>
                      <p className="text-[#382f29] text-base leading-relaxed mb-4">
                        We typically respond to all inquiries within 24-48 hours. For urgent matters, 
                        please indicate this in your subject line.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#5a5a5a]">
                        <svg className="w-4 h-4 text-[#e67722]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Usually responds within a day
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                    <h2 className="text-[#382f29] text-2xl font-bold mb-6">Send us a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-[#382f29] font-medium mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67722] focus:border-transparent text-[#382f29] placeholder-[#5a5a5a]"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-[#382f29] font-medium mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67722] focus:border-transparent text-[#382f29] placeholder-[#5a5a5a]"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-[#382f29] font-medium mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67722] focus:border-transparent text-[#382f29] placeholder-[#5a5a5a]"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-[#382f29] font-medium mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 bg-white/30 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67722] focus:border-transparent text-[#382f29] placeholder-[#5a5a5a] resize-vertical"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-[#e67722] text-white font-semibold rounded-lg hover:bg-[#d66320] disabled:bg-[#b8a99d] disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                            Send Message
                          </>
                        )}
                      </button>
                    </form>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="font-medium">Message sent successfully!</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">Thank you for your message. We'll get back to you soon.</p>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <span className="font-medium">Failed to send message</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">Please try again or contact us directly at philosncube@gmail.com</p>
                      </div>
                    )}

                    <p className="text-[#5a5a5a] text-sm mt-4 text-center">
                      Your message will be sent directly to our team via Formspree.
                    </p>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-12 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-6">
                  <h2 className="text-[#382f29] text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#382f29] text-lg font-semibold mb-2">How can I suggest a new tool?</h3>
                      <p className="text-[#5a5a5a] text-base leading-relaxed">
                        We love hearing about new tool ideas! Send us an email with your suggestion and we'll consider it for future updates.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[#382f29] text-lg font-semibold mb-2">Is there customer support?</h3>
                      <p className="text-[#5a5a5a] text-base leading-relaxed">
                        Yes! We provide support via email. Reach out to us with any issues or questions and we'll help you out.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[#382f29] text-lg font-semibold mb-2">Can I collaborate or contribute?</h3>
                      <p className="text-[#5a5a5a] text-base leading-relaxed">
                        We're always open to collaboration! If you're interested in contributing to Entropy Suite, please get in touch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 