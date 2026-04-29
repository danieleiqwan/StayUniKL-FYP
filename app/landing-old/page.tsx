'use client';

import Link from "next/link";
import {
  FileText, BedDouble, Zap, Shield, Users, Globe, Target,
  Code2, HelpCircle, BookOpen, Phone, ChevronDown
} from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function OldLandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I book a room?",
      a: "To book a room, log in to your account, navigate to the Dashboard, and click on 'New Application'. Fill in your details and select your preferred hostel."
    },
    {
      q: "How can I check my booking status?",
      a: "You can track your application status in real-time through the 'Notifications' tab or directly on your Dashboard under 'My Applications'."
    },
    {
      q: "What should I do if my application is rejected?",
      a: "If your application is rejected, check the comments provided by the admin. You may need to update your documents or select a different session/hostel and reapply."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32">
        <div className="absolute inset-0 h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200"
            alt="UniKL Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-[1px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center z-10 relative">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl text-shadow-sm">
              Modern Hostel Management for <span className="text-indigo-600 dark:text-indigo-400">UniKL MIIT</span>
            </h1>
            <p className="mb-10 text-lg text-slate-700 dark:text-slate-200 md:text-xl font-medium drop-shadow-md">
              Skip the queues and paperwork. Apply for your hostel room online, track status in real-time, and manage your stay with ease.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              {isAuthenticated ? (
                <Link
                  href={user?.role === 'admin' ? "/admin" : "/dashboard"}
                  className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-slate-900"
                >
                  Go to {user?.role === 'admin' ? 'Admin ' : ''}Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-slate-900"
                >
                  Apply Now
                </Link>
              )}
              <Link
                href="#features"
                className="rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 relative py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-[#F26C22] text-sm font-semibold mb-4 dark:bg-orange-900/20">
              Why Choose StayUniKL?
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              Streamlining Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F26C22] to-orange-600">Accommodation</span> Experience
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We've digitized the entire process so you can focus on your studies while we handle your comfort.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Easy Online Application",
                description: "Complete your application in minutes from anywhere. No more physical forms or long queues.",
                icon: <FileText className="h-8 w-8 text-white" />,
                color: "bg-blue-500",
              },
              {
                title: "Real-time Availability",
                description: "Check room availability instantly and choose your preferred accommodation type.",
                icon: <BedDouble className="h-8 w-8 text-white" />,
                color: "bg-indigo-500",
              },
              {
                title: "Instant Updates",
                description: "Track your application status and receive immediate notifications upon approval.",
                icon: <Zap className="h-8 w-8 text-white" />,
                color: "bg-orange-500",
              },
              {
                title: "Secure & Safe",
                description: "Integrated security features ensuring your data and stay are always protected.",
                icon: <Shield className="h-8 w-8 text-white" />,
                color: "bg-emerald-500",
              },
              {
                title: "Community Driven",
                description: "Connect with roommates and join a vibrant student community at UniKL.",
                icon: <Users className="h-8 w-8 text-white" />,
                color: "bg-violet-500",
              },
              {
                title: "Digital Access",
                description: "Manage everything from your phone. Check-in, reports, and payments.",
                icon: <Globe className="h-8 w-8 text-white" />,
                color: "bg-pink-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
                <div className={`inline-flex items-center justify-center p-3 rounded-xl ${feature.color} shadow-lg shadow-${feature.color}/20 mb-6 transition-transform group-hover:scale-110 duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#F26C22] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-24 py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mb-4 dark:bg-indigo-900/30 dark:text-indigo-400">
                About StayUniKL
              </span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Modernizing how you <span className="text-[#F26C22]">Live and Study</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                StayUniKL is an innovative digital accommodation system designed for UniKL MIIT students.
                We eliminate traditional paperwork, bringing efficiency and transparency to campus hostel management.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-[#F26C22]">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Our Objective</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">To provide a seamless, paperless application experience for all students.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Target Users</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Specifically tailored for the needs of UniKL MIIT campus residents.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-500" />
                Technology Stack
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Frontend</p>
                  <p className="font-semibold text-slate-900 dark:text-white">React.js</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Backend</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Node.js</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Styling</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Tailwind CSS</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Database</p>
                  <p className="font-semibold text-slate-900 dark:text-white">MySQL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="scroll-mt-24 py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Support & FAQ</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Everything you need to know about managing your stay at StayUniKL.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <HelpCircle className="h-7 w-7 text-[#F26C22]" />
                FAQs
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left font-semibold hover:text-[#F26C22] transition-colors"
                    >
                      {faq.q}
                      <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-6">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <BookOpen className="h-7 w-7 text-indigo-500" />
                Quick Guide
              </h3>
              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100 dark:before:bg-indigo-900/30">
                {[
                  { t: "Register", d: "Create an account using your UniKL student ID." },
                  { t: "Apply", d: "Fill in the room application form with your preferences." },
                  { t: "Book", d: "Confirm your selection once approved by management." }
                ].map((step, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-0 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-sm z-10"></div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{step.t}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{step.d}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#F26C22]" />
                  Contact Support
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Email: support.stayunikl@unikl.edu.my</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">Developed for academic purposes (Final Year Project).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} StayUniKL. All rights reserved.</p>
      </footer>
    </div>
  );
}
