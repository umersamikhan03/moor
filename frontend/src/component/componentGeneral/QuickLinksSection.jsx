import React from "react";
import { Link } from "react-router-dom";
import { Package, RefreshCw, MapPin } from "lucide-react";

const QuickLinksSection = () => {
  const quickLinks = [
    {
      id: 1,
      title: "Track your Order",
      subtitle: "ORDER TRACKING",
      description: "Monitor your package in real-time",
      icon: Package,
      link: "/track-order",
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      title: "Exchange and Return",
      subtitle: "EXCHANGES & RETURNS",
      description: "Hassle-free return policy",
      icon: RefreshCw,
      link: "/public-content/return-refund-policy",
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      title: "Contact Us",
      subtitle: "GET IN TOUCH",
      description: "We're here to help you",
      icon: MapPin,
      link: "/contact-us",
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {quickLinks.map((item) => {
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.link}
                className="group block"
              >
                <div className={`relative overflow-hidden bg-gradient-to-br ${item.color} p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                    <div className="w-full h-full rounded-full bg-white/30" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 ${item.iconColor}`}>
                      <IconComponent size={24} strokeWidth={1.5} />
                    </div>
                    
                    {/* Text */}
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs tracking-widest text-gray-500 uppercase mb-2">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                    
                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      <span className="tracking-wider">Learn More</span>
                      <svg 
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection;
