import { AuthButton } from "./AuthButton";
import { AuthState } from "../services/auth";

interface LandingPageProps {
  onStartAuditing: () => void;
  authState: AuthState;
  onAuthChange: (authState: AuthState) => void;
}

export function LandingPage({
  onStartAuditing,
  authState,
  onAuthChange,
}: LandingPageProps) {
  const features = [
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Static Analysis",
      description:
        "Deep code analysis to identify vulnerabilities and security issues",
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "AI-Powered Analysis",
      description:
        "Machine learning insights for comprehensive security assessment",
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: "Detailed Reports",
      description: "Professional audit reports with actionable recommendations",
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: "Secure Registry",
      description:
        "Certified audit registry for permanent security verification",
    },
  ];

  const stats = [
    {
      label: "Canisters Audited",
      value: "2,847",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      label: "Vulnerabilities Found",
      value: "15,293",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Security Issues Fixed",
      value: "12,456",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      label: "Developers Protected",
      value: "1,234",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-700">
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Canispect</h1>
              </div>
            </div>

            <nav className="hidden space-x-8 md:flex">
              <a
                href="#home"
                className="text-white/90 transition-colors hover:text-white"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-white/70 transition-colors hover:text-white"
              >
                Features
              </a>
              <div className="ml-4">
                <AuthButton onAuthChange={onAuthChange} />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="mb-8 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-900/30 px-4 py-2 text-sm font-medium text-purple-300">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Advanced WebAssembly Security Auditing
              </div>

              <h1 className="mb-6 text-5xl font-bold md:text-7xl">
                <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  SECURE YOUR
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  CANISTERS
                </span>
              </h1>

              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-slate-300">
                Canispect provides comprehensive security auditing for
                WebAssembly canisters on the Internet Computer Protocol.
                Identify vulnerabilities, ensure code quality, and build with
                confidence.
              </p>
            </div>

            <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
              {authState.isAuthenticated ? (
                <button
                  onClick={onStartAuditing}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
                >
                  Go to Dashboard
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={onStartAuditing}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
                >
                  Start Auditing
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              )}

              <a
                href="#features"
                className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
              >
                Learn More
              </a>
            </div>

            {/* Live Stats */}
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group rounded-lg border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/10"
                >
                  <div className="mb-2 flex items-center justify-center text-purple-400 transition-colors group-hover:text-purple-300">
                    {stat.icon}
                  </div>
                  <div className="mb-1 text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Comprehensive Security Analysis
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-300">
              Our advanced auditing platform combines multiple analysis
              techniques to provide the most thorough security assessment for
              your WebAssembly canisters.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 transition-transform duration-200 group-hover:scale-110">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-8 backdrop-blur-sm">
            <svg
              className="mx-auto mb-6 h-16 w-16 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Secure Your Canisters?
            </h2>
            <p className="mb-8 text-xl text-slate-300">
              Join hundreds of developers who trust Canispect for their security
              auditing needs.
            </p>
            {authState.isAuthenticated ? (
              <button
                onClick={onStartAuditing}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
              >
                Upload Your First Canister
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={onStartAuditing}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
              >
                Get Started Now
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-slate-400">
            <p>
              Canispect - AI-Powered Canister Security Auditing for Internet
              Computer
            </p>
            <p className="mt-1">Built with ❤️ for the ICP ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
