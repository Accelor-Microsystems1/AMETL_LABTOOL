import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/authentication/authContext";
import labLogo from "../assets/labtool.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen  flex items-center justify-center p-4">
      {/* Form */}
      <div className="relative z-10 max-w-md w-full rounded-xl shadow-lg overflow-hidden border border-gray-700 bg-gray-900 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-center mb-8">
            <img
              src={labLogo}
              alt="Lab Tool Logo"
              className="h-12 mx-auto mb-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/120x48?text=Lab+Tool";
              }}
            />
            <h2 className="text-2xl font-bold text-gray-200">
              Lab Management System
            </h2>
            <p className="text-gray-400 mt-1">Sign in to access your account</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                Email Address<span className="text-gray-200"> *</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border  text-white border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-gray-700 focus:border-gray-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Password <span className="text-gray-200">*</span>
              </label>

              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 pr-10 border text-white border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-gray-700 focus:border-gray-500 sm:text-sm"
                  placeholder="Enter your password"
                />

                
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                   
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.02.153-2.005.438-2.93M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                   
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18M10.585 10.585A2 2 0 0012 14a2 2 0 001.414-.586M9.88 9.88A3 3 0 0115 12m7 0c-1.5 3.5-5.5 7-10 7a9.77 9.77 0 01-4.318-.98M2 12c1.5-3.5 5.5-7 10-7a9.77 9.77 0 014.318.98"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white
    bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
  `}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Contact Administrator
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border-t border-gray-600 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Lab Tool. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
