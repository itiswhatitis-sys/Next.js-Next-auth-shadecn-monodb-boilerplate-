'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleLogin = () => {
    if (!selectedRole) return;
    router.push(`/${selectedRole.toLowerCase()}/login`);
  };

  const roles = ['Supplier', 'Logistic', 'Owner'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 flex-grow flex items-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-gray-950 dark:to-black"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-100/50 to-transparent dark:from-gray-800/20 dark:to-transparent transform rotate-12 translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-purple-100/50 to-transparent dark:from-gray-900/20 dark:to-transparent transform -rotate-12 -translate-x-1/4 translate-y-1/4"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        {/* Diagonal Lines */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-gray-600 transform rotate-12"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent dark:via-gray-700 transform -rotate-12"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-black/50 text-black dark:text-white text-sm font-medium border border-gray-200 dark:border-gray-800">
                <span className="w-2 h-2 bg-black dark:bg-white rounded-full mr-2 animate-pulse"></span>
                Revolutionizing Talent Acquisition
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-950 via-gray-800 to-stone-950 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
                Streamline Your
                <br />
                <span className="bg-gradient-to-r from-stone-950 to-gray-900 dark:from-white dark:to-white bg-clip-text text-transparent">
                  Talent Recruitment
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-white max-w-2xl mx-auto leading-relaxed">
                Connect SMEs with recruitment crews to find the best talent efficiently and effectively. 
                <br className="hidden sm:block" />
                Transform your hiring process with intelligent matching and streamlined workflows.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between"
                  >
                    {selectedRole || 'Select Role'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => setSelectedRole(role)}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="lg"
                onClick={handleLogin}
                disabled={!selectedRole}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-blue-700 dark:hover:bg-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-gray-900/30 dark:to-black/30"></div>
        <div className="relative py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-black dark:text-white">
                  INTERAIN
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                  Revolutionizing talent acquisition by connecting SMEs with expert recruitment crews. 
                  Transform your hiring process with intelligent matching and streamlined workflows.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <span className="text-blue-600 dark:text-white text-sm font-semibold">L</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <span className="text-blue-600 dark:text-white text-sm font-semibold">T</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <span className="text-blue-600 dark:text-white text-sm font-semibold">G</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Platform</h4>
                <div className="space-y-2">
                  <a href="/login" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Login
                  </a>
                  <a href="/signup" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Sign Up
                  </a>
                  <a href="/crew" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Crew Portal
                  </a>
                  <a href="/dashboard" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Dashboard
                  </a>
                </div>
              </div>
              
              {/* Support */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Support</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Help Center
                  </a>
                  <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Contact Us
                  </a>
                  <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} INTERAIN. All rights reserved.
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>Made with ❤️ by ByteMe</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
