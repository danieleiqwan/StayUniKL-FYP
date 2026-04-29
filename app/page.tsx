'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { scroller, animateScroll } from 'react-scroll';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Users,
  Globe,
  ChevronRight,
  Sparkles,
  Search,
  MapPin,
  CalendarDays,
  Menu,
  X,
  Dumbbell,
  WashingMachine,
  History,
  Home,
  HelpCircle,
  BookOpen,
  Phone,
  ChevronDown,
  LayoutDashboard,
  Bell,
  Clock,
  Wrench,
  FileText,
  BedDouble
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleNavScroll = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (target === 'home') {
      animateScroll.scrollToTop({
        duration: 800,
        delay: 0,
        smooth: 'easeInOutCubic'
      });
    } else {
      scroller.scrollTo(target, {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutCubic',
        offset: -80, // Adjusts for sticky navbar
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div id="home" className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-[#F26C22] selection:text-white transition-colors duration-300">

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 border-b ${isScrolled
        ? 'py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-sm'
        : 'py-6 bg-transparent border-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#home" onClick={handleNavScroll('home')} className="flex items-center gap-2 group cursor-pointer">
            <span className={`text-xl font-black tracking-tighter ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'} transition-colors`}>
              Stay<span className="text-[#F26C22]">UniKL</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {['Home', 'Features', 'Facilities', 'Support'].map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '#home' : `#${item.toLowerCase()}`}
                onClick={handleNavScroll(item.toLowerCase())}
                className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#F26C22] dark:hover:text-[#F26C22] transition-colors uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              className={`hidden sm:flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isScrolled
                ? 'bg-slate-900 dark:bg-[#F26C22] text-white hover:bg-[#F26C22] dark:hover:bg-orange-600 shadow-xl shadow-slate-200 dark:shadow-orange-500/10'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#F26C22] dark:hover:bg-[#F26C22] dark:hover:text-white'
                }`}
            >
              {isAuthenticated ? (user?.role === 'admin' ? 'Continue as Admin' : 'Continue as Student') : 'Sign In'} <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              className="md:hidden p-2 text-slate-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col p-6 gap-6">
            {['Home', 'Features', 'Facilities', 'Support'].map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '#home' : `#${item.toLowerCase()}`}
                onClick={handleNavScroll(item.toLowerCase())}
                className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
            <Link
              href={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#F26C22] text-white rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              {isAuthenticated ? (user?.role === 'admin' ? 'Continue as Admin' : 'Continue as Student') : 'Sign In'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#fafafa] dark:bg-[#080715]">
        {/* Background Gradients & Halftone Pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000000'/%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
        }}></div>
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[120px] -mr-[300px] -mt-[300px] transition-colors"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-[#141235]/10 dark:bg-[#141235]/20 rounded-full blur-[100px] -ml-[200px] -mb-[200px] transition-colors"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 items-center gap-16">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 text-[#F26C22] text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Sparkles className="h-4 w-4" /> The New Standard of Student Living
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                Live Your Best <br />
                <span className="text-[#F26C22] bg-clip-text">Student Life.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                StayUniKL provides modern, secure, and vibrant housing solutions designed specifically for UniKL MIIT students. Experience convenience like never before.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 relative z-20">
                <Link
                  href={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#F26C22] via-[#ff8833] to-[#F26C22] hover:bg-gradient-to-l bg-[length:200%_auto] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(242,108,34,0.3)] hover:scale-105 transition-all active:scale-95 text-center"
                >
                  {isAuthenticated ? `Go to ${user?.role === 'admin' ? 'Admin ' : ''}Dashboard` : 'Register Now'}
                </Link>
                <a
                  href="#features"
                  onClick={handleNavScroll('features')}
                  className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-300">
              {/* Main Card Container - Removed overflow-hidden to allow stats to float outside */}
              <div className="relative z-10 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-3xl p-4 rounded-[3rem] shadow-[0_30px_60px_rgba(20,18,53,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-center min-h-[600px]">
                
                {/* Mascot Wrapper with its own overflow control if needed */}
                <div className="relative flex items-center justify-center w-full h-full overflow-visible">
                  <img
                    src="/mascot.png"
                    alt="UniKL Mascot"
                    className="w-[140%] h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)] filter contrast-[1.05] brightness-105 hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Floating Stats - Now outside the overflow-hidden area */}
                <div className="absolute -left-10 top-20 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 z-20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">1,200+</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Available Rooms</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-6 bottom-24 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 z-20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-[#F26C22]">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">30min</p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To Campus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white dark:bg-slate-950 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-6 mb-20">
            <h2 className="text-xs font-black text-[#F26C22] uppercase tracking-[0.4em] mb-4">Core Features</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">Everything you need for a <br /> seamless university stay.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Online Application",
                description: "Complete your application in minutes from anywhere. No more physical forms or long queues.",
                icon: <FileText className="h-5 w-5" />,
              },
              {
                title: "Real-time Availability",
                description: "Check room availability instantly and choose your preferred accommodation type.",
                icon: <BedDouble className="h-5 w-5" />,
              },
              {
                title: "Instant Updates",
                description: "Track your application status and receive immediate notifications upon approval.",
                icon: <Zap className="h-5 w-5" />,
              },
              {
                title: "Secure & Safe",
                description: "Integrated security features ensuring your data and stay are always protected.",
                icon: <Shield className="h-5 w-5" />,
              },
              {
                title: "Community Driven",
                description: "Connect with roommates and join a vibrant student community at UniKL.",
                icon: <Users className="h-5 w-5" />,
              },
              {
                title: "Digital Access",
                description: "Manage everything from your phone. Check-in, reports, and payments.",
                icon: <Globe className="h-5 w-5" />,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-left hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-[#F26C22] mb-8 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                  {feature.title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-1">
                  {feature.description}
                </p>

                <div className="text-slate-300 dark:text-slate-700 group-hover:text-[#F26C22] transition-colors duration-500">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-32 overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600" className="rounded-3xl h-64 w-full object-cover shadow-2xl" alt="Gym" />
                  <img src="https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&q=80&w=600" className="rounded-3xl h-80 w-full object-cover shadow-2xl" alt="Study" />
                </div>
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" className="rounded-3xl h-80 w-full object-cover shadow-2xl" alt="Laundry" />
                  <img src="https://images.unsplash.com/photo-1544105422-76233f392c10?auto=format&fit=crop&q=80&w=600" className="rounded-3xl h-64 w-full object-cover shadow-2xl" alt="Court" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-[#F26C22] rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-xs font-black text-[#F26C22] uppercase tracking-[0.3em]">Modern Amenities</h2>
                <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Facilities that empower your growth.</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium pt-2">
                  We don't just provide rooms; we provide an ecosystem for success. Enjoy premium facilities open 24/7.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { icon: <Dumbbell className="h-6 w-6" />, title: "Premium Gym", desc: "Equipped with modern weights and cardio machines." },
                  { icon: <WashingMachine className="h-6 w-6" />, title: "Digital Laundry", desc: "Pay and monitor cycles via your mobile app." },
                  { icon: <History className="h-6 w-6" />, title: "Multi-purpose Courts", desc: "Dedicated spaces for badminton and basketball." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#F26C22] group-hover:bg-[#F26C22] group-hover:text-white transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & FAQ Section */}
      <section id="support" className="py-32 bg-slate-50 dark:bg-slate-900/50 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-[#F26C22] uppercase tracking-[0.3em]">Support & FAQ</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need to know.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* FAQs */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-[#F26C22]">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Common Questions</h3>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 dark:text-white hover:text-[#F26C22] dark:hover:text-[#F26C22] transition-colors"
                    >
                      <span className="text-sm md:text-base">{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[#F26C22]' : 'text-slate-400'}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Guide & Contact */}
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quick Guide</h3>
                </div>

                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                  {[
                    { t: "Register", d: "Create an account using your UniKL student ID." },
                    { t: "Apply", d: "Fill in the room application form with your preferences." },
                    { t: "Book", d: "Confirm your selection once approved by management." }
                  ].map((step, i) => (
                    <div key={i} className="relative pl-10 group">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 group-hover:border-[#F26C22] transition-colors z-10"></div>
                      <h4 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight">{step.t}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26C22] opacity-[0.03] rounded-bl-full transition-transform group-hover:scale-150"></div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-[#F26C22]">
                    <Phone className="h-4 w-4" />
                  </div>
                  Need Help?
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Email our support team at:</p>
                  <a href="mailto:support@stayunikl.edu.my" className="text-lg font-black text-[#F26C22] hover:underline decoration-2 underline-offset-4">
                    support@stayunikl.edu.my
                  </a>
                </div>
                <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest italic opacity-60">
                  Developed for academic purposes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black py-20 text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 border-b border-white/5 pb-20">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter">StayUniKL</span>
              </div>
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                Empowering the UniKL student experience through innovative housing solutions and digital management.
              </p>
            </div>

            <div className="space-y-6">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Navigation</h5>
              <div className="grid gap-4">
                {['Home', 'Features', 'Facilities', 'Support', isAuthenticated ? 'Dashboard' : 'Login'].map(link => (
                  <Link
                    key={link}
                    href={link === 'Login' ? '/login' : link === 'Dashboard' ? (user?.role === 'admin' ? '/admin' : '/dashboard') : link === 'Home' ? '#home' : `#${link.toLowerCase()}`}
                    onClick={(link === 'Login' || link === 'Dashboard') ? undefined : handleNavScroll(link.toLowerCase())}
                    className="text-slate-300 hover:text-[#F26C22] font-bold text-sm transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Contact Info</h5>
              <div className="grid gap-4 text-slate-300 font-bold text-sm">
                <p>UniKL MIIT Office, KL</p>
                <p>support@stayunikl.my</p>
                <p>+60 3-1234 5678</p>
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2024 StayUniKL. All rights reserved.</p>
            <div className="flex gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
