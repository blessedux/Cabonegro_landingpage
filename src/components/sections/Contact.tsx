'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Linkedin, Twitter, Globe, Send, Users, DollarSign, Handshake } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    interest: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
      interest: 'general'
    })
    setIsSubmitting(false)
    
    // Show success message (you can implement a toast notification here)
    alert('Thank you for your message! We will get back to you soon.')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="pt-20 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Ready to be part of Chile's hydrogen revolution? Contact us to learn more about 
              investment opportunities and joint venture partnerships at Cabo Negro.
            </p>
          </div>
          <div className="mt-6 flex justify-start px-6">
            <Button asChild className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4">
              <a href="mailto:pyaconi@ylmv.cl">Mail us</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium mb-2">
                      Area of Interest
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="investment">Investment Opportunity</option>
                      <option value="joint-venture">Joint Venture Partnership</option>
                      <option value="technical">Technical Specifications</option>
                      <option value="media">Media & Press</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 transition-colors resize-none"
                      placeholder="Tell us about your interest in Cabo Negro..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Socials */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-1 text-blue-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-400 text-sm">info@cabonegro.cl</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 mt-1 text-green-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-400 text-sm">+56 61 2 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 text-red-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400 text-sm">Punta Arenas, Magallanes Region<br />Chile</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <span>Twitter</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <Globe className="w-5 h-5 text-green-400" />
                    <span>Website</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Joint Venture CTA */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-2xl p-12 border border-white/10 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-full">
                  <Handshake className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join the Joint Venture
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
                Be part of Chile's most ambitious industrial and maritime project. 
                We're seeking strategic partners to bring Cabo Negro Terminal to Ready-to-Build stage 
                and capitalize on the massive hydrogen economy opportunity.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Investment Opportunity</h3>
                  <p className="text-gray-400 text-sm">
                    USD 2-5M initial capital for engineering and studies
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Strategic Partnership</h3>
                  <p className="text-gray-400 text-sm">
                    Join J&P, PPG, and Compas Marine in this venture
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Global Impact</h3>
                  <p className="text-gray-400 text-sm">
                    Gateway to Antarctica and alternative to Panama Canal
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-4">
                  <Handshake className="w-5 h-5 mr-2" />
                  Request Joint Venture Details
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-4">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Download Investment Deck
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
